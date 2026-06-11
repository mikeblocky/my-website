'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import Link from "next/link"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"

export default function DiaryUtensils() {
    return (
        <BaseContainer size="lg" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <SectionPageHeader
                    title="Diary utensils"
                    description="The tools, stationery, and setup behind my diary pages."
                    currentLabel="Diary utensils"
                />

                <StackVertical gap="md">
                    <Text><span className="font-bold">Keyboard:</span> <Link href="https://www.logitech.com/en-us/products/keyboards/pop-keys-wireless-mechanical.920-010708.html" className="underline hover:text-blue-500">Logitech POP Keys</Link></Text>
                    <Text><span className="font-bold">Mouse:</span> <Link href="https://www.logitech.com/en-us/products/mice/pop-wireless-mouse.html" className="underline hover:text-blue-500">Logitech POP Mouse</Link></Text>
                    <Text><span className="font-bold">Notebook (physical):</span> Normal notebook from Muji Japan</Text>
                    <Text><span className="font-bold">Pen:</span> 0.5 black ink ballpoint pen from Muji Japan (same store as above)</Text>
                    
                </StackVertical>
            </StackVertical>

            <IndividualPageFooter sectionName={`Diary`} showToTop={false} />

        </BaseContainer>
    )
}


