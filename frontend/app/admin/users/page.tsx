'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

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

    const [filter, setFilter] = useState<'all' | 'student' | 'organizer' | 'admin'>('all');

    const filteredUsers = users.filter(user => filter === 'all' || user.role === filter);

    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: 'student', label: 'Students' },
        { id: 'organizer', label: 'Organizers' },
        { id: 'admin', label: 'Admins' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <span>⬇️</span> Export CSV
                    </button>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    filter === tab.id 
                                        ? 'bg-white text-gray-800 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Role</th>
                            <th className="p-4 font-semibold text-gray-600">Details</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No {filter !== 'all' ? filter : ''} users found.
                                </td>
                            </tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600">#{user.id}</td>
                                <td className="p-4 font-medium text-gray-800">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                        user.role === 'organizer' ? 'bg-purple-100 text-purple-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {user.organization_name && <div>Org: {user.organization_name}</div>}
                                    {user.contact && <div>Ph: {user.contact}</div>}
                                </td>
                                <td className="p-4">
                                    {user.role !== 'admin' && (
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
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
        </div>
    );
}
