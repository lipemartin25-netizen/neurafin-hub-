import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const months = parseInt(searchParams.get('months') ?? '6', 10)

        const now = new Date()

        // ========== Buscar transações dos últimos N meses ==========
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
        const startStr = startDate.toISOString().split('T')[0]

        const [txRes, categoriesRes, accountsRes, profileRes] = await Promise.all([
            supabase
                .from('transactions')
                .select('amount, type, date, category_id, description, account_id')
                .eq('user_id', user.id)
                .gte('date', startStr)
                .order('date', { ascending: true }),
            supabase
                .from('categories')
                .select('id, name, icon, color, type')
                .eq('user_id', user.id),
            supabase
                .from('accounts')
                .select('id, name, balance, type')
                .eq('user_id', user.id)
                .eq('is_active', true),
            supabase
                .from('profiles')
                .select('monthly_income, currency')
                .eq('id', user.id)
                .single(),
        ])

        const transactions = txRes.data ?? []
        const categories = categoriesRes.data ?? []
        const accounts = accountsRes.data ?? []
        const profile = profileRes.data

        // ========== Mapear categorias por ID ==========
        const catMap = new Map(categories.map(c => [c.id, c]))

        // ========== Dados mensais ==========
        const monthlyMap: Record<string, { income: number; expense: number; label: string; year: number; month: number }> = {}

        for (let i = 0; i < months; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('. de ', '/').replace('.', '')
            monthlyMap[key] = { income: 0, expense: 0, label, year: d.getFullYear(), month: d.getMonth() }
        }

        // ========== Gastos por categoria (mês atual) ==========
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const categoryTotals: Record<string, number> = {}
        const categoryTotalsAllPeriod: Record<string, number> = {}

        // ========== Gastos por dia (mês atual) para daily chart ==========
        const dailyExpense: Record<string, number> = {}
        const dailyIncome: Record<string, number> = {}

        // ========== Top transações do mês ==========
        const currentMonthTx: Array<{
            description: string
            amount: number
            type: string
            date: string
            category_name: string
            category_color: string
            category_icon: string
        }> = []

        for (const tx of transactions) {
            const txDate = tx.date as string
            const [y, m] = txDate.split('-')
            const key = `${y}-${m}`
            const amount = Number(tx.amount)

            if (monthlyMap[key]) {
                if (tx.type === 'income') monthlyMap[key].income += amount
                if (tx.type === 'expense') monthlyMap[key].expense += amount
            }

            // Categoria totals — período inteiro
            if (tx.type === 'expense' && tx.category_id) {
                categoryTotalsAllPeriod[tx.category_id] = (categoryTotalsAllPeriod[tx.category_id] ?? 0) + amount
            }

            // Dados do mês atual
            if (key === currentKey) {
                if (tx.type === 'expense' && tx.category_id) {
                    categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] ?? 0) + amount
                }

                // Daily
                const day = txDate
                if (tx.type === 'expense') dailyExpense[day] = (dailyExpense[day] ?? 0) + amount
                if (tx.type === 'income') dailyIncome[day] = (dailyIncome[day] ?? 0) + amount

                // Top transações
                const cat = tx.category_id ? catMap.get(tx.category_id) : null
                currentMonthTx.push({
                    description: tx.description ?? 'Sem descrição',
                    amount,
                    type: tx.type as string,
                    date: txDate,
                    category_name: cat?.name ?? 'Sem categoria',
                    category_color: cat?.color ?? '#6b7280',
                    category_icon: cat?.icon ?? '📌',
                })
            }
        }

        // ========== Montar arrays ==========
        const monthly = Object.values(monthlyMap)

        // Categorias do mês atual — ordenadas por valor
        const totalExpenseMonth = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
        const categoryBreakdown = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([catId, amount]) => {
                const cat = catMap.get(catId)
                return {
                    id: catId,
                    name: cat?.name ?? 'Sem categoria',
                    icon: cat?.icon ?? '📌',
                    color: cat?.color ?? '#6b7280',
                    amount,
                    pct: totalExpenseMonth > 0 ? Math.round((amount / totalExpenseMonth) * 1000) / 10 : 0,
                }
            })

        // Top 10 transações do mês (maiores despesas)
        const topExpenses = currentMonthTx
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10)

        // Daily chart — últimos 30 dias
        const dailyChart: Array<{ date: string; label: string; expense: number; income: number }> = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().split('T')[0]
            dailyChart.push({
                date: key,
                label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                expense: dailyExpense[key] ?? 0,
                income: dailyIncome[key] ?? 0,
            })
        }

        // ========== Mês atual vs anterior ==========
        const prevKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`
        const currentMonth = monthlyMap[currentKey] ?? { income: 0, expense: 0 }
        const prevMonth = monthlyMap[prevKey] ?? { income: 0, expense: 0 }

        const patrimony = accounts
            .filter(a => a.type !== 'credit_card')
            .reduce((s, a) => s + Number(a.balance), 0)

        // ========== Média dos meses ==========
        const avgIncome = monthly.reduce((s, m) => s + m.income, 0) / Math.max(monthly.length, 1)
        const avgExpense = monthly.reduce((s, m) => s + m.expense, 0) / Math.max(monthly.length, 1)

        return NextResponse.json({
            data: {
                monthly,
                categoryBreakdown,
                topExpenses,
                dailyChart,
                summary: {
                    currentIncome: currentMonth.income,
                    currentExpense: currentMonth.expense,
                    currentSaving: currentMonth.income - currentMonth.expense,
                    prevIncome: prevMonth.income,
                    prevExpense: prevMonth.expense,
                    prevSaving: prevMonth.income - prevMonth.expense,
                    patrimony,
                    avgIncome: Math.round(avgIncome * 100) / 100,
                    avgExpense: Math.round(avgExpense * 100) / 100,
                    savingRate: currentMonth.income > 0
                        ? Math.round((1 - currentMonth.expense / currentMonth.income) * 1000) / 10
                        : 0,
                    monthlyIncome: profile?.monthly_income ? Number(profile.monthly_income) : null,
                },
                period: { months, currentMonth: currentKey },
            },
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
