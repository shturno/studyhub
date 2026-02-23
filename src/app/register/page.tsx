import { RegisterForm } from '@/features/auth/components/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#080010] flex items-center justify-center p-4 relative overflow-hidden">

            
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

            <div className="w-full max-w-sm relative z-10">

                
                <div className="text-center mb-10">
                    <div className="font-pixel text-[#00ff41] text-xl mb-1"
                        style={{ textShadow: '0 0 20px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4)' }}>
                        STUDY
                    </div>
                    <div className="font-pixel text-[#ff006e] text-xl mb-4"
                        style={{ textShadow: '0 0 20px rgba(255,0,110,0.8), 0 0 40px rgba(255,0,110,0.4)' }}>
                        HUB
                    </div>
                    <div className="font-pixel text-[8px] text-[#7f7f9f] tracking-widest">
                        CREATE ACCOUNT
                    </div>
                </div>

                
                <div className="p-6" style={{ border: '2px solid #ff006e', background: '#04000a', boxShadow: '6px 6px 0px #6b0030, 0 0 30px rgba(255,0,110,0.1)' }}>
                    <div className="font-pixel text-[8px] text-[#ff006e] mb-6 text-center">
                        ── NEW PLAYER ──
                    </div>
                    <RegisterForm />
                </div>

                
                <div className="text-center mt-6">
                    <span className="font-mono text-base text-[#7f7f9f]">Já tem conta? </span>
                    <Link href="/login" className="font-pixel text-[8px] text-[#ff006e] hover:text-[#00ff41] transition-colors">
                        LOGIN
                    </Link>
                </div>
            </div>
        </div>
    )
}
