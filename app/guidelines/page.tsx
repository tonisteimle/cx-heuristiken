import { redirect } from "next/navigation"

export default function GuidelinesPage() {
  redirect("/?skipHome=true")
}
