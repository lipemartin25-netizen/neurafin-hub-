import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, PiggyBank, AlertTriangle, Wallet } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

export default async function BudgetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [budgetsRes, transactionsRes] = await Promise.all([
        supabase.from('budgets').select('*, categories(id, name, color, icon)').eq('user_id', user.id).eq('period', 'monthly'),
        supabase.from('transactions').select('amount, category_id').eq('user_id', user.id).eq('type', 'expense').gte('date', firstDay).lte('date', lastDay)
    ])

    const budgets = budgetsRes.data ?? []
    const txs = transactionsRes.data ?? []

    // Add spent to each budget
    const budgetsWithSpending = budgets.map(budget => {
        const spent = txs.filter(t => t.category_id === budget.category_id).reduce((s, t) => s + t.amount, 0)
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        return { ...budget, spent, percentage }
    }).sort((a, b) => b.percentage - a.percentage)

    const overBudgets = budgetsWithSpending.filter(b => b.percentage >= 100).length
    const warningBudgets = budgetsWithSpending.filter(b => b.percentage >= b.alert_threshold && b.percentage < 100).length

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Minhas Metas</h1>
                    <p className="text-[#8e9bb0] text-sm mt-1 font-medium tracking-wide">Controle avançado de gastos mensais por categoria</p>
                </div>
                <Link href="/budgets/new">
                    <button className="btn-neural flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                        <Plus className="w-4 h-4" /> Nova Meta de Gasto
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-card-hover p-6 border-l-4 border-l-[#00F260] bg-gradient-to-r from-[#03050C] to-[#011409]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] text-[#8e9bb0] uppercase font-bold tracking-[0.15em]">Metas Ativas</p>
                        <Wallet className="w-5 h-5 text-[#00F260]" />
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>{budgets.length}</p>
                </div>
                <div className="glass-card-hover p-6 border-l-4 border-l-[#F5A623] bg-gradient-to-r from-[#03050C] to-[#1a1100]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] text-[#8e9bb0] uppercase font-bold tracking-[0.15em]">Em Alerta</p>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-pulse shadow-[0_0_10px_#F5A623]" />
                    </div>
                    <p className="text-4xl font-bold text-[#F5A623] tracking-tight" style={{ fontFamily: 'Outfit' }}>{warningBudgets}</p>
                </div>
                <div className="glass-card-hover p-6 border-l-4 border-l-[#ef4444] bg-gradient-to-r from-[#03050C] to-[#1c0000]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] text-[#8e9bb0] uppercase font-bold tracking-[0.15em]">Estourados</p>
                        <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                    </div>
                    <p className="text-4xl font-bold text-[#ef4444] tracking-tight" style={{ fontFamily: 'Outfit' }}>{overBudgets}</p>
                </div>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-8 tracking-tight" style={{ fontFamily: 'Outfit' }}>Progresso Mensal</h2>

                {budgetsWithSpending.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[#ffffff10] rounded-3xl bg-[#ffffff02]">
                        <div className="w-20 h-20 rounded-3xl bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <PiggyBank className="w-8 h-8 text-[#8e9bb0]" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Sem Metas Definidas</h3>
                        <p className="text-[#8e9bb0] text-[15px] mb-8 max-w-sm mx-auto">Adicione limites para suas categorias (Mercado, Lazer, etc) e a IA vai avisar quando você estiver perto do limite.</p>
                        <Link href="/budgets/new">
                            <button className="btn-neural px-8 py-3.5 text-sm">Criar Primeira Meta</button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgetsWithSpending.map(budget => {
                            const cat = budget.categories as any
                            const isDanger = budget.percentage >= 100
                            const isWarning = budget.percentage >= budget.alert_threshold && !isDanger
                            const ringColor = isDanger ? '#ef4444' : isWarning ? '#F5A623' : '#00F260' // (cat?.color ?? '#00F260')
                            const fillPct = Math.min(budget.percentage, 100)

                            return (
                                <div key={budget.id} className="relative p-6 rounded-3xl border border-[#ffffff0a] bg-[#ffffff03] flex flex-col items-center group hover:bg-[#ffffff08] hover:border-[#ffffff15] transition-all shadow-inner">
                                    <div className="absolute top-4 right-4">
                                        {isDanger && <AlertTriangle className="w-5 h-5 text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Orçamento estourado!" />}
                                    </div>

                                    {/* Circular Progress */}
                                    <div className="relative w-36 h-36 mb-5 group-hover:scale-105 transition-transform duration-500">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" className="stroke-[#ffffff05]" strokeWidth="8" fill="none" />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="42"
                                                stroke={ringColor}
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray="263.8"
                                                strokeDashoffset={263.8 - (263.8 * fillPct) / 100}
                                                className="transition-all duration-1000 ease-out"
                                                strokeLinecap="round"
                                                style={{ filter: `drop-shadow(0 0 8px ${ringColor}60)` }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className="text-4xl opacity-[0.03] absolute font-bold">{cat?.icon}</span>
                                            <span className="text-2xl font-bold text-white z-10 tracking-tighter" style={{ fontFamily: 'Outfit' }}>{budget.percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>

                                    <p className="text-[13px] font-bold text-[#8e9bb0] uppercase tracking-wider mb-3">{cat?.name ?? 'Categoria'}</p>

                                    <div className="flex items-center justify-between w-full mt-2 text-xs border-t border-[#ffffff0a] pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[#64748b] font-semibold text-[10px] uppercase tracking-widest mb-1">Gasto Atual</span>
                                            <span className={cn('font-bold text-sm tracking-tight', isDanger ? 'text-[#ef4444]' : 'text-white')} style={{ fontFamily: 'Outfit' }}>
                                                {formatCurrency(budget.spent)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[#64748b] font-semibold text-[10px] uppercase tracking-widest mb-1">Limite Ideal</span>
                                            <span className="text-white font-bold text-sm tracking-tight" style={{ fontFamily: 'Outfit' }}>
                                                {formatCurrency(budget.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
