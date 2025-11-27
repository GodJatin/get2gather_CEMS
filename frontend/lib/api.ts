import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const initiateStudentSignup = async (data: { name: string; contact: string; email: string }) => {
    return api.post('/auth/student/initiate', data);
};

export const verifyStudentOtp = async (data: { email: string; otp: string }) => {
    return api.post('/auth/student/verify', data);
};

export const completeStudentSignup = async (data: { email: string; department: string; password: string }) => {
    return api.post('/auth/student/complete', data);
};

export const initiateOrganizerSignup = async (data: { email: string; organization_name: string; contact: string; invite_code: string }) => {
    return api.post('/auth/organizer/initiate', data);
};

export const verifyOrganizerOtp = async (data: { email: string; otp: string }) => {
    return api.post('/auth/organizer/verify', data);
};

export const completeOrganizerSignup = async (data: { email: string; password: string }) => {
    return api.post('/auth/organizer/complete', data);
};

export default api;
