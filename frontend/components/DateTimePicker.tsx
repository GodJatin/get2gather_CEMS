'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateTimePickerProps {
    label: string;
    value: string; // ISO string or "YYYY-MM-DD" / "HH:mm"
    onChange: (value: string) => void;
    type: 'date' | 'time';
}

export default function DateTimePicker({ label, value, onChange, type }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Internal state for calendar navigation
    const [viewDate, setViewDate] = useState(new Date());

    // Internal state for clock
    const [clockMode, setClockMode] = useState<'hour' | 'minute'>('hour');
    const [inputMode, setInputMode] = useState<'clock' | 'manual'>('clock');

    // Initialize states when opened or value changes
    useEffect(() => {
        if (value) {
            if (type === 'date') {
                setViewDate(new Date(value));
            }
        }
    }, [value, isOpen, type]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- DATE PICKER LOGIC ---
    const renderDatePicker = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const handleDateClick = (d: number) => {
            const newDate = new Date(year, month, d);
            const y = newDate.getFullYear();
            const m = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            onChange(`${y}-${m}-${day}`);
            setIsOpen(false);
        };

        const changeMonth = (delta: number) => {
            setViewDate(new Date(year, month + delta, 1));
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className="p-4 w-72 select-none">
                <div className="flex justify-between items-center mb-4">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); changeMonth(-1); }}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={year === today.getFullYear() && month <= today.getMonth()} // Optional: Prevent going back too far if desired, but user asked for date selection validation mostly. Let's just strict validate the days.
                    >
                        ←
                    </button>
                    <span className="font-bold text-lg">{months[month]} {year}</span>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); changeMonth(1); }}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        →
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-400 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const d = i + 1;
                        const currentDayDate = new Date(year, month, d);
                        currentDayDate.setHours(0, 0, 0, 0);

                        const isPast = currentDayDate.getTime() < today.getTime();

                        let isSelected = false;
                        if (value) {
                            const valDate = new Date(value);
                            isSelected = valDate.getDate() === d && valDate.getMonth() === month && valDate.getFullYear() === year;
                        }

                        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

                        return (
                            <button
                                type="button"
                                key={d}
                                onClick={(e) => { e.preventDefault(); if (!isPast) handleDateClick(d); }}
                                disabled={isPast}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${isPast
                                        ? 'text-neutral-600 cursor-not-allowed opacity-50'
                                        : isSelected
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                                            : isToday
                                                ? 'bg-white/10 text-purple-400 border border-purple-500/30'
                                                : 'hover:bg-white/10 text-neutral-300'
                                    }`}
                            >
                                {d}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- CLOCK PICKER LOGIC ---
    // Helper vars
    const [h, m] = value ? value.split(':').map(Number) : [12, 0];
    const isPM = h >= 12;
    const displayH = h % 12 || 12;

    const handleClockClick = (val: number) => {
        if (clockMode === 'hour') {
            onChange(`${val.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            setClockMode('minute');
        } else {
            onChange(`${h.toString().padStart(2, '0')}:${val.toString().padStart(2, '0')}`);
            setTimeout(() => setIsOpen(false), 300);
        }
    };

    const toggleAmPm = () => {
        let newH = h;
        if (isPM) newH -= 12;
        else newH += 12;
        onChange(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    };

    const handleManualChange = (type: 'hour' | 'minute', valStr: string) => {
        const val = parseInt(valStr);
        if (isNaN(val)) return;

        if (type === 'hour') {
            if (val < 1 || val > 12) return;
            let finalH = val;
            if (isPM) {
                if (val !== 12) finalH = val + 12;
            } else {
                if (val === 12) finalH = 0;
            }
            onChange(`${finalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        } else {
            if (val < 0 || val > 59) return;
            onChange(`${h.toString().padStart(2, '0')}:${val.toString().padStart(2, '0')}`);
        }
    };

    const renderNumbers = () => {
        const radius = 80;
        const center = 100;

        const items = 12;
        return Array.from({ length: items }).map((_, i) => {
            let num = i + 1;
            if (clockMode === 'minute') num = i * 5;

            let val = clockMode === 'hour' ? (i + 1) : (i + 1) * 5;
            if (clockMode === 'minute' && val === 60) val = 0;

            const angleDeg = (clockMode === 'hour' ? val : val / 5) * 30 - 90;
            const angleRad = angleDeg * (Math.PI / 180);

            const x = center + radius * Math.cos(angleRad);
            const y = center + radius * Math.sin(angleRad);

            const isSelected = clockMode === 'hour' ? h === val || (h === 0 && val === 12) : m === val;

            return (
                <button
                    type="button"
                    key={val}
                    onClick={(e) => { e.preventDefault(); handleClockClick(val === 12 && clockMode === 'hour' ? 0 : val); }}
                    className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isSelected
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110 z-10'
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                    style={{ left: x - 16, top: y - 16 }}
                >
                    {val === 0 && clockMode === 'minute' ? '00' : val}
                </button>
            );
        });
    };

    const renderClockPicker = () => (
        <div className="p-6 w-72 flex flex-col items-center select-none">
            {/* Digital Display / Input */}
            <div className="flex items-center justify-center gap-2 mb-6">
                {inputMode === 'clock' ? (
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setClockMode('hour'); }}
                            className={`text-4xl font-bold p-2 rounded-xl transition-colors ${clockMode === 'hour' ? 'text-purple-400 bg-purple-500/10' : 'text-neutral-500'
                                }`}
                        >
                            {displayH.toString().padStart(2, '0')}
                        </button>
                        <span className="text-4xl text-neutral-600 pb-2">:</span>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setClockMode('minute'); }}
                            className={`text-4xl font-bold p-2 rounded-xl transition-colors ${clockMode === 'minute' ? 'text-pink-400 bg-pink-500/10' : 'text-neutral-500'
                                }`}
                        >
                            {m.toString().padStart(2, '0')}
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={displayH.toString()}
                            onChange={(e) => handleManualChange('hour', e.target.value)}
                            className="w-20 text-4xl font-bold p-2 rounded-xl bg-neutral-800 border border-purple-500 text-center focus:outline-none text-white appearance-none"
                        />
                        <span className="text-4xl text-neutral-600 pb-2">:</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={m.toString().padStart(2, '0')}
                            onChange={(e) => handleManualChange('minute', e.target.value)}
                            className="w-20 text-4xl font-bold p-2 rounded-xl bg-neutral-800 border border-pink-500 text-center focus:outline-none text-white appearance-none"
                        />
                    </>
                )}

                <div className="flex flex-col ml-4 gap-1">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); if (isPM) toggleAmPm(); }}
                        className={`px-2 py-1 rounded text-xs font-bold border ${!isPM ? 'bg-blue-500 text-white border-blue-500' : 'text-neutral-500 border-neutral-700'}`}
                    >
                        AM
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); if (!isPM) toggleAmPm(); }}
                        className={`px-2 py-1 rounded text-xs font-bold border ${isPM ? 'bg-blue-500 text-white border-blue-500' : 'text-neutral-500 border-neutral-700'}`}
                    >
                        PM
                    </button>
                </div>
            </div>

            {/* Clock Face or Placeholder */}
            {inputMode === 'clock' ? (
                <div className="relative w-[200px] h-[200px] rounded-full bg-neutral-800/50 border border-white/5 shadow-inner">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-20" />
                    {renderNumbers()}
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-neutral-500">
                    Enter time manually
                </div>
            )}

            {/* Toggle Mode Button */}
            <div className="w-full flex justify-start mt-4">
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setInputMode(inputMode === 'clock' ? 'manual' : 'clock'); }}
                    className="p-2 rounded-full hover:bg-white/10 text-neutral-400 transition-colors"
                    title={inputMode === 'clock' ? "Switch to manual input" : "Switch to clock"}
                >
                    {inputMode === 'clock' ? '⌨️' : '🕒'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                className={`w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-left flex items-center justify-between transition-all ${isOpen ? 'border-purple-500 ring-1 ring-purple-500/50' : 'hover:border-white/20'
                    }`}
            >
                <span className={value ? 'text-white' : 'text-neutral-500'}>
                    {value || `Select ${type}`}
                </span>
                <span className="text-xl opacity-50">
                    {type === 'date' ? '📅' : '⏰'}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden"
                    >
                        {type === 'date' ? renderDatePicker() : renderClockPicker()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
