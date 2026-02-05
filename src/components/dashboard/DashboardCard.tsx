import React from 'react';

interface DashboardCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
    return (
        <div className={`bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700/50 hover:border-gray-600 transition-colors duration-200 ${className}`}>
            <h3 className="text-xl font-medium text-gray-200 mb-4">{title}</h3>
            <div className="text-gray-300">
                {children}
            </div>
        </div>
    );
}
