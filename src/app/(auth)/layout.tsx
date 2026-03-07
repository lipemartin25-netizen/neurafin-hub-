import NeonBackground from '@/components/NeonBackground'

// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <NeonBackground />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    )
}
