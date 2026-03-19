'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, Briefcase, Eye, EyeOff, Check, X } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const [role, setRole] = useState('student'); // student or employer
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        number: false,
        special: false
    });

    const validatePassword = (pass) => {
        setPasswordValidation({
            length: pass.length >= 8,
            number: /\d/.test(pass),
            special: /[!@#$%^&*]/.test(pass)
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.name.trim().length < 2 || formData.name.length > 100) {
            setError('Name must be between 2 and 100 characters');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!passwordValidation.length || !passwordValidation.number || !passwordValidation.special) {
            setError('Password does not meet security requirements');
            return;
        }

        setIsLoading(true);
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role
        });

        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50"
            >
                {/* Left Side - Visuals */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <img src="/images/logo.png" alt="InternMatch Logo" className="h-16 w-auto object-contain mb-4 drop-shadow-md bg-white/20 p-2 rounded-xl backdrop-blur-sm" />
                        <h1 className="text-3xl font-bold mb-2">Join InternMatch</h1>
                        <p className="text-indigo-100">Start your journey today.</p>
                    </div>

                    <div className="relative z-10 my-12 space-y-6">
                        <div className={`p-4 rounded-xl border transition-all cursor-pointer ${role === 'student' ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`} onClick={() => setRole('student')}>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-lg"><User size={20} /></div>
                                <h3 className="font-semibold text-lg">I'm a Student</h3>
                            </div>
                            <p className="text-xs text-indigo-100">Looking for internships and skill verification.</p>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all cursor-pointer ${role === 'employer' ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`} onClick={() => setRole('employer')}>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-lg"><Briefcase size={20} /></div>
                                <h3 className="font-semibold text-lg">I'm an Employer</h3>
                            </div>
                            <p className="text-xs text-indigo-100">Hiring talent and posting internships.</p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-indigo-200">
                            By signing up, you agree to our <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link> & <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-7/12 p-10 md:p-14">
                    <div className="flex justify-end mb-6">
                        <span className="text-sm text-gray-500">Already have an account? <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link></span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Create your account</h2>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center mb-6 border border-red-100">
                            <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white" placeholder="John Doe" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white" placeholder="you@example.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {/* Password Strength Indicators */}
                                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                                    <div className={`flex items-center text-[10px] ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordValidation.length ? <Check size={10} className="mr-1" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300 mr-1"></div>}
                                        8+ chars
                                    </div>
                                    <div className={`flex items-center text-[10px] ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordValidation.number ? <Check size={10} className="mr-1" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300 mr-1"></div>}
                                        Number
                                    </div>
                                    <div className={`flex items-center text-[10px] ${passwordValidation.special ? 'text-green-600' : 'text-gray-400'}`}>
                                        {passwordValidation.special ? <Check size={10} className="mr-1" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300 mr-1"></div>}
                                        Special (!@#$)
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex justify-center items-center mt-4">
                            {isLoading ? 'Creating Account...' : <>Create Account <ArrowRight size={18} className="ml-2" /></>}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or register with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <a href={`${API_URL}/api/v1/auth/google`} className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.027-3.24 2.053-2.133 2.64-5.227 2.64-7.84 0-.787-.067-1.547-.2-2.293h-10.467z" fill="currentColor" /></svg> Google
                        </a>
                        <a href={`${API_URL}/api/v1/auth/linkedin`} className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                            <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> LinkedIn
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
