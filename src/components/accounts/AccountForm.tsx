'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, CreditCard, Landmark, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ACCOUNT_TYPES = [
    { id: 'checking', label: 'Conta Corrente', icon: Wallet },
    { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'savings', label: 'Conta Poupança', icon: Landmark },
    { id: 'investment', label: 'Investimento', icon: Landmark },
    { id: 'cash', label: 'Dinheiro', icon: Wallet }
]

const BRAND_COLORS = [
    { id: 'roxo', value: '#6366f1' }, // Nubank/Neon
    { id: 'laranja', value: '#f97316' }, // Inter
    { id: 'amarelo', value: '#eab308' }, // Will/BB
    { id: 'verde', value: '#10b981' }, // Sicredi/PicPay
    { id: 'azul', value: '#3b82f6' }, // Caixa/BB
    { id: 'vermelho', value: '#ef4444' }, // Bradesco/Santander
    { id: 'grafite', value: '#4b5563' } // C6/Platinum
]

export default function AccountForm() {
    const router = useRouter()
    const [type, setType] = useState('checking')
    const [name, setName] = useState('')
    const [balance, setBalance] = useState('')
    const [color, setColor] = useState(BRAND_COLORS[0].value)
    const [creditLimit, setCreditLimit] = useState('')
    const [closingDay, setClosingDay] = useState('')
    const [dueDay, setDueDay] = useState('')
    const [includeInTotal, setIncludeInTotal] = useState(true)

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            if (!name) throw new Error('O nome da conta é obrigatório')
            if (type === 'credit_card' && (!creditLimit || !closingDay || !dueDay)) {
                throw new Error('Preencha os dados do cartão de crédito (limite, fechamento e vencimento)')
            }

            const payload = {
                name,
                type,
                color,
                balance: parseFloat(balance) || 0,
                include_in_total: includeInTotal,
                ...(type === 'credit_card' ? {
                    credit_limit: parseFloat(creditLimit),
                    closing_day: parseInt(closingDay),
                    due_day: parseInt(dueDay)
                } : {})
            }

            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao criar conta')
            }

            toast.success('Conta criada com sucesso!')
            router.push('/accounts')
            router.refresh()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto align-top">
            {/* Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-[#03050C] p-2 rounded-2xl border border-[#ffffff10] shadow-inner">
                {ACCOUNT_TYPES.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={cn(
                            'flex gap-2 flex-col items-center justify-center p-3.5 rounded-xl text-sm font-semibold transition-all border border-transparent',
                            type === t.id
                                ? 'bg-[#00F260]/10 border-[#00F260]/50 text-[#00F260] shadow-[0_0_15px_rgba(0,242,96,0.2)]'
                                : 'text-[#8e9bb0] hover:bg-[#ffffff05] hover:border-[#ffffff0a] hover:text-white'
                        )}
                    >
                        <t.icon className="w-5 h-5" />
                        <span className="text-[9px] uppercase font-bold tracking-[0.1em] text-center">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Nome da Conta / Cartão</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={type === 'credit_card' ? 'Ex: Nubank, Mastercard Black' : 'Ex: Iti, BB Corrente'}
                            className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1 mb-1">Cor de Identificação</label>
                        <div className="flex bg-[#03050C] p-3 rounded-xl justify-between border border-[#ffffff10] shadow-inner items-center flex-1">
                            {BRAND_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={cn(
                                        'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                                        color === c.value ? 'scale-125 border-white shadow-[0_0_15px_#ffffff]' : 'border-transparent opacity-50'
                                    )}
                                    style={{ backgroundColor: c.value }}
                                    title={c.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Balance / Limit depending on type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">
                            {type === 'credit_card' ? 'Fatura Atual (R$)' : 'Saldo Atual (R$)'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner font-bold text-lg"
                        />
                    </div>

                    {type === 'credit_card' && (
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Limite Total (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required={type === 'credit_card'}
                                value={creditLimit}
                                onChange={(e) => setCreditLimit(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-[#F5A623] placeholder-[#475569] outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all shadow-inner font-bold text-lg"
                            />
                        </div>
                    )}
                </div>

                {type === 'credit_card' && (
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Dia de Fechamento</label>
                            <input
                                type="number"
                                min="1" max="31"
                                required
                                value={closingDay}
                                onChange={(e) => setClosingDay(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner"
                                placeholder="Ex: 5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Dia de Vencimento</label>
                            <input
                                type="number"
                                min="1" max="31"
                                required
                                value={dueDay}
                                onChange={(e) => setDueDay(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner"
                                placeholder="Ex: 12"
                            />
                        </div>
                    </div>
                )}

                {/* Options */}
                <div className="flex items-center gap-4 bg-[#ffffff05] p-5 rounded-2xl border border-[#ffffff10] shadow-inner mt-4">
                    <input
                        type="checkbox"
                        id="includeTotal"
                        checked={includeInTotal}
                        onChange={(e) => setIncludeInTotal(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-[#00F260]"
                    />
                    <div className="flex flex-col">
                        <label htmlFor="includeTotal" className="text-sm font-bold text-white cursor-pointer tracking-wider">
                            Incluir no Saldo Consolidado
                        </label>
                        <p className="text-[11px] text-[#8e9bb0] mt-1 pr-4">Se desmarcado, o saldo ou a fatura não somará ao seu patrimônio líquido total exibido no dashboard principal.</p>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                    {loading ? 'Processando a operação...' : 'Confirmar Vínculo da Conta'}
                </button>
            </div>
        </form>
    )
}
