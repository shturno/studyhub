import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SessionModalProvider } from "@/features/timer/context/SessionModalContext";
import { AchievementModalProvider } from "@/lib/achievement-modal-context";
import { LevelUpProvider } from "@/lib/level-up-context";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AchievementModalProvider>
      <LevelUpProvider>
        <SessionModalProvider>
          <div className="flex min-h-screen bg-[#080010] text-[#e0e0ff] flex-col">
            <div
              className="sticky top-0 left-0 right-0 h-14 z-50 flex items-center px-4 justify-between"
              style={{
                background: "#04000a",
                borderBottom: "2px solid #00ff41",
                boxShadow: "0 2px 20px rgba(0,255,65,0.2)",
              }}
            >
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className="h-9 w-9 flex items-center justify-center font-pixel text-[#00ff41] text-lg hover:bg-[#00ff41]/10 transition-colors md:hidden"
                      style={{ border: "2px solid #00ff41" }}
                    >
                      ≡
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="p-0 border-0 w-64"
                    style={{ background: "#04000a" }}
                  >
                    <SheetTitle className="sr-only">
                      Menu de Navegação
                    </SheetTitle>
                    <AppSidebar user={session.user} className="w-full h-full" />
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                  <span
                    className="font-pixel text-[#00ff41] text-xs hidden md:block"
                    style={{ textShadow: "0 0 10px rgba(0,255,65,0.6)" }}
                  >
                    STUDY
                  </span>
                  <span
                    className="font-pixel text-[#ff006e] text-xs hidden md:block"
                    style={{ textShadow: "0 0 10px rgba(255,0,110,0.6)" }}
                  >
                    HUB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2">
                  <span className="font-pixel text-[8px] text-[#7f7f9f]">
                    PLAYER
                  </span>
                  <span className="font-pixel text-[10px] text-[#00ff41]">
                    {session.user?.name?.toUpperCase().slice(0, 8) || "P1"}
                  </span>
                </div>
                <div
                  className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"
                  style={{ boxShadow: "0 0 8px #00ff41" }}
                />
              </div>
            </div>

            <div className="flex flex-1">
              <div className="hidden md:block w-52 flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
                <AppSidebar user={session.user} className="w-full h-full" />
              </div>

              <main className="flex-1 min-h-0 relative overflow-x-hidden">
                <div className="relative z-10">{children}</div>
              </main>
            </div>
          </div>
        </SessionModalProvider>
      </LevelUpProvider>
    </AchievementModalProvider>
  );
}
