import { redirect } from "next/navigation"

export default function TalkPage() {
    redirect('/interact?tab=guestbook')
}
