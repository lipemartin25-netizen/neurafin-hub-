'use client'

import { motion } from 'framer-motion'
import {
    Download, ArrowUpRight, ArrowDownRight, PieChart, TrendingUp,
    TrendingDown, Wallet, BarChart3, Loader2, Calendar, DollarSign,
    Minus, Activity,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, fmt } from '@/lib/theme'

type MonthlyStat = { income: number; expense: number; label: string }
type CategoryItem = { id: string; name: string; icon: string; color: string; amount: number; pct: number }
type TopExpense = { description: string; amount: number; date: string; category_name: string; category_color: string; category_icon: string }
type DailyItem = { date: string; label: string; expense: number; income: number }
type Summary = {
    currentIncome: number; currentExpense: number; currentSaving: number
    prevIncome: number; prevExpense: number; prevSaving: number
    patrimony: number; avgIncome: number; avgExpense: number
    savingRate: number; monthlyIncome: number | null
}

type ReportData = {
    monthly: MonthlyStat[]
    categoryBreakdown: CategoryItem[]
    topExpenses: TopExpense[]
    dailyChart: DailyItem[]
    summary: Summary
    period: { months: number; currentMonth: string }
}

const PERIOD_OPTIONS = [
    { value: 3, label: '3 meses' },
    { value: 6, label: '6 meses' },
    { value: 12, label: '12 meses' },
]

