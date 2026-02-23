'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
        }).catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Erro desconhecido'
            toast.error(`Erro: ${message}`)
            return null
        })

        if (result?.error) {
            toast.error('Email ou senha inválidos')
        } else if (result) {
            toast.success('Login realizado!')
            router.refresh()
            router.push('/dashboard')
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
                <label htmlFor="email" className="font-pixel text-[7px] text-[#00ff41] block">
                    EMAIL
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <label htmlFor="password" className="font-pixel text-[7px] text-[#00ff41] block">
                    SENHA
                </label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={isLoading}
                        className="pr-10"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#00ff41] transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full font-pixel text-[10px] text-black bg-[#00ff41] h-12 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '4px 4px 0px #006b1a, 0 0 15px rgba(0,255,65,0.3)' }}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        ENTRANDO...
                    </>
                ) : (
                    '► ENTRAR'
                )}
            </button>
        </form>
    )
}
