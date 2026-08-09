import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

function handler() {
  return toNextJsHandler(getAuth());
}

export function GET(request: Request) {
  return handler().GET(request);
}

export function POST(request: Request) {
  return handler().POST(request);
}
