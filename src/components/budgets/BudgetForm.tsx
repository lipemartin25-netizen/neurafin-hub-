'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PiggyBank, Loader2, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function BudgetForm({ categories }: { categories: any[] }) {
    const router = useRouter()
    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
    const [amount, setAmount] = useState('')
    const [alertThreshold, setAlertThreshold] = useState(80) // 80% default
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            if (!categoryId) throw new Error('Selecione uma categoria')
            if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                throw new Error('Informe um valor limite válido maior que zero')
            }

            const res = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_id: categoryId,
                    amount: parseFloat(amount),
                    alert_threshold: alertThreshold,
                    period: 'monthly'
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao criar orçamento')
            }

            toast.success('Meta salva com sucesso!')
            router.push('/budgets')
            router.refresh()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto align-top">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Categoria do Gasto</label>
                    <select
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner appearance-none bg-no-repeat bg-[right_1rem_center]"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#03050C] text-white">
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="glass-card p-8 text-center flex flex-col items-center">
                    <label className="block text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.2em] mb-4">
                        Limite Máximo Mensal (R$)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full max-w-[300px] text-center text-5xl bg-transparent border-b-2 border-[#ffffff15] focus:border-[#00F260] outline-none py-3 text-white transition-all placeholder:text-[#ffffff1a] font-bold tracking-tighter"
                        placeholder="0.00"
                        style={{ fontFamily: 'Outfit' }}
                    />
                </div>

                <div className="bg-[#1a1100] border border-[#F5A623]/30 p-6 rounded-2xl space-y-4 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#F5A623] shadow-[0_0_15px_#F5A623]" />
                    <div className="flex justify-between items-center pl-2">
                        <label className="text-sm font-bold flex items-center gap-2 text-[#F5A623] tracking-wide uppercase">
                            <BellRing className="w-4 h-4" /> Alerta de Consumo
                        </label>
                        <span className="text-[#F5A623] font-bold text-xl" style={{ fontFamily: 'Outfit' }}>{alertThreshold}%</span>
                    </div>

                    <div className="pl-2">
                        <input
                            type="range"
                            min="50"
                            max="100"
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#F5A623] mb-4"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(245,166,35,0.5))' }}
                        />
                        <p className="text-[11px] text-[#F5A623]/70 font-medium">
                            Você será notificado e o painel piscará em alerta quando seus gastos nesta categoria atingirem <strong className="text-[#F5A623]">{alertThreshold}%</strong> do limite estipulado.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PiggyBank className="w-5 h-5" />}
                    {loading ? 'Processando...' : 'Ativar Meta Inteligente'}
                </button>
            </div>
        </form>
    )
}
