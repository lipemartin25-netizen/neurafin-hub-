'use client'

import { motion } from 'framer-motion'
import { Plus, Calendar, Sparkles } from 'lucide-react'
import { C, cardStyle, cardHlStyle, btnGoldStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'

const GOALS = [
    { name: 'Viagem Europa', icon: '✈️', target: 35000, current: 25800, deadline: '2026-12-01', color: C.blue, monthly: 1022 },
    { name: 'Reserva Emergência', icon: '🛡️', target: 60000, current: 54000, deadline: '2026-06-01', color: C.emerald, monthly: 2000 },
    { name: 'Carro Novo', icon: '🚗', target: 120000, current: 48000, deadline: '2027-06-01', color: C.violet, monthly: 4800 },
    { name: 'Curso MBA', icon: '🎓', target: 25000, current: 8500, deadline: '2027-01-01', color: C.cyan, monthly: 1650 },
    { name: 'Aposentadoria', icon: '🏖️', target: 2000000, current: 188400, deadline: '2050-01-01', color: C.gold, monthly: 5000 },
    { name: 'MacBook Pro', icon: '💻', target: 18000, current: 16200, deadline: '2026-05-01', color: C.orange, monthly: 900 },
]

export default function GoalsPage() {
    const totalT = GOALS.reduce((s, g) => s + g.target, 0)
    const totalC = GOALS.reduce((s, g) => s + g.current, 0)
    const mLeft = (d: string) => Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / (86400000 * 30)))

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Metas</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Acompanhe seus objetivos financeiros</p>
                </div>
                <button style={btnGoldStyle}><Plus size={16} /> Nova Meta</button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ ...cardHlStyle, padding: 32, textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: C.textMuted }}>Progresso Geral</p>
                <p style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>
                    <GoldText>{totalT > 0 ? ((totalC / totalT) * 100).toFixed(1) : 0}%</GoldText>
                </p>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>{fmt(totalC)} de {fmt(totalT)}</p>
                <div style={{ maxWidth: 400, margin: '16px auto 0', height: 10, borderRadius: 999, backgroundColor: C.secondary }}>
                    <div style={{ height: '100%', width: `${totalT > 0 ? (totalC / totalT) * 100 : 0}%`, borderRadius: 999, background: C.goldGrad }} />
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                {GOALS.map((g, i) => {
                    const pct = g.target > 0 ? (g.current / g.target) * 100 : 0
                    return (
                        <motion.div key={g.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                            style={{ ...cardStyle, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${g.color}15`, fontSize: 22 }}>{g.icon}</div>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{g.name}</p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMuted }}><Calendar size={11} /> {mLeft(g.deadline)} meses</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700, color: g.color }}>{pct.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: 10, borderRadius: 999, backgroundColor: C.secondary, marginBottom: 12 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.06 }}
                                    style={{ height: '100%', borderRadius: 999, backgroundColor: g.color }} />
                            </div>
                            {[
                                { l: 'Acumulado', v: fmt(g.current), c: C.text },
                                { l: 'Objetivo', v: fmt(g.target), c: C.text },
                                { l: 'Faltam', v: fmt(g.target - g.current), c: g.color },
                            ].map(r => (
                                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: C.textMuted }}>{r.l}</span>
                                    <span style={{ fontWeight: 500, color: r.c }}>{r.v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: 8, borderRadius: 8, backgroundColor: C.secondary }}>
                                <Sparkles size={11} style={{ color: C.gold, flexShrink: 0 }} />
                                <p style={{ fontSize: 11, color: C.textMuted }}>Aporte sugerido: {fmt(g.monthly)}/mês</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
