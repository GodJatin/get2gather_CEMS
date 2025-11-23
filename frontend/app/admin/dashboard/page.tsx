'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingApprovals: 0,
        activeEvents: 0
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-neutral-400 mt-1">Overview of system status</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Total Users', value: '1,234', color: 'blue' },
                    { label: 'Pending Approvals', value: '5', color: 'yellow' },
                    { label: 'Active Events', value: '12', color: 'green' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5"
                    >
                        <h3 className="text-neutral-400 text-sm font-medium mb-2">{stat.label}</h3>
                        <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5">
                    <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-800/30">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <span className="text-xs">LOG</span>
                                </div>
                                <div>
                                    <p className="font-medium">New user registered</p>
                                    <p className="text-xs text-neutral-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5">
                    <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors text-left">
                            <span className="block text-blue-400 mb-2">👥</span>
                            <span className="font-medium">Manage Users</span>
                        </button>
                        <button className="p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors text-left">
                            <span className="block text-purple-400 mb-2">📅</span>
                            <span className="font-medium">Manage Events</span>
                        </button>
                        <button className="p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors text-left">
                            <span className="block text-yellow-400 mb-2">⚠️</span>
                            <span className="font-medium">Moderation</span>
                        </button>
                        <button className="p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors text-left">
                            <span className="block text-green-400 mb-2">⚙️</span>
                            <span className="font-medium">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
