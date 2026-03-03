import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ========== GET — lista budgets com gasto real calculado ==========
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Buscar budgets com join na categoria
        const { data: budgets, error: budgetErr } = await supabase
            .from('budgets')
            .select('*, categories(id, name, icon, color)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (budgetErr) throw budgetErr

        // Buscar gastos do mês atual por categoria
        const now = new Date()
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`

        const { data: expenses, error: expErr } = await supabase
            .from('transactions')
            .select('category_id, amount')
            .eq('user_id', user.id)
            .eq('type', 'expense')
            .gte('date', firstDay)
            .lte('date', lastDayStr)

        if (expErr) throw expErr

        // Somar gastos por category_id
        const spentMap: Record<string, number> = {}
        for (const e of (expenses ?? [])) {
            if (e.category_id) {
                spentMap[e.category_id] = (spentMap[e.category_id] ?? 0) + Number(e.amount)
            }
        }

        // Montar resultado enriquecido
        const result = (budgets ?? []).map(b => ({
            id: b.id,
            category_id: b.category_id,
            category_name: b.categories?.name ?? 'Geral',
            category_icon: b.categories?.icon ?? '📦',
            category_color: b.categories?.color ?? '#6b7280',
            amount: Number(b.amount),
            spent: spentMap[b.category_id] ?? 0,
            alert_threshold: b.alert_threshold ?? 80,
            period: b.period ?? 'monthly',
            created_at: b.created_at,
            updated_at: b.updated_at,
        }))

        return NextResponse.json({ data: result })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ========== POST — criar/upsert orçamento ==========
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { category_id, amount, alert_threshold, period } = body

        if (!category_id || !amount) {
            return NextResponse.json({ error: 'Categoria e limite são obrigatórios' }, { status: 400 })
        }

        // Upsert: se já existe budget pra essa categoria, atualiza
        const { data: existing } = await supabase
            .from('budgets')
            .select('id')
            .eq('user_id', user.id)
            .eq('category_id', category_id)
            .eq('period', period ?? 'monthly')
            .single()

        let result
        if (existing) {
            const { data, error } = await supabase
                .from('budgets')
                .update({
                    amount: parseFloat(amount),
                    alert_threshold: alert_threshold ?? 80,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .select()
                .single()
            if (error) throw error
            result = data
        } else {
            const { data, error } = await supabase
                .from('budgets')
                .insert({
                    user_id: user.id,
                    category_id,
                    amount: parseFloat(amount),
                    alert_threshold: alert_threshold ?? 80,
                    period: period ?? 'monthly',
                })
                .select()
                .single()
            if (error) throw error
            result = data
        }

        return NextResponse.json({ data: result }, { status: 201 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ========== PATCH ==========
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

        delete updates.user_id
        delete updates.created_at

        if (updates.amount != null) updates.amount = parseFloat(updates.amount)

        const { data, error } = await supabase
            .from('budgets')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ========== DELETE ==========
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
