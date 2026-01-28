'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface LevelUpAnimationProps {
    show: boolean
    newLevel: number
    onComplete?: () => void
}

export function LevelUpAnimation({ show, newLevel, onComplete }: LevelUpAnimationProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (show) {
            setIsVisible(true)

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setIsVisible(false)
                onComplete?.()
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [show, onComplete])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.5, y: -50 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="bg-gradient-to-br from-xp-gold to-xp-glow p-12 rounded-2xl shadow-2xl text-center"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <Trophy className="h-24 w-24 mx-auto mb-6 text-white" />
                        </motion.div>

                        <h2 className="text-5xl font-bold text-white mb-2">
                            LEVEL UP!
                        </h2>

                        <div className="flex items-center justify-center gap-2 text-white/90">
                            <Sparkles className="h-6 w-6" />
                            <p className="text-3xl font-semibold">
                                Nível {newLevel}
                            </p>
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <p className="text-white/80 mt-4 text-lg">
                            Continue assim! 🎉
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
