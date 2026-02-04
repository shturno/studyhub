import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

import { SessionModalProvider } from "@/features/timer/context/SessionModalContext"

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <SessionModalProvider>
            <div className="flex min-h-screen bg-background text-foreground flex-col">
                {/* Global Header / Sidebar Trigger */}
                <div className="sticky top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-50 flex items-center px-4 md:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 bg-card border-r border-border w-72">
                            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                            <AppSidebar user={session.user} />
                        </SheetContent>
                    </Sheet>

                    <div className="ml-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-accent flex items-center justify-center">
                            {/* Assuming BrainCircuit is imported or we can use text */}
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="font-bold text-lg hidden md:block">StudyHub</span>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 min-h-screen relative">
                    <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </SessionModalProvider>
    )
}
