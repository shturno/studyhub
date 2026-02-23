import { cn } from "@/lib/utils"
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
    readonly icon: LucideIcon
    readonly value: string | number
    readonly label: string
    readonly subValue?: string
    readonly iconColor?: string
    readonly className?: string
}

export function StatCard({ icon: Icon, value, label, subValue, iconColor = "#00ff41", className }: StatCardProps) {
    return (
        <div className={cn("flex items-center gap-4 p-5", className)}
            style={{ border: `2px solid ${iconColor}30`, background: '#04000a' }}>
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{ border: `2px solid ${iconColor}40`, background: `${iconColor}0a` }}>
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
            </div>
            <div>
                <div className="font-pixel text-xl" style={{ color: iconColor }}>{value}</div>
                <div className="font-pixel text-[6px] text-[#7f7f9f] mt-1">{label}</div>
                {subValue && (
                    <div className="font-mono text-sm text-[#555] mt-0.5">{subValue}</div>
                )}
            </div>
        </div>
    )
}
