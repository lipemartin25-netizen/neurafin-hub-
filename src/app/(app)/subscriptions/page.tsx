'use client'

import { motion } from 'framer-motion'
import { CreditCard, AlertCircle, CheckCircle2, Loader2, RefreshCw, TrendingDown } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { C, cardStyle, cardHlStyle, btnOutlineStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'
import { useApp } from '@/contexts/AppContext'
import { getThemeColors } from '@/lib/themeColors'

type Subscription = {
    description: string; averageAmount: number; frequency: string
    occurrences: number; lastDate: string; nextEstimatedDate: string
    categoryName: string; categoryIcon: string; status: 'active' | 'possibly_cancelled'
}

type SubData = {
    subscriptions: Subscription[]; totalMonthly: number
    totalYearly: number; count: number; activeCount: number
}

const FREQ_LABEL: Record<string, string> = {
    weekly: 'Semanal', monthly: 'Mensal', quarterly: 'Trimestral', yearly: 'Anual',
}

export default function SubscriptionsPage() {
    const { theme } = useApp()
    const TC = getThemeColors(theme)
    const [data, setData] = useState<SubData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetch_ = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/subscriptions')
            if (!res.ok) throw new Error()
            const json = await res.json()
            setData(json.data)
        } catch { setData(null) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetch_() }, [fetch_])

    if (loading) return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: TC.text }}>Assinaturas</h1>
            <div style={{ ...cardStyle, padding: 80, display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Loader2 size={32} style={{ color: TC.gold, animation: 'spin 1s linear infinite' }} />
            </div>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (!data || !data.subscriptions) return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: TC.text }}>Assinaturas</h1>
            <div style={{ ...cardStyle, padding: 40, textAlign: 'center', marginTop: 24 }}>
                <p style={{ color: TC.textMuted }}>Erro ao detectar assinaturas.</p>
                <button onClick={fetch_} style={{ ...btnOutlineStyle, marginTop: 16 }}>Tentar novamente</button>
            </div>
        </div>
    )

    const { subscriptions, totalMonthly, totalYearly, activeCount } = data

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: TC.text }}>Assinaturas</h1>
                    <p style={{ fontSize: 14, color: TC.textMuted, marginTop: 4 }}>
                        Detectadas automaticamente com base nas suas transações
                    </p>
                </motion.div>
                <button onClick={fetch_} style={{ ...btnOutlineStyle }}>
                    <RefreshCw size={16} /> Atualizar
                </button>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ ...cardHlStyle, padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: TC.textMuted }}>Gasto Mensal</p>
                    <p style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}><GoldText>{fmt(totalMonthly)}</GoldText></p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    style={{ ...cardStyle, padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: TC.textMuted }}>Gasto Anual</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: TC.red, marginTop: 4 }}>{fmt(totalYearly)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...cardStyle, padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: TC.textMuted }}>Assinaturas Ativas</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: TC.emerald, marginTop: 4 }}>{activeCount}</p>
                </motion.div>
            </div>

            {/* Subscriptions List */}
            {subscriptions.length === 0 ? (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <CreditCard size={40} style={{ color: 'rgba(107,114,128,0.3)', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 16, fontWeight: 500, color: C.textMuted }}>Nenhuma assinatura detectada</p>
                    <p style={{ fontSize: 13, color: 'rgba(107,114,128,0.5)', marginTop: 8 }}>
                        Adicione mais transações para que o sistema detecte padrões recorrentes
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {subscriptions.map((sub, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.04 }}
                            style={{
                                ...cardStyle, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                borderLeft: `3px solid ${sub.status === 'active' ? C.emerald : C.yellow}`,
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: C.secondary, fontSize: 20,
                                }}>
                                    {sub.categoryIcon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{sub.description}</p>
                                        {sub.status === 'active' ? (
                                            <CheckCircle2 size={14} style={{ color: C.emerald, flexShrink: 0 }} />
                                        ) : (
                                            <AlertCircle size={14} style={{ color: C.yellow, flexShrink: 0 }} />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>
                                            {FREQ_LABEL[sub.frequency] ?? sub.frequency}
                                        </span>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>
                                            {sub.occurrences}x nos últimos 3 meses
                                        </span>
                                        <span style={{ fontSize: 11, color: C.textMuted }}>
                                            {sub.categoryName}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: C.textMuted2 }}>
                                            Última: {new Date(sub.lastDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <span style={{ fontSize: 11, color: sub.status === 'active' ? C.gold : C.yellow }}>
                                            Próxima: {new Date(sub.nextEstimatedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmt(sub.averageAmount)}</p>
                                <p style={{ fontSize: 10, color: C.textMuted }}>/{FREQ_LABEL[sub.frequency]?.toLowerCase() ?? 'mês'}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Dica */}
            {subscriptions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    style={{ ...cardStyle, padding: 20, marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <TrendingDown size={18} style={{ color: C.gold, flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>💡 Dica para economizar</p>
                        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                            Revise suas assinaturas periodicamente. Muitas pessoas pagam por serviços que não usam.
                            {totalYearly > 1000 && ` Cancelar apenas 1 serviço de R$ ${fmt(totalMonthly / activeCount)} te economizaria ${fmt(totalMonthly / activeCount * 12)} por ano.`}
                        </p>
                    </div>
                </motion.div>
            )}

            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
