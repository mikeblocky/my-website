const htmlEntityMap: Record<string, string> = {
	amp: '&',
	apos: "'",
	'#39': "'",
	'#039': "'",
	quot: '"',
	lt: '<',
	gt: '>',
	nbsp: ' ',
	ndash: '-',
	mdash: '-',
	hellip: '...',
}

export function decodeHtmlEntities(value: string | undefined | null) {
	if (!value) return value ?? undefined

	return value.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
		const normalized = entity.toLowerCase()

		if (normalized.startsWith('#x')) {
			const codePoint = Number.parseInt(normalized.slice(2), 16)
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
		}

		if (normalized.startsWith('#')) {
			const codePoint = Number.parseInt(normalized.slice(1), 10)
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
		}

		return htmlEntityMap[normalized] ?? match
	})
}
