import React from 'react'

export type OutlineSection = {
    id: string
    label: string
    level: 1 | 2 | 3 | 4 | 5 | 6
}

export function slugifyHeading(text: string) {
    return text
        .toLowerCase()
        .replace(/["']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function getTextFromNode(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node)
    }

    if (Array.isArray(node)) {
        return node.map(getTextFromNode).join(' ')
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return getTextFromNode(node.props.children)
    }

    return ''
}

export function extractOutlineFromMdx(source: string): OutlineSection[] {
    const stripMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            .replace(/~~(.+?)~~/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .trim()
    }

    return source
        .split(/\r?\n/)
        .map((line) => line.trim())
        .map((line) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/)

            if (!match) {
                return null
            }

            const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6
            const label = match[2].trim()
            const cleanLabel = stripMarkdown(label.replace(/\{#.+\}$/, '').trim())
            const id = slugifyHeading(cleanLabel)

            if (!id) {
                return null
            }

            return {
                id,
                label: cleanLabel,
                level,
            }
        })
        .filter((section): section is OutlineSection => Boolean(section))
}
