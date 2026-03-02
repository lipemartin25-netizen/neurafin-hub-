import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Wallet, Landmark, CreditCard, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Account } from '@/types/database'

export default async function AccountsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const typedAccounts = (accounts ?? []) as Account[]
    const totalBalance = typedAccounts
        .filter(a => a.include_in_total && a.type !== 'credit_card')
        .reduce((s, a) => s + a.balance, 0)

    // Group accounts by type for better UI
    const groups = {
        checking: typedAccounts.filter(a => a.type === 'checking' || a.type === 'cash'),
        creditCards: typedAccounts.filter(a => a.type === 'credit_card'),
        investments: typedAccounts.filter(a => a.type === 'investment' || a.type === 'savings')
    }

    const TypeIcon = {
        checking: Wallet,
        cash: Wallet,
        credit_card: CreditCard,
        investment: Landmark,
        savings: Landmark,
        wallet: Wallet,
        other: Wallet
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Minhas Contas</h1>
                    <p className="text-[#8e9bb0] text-sm mt-1 font-medium tracking-wide">Visão consolidada do seu patrimônio físico e contas</p>
                </div>
                <Link href="/accounts/new">
                    <button className="btn-neural flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                        <Plus className="w-4 h-4" /> Conta ou Cartão
                    </button>
                </Link>
            </div>

            <div className="glass-card-hover p-8 border-b-4 border-b-[#00F260] flex items-center justify-between shadow-[0_8px_32px_rgba(0,242,96,0.05)] bg-gradient-to-r from-[#03050C] to-[#011409]">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8e9bb0] mb-2">Saldo Consolidado (Total em Contas)</p>
                    <p className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(totalBalance)}</p>
                </div>
            </div>

            <div className="space-y-10 mt-8">
                {/* Checking & Cash */}
                {groups.checking.length > 0 && (
                    <section className="space-y-5">
                        <h2 className="text-xl font-semibold flex items-center gap-3 text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                            <Wallet className="w-5 h-5 text-[#00F260]" /> Corrente & Carteira
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {groups.checking.map((acc) => {
                                const Icon = TypeIcon[acc.type] ?? Wallet
                                return (
                                    <div key={acc.id} className="glass-card p-5 relative overflow-hidden group cursor-pointer border border-transparent hover:border-[#ffffff10] hover:bg-[#ffffff05] transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${acc.color}15`, border: `1px solid ${acc.color}30` }}>
                                                <Icon className="w-6 h-6" style={{ color: acc.color }} />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-[#8e9bb0] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-[13px] font-semibold text-[#8e9bb0] truncate group-hover:text-white transition-colors">{acc.name}</p>
                                        <p className={`text-2xl font-bold mt-1 tracking-tight ${acc.balance < 0 ? 'text-red-400' : 'text-white'}`} style={{ fontFamily: 'Outfit' }}>
                                            {formatCurrency(acc.balance)}
                                        </p>
                                        {!acc.include_in_total && (
                                            <span className="absolute top-4 right-4 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold tracking-wider uppercase">
                                                Ignorado
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Credit Cards */}
                {groups.creditCards.length > 0 && (
                    <section className="space-y-5">
                        <h2 className="text-xl font-semibold flex items-center gap-3 text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                            <CreditCard className="w-5 h-5 text-[#F5A623]" /> Cartões de Crédito
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {groups.creditCards.map((acc) => {
                                const pct = acc.credit_limit ? (acc.balance / acc.credit_limit) * 100 : 0
                                return (
                                    <div key={acc.id} className="p-6 relative overflow-hidden rounded-2xl cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#ffffff10] group hover:-translate-y-1 transition-transform">
                                        <div className="absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(135deg, ${acc.color}80, #03050C)` }} />
                                        <div className="absolute inset-0 bg-[#03050C]/40 backdrop-blur-[2px]" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <p className="font-bold tracking-[0.2em] text-white/90 text-sm">{acc.name.toUpperCase()}</p>
                                                <CreditCard className="w-6 h-6 text-white/40" />
                                            </div>
                                            <div className="mb-2">
                                                <p className="text-[10px] uppercase text-white/50 font-bold tracking-[0.15em] mb-1">Fatura Atual</p>
                                                <p className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>{formatCurrency(acc.balance)}</p>
                                            </div>
                                            {acc.credit_limit && (
                                                <div className="mt-5">
                                                    <div className="flex justify-between text-[11px] text-white/60 mb-2 font-medium">
                                                        <span>Limite Usado: {pct.toFixed(0)}%</span>
                                                        <span>Total: {formatCurrency(acc.credit_limit)}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-gradient-to-r from-white/50 to-white transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${Math.min(pct, 100)}%` }} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-5 select-none pointer-events-none text-[11px] text-white/40 uppercase font-bold tracking-wider">
                                                <div>
                                                    <span>Vencimento</span>
                                                    <span className="text-white ml-2 text-sm">{String(acc.due_day).padStart(2, '0')}/mês</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Investments / Savings */}
                {groups.investments.length > 0 && (
                    <section className="space-y-5">
                        <h2 className="text-xl font-semibold flex items-center gap-3 text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                            <Landmark className="w-5 h-5 text-[#00F260]" /> Investimentos & Reservas
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {groups.investments.map((acc) => (
                                <div key={acc.id} className="glass-card-hover p-5 relative overflow-hidden group cursor-pointer flex items-center gap-5 border border-transparent hover:border-[#00F260]/30 transition-all">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#00F260]/20 bg-[#00F260]/10 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                        <Landmark className="w-7 h-7 text-[#00F260]" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold uppercase tracking-wider text-[#8e9bb0] mb-0.5">{acc.name}</p>
                                        <p className="text-2xl font-bold text-white tracking-tight group-hover:text-[#00F260] transition-colors" style={{ fontFamily: 'Outfit' }}>
                                            {formatCurrency(acc.balance)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {Object.values(groups).every(g => g.length === 0) && (
                    <div className="glass-card p-16 text-center mt-6 border-dashed border border-[#ffffff10] rounded-3xl">
                        <div className="w-20 h-20 rounded-3xl bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Wallet className="w-8 h-8 text-[#8e9bb0]" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Bófre Vazio</h3>
                        <p className="text-[#8e9bb0] text-[15px] mb-8 max-w-sm mx-auto">Adicione suas constas correntes, cartões de crédito e faturas para iniciar a gestão inteligente.</p>
                        <Link href="/accounts/new">
                            <button className="btn-neural px-8 py-3.5 text-sm">Vincular Conta</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
