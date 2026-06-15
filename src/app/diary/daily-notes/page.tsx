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
		<BaseContainer size="lg" paddingX="md" paddingY="lg">
			<StackVertical gap="md">
				<SectionPageHeader
					title="Daily notes"
					description="A collection of short entries, gratitude logs, and snippets of what I learn or document each day."
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
						<div className="pt-2 flex flex-col gap-1">
							{readingSeries.map((note) => (
								<div key={note.href}>
									<Link
										href={note.href}
										className={cn(
											monoFont.className,
											"block py-1.5 px-3 rounded-md border border-transparent",
											"text-xs sm:text-sm",
											"text-slate-600/90 dark:text-slate-400",
											"hover:border-[hsl(var(--pride-glow-val))]/20 hover:bg-[hsl(var(--pride-glow-val))]/5 hover:pride-text",
											"transition-all duration-150"
										)}
									>
										{note.title}
									</Link>
								</div>
							))}
						</div>
					</section>
				)}

				<Accordion 
					type="single" 
					defaultValue={mostRecentMonth}
					className="space-y-4"
				>
					{monthGroups.map((group) => (
						<AccordionItem
							key={group.month}
							value={group.month}
							className="border-none"
						>
							<AccordionTrigger className={cn(
								"p-0 hover:no-underline",
								"group flex items-center gap-3",
								"transition-all duration-200",
								"data-[state=open]:pride-text"
							)}>
								<span className={cn(
									monoFont.className,
									"relative tracking-wider text-sm text-foreground dark:text-white font-semibold group-hover:pride-text"
								)}>
									{group.month}
								</span>
							</AccordionTrigger>
							<AccordionContent>
								<div className="pt-2 flex flex-col gap-1">
									{group.days.map((day) => (
										<div key={day.href}>
											<Link 
												href={day.href}
												className={cn(
													monoFont.className,
													"block py-1.5 px-3 rounded-md border border-transparent",
													"text-xs sm:text-sm",
													"text-slate-600/90 dark:text-slate-400",
													"hover:border-[hsl(var(--pride-glow-val))]/20 hover:bg-[hsl(var(--pride-glow-val))]/5 hover:pride-text",
													"transition-all duration-150"
												)}
											>
												{day.title}
											</Link>
										</div>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</StackVertical>

			<IndividualPageFooter parentPageName="Journal" showToTop={false} />
		</BaseContainer>
	);
}
