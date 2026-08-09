import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./server";

export async function getServerSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export async function requireSession(callbackURL = "/dashboard") {
  const session = await getServerSession();
  if (!session) {
    redirect(`/auth/login?callbackURL=${encodeURIComponent(callbackURL)}`);
  }
  return session;
}
