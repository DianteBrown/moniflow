"use client";

import React from "react";
import { ChevronLeft, Search, ChevronDown, BarChart2, ShoppingBag, Film, Salad } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Label,
    Tooltip,
} from "recharts";

// Drop this file at: app/phone/page.tsx (Next.js App Router)
// Tailwind CSS required. Install: `npm i recharts lucide-react`
// Then visit /phone to see the mockup.

const COLORS = ["#4fd1c5", "#60a5fa", "#fbbf24", "#f59e0b", "#34d399"]; // teal, blue, amber, orange, green

const chartData = [
    { name: "Bills", value: 32 },
    { name: "Food", value: 24 },
    { name: "Shopping", value: 18 },
    { name: "Entertainment", value: 14 },
    { name: "Other", value: 12 },
];

const centerPct = 76; // matches the screenshot label

export default function Phone() {
    return (
        <main className="min-h-screen w-full  flex items-center justify-center p-6">
            {/* phone frame (metal chassis + bezel) */}
            <div className="relative w-[370px] max-w-full aspect-[9/19.5] rounded-[2.6rem] p-[10px] bg-gradient-to-b from-zinc-200/40 via-zinc-500/30 to-zinc-200/40 border border-zinc-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                {/* inner chassis */}
                <div className="relative h-full w-full rounded-[2.2rem] ring-1 ring-zinc-700/60 overflow-hidden" style={{backgroundColor: 'var(--heritage-green)'}}>
                    {/* antenna bands (decor) */}
                    <div className="absolute top-6 left-1/3 w-12 h-[2px] bg-zinc-300/30 rounded" />
                    <div className="absolute bottom-6 left-1/4 w-16 h-[2px] bg-zinc-300/20 rounded" />
                    {/* side buttons (decor) */}
                    <div className="absolute -left-[6px] top-24 w-[4px] h-16 rounded-l-full bg-zinc-400/30" />
                    <div className="absolute -left-[6px] top-44 w-[4px] h-10 rounded-l-full bg-zinc-400/30" />
                    <div className="absolute -right-[6px] top-36 w-[4px] h-24 rounded-r-full bg-zinc-400/30" />
                    {/* Screen inset */}
                    <div className="absolute inset-[6px] rounded-[2rem] bg-zinc-900">
                        {/* Fake status bar */}
                        <div className="flex items-center justify-between px-5 pt-5 text-zinc-300 text-[12px]">
                            <span>6:21</span>
                            <div className="flex items-center gap-2 opacity-80">
                                <div className="w-3 h-3 rounded-full bg-zinc-400" />
                                <div className="w-4 h-3 bg-zinc-400 rounded-sm" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="px-5 mt-3">
                            <h1 className="text-zinc-100 font-semibold tracking-tight">Heritage Budgeting</h1>
                        </div>

                        {/* Search + quick filter bar */}
                        <div className="px-5 mt-3">
                            <div className="flex items-center gap-2">
                                <button className="flex-none inline-flex items-center justify-center w-9 h-9 rounded-xl text-white/90" style={{backgroundColor: 'var(--heritage-gold)'}}>
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex-1 grid grid-cols-[1fr_auto] gap-2 rounded-xl p-2" style={{backgroundColor: 'var(--heritage-light-green)'}}>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Search size={16} className="opacity-90" />
                                        <input
                                            placeholder="search"
                                            className="bg-transparent text-[13px] placeholder:text-white/60 focus:outline-none w-full"
                                        />
                                    </div>
                                    <button className="px-3 py-1 text-[12px] rounded-lg bg-white/20 text-white/90 inline-flex items-center gap-1 justify-center">
                                        Planners <ChevronDown size={14} className="opacity-80" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tab chips */}
                        <div className="px-5 mt-4">
                            <div className="inline-flex items-center gap-2 text-[12px]">
                                <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200">Reports</span>
                                <span className="px-3 py-1.5 rounded-lg bg-zinc-900/40 text-zinc-400">Budgets</span>
                                <span className="px-3 py-1.5 rounded-lg bg-zinc-900/40 text-zinc-400">All</span>
                            </div>
                        </div>

                        {/* Section title */}
                        <div className="px-5 mt-5 flex items-center justify-between">
                            <div>
                                <p className="text-[12px] text-zinc-500">Spending</p>
                                <h2 className="text-zinc-200 font-medium">This Month</h2>
                            </div>
                            <button className="text-[12px] text-zinc-400 inline-flex items-center gap-1">
                                Options <ChevronDown size={14} />
                            </button>
                        </div>

                        {/* Chart */}
                        <div className="px-5 mt-4">
                            <div className="w-full h-48 rounded-xl bg-zinc-900 flex items-center justify-center">
                                <ResponsiveContainer width="90%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                            <Label
                                                value={`${centerPct}%`}
                                                position="center"
                                                className="text-white fill-white"
                                            />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: "#18181b", border: "1px solid #27272a" }}
                                            itemStyle={{ color: "#e4e4e7" }}
                                            labelStyle={{ color: "#a1a1aa" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Legend list */}
                        <div className="px-5 mt-3 space-y-3">
                            <LegendItem
                                icon={<BarChart2 className="w-4 h-4" />}
                                title="Nearting"
                                amount="61 ms"
                            />
                            <LegendItem
                                icon={<ShoppingBag className="w-4 h-4" />}
                                title="Gaarafies"
                                amount="33 ms"
                            />
                            <LegendItem icon={<Film className="w-4 h-4" />} title="ThmiiFetmant" amount="20 ms" />
                            <LegendItem icon={<Salad className="w-4 h-4" />} title="Shcnging" amount="20 ms" />
                        </div>

                        {/* Home indicator */}          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-1.5 rounded-full bg-white/50" />
                    </div>
                </div>
            </div>
        </main>
    );
}

function LegendItem({
    icon,
    title,
    amount,
}: {
    icon: React.ReactNode;
    title: string;
    amount: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200">
                    {icon}
                </div>
                <span className="text-zinc-200 text-sm">{title}</span>
            </div>
            <span className="text-zinc-400 text-sm">{amount}</span>
        </div>
    );
}
