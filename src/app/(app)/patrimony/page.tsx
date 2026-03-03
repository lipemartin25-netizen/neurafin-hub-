'use client'

import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Building2, Car, Landmark, ArrowUpRight, ArrowDownRight, Plus, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'

const ICON_MAP: Record<string, any> = { investments: TrendingUp, bank: Building2, property: Landmark, vehicle: Car, savings: Wallet }

const ASSETS = [
    {
        name: 'Investimentos', icon: 'investments', value: 188400, color: C.emerald, subItems: [
            { name: 'Renda Fixa', value: 100300 }, { name: 'Ações', value: 27100 }, { name: 'FIIs', value: 35700 }, { name: 'Cripto', value: 25300 },
        ]
    },
    {
        name: 'Contas Bancárias', icon: 'bank', value: 24321.25, color: C.blue, subItems: [
            { name: 'Nubank', value: 12450.80 }, { name: 'Itaú', value: 8320.45 }, { name: 'Inter', value: 3200 }, { name: 'Carteira', value: 350 },
        ]
    },
    {
        name: 'Imóveis', icon: 'property', value: 450000, color: C.violet, subItems: [
            { name: 'Apartamento Campinas', value: 450000 },
        ]
    },
    {
        name: 'Veículos', icon: 'vehicle', value: 85000, color: C.yellow, subItems: [
            { name: 'Honda Civic 2024', value: 85000 },
        ]
    },
    {
        name: 'Poupança', icon: 'savings', value: 45000, color: C.cyan, subItems: [
            { name: 'Poupança BB', value: 45000 },
        ]
    },
]

const LIABILITIES = [
    { name: 'Financiamento Imóvel', value: 280000, monthly: 3200, remaining: 240, color: C.red },
    { name: 'Financiamento Carro', value: 42000, monthly: 1800, remaining: 24, color: C.orange },
    { name: 'Cartão Nubank', value: 4250, monthly: 4250, remaining: 1, color: C.violet },
    { name: 'Cartão Itaú', value: 12450, monthly: 12450, remaining: 1, color: C.blue },
]

const HISTORY = [
    { month: 'Set/25', value: 420000 },
    { month: 'Out/25', value: 435000 },
    { month: 'Nov/25', value: 448000 },
    { month: 'Dez/25', value: 462000 },
    { month: 'Jan/26', value: 471000 },
    { month: 'Fev/26', value: 454021 },
]

export default function PatrimonyPage() {
    const router = useRouter()
    const [showValues, setShowValues] = useState(true)
    const display = (v: number) => showValues ? fmt(v) : '•••••'
    const totalAssets = ASSETS.reduce((s, a) => s + a.value, 0)
    const totalLiabilities = LIABILITIES.reduce((s, l) => s + l.value, 0)
    const netWorth = totalAssets - totalLiabilities
    const prev = HISTORY[HISTORY.length - 2]?.value || netWorth
    const change = netWorth - prev
    const changePct = prev ? (change / prev) * 100 : 0
    const maxH = Math.max(...HISTORY.map(h => h.value))

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Patrimônio</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Visão completa do seu patrimônio líquido</p>
                </motion.div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setShowValues(!showValues)} style={btnOutlineStyle}>
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showValues ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button style={btnGoldStyle}><Plus size={16} /> Novo Ativo</button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ ...cardHlStyle, padding: 48, textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: C.textMuted }}>Patrimônio Líquido</p>
                <p style={{ fontSize: 42, fontWeight: 700, marginTop: 8 }}><GoldText>{display(netWorth)}</GoldText></p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                    {change >= 0 ? <ArrowUpRight size={18} style={{ color: C.emerald }} /> : <ArrowDownRight size={18} style={{ color: C.red }} />}
                    <span style={{ fontSize: 14, fontWeight: 500, color: change >= 0 ? C.emerald : C.red }}>
                        {display(Math.abs(change))} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%)
                    </span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>vs mês anterior</span>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total de Ativos', value: display(totalAssets), color: C.emerald },
                    { label: 'Total de Passivos', value: display(totalLiabilities), color: C.red },
                    { label: 'Endividamento', value: `${((totalLiabilities / totalAssets) * 100).toFixed(1)}%`, color: C.gold },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                        style={{ ...cardStyle, padding: 20 }}>
                        <p style={{ fontSize: 13, color: C.textMuted }}>{s.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontWeight: 600, color: C.text, marginBottom: 24 }}>Evolução Patrimonial</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                    {HISTORY.map((h, i) => {
                        const height = maxH > 0 ? (h.value / maxH) * 100 : 0
                        const isLast = i === HISTORY.length - 1
                        return (
                            <div key={h.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 10, color: C.textMuted }}>{showValues ? `R$${(h.value / 1000).toFixed(0)}k` : '•••'}</span>
                                <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                                    style={{ width: '100%', borderRadius: '8px 8px 0 0', minHeight: 8, background: isLast ? C.goldGrad : C.secondary }} />
                                <span style={{ fontSize: 10, color: C.textMuted }}>{h.month}</span>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.emerald, marginBottom: 20 }}>
                        <ArrowUpRight size={18} /> Ativos
                    </h3>
                    {ASSETS.map((asset, i) => {
                        const Icon = ICON_MAP[asset.icon] || Wallet
                        return (
                            <div key={asset.name} style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${asset.color}15` }}>
                                            <Icon size={16} style={{ color: asset.color }} />
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{asset.name}</span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{display(asset.value)}</span>
                                </div>
                                <div style={{ marginLeft: 40 }}>
                                    {asset.subItems.map(sub => (
                                        <div key={sub.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                                            <span style={{ color: C.textMuted }}>{sub.name}</span>
                                            <span style={{ color: 'rgba(235,230,218,0.8)' }}>{display(sub.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.red, marginBottom: 20 }}>
                        <ArrowDownRight size={18} /> Passivos & Dívidas
                    </h3>
                    {LIABILITIES.map((l) => (
                        <div key={l.name} style={{ padding: 16, borderRadius: 12, backgroundColor: C.secondary, marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: l.color }} />
                                    <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{l.name}</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{display(l.value)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.textMuted }}>
                                <span>Parcela: {display(l.monthly)}</span>
                                <span>Restam: {l.remaining} parcela{l.remaining !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
