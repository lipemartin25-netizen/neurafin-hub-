'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { C, cardStyle, cardHlStyle } from '@/lib/theme'

type Metric = { name: string; score: number; status: 'excellent' | 'good' | 'warning' | 'danger'; detail: string; tip: string }

const STATUS_CFG = {
    excellent: { label: 'Excelente', color: C.emerald, Icon: CheckCircle2 },
    good: { label: 'Bom', color: C.blue, Icon: CheckCircle2 },
    warning: { label: 'Atenção', color: C.yellow, Icon: AlertTriangle },
    danger: { label: 'Crítico', color: C.red, Icon: XCircle },
}

const METRICS: Metric[] = [
    { name: 'Taxa de Poupança', score: 78, status: 'good', detail: 'Você poupa 24% da renda', tip: 'Tente atingir 30%' },
    { name: 'Reserva de Emergência', score: 90, status: 'excellent', detail: '9 meses cobertos', tip: 'Excelente! Mantenha entre 6-12 meses' },
    { name: 'Endividamento', score: 65, status: 'warning', detail: 'Dívidas = 42% da renda', tip: 'Priorize quitar juros altos' },
    { name: 'Diversificação', score: 72, status: 'good', detail: '5 classes de ativos', tip: 'Considere investimentos internacionais' },
    { name: 'Orçamento', score: 55, status: 'warning', detail: '3 categorias estouraram', tip: 'Revise alimentação e lazer' },
    { name: 'Metas Financeiras', score: 85, status: 'excellent', detail: '4 de 6 metas em dia', tip: 'Aumente aportes nas atrasadas' },
    { name: 'Proteção (Seguros)', score: 40, status: 'danger', detail: 'Sem seguro de vida', tip: 'Contrate seguro de vida e residencial' },
    { name: 'Planej. Tributário', score: 60, status: 'warning', detail: 'IRPF não otimizado', tip: 'Use PGBL e deduções médicas' },
]

const OVERALL = Math.round(METRICS.reduce((s, m) => s + m.score, 0) / METRICS.length)

const AI_INSIGHTS = [
    { icon: '🔍', text: 'Gastos com alimentação subiram 18% vs mês passado.' },
    { icon: '📈', text: 'Rendimento acumulado superou R$ 15k este ano!' },
    { icon: '⚠️', text: 'Boleto da CPFL vence em 3 dias.' },
    { icon: '💡', text: 'Mover R$ 5k para Tesouro Selic renderia R$ 42/mês a mais.' },
]

export default function HealthPage() {
    const router = useRouter()
    const overallColor = OVERALL >= 80 ? C.emerald : OVERALL >= 65 ? C.blue : OVERALL >= 45 ? C.yellow : C.red
    const overallLabel = OVERALL >= 80 ? 'Excelente' : OVERALL >= 65 ? 'Bom' : OVERALL >= 45 ? 'Atenção' : 'Crítico'
    const r = 70, circ = 2 * Math.PI * r, offset = circ - (OVERALL / 100) * circ

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Saúde Financeira</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Diagnóstico completo das suas finanças</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ ...cardHlStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <div style={{ position: 'relative', width: 180, height: 180 }}>
                        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="90" cy="90" r={r} fill="none" stroke={C.muted} strokeWidth="10" />
                            <motion.circle cx="90" cy="90" r={r} fill="none" stroke={overallColor} strokeWidth="10" strokeLinecap="round"
                                strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.5, delay: 0.3 }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 42, fontWeight: 700, color: overallColor }}>{OVERALL}</span>
                            <span style={{ fontSize: 12, color: C.textMuted }}>de 100</span>
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '6px 16px', borderRadius: 999, backgroundColor: `${overallColor}15` }}>
                        <CheckCircle2 size={14} style={{ color: overallColor }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: overallColor }}>{overallLabel}</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Sparkles size={18} style={{ color: C.gold }} />
                        <h3 style={{ fontWeight: 600, color: C.text }}>Insights da IA</h3>
                    </div>
                    {AI_INSIGHTS.map((ins, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 12, backgroundColor: C.secondary, marginBottom: 8 }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
                            <p style={{ fontSize: 13, color: 'rgba(235,230,218,0.8)', lineHeight: 1.5 }}>{ins.text}</p>
                        </div>
                    ))}
                    <button onClick={() => router.push('/ai')} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        marginTop: 8, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                        backgroundColor: 'rgba(201,168,88,0.05)', color: C.gold, fontSize: 13, fontWeight: 500,
                    }}>
                        <Zap size={14} /> Ver análise completa
                    </button>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 24 }}>
                {METRICS.map((m, i) => {
                    const cfg = STATUS_CFG[m.status]
                    return (
                        <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                            style={{ ...cardStyle, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <cfg.Icon size={16} style={{ color: cfg.color }} />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.name}</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>{m.score}</span>
                            </div>
                            <div style={{ height: 8, borderRadius: 999, backgroundColor: C.secondary, marginBottom: 12 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }}
                                    transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                                    style={{ height: '100%', borderRadius: 999, backgroundColor: cfg.color }} />
                            </div>
                            <p style={{ fontSize: 12, color: 'rgba(235,230,218,0.7)', marginBottom: 8 }}>{m.detail}</p>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: 8, borderRadius: 8, backgroundColor: C.secondary }}>
                                <Sparkles size={11} style={{ color: 'rgba(201,168,88,0.5)', marginTop: 2, flexShrink: 0 }} />
                                <p style={{ fontSize: 11, color: C.textMuted }}>{m.tip}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{ ...cardStyle, padding: 24, marginTop: 24 }}>
                <h3 style={{ fontWeight: 600, color: C.text, marginBottom: 16 }}>Ações Recomendadas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                    {[
                        { label: 'Contratar seguro de vida', priority: 'Alta', color: C.red, href: '/settings' },
                        { label: 'Otimizar IRPF com PGBL', priority: 'Média', color: C.yellow, href: '/investments' },
                        { label: 'Reduzir gastos com alimentação', priority: 'Média', color: C.yellow, href: '/budgets' },
                    ].map(a => (
                        <button key={a.label} onClick={() => router.push(a.href)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16,
                            borderRadius: 12, backgroundColor: C.secondary, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                        }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{a.label}</p>
                                <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 500, color: a.color, backgroundColor: `${a.color}15` }}>
                                    {a.priority}
                                </span>
                            </div>
                            <ArrowRight size={14} style={{ color: C.textMuted }} />
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
