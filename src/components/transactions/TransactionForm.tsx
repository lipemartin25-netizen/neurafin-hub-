'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, CreditCard, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function TransactionForm({ accounts, categories }) {
    const router = useRouter()
    const [type, setType] = useState('expense')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
    const [categoryId, setCategoryId] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')

    const [loading, setLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [suggestedCategory, setSuggestedCategory] = useState(null)

    // AI categorization logic with debounce
    useEffect(() => {
        if (description.length < 5) {
            setSuggestedCategory(null)
            return
        }

        const timer = setTimeout(async () => {
            setIsTyping(true)
            try {
                const availableCategories = categories.filter(c => c.type === type).map(c => c.name)
                const res = await fetch('/api/ai/categorize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactions: [{ description, amount: parseFloat(amount) || 0 }], availableCategories })
                })
                const text = await res.text()
                const data = JSON.parse(text)
                if (data && data[0]?.category) {
                    const match = categories.find(c => c.name === data[0].category)
                    if (match) {
                        setSuggestedCategory(match)
                        if (!categoryId) setCategoryId(match.id) // Auto select only if user hasn't picked one
                    }
                }
            } catch (e) {
                console.error('Categorization error', e)
            } finally {
                setIsTyping(false)
            }
        }, 1500)

        return () => clearTimeout(timer)
    }, [description, type, amount, categories, categoryId])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                throw new Error('Informe um valor válido maior que zero')
            }

            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    amount,
                    description,
                    account_id: accountId,
                    category_id: categoryId || (suggestedCategory?.id) || null,
                    date,
                    notes: notes || null
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao salvar transação')
            }

            toast.success('Transação registrada com sucesso!')
            router.push('/dashboard')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const selectedTypeColors = {
        expense: 'border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
        income: 'border-[#00F260]/50 bg-[#00F260]/10 text-[#00F260] shadow-[0_0_15px_rgba(0,242,96,0.2)]',
        transfer: 'border-[#F5A623]/50 bg-[#F5A623]/10 text-[#F5A623] shadow-[0_0_15px_rgba(245,166,35,0.2)]'
    }

    const filteredCategories = categories.filter(c => c.type === type)

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto align-top">
            {/* Transaction Type Tabs */}
            <div className="grid grid-cols-3 gap-3 bg-[#03050C] p-2 rounded-2xl border border-[#ffffff10] shadow-inner">
                {[
                    { id: 'expense', label: 'Despesa', icon: ArrowDownRight },
                    { id: 'income', label: 'Receita', icon: ArrowUpRight },
                    { id: 'transfer', label: 'Transferência', icon: ArrowLeftRight }
                ].map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => { setType(t.id); setCategoryId(''); }}
                        className={cn(
                            'flex gap-2 items-center justify-center py-3.5 rounded-xl text-sm font-semibold transition-all border border-transparent',
                            type === t.id ? selectedTypeColors[t.id] : 'text-[#8e9bb0] hover:bg-[#ffffff05] hover:border-[#ffffff0a] hover:text-white'
                        )}
                    >
                        <t.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {/* Amount */}
                <div className="glass-card p-8 text-center flex flex-col items-center">
                    <label className="block text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.2em] mb-4">Qual o Valor? (R$)</label>
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

                {/* Description & Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Descrição</label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Mercado Livre"
                            className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Data</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner dark:[color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Account and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Account */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1">Conta de Origem</label>
                        <select
                            required
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner appearance-none bg-no-repeat bg-[right_1rem_center]"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id} className="bg-[#03050C] text-white">
                                    {acc.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    {type !== 'transfer' && (
                        <div className="space-y-2">
                            <div className="flex items-end justify-between px-1">
                                <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em]">Categoria</label>
                                {isTyping ? (
                                    <span className="text-[10px] text-[#00F260] flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                        <Loader2 className="w-3 h-3 animate-spin" /> IA Processando
                                    </span>
                                ) : suggestedCategory ? (
                                    <span className="text-[10px] text-[#F5A623] flex items-center gap-1.5 animate-fade-in font-bold uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" /> IA Aplicada
                                    </span>
                                ) : null}
                            </div>
                            <select
                                required
                                value={categoryId || (suggestedCategory?.id ?? '')}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner appearance-none bg-no-repeat bg-[right_1rem_center]"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                            >
                                <option value="" disabled className="bg-[#03050C] text-muted-foreground">Selecionar Categoria...</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-[#03050C] text-white">
                                        {cat.icon} {cat.name} {suggestedCategory?.id === cat.id ? '✦ (Sugerido pela IA)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#8e9bb0] uppercase tracking-[0.1em] pl-1 flex justify-between items-center">
                        Detalhes Adicionais <span className="opacity-50">Opcional</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white placeholder-[#475569] outline-none focus:border-[#00F260] focus:ring-1 focus:ring-[#00F260] transition-all shadow-inner resize-none"
                        placeholder="Quilometragem, pessoa com quem dividiu, tags..."
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    {loading ? 'Processando a operação...' : 'Confirmar Transação'}
                </button>
                <p className="text-[11px] font-medium text-center text-[#64748b] flex items-center justify-center gap-1.5 mt-4 tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                    Assistente Neural IA integrado
                </p>
            </div>
        </form>
    )
}
