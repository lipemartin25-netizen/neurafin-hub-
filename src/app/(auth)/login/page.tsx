'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff, Brain, Github, Chrome, ArrowLeft, ShieldCheck, Zap, Activity, CheckSquare } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    async function handleEmailLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const { error, data } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            window.location.href = '/dashboard'
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao fazer login'
            toast.error(msg === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : msg)
            setLoading(false)
        }
    }

    async function handleOAuth(provider: 'google' | 'github') {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) toast.error('Erro ao iniciar autenticação social')
    }

    return (
        <div className="min-h-screen flex overflow-hidden bg-[#03050C] text-white">
            {/* Split Layout: Left side Branding, Right side Form */}

            {/* Left Side Branding (Hidden on smaller screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center border-r border-white/5 p-12 overflow-hidden bg-[#050814]">
                {/* Background effects */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#00F260]/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-md animate-fade-in flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F5A623] to-[#d97706] shadow-[0_0_50px_rgba(245,166,35,0.3)] mb-8 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                        <Brain className="w-10 h-10 text-black" />
                    </div>

                    <h1 className="text-4xl lg:text-[44px] font-bold text-center mb-4 leading-tight tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        Neura<span className="text-[#F5A623]">Fin</span>
                    </h1>

                    <p className="text-[#8e9bb0] text-center text-lg mb-14 max-w-sm">
                        Tecnologia financeira de próxima geração.<br />Segura, inteligente e sofisticada.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-[#ffffff05] border border-[#ffffff0a] p-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center hover:bg-[#ffffff08] transition-colors">
                            <ShieldCheck className="w-5 h-5 text-[#F5A623] mb-2" />
                            <p className="font-bold text-white mb-0.5">256-bit</p>
                            <p className="text-[11px] text-[#8e9bb0] uppercase tracking-wider">Encriptação</p>
                        </div>
                        <div className="bg-[#ffffff05] border border-[#ffffff0a] p-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center hover:bg-[#ffffff08] transition-colors">
                            <Activity className="w-5 h-5 text-[#00F260] mb-2" />
                            <p className="font-bold text-white mb-0.5">99.99%</p>
                            <p className="text-[11px] text-[#8e9bb0] uppercase tracking-wider">Uptime</p>
                        </div>
                        <div className="bg-[#ffffff05] border border-[#ffffff0a] p-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center hover:bg-[#ffffff08] transition-colors">
                            <Zap className="w-5 h-5 text-blue-400 mb-2" />
                            <p className="font-bold text-white mb-0.5">&lt; 50ms</p>
                            <p className="text-[11px] text-[#8e9bb0] uppercase tracking-wider">Latência IA</p>
                        </div>
                        <div className="bg-[#ffffff05] border border-[#ffffff0a] p-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center hover:bg-[#ffffff08] transition-colors">
                            <CheckSquare className="w-5 h-5 text-purple-400 mb-2" />
                            <p className="font-bold text-white mb-0.5">OpenF</p>
                            <p className="text-[11px] text-[#8e9bb0] uppercase tracking-wider">Compliance API</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10 shadow-2xl">
                <div className="w-full max-w-[400px] animate-slide-in">

                    <Link href="/" className="inline-flex items-center gap-2 text-[#8e9bb0] hover:text-white transition-colors mb-12 text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar
                    </Link>

                    <h2 className="text-[32px] font-bold text-white mb-2 leading-tight" style={{ fontFamily: 'Outfit' }}>
                        Bem-vindo de volta
                    </h2>
                    <p className="text-[#8e9bb0] mb-10 text-base">
                        Entre para acessar seu dashboard
                    </p>

                    <div className="space-y-4 mb-8">
                        <button
                            onClick={() => handleOAuth('google')}
                            className="w-full group relative flex items-center justify-center gap-3 px-5 py-3.5 bg-transparent border border-[#ffffff15] rounded-xl text-sm font-semibold hover:bg-white/[0.03] transition-all overflow-hidden"
                        >
                            <Chrome className="w-4 h-4 text-[#8e9bb0] group-hover:text-white transition-colors" />
                            <span className="text-[#e2e8f0]">Continuar com Google</span>
                        </button>
                        <button
                            onClick={() => handleOAuth('github')}
                            className="w-full group relative flex items-center justify-center gap-3 px-5 py-3.5 bg-transparent border border-[#ffffff15] rounded-xl text-sm font-semibold hover:bg-white/[0.03] transition-all"
                        >
                            <Github className="w-4 h-4 text-[#8e9bb0] group-hover:text-white transition-colors" />
                            <span className="text-[#e2e8f0]">Continuar com GitHub</span>
                        </button>
                    </div>

                    <div className="relative mb-8 text-center flex items-center">
                        <div className="flex-1 border-t border-[#ffffff15]" />
                        <span className="px-4 text-xs font-medium text-[#64748b] tracking-wider uppercase">ou</span>
                        <div className="flex-1 border-t border-[#ffffff15]" />
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#e2e8f0]">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#e2e8f0]">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all pr-12 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div className="text-sm text-transparent" />
                            <Link href="/forgot-password" className="text-sm text-[#F5A623] hover:text-[#d97706] transition-colors font-medium">
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#F5A623] to-[#F59E0B] hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : null}
                            {loading ? 'Autenticando...' : 'Entrar'}
                        </button>
                    </form>

                    <p className="text-center text-[#8e9bb0] mt-10">
                        Não tem conta?{' '}
                        <Link href="/register" className="text-white hover:text-[#F5A623] font-semibold transition-colors">
                            Criar conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
