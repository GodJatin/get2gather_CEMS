'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { initiateStudentSignup, verifyStudentOtp, completeStudentSignup } from '@/lib/api';

export default function StudentRegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        countryCode: '+91',
        contact: '',
        email: '',
        department: '',
        enrollment: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const countryCodes = [
        { code: '+91', country: 'IN', flag: '🇮🇳', len: 10 },
        { code: '+1', country: 'US', flag: '🇺🇸', len: 10 },
        { code: '+44', country: 'UK', flag: '🇬🇧', len: 10 }, // Assuming 10 for simplicity or adjust as needed
        { code: '+971', country: 'UAE', flag: '🇦🇪', len: 9 },
        { code: '+234', country: 'NG', flag: '🇳🇬', len: 10 }, // Adjust if needed
        { code: '+250', country: 'RW', flag: '🇷🇼', len: 9 },
        { code: '+260', country: 'ZM', flag: '🇿🇲', len: 9 },
        { code: '+263', country: 'ZW', flag: '🇿🇼', len: 9 }, // Adjust if needed
    ];

    const departments = ['PICA', 'PIET', 'PIAS'];

    // Clear errors when step changes
    useEffect(() => {
        setErrors({});
    }, [step]);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';

        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
        const requiredLen = selectedCountry?.len || 10;

        if (!formData.contact) {
            newErrors.contact = 'Contact number is required';
        } else if (formData.contact.length !== requiredLen) {
            newErrors.contact = `Contact number must be exactly ${requiredLen} digits`;
        }

        const emailRegex = /^\d{13}@paruluniversity\.ac\.in$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email must be 13 digits followed by @paruluniversity.ac.in';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.department) newErrors.department = 'Please select a department';

        if (formData.enrollment !== formData.email.split('@')[0]) {
            newErrors.enrollment = 'Enrollment number must match the digits in your email ID';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.password || formData.password.length === 0) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword || formData.confirmPassword.length === 0) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (step === 1 && validateStep1()) {
            setLoading(true);
            try {
                // Initiate student signup and send OTP
                await initiateStudentSignup({
                    name: formData.name,
                    contact: formData.contact,
                    email: formData.email
                });

                // Auto-fill enrollment from email
                const emailParts = formData.email.split('@');
                if (emailParts.length > 0 && /^\d+$/.test(emailParts[0])) {
                    setFormData(prev => ({ ...prev, enrollment: emailParts[0] }));
                }

                setStep(2); // Go to OTP step
            } catch (error: any) {
                console.error("Signup initiation failed", error);
                const errorMsg = error.response?.data?.detail || "Failed to send OTP. Please try again.";
                alert(errorMsg);
            } finally {
                setLoading(false);
            }
        }
        if (step === 2) {
            // Verify OTP
            if (!formData.otp || formData.otp.length !== 6) {
                setErrors({ otp: 'Please enter a valid 6-digit OTP' });
                return;
            }
            setLoading(true);
            try {
                await verifyStudentOtp({
                    email: formData.email,
                    otp: formData.otp
                });
                setStep(3); // Go to department step
            } catch (error: any) {
                console.error("OTP verification failed", error);
                const errorMsg = error.response?.data?.detail || "Invalid OTP. Please try again.";
                setErrors({ otp: errorMsg });
            } finally {
                setLoading(false);
            }
        }
        if (step === 3 && validateStep2()) setStep(4);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only process submission on step 4
        if (step !== 4) {
            return;
        }

        if (!validateStep3()) {
            return;
        }

        setLoading(true);
        try {
            const response = await completeStudentSignup({
                email: formData.email,
                department: formData.department,
                password: formData.password
            });

            // Store token
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }

            alert('Registration successful! Redirecting to dashboard...');
            window.location.href = '/student/dashboard';
        } catch (error: any) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Registration failed. Please try again.';
            alert(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
            <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 group hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    🎓
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                    Get2Gather
                </span>
            </Link>
            <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-neutral-800 w-full">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                <div className="text-center mb-8 mt-4">
                    <h1 className="text-3xl font-bold text-white mb-2">Student Registration</h1>
                    <p className="text-neutral-400 text-sm">Step {step} of 4</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Contact Number</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.countryCode}
                                            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                            className="px-3 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none appearance-none min-w-[100px]"
                                        >
                                            {countryCodes.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.flag} {country.code}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            value={formData.contact}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
                                                const maxLen = selectedCountry?.len || 15;
                                                if (val.length <= maxLen) {
                                                    setFormData({ ...formData, contact: val });
                                                }
                                            }}
                                            className="flex-1 px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="9876543210"
                                            disabled={!formData.countryCode}
                                        />
                                    </div>
                                    {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">College Email ID</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                        placeholder="1234567890123@paruluniversity.ac.in"
                                        maxLength={35}
                                    />
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Verify Your Email</h3>
                                    <p className="text-neutral-400 text-sm">We've sent a 6-digit code to<br /><span className="text-blue-400 font-medium">{formData.email}</span></p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={formData.otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 6) {
                                                setFormData({ ...formData, otp: val });
                                                setErrors({});
                                            }
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white text-center text-2xl tracking-widest focus:border-blue-500/50 focus:outline-none"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                    {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp}</p>}
                                </div>

                                <p className="text-neutral-500 text-xs text-center">Didn't receive the code? Check your spam folder</p>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Enrollment Number</label>
                                    <input
                                        type="text"
                                        value={formData.enrollment}
                                        readOnly
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-800/30 border border-white/5 text-neutral-400 cursor-not-allowed focus:outline-none"
                                        placeholder="1234567890123"
                                    />
                                    {errors.enrollment && <p className="text-red-400 text-xs mt-1">{errors.enrollment}</p>}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-3.5 text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-3.5 text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 mt-8 flex-col sm:flex-row">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="w-full sm:flex-1 py-3.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                            >
                                Back
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="w-full sm:flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Checking...' : 'Next'}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:flex-1 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-green-900/20 transition-all"
                            >
                                {loading ? 'Registering...' : 'Complete Registration'}
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:underline">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
