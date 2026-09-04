import { CredentialsForm } from "@/components/auth/credentials-form";

export const metadata = { title: "Create account · Networking Tracker" };

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <CredentialsForm mode="sign-up" />
    </main>
  );
}
