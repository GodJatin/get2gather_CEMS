"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsChartsProps {
  events: any[];
}

export default function AnalyticsCharts({ events }: AnalyticsChartsProps) {
  // 1. Process Data for "Tickets per Event" (Recent Completed Events)
  const ticketData = events
    .filter(event => event.status === 'Completed') // Filter for Completed
    .sort((a, b) => {
        // Sort by Date Descending (Newest First)
        // detailed sort might need time parsing, assuming generic date string comparable or YYYY-MM-DD
        const dateA = new Date(`${a.date} ${a.time || ''}`);
        const dateB = new Date(`${b.date} ${b.time || ''}`);
        return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5) // Take top 5
    .map(event => ({
      name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
      booked: event.booked_count || 0,
      capacity: event.max_attendees || 100
    }));

  // 2. Process Data for "Volunteers vs Attendees" (Aggregate - ALL Events)
  const totalAttendees = events.reduce((acc, curr) => acc + (curr.booked_count || 0), 0);
  const totalVolunteers = events.reduce((acc, curr) => acc + (curr.volunteers_count || 0), 0);
  
  const pieData = [
    { name: 'Attendees', value: totalAttendees },
    { name: 'Volunteers', value: totalVolunteers }
  ];
  
  const COLORS = ['#8884d8', '#82ca9d'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Chart 1: Ticket Sales */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-indigo-400">📊</span> Ticket Sales (Recent Events)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                cursor={{ fill: '#374151', opacity: 0.4 }}
              />
              <Legend />
              <Bar dataKey="booked" name="Booked" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Capacity" fill="#374151" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Participation Distribution */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="text-emerald-400">👥</span> Total Participation
        </h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
