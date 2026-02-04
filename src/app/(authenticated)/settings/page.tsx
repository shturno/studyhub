import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Settings, Bell, Shield } from "lucide-react"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { user } = session

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-zinc-400">Gerencie sua conta e preferências de estudo.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Perfil
                        </CardTitle>
                        <CardDescription>Suas informações pessoais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" defaultValue={user.name || ''} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={user.email || ''} disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Preferências de Estudo (TDAH)
                        </CardTitle>
                        <CardDescription>Personalize o comportamento do timer e das sessões.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pomodoro">Foco (minutos)</Label>
                                <Input id="pomodoro" type="number" defaultValue={25} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="break">Pausa (minutos)</Label>
                                <Input id="break" type="number" defaultValue={5} />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button variant="secondary" disabled>Salvar Alterações (Em breve)</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificações
                        </CardTitle>
                        <CardDescription>Gerencie seus alertas e lembretes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-500">Funcionalidade em desenvolvimento.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
