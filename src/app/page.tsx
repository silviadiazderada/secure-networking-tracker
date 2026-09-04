import { redirect } from "next/navigation";

export default function Home() {
  // The contacts page guards itself and sends unauthenticated visitors
  // on to /sign-in.
  redirect("/contacts");
}
