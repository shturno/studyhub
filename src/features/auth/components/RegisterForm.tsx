'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function RegisterForm() {
    const router = useRouter()
    const t = useTranslations('RegisterForm')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error(t('passwordsDoNotMatch'))
            return
        }
        if (formData.password.length < 6) {
            toast.error(t('passwordTooShort'))
            return
        }

        setIsLoading(true)

        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
        })
            .then(async (response) => {
                const data = await response.json() as { error?: string }
                if (!response.ok) {
                    toast.error(data.error ?? t('accountCreationError'))
                } else {
                    toast.success(t('accountCreationSuccess'))
                    router.push('/login')
                }
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : t('unknownError')
                toast.error(`${t('errorPrefix')} ${message}`)
            })

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
                <label htmlFor="name" className="font-pixel text-[7px] text-[#ff006e] block">{t('nameLabel')}</label>
                <Input id="name" type="text" placeholder={t('namePlaceholder')} value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading} autoComplete="name"
                    style={{ borderColor: 'rgba(255,0,110,0.4)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#ff006e' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,0,110,0.4)' }}
                />
            </div>

            
            <div className="space-y-2">
                <label htmlFor="email" className="font-pixel text-[7px] text-[#ff006e] block">{t('emailLabel')}</label>
                <Input id="email" type="email" placeholder="seu@email.com" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required disabled={isLoading} autoComplete="email"
                    style={{ borderColor: 'rgba(255,0,110,0.4)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#ff006e' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,0,110,0.4)' }}
                />
            </div>

            
            <div className="space-y-2">
                <label htmlFor="password" className="font-pixel text-[7px] text-[#ff006e] block">{t('passwordLabel')}</label>
                <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required disabled={isLoading} className="pr-10" autoComplete="new-password"
                        style={{ borderColor: 'rgba(255,0,110,0.4)' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#ff006e' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,0,110,0.4)' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#ff006e] transition-colors"
                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            
            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="font-pixel text-[7px] text-[#ff006e] block">{t('confirmPasswordLabel')}</label>
                <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                        value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required disabled={isLoading} className="pr-10" autoComplete="new-password"
                        style={{ borderColor: 'rgba(255,0,110,0.4)' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#ff006e' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,0,110,0.4)' }}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#ff006e] transition-colors"
                        aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            
            <button type="submit" disabled={isLoading}
                className="w-full font-pixel text-[10px] text-black bg-[#ff006e] h-12 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '4px 4px 0px #6b0030, 0 0 15px rgba(255,0,110,0.3)' }}>
                {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t('creating')}</>
                ) : t('submit')}
            </button>
        </form>
    )
}
