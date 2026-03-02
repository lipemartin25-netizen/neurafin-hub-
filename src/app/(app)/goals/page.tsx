import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Target, CheckCircle2, TrendingUp } from 'lucide-react'
import { formatCurrency, formatShortDate } from '@/lib/utils'

export default async function GoalsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: goalsRes } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('is_completed', { ascending: true })
        .order('priority', { ascending: true })

    const goals = goalsRes ?? []

    const activeGoals = goals.filter(g => !g.is_completed)
    const completedGoals = goals.filter(g => g.is_completed)

    const totalSaved = activeGoals.reduce((s, g) => s + g.current_amount, 0)
    const totalTarget = activeGoals.reduce((s, g) => s + g.target_amount, 0)
    const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Objetivos de Vida</h1>
                    <p className="text-[#8e9bb0] text-sm mt-1 font-medium tracking-wide">Acompanhe seu progresso e conquiste seu futuro financeiro</p>
                </div>
                <Link href="/goals/new">
                    <button className="btn-neural flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                        <Plus className="w-4 h-4" /> Novo Objetivo
                    </button>
                </Link>
            </div>

            <div className="glass-card p-8 border-b-4 border-b-[#00F260] flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-[#03050C] to-[#011409]">
                <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8e9bb0] flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-[#00F260]" /> Patrimônio Direcionado
                    </p>
                    <p className="text-4xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                        {formatCurrency(totalSaved)} <span className="text-xl text-[#00F260] font-medium ml-2 tracking-normal">/ {formatCurrency(totalTarget)}</span>
                    </p>
                </div>
                <div className="w-full md:w-1/3 bg-[#ffffff05] p-5 rounded-2xl border border-[#ffffff10] shadow-inner">
                    <div className="flex justify-between text-[11px] mb-3 font-bold uppercase tracking-wider">
                        <span className="text-[#00F260]">Progresso Global</span>
                        <span className="text-white">{globalProgress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-[#000000] rounded-full overflow-hidden border border-[#ffffff10]">
                        <div className="h-full bg-gradient-to-r from-[#00F260] to-[#10B981] transition-all duration-1000 relative" style={{ width: `${globalProgress}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {activeGoals.length === 0 && completedGoals.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[#ffffff10] rounded-3xl bg-[#ffffff02]">
                        <div className="w-20 h-20 rounded-3xl bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Target className="w-8 h-8 text-[#8e9bb0]" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Nenhum Objetivo Ativo</h3>
                        <p className="text-[#8e9bb0] text-[15px] mb-8 max-w-sm mx-auto">Comece a planejar sua troca de carro, viagens, ou a criação da sua reserva de emergência.</p>
                        <Link href="/goals/new">
                            <button className="btn-neural px-8 py-3.5 text-sm">Criar Primeiro Objetivo</button>
                        </Link>
                    </div>
                ) : null}

                {activeGoals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeGoals.map(goal => {
                            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)

                            return (
                                <div key={goal.id} className="relative p-6 rounded-3xl border border-[#ffffff0a] bg-[#ffffff03] flex flex-col group hover:bg-[#ffffff08] hover:border-[#ffffff15] transition-all shadow-inner">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner border border-white/10" style={{ backgroundColor: `${goal.color}20` }}>
                                                {goal.icon}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <p className="text-base font-bold text-white truncate tracking-tight" style={{ fontFamily: 'Outfit' }}>{goal.name}</p>
                                                {goal.target_date && (
                                                    <p className="text-[11px] font-medium text-[#8e9bb0] mt-1 tracking-wide">🎯 Para {formatShortDate(goal.target_date)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em] mb-1">Acumulado</p>
                                            <p className="text-2xl font-bold text-white leading-none tracking-tighter" style={{ fontFamily: 'Outfit' }}>{formatCurrency(goal.current_amount)}</p>
                                            <p className="text-[11px] text-[#F5A623] tracking-wide font-semibold mt-2">Alvo: {formatCurrency(goal.target_amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold tracking-tighter drop-shadow-md" style={{ color: goal.color, fontFamily: 'Outfit' }}>{pct.toFixed(0)}%</span>
                                        </div>
                                    </div>

                                    <div className="h-2 w-full bg-[#000000] rounded-full overflow-hidden border border-[#ffffff10]">
                                        <div className="h-full transition-all duration-1000 origin-left" style={{ width: `${pct}%`, backgroundColor: goal.color, filter: `drop-shadow(0 0 5px ${goal.color}80)` }} />
                                    </div>

                                    {goal.monthly_contribution && (
                                        <div className="mt-5 pt-4 border-t border-[#ffffff0a] flex justify-between items-center text-[11px]">
                                            <span className="text-[#8e9bb0] uppercase tracking-wider font-bold">Aporte Mensal</span>
                                            <span className="text-white font-bold text-[13px]">{formatCurrency(goal.monthly_contribution)}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {completedGoals.length > 0 && (
                    <div className="mt-10 pt-4 border-t border-[#ffffff10]">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00F260] mb-6 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#00F260]" /> Objetivos Conquistados
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                            {completedGoals.map(goal => (
                                <div key={goal.id} className="p-4 rounded-2xl flex items-center gap-4 bg-[#00F260]/5 border border-[#00F260]/20 shadow-inner">
                                    <div className="w-10 h-10 rounded-xl bg-[#00F260]/10 flex items-center justify-center text-lg shrink-0 grayscale opacity-80">
                                        {goal.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#00F260] truncate line-through decoration-[#00F260]/40 tracking-tight" style={{ fontFamily: 'Outfit' }}>{goal.name}</p>
                                        <p className="text-xs font-semibold text-white/50">{formatCurrency(goal.target_amount)}</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-[#00F260] shrink-0 drop-shadow-[0_0_8px_rgba(0,242,96,0.5)]" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
