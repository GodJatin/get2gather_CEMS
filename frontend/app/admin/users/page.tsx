'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';

interface User {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
    organization_name?: string;
    contact?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'student' | 'organizer' | 'admin'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user => filter === 'all' || user.role === filter);

    const downloadCSV = () => {
        if (users.length === 0) return;

        const headers = ["ID", "Email", "Role", "Organization", "Contact"];
        const csvContent = [
            headers.join(","),
            ...filteredUsers.map(u => [
                u.id, 
                u.email, 
                u.role, 
                u.organization_name || "", 
                u.contact || ""
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${filter}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: 'student', label: 'Students' },
        { id: 'organizer', label: 'Organizers' },
        { id: 'admin', label: 'Admins' },
    ];

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <MotionWrapper>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-neutral-400">Manage all platform users</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
                    >
                        <span>⬇️</span> CSV
                    </button>
                    <div className="flex bg-neutral-900 border border-white/10 p-1 rounded-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    filter === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-neutral-400 font-medium text-sm uppercase tracking-wider">
                                <th className="p-6">ID</th>
                                <th className="p-6">Email</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Details</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-neutral-500">
                                        No {filter !== 'all' ? filter : ''} users found.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 text-neutral-500 font-mono">#{user.id}</td>
                                    <td className="p-6 font-medium text-white">{user.email}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            user.role === 'organizer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm text-neutral-400">
                                        {user.organization_name && <div className="mb-1">🏢 {user.organization_name}</div>}
                                        {user.contact && <div>📞 {user.contact}</div>}
                                    </td>
                                    <td className="p-6 text-right">
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500">
                            No users found.
                        </div>
                    ) : filteredUsers.map((user) => (
                        <div key={user.id} className="p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-white break-all">{user.email}</div>
                                    <div className="text-xs text-neutral-500 font-mono mt-1">#{user.id}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    user.role === 'organizer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                            
                            {(user.organization_name || user.contact) && (
                                <div className="bg-white/5 p-3 rounded-lg text-sm text-neutral-300 border border-white/5 space-y-1">
                                    {user.organization_name && <div>🏢 {user.organization_name}</div>}
                                    {user.contact && <div>📞 {user.contact}</div>}
                                </div>
                            )}

                            {user.role !== 'admin' && (
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="w-full text-center text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Delete User
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </MotionWrapper>
    );
}
