'use client'

import { useState } from 'react'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import Image from 'next/image'
import { developedFriends, upcomingFriends, type Friend } from './_data/friends'

function FriendCard({ friend, tag }: { friend: Friend, tag: string }) {
    return (
        <div className="group relative rounded-3xl border border-purple-200/60 bg-white/50 p-6 dark:border-purple-500/20 dark:bg-[#1a1525]/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 dark:hover:bg-[#1a1525] overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-50/50 blur-3xl transition-colors group-hover:bg-purple-100/50 dark:bg-purple-900/10 dark:group-hover:bg-purple-800/20" />
            
            <div className="relative flex flex-col md:flex-row gap-6 items-start">
                <div className="relative shrink-0 self-center md:self-start">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-md bg-slate-100 dark:bg-slate-800">
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
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className={cn(sansFont.className, "text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/40 px-2 py-0.5 rounded-md")}>
                                @{friend.username}
                            </span>
                        </div>
                    </div>
                    
                    <p className={cn(sansFont.className, "text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] italic")}>
                        "{friend.description}"
                    </p>
                    
                    <div className="pt-2 flex justify-end">
                        <a 
                            href={`https://twitter.com/${friend.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 transition-colors flex items-center gap-1"
                        >
                            View profile →
                        </a>
                    </div>
                </StackVertical>
            </div>
        </div>
    )
}

type Tab = 'developed' | 'upcoming'

export default function FriendsList() {
    const [activeTab, setActiveTab] = useState<Tab>('developed')

    const tabs = [
        { id: 'developed', label: 'Developed but still need effort', count: developedFriends.length },
        { id: 'upcoming', label: 'Will put effort to develop', count: upcomingFriends.length }
    ]

    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '🐶' },
                            { label: 'Friend list' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <div className="max-w-2xl">
                    <div className="mb-8">
                        <TextHeading as="h1" weight="bold" className="text-4xl mb-2">
                            Friend list
                        </TextHeading>
                        <Text variant="muted" className="text-lg leading-relaxed">
                            A small archive of the connections and friendships I've built along the way.
                        </Text>
                    </div>

                    <StackVertical gap="lg">
                        <div className="flex flex-wrap gap-2 mb-2 border-b border-purple-100 dark:border-purple-900/50 pb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        activeTab === tab.id
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                            : "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full",
                                        activeTab === tab.id ? "bg-white/20" : "bg-purple-500/10"
                                    )}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="grid gap-8 min-h-[400px]">
                            {activeTab === 'developed' ? (
                                developedFriends.map((friend) => (
                                    <FriendCard key={friend.username} friend={friend} tag="Friend" />
                                ))
                            ) : (
                                upcomingFriends.map((friend) => (
                                    <FriendCard key={friend.username} friend={friend} tag="Upcoming" />
                                ))
                            )}
                        </div>
                    </StackVertical>
                </div>
            </StackVertical>
            <SectionFooter showToTop={false} />
        </BaseContainer>
    )
}

