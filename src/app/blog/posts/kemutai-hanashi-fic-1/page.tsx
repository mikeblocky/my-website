import KemutaiHanashiFicContent from './client-page'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'I have my words, and time is ticking | mikeblocky.com',
    description: 'The answer is not found in words but in the endurance of a feeling that has no choice but to exist.',
}

export default function KemutaiHanashiFic() {
  return <KemutaiHanashiFicContent />
}
