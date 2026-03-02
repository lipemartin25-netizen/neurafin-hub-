'use client'

import { useState } from 'react'
import { Landmark, TrendingUp, Calculator, Flame, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function WealthDash() {
    const [activeTab, setActiveTab] = useState('fire')

    const tabs = [
        { id: 'fire', label: 'Independência Financeira (FIRE)', icon: Flame },
        { id: 'compound', label: 'Juros Compostos', icon: TrendingUp },
        { id: 'mei', label: 'Calculadora PJ / MEI', icon: Calculator }
    ]

    return (
        <div className="space-y-8">
            <div className="flex overflow-x-auto bg-[#03050C] p-1.5 rounded-2xl border border-[#ffffff10] scrollbar-none gap-2 shadow-inner">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold transition-all shrink-0 uppercase tracking-widest ${activeTab === t.id ? 'bg-[#ffffff10] text-white border border-[#ffffff20] shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-[#8e9bb0] hover:bg-[#ffffff05] border border-transparent hover:text-white'}`}
                        style={{ fontFamily: 'Outfit' }}
                    >
                        <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-[#00F260]' : 'opacity-70'}`} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="p-8 rounded-3xl border border-[#ffffff10] bg-[#ffffff03] min-h-[500px] shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F260] via-[#10B981] to-[#03050C]" />
                {activeTab === 'fire' && <FireSimulator />}
                {activeTab === 'compound' && <CompoundInterest />}
                {activeTab === 'mei' && <MeiCalculator />}
            </div>
        </div>
    )
}

