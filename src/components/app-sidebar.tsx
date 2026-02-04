"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    BrainCircuit,
    LayoutDashboard,
    Calendar,
    BookOpen,
    Trophy,
    Settings,
    LogOut,
    User,
    GraduationCap
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
// I'll implement a simple Avatar fallback or check if I missed it.
// Checking the list again: alert, badge, button, calendar, card... no avatar.
// I will implement a simple visual avatar in place.

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Planner",
        href: "/planner",
        icon: Calendar,
    },
    {
        title: "Matérias",
        href: "/subjects",
        icon: BookOpen,
    },
    {
        title: "Concursos",
        href: "/contests",
        icon: GraduationCap,
    },
    {
        title: "Conquistas",
        href: "/gamification", // Assuming this is the route, or maybe /profile? I'll stick to a gamification root or profile for now.
        icon: Trophy,
    },
]

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function AppSidebar({ className, user }: AppSidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("pb-12 min-h-screen", className)}>
            <div className="space-y-4 py-4">
                <div className="px-6 py-2">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-accent flex items-center justify-center">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">StudyHub</span>
                    </Link>
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start h-12 text-base font-medium",
                                        pathname === item.href
                                            ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("mr-3 h-5 w-5", pathname === item.href ? "text-brand-primary" : "text-zinc-500")} />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 w-full px-6">
                <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-white/10 uppercase">
                            {user?.name?.[0] || <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Estudante'}</p>
                            <p className="text-xs text-zinc-500 truncate">{user?.email || ''}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link href="/settings">
                            <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-zinc-400 hover:text-white">
                                <Settings className="mr-2 h-4 w-4" />
                                Configurações
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
