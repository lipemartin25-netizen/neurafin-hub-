'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Brain, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck, Zap, Activity, CheckSquare } from 'lucide-react'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const supabase = createClient()

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (password.length < 8) {
            toast.error('A senha deve ter pelo menos 8 caracteres')
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
            setDone(true)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao criar conta'
            toast.error(msg)
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#03050C] text-white overflow-hidden relative">
                {/* Background effects */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#00F260]/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-md animate-fade-in text-center relative z-10">
                    <div className="bg-[#ffffff05] border border-[#ffffff0a] p-12 rounded-3xl backdrop-blur-xl shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-tr from-[#00F260] to-[#10B981] rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,96,0.3)]">
                            <CheckCircle2 className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-[28px] font-bold text-white mb-3" style={{ fontFamily: 'Outfit' }}>Verifique seu e-mail</h2>
                        <p className="text-[#8e9bb0] text-base mb-10 leading-relaxed">
                            Enviamos um link de confirmação seguro para<br />
                            <strong className="text-white font-semibold">{email}</strong>.
                            <br /><br />
                            Acesse sua caixa de entrada e clique no link para ativar sua conta NeuraFin.
                        </p>
                        <Link href="/login" className="w-full py-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] flex items-center justify-center">
                            Voltar ao Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex overflow-hidden bg-[#03050C] text-white">
            {/* Split Layout: Left side Branding, Right side Form */}

            {/* Left Side Branding (Hidden on smaller screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center border-r border-white/5 p-12 overflow-hidden bg-[#050814]">
                {/* Background effects */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#00F260]/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-md animate-fade-in flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00F260] to-[#059669] shadow-[0_0_50px_rgba(0,242,96,0.3)] mb-8 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                        <Brain className="w-10 h-10 text-black" />
                    </div>

                    <h1 className="text-4xl lg:text-[44px] font-bold text-center mb-4 leading-tight tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        Comece Agora
                    </h1>

                    <p className="text-[#8e9bb0] text-center text-lg mb-14 max-w-sm">
                        Junte-se à elite financeira global.<br />Inteligência artificial ao seu favor.
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

            {/* Right Side Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10 shadow-2xl overflow-y-auto scrollbar-none">
                <div className="w-full max-w-[400px] animate-slide-in py-8">

                    <Link href="/" className="inline-flex items-center gap-2 text-[#8e9bb0] hover:text-white transition-colors mb-12 text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar
                    </Link>

                    <h2 className="text-[32px] font-bold text-white mb-2 leading-tight" style={{ fontFamily: 'Outfit' }}>
                        Criar conta grátis
                    </h2>
                    <p className="text-[#8e9bb0] mb-10 text-base">
                        Preencha os dados para iniciar sua jornada
                    </p>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#e2e8f0]">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="João Silva"
                                required
                                className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#e2e8f0]">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#e2e8f0]">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all pr-12 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {password.length > 0 && (
                                <div className="mt-3 flex gap-1.5 px-1 py-1">
                                    {[...Array(4)].map((_, i) => {
                                        let bgClass = "bg-[#ffffff15]"
                                        if (password.length >= (i + 1) * 2) {
                                            if (i < 2) bgClass = "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                                            else if (i < 3) bgClass = "bg-[#F5A623] shadow-[0_0_10px_rgba(245,166,35,0.5)]"
                                            else bgClass = "bg-[#00F260] shadow-[0_0_10px_rgba(0,242,96,0.5)]"
                                        }
                                        return (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${bgClass}`}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-[#64748b] mt-4 leading-relaxed">
                            Ao criar uma conta você concorda com nossos{' '}
                            <Link href="/terms" className="text-[#00F260] hover:underline font-medium">Termos de Uso</Link> e{' '}
                            <Link href="/privacy" className="text-[#00F260] hover:underline font-medium">Política de Privacidade</Link>.
                        </p>

                        <button
                            type="submit"
                            disabled={loading || password.length < 8}
                            className="w-full py-4 mt-6 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : null}
                            {loading ? 'Processando...' : 'Criar conta gratuita'}
                        </button>
                    </form>

                    <p className="text-center text-[#8e9bb0] mt-10">
                        Já tem conta?{' '}
                        <Link href="/login" className="text-white hover:text-[#00F260] font-semibold transition-colors">
                            Entrar na sua conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
