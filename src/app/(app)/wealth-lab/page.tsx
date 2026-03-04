'use client'

import { motion } from 'framer-motion'
import { FlaskConical, Calculator, DollarSign, Percent, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { C, cardStyle, cardHlStyle, inputStyle, btnGoldStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'

export default function WealthLabPage() {
    const [initial, setInitial] = useState(10000)
    const [monthly, setMonthly] = useState(2000)
    const [rate, setRate] = useState(12)
    const [years, setYears] = useState(10)

    const result = useMemo(() => {
        const mr = rate / 100 / 12
        const months = years * 12
        let total = initial
        const history: { month: number; total: number; invested: number }[] = []
        for (let m = 1; m <= months; m++) {
            total = total * (1 + mr) + monthly
            if (m % 12 === 0 || m === months) history.push({ month: m, total, invested: initial + monthly * m })
        }
        const totalInvested = initial + monthly * months
        return { total, totalInvested, totalInterest: total - totalInvested, history }
    }, [initial, monthly, rate, years])

    const maxVal = Math.max(...result.history.map(h => h.total))

    const Field = ({ label, icon: Icon, value, onChange, prefix = '' }: any) => (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textMuted, marginBottom: 8 }}>
                <Icon size={14} style={{ color: C.gold }} /> {label}
            </label>
            <div style={{ position: 'relative' }}>
                {prefix && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.textMuted }}>{prefix}</span>}
                <input aria-label="Entrada de texto" type="number" value={value} onChange={(e: any) => onChange(Number(e.target.value))}
                    style={{ ...inputStyle, paddingLeft: prefix ? 36 : 16, fontSize: 16, fontWeight: 600 }} />
            </div>
        </div>
    )

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <FlaskConical size={22} style={{ color: C.gold }} />
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Wealth Lab</h1>
                </div>
                <p style={{ fontSize: 14, color: C.textMuted }}>Simulador de juros compostos</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginTop: 24 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 24 }}>
                        <Calculator size={18} style={{ color: C.gold }} /> Parâmetros
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Field label="Investimento Inicial" icon={DollarSign} value={initial} onChange={setInitial} prefix="R$" />
                        <Field label="Aporte Mensal" icon={DollarSign} value={monthly} onChange={setMonthly} prefix="R$" />
                        <Field label="Rentabilidade Anual (%)" icon={Percent} value={rate} onChange={setRate} />
                        <Field label="Período (anos)" icon={Calendar} value={years} onChange={setYears} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>Cenários:</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[{ l: '🏦 Conservador', r: 8 }, { l: '📊 Moderado', r: 12 }, { l: '🚀 Agressivo', r: 18 }].map(p => (
                                <button key={p.l} onClick={() => setRate(p.r)} style={{
                                    padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                                    backgroundColor: rate === p.r ? 'rgba(201,168,88,0.1)' : C.secondary,
                                    border: rate === p.r ? '1px solid rgba(201,168,88,0.3)' : '1px solid transparent',
                                    color: rate === p.r ? C.gold : C.textMuted,
                                }}>{p.l} ({p.r}%)</button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        style={{ ...cardHlStyle, padding: 32, textAlign: 'center' }}>
                        <p style={{ fontSize: 14, color: C.textMuted }}>Patrimônio em {years} anos</p>
                        <p style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}><GoldText>{fmt(result.total)}</GoldText></p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                            style={{ ...cardStyle, padding: 16, textAlign: 'center' }}>
                            <p style={{ fontSize: 12, color: C.textMuted }}>Investido</p>
                            <p style={{ fontSize: 18, fontWeight: 700, color: C.blue, marginTop: 4 }}>{fmt(result.totalInvested)}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            style={{ ...cardStyle, padding: 16, textAlign: 'center' }}>
                            <p style={{ fontSize: 12, color: C.textMuted }}>Juros Ganhos</p>
                            <p style={{ fontSize: 18, fontWeight: 700, color: C.emerald, marginTop: 4 }}>{fmt(result.totalInterest)}</p>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        style={{ ...cardStyle, padding: 24 }}>
                        <h3 style={{ fontWeight: 600, color: C.text, marginBottom: 16 }}>Projeção</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                            {result.history.map((h, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: 9, color: C.textMuted }}>R${(h.total / 1000).toFixed(0)}k</span>
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${maxVal > 0 ? (h.total / maxVal) * 100 : 0}%` }}
                                        transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                                        style={{ width: '100%', background: C.goldGrad, borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                                    <span style={{ fontSize: 9, color: C.textMuted }}>Ano {Math.round(h.month / 12)}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
