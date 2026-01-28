import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// ADHD-Focused Semantic Colors
				brand: {
					primary: 'hsl(262, 83%, 58%)',      // Roxo vibrante (foco, energia)
					secondary: 'hsl(217, 91%, 60%)',    // Azul (calma, confiança)
				},
				state: {
					success: 'hsl(142, 76%, 36%)',      // Verde (conquista)
					warning: 'hsl(38, 92%, 50%)',       // Laranja (atenção)
					error: 'hsl(0, 84%, 60%)',          // Vermelho (erro)
				},
				xp: {
					gold: 'hsl(45, 100%, 51%)',         // Dourado (XP, recompensa)
					glow: 'hsl(45, 100%, 70%)',         // Brilho de XP
				},
				focus: {
					mode: 'hsl(220, 13%, 13%)',         // Fundo escuro para modo foco
					highlight: 'hsl(262, 83%, 58%)',    // Destaque no modo foco
				},
				// Neon Study Lab - Extended Colors
				'deep-space': '#0A0E27',
				'elevated': '#141B3D',
				'neon-purple': '#8B5CF6',
				'neon-cyan': '#06B6D4',
				'neon-gold': '#F59E0B',
				'neon-green': '#10B981',
			},
			backgroundImage: {
				'gradient-hero': 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
				'gradient-xp': 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
				'gradient-card': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
			},
			boxShadow: {
				'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
				'glow-gold': '0 0 20px rgba(245, 158, 11, 0.5)',
				'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
				'glow-purple-lg': '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
				'glow-gold-lg': '0 0 30px rgba(245, 158, 11, 0.6), 0 0 60px rgba(245, 158, 11, 0.3)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
