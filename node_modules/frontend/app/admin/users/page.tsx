'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import MotionWrapper from '@/components/MotionWrapper';
import { TableRowSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

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
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
        try {
            const skip = (page - 1) * limit;
            const [res] = await Promise.all([
                 api.get(`/admin/users?skip=${skip}&limit=${limit}`),
                 minDelay
            ]);

            if (res.data.users) {
                setUsers(res.data.users);
                setTotal(res.data.total);
            } else {
                setUsers(res.data);
                setTotal(res.data.length);
            }
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
            setTotal(t => t - 1);
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user => filter === 'all' || user.role === filter);
    const totalPages = Math.ceil(total / limit);

    const handleExportAll = async () => {
        try {
            const response = await api.get('/admin/users/export', { responseType: 'blob' });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `all_users_export_${new Date().toISOString().split('T')[0]}.csv`); 
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) link.parentNode.removeChild(link);
            
         } catch (error) {
             console.error('Export failed', error);
             alert('Failed to export users');
         }
    };

    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: 'student', label: 'Students' },
        { id: 'organizer', label: 'Organizers' },
        { id: 'admin', label: 'Admins' },
    ];

    if (loading) return (
         <MotionWrapper>
             <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex gap-3">
                         <Skeleton className="h-10 w-24 rounded-xl" />
                         <Skeleton className="h-10 w-64 rounded-xl" />
                    </div>
                </div>
             </div>
             
             <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10 hidden md:flex gap-6">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="p-4">
                      <TableRowSkeleton />
                  </div>
             </div>
         </MotionWrapper>
    );

    return (
        <MotionWrapper>
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-neutral-400">Manage all platform users (Total: {total})</p>
                    </div>
                    
                    {/* Desktop Actions */}
                    <div className="hidden md:flex gap-3">
                        <button 
                            onClick={handleExportAll}
                            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
                        >
                            <span>⬇️</span> Export All Users
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

                {/* Mobile Tabs */}
                <div className="md:hidden w-full overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4">
                    <div className="flex bg-neutral-900 border border-white/10 p-1 rounded-xl w-max mx-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
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

                {/* Mobile Floating Download Button */}
                <button 
                    onClick={handleExportAll}
                    className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-xl border border-white/20 active:scale-95 transition-transform"
                    aria-label="Export All CSV"
                >
                    ⬇️
                </button>
            </div>
            
            <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl flex flex-col">
                {/* Desktop Table - Wrapped in flex-1 for sticky footer if needed, but simple block is fine */}
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
                                        No {filter !== 'all' ? filter : ''} users found on this page.
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
                            No users found on this page.
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
                
                {/* Pagination Controls */}
                <div className="p-6 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-neutral-400 text-sm">
                        Showing {filteredUsers.length} of {total} users (Page {page})
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors border border-white/5 font-medium text-sm"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple logic to show near pages, for now just show 1..5 if total is huge or dynamic in v2
                                let p = i + 1;
                                if (page > 3) p = page - 2 + i;
                                if (p > totalPages) return null;
                                
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                                            page === p 
                                                ? 'bg-blue-600 text-white shadow-lg' 
                                                : 'text-neutral-400 hover:bg-white/5'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= total}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors border border-white/5 font-medium text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </MotionWrapper>
    );
}
