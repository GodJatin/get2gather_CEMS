'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import MotionWrapper from '@/components/MotionWrapper';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    seats_available: number;
    capacity: number;
}

interface ScanResult {
    success: boolean;
    message: string;
    student_name?: string;
    event_title?: string;
    points_earned?: number;
    attendance_type?: string;
}

export default function OrganizerScanPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [qrInput, setQrInput] = useState('');
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
    const [canScan, setCanScan] = useState(false);
    const [timeMessage, setTimeMessage] = useState('');

    useEffect(() => {
        fetchOrganizerEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            checkScanEligibility();
        }
    }, [selectedEvent]);

    const fetchOrganizerEvents = async () => {
        try {
            const response = await api.get('/events/');
            // Filter to show only organizer's events in production
            // Filter to show only organizer's events in production
            setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            setEvents([]);
        }
    };

    const checkScanEligibility = () => {
        if (!selectedEvent) return;

        try {
            let timeStr = selectedEvent.time;
            let dateStr = selectedEvent.date;

            // Handle DD-MM-YYYY format if present
            if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
                const [d, m, y] = dateStr.split(/[-/]/);
                dateStr = `${y}-${m}-${d}`;
            }

            // Handle 12h format to 24h for consistent parsing
            if (timeStr.match(/PM|AM/i)) {
                const [time, modifier] = timeStr.split(' ');
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier.toUpperCase() === 'PM') hours = (parseInt(hours, 10) + 12).toString();
                timeStr = `${hours}:${minutes}`;
            }

            // Construct ISO-like string
            const eventDateTime = new Date(`${dateStr}T${timeStr}`);
            
            if (isNaN(eventDateTime.getTime())) {
                throw new Error("Invalid Date");
            }

            const now = new Date();
            
            // Strict check: If current time is past event start time, disable scanning
            if (now > eventDateTime) {
                setCanScan(false);
                setTimeMessage('🔒 Event has started/ended. Check-in closed.');
            } else {
                // Optional: Check if it's too early (e.g., more than 2 hours before)
                const diffMs = eventDateTime.getTime() - now.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                
                if (diffHours > 2) {
                     setCanScan(false);
                     setTimeMessage(`⏰ Check-in opens in ${diffHours.toFixed(1)} hours`);
                } else {
                    setCanScan(true);
                    setTimeMessage('✅ Check-in is now open!');
                }
            }
        } catch (error) {
            setTimeMessage('⚠️ Invalid event time format');
            setCanScan(false);
        }
    };

    const handleScan = async () => {
        if (!qrInput.trim()) {
            setScanResult({ success: false, message: 'Please enter QR code data' });
            return;
        }

        try {
            const response = await api.post('/scan/checkin', { qr_data: qrInput });
            const result: ScanResult = response.data;
            setScanResult(result);
            setScanHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
            setQrInput(''); // Clear input for next scan
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'Failed to scan QR code';
            setScanResult({ success: false, message: errorMsg });
        }
    };

    return (
        <MotionWrapper className="max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Ticket Scanner</span>
                    <span className="text-3xl">📱</span>
                </h1>
                <p className="text-neutral-400 text-lg">Scan QR codes to mark student attendance and award points.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Event Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm h-[calc(100vh-200px)] flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📅</span> Select Event
                        </h2>
                        <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {/* Active Events */}
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 sticky top-0 bg-[#171717]/95 py-2 z-10 backdrop-blur-sm">Active Events</h3>
                            {events.filter(e => {
                                try {
                                    let timeStr = e.time;
                                    let dateStr = e.date;
                                    if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
                                        const [d, m, y] = dateStr.split(/[-/]/);
                                        dateStr = `${y}-${m}-${d}`;
                                    }
                                    if (timeStr.match(/PM|AM/i)) {
                                        const [time, modifier] = timeStr.split(' ');
                                        let [hours, minutes] = time.split(':');
                                        if (hours === '12') hours = '00';
                                        if (modifier.toUpperCase() === 'PM') hours = (parseInt(hours, 10) + 12).toString();
                                        timeStr = `${hours}:${minutes}`;
                                    }
                                    const dt = new Date(`${dateStr}T${timeStr}`);
                                    if (isNaN(dt.getTime())) return new Date(`${e.date} ${e.time}`) > new Date();
                                    return dt > new Date();
                                } catch { return true; }
                            }).map(event => (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                                        selectedEvent?.id === event.id
                                            ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20'
                                            : 'bg-neutral-800/30 hover:bg-neutral-800/50 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <h3 className={`font-bold text-sm mb-1 ${selectedEvent?.id === event.id ? 'text-blue-400' : 'text-neutral-200'}`}>{event.title}</h3>
                                    <p className="text-xs text-neutral-400 mb-2">
                                        {event.date} • {event.time}
                                    </p>
                                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full" 
                                            style={{ width: `${((event.capacity - event.seats_available) / event.capacity) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-1 text-right">
                                        {event.capacity - event.seats_available}/{event.capacity} booked
                                    </p>
                                </button>
                            ))}

                            {/* Completed Events */}
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 mt-6 sticky top-0 bg-[#171717]/95 py-2 z-10 backdrop-blur-sm">Completed Events</h3>
                            {events.filter(e => {
                                try {
                                    let timeStr = e.time;
                                    let dateStr = e.date;
                                    if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
                                        const [d, m, y] = dateStr.split(/[-/]/);
                                        dateStr = `${y}-${m}-${d}`;
                                    }
                                    if (timeStr.match(/PM|AM/i)) {
                                        const [time, modifier] = timeStr.split(' ');
                                        let [hours, minutes] = time.split(':');
                                        if (hours === '12') hours = '00';
                                        if (modifier.toUpperCase() === 'PM') hours = (parseInt(hours, 10) + 12).toString();
                                        timeStr = `${hours}:${minutes}`;
                                    }
                                    const dt = new Date(`${dateStr}T${timeStr}`);
                                    if (isNaN(dt.getTime())) return new Date(`${e.date} ${e.time}`) <= new Date();
                                    return dt <= new Date();
                                } catch { return false; }
                            }).map(event => (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all opacity-60 hover:opacity-100 border ${
                                        selectedEvent?.id === event.id
                                            ? 'bg-blue-900/20 border-blue-500/30'
                                            : 'bg-neutral-900/30 hover:bg-neutral-800/30 border-white/5'
                                    }`}
                                >
                                    <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                                    <p className="text-xs text-neutral-400">
                                        Completed
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Scanner */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedEvent ? (
                            <motion.div
                                key="scanner"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Event Info */}
                                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                                    
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>
                                        <div className="flex flex-wrap gap-6 text-sm text-neutral-300 mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">📅</span>
                                                <span>{selectedEvent.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">⏰</span>
                                                <span>{selectedEvent.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">📍</span>
                                                <span>{selectedEvent.venue}</span>
                                            </div>
                                        </div>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                                            canScan 
                                                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                                : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                        }`}>
                                            <span className="relative flex h-2 w-2">
                                                {canScan && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${canScan ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                            </span>
                                            <p className="text-sm font-bold">{timeMessage}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Scanner Input */}
                                <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span>🔍</span> Scan QR Code
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={qrInput}
                                                onChange={(e) => setQrInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && canScan && handleScan()}
                                                placeholder="Paste QR code text here (e.g., booking:123:abc...)"
                                                disabled={!canScan}
                                                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-mono"
                                                autoFocus
                                            />
                                            <p className="text-xs text-neutral-500 mt-3 ml-2">
                                                Paste the text from the student's ticket email (e.g., <code className="bg-white/5 px-1 py-0.5 rounded text-neutral-400">booking:123:abc...</code>).
                                            </p>
                                        </div>
                                        
                                        <button
                                            onClick={handleScan}
                                            disabled={!canScan}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed font-bold text-lg shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {canScan ? 'Verify Ticket' : 'Scanning Not Available'}
                                        </button>
                                    </div>
                                </div>

                                {/* Scan Result */}
                                <AnimatePresence mode="wait">
                                    {scanResult && (
                                        <motion.div
                                            key={scanResult.success ? 'success' : 'error'}
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`p-8 rounded-3xl border relative overflow-hidden ${
                                                scanResult.success
                                                    ? 'bg-green-900/20 border-green-500/30'
                                                    : 'bg-red-900/20 border-red-500/30'
                                            }`}
                                        >
                                            <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${
                                                scanResult.success ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                            
                                            <div className="relative z-10 flex items-start gap-6">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg ${
                                                    scanResult.success ? 'bg-green-500 text-white shadow-green-900/20' : 'bg-red-500 text-white shadow-red-900/20'
                                                }`}>
                                                    {scanResult.success ? '✓' : '✕'}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`text-2xl font-bold mb-1 ${
                                                        scanResult.success ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                                                    </h3>
                                                    {scanResult.success ? (
                                                        <>
                                                            <p className="text-xl font-medium text-white mb-2">
                                                                {scanResult.student_name}
                                                            </p>
                                                            <p className="text-neutral-400 text-sm mb-4">{scanResult.message}</p>
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-sm font-bold flex items-center gap-2">
                                                                    <span>🏆</span> +{scanResult.points_earned} Points
                                                                </span>
                                                                <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20 text-sm font-bold capitalize">
                                                                    {scanResult.attendance_type}
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-neutral-300 text-lg">{scanResult.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Scan History */}
                                {scanHistory.length > 0 && (
                                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                                        <h3 className="text-xl font-bold mb-6">Recent Scans</h3>
                                        <div className="space-y-3">
                                            {scanHistory.map((scan, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={idx}
                                                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                                                        scan.success
                                                            ? 'bg-green-500/5 border-green-500/10'
                                                            : 'bg-red-500/5 border-red-500/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                                            scan.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {scan.success ? '✓' : '✕'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">
                                                                {scan.success ? scan.student_name : 'Failed Scan'}
                                                            </p>
                                                            <p className="text-xs text-neutral-500">{scan.message}</p>
                                                        </div>
                                                    </div>
                                                    {scan.success && (
                                                        <span className="text-sm font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/10">
                                                            +{scan.points_earned}
                                                        </span>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-neutral-900/30 border border-dashed border-white/10 rounded-3xl p-20 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
                            >
                                <div className="w-24 h-24 rounded-full bg-neutral-800/50 flex items-center justify-center text-4xl mb-6 animate-pulse">
                                    👈
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Select an Event</h2>
                                <p className="text-neutral-500 max-w-md">
                                    Choose an event from the list on the left to start scanning tickets and marking attendance.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </MotionWrapper>
    );
}
