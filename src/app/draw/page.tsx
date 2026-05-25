import { redirect } from "next/navigation"

export default function DrawPage() {
    redirect('/interact?tab=prompts')
}
