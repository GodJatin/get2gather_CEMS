export interface Comment {
    id: number;
    user_name: string;
    content: string;
    created_at: string;
    parent_id?: number | null;
    replies?: Comment[];
    replyToName?: string;
}

export interface Post {
    id: number;
    content: string;
    user_id: number;
    user_name: string;
    created_at: string;
    media_urls: string[];
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    comments: Comment[];
    media_type?: string;
    event_id?: number;
    location?: string;
    feeling?: string;
    tagged_users?: { id: number, name: string }[];
    tagged_events?: { id: number, name: string }[];
}
