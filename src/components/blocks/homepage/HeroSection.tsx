'use client'

import { motion } from 'framer-motion'
import { monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Link from 'next/link'
import Image from 'next/image'
import Ruler from '@/components/ui/ruler/ruler'
import { List, ListItem } from '@/components/ui/list/list'
import imageCover from '../../../../public/image-cover.png'

export function HeroSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative pb-8"
        >
            <div className="relative">
                <StackVertical gap="xs">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-10 h-10 sm:w-12 sm:h-12"
                    >
                        <img src="/icon.svg" alt="mikeblocky" className="w-full h-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <TextHeading as="h1" className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                            mikeblocky.com
                        </TextHeading>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Text>
                            Hi, I’m Mike. I’m a Vietnamese artist and a Computer Science student, living somewhere between quiet drawings and long, wandering thoughts.
                            This site is my small corner of the internet—a slow, personal space where I try to be as honest as I can, even when I don’t fully understand myself yet.
                        </Text>

                        <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text>
                                I started this space during a time when I felt a bit lost. I didn’t really know how to connect with people in a meaningful way, and a lot of things in my life felt distant or surface-level. Instead of forcing answers, I began building this place—something gentle, something that could grow with me. In a way, this is both a website and a record of me trying.
                            </Text>
                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Text>
                                I’ve always been drawn to art, literature, and the quiet ways people express themselves.
                                Even though I’m studying Computer Science—and I still find beauty in how code can shape ideas into something real—my attention often drifts back to language, especially Japanese.
                            </Text>

                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>

                            <Text>
                                I’ve been learning it slowly, not in a strict or perfect way, but in a way that feels natural to me: studying when I can, listening to music, watching videos, and trying to understand the rhythm and emotion behind it. It’s less about speed, more about feeling. I think that’s what keeps me going.
                            </Text>

                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>

                            <Text>
                                Over time, I’ve realized I want to read more closely, understand stories more deeply, and maybe one day share that understanding with others—whether through teaching, writing, or just quiet conversations.
                            </Text>

                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>

                            <Text>
                                My artwork reflects that same approach.
                                It’s simple, soft, and often focused on small moments that don’t ask for attention. I like drawing scenes that feel lived-in—little pauses, subtle emotions, things that might otherwise go unnoticed.
                            </Text>

                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>

                            <Text>
                                Stories like Skip and Loafer and Kemutai Hanashi have shaped me a lot. Not in a quiet or dramatic way, but in something quieter. They taught me that growth can be slow and uneven, that people can carry both warmth and regret at the same time, and that even small connections can matter more than we think.
                            </Text>

                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>

                            <Text>
                                Those ideas stay with me when I draw—and honestly, when I try to understand people too.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                This site is both an archive and a diary.
                                I use it to share my illustrations, thoughts, and reflections—sometimes structured, sometimes not. It’s one of the few places where I don’t feel the need to rush or perform.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                You can find most of that over on the blog.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                If you’re new here, feel free to take your time.
                                There’s no pressure to read everything or understand it all. I built this space to be quiet on purpose.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                I’m still figuring out where I belong, what I want to pursue, and how I want to live. But for now, I’m here—drawing, learning, and slowly trying to connect.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                If something here stays with you, even a little, that’s already more than enough.
                            </Text>

                            <Ruler color='colorless' marginTop='md' marginBottom='none'/>

                            <List spacing='tight'>
                                <ListItem>
                                    <Link href="/about" className="underline hover:text-purple-500">About me</Link>
                                </ListItem>
                                <ListItem>
                                    <Link href="/blog/posts/kemutai-hanashi-fic-1" className="underline hover:text-purple-500">
                                        I have my words, and time is ticking
                                    </Link>
                                </ListItem>
                                <ListItem>
                                    <Link href="/blog/kemutai-hanashi-2-3-en" className="underline hover:text-purple-500">
                                        My thoughts about Kemutai Hanashi - Chapter 2, 3
                                    </Link>
                                </ListItem>
                            </List>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                I’ll keep updating this space as I go—more drawings, more thoughts, more fragments of whatever I’m becoming.
                                Thank you for being here, even just for a moment.
                            </Text>
                        </motion.div>
                    </motion.div>
                </StackVertical>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 -mb-8"
            >
                <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] rounded-lg overflow-hidden">
                    <Image
                        className="object-cover"
                        fill
                        src={imageCover}
                        alt="A drawing of Shima and Mitsumi from January 2025, featuring a quiet sky and soft colors."
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}