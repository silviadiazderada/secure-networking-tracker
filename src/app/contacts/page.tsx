import { AuthGuard } from "@/components/auth-guard";
import { AppHeader } from "@/components/app-header";
import { ContactsView } from "./contacts-view";

export const metadata = { title: "Contacts · Networking Tracker" };

export default function ContactsPage() {
  return (
    <AuthGuard>
      <AppHeader />
      <ContactsView />
    </AuthGuard>
  );
}
