import React from 'react';

interface DashboardCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
    return (
        <div className={`bg-zinc-900/50 rounded-xl p-4 shadow-sm border border-zinc-800/50 hover:border-zinc-700 transition-colors duration-200 ${className}`}>
            <h3 className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">{title}</h3>
            <div className="text-zinc-300">
                {children}
            </div>
        </div>
    );
}
