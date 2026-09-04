import { CredentialsForm } from "@/components/auth/credentials-form";

export const metadata = { title: "Sign in · Networking Tracker" };

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <CredentialsForm mode="sign-in" />
    </main>
  );
}
