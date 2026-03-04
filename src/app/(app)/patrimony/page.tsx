'use client'

import { motion } from 'framer-motion'
import {
    Wallet, TrendingUp, Building2, Landmark, ArrowUpRight, ArrowDownRight,
    Eye, EyeOff, Loader2, PiggyBank, Bitcoin, Globe, BarChart3,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { C, cardStyle, cardHlStyle, btnOutlineStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'

type AssetGroup = {
    name: string; icon: string; value: number; color: string
    subItems: Array<{ name: string; value: number }>
}
type Liability = { name: string; value: number; color: string; detail: string }
type HistoryItem = { label: string; value: number }

type PatrimonyData = {
    netWorth: number
    totalAssets: number
    totalLiabilities: number
    change: number
    changePct: number
    debtRatio: number
    assetGroups: AssetGroup[]
    liabilities: Liability[]
    history: HistoryItem[]
    investmentReturn: number
    totalInvested: number
    totalInvCurrent: number
}

const ICON_MAP: Record<string, typeof Wallet> = {
    bank: Building2,
    investments: TrendingUp,
    property: Landmark,
    savings: PiggyBank,
    crypto: Bitcoin,
    international: Globe,
}

export default function PatrimonyPage() {
    const [data, setData] = useState<PatrimonyData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showValues, setShowValues] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/patrimony')
            if (!res.ok) throw new Error()
            const json = await res.json()
            setData(json.data)
        } catch {
            setData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const display = (v: number) => showValues ? fmt(v) : '•••••'

    if (loading) {
        return (
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>Patrimônio</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Calculando patrimônio...</p>
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
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Patrimônio</h1>
                <div style={{ ...cardStyle, padding: 40, textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: C.textMuted }}>Erro ao carregar patrimônio.</p>
                    <button onClick={fetchData} style={{ ...btnOutlineStyle, marginTop: 16 }}>Tentar novamente</button>
                </div>
            </div>
        )
    }

    const { netWorth, totalAssets, totalLiabilities, change, changePct, debtRatio, assetGroups, liabilities, history, investmentReturn, totalInvested, totalInvCurrent } = data
    const maxH = Math.max(...history.map(h => h.value), 1)

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Patrimônio</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Visão completa do seu patrimônio líquido</p>
                </motion.div>
                <button onClick={() => setShowValues(!showValues)} style={btnOutlineStyle}>
                    {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showValues ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>

            {/* Net Worth Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ ...cardHlStyle, padding: 48, textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: C.textMuted }}>Patrimônio Líquido</p>
                <p style={{ fontSize: 42, fontWeight: 700, marginTop: 8 }}>
                    <GoldText>{display(netWorth)}</GoldText>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                    {change >= 0 ? <ArrowUpRight size={18} style={{ color: C.emerald }} /> : <ArrowDownRight size={18} style={{ color: C.red }} />}
                    <span style={{ fontSize: 14, fontWeight: 500, color: change >= 0 ? C.emerald : C.red }}>
                        {display(Math.abs(change))} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%)
                    </span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>vs mês anterior</span>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total de Ativos', value: display(totalAssets), color: C.emerald },
                    { label: 'Total de Passivos', value: display(totalLiabilities), color: C.red },
                    { label: 'Endividamento', value: `${debtRatio}%`, color: debtRatio <= 30 ? C.emerald : debtRatio <= 50 ? C.yellow : C.red },
                    { label: 'Retorno Investimentos', value: `${investmentReturn >= 0 ? '+' : ''}${investmentReturn}%`, color: investmentReturn >= 0 ? C.emerald : C.red },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                        style={{ ...cardStyle, padding: 20 }}>
                        <p style={{ fontSize: 13, color: C.textMuted }}>{s.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Evolução Patrimonial */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 24 }}>
                    <BarChart3 size={18} style={{ color: C.gold }} /> Evolução Patrimonial
                </h3>
                {history.length === 0 ? (
                    <p style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Sem dados suficientes</p>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                        {history.map((h, i) => {
                            const height = maxH > 0 ? (h.value / maxH) * 100 : 0
                            const isLast = i === history.length - 1
                            return (
                                <div key={h.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 10, color: C.textMuted }}>
                                        {showValues ? `R$${(h.value / 1000).toFixed(0)}k` : '•••'}
                                    </span>
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                                        style={{ width: '100%', borderRadius: '8px 8px 0 0', minHeight: 8, background: isLast ? C.goldGrad : C.secondary }} />
                                    <span style={{ fontSize: 10, color: isLast ? C.gold : C.textMuted, fontWeight: isLast ? 600 : 400 }}>{h.label}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </motion.div>

            {/* Ativos & Passivos lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                {/* Ativos */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.emerald, marginBottom: 20 }}>
                        <ArrowUpRight size={18} /> Ativos
                    </h3>

                    {assetGroups.length === 0 ? (
                        <p style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Nenhum ativo cadastrado</p>
                    ) : (
                        <>
                            {/* Composição visual */}
                            <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
                                {assetGroups.map(g => (
                                    <motion.div key={g.name}
                                        initial={{ width: 0 }} animate={{ width: `${totalAssets > 0 ? (g.value / totalAssets) * 100 : 0}%` }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                        style={{ height: '100%', backgroundColor: g.color }}
                                        title={`${g.name}: ${((g.value / totalAssets) * 100).toFixed(1)}%`}
                                    />
                                ))}
                            </div>

                            {assetGroups.map(asset => {
                                const Icon = ICON_MAP[asset.icon] ?? Wallet
                                return (
                                    <div key={asset.name} style={{ marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${asset.color}15` }}>
                                                    <Icon size={16} style={{ color: asset.color }} />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{asset.name}</span>
                                                    <span style={{ display: 'block', fontSize: 11, color: C.textMuted }}>
                                                        {totalAssets > 0 ? ((asset.value / totalAssets) * 100).toFixed(1) : 0}% do total
                                                    </span>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{display(asset.value)}</span>
                                        </div>
                                        <div style={{ marginLeft: 40 }}>
                                            {asset.subItems.map(sub => (
                                                <div key={sub.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                                                    <span style={{ color: C.textMuted }}>{sub.name}</span>
                                                    <span style={{ color: 'rgba(235,230,218,0.8)' }}>{display(sub.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </motion.div>

                {/* Passivos */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.red, marginBottom: 20 }}>
                        <ArrowDownRight size={18} /> Passivos & Dívidas
                    </h3>

                    {liabilities.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>
                            <p style={{ fontSize: 36, marginBottom: 8 }}>🎉</p>
                            <p style={{ fontWeight: 600, color: C.emerald, marginBottom: 4 }}>Sem dívidas!</p>
                            <p style={{ fontSize: 12, color: C.textMuted }}>Você não possui passivos pendentes.</p>
                        </div>
                    ) : (
                        liabilities.map((l, i) => (
                            <div key={i} style={{ padding: 16, borderRadius: 12, backgroundColor: C.secondary, marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: l.color }} />
                                        <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{l.name}</span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{display(l.value)}</span>
                                </div>
                                <p style={{ fontSize: 12, color: C.textMuted, marginLeft: 16 }}>{l.detail}</p>
                            </div>
                        ))
                    )}

                    {/* Investimentos Resumo */}
                    {totalInvested > 0 && (
                        <div style={{ marginTop: 20, padding: 16, borderRadius: 12, border: `1px solid ${C.borderGold}`, backgroundColor: 'rgba(201,168,88,0.03)' }}>
                            <h4 style={{ fontSize: 13, fontWeight: 600, color: C.gold, marginBottom: 12 }}>💰 Resumo Investimentos</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                <span style={{ color: C.textMuted }}>Total investido</span>
                                <span style={{ color: C.text, fontWeight: 500 }}>{display(totalInvested)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                <span style={{ color: C.textMuted }}>Valor atual</span>
                                <span style={{ color: C.text, fontWeight: 500 }}>{display(totalInvCurrent)}</span>
                            </div>
                            <div style={{ height: 1, backgroundColor: C.border, margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span style={{ color: C.textMuted }}>Lucro/Prejuízo</span>
                                <span style={{ fontWeight: 600, color: totalInvCurrent >= totalInvested ? C.emerald : C.red }}>
                                    {display(Math.abs(totalInvCurrent - totalInvested))} ({investmentReturn >= 0 ? '+' : ''}{investmentReturn}%)
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
