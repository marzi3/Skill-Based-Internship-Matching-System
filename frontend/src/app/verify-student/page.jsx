'use client';
import { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, Clock, AlertTriangle, User, FileText } from 'lucide-react';

export default function VerifyStudent() {
    const { user, loading } = useAuth();
    const [studentId, setStudentId] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (user.role !== 'student') router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !studentId) return alert('Please fill all fields');

        const formData = new FormData();
        formData.append('studentId', studentId);
        formData.append('studentIdImage', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/verification/student', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen text-indigo-600">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 pointer-events-none -z-10"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/40"
            >
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-inner">
                        <User size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Student Verification</h2>
                    <p className="mt-2 text-gray-500">Verify your university status to unlock internships.</p>
                </div>

                {user?.verificationStatus === 'approved' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-4 py-8 bg-green-50 rounded-2xl border border-green-100">
                        <CheckCircle size={64} className="text-green-500" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-green-700">Verified & Approved!</h3>
                            <p className="text-green-600">You have full access to student features.</p>
                        </div>
                        <button onClick={() => router.push('/dashboard')} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Go to Dashboard</button>
                    </motion.div>
                ) : user?.verificationStatus === 'pending' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-4 py-8 bg-amber-50 rounded-2xl border border-amber-100">
                        <Clock size={64} className="text-amber-500 animate-pulse" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-amber-700">Verification Pending</h3>
                            <p className="text-amber-600">Our team is reviewing your documents.</p>
                        </div>
                        <p className="text-xs text-amber-500 max-w-xs text-center">This usually takes 24-48 hours. You will be notified once approved.</p>
                    </motion.div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Student ID Number</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    placeholder="e.g. IT24103763"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Upload ID Card (Image/PDF)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all bg-white/50 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-400">JPG, PNG or PDF (MAX. 5MB)</p>
                                </div>
                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                            </label>
                            {file && (
                                <div className="text-xs text-indigo-600 flex items-center mt-2 bg-indigo-50 p-2 rounded-lg">
                                    <FileText size={14} className="mr-1" /> {file.name}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Submit for Verification'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
