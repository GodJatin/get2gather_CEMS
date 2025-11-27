'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

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
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const checkScanEligibility = () => {
        if (!selectedEvent) return;

        try {
            const eventDateTime = new Date(`${selectedEvent.date} ${selectedEvent.time}`);
            const now = new Date();
            const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilEvent > 1) {
                setCanScan(false);
                setTimeMessage(`⏰ Check-in opens in ${hoursUntilEvent.toFixed(1)} hours (1 hour before event)`);
            } else if (hoursUntilEvent < -3) {
                setCanScan(false);
                setTimeMessage('🔒 Event has ended. Check-in closed.');
            } else {
                setCanScan(true);
                setTimeMessage('✅ Check-in is now open!');
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Create an image element
            const img = new Image();
            const imageUrl = URL.createObjectURL(file);
            
            img.onload = () => {
                // Create canvas and draw image
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Try to decode QR using a simple approach - looking for text in image
                // For now, just show message that user should paste the code
                setScanResult({ 
                    success: false, 
                    message: 'Please paste the QR code text instead of uploading image. Check your email for the QR code data.' 
                });
                
                URL.revokeObjectURL(imageUrl);
            };
            
            img.src = imageUrl;
        } catch (error) {
            setScanResult({ success: false, message: 'Failed to process image' });
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">📱 Ticket Scanner</h1>
                    <p className="text-neutral-400">Scan QR codes to mark student attendance</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Event Selection */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4">Select Event</h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {events.map(event => (
                                    <button
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`w-full text-left p-4 rounded-xl transition-all ${
                                            selectedEvent?.id === event.id
                                                ? 'bg-blue-600 border-2 border-blue-400'
                                                : 'bg-neutral-800/50 hover:bg-neutral-700 border border-white/10'
                                        }`}
                                    >
                                        <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                                        <p className="text-xs text-neutral-400">
                                            📅 {event.date} • ⏰ {event.time}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {event.capacity - event.seats_available}/{event.capacity} booked
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Scanner */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedEvent ? (
                            <>
                                {/* Event Info */}
                                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6">
                                    <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
                                    <div className="flex gap-4 text-sm text-neutral-300">
                                        <span>📅 {selectedEvent.date}</span>
                                        <span>⏰ {selectedEvent.time}</span>
                                        <span>📍 {selectedEvent.venue}</span>
                                    </div>
                                    <div className={`mt-4 p-3 rounded-lg ${canScan ? 'bg-green-900/30 border border-green-500/50' : 'bg-orange-900/30 border border-orange-500/50'}`}>
                                        <p className="text-sm font-medium">{timeMessage}</p>
                                    </div>
                                </div>

                                {/* QR Scanner Input */}
                                <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4">Scan QR Code</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={qrInput}
                                                onChange={(e) => setQrInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && canScan && handleScan()}
                                                placeholder="Paste QR code text here (e.g., booking:123:abc...)"
                                                disabled={!canScan}
                                                className="w-full bg-neutral-800 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                autoFocus
                                            />
                                            <p className="text-xs text-neutral-500 mt-2">
                                                Paste QR code text from student's email and press Enter
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleScan}
                                                disabled={!canScan}
                                                className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed font-bold transition-colors"
                                            >
                                                {canScan ? '✓ Verify Ticket' : '🔒 Scanning Not Available'}
                                            </button>
                                            
                                            <label className={`px-6 py-4 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-2 ${canScan ? 'bg-purple-600 hover:bg-purple-500' : 'bg-neutral-700 cursor-not-allowed opacity-50'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={!canScan}
                                                    className="hidden"
                                                />
                                                📷 Upload QR
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Scan Result */}
                                {scanResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`p-6 rounded-2xl border-2 ${
                                            scanResult.success
                                                ? 'bg-green-900/20 border-green-500'
                                                : 'bg-red-900/20 border-red-500'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl">{scanResult.success ? '✅' : '❌'}</span>
                                            <h3 className="text-xl font-bold">
                                                {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                                            </h3>
                                        </div>
                                        {scanResult.success ? (
                                            <>
                                                <p className="text-lg mb-1">
                                                    <strong>{scanResult.student_name}</strong>
                                                </p>
                                                <p className="text-neutral-300 text-sm mb-2">{scanResult.message}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="px-3 py-1 rounded-full bg-yellow-600 text-sm font-bold">
                                                        +{scanResult.points_earned} Points
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-blue-600 text-sm font-bold capitalize">
                                                        {scanResult.attendance_type}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-neutral-300">{scanResult.message}</p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Scan History */}
                                {scanHistory.length > 0 && (
                                    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold mb-4">Recent Scans</h3>
                                        <div className="space-y-2">
                                            {scanHistory.map((scan, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-xl border ${
                                                        scan.success
                                                            ? 'bg-green-900/10 border-green-500/30'
                                                            : 'bg-red-900/10 border-red-500/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {scan.success ? `✅ ${scan.student_name}` : '❌ Failed'}
                                                            </p>
                                                            <p className="text-xs text-neutral-400">{scan.message}</p>
                                                        </div>
                                                        {scan.success && (
                                                            <span className="text-sm font-bold text-yellow-400">
                                                                +{scan.points_earned}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-12 text-center">
                                <p className="text-neutral-500 text-lg">← Select an event to start scanning</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
