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
