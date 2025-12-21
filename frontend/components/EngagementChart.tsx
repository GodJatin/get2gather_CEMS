'use client';

import { getEventStatus } from '@/lib/dateUtils';
import { motion } from 'framer-motion';

interface EngagementChartProps {
    events: any[]; 
}

interface EventData {
    id: number;
    title: string;
    attended_count: number;
    volunteer_count: number;
    date: string;
    time?: string;
}

export default function EngagementChart({ events }: EngagementChartProps) {
    // Process Data: Last 5 Completed Events
    const chartEvents = events
        .filter(e => getEventStatus(e) === 'Completed')
        .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time || ''}`);
            const dateB = new Date(`${b.date} ${b.time || ''}`);
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .reverse();

    if (chartEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-neutral-500">
                <span className="text-4xl mb-4">📉</span>
                <p>No completed events data available yet.</p>
                <p className="text-xs">Complete an event to see analytics.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[300px] relative select-none">
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <line key={i} x1="0" y1={200 * p} x2="600" y2={200 * p} stroke="white" strokeOpacity="0.05" />
                ))}

                {/* Chart Logic */}
                {(() => {
                    const maxVal = Math.max(...chartEvents.map(e => Math.max(e.attended_count, e.volunteer_count)), 5);
                    
                    const getPoints = (getValue: (e: any) => number) => chartEvents.map((e, i) => {
                        const x = (i / (chartEvents.length - 1)) * 600;
                        const y = 200 - (getValue(e) / maxVal) * 170; 
                        return `${x},${y}`;
                    }).join(' ');

                    const attPoints = getPoints(e => e.attended_count);
                    const volPoints = getPoints(e => e.volunteer_count);
                    
                    const fillPath = `M0,200 L${attPoints.replace(/ /g, ' L')} L600,200 Z`;

                    return (
                        <>
                            {/* Attendees Area & Line */}
                            <path d={fillPath} fill="url(#gradient)" stroke="none" opacity="0.3" />
                            <polyline points={attPoints} fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Volunteers Line */}
                            <polyline points={volPoints} fill="none" stroke="#d946ef" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />

                            {/* Dots & Labels - Attendees */}
                            {chartEvents.map((e, i) => {
                                const x = (i / (chartEvents.length - 1)) * 600;
                                const y = 200 - (e.attended_count / maxVal) * 170;
                                return (
                                    <g key={`att-${e.id}`} className="group cursor-pointer">
                                        <circle cx={x} cy={y} r="4" fill="#60A5FA" className="group-hover:r-6 transition-all duration-300" />
                                        <foreignObject x={x - 50} y={y - 45} width="100" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <div className="bg-blue-600 text-white text-[10px] font-bold rounded px-2 py-1 text-center shadow-lg border border-white/10 mx-auto w-fit">
                                                {e.attended_count} Attendees
                                            </div>
                                        </foreignObject>
                                    </g>
                                );
                            })}

                            {/* Dots & Labels - Volunteers */}
                            {chartEvents.map((e, i) => {
                                const x = (i / (chartEvents.length - 1)) * 600;
                                const y = 200 - (e.volunteer_count / maxVal) * 170;
                                return (
                                    <g key={`vol-${e.id}`} className="group cursor-pointer">
                                        <circle cx={x} cy={y} r="4" fill="#d946ef" className="group-hover:r-6 transition-all duration-300" />
                                        <foreignObject x={x - 50} y={y - 45} width="100" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <div className="bg-fuchsia-600 text-white text-[10px] font-bold rounded px-2 py-1 text-center shadow-lg border border-white/10 mx-auto w-fit">
                                                {e.volunteer_count} Vols
                                            </div>
                                        </foreignObject>
                                        
                                        {/* Date Label */}
                                        <text x={x} y="220" textAnchor="middle" fill="#9CA3AF" fontSize="12" className="mt-2 font-mono">
                                            {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </text>
                                    </g>
                                );
                            })}
                        </>
                    );
                })()}
            </svg>
            
            {/* Legend */}
            <div className="absolute top-0 right-0 flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-blue-200">Attendees</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div>
                    <span className="text-fuchsia-200">Volunteers</span>
                </div>
            </div>
        </div>
    );
}
