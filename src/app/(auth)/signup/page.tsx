import { redirect } from "next/navigation";

// Customer accounts are not publicly offered — agent signup is the only entry point.
export default function SignupPage() {
  redirect("/signup/agent");
}
