'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const EMOJIS = ['🏖️', '🚗', '🏡', '🎓', '🏥', '🎉', '💍', '💼', '💻', '💎']
const COLORS = [
    '#00F260', // Emerald Neon
    '#F5A623', // Gold
    '#f43f5e', // Rose
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#06b6d4'  // Cyan
]

export default function GoalForm() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [targetAmount, setTargetAmount] = useState('')
    const [currentAmount, setCurrentAmount] = useState('')
    const [targetDate, setTargetDate] = useState('')
    const [monthlyContribution, setMonthlyContribution] = useState('')

    const [icon, setIcon] = useState(EMOJIS[0])
    const [color, setColor] = useState(COLORS[0])

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            if (!name) throw new Error('Dê um nome ao seu sonho')
            if (!targetAmount || parseFloat(targetAmount) <= 0) {
                throw new Error('O valor alvo da meta precisa ser maior que zero')
            }

            const payload = {
                name,
                target_amount: parseFloat(targetAmount),
                current_amount: currentAmount ? parseFloat(currentAmount) : 0,
                target_date: targetDate || null,
                monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : null,
                icon,
                color
            }

            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao salvar meta')
            }

            toast.success('Objetivo criado com sucesso! 🚀')
            router.push('/goals')
            router.refresh()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto align-top">
            {/* Icon and Color picker */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 w-full overflow-hidden bg-[#03050C] p-4 rounded-2xl border border-[#ffffff10] shadow-inner">
                    <label className="block text-[10px] font-bold text-[#8e9bb0] uppercase tracking-[0.2em] mb-3 text-center">
                        Ícone Expresso
                    </label>
                    <div className="flex overflow-x-auto scrollbar-none gap-2 pb-1 justify-center md:justify-start">
                        {EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setIcon(emoji)}
                                className={cn(
                                    'w-10 h-10 rounded-xl shrink-0 text-2xl flex items-center justify-center transition-all border border-transparent',
                                    icon === emoji ? 'bg-[#ffffff10] !scale-110 shadow-lg border-[#ffffff20]' : 'hover:bg-[#ffffff05] opacity-50 hover:opacity-100 hover:scale-105'
                                )}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full overflow-hidden bg-[#03050C] p-4 rounded-2xl border border-[#ffffff10] shadow-inner">
                    <label className="block text-[10px] font-bold text-[#8e9bb0] uppercase tracking-[0.2em] mb-3 text-center">
                        Cor Temática
                    </label>
                    <div className="flex overflow-x-auto scrollbar-none gap-3 pb-1 justify-center md:justify-start items-center h-10">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={cn(
                                    'w-7 h-7 rounded-full shrink-0 border-2 transition-all',
                                    color === c ? 'scale-125 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">
                        O que você quer alcançar?
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[var(--theme-color)] transition-all shadow-inner text-lg font-medium placeholder:font-normal placeholder:opacity-50"
                        placeholder="Ex: Viagem para o Japão 🇯🇵, Ferrari 🏎️"
                        style={{ '--theme-color': color } as React.CSSProperties}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">
                            Valor Total (R$) <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[var(--theme-color)] transition-all shadow-inner text-2xl font-bold font-mono tracking-tighter placeholder:font-sans placeholder:tracking-normal placeholder:text-xl placeholder:opacity-50"
                            placeholder="0.00"
                            style={{ '--theme-color': color } as React.CSSProperties}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">
                            Já Tenho Guardado (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={currentAmount}
                            onChange={(e) => setCurrentAmount(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[var(--theme-color)] transition-all shadow-inner font-mono text-lg pt-[1.125rem]"
                            placeholder="0.00"
                            style={{ '--theme-color': color } as React.CSSProperties}
                        />
                    </div>
                </div>

                <div className="bg-[#ffffff05] p-6 rounded-2xl border border-[#ffffff10] space-y-5 mt-6 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full opacity-50" style={{ backgroundColor: color }} />
                    <div className="flex items-center gap-2 pl-2">
                        <Calendar className="w-5 h-5" style={{ color }} />
                        <h3 className="font-bold text-white tracking-wide" style={{ fontFamily: 'Outfit' }}>Acelerador / Planejamento</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-2">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em]">Data Alvo (Ideia)</label>
                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl bg-[#03050C] border border-[#ffffff10] text-[#8e9bb0] outline-none focus:border-[var(--theme-color)] transition-all shadow-inner dark:[color-scheme:dark]"
                                style={{ '--theme-color': color } as React.CSSProperties}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em]">Aporte Fixo Mensal (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl bg-[#03050C] border border-[#ffffff10] text-white outline-none focus:border-[var(--theme-color)] transition-all shadow-inner"
                                placeholder="0.00"
                                style={{ '--theme-color': color } as React.CSSProperties}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                    {loading ? 'Calculando rotas...' : 'Lançar Novo Objetivo'}
                </button>
            </div>
        </form>
    )
}
