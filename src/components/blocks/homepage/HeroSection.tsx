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
                        className={cn("text-2xl sm:text-3xl md:text-4xl", monoFont.className)}
                    >
                        👾
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
                            Hi, I’m Mike — a Vietnamese artist and student who lives somewhere between quiet drawings and long thoughts. 
                            This little site is my calm corner on the internet: slow, personal, and a bit stubborn about honesty.
                        </Text>

                        <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text>
                                I care about art, literature, and the way stories move people. I used to be deep in Computer Science — I still like how code
                                makes ideas real — but I’ve been leaning toward Japanese language and literature because that’s where my curiosity keeps
                                returning. I want to read closely, to teach, to translate, to understand people better through the worlds they create.
                            </Text>
                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Text>
                                My artwork isn’t flashy. It’s warm, simple, and a little fragile on purpose — small scenes, human distance, 
                                the kind of feelings that don’t ask to be seen. I’m shaped by stories like <em>Skip and Loafer</em> and 
                                <em> Kemutai Hanashi</em>. <em>Skip and Loafer</em> (especially Volume 8) 
                                taught me that quiet growth can still shake you. <em>Kemutai Hanashi</em> showed me how regret and tenderness 
                                can sit together without explanation. Both changed the way I draw and how I look at people.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                This site is an archive and a diary. I post illustrations, process notes, and longer reflections in the{' '}
                                <Link href="/blog" className="text-purple-500 font-bold hover:underline">
                                    blog
                                </Link>
                                .
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                if you’re new: read anything, take your time, and don’t worry if it feels quiet. that’s the point. 
                                I’m still figuring out where I belong, but I’m here — drawing, reading, learning — and I’d be happy if some of it stays with you.
                            </Text>

                            <Ruler color='colorless' marginTop='md' marginBottom='none'/>

                            <List spacing='tight'>
                                <ListItem>
                                    <Link href="/about" className="underline hover:text-purple-500">About me</Link>
                                </ListItem>
                                <ListItem>
                                    <Link href="/blog/sand-crab-thoughts" className="underline hover:text-purple-500">
                                        My thoughts about Shima and the crab, to the sand.
                                    </Link>
                                </ListItem>
                                <ListItem>
                                    <Link href="/blog/kemutai-hanashi-1-en" className="underline hover:text-purple-500">
                                        My thoughts of first chapter of Kemutai Hanashi (English)
                                    </Link>
                                </ListItem>
                            </List>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                I’ll keep updating as I go — more drawings, more reading logs, more language notes. Thanks for being here.
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
                        src="/image-cover.png"
                        alt="A drawing of Shima and Mitsumi I made in January 2025 — quiet sky, soft colors, small distance."
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}
