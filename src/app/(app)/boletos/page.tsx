import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ReceiptText, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency, formatShortDate } from '@/lib/utils'

export default async function BoletosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: boletosRes } = await supabase
        .from('boletos')
        .select('*, categories(name)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

    const boletos = boletosRes ?? []

    const now = new Date()
    const todayDateStr = now.toISOString().split('T')[0]

    const pending = boletos.filter(b => b.status === 'pending')
    const paid = boletos.filter(b => b.status === 'paid')

    const overdue = pending.filter(b => b.due_date < todayDateStr)
    const dueToday = pending.filter(b => b.due_date === todayDateStr)
    const upcoming = pending.filter(b => b.due_date > todayDateStr)

    const pendingTotal = pending.reduce((s, b) => s + b.amount, 0)

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>DDA & Boletos</h1>
                    <p className="text-[#8e9bb0] text-sm mt-1 font-medium tracking-wide">Gestão centralizada de contas a pagar, faturas e PIX programado</p>
                </div>
                <Link href="/boletos/new">
                    <button className="btn-neural flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                        <Plus className="w-4 h-4" /> Novo Boleto
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="glass-card-hover p-6 col-span-1 md:col-span-2 border-l-4 border-l-[#00F260] flex flex-col justify-center bg-gradient-to-r from-[#03050C] to-[#011409]">
                    <p className="text-[11px] text-[#8e9bb0] uppercase font-bold tracking-[0.15em] mb-1">Total em Aberto</p>
                    <p className="text-4xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>{formatCurrency(pendingTotal)}</p>
                </div>
                <div className="glass-card-hover p-6 border-l-4 border-l-[#ef4444] bg-gradient-to-r from-[#03050C] to-[#1c0000]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] text-[#ef4444] uppercase font-bold tracking-[0.15em]">Vencidos</p>
                        <AlertCircle className="w-5 h-5 text-[#ef4444]" />
                    </div>
                    <p className="text-4xl font-bold text-[#ef4444] tracking-tight" style={{ fontFamily: 'Outfit' }}>{overdue.length}</p>
                </div>
                <div className="glass-card-hover p-6 border-l-4 border-l-[#F5A623] bg-gradient-to-r from-[#03050C] to-[#1a1100]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] text-[#F5A623] uppercase font-bold tracking-[0.15em]">Vence Hoje</p>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-pulse shadow-[0_0_10px_#F5A623]" />
                    </div>
                    <p className="text-4xl font-bold text-[#F5A623] tracking-tight" style={{ fontFamily: 'Outfit' }}>{dueToday.length}</p>
                </div>
            </div>

            {pending.length === 0 && paid.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[#ffffff10] rounded-3xl bg-[#ffffff02]">
                    <div className="w-20 h-20 rounded-3xl bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ReceiptText className="w-8 h-8 text-[#8e9bb0]" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Nenhuma Cobrança Encontrada</h3>
                    <p className="text-[#8e9bb0] text-[15px] mb-8 max-w-sm mx-auto">Adicione suas contas fixas mensais ou boletos avulsos (Luz, Água, Internet) e deixe nossa IA avisar as datas de vencimento.</p>
                    <Link href="/boletos/new">
                        <button className="btn-neural px-8 py-3.5 text-sm">Cadastrar Primeiro Boleto</button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Overdue */}
                    {overdue.length > 0 && (
                        <section>
                            <h2 className="text-[11px] font-bold text-[#ef4444] mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                                <AlertCircle className="w-4 h-4" /> Cobranças Vencidas
                            </h2>
                            <div className="space-y-4">
                                {overdue.map(b => <BoletoCard key={b.id} boleto={b} variant="danger" />)}
                            </div>
                        </section>
                    )}

                    {/* Due Today */}
                    {dueToday.length > 0 && (
                        <section>
                            <h2 className="text-[11px] font-bold text-[#F5A623] mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-pulse shadow-[0_0_10px_#F5A623]" /> Com Vencimento Hoje
                            </h2>
                            <div className="space-y-4">
                                {dueToday.map(b => <BoletoCard key={b.id} boleto={b} variant="warning" />)}
                            </div>
                        </section>
                    )}

                    {/* Upcoming */}
                    {upcoming.length > 0 && (
                        <section>
                            <h2 className="text-[11px] font-bold text-[#8e9bb0] mb-4 uppercase tracking-[0.2em]">Próximos Vencimentos</h2>
                            <div className="space-y-4">
                                {upcoming.map(b => <BoletoCard key={b.id} boleto={b} variant="neutral" />)}
                            </div>
                        </section>
                    )}

                    {/* Paid */}
                    {paid.length > 0 && (
                        <section className="pt-8 border-t border-[#ffffff10]">
                            <h2 className="text-[11px] font-bold text-[#64748b] mb-4 uppercase tracking-[0.2em]">Histórico de Pagamentos</h2>
                            <div className="space-y-4 opacity-50 hover:opacity-100 transition-opacity duration-300">
                                {paid.map(b => <BoletoCard key={b.id} boleto={b} variant="paid" />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
}

function BoletoCard({ boleto, variant }: { boleto: any, variant: 'danger' | 'warning' | 'neutral' | 'paid' }) {
    const isPaid = variant === 'paid'
    const colors = {
        danger: 'border-[#ef4444]/30 bg-[#ef4444]/5 hover:bg-[#ef4444]/10 hover:border-[#ef4444]/50',
        warning: 'border-[#F5A623]/30 bg-[#F5A623]/5 hover:bg-[#F5A623]/10 hover:border-[#F5A623]/50',
        neutral: 'border-[#ffffff10] bg-[#ffffff03] hover:bg-[#ffffff08] hover:border-[#ffffff20]',
        paid: 'border-[#00F260]/20 bg-[#00F260]/5',
    }

    return (
        <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-inner group ${colors[variant]}`}>
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${isPaid ? 'bg-[#00F260]/10 border-[#00F260]/20 text-[#00F260]' : 'bg-[#ffffff05] border-[#ffffff10] text-[#8e9bb0]'}`}>
                    {isPaid ? <CheckCircle className="w-6 h-6" /> : <ReceiptText className="w-6 h-6" />}
                </div>
                <div>
                    <p className={`text-base font-bold tracking-tight ${isPaid ? 'line-through text-[#64748b]' : 'text-white'}`} style={{ fontFamily: 'Outfit' }}>
                        {boleto.title}
                    </p>
                    <p className="text-[11px] font-semibold text-[#8e9bb0] mt-1 tracking-wide">
                        {boleto.recipient} <span className="text-[#ffffff20] mx-1">•</span> <span className="uppercase text-[#64748b] tracking-wider">{boleto.categories?.name ?? 'Geral'}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end md:gap-2">
                <p className={`text-xl font-bold tracking-tighter ${variant === 'danger' ? 'text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : isPaid ? 'text-[#00F260]' : 'text-white'}`} style={{ fontFamily: 'Outfit' }}>
                    {formatCurrency(boleto.amount)}
                </p>
                <div className="flex items-center gap-2">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-lg border flex items-center ${isPaid ? 'bg-[#00F260]/10 border-[#00F260]/20 text-[#00F260]' : variant === 'warning' ? 'bg-[#F5A623]/10 border-[#F5A623]/20 text-[#F5A623]' : variant === 'danger' ? 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]' : 'bg-[#03050C] border-[#ffffff10] text-[#8e9bb0]'}`}>
                        {isPaid ? 'Confirmado' : `Até ${formatShortDate(boleto.due_date)}`}
                    </p>
                </div>
            </div>
        </div>
    )
}
