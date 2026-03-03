'use client'

import { motion } from 'framer-motion'
import {
    Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    CreditCard, Target, Eye, EyeOff, Sparkles, Plus, Bell,
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'

const SUMMARY = [
    { label: 'Saldo Total', value: 265321.25, icon: Wallet, color: C.gold, positive: true },
    { label: 'Receitas (mês)', value: 17200, icon: ArrowUpRight, color: C.emerald, positive: true },
    { label: 'Despesas (mês)', value: 10300, icon: ArrowDownRight, color: C.red, positive: false },
    { label: 'Investimentos', value: 188400, icon: TrendingUp, color: C.blue, positive: true },
]

const RECENT_TX = [
    { name: 'Salário', desc: 'Empresa XYZ', amount: 12500, type: 'in' as const, icon: '💰', date: 'Hoje' },
    { name: 'Aluguel', desc: 'Apartamento', amount: 2800, type: 'out' as const, icon: '🏠', date: 'Hoje' },
    { name: 'Supermercado', desc: 'Carrefour', amount: 487.32, type: 'out' as const, icon: '🍔', date: 'Ontem' },
    { name: 'Freelance', desc: 'Projeto App', amount: 4500, type: 'in' as const, icon: '💻', date: 'Ontem' },
    { name: 'Netflix', desc: 'Assinatura', amount: 55.90, type: 'out' as const, icon: '📱', date: '27 Fev' },
]

const GOALS_PREVIEW = [
    { name: 'Viagem Europa', pct: 74, color: C.blue },
    { name: 'Reserva Emergência', pct: 90, color: C.emerald },
    { name: 'Carro Novo', pct: 40, color: C.violet },
]

const ALERTS = [
    { text: 'Boleto CPFL vence em 3 dias', type: 'warning', href: '/boletos' },
    { text: 'Orçamento de Alimentação a 117%', type: 'danger', href: '/budgets' },
]

export default function DashboardPage() {
    const [showValues, setShowValues] = useState(true)
    const router = useRouter()
    const display = (v: number) => showValues ? fmt(v) : '•••••'

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Bem-vindo de volta 👋</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Aqui está o resumo das suas finanças</p>
                </motion.div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setShowValues(!showValues)} style={btnOutlineStyle}>
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showValues ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button onClick={() => router.push('/transactions')} style={btnGoldStyle}>
                        <Plus size={16} /> Nova Transação
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {ALERTS.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {ALERTS.map((a, i) => (
                        <button key={i} onClick={() => router.push(a.href)} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10,
                            background: 'none', border: `1px solid ${a.type === 'danger' ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'}`,
                            backgroundColor: a.type === 'danger' ? 'rgba(248,113,113,0.04)' : 'rgba(251,191,36,0.04)',
                            cursor: 'pointer', fontSize: 12,
                            color: a.type === 'danger' ? C.red : C.yellow,
                        }}>
                            <Bell size={12} /> {a.text}
                        </button>
                    ))}
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {SUMMARY.map((s, i) => {
                    const Icon = s.icon
                    const href = s.label === 'Investimentos' ? '/investments' : s.label.includes('Receita') || s.label.includes('Despesa') ? '/transactions' : '/accounts'
                    return (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => router.push(href)}
                            style={{ ...cardStyle, padding: 20, cursor: 'pointer' }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,88,0.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,88,0.06)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: C.textMuted }}>{s.label}</span>
                                <Icon size={16} style={{ color: s.color }} />
                            </div>
                            <p style={{ fontSize: 22, fontWeight: 700, color: s.label === 'Saldo Total' ? C.gold : s.positive ? C.emerald : C.red }}>
                                {display(s.value)}
                            </p>
                        </motion.div>
                    )
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}
                className="lg:grid-cols-[2fr_1fr]">
                {/* Recent Transactions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Últimas Transações</h3>
                        <button onClick={() => router.push('/transactions')} style={{
                            background: 'none', border: 'none', fontSize: 12, color: C.gold, cursor: 'pointer', fontWeight: 500,
                        }}>Ver todas →</button>
                    </div>

                    {RECENT_TX.map((tx, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.05 }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: i < RECENT_TX.length - 1 ? `1px solid ${C.border}` : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: tx.type === 'in' ? 'rgba(201,168,88,0.08)' : C.secondary, fontSize: 18,
                                }}>
                                    {tx.icon}
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{tx.name}</p>
                                    <p style={{ fontSize: 12, color: C.textMuted }}>{tx.desc} · {tx.date}</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: tx.type === 'in' ? C.emerald : C.text }}>
                                {tx.type === 'in' ? '+' : '-'}{display(tx.amount)}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Goals */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        style={{ ...cardStyle, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Metas</h3>
                            <button onClick={() => router.push('/goals')} style={{
                                background: 'none', border: 'none', fontSize: 12, color: C.gold, cursor: 'pointer', fontWeight: 500,
                            }}>Ver todas →</button>
                        </div>

                        {GOALS_PREVIEW.map((g, i) => (
                            <div key={g.name} style={{ marginBottom: i < GOALS_PREVIEW.length - 1 ? 16 : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, color: C.text }}>{g.name}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{g.pct}%</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 999, backgroundColor: C.secondary }}>
                                    <div style={{ height: '100%', width: `${g.pct}%`, borderRadius: 999, background: g.color, transition: 'width 1s ease' }} />
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                        style={{ ...cardStyle, padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 16 }}>Acesso Rápido</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                { label: 'Pagar Boleto', icon: '📄', href: '/boletos' },
                                { label: 'Investir', icon: '📈', href: '/investments' },
                                { label: 'Orçamento', icon: '💰', href: '/budgets' },
                                { label: 'Relatório', icon: '📊', href: '/reports' },
                            ].map(a => (
                                <button key={a.label} onClick={() => router.push(a.href)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10,
                                        backgroundColor: C.secondary, border: 'none', cursor: 'pointer',
                                        fontSize: 13, color: C.text, transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201,168,88,0.06)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.secondary}
                                >
                                    <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Insight */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        style={{ ...cardHlStyle, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Sparkles size={16} style={{ color: C.gold }} />
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.gold }}>Insight da IA</h3>
                        </div>
                        <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                            Seus gastos com alimentação subiram 18% vs mês passado. Movendo R$ 5k da poupança para Tesouro Selic, você ganharia R$ 42/mês a mais.
                        </p>
                        <button onClick={() => router.push('/ai')} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                            fontSize: 12, fontWeight: 600, color: C.gold, background: 'none', border: 'none', cursor: 'pointer',
                        }}>
                            <Sparkles size={12} /> Ver análise completa
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
