import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path: string | null | undefined) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    
    // Get API URL and strip /api if present to get root domain
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    return `${baseUrl}/${cleanPath}`;
}
