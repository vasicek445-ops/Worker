import { redirect } from "next/navigation";

// Odesílání přihlášek se přesunulo na stránku „Připojit Gmail".
export default function MatchesRedirect() {
  redirect("/profil/gmail");
}
