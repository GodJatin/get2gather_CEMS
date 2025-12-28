'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: {
        id: number;
        event_title: string;
        event_date: string;
        event_time: string;
        event_venue: string;
        status: string;
        qr_code?: string;
        qr_data?: string;
    } | null;
}

export default function TicketModal({ isOpen, onClose, ticket }: TicketModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !ticket) return null;

    // Portal to document.body to ensure it sits on top of everything
    return createPortal(
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-500"
                            enterFrom="opacity-0 translate-y-20 scale-95"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-300"
                            leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 translate-y-20 scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-neutral-900 text-left shadow-2xl transition-all w-full max-w-sm mx-auto my-8">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm"
                                >
                                    ✕
                                </button>

                                {/* Ticket Container - Wallet Pass Style */}
                                <div className="flex flex-col bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden relative">

                                    {/* Top Section - Event Info (Holographic/Colorful) */}
                                    <div className="relative p-6 bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden min-h-[160px] flex flex-col justify-end">
                                        {/* Decorative Elements */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10" />
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 hover:opacity-30 transition-opacity bg-fixed" />

                                        {/* Content */}
                                        <div className="relative z-10">
                                            <span className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider mb-3 text-white/90">
                                                ADMIT ONE
                                            </span>
                                            <h3 className="text-2xl font-bold text-white mb-1 leading-tight">{ticket.event_title}</h3>
                                            <div className="flex items-center gap-2 text-indigo-200 text-sm">
                                                <span>📍 {ticket.event_venue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Perforated Line - Visual Separator */}
                                    <div className="relative h-6 bg-[#1a1a1a] flex items-center justify-between">
                                        <div className="w-6 h-6 rounded-full bg-black -ml-3" /> {/* Left Punch */}
                                        <div className="border-b-2 border-dashed border-white/10 w-full mx-2 opacity-50" />
                                        <div className="w-6 h-6 rounded-full bg-black -mr-3" /> {/* Right Punch */}
                                    </div>

                                    {/* Bottom Section - QR & Details */}
                                    <div className="flex-1 p-6 pt-2 bg-[#1a1a1a] flex flex-col items-center">
                                        {/* Date & Time Row */}
                                        <div className="flex justify-between w-full mb-8 text-center bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div>
                                                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Date</p>
                                                <p className="font-bold text-white text-lg">{ticket.event_date}</p>
                                            </div>
                                            <div className="md:w-px md:h-full w-full h-px md:mx-4 my-2 md:my-0 bg-white/10"></div> {/* Separator */}
                                            <div>
                                                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Time</p>
                                                <p className="font-bold text-white text-lg">{ticket.event_time}</p>
                                            </div>
                                        </div>

                                        {/* QR Code Container */}
                                        <div className="relative p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 group">
                                            <div className="absolute inset-0 rounded-2xl border-4 border-transparent group-hover:border-indigo-500/30 transition-colors pointer-events-none" />
                                            {ticket.qr_code || ticket.qr_data ? (
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.qr_code || ticket.qr_data || '')}`}
                                                    alt="Ticket QR"
                                                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                                                />
                                            ) : (
                                                <div className="w-48 h-48 bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
                                                    Generation Pending
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Info */}
                                        <p className="text-sm font-mono text-neutral-500 mb-2">#{ticket.id} • {ticket.status}</p>
                                        <div className="flex items-center gap-2 text-xs text-neutral-600 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Active Ticket
                                        </div>

                                        {/* Scan Instructions */}
                                        <p className="text-[10px] text-neutral-600 mt-6 text-center max-w-[200px]">
                                            Present this code at the entrance. Screenshots are accepted.
                                        </p>
                                    </div>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>,
        document.body
    );
}
