import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: 'Blog | mikeblocky.com',
    description: 'thoughts on machine learning, math, technology, and my journey',
}

export default function BlogListing() {
    redirect('/journal')
}
