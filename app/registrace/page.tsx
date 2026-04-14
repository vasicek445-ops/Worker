import { redirect } from "next/navigation";

export default function RegistracePage() {
  redirect("/login?tab=register");
}
