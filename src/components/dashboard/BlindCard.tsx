"use client";

import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ChevronUpIcon, ChevronDownIcon, StopIcon } from '@heroicons/react/24/solid';
import { setBlindPositionAction, openBlindAction, closeBlindAction, stopBlindAction } from '@/actions/blind-actions';

interface BlindCardProps {
    id: string;
    name: string;
    state: string;
    currentPosition?: number;
    token: string;
}

export function BlindCard({ id, name, state, currentPosition, token }: BlindCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            await openBlindAction(id, token);
        } catch (error) {
            console.error("Failed to open blind", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            await closeBlindAction(id, token);
        } catch (error) {
            console.error("Failed to close blind", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            await stopBlindAction(id, token);
        } catch (error) {
            console.error("Failed to stop blind", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isOpen = state === 'open';
    const isClosed = state === 'closed';

    return (
        <DashboardCard title={name} className="h-full bg-zinc-900/50 border-zinc-800">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-400">
                            {state.toUpperCase()}
                        </span>
                        {currentPosition !== undefined && (
                            <span className="text-xs text-zinc-500">
                                {currentPosition}% Open
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleClose}
                        disabled={isLoading || isClosed}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isClosed ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                            }`}
                        title="Close"
                    >
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleStop}
                        disabled={isLoading}
                        className="p-2 rounded-lg flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
                        title="Stop"
                    >
                        <StopIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleOpen}
                        disabled={isLoading || isOpen}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                            }`}
                        title="Open"
                    >
                        <ChevronUpIcon className="w-5 h-5" />
                    </button>
                </div>

                {currentPosition !== undefined && (
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${currentPosition}%` }}
                        />
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
