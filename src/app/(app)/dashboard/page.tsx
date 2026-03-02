import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import {
    TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight,
    ArrowDownRight, Sparkles, Bell, Plus, Brain
} from 'lucide-react'
import Link from 'next/link'
import type { TransactionWithCategory } from '@/types/database'

async function getDashboardData(userId: string) {
    const supabase = await createClient()
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [accountsRes, transactionsRes, budgetsRes, goalsRes, boletosRes] = await Promise.all([
        supabase.from('accounts').select('id, name, balance, type, color, include_in_total').eq('user_id', userId).eq('is_active', true),
        supabase.from('transactions').select('id, amount, type, description, date, categories(id, name, icon, color), accounts(id, name, type, color)').eq('user_id', userId).gte('date', firstDay).lte('date', lastDay).order('date', { ascending: false }).limit(8),
        supabase.from('budgets').select('*, categories(name, icon, color)').eq('user_id', userId).eq('period', 'monthly'),
        supabase.from('goals').select('*').eq('user_id', userId).eq('is_completed', false).order('priority', { ascending: true }).limit(4),
        supabase.from('boletos').select('id, amount, due_date, beneficiary_name, status').eq('user_id', userId).eq('status', 'pending').lte('due_date', lastDay).order('due_date').limit(5),
    ])

    const accounts = accountsRes.data ?? []
    const transactions = (transactionsRes.data ?? []) as unknown as TransactionWithCategory[]
    const goals = goalsRes.data ?? []
    const boletos = boletosRes.data ?? []

    const totalBalance = accounts
        .filter(a => a.include_in_total && a.type !== 'credit_card')
        .reduce((sum, a) => sum + a.balance, 0)

    const monthIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const monthExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    return { accounts, transactions, budgets: budgetsRes.data ?? [], goals, boletos, totalBalance, monthIncome, monthExpense }
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const { accounts, transactions, goals, boletos, totalBalance, monthIncome, monthExpense } = await getDashboardData(user.id)

    const monthBalance = monthIncome - monthExpense
    const savingsRate = monthIncome > 0 ? (monthBalance / monthIncome) * 100 : 0
    const firstName = profile?.full_name?.split(' ')[0] ?? 'Usuário'

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        Dashboard <span className="text-[#00F260] opacity-80 font-normal">| {firstName}</span>
                    </h1>
                    <p className="text-[#8e9bb0] text-sm mt-1 font-medium tracking-wide">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {boletos.length > 0 && (
                        <Link href="/boletos">
                            <div className="relative p-3 glass-card rounded-xl cursor-pointer hover:scale-105 transition-transform border border-amber-500/20 shadow-[0_0_15px_rgba(245,166,35,0.15)]">
                                <Bell className="w-5 h-5 text-amber-400" />
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#03050C]">
                                    {boletos.length}
                                </div>
                            </div>
                        </Link>
                    )}
                    <Link href="/transactions/new">
                        <button className="btn-neural flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                            <Plus className="w-4 h-4" />
                            Nova Transação
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards (Emerald & Gold Theme) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Balance */}
                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F5A623] to-[#F59E0B] flex items-center justify-center shadow-[0_0_15px_rgba(245,166,35,0.4)]">
                        <Wallet className="w-5 h-5 text-black" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Patrimônio Líquido</p>
                    <p className="text-[28px] font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(totalBalance)}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00F260] shadow-[0_0_4px_#00F260]"></div>
                        <p className="text-xs text-[#8e9bb0]">{accounts.length} conta{accounts.length !== 1 ? 's' : ''} ativa{accounts.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Month Income */}
                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#00F260]/10 flex items-center justify-center border border-[#00F260]/20">
                        <TrendingUp className="w-5 h-5 text-[#00F260]" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Receitas</p>
                    <p className="text-[28px] font-bold text-[#00F260] tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(monthIncome)}</p>
                    <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#00F260]" />
                        <p className="text-xs font-medium text-[#00F260]">Entrada no mês</p>
                    </div>
                </div>

                {/* Month Expense */}
                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Despesas</p>
                    <p className="text-[28px] font-bold text-red-400 tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(monthExpense)}</p>
                    <div className="flex items-center gap-1 mt-2">
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                        <p className="text-xs font-medium text-red-400">Saída no mês</p>
                    </div>
                </div>

                {/* Savings Rate */}
                <div className="glass-card-hover p-6 relative">
                    <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#03050C] border border-[#ffffff10] flex items-center justify-center shadow-inner">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[11px] text-[#8e9bb0] font-bold uppercase tracking-[0.15em] mb-2">Taxa de Poupança</p>
                    <p className={`text-[28px] font-bold tracking-tight ${savingsRate >= 0 ? 'text-white' : 'text-red-400'}`} style={{ fontFamily: 'Outfit' }}>
                        {savingsRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-[#8e9bb0] mt-2 font-medium">
                        {savingsRate >= 0 ? '+' : ''}{formatCurrency(monthBalance)} no saldo
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Transações Recentes</h2>
                        <Link href="/transactions" className="text-xs font-semibold text-[#00F260] hover:text-white transition-colors uppercase tracking-wider">Ver Extrato Completo</Link>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-[#ffffff10] rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center mx-auto mb-4">
                                <ArrowUpRight className="w-6 h-6 text-[#8e9bb0]" />
                            </div>
                            <p className="text-[#8e9bb0] text-sm mb-4">Nenhuma movimentação registrada.</p>
                            <Link href="/transactions/new">
                                <button className="btn-neural text-xs px-6 py-2.5">Adicionar Transação</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#ffffff05] border border-transparent hover:border-[#ffffff0a] transition-all group">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                                        style={{ background: `${tx.categories?.color ?? '#00F260'}15`, border: `1px solid ${tx.categories?.color ?? '#00F260'}30` }}
                                    >
                                        {tx.categories?.icon ?? '💳'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-semibold text-white truncate group-hover:text-[#00F260] transition-colors">{tx.description}</p>
                                        <p className="text-[13px] text-[#8e9bb0] mt-0.5">{formatRelativeDate(tx.date)} <span className="mx-1.5">•</span> {tx.accounts?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[15px] font-bold shrink-0 ${tx.type === 'income' ? 'text-[#00F260]' :
                                            tx.type === 'expense' ? 'text-white' : 'text-[#F5A623]'
                                            }`}>
                                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                            {formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-[11px] text-[#64748b] font-medium uppercase mt-1">
                                            {tx.type === 'income' ? 'Receita' : tx.type === 'expense' ? 'Despesa' : 'Transferência'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Goals */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Metas Ativas</h2>
                            <Link href="/goals" className="text-xs font-semibold text-[#00F260] hover:text-white transition-colors uppercase tracking-wider">Expandir</Link>
                        </div>
                        {goals.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-[#ffffff10] rounded-2xl">
                                <p className="text-[#8e9bb0] text-sm mb-3">Onde você quer chegar?</p>
                                <Link href="/goals">
                                    <button className="btn-ghost text-xs px-4 py-2 border border-[#00F260]/30 text-[#00F260] hover:bg-[#00F260]/10">Definir Meta</button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {goals.map((goal) => {
                                    const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                                    return (
                                        <div key={goal.id} className="group">
                                            <div className="flex items-end justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ffffff05] border border-[#ffffff10] text-sm">
                                                        {goal.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white truncate max-w-[120px] group-hover:text-[#00F260] transition-colors">{goal.name}</p>
                                                        <p className="text-[11px] text-[#8e9bb0] mt-0.5">{formatCurrency(goal.current_amount)}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-white" style={{ fontFamily: 'Outfit' }}>{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="progress-bar h-2 relative">
                                                <div
                                                    className="progress-fill absolute top-0 left-0"
                                                    style={{ width: `${pct}%`, background: goal.color ?? '#00F260', boxShadow: `0 0 10px ${goal.color ?? '#00F260'}80` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Boletos */}
                    {boletos.length > 0 && (
                        <div className="glass-card p-6 border border-amber-500/20 shadow-[0_8px_32px_rgba(245,166,35,0.05)]">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                                    <span className="text-[#F5A623] drop-shadow-[0_0_8px_rgba(245,166,35,0.8)]">⚡</span> DDA Radar
                                </h2>
                                <Link href="/boletos" className="text-xs font-semibold text-[#F5A623] hover:text-white transition-colors uppercase tracking-wider">Ver todos</Link>
                            </div>
                            <div className="space-y-3">
                                {boletos.map((boleto) => (
                                    <div key={boleto.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                                        <div>
                                            <p className="text-[13px] font-semibold text-white truncate max-w-[140px]">
                                                {boleto.beneficiary_name ?? 'Boleto Digital'}
                                            </p>
                                            <p className="text-[11px] font-medium text-[#F5A623] mt-0.5">Vence: {formatRelativeDate(boleto.due_date)}</p>
                                        </div>
                                        <span className="text-sm font-bold text-[#F5A623] tracking-tight">{formatCurrency(boleto.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Quick Chat */}
                    <Link href="/ai" className="block">
                        <div className="glass-card-hover p-6 bg-gradient-to-br from-[#03050C] to-[#011409] border border-[#00F260]/20 shadow-[0_8px_32px_rgba(0,242,96,0.05)]">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F260] to-[#10B981] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,96,0.3)]">
                                    <Brain className="w-5 h-5 text-black" />
                                </div>
                                <div className="flex-1 mt-0.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>NeuraFin IA</p>
                                        <Sparkles className="w-4 h-4 text-[#F5A623]" />
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#00F260] mt-0.5">Agente Ativo</p>
                                </div>
                            </div>
                            <p className="text-[13px] text-[#8e9bb0] leading-relaxed">
                                Seu copiloto financeiro. Peça análises profundas, projeções ou insights sobre seus gastos.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Accounts */}
            {accounts.length > 0 && (
                <div className="glass-card p-6 mt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Suas Contas</h2>
                        <Link href="/accounts" className="text-xs font-semibold text-[#00F260] hover:text-white transition-colors uppercase tracking-wider">Gerenciar Carteira</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {accounts.map((account) => (
                            <div key={account.id} className="p-4 rounded-2xl bg-[#ffffff03] border border-[#ffffff0a] hover:border-[#ffffff15] hover:bg-[#ffffff08] transition-all group">
                                <div
                                    className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center shadow-inner"
                                    style={{ background: `${account.color}15`, border: `1px solid ${account.color}30` }}
                                >
                                    <Wallet className="w-5 h-5" style={{ color: account.color }} />
                                </div>
                                <p className="text-[13px] font-semibold text-white truncate group-hover:text-[#00F260] transition-colors">{account.name}</p>
                                <p className={`text-[15px] font-bold tracking-tight mt-1 ${account.balance < 0 ? 'text-red-400' : 'text-[#8e9bb0]'}`}>
                                    {formatCurrency(account.balance)}
                                </p>
                            </div>
                        ))}
                        <Link href="/accounts/new" className="block">
                            <div className="h-full p-4 rounded-2xl border border-dashed border-[#ffffff15] hover:border-[#00F260]/50 hover:bg-[#00F260]/5 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer min-h-[110px]">
                                <div className="w-8 h-8 rounded-full bg-[#ffffff0a] flex items-center justify-center group-hover:bg-[#00F260]/20 transition-colors">
                                    <Plus className="w-4 h-4 text-[#8e9bb0] group-hover:text-[#00F260]" />
                                </div>
                                <p className="text-[13px] font-semibold text-[#8e9bb0] group-hover:text-white transition-colors">Vincular Conta</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
