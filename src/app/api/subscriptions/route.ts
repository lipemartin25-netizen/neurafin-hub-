import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — detectar e listar assinaturas recorrentes
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Buscar últimos 3 meses de transações
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        const { data: transactions } = await supabase
            .from('transactions')
            .select('id, description, amount, type, date, category_id, categories(name, icon)')
            .eq('user_id', user.id)
            .eq('type', 'expense')
            .gte('date', threeMonthsAgo.toISOString().split('T')[0])
            .order('date', { ascending: false })

        if (!transactions || transactions.length === 0) {
            return NextResponse.json({ data: { subscriptions: [], totalMonthly: 0 } })
        }

        // Agrupar por descrição normalizada
        const groups: Record<string, {
            description: string
            amounts: number[]
            dates: string[]
            categoryName: string
            categoryIcon: string
            categoryId: string | null
            txIds: string[]
        }> = {}

        for (const tx of transactions) {
            // Normalizar descrição (remover números, datas, IDs)
            const normalized = tx.description
                .toLowerCase()
                .replace(/\d{2}\/\d{2}/g, '')   // remover datas
                .replace(/\d{4,}/g, '')          // remover números longos
                .replace(/\s+/g, ' ')
                .replace(/parcela \d+\/\d+/gi, '')
                .replace(/ref[.:]\s?\w+/gi, '')
                .trim()

            const key = normalized.substring(0, 40) // Agrupar por primeiros 40 chars

            if (!groups[key]) {
                groups[key] = {
                    description: tx.description,
                    amounts: [],
                    dates: [],
                    categoryName: (tx.categories as { name: string } | null)?.name ?? 'Sem categoria',
                    categoryIcon: (tx.categories as { icon: string } | null)?.icon ?? '📦',
                    categoryId: tx.category_id,
                    txIds: [],
                }
            }

            groups[key].amounts.push(Number(tx.amount))
            groups[key].dates.push(tx.date)
            groups[key].txIds.push(tx.id)
        }

        // Filtrar: assinatura = aparece >= 2 vezes com valor similar
        const subscriptions: Array<{
            description: string
            averageAmount: number
            frequency: string
            occurrences: number
            lastDate: string
            nextEstimatedDate: string
            categoryName: string
            categoryIcon: string
            categoryId: string | null
            status: 'active' | 'possibly_cancelled'
        }> = []

        const now = new Date()

        for (const [, group] of Object.entries(groups)) {
            if (group.amounts.length < 2) continue

            // Verificar se valores são similares (±20%)
            const avg = group.amounts.reduce((s, a) => s + a, 0) / group.amounts.length
            const allSimilar = group.amounts.every(a => Math.abs(a - avg) / avg < 0.2)
            if (!allSimilar) continue

            // Calcular frequência baseada nos intervalos
            const sortedDates = group.dates.map(d => new Date(d + 'T12:00:00')).sort((a, b) => a.getTime() - b.getTime())
            const intervals: number[] = []
            for (let i = 1; i < sortedDates.length; i++) {
                intervals.push(Math.round((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / 86400000))
            }

            const avgInterval = intervals.length > 0 ? intervals.reduce((s, i) => s + i, 0) / intervals.length : 30

            let frequency = 'monthly'
            if (avgInterval <= 10) frequency = 'weekly'
            else if (avgInterval <= 45) frequency = 'monthly'
            else if (avgInterval <= 100) frequency = 'quarterly'
            else frequency = 'yearly'

            const lastDate = sortedDates[sortedDates.length - 1]
            const nextEstimated = new Date(lastDate)
            nextEstimated.setDate(nextEstimated.getDate() + Math.round(avgInterval))

            const daysSinceLast = Math.round((now.getTime() - lastDate.getTime()) / 86400000)
            const status = daysSinceLast > avgInterval * 1.5 ? 'possibly_cancelled' as const : 'active' as const

            subscriptions.push({
                description: group.description,
                averageAmount: Math.round(avg * 100) / 100,
                frequency,
                occurrences: group.amounts.length,
                lastDate: lastDate.toISOString().split('T')[0],
                nextEstimatedDate: nextEstimated.toISOString().split('T')[0],
                categoryName: group.categoryName,
                categoryIcon: group.categoryIcon,
                categoryId: group.categoryId,
                status,
            })
        }

        // Ordenar por valor (maior primeiro)
        subscriptions.sort((a, b) => b.averageAmount - a.averageAmount)

        const totalMonthly = subscriptions
            .filter(s => s.status === 'active')
            .reduce((sum, s) => {
                if (s.frequency === 'weekly') return sum + s.averageAmount * 4.33
                if (s.frequency === 'monthly') return sum + s.averageAmount
                if (s.frequency === 'quarterly') return sum + s.averageAmount / 3
                if (s.frequency === 'yearly') return sum + s.averageAmount / 12
                return sum + s.averageAmount
            }, 0)

        return NextResponse.json({
            data: {
                subscriptions,
                totalMonthly: Math.round(totalMonthly * 100) / 100,
                totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
                count: subscriptions.length,
                activeCount: subscriptions.filter(s => s.status === 'active').length,
            },
        })
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
    }
}
