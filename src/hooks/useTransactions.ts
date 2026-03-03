'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TransactionWithCategory } from '@/types/database'

export type TransactionFilters = {
    type?: 'income' | 'expense' | 'transfer'
    account_id?: string
    category_id?: string
    date_from?: string
    date_to?: string
    page?: number
    limit?: number
}

export function useTransactions(initialFilters: TransactionFilters = {}) {
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [count, setCount] = useState(0)

    const fetchTransactions = useCallback(async (filters: TransactionFilters = {}) => {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (filters.type) params.set('type', filters.type)
        if (filters.account_id) params.set('account_id', filters.account_id)
        if (filters.category_id) params.set('category_id', filters.category_id)
        if (filters.date_from) params.set('date_from', filters.date_from)
        if (filters.date_to) params.set('date_to', filters.date_to)
        params.set('page', String(filters.page ?? 1))
        params.set('limit', String(filters.limit ?? 100))

        try {
            const res = await fetch(`/api/transactions?${params.toString()}`)
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `HTTP ${res.status}`)
            }
            const json = await res.json()
            setTransactions(json.data ?? [])
            setCount(json.count ?? 0)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar transações'
            setError(message)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTransactions(initialFilters)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const createTransaction = useCallback(async (payload: {
        account_id: string
        amount: number | string
        type: 'income' | 'expense' | 'transfer'
        description: string
        date?: string
        category_id?: string | null
        notes?: string | null
        is_recurring?: boolean
        tags?: string[] | null
    }) => {
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `HTTP ${res.status}`)
            }
            const json = await res.json()
            // Re-fetch para pegar lista atualizada com joins
            await fetchTransactions(initialFilters)
            return { data: json.data, error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao criar transação'
            return { data: null, error: message }
        }
    }, [fetchTransactions, initialFilters])

    const deleteTransaction = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `HTTP ${res.status}`)
            }
            await fetchTransactions(initialFilters)
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao excluir'
            return { error: message }
        }
    }, [fetchTransactions, initialFilters])

    const updateTransaction = useCallback(async (id: string, payload: Record<string, unknown>) => {
        try {
            const res = await fetch(`/api/transactions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...payload }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || `HTTP ${res.status}`)
            }
            await fetchTransactions(initialFilters)
            return { error: null }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar'
            return { error: message }
        }
    }, [fetchTransactions, initialFilters])

    return {
        transactions,
        loading,
        error,
        count,
        fetchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
    }
}
