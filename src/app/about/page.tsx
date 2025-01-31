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
                    From me, an incompleted message
                </TextHeading>
					<Text variant="muted" size="xs" className="mb-8">January 31, 2025</Text>
                <StackVertical gap="md">
                <Text>
                        Hi, it's a pleasure to have you here. I'm an introvert, so I rarely share my thoughts online, even though my mind is always filled with reflections on the things I care about. But maybe it's time to step out a little, to put my thoughts and experiences into words. I hope you find something meaningful here.
                    </Text>

                    <Text>
                        There have been days when I wondered about my place in this world, and by extension, my presence on the internet. At first, I loved it—it was a space where I could truly be myself, where I could share what I loved. But over time, that feeling faded. I started believing I wasn’t good enough. Fear of judgment crept in, and soon, everything I wanted to say ended up buried in drafts, hidden away from the world. Yet, deep inside, a part of me still longs to share. I want to connect, but the fear of being overlooked or misunderstood holds me back.
                    </Text>
                    
                    <Text>
                        So, I decided to loosen up a little, to give myself space to be free, and that’s why I created this website—a place where I can just be me.
                    </Text>
                    
                    <Text>
                        As for the name, it wasn’t one I chose alone. My best friend and I came up with it together. I’ve always been more drawn to the social and psychological side of things, while they lean towards science and engineering. We’re different, yet somehow, we became best friends. The first name they picked for me was “Milky,” inspired by a drink I used to get at school and convenience stores. Eventually, I modified it to “Mike,” and later “Mikeblocky” when making a Roblox account.
                    </Text>
                    
                    <Text>
                        Right now, I’m studying Computer Science. I chose it because I loved computers and used to excel in the subject. But after a few months, I found myself struggling to keep up. The pace, the workload—it all became overwhelming. It made me anxious, stressed, and unsure if this path was right for me. I’m at a crossroads, and by February, I need to decide whether to continue or change my major. It’s a tough decision, but I think it’s worth considering. I love it, but I also hate it. And there are still so many other things I want to do, but I don’t know if I can.
                    </Text>
                    
                    <Text>
                        I tend to overthink—a habit that isn’t just part of my nature, but something shaped by my past. Growing up, I had a difficult relationship with my parents, full of conflicts and misunderstandings. My father was strict, and when I failed to meet his expectations, the consequences were harsh. Those experiences left scars, shaping the way I think and act today. But in a strange way, I appreciate my overthinking—it allows me to explore different perspectives, to see stories and characters in a deeper light.
                    </Text>
                    
                    <Text>
                        One of the most significant influences in my life has been *Skip and Loafer*. For some, it’s just a coming-of-age story, but for me, it’s something more. It reflects so many aspects of my own life—being an exceptional student, attending a prestigious high school and university, taking on leadership roles, and feeling the weight of expectations. I resonate deeply with Shima, and I often wonder if I’ll ever be able to grow and move forward like he does. I hope I can. I really do.
                    </Text>
                    
                    <Text>
                        Volume 8 of *Skip and Loafer* means the most to me. It hit so close to home that I couldn’t read it all at once—I had to take my time, stretching it out over a month. It made me cry for an entire day. Maybe one day, I’ll share why this volume affected me so much. But for now, just know that it holds a special place in my heart.
                    </Text>
                    
                    <Text>
                        My love for *Skip and Loafer* has even changed the way I create art. My work isn’t flashy or vibrant like other artists'. Instead, I aim for something warm, simple, and comforting—something that captures human connection and fleeting memories. My art reflects the moments I once lost, the emotions I’ve felt, and the small, everyday beauty that resonates with me. It aligns with the story’s themes, with the direction Takamatsu-sensei takes, and I’ve grown to love this approach. It pushes me beyond the safe boundaries I used to keep in my art.
                    </Text>
                    
                    <Text>
                        I won’t say I’m glad I took this detour in life, but I am grateful for the experiences I’ve had. Maybe this was always meant to happen. Or maybe I just got lucky. Either way, I’m here, figuring things out, thinking about my place in this world and where I belong.
                    </Text>
                </StackVertical>
            </div>
            </StackVertical>
            <SectionFooter color="purple" />
        </BaseContainer>
    )
}

