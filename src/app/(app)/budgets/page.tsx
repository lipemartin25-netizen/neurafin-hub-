'use client'

import { motion } from 'framer-motion'
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { C, cardStyle, btnGoldStyle, fmt } from '@/lib/theme'

const BUDGETS = [
    { name: 'Moradia', icon: '🏠', limit: 3500, spent: 3200, color: C.violet },
    { name: 'Alimentação', icon: '🍔', limit: 2000, spent: 2340, color: C.yellow },
    { name: 'Transporte', icon: '🚗', limit: 1200, spent: 890, color: C.blue },
    { name: 'Saúde', icon: '💊', limit: 800, spent: 650, color: C.emerald },
    { name: 'Educação', icon: '📚', limit: 600, spent: 500, color: C.cyan },
    { name: 'Lazer', icon: '🎬', limit: 800, spent: 920, color: C.pink },
    { name: 'Assinaturas', icon: '📱', limit: 400, spent: 350, color: C.orange },
    { name: 'Compras', icon: '🛍️', limit: 1000, spent: 1320, color: C.red },
]

export default function BudgetsPage() {
    const totalLimit = BUDGETS.reduce((s, b) => s + b.limit, 0)
    const totalSpent = BUDGETS.reduce((s, b) => s + b.spent, 0)
    const overBudget = BUDGETS.filter(b => b.spent > b.limit)

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Orçamentos</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Controle seus limites por categoria</p>
                </div>
                <button style={btnGoldStyle}><Plus size={16} /> Novo Orçamento</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Orçamento Total', value: fmt(totalLimit), color: C.textMuted },
                    { label: 'Total Gasto', value: fmt(totalSpent), color: totalSpent > totalLimit ? C.red : C.emerald },
                    { label: 'Disponível', value: fmt(totalLimit - totalSpent), color: totalLimit - totalSpent >= 0 ? C.emerald : C.red },
                    { label: 'Estouradas', value: `${overBudget.length} de ${BUDGETS.length}`, color: overBudget.length > 0 ? C.red : C.emerald },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ ...cardStyle, padding: 20 }}>
                        <p style={{ fontSize: 13, color: C.textMuted }}>{s.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
                {BUDGETS.map((b, i) => {
                    const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0
                    const over = b.spent > b.limit
                    return (
                        <motion.div key={b.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                            style={{ ...cardStyle, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 22 }}>{b.icon}</span>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{b.name}</p>
                                        <p style={{ fontSize: 12, color: C.textMuted }}>Limite: {fmt(b.limit)}</p>
                                    </div>
                                </div>
                                {over ? <AlertTriangle size={18} style={{ color: C.red }} /> : pct < 80 ? <CheckCircle2 size={18} style={{ color: C.emerald }} /> : null}
                            </div>
                            <div style={{ height: 10, borderRadius: 999, backgroundColor: C.secondary, marginBottom: 8 }}>
                                <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: 999, background: over ? C.red : pct > 80 ? C.yellow : b.color, transition: 'width 0.8s ease' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span style={{ color: over ? C.red : C.textMuted }}>{fmt(b.spent)} ({pct.toFixed(0)}%)</span>
                                <span style={{ color: C.textMuted }}>
                                    Restam: {over ? <span style={{ color: C.red }}>−{fmt(b.spent - b.limit)}</span> : fmt(b.limit - b.spent)}
                                </span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
