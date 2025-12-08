
export const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    
    // Handle comma-separated images (take first one)
    if (path.includes(',')) {
        path = path.split(',')[0].trim();
    }

    // Handle JSON array (if stored as stringified JSON)
    if (path.startsWith('[') || path.startsWith('{')) {
        try {
            const parsed = JSON.parse(path);
            if (Array.isArray(parsed) && parsed.length > 0) {
                path = parsed[0];
            } else if (typeof parsed === 'string') {
                path = parsed;
            }
        } catch (e) {
            // Fallback to original path if parse fails
        }
    }

    if (!path) return null;

    // If it's already an absolute URL, return it
    if (path.startsWith('http')) {
        return path;
    }

    // If it's a relative path starting with /static, prepend API URL
    if (path.startsWith('/static')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // Remove trailing slash from API URL if present
        const cleanApiUrl = apiUrl.replace(/\/$/, '');
        return `${cleanApiUrl}${path}`;
    }

    return path;
};
