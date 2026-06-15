import fs from 'fs'
import path from 'path'
import type { StatItem } from "$lib/stats/types"

const CATEGORY_CONFIG = [
    { label: "Kemutai Hanashi", folder: "kemutai-hanashi", color: "bg-orange-500" },
    { label: "Skip and Loafer", folder: "skip-and-loafer", color: "bg-blue-500" },
    { label: "Hoshiai no Sora", folder: "hoshiai-no-sora", color: "bg-green-500" },
    { label: "Fan-art for Mutuals", folder: "mutuals", color: "bg-pink-500" },
    { label: "Animations", folder: "animations", color: "bg-yellow-500" },
    { label: "Kimi ni wa Todokanai", folder: "kiminai", color: "bg-purple-500" },
]

export function getDrawingStats(): StatItem[] {
    const distributionDir = path.join(process.cwd(), 'public', 'distribution')
    
    // Initialize counts for each category
    const counts: Record<string, number> = {}
    CATEGORY_CONFIG.forEach(config => {
        counts[config.label] = 0
    })

    const scan = (dir: string, currentCategoryLabel: string | null) => {
        if (!fs.existsSync(dir)) return
        
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            
            if (entry.isDirectory()) {
                // Check if this folder matches a category config
                const config = CATEGORY_CONFIG.find(c => c.folder === entry.name)
                // If it matches, we use that category label for files inside.
                // Otherwise, we inherit the current category label.
                scan(fullPath, config ? config.label : currentCategoryLabel)
            } else {
                // It's a file. Check if it's a valid work format.
                if (/\.(png|jpe?g|webp|avif|gif|mp4|mov)$/i.test(entry.name)) {
                    // Priority: If it's an animation file type, it always goes to Animations
                    if (/\.(mp4|gif|mov)$/i.test(entry.name)) {
                        counts["Animations"]++
                    } else if (currentCategoryLabel) {
                        // Otherwise, it goes to the current series category
                        counts[currentCategoryLabel]++
                    }
                }
            }
        }
    }
    
    scan(distributionDir, null)
    
    return CATEGORY_CONFIG.map(config => ({
        label: config.label,
        value: counts[config.label],
        color: config.color
    })).sort((a, b) => b.value - a.value)
}