function FireSimulator() {
    const [patrimony, setPatrimony] = useState(50000)
    const [monthlyInvest, setMonthlyInvest] = useState(1500)
    const [yearlyYield, setYearlyYield] = useState(8) // 8% real yield above inflation
    const [targetIncome, setTargetIncome] = useState(5000)

    // Rule of 300 logic (or 4% safe withdrawal rate)
    const fireNumber = targetIncome * 300

    // NPER math approx
    // FV = PV * (1+i)^n + PMT * [ ((1+i)^n - 1) / i ]
    const monthlyRate = Math.pow(1 + yearlyYield / 100, 1 / 12) - 1
    let months = 0
    let currentPatrimony = patrimony

    if (monthlyInvest > 0 || currentPatrimony > 0) {
        while (currentPatrimony < fireNumber && months < 1200) { // arbitrary cap 100 years
            currentPatrimony = currentPatrimony * (1 + monthlyRate) + monthlyInvest
            months++
        }
    }

    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-[#F5A623]/10 p-6 border border-[#F5A623]/20 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-[#F5A623]/20 flex items-center justify-center shrink-0 border border-[#F5A623]/30 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                    <Flame className="w-8 h-8 text-[#F5A623]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#F5A623] tracking-tight" style={{ fontFamily: 'Outfit' }}>Movimento F.I.R.E. (Financial Independence, Retire Early)</h2>
                    <p className="text-[#F5A623]/70 text-[15px] mt-2 font-medium max-w-3xl leading-relaxed">Calcule seu &quot;Número Mágico&quot;. Atingindo esse patrimônio, você poderá viver apenas de rendimentos baseando-se na regra de retirada segura de 4% ao ano (ou multiplicando sua renda desejada por 300).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Renda Mensal Desejada (R$)</label>
                        <input type="number" value={targetIncome} onChange={e => setTargetIncome(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-[#00F260] outline-none focus:border-[#00F260] transition-all shadow-inner text-2xl font-bold font-mono tracking-tighter" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Patrimônio Atual (R$)</label>
                        <input type="number" value={patrimony} onChange={e => setPatrimony(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner text-lg font-mono" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Aporte Mensal (R$)</label>
                        <input type="number" value={monthlyInvest} onChange={e => setMonthlyInvest(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner text-lg font-mono" />
                    </div>
                    <div className="space-y-4 pt-2">
                        <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1 flex justify-between">
                            Rentabilidade Real Anual
                            <span className="text-[#00F260] text-sm">{yearlyYield}%</span>
                        </label>
                        <input type="range" min="2" max="15" value={yearlyYield} onChange={e => setYearlyYield(Number(e.target.value))} className="w-full h-2 bg-[#ffffff10] rounded-lg appearance-none cursor-pointer" style={{ accentColor: '#00F260' }} />
                        <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest text-right">Acima da inflação (IPCA+)</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#03050C] to-[#011409] border border-[#00F260]/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,242,96,0.05)]">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#00F260] to-[#F5A623]" />
                    <p className="text-[#00F260] uppercase text-[11px] font-bold tracking-[0.2em] mb-4">Seu Número Mágico F.I.R.E.</p>
                    <p className="text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tighter" style={{ fontFamily: 'Outfit', textShadow: '0 0 30px rgba(0,242,96,0.2)' }}>
                        {formatCurrency(fireNumber)}
                    </p>

                    <div className="w-32 h-px bg-white/10 mb-8 mx-auto" />

                    <p className="text-[#8e9bb0] text-sm mb-4 font-medium leading-relaxed max-w-[280px]">Mantendo seus aportes disciplinares de <strong className="text-white">{formatCurrency(monthlyInvest)}</strong>, sua Independência Financeira será em:</p>
                    <div className="flex items-center gap-2 justify-center bg-[#ffffff05] px-6 py-3 rounded-2xl border border-[#ffffff10]">
                        <span className="text-3xl font-bold text-[#F5A623] tracking-tight">{years} anos</span>
                        {remainingMonths > 0 && <span className="text-sm font-bold text-[#F5A623]/70 uppercase tracking-widest pt-1">e {remainingMonths} meses</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CompoundInterest() {
    const [initialAmount, setInitialAmount] = useState(1000)
    const [monthlyAmount, setMonthlyAmount] = useState(500)
    const [annualRate, setAnnualRate] = useState(10.75) // Selic example
    const [periodYears, setPeriodYears] = useState(10)

    const months = periodYears * 12
    const monthlyRateStr = (Math.pow(1 + annualRate / 100, 1 / 12) - 1)

    let currentVal = initialAmount
    let invested = initialAmount

    for (let i = 0; i < months; i++) {
        currentVal = currentVal * (1 + monthlyRateStr) + monthlyAmount
        invested += monthlyAmount
    }

    const generatedInterest = currentVal - invested

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Valor Inicial</label>
                    <input type="number" value={initialAmount} onChange={e => setInitialAmount(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner font-mono text-lg" />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Aporte Mensal</label>
                    <input type="number" value={monthlyAmount} onChange={e => setMonthlyAmount(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner font-mono text-lg" />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Taxa Anual (%)</label>
                    <input type="number" step="0.01" value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-[#00F260] outline-none focus:border-[#00F260] transition-all shadow-inner font-mono text-lg font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-[0.15em] pl-1">Período (Anos)</label>
                    <input type="number" value={periodYears} onChange={e => setPeriodYears(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-[#ffffff05] border border-[#ffffff15] text-white outline-none focus:border-[#00F260] transition-all shadow-inner font-mono text-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8">
                <div className="p-8 rounded-3xl border border-[#ffffff10] bg-[#ffffff03] text-center shadow-inner hover:bg-[#ffffff05] transition-colors relative overflow-hidden">
                    <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.2em] mb-2">Total Investido (Do seu bolso)</p>
                    <p className="text-3xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>{formatCurrency(invested)}</p>
                </div>
                <div className="p-8 rounded-3xl border border-[#00F260]/20 bg-[#00F260]/5 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#00F260]/50" />
                    <p className="text-[10px] text-[#00F260] font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_8px_rgba(0,242,96,0.5)]">Juros Gerados (A Magia)</p>
                    <p className="text-3xl font-bold text-[#00F260] tracking-tighter drop-shadow-md" style={{ fontFamily: 'Outfit' }}>+{formatCurrency(generatedInterest)}</p>
                </div>
                <div className="p-8 rounded-3xl border border-[#F5A623]/20 bg-gradient-to-t from-[#F5A623]/10 to-transparent text-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#F5A623]" />
                    <p className="text-[10px] text-[#F5A623] font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_8px_rgba(245,166,35,0.5)]">Montante Final (Bruto)</p>
                    <p className="text-4xl font-bold text-white tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Outfit', textShadow: '0 0 20px rgba(245,166,35,0.2)' }}>{formatCurrency(currentVal)}</p>
                </div>
            </div>
        </div>
    )
}

function MeiCalculator() {
    const [yearlyGross, setYearlyGross] = useState(81000)
    const isOverLimit = yearlyGross > 81000

    const monthlyAvg = yearlyGross / 12
    const dasTax = 76.60 // Aprox for Servicos in 2024
    const currentNetIncome = monthlyAvg - dasTax

    return (
        <div className="space-y-10 animate-fade-in max-w-3xl mx-auto py-4">
            <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-[#00F260]/10 border border-[#00F260]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,242,96,0.15)]">
                    <Landmark className="w-10 h-10 text-[#00F260]" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>Calculadora PJ / MEI</h2>
                <p className="text-[#8e9bb0] font-medium tracking-wide">Controle preditivo de faturamento e alertas automatizados de limite</p>
            </div>

            <div className="p-8 rounded-3xl border border-[#ffffff10] bg-[#ffffff03] space-y-8 shadow-inner">
                <div className="space-y-4">
                    <label className="flex flex-col md:flex-row md:items-end justify-between font-bold text-white gap-2">
                        <span className="text-sm tracking-wide">Faturamento Bruto Anual Estimado</span>
                        <span className={`text-3xl tracking-tighter ${isOverLimit ? 'text-[#ef4444]' : 'text-[#00F260]'}`} style={{ fontFamily: 'Outfit' }}>{formatCurrency(yearlyGross)}</span>
                    </label>
                    <input type="range" min="0" max="150000" step="1000" value={yearlyGross} onChange={e => setYearlyGross(Number(e.target.value))} className="w-full h-2 bg-[#ffffff10] rounded-lg appearance-none cursor-pointer" style={{ accentColor: isOverLimit ? '#ef4444' : '#00F260' }} />
                </div>

                {isOverLimit && (
                    <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-white p-5 rounded-2xl flex items-start gap-4 text-sm shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                        <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center shrink-0 border border-[#ef4444]/50">
                            <Flame className="w-5 h-5 text-[#ef4444]" />
                        </div>
                        <div className="flex flex-col pt-0.5">
                            <p className="font-bold text-[#ef4444] text-base mb-1 tracking-tight">ALERTA CRÍTICO DE DESENQUADRAMENTO</p>
                            <p className="text-[#8e9bb0] leading-relaxed">Você faturou mais que R$ 81.000,00 no ano. A transição para Microempresa (ME) no Simples Nacional é iminente. Consulte seu escritório de contabilidade para evitar multas retroativas severas.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                    <div className="bg-[#ffffff05] border border-[#ffffff10] p-6 rounded-2xl text-center shadow-inner relative overflow-hidden">
                        <p className="text-[10px] text-[#8e9bb0] uppercase tracking-[0.2em] mb-2 font-bold">Faturamento Médio Mensal</p>
                        <p className="text-3xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>{formatCurrency(monthlyAvg)}</p>
                    </div>
                    <div className="bg-[#00F260]/5 border border-[#00F260]/20 p-6 rounded-2xl text-center relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#00F260]/20 blur-2xl" />
                        <p className="text-[10px] text-[#00F260] uppercase tracking-[0.2em] mb-2 font-bold drop-shadow-[0_0_8px_rgba(0,242,96,0.5)]">Renda Líquida Mensal Aproximada</p>
                        <p className="text-3xl font-bold text-[#00F260] tracking-tighter" style={{ fontFamily: 'Outfit' }}>{formatCurrency(currentNetIncome)}</p>
                        <p className="text-[11px] font-bold text-[#8e9bb0] mt-3 uppercase tracking-wider">- Guia DAS MEI (Ex: {formatCurrency(dasTax)})</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
