import NeonBackground from '@/components/NeonBackground'

// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <NeonBackground />
            {children}
        </>
    )
}
