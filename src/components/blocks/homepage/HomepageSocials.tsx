'use client'

import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import Link from 'next/link'

export function HomepageSocials() {
    return (
        <div>
            <TextHeading as="h2" weight="bold">Socials</TextHeading>
            <Text>
                I always accept any emails about works and personal stuffs, just email me at <Link href="mailto:mibeblocky@gmail.com" className="pride-text hover:underline">mibeblocky@gmail.com</Link> or message via <Link href="https://x.com/mikeblocky" className="pride-text hover:underline">Twitter</Link>.
            </Text>
        </div>
    )
}
