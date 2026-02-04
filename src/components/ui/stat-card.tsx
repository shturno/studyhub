import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    value: string | number
    label: string
    subValue?: string
    iconColor?: string // Tailwind text color class e.g. "text-emerald-400"
    iconBgColor?: string // Tailwind bg color class e.g. "bg-emerald-500/10"
    className?: string
}

export function StatCard({ icon: Icon, value, label, subValue, iconColor = "text-brand-primary", iconBgColor = "bg-brand-primary/10", className }: StatCardProps) {
    return (
        <GlassCard className={cn("flex items-center gap-4", className)}>
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor, iconColor)}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-zinc-500">{label}</div>
                {subValue && (
                    <div className="text-xs text-zinc-600 mt-1">{subValue}</div>
                )}
            </div>
        </GlassCard>
    )
}
