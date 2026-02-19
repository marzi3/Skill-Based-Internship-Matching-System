'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, Clock, Building, Briefcase, Globe, FileCheck } from 'lucide-react';

export default function VerifyEmployer() {
    const { user, loading } = useAuth();
    const [formData, setFormData] = useState({ companyName: '', businessRegistrationNumber: '', website: '' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (user.role !== 'employer') router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !formData.companyName) return alert('Please fill all fields');

        setUploading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('businessDocument', file);

        try {
            await axios.post('/api/verification/employer', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-green-50 to-teal-50 pointer-events-none -z-10"></div>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/40"
            >
                <div className="text-center mb-10">
                    <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600 shadow-inner">
                        <Building size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Business Verification</h2>
                    <p className="mt-2 text-gray-500">Enable advanced hiring tools by verifying your company.</p>
                </div>

                {user?.verificationStatus === 'approved' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-4 py-12 bg-green-50 rounded-2xl border border-green-100">
                        <CheckCircle size={80} className="text-green-500" />
                        <h3 className="text-2xl font-bold text-green-700">Business Certified!</h3>
                        <p className="text-green-600 max-w-sm text-center">You can now post unlimited internships and access our premium talent pool.</p>
                        <button onClick={() => router.push('/dashboard')} className="mt-6 px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">Go to Dashboard</button>
                    </motion.div>
                ) : user?.verificationStatus === 'pending' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-4 py-12 bg-amber-50 rounded-2xl border border-amber-100">
                        <Clock size={80} className="text-amber-500 animate-pulse" />
                        <h3 className="text-2xl font-bold text-amber-700">Under Review</h3>
                        <p className="text-amber-600 max-w-sm text-center">Our compliance team is reviewing your business details. Expect an update within 24 hours.</p>
                    </motion.div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Company Name</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input name="companyName" type="text" required onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm" placeholder="Acme Corp" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Registration Number</label>
                                <div className="relative">
                                    <FileCheck className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input name="businessRegistrationNumber" type="text" required onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm" placeholder="BR-123456" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Company Website</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input name="website" type="url" onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm" placeholder="https://acme.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Upload Business Document (PDF)</label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all bg-white/50 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-green-500 transition-colors" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Upload Certificate</span> or drag and drop</p>
                                    <p className="text-xs text-gray-400">PDF Only (MAX. 5MB)</p>
                                </div>
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                            </label>
                            {file && (
                                <div className="flex items-center mt-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                    <FileCheck size={16} className="mr-2 text-green-600" /> <span className="text-sm text-green-800 font-medium">{file.name}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 mt-4"
                        >
                            {uploading ? 'Verifying...' : 'Submit Business Verification'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
