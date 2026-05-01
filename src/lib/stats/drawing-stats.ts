import fs from 'fs'
import path from 'path'
import { StatItem } from "@/lib/stats/types"

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
    
    // We'll scan recursively for any files in folders matching our config
    const stats = CATEGORY_CONFIG.map(config => {
        let count = 0
        
        const scan = (dir: string) => {
            if (!fs.existsSync(dir)) return
            
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name)
                if (entry.isDirectory()) {
                    if (entry.name === config.folder) {
                        // Count all files in this specific category folder
                        count += countFilesRecursive(fullPath)
                    } else {
                        scan(fullPath)
                    }
                }
            }
        }
        
        scan(distributionDir)
        
        return {
            label: config.label,
            value: count,
            color: config.color
        }
    })

    // Filter out categories with 0 works if they weren't in the original hardcoded list
    // But for this user, we'll keep them all so they can see when they add new files
    return stats.sort((a, b) => b.value - a.value)
}

function countFilesRecursive(dir: string): number {
    let count = 0
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
        if (entry.isDirectory()) {
            count += countFilesRecursive(path.join(dir, entry.name))
        } else if (/\.(png|jpe?g|webp|avif|gif|mp4|mov)$/i.test(entry.name)) {
            count++
        }
    }
    
    return count
}
