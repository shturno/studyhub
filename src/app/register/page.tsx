import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-space to-elevated p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text-hero mb-2">StudyHub</h1>
                    <p className="text-zinc-400">Crie sua conta e comece a estudar</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    )
}
