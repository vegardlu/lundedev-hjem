"use client";

import React from 'react';
import { DashboardCard } from './DashboardCard';
import {
    FireIcon,
    BoltIcon, // For power
    BeakerIcon, // For humidity (fallback)
    EyeIcon, // For motion/occupancy
    CubeIcon // Generic fallback
} from '@heroicons/react/24/outline';

export interface SensorProps {
    id: string;
    name: string;
    state: string;
    unitOfMeasurement?: string;
    deviceClass?: string;
}

interface SensorGroupCardProps {
    areaName: string;
    sensors: SensorProps[];
}

export function SensorGroupCard({ areaName, sensors }: SensorGroupCardProps) {

    const getIcon = (deviceClass?: string) => {
        switch (deviceClass) {
            case 'temperature':
                return <FireIcon className="w-4 h-4 text-orange-400" />;
            case 'humidity':
                return <BeakerIcon className="w-4 h-4 text-blue-400" />;
            case 'power':
            case 'energy':
            case 'voltage':
                return <BoltIcon className="w-4 h-4 text-yellow-400" />;
            case 'motion':
            case 'occupancy':
                return <EyeIcon className="w-4 h-4 text-emerald-400" />;
            default:
                return <CubeIcon className="w-4 h-4 text-zinc-400" />;
        }
    };

    const formatValue = (state: string, deviceClass?: string) => {
        if (deviceClass === 'temperature' || deviceClass === 'humidity' || deviceClass === 'power') {
            const num = parseFloat(state);
            if (!isNaN(num)) {
                // Round to 1 decimal place for neatness
                return Math.round(num * 10) / 10;
            }
        }
        return state;
    };

    return (
        <DashboardCard title={areaName} className="h-full bg-zinc-900/50 border-zinc-800">
            <div className="flex flex-col gap-2">
                {sensors.map((sensor) => (
                    <div key={sensor.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {getIcon(sensor.deviceClass)}
                            <span className="text-sm text-zinc-300 truncate" title={sensor.name}>
                                {sensor.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="font-medium text-zinc-100">
                                {formatValue(sensor.state, sensor.deviceClass)}
                            </span>
                            {sensor.unitOfMeasurement && (
                                <span className="text-xs text-zinc-500">
                                    {sensor.unitOfMeasurement}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}
