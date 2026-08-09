import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const corpusRoot = join(process.cwd(), "corpus");
const manifestPath = join(corpusRoot, "manifest.json");
const templatesDir = join(corpusRoot, "_templates");

const TEMPLATE_BY_TYPE = {
  methodology: "methodology.md",
  theory: "theory.md",
  journal_profile: "journal-profile.md",
};

const REQUIRED_FRONTMATTER = {
  all: ["id", "type", "title", "status"],
  methodology: ["agents"],
  theory: ["agents"],
  journal_profile: ["agents", "region"],
};

function parseArgs(argv) {
  return {
    initStubs: argv.includes("--init-stubs"),
    ingest: argv.includes("--ingest"),
    json: argv.includes("--json"),
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { error: "missing frontmatter delimiters (---)" };
  }

  const raw = match[1];
  const data = {};
  const lines = raw.split(/\r?\n/);
  let currentKey = null;
  let currentList = null;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (currentList && listItem) {
      currentList.push(listItem[1].replace(/^["']|["']$/g, ""));
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyValue) {
      if (line.trim() === "") continue;
      return { error: `invalid frontmatter line: ${line}` };
    }

    const [, key, value] = keyValue;
    currentKey = key;
    currentList = null;

    if (value === "") {
      currentList = [];
      data[key] = currentList;
      continue;
    }

    if (value === "null") {
      data[key] = null;
      continue;
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }

    data[key] = value.replace(/^["']|["']$/g, "");
  }

  return { data, body: content.slice(match[0].length).trimStart() };
}

function validateFrontmatter(data, manifestEntry) {
  const errors = [];
  for (const key of REQUIRED_FRONTMATTER.all) {
    if (data[key] === undefined || data[key] === "") {
      errors.push(`missing required frontmatter field: ${key}`);
    }
  }

  const typeRules = REQUIRED_FRONTMATTER[data.type];
  if (!typeRules) {
    errors.push(`unknown type: ${data.type}`);
  } else {
    for (const key of typeRules) {
      if (data[key] === undefined || data[key] === "" || (Array.isArray(data[key]) && data[key].length === 0)) {
        errors.push(`missing required field for type ${data.type}: ${key}`);
      }
    }
  }

  if (manifestEntry) {
    if (data.id !== manifestEntry.id) {
      errors.push(`id mismatch: file=${data.id} manifest=${manifestEntry.id}`);
    }
    if (data.type !== manifestEntry.type) {
      errors.push(`type mismatch: file=${data.type} manifest=${manifestEntry.type}`);
    }
  }

  return errors;
}

async function loadManifest() {
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  if (!Array.isArray(manifest.entries)) {
    throw new Error("manifest.json must contain an entries array");
  }
  return manifest;
}

async function fileExists(path) {
  try {
    await readFile(path, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function renderTemplate(type, entry) {
  const templateName = TEMPLATE_BY_TYPE[type];
  if (!templateName) {
    throw new Error(`no template for type: ${type}`);
  }
  const template = await readFile(join(templatesDir, templateName), "utf8");
  return template.replaceAll("{{id}}", entry.id).replaceAll("{{title}}", entry.title);
}

async function initStubs(manifest) {
  let created = 0;
  let skipped = 0;

  for (const entry of manifest.entries) {
    const targetPath = join(corpusRoot, entry.file);
    if (await fileExists(targetPath)) {
      skipped += 1;
      continue;
    }

    const content = await renderTemplate(entry.type, entry);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
    created += 1;
  }

  return { created, skipped };
}

async function validateCorpus(manifest) {
  const byFile = new Map(manifest.entries.map((entry) => [entry.file, entry]));
  const results = [];
  const errors = [];

  for (const entry of manifest.entries) {
    const absolutePath = join(corpusRoot, entry.file);
    if (!(await fileExists(absolutePath))) {
      results.push({ file: entry.file, status: "missing", entry });
      continue;
    }

    const content = await readFile(absolutePath, "utf8");
    const parsed = parseFrontmatter(content);
    if (parsed.error) {
      errors.push({ file: entry.file, message: parsed.error });
      results.push({ file: entry.file, status: "invalid", entry });
      continue;
    }

    const fieldErrors = validateFrontmatter(parsed.data, entry);
    if (fieldErrors.length > 0) {
      for (const message of fieldErrors) {
        errors.push({ file: entry.file, message });
      }
      results.push({ file: entry.file, status: "invalid", entry });
      continue;
    }

    results.push({
      file: entry.file,
      status: "ok",
      entry,
      docStatus: parsed.data.status,
      bodyChars: parsed.body.length,
    });
  }

  const extraFiles = [];
  for (const subdir of ["methodology", "theory", "journals"]) {
    const dirPath = join(corpusRoot, subdir);
    let files = [];
    try {
      files = await readdir(dirPath);
    } catch {
      continue;
    }
    for (const filename of files.filter((name) => name.endsWith(".md"))) {
      const relPath = `${subdir}/${filename}`;
      if (!byFile.has(relPath)) {
        extraFiles.push(relPath);
      }
    }
  }

  return { results, errors, extraFiles };
}

function summarize(manifest, validation) {
  const total = manifest.entries.length;
  const present = validation.results.filter((row) => row.status !== "missing").length;
  const ok = validation.results.filter((row) => row.status === "ok").length;
  const byStatus = manifest.entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total,
    present,
    missing: total - present,
    valid: ok,
    invalid: present - ok,
    manifestStatusCounts: byStatus,
    extraFiles: validation.extraFiles,
    errors: validation.errors,
  };
}

async function runIngestPlaceholder(summary) {
  console.log("Ingest pipeline not implemented yet.");
  console.log(`Would process ${summary.valid} valid document(s) when embeddings are enabled.`);
  console.log("Next steps: chunk markdown bodies, embed, store in corpus_embeddings table.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = await loadManifest();

  if (args.initStubs) {
    const { created, skipped } = await initStubs(manifest);
    console.log(`Init stubs: created ${created}, skipped ${skipped} (already exist).`);
  }

  const validation = await validateCorpus(manifest);
  const summary = summarize(manifest, validation);

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Corpus manifest: ${summary.total} entries`);
    console.log(`Files present: ${summary.present} | missing: ${summary.missing}`);
    console.log(`Valid frontmatter: ${summary.valid} | invalid: ${summary.invalid}`);
    console.log(
      `Manifest status: ${Object.entries(summary.manifestStatusCounts)
        .map(([key, count]) => `${key}=${count}`)
        .join(", ")}`,
    );

    if (summary.extraFiles.length > 0) {
      console.log(`Extra markdown files not in manifest: ${summary.extraFiles.join(", ")}`);
    }

    if (summary.errors.length > 0) {
      console.error("\nValidation errors:");
      for (const error of summary.errors) {
        console.error(`- ${error.file}: ${error.message}`);
      }
    }
  }

  if (args.ingest) {
    await runIngestPlaceholder(summary);
  }

  if (summary.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
