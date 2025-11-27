import { motion } from 'framer-motion';

interface EventPassProps {
    eventTitle: string;
    eventDate: string;
    eventTime?: string;
    venue?: string;
    status: 'Attendee' | 'Volunteer';
}

export default function EventPass({ eventTitle, eventDate, eventTime, venue, status }: EventPassProps) {
    const isVolunteer = status === 'Volunteer';
    
    return (
        <motion.div 
            className={`relative overflow-hidden rounded-2xl border-2 ${
                isVolunteer 
                    ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/50' 
                    : 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/50'
            } p-6`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Badge */}
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isVolunteer 
                            ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' 
                            : 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                    }`}>
                        {isVolunteer ? '🤝 Volunteer Pass' : '🎫 Attendee Pass'}
                    </div>
                    <div className={`text-4xl ${isVolunteer ? 'animate-pulse' : ''}`}>
                        {isVolunteer ? '⭐' : '✅'}
                    </div>
                </div>

                {/* Event Details */}
                <h3 className="text-xl font-bold mb-2">{eventTitle}</h3>
                <div className="space-y-1 text-sm text-neutral-300">
                    <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(eventDate).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                    {eventTime && (
                        <div className="flex items-center gap-2">
                            <span>🕐</span>
                            <span>{eventTime}</span>
                        </div>
                    )}
                    {venue && (
                        <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{venue}</span>
                        </div>
                    )}
                </div>

                {/* QR Code Placeholder (for future implementation) */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs text-neutral-500">
                        {isVolunteer ? 'Check in at registration desk' : 'Show this pass at entry'}
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-xs text-neutral-500">
                        QR
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
