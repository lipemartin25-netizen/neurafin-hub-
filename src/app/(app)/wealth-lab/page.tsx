import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WealthDash from '@/components/wealth-lab/WealthDash'

export default async function WealthLabPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col border-b border-[#ffffff10] pb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F260] to-[#10B981] tracking-tight" style={{ fontFamily: 'Outfit' }}>
                    Wealth Lab <span className="text-white drop-shadow-[0_0_10px_rgba(0,242,96,0.3)] opacity-90 text-[1.2em] relative top-1">🧪</span>
                </h1>
                <p className="text-[#8e9bb0] text-[15px] mt-2 font-medium tracking-wide">Simuladores avançados e calculadoras de independência financeira (FIRE)</p>
            </div>

            <WealthDash />
        </div>
    )
}
