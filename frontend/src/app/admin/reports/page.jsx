'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Download, FileText, FileSpreadsheet, BarChart2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

export default function ReportsAnalytics() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fake filtering states for UI
    const [dateRange, setDateRange] = useState('all');
    const [department, setDepartment] = useState('all');

    const fetchExportData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('/admin/reports/export', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        if (reportData.length === 0) return alert('No data to export');

        const csv = Papa.unparse(reportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `InternX_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportPDF = () => {
        if (reportData.length === 0) return alert('No data to export');

        const doc = new jsPDF();
        doc.text('InternX Applications & Placements Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const tableColumn = ["Applicant", "Position", "Company", "Domain", "Status", "Date"];
        const tableRows = [];

        reportData.forEach(app => {
            const appData = [
                app.ApplicantName,
                app.Position,
                app.Company,
                app.Domain,
                app.Status,
                app.AppliedDate
            ];
            tableRows.push(appData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [99, 102, 241] } // Indigo 500
        });

        doc.save(`InternX_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="w-full h-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Reports & Analytics</h1>
                    <p className="text-gray-500 mt-1">Generate, filter and export platform performance data</p>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 rounded-2xl mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart2 className="text-indigo-600" /> Report Configuration
                </h2>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">All Time</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Department / Domain</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">All Departments</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchExportData}
                            className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Generate Preview
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Export Report</h3>
                        <p className="text-sm text-gray-500">Download the generated report in your preferred format</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportCSV}
                            disabled={loading || reportData.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                            <FileSpreadsheet size={18} /> Export CSV
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={loading || reportData.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <FileText size={18} /> Export PDF
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Data Preview Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Data Preview <span className="text-sm font-normal text-gray-400">({reportData.length} records)</span>
                </h2>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Position</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading data...</td></tr>
                            ) : reportData.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No data available for the selected filters.</td></tr>
                            ) : (
                                reportData.slice(0, 10).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">{row.ApplicantName}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{row.Position}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700">{row.Company}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${row.Status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                                    row.Status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {row.Status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500">{row.AppliedDate}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {reportData.length > 10 && (
                        <div className="p-3 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                            Showing first 10 rows. Export to see all {reportData.length} records.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
