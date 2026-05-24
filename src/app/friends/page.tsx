'use client'

import { useState } from 'react'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import Image from 'next/image'
import { developedFriends, buddingFriends, upcomingFriends, type Friend } from './_data/friends'
import TextUI from '@/components/ui/text/text'
import TextHeading from '@/components/ui/text-heading/text-heading'
import { SectionPageHeader } from '@/components/layout/page-header/SectionPageHeader'

function FriendCard({ friend, tag }: { friend: Friend, tag: string }) {
    return (
        <div className="group rounded-2xl border border-border/60 bg-background/80 p-5 transition-colors hover:border-blue-500/30 hover:bg-muted/20">
            <div className="flex flex-col items-start gap-5 md:flex-row">
                <div className="relative shrink-0 self-center md:self-start">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-slate-800">
                        <Image 
                            src={`https://unavatar.io/twitter/${friend.username}`}
                            alt={friend.username}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
                
                <StackVertical gap="sm" className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={cn(sansFont.className, "rounded-md bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300")}>
                                @{friend.username}
                        </span>
                        <span className="text-xs text-muted-foreground">{tag}</span>
                    </div>
                    
                    <p className={cn(sansFont.className, "text-[15px] leading-relaxed text-slate-700 dark:text-slate-200")}>
                        "{friend.description}"
                    </p>
                    
                    <div className="pt-1">
                        <a 
                            href={`https://twitter.com/${friend.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                            View profile →
                        </a>
                    </div>
                </StackVertical>
            </div>
        </div>
    )
}

type Tab = 'developed' | 'budding' | 'upcoming'

export default function FriendsList() {
    const [activeTab, setActiveTab] = useState<Tab>('developed')

    const tabs = [
        { id: 'developed', label: 'Developed but still need effort', count: developedFriends.length },
        { id: 'budding', label: 'Budding / In-between', count: buddingFriends.length },
        { id: 'upcoming', label: 'Will put effort to develop', count: upcomingFriends.length }
    ]

    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <SectionPageHeader
                    title="Friend list"
                    description="A small archive of the connections and friendships I've built along the way."
                    currentLabel="Friend list"
                />

                <StackVertical gap="lg" className="pt-4">
                    <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={cn(
                                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                                    activeTab === tab.id
                                        ? "border-blue-500 bg-blue-500 text-white"
                                        : "border-border bg-background text-muted-foreground hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-300"
                                )}
                            >
                                <span>{tab.label}</span>
                                <span className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[10px]",
                                    activeTab === tab.id ? "bg-white/20" : "bg-muted text-foreground/70"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="grid min-h-[400px] gap-5">
                        {activeTab === 'developed' ? (
                            developedFriends.map((friend) => (
                                <FriendCard key={friend.username} friend={friend} tag="Friend" />
                            ))
                        ) : activeTab === 'budding' ? (
                            buddingFriends.map((friend) => (
                                <FriendCard key={friend.username} friend={friend} tag="Budding" />
                            ))
                        ) : (
                            upcomingFriends.map((friend) => (
                                <FriendCard key={friend.username} friend={friend} tag="Upcoming" />
                            ))
                        )}
                    </div>
                </StackVertical>
            </StackVertical>
            <SectionFooter showToTop={false} />
        </BaseContainer>
    )
}
