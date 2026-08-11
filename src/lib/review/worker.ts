import "server-only";
import { runReviewPipeline } from "@/lib/agents/pipeline";
import {
  getReviewJob,
  markReviewRunCompleted,
  markReviewRunFailed,
  markReviewRunProgress,
  markReviewRunRunning,
  recordReviewStageUsage,
  saveReviewStageCheckpoint,
  withReviewRunLock,
} from "@/lib/billing/repository";

const activeJobs = new Map<string, Promise<void>>();
const MAX_CONCURRENT_JOBS = 2;
let runningJobs = 0;
const waitingJobs: Array<() => void> = [];

async function acquireWorkerSlot() {
  if (runningJobs >= MAX_CONCURRENT_JOBS) {
    await new Promise<void>((resolve) => waitingJobs.push(resolve));
  }
  runningJobs += 1;
}

function releaseWorkerSlot() {
  runningJobs -= 1;
  waitingJobs.shift()?.();
}

function failureDetail(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 2000);
}

async function failJob(runId: string, code: string, detail: string) {
  try {
    await markReviewRunFailed(runId, code, new Date(), detail);
  } catch (error) {
    console.error(`[review-worker] could not persist failure run=${runId}`, error);
  }
}

async function executeReviewJob(runId: string) {
  await acquireWorkerSlot();
  try {
    const acquired = await withReviewRunLock(runId, async () => {
      const job = await getReviewJob(runId);
      if (!job || job.status === "completed" || job.status === "failed") return;
      if (!job.manuscript?.title?.trim() || !job.manuscript.body?.trim()) {
        await failJob(runId, "input_missing", "The stored manuscript input is missing.");
        return;
      }

      await markReviewRunRunning(runId);
      console.info(
        `[review-worker] starting run=${runId} bodyChars=${job.manuscript.body.length}`,
      );

      const pipeline = await runReviewPipeline(
        job.manuscript,
        undefined,
        async (stage) => markReviewRunProgress(runId, stage),
        {
          checkpoints: job.stageCheckpoints,
          usage: job.stageUsage,
          onCheckpoint: async (stage, output, metadata) => {
            await saveReviewStageCheckpoint(runId, stage, output, metadata);
            console.info(
              `[review-worker] checkpoint saved run=${runId} stage=${stage}${
                metadata ? ` inputTokens=${metadata.inputTokens} outputTokens=${metadata.outputTokens}` : ""
              }`,
            );
          },
        },
      );
      if (!pipeline.ok) {
        const { agentId, error } = pipeline.error;
        console.error(
          `[review-worker] agent failure run=${runId} agent=${agentId} code=${error.code}`,
        );
        if (pipeline.error.metadata) {
          await recordReviewStageUsage(runId, agentId, pipeline.error.metadata);
        }
        await failJob(runId, error.code, `${agentId} failed: ${error.message}`);
        return;
      }

      const result = {
        ...pipeline.result,
        reviewId: runId,
        createdAt: new Date().toISOString(),
      };
      await markReviewRunCompleted(runId, result);
      console.info(`[review-worker] completed run=${runId}`);
    });

    if (!acquired) {
      console.info(`[review-worker] run already active elsewhere run=${runId}`);
    }
  } finally {
    releaseWorkerSlot();
  }
}

/**
 * Start or resume a persisted review job. In-process and PostgreSQL locks make
 * repeated polling safe, while the stored input lets another Render process
 * resume work after a restart.
 */
export function startReviewJob(runId: string): Promise<void> {
  const existing = activeJobs.get(runId);
  // The first `after()` call owns the long-running promise. Later polls only
  // signal that the same job should exist; they do not accumulate waiters.
  if (existing) return Promise.resolve();

  const job = executeReviewJob(runId)
    .catch(async (error) => {
      console.error(`[review-worker] unexpected failure run=${runId}`, error);
      await failJob(runId, "unexpected_pipeline_error", failureDetail(error));
    })
    .finally(() => {
      activeJobs.delete(runId);
    });
  activeJobs.set(runId, job);
  return job;
}
