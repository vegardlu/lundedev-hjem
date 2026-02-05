import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LightControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    lightId: string;
    lightName: string;
    initialIsOn: boolean;
    initialBrightness?: number; // 0-255
    onToggle: (id: string) => void;
    onUpdate: (id: string, brightness: number, color: { r: number, g: number, b: number } | null) => void;
}

// Simple hex to rgb helper
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const PRESET_COLORS = [
    "#FFB74D", // Warm
    "#E0F7FA", // Cool White
    "#F44336", // Red
    "#4CAF50", // Green
    "#2196F3", // Blue
    "#9C27B0", // Purple
];

export function LightControlModal({
    isOpen, onClose, lightId, lightName, initialIsOn, initialBrightness, onToggle, onUpdate
}: LightControlModalProps) {
    const [brightness, setBrightness] = useState(initialBrightness || 255);
    const [color, setColor] = useState("#FFB74D"); // Default warm
    const [isOn, setIsOn] = useState(initialIsOn);

    // Sync state if props change (e.g. initial load)
    useEffect(() => {
        setIsOn(initialIsOn);
        setBrightness(initialBrightness || 255);
    }, [initialIsOn, initialBrightness]);


    if (!isOpen) return null;

    const handleToggle = () => {
        setIsOn(!isOn);
        onToggle(lightId);
    };

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = parseInt(e.target.value);
        setBrightness(newVal);
        // Debounce this in real app, but for now simple update
        onUpdate(lightId, newVal, null);
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        const rgb = hexToRgb(newColor);
        if (rgb) {
            onUpdate(lightId, brightness, rgb);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-100">{lightName}</h3>
                        <span className={`text-xs uppercase tracking-wider font-semibold ${isOn ? 'text-green-400' : 'text-zinc-500'}`}>
                            {isOn ? 'Active' : 'Off'}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Toggle Switch */}
                <div className="mb-8 flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                    <span className="text-zinc-300 font-medium">Power</span>
                    <button
                        onClick={handleToggle}
                        className={`w-14 h-8 rounded-full transition-colors duration-200 ease-in-out relative ${isOn ? 'bg-green-500' : 'bg-zinc-600'}`}
                    >
                        <div className={`absolute top-1 bottom-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${isOn ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                {/* Controls - Only show if ON (or allow updating while OFF depending on preference, usually implies turning on) */}
                <div className={`space-y-6 transition-opacity duration-200 ${isOn ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                    {/* Brightness */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Brightness</label>
                        <input
                            type="range"
                            min="0"
                            max="255"
                            value={brightness}
                            onChange={handleBrightnessChange}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-3">Color</label>

                        {/* Custom Color Wheel */}
                        <div className="flex justify-center mb-4">
                            <HexColorPicker color={color} onChange={handleColorChange} />
                        </div>

                        {/* Presets */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleColorChange(c)}
                                    className="w-8 h-8 rounded-full border border-zinc-600 shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ backgroundColor: c }}
                                    aria-label={`Select color ${c}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
