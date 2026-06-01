import BaseContainer from "@/components/layout/container/base-container";
import { StackVertical } from "@/components/layout/layout-stack/layout-stack";
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter";
import { getDaysByMonth, readingSeries } from "./_data/days";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion/accordion";
import { cn } from "@/lib/utils/utils";
import { monoFont } from "@/styles/fonts/fonts";
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader";

export default function DailyNotes() {
	const monthGroups = getDaysByMonth();
	// Only the most recent month should be open by default
	const mostRecentMonth = monthGroups[0]?.month;

	return (
		<BaseContainer size="md" paddingX="md" paddingY="lg">
			<StackVertical gap="md">
				<SectionPageHeader
					title="Daily notes"
					description="My attempt at documenting, reflecting on, and being grateful for what I learned each day in my pursuit of knowledge."
					currentLabel="Daily notes"
				/>

					{readingSeries.length > 0 && (
						<section className="space-y-3">
							<h2 className={cn(
								monoFont.className,
								"tracking-wider",
								"text-[13px] sm:text-[15px]",
								"text-foreground dark:text-white",
								"font-semibold"
							)}>
								Reading notes
							</h2>
							<div className="pl-4">
								<StackVertical gap="none">
									{readingSeries.map((note) => (
										<div
											key={note.href}
											className={cn(
												"group",
												"relative",
												"border-l border-gray-200/50 dark:border-gray-700/50",
												"transition-all duration-200"
											)}
										>
											<Link
												href={note.href}
												className={cn(
													monoFont.className,
													"block py-2 pl-6 -ml-px",
													"text-xs sm:text-sm",
													"text-gray-600/90 dark:text-gray-300/90",
													"border-l border-transparent",
													"hover:border-blue-500/80 dark:hover:border-blue-400/80",
													"hover:text-blue-600 dark:hover:text-blue-300",
													"transition-all duration-200"
												)}
											>
												{note.title}
											</Link>
											<div className={cn(
												"absolute left-0 top-0 bottom-0 w-full",
												"bg-gradient-to-r from-gray-50/0 via-gray-50/0 to-transparent",
												"dark:from-gray-900/0 dark:via-gray-900/0 dark:to-transparent",
												"group-hover:from-blue-50/40 group-hover:via-blue-50/10",
												"dark:group-hover:from-blue-950/30 dark:group-hover:via-blue-950/10",
												"transition-colors duration-200",
												"-z-10"
											)} />
										</div>
									))}
								</StackVertical>
							</div>
						</section>
					)}

					<Accordion 
						type="single" 
						defaultValue={mostRecentMonth}
						className="space-y-6"
					>
						{monthGroups.map((group) => (
							<AccordionItem
								key={group.month}
								value={group.month}
								className="border-none"
							>
								<AccordionTrigger className={cn(
									"p-0 hover:no-underline",
									"group flex items-center gap-4",
									"transition-all duration-200",
									"data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-300"
								)}>
									<span className={cn(
										monoFont.className,
										"relative tracking-wider",
										"text-[13px] sm:text-[15px]",
										"text-foreground dark:text-white",
										"font-semibold",
										"group-hover:text-blue-600 dark:group-hover:text-blue-400",
										"group-data-[state=open]:text-blue-600 dark:group-data-[state=open]:text-blue-400"
									)}>
										{group.month}
										<span className={cn(
											"absolute -bottom-px left-0 w-full h-[1px]",
											"bg-gradient-to-r from-blue-600/40 via-blue-600/20 to-transparent",
											"dark:from-blue-300/30 dark:via-blue-300/15 dark:to-transparent",
											"transform origin-left transition-transform duration-300",
											"group-hover:scale-x-100 scale-x-0"
										)} />
									</span>
								</AccordionTrigger>
								<AccordionContent>
									<div className="pt-4 pl-4">
										<StackVertical gap="none">
											{group.days.map((day) => (
												<div 
													key={day.href} 
													className={cn(
														"group",
														"relative",
														"border-l border-gray-200/50 dark:border-gray-700/50",
														"transition-all duration-200"
													)}
												>
													<Link 
														href={day.href}
														className={cn(
															monoFont.className,
															"block py-2 pl-6 -ml-px",
															"text-xs sm:text-sm",
															"text-gray-600/90 dark:text-gray-300/90",
															"border-l border-transparent",
															"hover:border-blue-500/80 dark:hover:border-blue-400/80",
															"hover:text-blue-600 dark:hover:text-blue-300",
															"transition-all duration-200"
														)}
													>
														{day.title}
													</Link>
													{/* Hover indicator */}
													<div className={cn(
														"absolute left-0 top-0 bottom-0 w-full",
														"bg-gradient-to-r from-gray-50/0 via-gray-50/0 to-transparent",
														"dark:from-gray-900/0 dark:via-gray-900/0 dark:to-transparent",
														"group-hover:from-blue-50/40 group-hover:via-blue-50/10",
														"dark:group-hover:from-blue-950/30 dark:group-hover:via-blue-950/10",
														"transition-colors duration-200",
														"-z-10"
													)} />
												</div>
											))}
										</StackVertical>
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
			</StackVertical>

			<IndividualPageFooter parentPageName="Diary" showToTop={false} />
		</BaseContainer>
	);
}

