import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean
    gradient?: boolean
}

export function GlassCard({ className, children, hoverEffect = false, gradient = false, ...props }: GlassCardProps) {
    return (
        <div className={cn(
            "p-5 rounded-2xl bg-card border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden transition-all duration-300",
            hoverEffect && "group hover:border-brand-primary/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]",
            gradient && "bg-gradient-to-br from-card to-card/50",
            className
        )} {...props}>
            {children}
        </div>
    )
}
