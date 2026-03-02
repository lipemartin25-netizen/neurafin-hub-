import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Activity, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import type { TransactionWithCategory } from '@/types/database'

export default async function TransactionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color), accounts(id, name, type, color)')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .order('date', { ascending: false })
        .limit(50)

    const txs = (transactions ?? []) as unknown as TransactionWithCategory[]
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    // Group by date
    const grouped: Record<string, TransactionWithCategory[]> = {}
    for (const tx of txs) {
        if (!grouped[tx.date]) grouped[tx.date] = []
        grouped[tx.date].push(tx)
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        Transações
                    </h1>
                    <p className="text-[#8e9bb0] text-sm mt-1 font-medium tracking-wide">
                        {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </p>
                </div>
                <Link href="/transactions/new">
                    <button className="btn-neural flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </button>
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#00F260]/10 flex items-center justify-center border border-[#00F260]/20">
                        <TrendingUp className="w-5 h-5 text-[#00F260]" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Receitas</p>
                    <p className="text-[28px] font-bold text-[#00F260] tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(totalIncome)}</p>
                </div>

                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center border border-red-500/20">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Despesas</p>
                    <p className="text-[28px] font-bold text-red-400 tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(totalExpense)}</p>
                </div>

                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F5A623] to-[#F59E0B] flex items-center justify-center shadow-[0_0_15px_rgba(245,166,35,0.4)]">
                        <Wallet className="w-5 h-5 text-black" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Saldo Mensal</p>
                    <p className={`text-[28px] font-bold tracking-tight ${(totalIncome - totalExpense) >= 0 ? 'text-white' : 'text-red-400'}`} style={{ fontFamily: 'Outfit' }}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </p>
                </div>
            </div>

            {/* Transaction list grouped by date */}
            {Object.keys(grouped).length === 0 ? (
                <div className="glass-card p-16 text-center border border-dashed border-[#ffffff10] rounded-3xl">
                    <div className="w-20 h-20 rounded-3xl bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Activity className="w-8 h-8 text-[#8e9bb0]" />
                    </div>
                    <p className="text-xl text-white font-bold mb-2 tracking-tight" style={{ fontFamily: 'Outfit' }}>Nenhuma movimentação</p>
                    <p className="text-[#8e9bb0] text-[15px] mb-8 max-w-sm mx-auto">Comece a registrar suas transações para obter inteligência financeira.</p>
                    <Link href="/transactions/new">
                        <button className="btn-neural px-8 py-3.5 text-sm">Registrar Atividade</button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, txList]) => (
                        <div key={date}>
                            <p className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-4">
                                <span>{formatDate(date)}</span>
                                <span className="flex-1 h-px bg-[#ffffff0a]"></span>
                            </p>
                            <div className="glass-card overflow-hidden">
                                {txList.map((tx, idx) => (
                                    <div key={tx.id} className={`flex items-center gap-4 p-4 hover:bg-[#ffffff05] transition-colors group ${idx !== txList.length - 1 ? 'border-b border-[#ffffff0a]' : ''}`}>
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                                            style={{ background: `${tx.categories?.color ?? '#00F260'}15`, border: `1px solid ${tx.categories?.color ?? '#00F260'}30` }}
                                        >
                                            {tx.categories?.icon ?? '💳'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-semibold text-white truncate group-hover:text-[#00F260] transition-colors">{tx.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {tx.categories && (
                                                    <span className="text-[13px] text-[#8e9bb0]">{tx.categories.name}</span>
                                                )}
                                                {tx.accounts && (
                                                    <>
                                                        <span className="text-[#8e9bb0]/30">•</span>
                                                        <span className="text-[13px] text-[#8e9bb0] font-medium">{tx.accounts.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {tx.type === 'income' ? (
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00F260]" />
                                                ) : tx.type === 'expense' ? (
                                                    <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                                ) : (
                                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#F5A623]" />
                                                )}
                                                <span className={`text-[15px] font-bold ${tx.type === 'income' ? 'text-[#00F260]' :
                                                    tx.type === 'expense' ? 'text-white' : 'text-[#F5A623]'
                                                    }`}>
                                                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                    {formatCurrency(tx.amount)}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-[#64748b] font-medium uppercase mt-1">
                                                {tx.type === 'income' ? 'Receita' : tx.type === 'expense' ? 'Despesa' : 'Transferência'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
