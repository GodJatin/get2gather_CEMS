'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import MotionWrapper from '@/components/MotionWrapper';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getEventStatus, isScanEligible, parseEventDate } from '@/lib/dateUtils';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    end_time?: string;
    venue: string;
    seats_available: number;
    capacity: number;
    attended_count?: number;
    volunteer_count?: number;
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
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
    const [showCamera, setShowCamera] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        fetchOrganizerEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            checkScanEligibility();
            const interval = setInterval(checkScanEligibility, 60000); // Update every minute
            return () => clearInterval(interval);
        }
    }, [selectedEvent]);

    useEffect(() => {
        if (showCamera && !scannerRef.current) {
            // Initialize scanner
            setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );
                scanner.render(handleCameraScan, (err) => console.log(err));
                scannerRef.current = scanner;
            }, 100);
        } 
        
        return () => {
            if (!showCamera && scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [showCamera]);

    const fetchOrganizerEvents = async () => {
        try {
            const response = await api.get('/events/my'); // Use updated endpoint
            setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            setEvents([]);
        }
    };

    const checkScanEligibility = () => {
        if (!selectedEvent) return;
        const status = isScanEligible(selectedEvent);
        setCanScan(status.eligible);
        setTimeMessage(status.message);
    };

    const handleCameraScan = (decodedText: string) => {
        if (decodedText) {
            setQrInput(decodedText);
            handleScan(decodedText);
            setShowCamera(false); // Close camera on scan
        }
    };

    const handleScan = async (dataOverride?: string) => {
        const dataToSubmit = dataOverride || qrInput;
        if (!dataToSubmit.trim()) {
            setScanResult({ success: false, message: 'No QR data' });
            return;
        }

        try {
            const response = await api.post('/events/checkin', { qr_data: dataToSubmit });
            const result: ScanResult = response.data;
            setScanResult(result);
            setScanHistory(prev => [result, ...prev].slice(0, 10));
            setQrInput('');
            
            // Refund update (refresh events to update counters)
            fetchOrganizerEvents();
            
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'Scan Failed';
            setScanResult({ success: false, message: errorMsg });
        }
    };

    // Helper for sorting
    const sortEvents = (eventsList: Event[], ascending: boolean = true) => {
        return [...eventsList].sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`).getTime();
            const dateB = new Date(`${b.date} ${b.time}`).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    };

    // Categorize Events
    const categorizedEvents = {
        active: sortEvents(events.filter(e => {
            const status = getEventStatus(e);
            return status === 'Active' || (status === 'Upcoming' && isScanEligible(e).eligible);
        }), true), // Ascending (Soonest first)
        
        upcoming: sortEvents(events.filter(e => {
            const status = getEventStatus(e);
            return status === 'Upcoming' && !isScanEligible(e).eligible;
        }), true), // Ascending (Soonest first)
        
        completed: sortEvents(events.filter(e => getEventStatus(e) === 'Completed'), false) // Descending (Newest first)
    };

    return (
        <MotionWrapper className="max-w-7xl mx-auto min-h-screen pb-20">
            {/* Header */}
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Ticket Scanner</span>
                    <span className="text-3xl">📱</span>
                </h1>
                <p className="text-neutral-400">Manage entry and attendance for your events.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Event List */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm h-[80vh] flex flex-col">
                        <div className="flex gap-2 mb-6 p-1 bg-neutral-800 rounded-xl">
                            {(['active', 'upcoming', 'completed'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                        activeTab === tab 
                                            ? 'bg-neutral-700 text-white shadow-lg' 
                                            : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {categorizedEvents[activeTab].length === 0 && (
                                <p className="text-center text-neutral-500 py-10 text-sm">No {activeTab} events found.</p>
                            )}
                            {categorizedEvents[activeTab].map(event => (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border group relative overflow-hidden ${
                                        selectedEvent?.id === event.id
                                            ? 'bg-blue-600/20 border-blue-500/50'
                                            : 'bg-neutral-800/30 border-white/5 hover:bg-neutral-800/50'
                                    }`}
                                >
                                    <div className="relative z-10">
                                        <h3 className={`font-bold text-sm mb-1 ${selectedEvent?.id === event.id ? 'text-blue-400' : 'text-neutral-200'}`}>{event.title}</h3>
                                        <p className="text-xs text-neutral-400 mb-2">{event.date} • {event.time}</p>
                                        
                                        {/* Counters */}
                                        <div className="flex gap-3 mt-2">
                                            <div className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                                                <span>👥</span> {event.attended_count || 0} In
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">
                                                <span>🤝</span> {event.volunteer_count || 0} Vol
                                            </div>
                                        </div>
                                    </div>
                                    {selectedEvent?.id === event.id && <div className="absolute inset-0 bg-blue-500/5 z-0" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Scanner Interface */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedEvent ? (
                            <motion.div
                                key="scanner"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Active Event Header */}
                                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 z-10 flex flex-col items-end gap-2">
                                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border backdrop-blur-md ${
                                            canScan ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        }`}>
                                            {timeMessage}
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-3xl font-bold mb-4 pr-32">{selectedEvent.title}</h2>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        <div className="bg-neutral-900/50 rounded-2xl p-4 text-center border border-white/5">
                                            <span className="text-2xl font-bold block">{selectedEvent.capacity}</span>
                                            <span className="text-xs text-neutral-500 uppercase">Capacity</span>
                                        </div>
                                        <div className="bg-neutral-900/50 rounded-2xl p-4 text-center border border-white/5">
                                            <span className="text-2xl font-bold block text-blue-400">
                                                {selectedEvent.capacity - selectedEvent.seats_available}
                                            </span>
                                            <span className="text-xs text-neutral-500 uppercase">Booked</span>
                                        </div>
                                        <div className="bg-green-900/20 rounded-2xl p-4 text-center border border-green-500/20">
                                            <span className="text-2xl font-bold block text-green-400">{selectedEvent.attended_count || 0}</span>
                                            <span className="text-xs text-green-500/70 uppercase">Checked In</span>
                                        </div>
                                        <div className="bg-purple-900/20 rounded-2xl p-4 text-center border border-purple-500/20">
                                            <span className="text-2xl font-bold block text-purple-400">{selectedEvent.volunteer_count || 0}</span>
                                            <span className="text-xs text-purple-500/70 uppercase">Volunteers</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Scanner Controls */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Input Section */}
                                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <span>⌨️</span> Manual Entry
                                        </h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={qrInput}
                                                onChange={(e) => setQrInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && canScan && handleScan()}
                                                placeholder="Enter Ticket ID..."
                                                disabled={!canScan}
                                                className="flex-1 bg-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/5"
                                            />
                                            <button
                                                onClick={() => handleScan()}
                                                disabled={!canScan}
                                                className="px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>

                                    {/* Camera Button */}
                                    <button
                                        onClick={() => setShowCamera(true)}
                                        disabled={!canScan}
                                        className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col items-center justify-center gap-2 hover:bg-neutral-800/50 transition-all disabled:opacity-50 group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                            📸
                                        </div>
                                        <span className="font-bold text-lg">Open Camera</span>
                                        <span className="text-xs text-neutral-500">Scan QR Code directly</span>
                                    </button>
                                </div>

                                {/* Scan Result Display */}
                                <AnimatePresence mode="wait">
                                    {scanResult && (
                                        <motion.div
                                            key={scanResult.success ? 'success' : 'fail'}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`rounded-3xl p-6 border ${
                                                scanResult.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`text-4xl ${scanResult.success ? 'grayscale-0' : 'grayscale'}`}>
                                                    {scanResult.success ? '🎉' : '❌'}
                                                </div>
                                                <div>
                                                    <h3 className={`text-xl font-bold ${scanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                                        {scanResult.success ? 'Success!' : 'Error'}
                                                    </h3>
                                                    <p className="text-white text-lg font-medium mt-1">{scanResult.message}</p>
                                                    {scanResult.success && (
                                                        <div className="mt-2 text-sm text-neutral-400">
                                                            {scanResult.student_name} • +{scanResult.points_earned} Points
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-neutral-900/30 border border-dashed border-white/10 rounded-3xl">
                                <span className="text-6xl mb-6 opacity-50">👈</span>
                                <h2 className="text-2xl font-bold mb-2">Select an Event</h2>
                                <p className="text-neutral-500">Choose an active event to start scanning.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 rounded-3xl p-6 w-full max-w-md border border-white/10 relative">
                        <button 
                            onClick={() => setShowCamera(false)}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold mb-6 text-center">Scan Ticket</h3>
                        <div id="reader" className="w-full rounded-xl overflow-hidden bg-black"></div>
                        <p className="text-center text-sm text-neutral-500 mt-4">Point camera at the QR code</p>
                    </div>
                </div>
            )}
        </MotionWrapper>
    );
}
