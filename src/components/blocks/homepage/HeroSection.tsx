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
                            Hi, I’m Mike. I am a Vietnamese artist and student living somewhere between quiet drawings and long thoughts. 
                            This site is my own little corner of the internet. It is a slow, personal space where I try my best to be honest.
                        </Text>

                        <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text>
                                I have always been moved by art, literature, and the way stories connect us. While I spent a lot of time 
                                studying Computer Science and still appreciate how code can bring an idea to life, my curiosity 
                                usually leads me back to Japanese language and literature. I want to read closely, to teach, and to 
                                understand people better through the worlds they build.
                            </Text>
                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Text>
                                My artwork is simple and intentionally soft. I like drawing small scenes and the kind of quiet 
                                feelings that don’t usually ask for attention. I am deeply shaped by stories like <em>Skip and Loafer</em> and 
                                <em> Kemutai Hanashi</em>. <em>Skip and Loafer</em> taught me that personal growth doesn't have to 
                                be loud to be meaningful, while <em>Kemutai Hanashi</em> showed me how regret and tenderness can exist 
                                together. Both have changed the way I draw and how I look at the people around me.
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                I use this site as both an archive and a diary. I share my illustrations, process notes, and 
                                longer reflections over on the{' '}
                                <Link href="/blog" className="text-purple-500 font-bold hover:underline">
                                    blog
                                </Link>
                                .
                            </Text>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                If you are new here, please feel free to look around and take your time. I hope you don't mind the 
                                silence; I built it that way on purpose. I am still figuring out where I belong, but I am happy 
                                to be here drawing and learning. I would be glad if some of it stays with you.
                            </Text>

                            <Ruler color='colorless' marginTop='md' marginBottom='none'/>

                            <List spacing='tight'>
                                <ListItem>
                                    <Link href="/about" className="underline hover:text-purple-500">About me</Link>
                                </ListItem>
                                <ListItem>
                                    <Link href="/blog/sand-crab-thoughts" className="underline hover:text-purple-500">
                                        Thoughts on Shima and the crab
                                    </Link>
                                </ListItem>
                                <ListItem>
                                    <Link href="/blog/kemutai-hanashi-1-en" className="underline hover:text-purple-500">
                                        Reflections on Kemutai Hanashi: Chapter 1
                                    </Link>
                                </ListItem>
                            </List>

                            <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                            <Text>
                                I’ll keep updating this space as I go with more drawings and reading logs. Thank you for stopping by.
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