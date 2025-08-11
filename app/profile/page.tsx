import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helpers"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Mail, Calendar, Settings } from "lucide-react"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user?.id) {
    redirect("/auth/signin")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie suas informações pessoais e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados de cadastro no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="text-2xl font-medium text-white">{user.name?.charAt(0) || "U"}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name || "Usuário"}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{user.name || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Configure suas preferências do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Tema</p>
                    <p className="text-sm text-gray-500">Alternar entre modo claro e escuro</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Sobre o Sistema</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Study Tracker v1.0 - Sistema de gerenciamento de estudos desenvolvido para ajudar você a organizar e
                  acompanhar seu progresso de aprendizado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
