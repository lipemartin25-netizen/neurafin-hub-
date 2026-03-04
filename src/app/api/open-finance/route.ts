import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createConnectToken, fetchAccounts, fetchTransactions, fetchItem } from '@/lib/pluggy'
export const dynamic = 'force-dynamic'
// GET — listar conexões + criar connect token
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const action = request.nextUrl.searchParams.get('action')
        if (action === 'connect_token') {
            if (!process.env.PLUGGY_CLIENT_ID) {
                return NextResponse.json({ error: 'Pluggy não configurado', demo: true }, { status: 200 })
            }
            const token = await createConnectToken(user.id)
            return NextResponse.json({ connectToken: token })
        }
        // Listar conexões
        const { data: connections } = await supabase
            .from('open_finance_connections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        return NextResponse.json({ data: connections ?? [] })
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
    }
}
// POST — sincronizar contas e transações de uma conexão
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const { action, itemId, connectorName, connectorLogo } = await request.json()
        // Salvar nova conexão
        if (action === 'save_connection') {
            await supabase.from('open_finance_connections').upsert({
                user_id: user.id,
                item_id: itemId,
                connector_name: connectorName,
                connector_logo: connectorLogo,
                status: 'active',
                last_sync_at: new Date().toISOString(),
            }, { onConflict: 'user_id,item_id' })
            return NextResponse.json({ success: true })
        }
        // Sincronizar
        if (action === 'sync') {
            if (!process.env.PLUGGY_CLIENT_ID) {
                return NextResponse.json({ error: 'Pluggy não configurado' }, { status: 400 })
            }
            // Buscar contas do Pluggy
            const { results: pluggyAccounts } = await fetchAccounts(itemId)
            let totalImported = 0
            for (const pa of pluggyAccounts) {
                // Verificar se conta já existe
                const { data: existingAccount } = await supabase
                    .from('accounts')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('open_finance_id', pa.id)
                    .single()
                let accountId = existingAccount?.id
                if (!accountId) {
                    // Criar conta
                    const type = pa.type === 'BANK' ? 'checking'
                        : pa.type === 'CREDIT' ? 'credit_card'
                            : pa.subtype === 'SAVINGS_ACCOUNT' ? 'savings'
                                : 'checking'
                    const { data: newAccount } = await supabase
                        .from('accounts')
                        .insert({
                            user_id: user.id,
                            name: pa.name || 'Conta Importada',
                            type,
                            bank_name: pa.bankData?.transferNumber ?? null,
                            balance: pa.balance ?? 0,
                            open_finance_id: pa.id,
                            color: '#c9a858',
                        })
                        .select('id')
                        .single()
                    accountId = newAccount?.id
                } else {
                    // Atualizar saldo
                    await supabase.from('accounts').update({
                        balance: pa.balance ?? 0,
                        updated_at: new Date().toISOString(),
                    }).eq('id', accountId)
                }
                if (!accountId) continue
                // Importar transações (últimos 30 dias)
                const to = new Date().toISOString().split('T')[0]
                const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
                const { results: pluggyTxs } = await fetchTransactions(pa.id, from, to)
                for (const pt of pluggyTxs) {
                    // Evitar duplicatas
                    const { data: existingTx } = await supabase
                        .from('transactions')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('open_finance_id', pt.id)
                        .single()
                    if (!existingTx) {
                        await supabase.from('transactions').insert({
                            user_id: user.id,
                            account_id: accountId,
                            amount: Math.abs(pt.amount),
                            type: pt.amount >= 0 ? 'income' : 'expense',
                            description: pt.description || pt.descriptionRaw || 'Transação importada',
                            date: pt.date?.split('T')[0] ?? to,
                            open_finance_id: pt.id,
                        })
                        totalImported++
                    }
                }
            }
            // Atualizar last_sync
            await supabase.from('open_finance_connections').update({
                last_sync_at: new Date().toISOString(),
                status: 'active',
            }).eq('user_id', user.id).eq('item_id', itemId)
            return NextResponse.json({ success: true, imported: totalImported })
        }
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
    }
}
// DELETE — remover conexão
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const itemId = request.nextUrl.searchParams.get('itemId')
        if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })
        await supabase.from('open_finance_connections')
            .delete()
            .eq('user_id', user.id)
            .eq('item_id', itemId)
        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
    }
}
