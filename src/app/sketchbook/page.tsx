import { redirect } from "next/navigation"

export default function SketchbookPage() {
    redirect('/interact?tab=sketchbook')
}
