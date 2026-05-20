import { redirect } from "next/navigation";

// Smart Matching bylo sloučeno do Smart Apply.
export default function MatchingRedirect() {
  redirect("/profil/gmail");
}
