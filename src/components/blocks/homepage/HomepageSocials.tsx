'use client'

import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import Link from 'next/link'

export function HomepageSocials() {
    return (
        <div>
            <TextHeading as="h2" weight="bold">Socials</TextHeading>
            <Text>
                I'm always accept any emails about works and personal stuffs, just email me at <Link href="mailto:me@mikeblocky.com" className="text-purple-500 hover:underline">me@mikeblocky.com</Link> or <Link href="https://x.com/mikeblocky" className="text-purple-500 hover:underline">Twitter</Link>.
            </Text>
        </div>

    )
} 