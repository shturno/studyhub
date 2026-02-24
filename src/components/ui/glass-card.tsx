import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly hoverEffect?: boolean
    readonly gradient?: boolean
}

export function GlassCard({ className, children, hoverEffect = false, ...props }: Readonly<GlassCardProps>) {
    return (
        <div className={cn(
            "p-5 relative overflow-hidden transition-all duration-200",
            hoverEffect && "hover:-translate-y-0.5",
            className
        )}
            style={{
                background: '#04000a',
                border: '2px solid rgba(0,255,65,0.4)',
                boxShadow: '4px 4px 0 rgba(0,255,65,0.1)',
            }}
            {...props}>
            {children}
        </div>
    )
}
