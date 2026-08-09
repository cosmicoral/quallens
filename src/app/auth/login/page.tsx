import { AuthPage } from "@/components/auth/AuthPage";
import { safeCallbackPath } from "@/lib/auth/forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="login"
      callbackURL={safeCallbackPath(params.callbackURL)}
      error={params.error}
    />
  );
}
