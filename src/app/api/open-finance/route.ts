import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createConnectToken, fetchAccounts, fetchTransactions, fetchItem, mapPluggyCategory } from '@/lib/pluggy'

export const dynamic = 'force-dynamic'
// GET — listar conexões + criar connect token
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const action = request.nextUrl.searchParams.get('action')
        if (action === 'connect_token') {
            const clientId = (process.env.PLUGGY_CLIENT_ID || '').trim()
            if (!clientId || clientId === 'your_client_id' || clientId.includes('xxx')) {
                return NextResponse.json({ error: 'Pluggy Credentials Missing', demo: true }, { status: 200 })
            }
            try {
                const response = await createConnectToken()
                // O Pluggy SDK retorna um objeto { accessToken: string }. 
                // Precisamos enviar apenas a string para o widget não quebrar.
                return NextResponse.json({ connectToken: response.accessToken })
            } catch (pluggyErr: any) {
                console.error('[Pluggy API Error]:', pluggyErr)
                // Se o Pluggy retornar 400, é porque as chaves são inválidas no portal deles
                return NextResponse.json({
                    error: `Pluggy Error: ${pluggyErr.message || 'Invalid Credentials'}`,
                    details: pluggyErr.response?.data || 'Check Pluggy Dashboard'
                }, { status: 400 })
            }
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
            const { error } = await supabase.from('open_finance_connections').upsert({
                user_id: user.id,
                item_id: itemId,
                connector_name: connectorName,
                connector_logo: connectorLogo,
                status: 'active',
                last_sync_at: new Date().toISOString(),
            } as any, { onConflict: 'user_id,item_id' })

            if (error) throw error
            return NextResponse.json({ success: true })
        }
        // Sincronizar
        if (action === 'sync') {
            if (!process.env.PLUGGY_CLIENT_ID) {
                return NextResponse.json({ error: 'Pluggy não configurado' }, { status: 400 })
            }

            console.log(`[Pluggy Sync] Iniciando sync para itemId: ${itemId}`)

            // 1. Aguardar item estar pronto (Pluggy pode demorar alguns segundos na primeira conexão)
            let itemReady = false
            let attempts = 0
            while (!itemReady && attempts < 5) {
                const item = await fetchItem(itemId)
                console.log(`[Pluggy Sync] Status do item: ${item.status} (tentativa ${attempts + 1})`)
                const status = (item.status as any)
                if (status === 'UPDATED' || status === 'PARTIAL_SUCCESS') {
                    itemReady = true
                } else if (status === 'LOGIN_ERROR' || status === 'OUTDATED') {
                    return NextResponse.json({ error: `Conexão com erro: ${item.status}` }, { status: 400 })
                } else {
                    attempts++
                    await new Promise(resolve => setTimeout(resolve, 3000))
                }
            }

            // 2. Buscar categorias do banco para mapeamento UUID
            const { data: dbCategories } = await supabase
                .from('categories')
                .select('id, name')

            const categoryMap: Record<string, string> = {}
            if (dbCategories) {
                dbCategories.forEach(c => {
                    categoryMap[c.name.toLowerCase()] = c.id
                })
            }

            // Bridge de tradução: slug interno do helper -> nome no banco
            const slugToName: Record<string, string> = {
                'food': 'alimentação',
                'transport': 'transporte',
                'housing': 'moradia',
                'health': 'saúde',
                'education': 'educação',
                'entertainment': 'lazer',
                'shopping': 'compras',
                'subscriptions': 'assinaturas',
                'utilities': 'moradia', // Fallback se não tiver 'Contas'
                'pets': 'pets',
                'personal': 'beleza',
                'salary': 'salário',
                'investments_return': 'investimentos'
            }

            // Buscar contas do Pluggy
            const { results: pluggyAccounts } = await fetchAccounts(itemId)
            console.log(`[Pluggy Sync] Contas encontradas: ${pluggyAccounts.length}`)
            let totalImported = 0

            for (const pa of pluggyAccounts) {
                // Verificar se conta já existe
                const { data: existingAccount } = await supabase
                    .from('accounts')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('open_finance_id', pa.id)
                    .maybeSingle()

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
                            bank_name: (pa as any).brand || (pa as any).bankData?.name || 'Banco',
                            balance: pa.balance ?? 0,
                            open_finance_id: pa.id,
                            color: pa.type === 'CREDIT' ? '#ef4444' : '#c9a858',
                            credit_limit: (pa as any).creditData?.creditLimit ?? null,
                        } as any)
                        .select('id')
                        .maybeSingle()
                    accountId = newAccount?.id
                } else {
                    // Atualizar saldo
                    await supabase.from('accounts').update({
                        balance: pa.balance ?? 0,
                        updated_at: new Date().toISOString(),
                    }).eq('id', accountId)
                }

                if (!accountId) continue

                // IMPORTAR TRANSAÇÕES (Últimos 90 dias)
                const to = new Date().toISOString().split('T')[0]
                const from = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

                let page = 1
                let hasMore = true

                while (hasMore) {
                    const response = await fetchTransactions(pa.id, { from, to, page })
                    const pluggyTxs = response.results
                    console.log(`[Pluggy Sync] Importando página ${page} da conta ${pa.id}: ${pluggyTxs.length} transações`)

                    for (const pt of pluggyTxs) {
                        // Evitar duplicatas
                        const { data: existingTx } = await supabase
                            .from('transactions')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('open_finance_id', pt.id)
                            .maybeSingle()

                        if (!existingTx) {
                            // Mapeamento de categoria inteligente
                            let finalCategoryId = null
                            if (pt.category) {
                                // 1. Tenta pelo nome exato vindo do Pluggy
                                finalCategoryId = categoryMap[pt.category.toLowerCase()]

                                // 2. Tenta pelo bridge de tradução
                                if (!finalCategoryId) {
                                    const internalSlug = mapPluggyCategory(pt.category)
                                    const dbName = slugToName[internalSlug]
                                    if (dbName) {
                                        finalCategoryId = categoryMap[dbName]
                                    }
                                }
                            }

                            // data format
                            const rawDate = pt.date as any
                            let txDateStr = to
                            if (rawDate instanceof Date) {
                                txDateStr = rawDate.toISOString().split('T')[0]
                            } else if (typeof rawDate === 'string') {
                                txDateStr = rawDate.split('T')[0]
                            }

                            const amount = Math.abs(pt.amount)
                            const type = pt.amount >= 0 ? 'income' : 'expense'

                            await supabase.from('transactions').insert({
                                user_id: user.id,
                                account_id: accountId,
                                amount,
                                type,
                                description: pt.description || pt.descriptionRaw || 'Transação importada',
                                date: txDateStr,
                                open_finance_id: pt.id,
                                category_id: finalCategoryId,
                                notes: pt.category ? `Categoria original: ${pt.category}` : null
                            } as any)
                            totalImported++
                        }
                    }

                    // Verifica se há mais páginas
                    if (response.totalPages > page && page < 5) { // Limite de 5 páginas para evitar timeout
                        page++
                    } else {
                        hasMore = false
                    }
                }
            }
            // Atualizar last_sync na tabela de controle
            await supabase.from('open_finance_connections').update({
                last_sync_at: new Date().toISOString(),
                status: 'active',
            }).eq('user_id', user.id).eq('item_id', itemId)

            console.log(`[Pluggy Sync] Sincronização finalizada. Total importado: ${totalImported}`)
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
