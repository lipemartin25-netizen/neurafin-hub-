'use client'

import { motion } from 'framer-motion'
import { Download, Calendar, ArrowUpRight, ArrowDownRight, FileText, PieChart } from 'lucide-react'
import { C, cardStyle, btnGoldStyle, btnOutlineStyle, fmt } from '@/lib/theme'

const MONTHLY = [
    { month: 'Set/25', income: 15200, expense: 9800 },
    { month: 'Out/25', income: 16500, expense: 10200 },
    { month: 'Nov/25', income: 14800, expense: 11500 },
    { month: 'Dez/25', income: 22000, expense: 15800 },
    { month: 'Jan/26', income: 15700, expense: 9400 },
    { month: 'Fev/26', income: 17200, expense: 10300 },
]

const CATEGORIES = [
    { name: 'Moradia', icon: '🏠', amount: 3500, pct: 34, color: '#8B5CF6' },
    { name: 'Alimentação', icon: '🍔', amount: 1800, pct: 17.5, color: '#F59E0B' },
    { name: 'Transporte', icon: '🚗', amount: 1200, pct: 11.6, color: '#3B82F6' },
    { name: 'Saúde', icon: '💊', amount: 850, pct: 8.3, color: '#10B981' },
    { name: 'Lazer', icon: '🎬', amount: 780, pct: 7.6, color: '#EC4899' },
    { name: 'Compras', icon: '🛍️', amount: 1320, pct: 12.8, color: '#EF4444' },
    { name: 'Assinaturas', icon: '📱', amount: 350, pct: 3.4, color: '#F97316' },
    { name: 'Educação', icon: '📚', amount: 500, pct: 4.8, color: '#06B6D4' },
]

export default function ReportsPage() {
    const cur = MONTHLY[MONTHLY.length - 1]
    const prev = MONTHLY[MONTHLY.length - 2]
    const maxBar = Math.max(...MONTHLY.map(d => Math.max(d.income, d.expense)))

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Relatórios</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Análise detalhada das suas finanças</p>
                </div>
                <button style={btnGoldStyle}><Download size={16} /> Exportar PDF</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Receitas', value: cur.income, prev: prev.income, color: C.emerald },
                    { label: 'Despesas', value: cur.expense, prev: prev.expense, color: C.red },
                    { label: 'Saldo', value: cur.income - cur.expense, prev: prev.income - prev.expense, color: C.emerald },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ ...cardStyle, padding: 20 }}>
                        <span style={{ fontSize: 13, color: C.textMuted }}>{s.label}</span>
                        <p style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{fmt(s.value)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            {s.value - s.prev >= 0 ? <ArrowUpRight size={12} style={{ color: C.emerald }} /> : <ArrowDownRight size={12} style={{ color: C.red }} />}
                            <span style={{ fontSize: 11, color: s.value - s.prev >= 0 ? C.emerald : C.red }}>{fmt(Math.abs(s.value - s.prev))}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontWeight: 600, color: C.text, marginBottom: 24 }}>Receitas vs Despesas</h3>
                {MONTHLY.map((d, i) => {
                    const isLast = i === MONTHLY.length - 1
                    return (
                        <div key={d.month} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                <span style={{ fontWeight: isLast ? 600 : 400, color: isLast ? C.gold : C.textMuted }}>{d.month}</span>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <span style={{ color: C.emerald }}>{fmt(d.income)}</span>
                                    <span style={{ color: C.red }}>{fmt(d.expense)}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(d.income / maxBar) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                                    style={{ height: 12, borderRadius: '6px 0 0 6px', background: isLast ? C.goldGrad : 'rgba(16,185,129,0.4)' }} />
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(d.expense / maxBar) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.45 + i * 0.05 }}
                                    style={{ height: 12, borderRadius: '0 6px 6px 0', backgroundColor: 'rgba(239,68,68,0.4)' }} />
                            </div>
                        </div>
                    )
                })}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 16 }}>
                    <PieChart size={18} style={{ color: C.gold }} /> Despesas por Categoria
                </h3>
                <div style={{ display: 'flex', height: 20, borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
                    {CATEGORIES.map(c => <div key={c.name} style={{ width: `${c.pct}%`, height: '100%', backgroundColor: c.color }} />)}
                </div>
                {CATEGORIES.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: c.color }} />
                            <span style={{ fontSize: 13 }}>{c.icon} {c.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{fmt(c.amount)}</span>
                            <span style={{ fontSize: 12, color: C.textMuted }}>{c.pct}%</span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
