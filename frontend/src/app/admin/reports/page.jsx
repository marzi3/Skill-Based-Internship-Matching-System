'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import { Download, FileText, FileSpreadsheet, BarChart2, ShieldCheck, Zap, Lock, Search, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsAnalytics() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtering states
    const [dateRange, setDateRange] = useState('all');
    const [department, setDepartment] = useState('all');

    const fetchExportData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/reports/export');
            setReportData(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExportData();
    }, []);

    const exportCSV = () => {
        if (reportData.length === 0) return;
        const csv = Papa.unparse(reportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `InternX_Intelligence_Segment_${new Date().getTime()}.csv`;
        link.click();
    };

    const exportPDF = () => {
        if (reportData.length === 0) return;
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text('InternX Platforms: Data Intelligence Report', 14, 15);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Security Protocol: SHA-256 | Segment: ${new Date().toLocaleString()}`, 14, 22);

        const tableColumn = ["Applicant", "Position", "Company", "Domain", "Status", "Date"];
        const tableRows = reportData.map(app => [
            app.ApplicantName,
            app.Position,
            app.Company,
            app.Domain,
            app.Status,
            app.AppliedDate
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        doc.save(`InternX_Intelligence_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="p-8 space-y-10 max-w-[1400px] mx-auto min-h-screen">
            <header>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                            <Lock className="text-white w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Module: Data Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Intelligence <span className="text-indigo-600">Segments</span></h1>
                    <p className="text-gray-500 font-medium">Global extraction of platform performance and heuristic conversion metrics</p>
                </motion.div>
            </header>

            {/* Filter Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="text-amber-500" /> Temporal Scope
                        </label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full p-4 bg-white/60 border border-white/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-gray-700 transition-all cursor-pointer hover:bg-white"
                        >
                            <option value="all">All Historical Data</option>
                            <option value="this_week">Current Week Cycle</option>
                            <option value="this_month">Current Month Cycle</option>
                            <option value="this_year">Current Annual Cycle</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Search size={12} className="text-indigo-500" /> Domain Filter
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full p-4 bg-white/60 border border-white/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-gray-700 transition-all cursor-pointer hover:bg-white"
                        >
                            <option value="all">Universal Domains</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Design">UI/UX Design</option>
                            <option value="Marketing">Growth Marketing</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={exportCSV}
                            disabled={loading || reportData.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 group"
                        >
                            <FileSpreadsheet size={16} className="group-hover:rotate-12 transition-transform" /> CSV
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={loading || reportData.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 group"
                        >
                            <FileText size={16} className="group-hover:-rotate-12 transition-transform" /> PDF
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">A</div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Access Only</p>
                    </div>
                    <div className="text-[10px] font-black text-indigo-600 flex items-center gap-2">
                        <ShieldCheck size={14} /> SYSTEM BROADCAST SECURE
                    </div>
                </div>
            </motion.div>

            {/* Data Preview Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }} 
                className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-xl overflow-hidden"
            >
                <div className="p-8 border-b border-white/50 flex justify-between items-center bg-white/20">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                         Transmission Preview <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-full">{reportData.length} SECURE RECORDS</span>
                    </h2>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Live Signal Feed</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol ID: Applicant</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vector: Position</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity: Company</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decrypting Segments...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold">
                                            Zero intelligence signals detected in current temporal scope.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.slice(0, 15).map((row, idx) => (
                                        <motion.tr 
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-white/60 transition-all duration-300"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                                                        {row.ApplicantName?.[0] || 'U'}
                                                    </div>
                                                    <span className="font-black text-sm text-gray-900">{row.ApplicantName || 'Unknown User'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-gray-600">{row.Position}</td>
                                            <td className="px-8 py-5 text-[10px] font-black text-indigo-600/60 uppercase tracking-wider">{row.Company}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-xl border transition-all duration-500
                                                    ${row.Status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white' :
                                                      row.Status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-500 group-hover:text-white' :
                                                      'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-500 group-hover:text-white'}`}>
                                                    {row.Status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-[10px] font-black text-gray-300 tracking-widest">{row.AppliedDate}</td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {!loading && reportData.length > 15 && (
                        <div className="p-4 text-center bg-gray-50/10 backdrop-blur-md">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Sector Baseline Reached</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
