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
                            { href: '/', label: 'Home', emoji: '👾' },
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
                            Hi, it’s nice to have you here. I’m not the kind of person who shares much online.
                            I overthink every post, every word — even this one. But lately I’ve been learning
                            that silence can turn heavy if you never let anything out. So, this space is where
                            I’ll try to speak, even if the words come slowly. Maybe you’ll find something here
                            that stays with you for a while.
                        </Text>

                        <Text>
                            There were times I wondered what my place in the world was — both offline and online.
                            When I was younger, I loved the internet. It felt like a small window where I could
                            be my truest self. But somewhere along the way, the joy faded. I started doubting
                            everything I made. Fear took over, and my thoughts ended up buried in notes and drafts
                            no one would ever see. Still, even under all that fear, a quiet part of me wanted to
                            reach out again. So, I built this website as a small act of freedom — a quiet corner
                            to just exist as myself.
                        </Text>

                        <Text>
                            As for my name — “Mike” wasn’t really mine alone. My best friend came up with the first
                            version, “Milky,” named after a drink I used to buy at school and convenience stores.
                            Later it became “Mike,” and eventually “Mikeblocky,” back when I made a Roblox account.
                            It stuck. Somehow, that silly name grew with me through all my changes.
                        </Text>

                        <Text>
                            I studied Computer Science for a while. I used to love the logic, the structure — the way
                            code could make something real. But over time, I realized it wasn’t everything I wanted.
                            It made me anxious, burnt out, and unsure of where I fit in. So now, I’m leaning toward
                            something closer to my heart — Japanese language and literature. I want to explore stories,
                            people, and the culture that has quietly shaped who I am today.
                        </Text>

                        <Text>
                            I’ve always been someone who thinks too much. Maybe that’s from my upbringing, where mistakes
                            weren’t taken lightly. My father was strict, and I learned to measure myself by how well I performed.
                            It left marks that never fully faded. But I’ve learned to turn that overthinking into something else —
                            reflection, empathy, a way to understand characters and emotions more deeply.
                        </Text>

                        <Text>
                            And then there’s <em>Skip and Loafer</em>. It’s not just a story to me — it’s a mirror. I see pieces
                            of myself in Shima, in the quiet moments between characters, in the awkwardness of trying to grow
                            while feeling stuck. Volume 8 especially… that one broke me open. It took me a month to finish because
                            every few pages felt like looking into my own past. I cried the day I finished it. Even now, I still
                            can’t read it without feeling something ache inside me.
                        </Text>

                        <Text>
                            Another story that shaped me is <em>Kemutai Hanashi</em>. It’s a quiet, deeply human series about
                            regret, longing, and the small, fragile connections that keep people moving forward. I first read it
                            years ago, and it changed me in ways I didn’t expect. It doesn’t shout or explain itself — it simply
                            exists, softly and truthfully. Every reread reminds me that stories don’t need to be loud to reach
                            someone’s heart. Its warmth continues to influence the way I see art, people, and life itself.
                        </Text>

                        <Text>
                            That love for stories like <em>Skip and Loafer</em> and <em>Kemutai Hanashi</em> shaped my art too.
                            I stopped chasing flashiness or perfection. Instead, I draw for warmth — that quiet, human kind of beauty.
                            My works are like small windows into moments that almost disappear if you blink. I draw the kinds of feelings
                            that don’t ask to be seen, but still hope someone notices.
                        </Text>

                        <Text>
                            I don’t know where this path leads yet — maybe teaching, maybe storytelling, maybe something else entirely.
                            But I’m here. I’m still figuring things out. And maybe that’s enough for now.
                        </Text>
                    </StackVertical>
                </div>
            </StackVertical>

            <SectionFooter color="purple" />
        </BaseContainer>
    )
}
