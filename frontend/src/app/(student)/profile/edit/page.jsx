'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  Code, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Zap, 
  Target, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Pencil, 
  Trash2,
  Calendar,
  Building
} from 'lucide-react';
import Link from 'next/link';
import axios from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

import ProfileEditForm from '@/components/student/ProfileEditForm';
import EducationForm from '@/components/student/EducationForm';
import SkillManager from '@/components/student/SkillManager';
import ProfileCompletenessBar from '@/components/student/ProfileCompletenessBar';

const StudentProfileEditPage = () => {
  const router = useRouter();
  const { user, checkUserLoggedIn } = useAuth();
  
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Education Editor State
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [educationToEdit, setEducationToEdit] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/student/profile');
        if (response.data.success) {
          setStudentData(response.data.student);
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
        setStatus({ type: 'error', message: 'Could not synchronize profile data. Please verify your connection.' });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const handleUpdatePersonalInfo = async (data) => {
    try {
      setSubmitting(true);
      const response = await axios.put('/student/personal-info', data);
      if (response.data.success) {
        setStudentData(response.data.student);
        setStatus({ type: 'success', message: 'Personal architecture updated successfully.' });
        if (checkUserLoggedIn) checkUserLoggedIn();
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const handleEducationSubmit = async (data) => {
    try {
      setSubmitting(true);
      const url = educationToEdit ? `/student/education/${educationToEdit._id}` : '/student/education';
      const method = educationToEdit ? 'put' : 'post';
      
      const response = await axios[method](url, data);
      if (response.data.success) {
        setStudentData(response.data.student);
        setIsEditingEducation(false);
        setEducationToEdit(null);
        setStatus({ type: 'success', message: `Education sequence ${educationToEdit ? 'updated' : 'deployed'} successfully.` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Education sync failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const handleRemoveEducation = async (eduId) => {
    if (!confirm('Are you sure you want to decommission this education entry?')) return;
    try {
      setSubmitting(true);
      const response = await axios.delete(`/student/education/${eduId}`);
      if (response.data.success) {
        setStudentData(response.data.student);
        setStatus({ type: 'success', message: 'Education entry removed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Removal failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const handleAddSkill = async (skill) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/student/skills', skill);
      if (response.data.success) {
        setStudentData(response.data.student);
        setStatus({ type: 'success', message: 'Skill DNA updated successfully.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Skill deployment failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const handleRemoveSkill = async (name) => {
    try {
      const response = await axios.delete(`/student/skills/${encodeURIComponent(name)}`);
      if (response.data.success) {
        setStudentData(response.data.student);
        setStatus({ type: 'success', message: 'Skill removed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Skill removal failed.' });
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const tabs = [
    { id: 'personal', title: 'Personal Info', icon: User, color: 'text-emerald-500' },
    { id: 'education', title: 'Education', icon: GraduationCap, color: 'text-sky-500' },
    { id: 'skills', title: 'Technical DNA', icon: Code, color: 'text-indigo-500' },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Student Data Sequence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-4">
            <Link href="/student-dashboard" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Intelligence Core
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                Profile Configuration <ShieldCheck className="text-indigo-600" size={32} />
              </h1>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest italic opacity-70">Updating protocol: {user?.name || 'Authorized User'}</p>
            </div>
          </div>
          
          <div className="w-full md:w-[400px]">
            <ProfileCompletenessBar completion={studentData?.profileCompletion} />
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-[1.5rem] border-2 shadow-xl flex items-center gap-4 text-xs font-black uppercase tracking-widest ${
                status.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                {status.type === 'success' ? <CheckCircle2 size={24} /> : <Zap size={24} />}
              </div>
              <div>
                <p className="opacity-60 leading-none mb-1">{status.type === 'success' ? 'Protocol Synchronized' : 'Sync Error Block'}</p>
                <p>{status.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabbed Navigation */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-3xl transition-all font-black uppercase text-[10px] tracking-widest ${
                  active 
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-300' 
                    : 'bg-transparent text-gray-400 hover:text-gray-900'
                }`}
              >
                <Icon size={16} className={active ? 'text-white' : tab.color} />
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <header className="mb-10">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Identity Configuration</h2>
                  <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Global student parameters for the matching engine.</p>
                </header>
                <ProfileEditForm 
                  initialData={studentData} 
                  onSubmit={handleUpdatePersonalInfo} 
                  isLoading={submitting} 
                />
              </motion.div>
            )}

            {activeTab === 'education' && (
              <motion.div
                key="education"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                <header className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Academic Records</h2>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Verification data from educational institutions.</p>
                  </div>
                  {!isEditingEducation && (
                    <button
                      onClick={() => { setIsEditingEducation(true); setEducationToEdit(null); }}
                      className="flex items-center gap-3 bg-[#6366F1] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#4F46E5] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      <Plus size={18} strokeWidth={3} /> Inject Credential
                    </button>
                  )}
                </header>

                <AnimatePresence>
                  {isEditingEducation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <EducationForm 
                        entry={educationToEdit} 
                        onCancel={() => { setIsEditingEducation(false); setEducationToEdit(null); }} 
                        onSubmit={handleEducationSubmit}
                        isLoading={submitting}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Education List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {studentData?.education?.map((edu) => (
                    <div 
                      key={edu._id} 
                      className="group bg-slate-50/50 border border-gray-100 rounded-[2rem] p-8 hover:bg-white hover:border-sky-100 hover:shadow-xl hover:shadow-sky-600/5 transition-all relative"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-sky-100/50 text-sky-600 rounded-2xl flex items-center justify-center border border-sky-100/50">
                          <Building size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setEducationToEdit(edu); setIsEditingEducation(true); }}
                            className="p-2 text-slate-300 hover:text-sky-500 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleRemoveEducation(edu._id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-2 uppercase italic">{edu.institution}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#6366F1] bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 inline-block mb-4">
                        {edu.degree} — {edu.field}
                      </p>
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 opacity-50">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                            {new Date(edu.startDate).getFullYear()} — {edu.isCurrentlyStudying ? 'Active' : (edu.endDate ? new Date(edu.endDate).getFullYear() : 'N/A')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                          <Target size={14} className="text-gray-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{edu.degreeLevel?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!studentData?.education || studentData.education.length === 0) && !isEditingEducation && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
                      <GraduationCap size={48} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Academic Database empty.</p>
                      <p className="text-gray-300 text-[10px] font-bold mt-2">Initialize your credentials to unlock higher match scores.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SkillManager 
                  skills={studentData?.skills || []} 
                  onAdd={handleAddSkill} 
                  onRemove={handleRemoveSkill}
                  isLoading={submitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentProfileEditPage;