// ========== Variação helper ==========
function Variation({ current, previous, invert }: { current: number; previous: number; invert?: boolean }) {
    if (previous === 0) return <span style={{ fontSize: 11, color: C.textMuted }}>—</span>
    const diff = current - previous
    const pct = ((diff / previous) * 100).toFixed(1)
    const isPositive = invert ? diff <= 0 : diff >= 0
    const color = isPositive ? C.emerald : C.red
    const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon size={12} style={{ color }} />
            <span style={{ fontSize: 11, color }}>{pct}% vs anterior</span>
        </div>
    )
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [months, setMonths] = useState(6)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/reports?months=${months}`)
            if (!res.ok) throw new Error()
            const json = await res.json()
            setData(json.data)
        } catch {
            setData(null)
        } finally {
            setLoading(false)
        }
    }, [months])

    useEffect(() => { fetchData() }, [fetchData])

    // ========== Loading ==========
    if (loading) {
        return (
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>Relatórios</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Carregando análise...</p>
                <div style={{ ...cardStyle, padding: 80, display: 'flex', justifyContent: 'center' }}>
                    <Loader2 size={32} style={{ color: C.gold, animation: 'spin 1s linear infinite' }} />
                </div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!data) {
        return (
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Relatórios</h1>
                <div style={{ ...cardStyle, padding: 40, textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: C.textMuted }}>Erro ao carregar relatórios. Tente novamente.</p>
                    <button onClick={fetchData} style={{ ...btnOutlineStyle, marginTop: 16 }}>Tentar novamente</button>
                </div>
            </div>
        )
    }

    const { monthly, categoryBreakdown, topExpenses, dailyChart, summary } = data
    const maxBarMonthly = Math.max(...monthly.map(d => Math.max(d.income, d.expense)), 1)
    const maxDaily = Math.max(...dailyChart.map(d => Math.max(d.expense, d.income)), 1)

    return (
        <div>
            {/* ========== Header ========== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Relatórios</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Análise detalhada das suas finanças</p>
                </motion.div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Period Selector */}
                    <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                        {PERIOD_OPTIONS.map(p => (
                            <button key={p.value} onClick={() => setMonths(p.value)} style={{
                                padding: '8px 14px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                                backgroundColor: months === p.value ? 'rgba(201,168,88,0.15)' : C.secondary,
                                color: months === p.value ? C.gold : C.textMuted,
                                transition: 'all 0.2s',
                            }}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== Summary Cards ========== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Receitas', value: summary.currentIncome, prev: summary.prevIncome, color: C.emerald, icon: TrendingUp },
                    { label: 'Despesas', value: summary.currentExpense, prev: summary.prevExpense, color: C.red, icon: TrendingDown, invert: true },
                    { label: 'Economia', value: summary.currentSaving, prev: summary.prevSaving, color: summary.currentSaving >= 0 ? C.emerald : C.red, icon: Wallet },
                    { label: 'Patrimônio', value: summary.patrimony, prev: 0, color: C.gold, icon: DollarSign, noVariation: true },
                ].map((s, i) => {
                    const Icon = s.icon
                    return (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            style={{ ...cardStyle, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: C.textMuted }}>{s.label}</span>
                                <Icon size={16} style={{ color: s.color, opacity: 0.7 }} />
                            </div>
                            <p style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{fmt(s.value)}</p>
                            {!s.noVariation && (
                                <div style={{ marginTop: 4 }}>
                                    <Variation current={s.value} previous={s.prev} invert={s.invert} />
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* ========== Saving Rate + Averages ========== */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>

                {/* Saving Rate Card */}
                <div style={{ ...cardHlStyle, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Activity size={16} style={{ color: C.gold }} />
                        <span style={{ fontSize: 13, color: C.textMuted }}>Taxa de Poupança</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{
                            fontSize: 28, fontWeight: 700,
                            color: summary.savingRate >= 20 ? C.emerald : summary.savingRate >= 10 ? C.yellow : C.red,
                        }}>
                            {summary.savingRate}%
                        </span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>
                            {summary.savingRate >= 20 ? '✅ Excelente' : summary.savingRate >= 10 ? '⚠️ Razoável' : '🔴 Baixa'}
                        </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, backgroundColor: C.secondary, marginTop: 12 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, summary.savingRate / 30 * 100))}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            style={{
                                height: '100%', borderRadius: 999,
                                background: summary.savingRate >= 20 ? C.emerald : summary.savingRate >= 10 ? C.yellow : C.red,
                            }}
                        />
                    </div>
                    <p style={{ fontSize: 11, color: C.textMuted2, marginTop: 8 }}>Ideal: 20-30% da renda</p>
                </div>

                {/* Averages Card */}
                <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <BarChart3 size={16} style={{ color: C.gold }} />
                        <span style={{ fontSize: 13, color: C.textMuted }}>Médias do Período ({months}m)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: C.textMuted }}>Receita média</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.emerald }}>{fmt(summary.avgIncome)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: C.textMuted }}>Despesa média</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.red }}>{fmt(summary.avgExpense)}</span>
                        </div>
                        <div style={{ height: 1, backgroundColor: C.border }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: C.textMuted }}>Economia média</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: summary.avgIncome - summary.avgExpense >= 0 ? C.emerald : C.red }}>
                                {fmt(summary.avgIncome - summary.avgExpense)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Renda declarada vs Real */}
                {summary.monthlyIncome && (
                    <div style={{ ...cardStyle, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <DollarSign size={16} style={{ color: C.gold }} />
                            <span style={{ fontSize: 13, color: C.textMuted }}>Renda Declarada vs Real</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, color: C.textMuted }}>Declarada</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{fmt(summary.monthlyIncome)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, color: C.textMuted }}>Recebida (mês)</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: C.emerald }}>{fmt(summary.currentIncome)}</span>
                            </div>
                            <div style={{ height: 1, backgroundColor: C.border }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, color: C.textMuted }}>Diferença</span>
                                <span style={{
                                    fontSize: 14, fontWeight: 600,
                                    color: summary.currentIncome >= summary.monthlyIncome ? C.emerald : C.yellow,
                                }}>
                                    {summary.currentIncome >= summary.monthlyIncome ? '+' : ''}{fmt(summary.currentIncome - summary.monthlyIncome)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* ========== Monthly Chart — Receitas vs Despesas ========== */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 600, color: C.text }}>Receitas vs Despesas</h3>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 999, background: C.goldGrad }} />
                            <span style={{ fontSize: 11, color: C.textMuted }}>Receitas</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: 'rgba(239,68,68,0.6)' }} />
                            <span style={{ fontSize: 11, color: C.textMuted }}>Despesas</span>
                        </div>
                    </div>
                </div>

                {monthly.length === 0 ? (
                    <p style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Sem dados no período</p>
                ) : (
                    monthly.map((d, i) => {
                        const isLast = i === monthly.length - 1
                        const saving = d.income - d.expense
                        return (
                            <div key={d.label} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, alignItems: 'center' }}>
                                    <span style={{ fontWeight: isLast ? 600 : 400, color: isLast ? C.gold : C.textMuted, minWidth: 60 }}>{d.label}</span>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <span style={{ color: C.emerald, minWidth: 90, textAlign: 'right' }}>{fmt(d.income)}</span>
                                        <span style={{ color: C.red, minWidth: 90, textAlign: 'right' }}>{fmt(d.expense)}</span>
                                        <span style={{
                                            color: saving >= 0 ? C.emerald : C.red, minWidth: 90, textAlign: 'right', fontWeight: 500,
                                        }}>
                                            {saving >= 0 ? '+' : ''}{fmt(saving)}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4, height: 14 }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(d.income / maxBarMonthly) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                                        style={{
                                            height: '100%', borderRadius: '7px 0 0 7px',
                                            background: isLast ? C.goldGrad : 'rgba(52,211,153,0.4)',
                                        }}
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(d.expense / maxBarMonthly) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.45 + i * 0.05 }}
                                        style={{
                                            height: '100%', borderRadius: '0 7px 7px 0',
                                            backgroundColor: 'rgba(239,68,68,0.4)',
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })
                )}
            </motion.div>

            {/* ========== Daily Chart + Categories Side by Side ========== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 24 }}>

                {/* Daily Chart — últimos 30 dias */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>Últimos 30 Dias</h3>
                    <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Fluxo diário de receitas e despesas</p>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
                        {dailyChart.map((d, i) => {
                            const h = maxDaily > 0 ? (d.expense / maxDaily) * 100 : 0
                            const hInc = maxDaily > 0 ? (d.income / maxDaily) * 100 : 0
                            return (
                                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    {hInc > 0 && (
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: `${hInc}%` }}
                                            transition={{ duration: 0.5, delay: 0.5 + i * 0.01 }}
                                            style={{ width: '100%', borderRadius: '2px 2px 0 0', backgroundColor: 'rgba(52,211,153,0.5)', minHeight: hInc > 0 ? 2 : 0 }}
                                            title={`${d.label} — Receita: ${fmt(d.income)}`}
                                        />
                                    )}
                                    {h > 0 && (
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                            transition={{ duration: 0.5, delay: 0.5 + i * 0.01 }}
                                            style={{ width: '100%', borderRadius: '2px 2px 0 0', backgroundColor: 'rgba(239,68,68,0.5)', minHeight: h > 0 ? 2 : 0 }}
                                            title={`${d.label} — Despesa: ${fmt(d.expense)}`}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Labels — a cada 5 dias */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        {dailyChart.filter((_, i) => i % 7 === 0 || i === dailyChart.length - 1).map(d => (
                            <span key={d.date} style={{ fontSize: 9, color: C.textMuted2 }}>{d.label}</span>
                        ))}
                    </div>
                </motion.div>

                {/* Categories Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                        <PieChart size={18} style={{ color: C.gold }} /> Despesas por Categoria
                    </h3>
                    <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Mês atual</p>

                    {categoryBreakdown.length === 0 ? (
                        <p style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Sem despesas no mês</p>
                    ) : (
                        <>
                            {/* Stacked bar */}
                            <div style={{ display: 'flex', height: 20, borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
                                {categoryBreakdown.map(c => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${c.pct}%` }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                        style={{ height: '100%', backgroundColor: c.color }}
                                        title={`${c.name}: ${c.pct}%`}
                                    />
                                ))}
                            </div>

                            {/* List */}
                            {categoryBreakdown.map((c, i) => (
                                <div key={c.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 0', borderBottom: i < categoryBreakdown.length - 1 ? `1px solid ${C.border}` : 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: c.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: C.text }}>{c.icon} {c.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{fmt(c.amount)}</span>
                                        <span style={{ fontSize: 12, color: C.textMuted, minWidth: 40, textAlign: 'right' }}>{c.pct}%</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </motion.div>
            </div>

            {/* ========== Top Expenses ========== */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                style={{ ...cardStyle, padding: 24, marginBottom: 32 }}>
                <h3 style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>Maiores Despesas do Mês</h3>
                <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Top 10 transações</p>

                {topExpenses.length === 0 ? (
                    <p style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Sem despesas no mês</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['#', 'Descrição', 'Categoria', 'Data', 'Valor'].map(h => (
                                        <th key={h} style={{
                                            textAlign: h === 'Valor' ? 'right' : 'left', padding: '8px 12px', fontSize: 11,
                                            fontWeight: 600, color: C.textMuted, borderBottom: `1px solid ${C.border}`,
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topExpenses.map((tx, i) => (
                                    <motion.tr key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.03 }}
                                        style={{ borderBottom: i < topExpenses.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                                        <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMuted }}>{i + 1}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: C.text }}>{tx.description}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '3px 8px', borderRadius: 6, fontSize: 11,
                                                backgroundColor: `${tx.category_color}15`, color: tx.category_color,
                                            }}>
                                                {tx.category_icon} {tx.category_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 12px', fontSize: 12, color: C.textMuted }}>
                                            {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: C.red, textAlign: 'right' }}>
                                            {fmt(tx.amount)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
