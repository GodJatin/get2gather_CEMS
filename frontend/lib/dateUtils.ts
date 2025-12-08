
export const parseEventDate = (dateStr: string, timeStr: string): Date => {
    // Return invalid date if inputs missing
    if (!dateStr || !timeStr) return new Date('Invalid');

    let year, month, day;
    // Handle DD-MM-YYYY or DD/MM/YYYY
    if (dateStr.match(/^\d{2}[-/]\d{2}[-/]\d{4}$/)) {
        [day, month, year] = dateStr.split(/[-/]/).map(Number);
    } 
    // Handle YYYY-MM-DD
    else if (dateStr.match(/^\d{4}[-/]\d{2}[-/]\d{2}$/)) {
         [year, month, day] = dateStr.split(/[-/]/).map(Number);
    } else {
        return new Date(`${dateStr}T${timeStr}`); 
    }

    let hours = 0, minutes = 0;
    // Handle 12h format (1:30 PM)
    if (timeStr.match(/PM|AM/i)) {
        const [time, modifier] = timeStr.split(' ');
        let [h, m] = time.split(':');
        hours = parseInt(h, 10);
        minutes = parseInt(m, 10);
        
        if (hours === 12) hours = 0;
        if (modifier && modifier.toUpperCase() === 'PM') hours += 12;
    } 
    // Handle 24h format (13:30)
    else {
        const [h, m] = timeStr.split(':');
        hours = parseInt(h, 10);
        minutes = parseInt(m, 10);
    }

    return new Date(year, month - 1, day, hours, minutes);
};

export const getEventStatus = (event: { date: string, time: string, end_time?: string }): 'Active' | 'Upcoming' | 'Completed' => {
    try {
        const start = parseEventDate(event.date, event.time);
        
        // Determine end time: 
        // If end_time exists, use it. 
        // Else default to start + 2 hours.
        let end: Date;
        if (event.end_time && event.end_time.trim() !== '') {
            end = parseEventDate(event.date, event.end_time);
            // Handle case where end time is simpler/diff format or fails, fallback to strict relative
            if (isNaN(end.getTime())) {
                 end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
            }
        } else {
            end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        }

        const now = new Date();

        if (now > end) return 'Completed';
        // Active if check-in allows (e.g. 1h before start) until end
        // But for "Status" display, usually Active = during event.
        // Let's stick to strict Event Duration for "Active" status in lists
        if (now >= start && now <= end) return 'Active';
        
        // If now is before start, it's Upcoming (or Active if we include check-in buffer?)
        // User requested: "as soon as it's 9 [start] open scanning... at 12 display event completed"
        // This implies precise windows.
        return 'Upcoming';
    } catch (e) {
        return 'Upcoming'; // Safe fallback
    }
};

export const isScanEligible = (event: { date: string, time: string, end_time?: string }): { eligible: boolean, message: string } => {
    try {
        const start = parseEventDate(event.date, event.time);
        const now = new Date();
        
        let end: Date;
        if (event.end_time && event.end_time.trim() !== '') {
             end = parseEventDate(event.date, event.end_time);
        } else {
             end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        }

        // Scan Window: Start - 2h to End + 12h (allow late check-ins/post-event marking)
        // Adjusting based on user feedback "At 12 display event completed".
        // But scanning usually needs to stay open a bit longer? 
        // User said "at 10 close the scanning". This contradicts "Active Events" in Scan page.
        // If user wants STRICT scanning: Scan only during event?
        // "at 10 close the scanning... then at 12 display completed"
        // Let's stick to a generous Scan Window but Strict Display Status.
        // Scan Eligible = Start - 2h  to End + 4h (Reasonable buffer)
        
        const scanStart = new Date(start.getTime() - 2 * 60 * 60 * 1000);
        const scanEnd = new Date(end.getTime() + 4 * 60 * 60 * 1000);
        
        if (now < scanStart) {
             const diffMs = scanStart.getTime() - now.getTime();
             const diffHours = diffMs / (1000 * 60 * 60);
             return { eligible: false, message: `Check-in opens in ${diffHours.toFixed(1)}h` };
        }
        
        if (now > scanEnd) {
             return { eligible: false, message: 'Check-in Closed' };
        }
        
        return { eligible: true, message: 'Check-in Open' };

    } catch (e) {
        return { eligible: false, message: 'Invalid Date' };
    }
};
