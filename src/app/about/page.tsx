'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import Text from "@/components/ui/text/text"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"

export default function About() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '🐶' },
                            { label: 'About' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <div>
                    <TextHeading as="h1" weight="bold">
                        From me, an incomplete message
                    </TextHeading>
                    <Text variant="muted" size="xs" className="mb-8">November 2025</Text>

                    <StackVertical gap="md">
                        <Text>
                            I’ve never been someone who shares much of myself online. I tend to overthink 
                            every post and every word, including the ones you’re reading right now. 
                            However, I’m starting to realize that keeping everything inside can become 
                            its own kind of weight. This space is my attempt to speak up, even if the words 
                            come out a little slowly. I hope you find something here that resonates with you.
                        </Text>

                        <Text>
                            There were times when I felt lost trying to find my place in the world. 
                            When I was younger, the internet felt like a small window where I could 
                            be my truest self, but that joy eventually faded into doubt. I began 
                            questioning everything I created, and most of my thoughts ended up 
                            hidden away in private drafts. Building this website is a small act 
                            of freedom for me; it is a quiet corner where I can simply exist as I am.
                        </Text>

                        <Text>
                            Even my name has a bit of a history. My best friend actually came up 
                            with the first version, “Milky,” which was named after a drink I used 
                            to buy all the time after school. That eventually evolved into “Mike,” 
                            and later “Mikeblocky” when I joined Roblox years ago. It’s a silly 
                            name, but it somehow managed to grow alongside me through every 
                            stage of my life.
                        </Text>

                        <Text>
                            For a long time, I followed the path of Computer Science. I appreciated 
                            the logic and the way code could bring an idea into reality, but 
                            eventually, I realized it wasn't where I truly belonged. The pressure 
                            led to a lot of anxiety and burnout. Now, I’m moving toward something 
                            that feels much closer to my heart: Japanese language and literature. 
                            I want to spend my time exploring stories, understanding people, 
                            and studying the culture that has shaped so much of who I am.
                        </Text>

                        <Text>
                            I’ve always lived inside my own head. Part of that comes from an 
                            upbringing where mistakes felt very heavy. Growing up with a strict 
                            father taught me to measure my worth by my performance, which left 
                            marks that I’m still navigating today. But I’ve tried to turn that 
                            habit of overthinking into a strength. It helps me reflect more 
                            deeply and feel a stronger sense of empathy for the emotions 
                            found in stories and people.
                        </Text>

                        <Text>
                            Speaking of stories, <em>Skip and Loafer</em> has become a mirror 
                            for my own life. I see so much of myself in Shima, especially in 
                            the quiet, awkward moments of trying to grow up while feeling 
                            completely stuck. Volume 8 was particularly difficult for me to 
                            get through; it took me an entire month because every few pages 
                            felt like looking back at my own past. I cried when I finally 
                            finished it, and even now, just thinking about it brings 
                            back that familiar ache.
                        </Text>

                        <Text>
                            Another series that stayed with me is <em>Kemutai Hanashi</em>. 
                            It is a gentle, human story about regret, longing, and the 
                            fragile connections that keep us moving forward. It doesn’t 
                            rely on big explanations or loud drama; it simply exists with 
                            a soft honesty. Every time I reread it, I’m reminded that 
                            art doesn’t need to be loud to reach someone. Its warmth 
                            continues to influence how I view the world and how I draw.
                        </Text>

                        <Text>
                            These stories changed my perspective on my own artwork. I stopped 
                            trying to be flashy or perfect and started focusing on warmth. 
                            I want my drawings to feel like small windows into those fleeting 
                            moments that usually go unnoticed. I try to capture the kinds 
                            of feelings that don’t ask for attention but still hope to 
                            be seen by someone.
                        </Text>

                        <Text>
                            I don’t have a clear map for where I’m going. It might lead to 
                            teaching, storytelling, or something I haven’t discovered yet. 
                            But for now, I’m here, I’m figuring things out, and I think 
                            that is enough.
                        </Text>
                    </StackVertical>
                </div>
            </StackVertical>

            <SectionFooter color="purple" />
        </BaseContainer>
    )
}

