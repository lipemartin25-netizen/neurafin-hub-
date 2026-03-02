'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReceiptText, Loader2, Calendar, FileText, QrCode } from 'lucide-react'
import { toast } from 'sonner'

export default function BoletoForm({ categories }: { categories: any[] }) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [barcode, setBarcode] = useState('')
    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            if (!title || !recipient) throw new Error('Título e Beneficiário são obrigatórios')
            if (!amount || parseFloat(amount) <= 0) throw new Error('Valor inválido')
            if (!dueDate) throw new Error('Data de vencimento é obrigatória')

            const payload = {
                title,
                recipient,
                amount: parseFloat(amount),
                due_date: dueDate,
                barcode: barcode || null,
                category_id: categoryId || null,
                status: 'pending'
            }

            const res = await fetch('/api/boletos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao registrar boleto')
            }

            toast.success('Boleto cadastrado! Avisaremos perto do vencimento. 📨')
            router.push('/boletos')
            router.refresh()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto align-top">
            <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[#00F260]" /> Nome da Conta <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner font-bold placeholder:font-normal placeholder:opacity-50"
                            placeholder="Ex: Conta de Luz (Abril)"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                            Emissor / Beneficiário <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner placeholder:font-normal placeholder:opacity-50"
                            placeholder="Ex: Enel S/A, Banco Inter"
                        />
                    </div>
                </div>

                {/* Due Date & Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4 border-y border-[#ffffff10]">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#F5A623] uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Vencimento <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-[#03050C] border border-[#F5A623]/30 text-[#F5A623] outline-none focus:border-[#F5A623] focus:shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-all shadow-inner font-bold dark:[color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#00F260] uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                            Valor do Boleto (R$) <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-[#03050C] border border-[#00F260]/30 text-white outline-none focus:border-[#00F260] focus:shadow-[0_0_15px_rgba(0,242,96,0.2)] transition-all shadow-inner font-mono font-bold text-xl tracking-tight placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:opacity-50"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Category & Barcode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Categoria (Relatórios)</label>
                        <div className="relative">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner appearance-none cursor-pointer pr-10"
                            >
                                <option value="" disabled className="bg-[#03050C] text-[#8e9bb0]">Selecione uma categoria...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-[#03050C] text-white my-1">
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#8e9bb0]">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                            <QrCode className="w-3.5 h-3.5" /> Código de Barras / PIX
                        </label>
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner text-xs font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:opacity-50"
                            placeholder="Cole o código aqui..."
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-black font-bold text-base transition-all bg-gradient-to-r from-[#00F260] to-[#10B981] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ReceiptText className="w-5 h-5" />}
                    {loading ? 'Processando...' : 'Lançar Boleto no Sistema'}
                </button>
            </div>
        </form>
    )
}
