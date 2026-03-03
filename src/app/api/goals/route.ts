import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ========== GET ==========
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// ========== POST ==========
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { name, target_amount, target_date, monthly_contribution, icon, color } = body

        if (!name || !target_amount) {
            return NextResponse.json({ error: 'Nome e Valor Total são obrigatórios' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('goals')
            .insert({
                user_id: user.id,
                name,
                target_amount: parseFloat(target_amount),
                current_amount: 0,
                target_date: target_date || null,
                monthly_contribution: monthly_contribution ? parseFloat(monthly_contribution) : null,
                icon: icon || '🎯',
                color: color || '#3b82f6',
                priority: 1
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data }, { status: 201 })
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

        const { data: existing } = await supabase
            .from('goals')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!existing) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })

        delete updates.user_id
        delete updates.created_at

        if (updates.target_amount != null) updates.target_amount = parseFloat(updates.target_amount)
        if (updates.current_amount != null) updates.current_amount = parseFloat(updates.current_amount)
        if (updates.monthly_contribution != null) updates.monthly_contribution = parseFloat(updates.monthly_contribution)

        const { data, error } = await supabase
            .from('goals')
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
            .from('goals')
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
