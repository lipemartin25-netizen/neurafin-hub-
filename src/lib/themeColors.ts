/**
 * Retorna paleta de cores baseado no tema.
 * Use: const colors = getThemeColors(theme)
 */
export function getThemeColors(theme: 'dark' | 'light') {
    if (theme === 'light') {
        return {
            bg: '#f5f3ee',
            bgAlt: '#ede9e0',
            card: '#ffffff',
            cardGrad: 'linear-gradient(165deg, #ffffff, #faf8f4)',
            cardHlGrad: 'linear-gradient(165deg, #fffdf8, #f8f5ee)',
            secondary: '#f0ece3',
            muted: '#e5e0d5',
            gold: '#9a7d3a',
            goldLight: '#b8943f',
            goldDark: '#7a6230',
            goldGrad: 'linear-gradient(135deg, #9a7d3a, #7a6230)',
            goldTextGrad: 'linear-gradient(135deg, #9a7d3a, #6b5425, #8a7030)',
            text: '#1a1a1a',
            textMuted: '#6b7280',
            textMuted2: '#9ca3af',
            border: 'rgba(0,0,0,0.08)',
            borderGold: 'rgba(154,125,58,0.1)',
            borderGoldMed: 'rgba(154,125,58,0.2)',
            borderGoldStrong: 'rgba(154,125,58,0.35)',
            emerald: '#059669',
            red: '#dc2626',
            yellow: '#d97706',
            blue: '#2563eb',
            violet: '#7c3aed',
            cyan: '#0891b2',
            orange: '#ea580c',
            pink: '#db2777',
        }
    }

    // Dark (default — same as current C object)
    return {
        bg: '#0b0d10',
        bgAlt: '#0d0f14',
        card: '#12151a',
        cardGrad: 'linear-gradient(165deg, #13161c, #0d0f14)',
        cardHlGrad: 'linear-gradient(165deg, #171a20, #0f1115)',
        secondary: '#181c22',
        muted: '#1e2228',
        gold: '#c9a858',
        goldLight: '#dfc07a',
        goldDark: '#9a7d3a',
        goldGrad: 'linear-gradient(135deg, #c9a858, #9a7d3a)',
        goldTextGrad: 'linear-gradient(135deg, #dfc07a, #b8943d, #d4b05e)',
        text: '#ebe6da',
        textMuted: '#6b7280',
        textMuted2: '#4b5563',
        border: 'rgba(255,255,255,0.06)',
        borderGold: 'rgba(201,168,88,0.06)',
        borderGoldMed: 'rgba(201,168,88,0.15)',
        borderGoldStrong: 'rgba(201,168,88,0.3)',
        emerald: '#34d399',
        red: '#f87171',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        violet: '#a78bfa',
        cyan: '#22d3ee',
        orange: '#fb923c',
        pink: '#f472b6',
    }
}
