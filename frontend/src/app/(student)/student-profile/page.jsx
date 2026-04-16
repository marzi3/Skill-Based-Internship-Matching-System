
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from '@/services/apiClient';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import ProfileView from '@/components/student/ProfileView';
import ProjectForm from '@/components/student/ProjectForm';
import Stepper from '@/components/student/Stepper';
import StudentProfileCompletionBar from '@/components/student/StudentProfileCompletionBar';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { X, User, GraduationCap, Code, Loader, Upload, Pencil, Plus, Trash2, Badge, Eye, ExternalLink, Download, CheckCircle, ArrowRight, FileText, LayoutDashboard, Home, Settings, Search, Briefcase, Zap, LogOut, MessageSquare, ChevronLeft, Menu, Link as LinkIcon, Sparkles, Award, AlertTriangle, CalendarDays, Save, Clock, Building2, Crop } from 'lucide-react';
import { FaGithub, FaLinkedin, FaLink, FaEnvelope, FaPhone, FaLocationDot, FaEarthAsia } from 'react-icons/fa6';
import { Maximize2, Minimize2 } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const imageBaseUrl = apiUrl.includes('/api/v1') ? apiUrl.replace('/api/v1', '') : apiUrl;

import universitiesData from '@/data/universities.json';
import schoolsData from '@/data/schools.json';
import skillsData from '@/data/skills.json';
import countriesData from '@/data/countries.json';
console.log('Resume Debug - API URL:', apiUrl);
console.log('Resume Debug - Image Base URL:', imageBaseUrl);

const DEFAULT_PHONE_CODE = countriesData.default.phoneCode;

const toLocalSriLankaPhone = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('94')) return digits.slice(2, 11);
  if (digits.startsWith('0')) return digits.slice(1, 10);
  return digits.slice(0, 9);
};

const validateSriLankaLocalPhone = (value = '') => {
  if (!value) return 'Phone number is required';
  if (value.startsWith('0')) return 'First digit cannot be 0';
  if (!/^\d{9}$/.test(value)) return 'Enter a valid 9-digit phone number';
  return '';
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const calculateAgeFromDateOfBirth = (dateValue) => {
  if (!dateValue) return '';
  const dob = new Date(dateValue);
  if (Number.isNaN(dob.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : '';
};

const emptyProjectForm = {
  title: '',
  description: '',
  technologies: '',
  repositoryUrl: '',
  liveUrl: '',
};

const MAX_PROJECT_SCREENSHOTS = 10;
const MAX_PROJECT_SCREENSHOT_SIZE = 5 * 1024 * 1024;

const parseTechnologies = (value = '') => {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toTechString = (techList) => {
  if (!Array.isArray(techList)) return '';
  return techList.join(', ');
};

const normalizeProjectLink = (value = '') => {
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export default function StudentProfile() {
  const { user, token, loading: authLoading, logout, checkUserLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [localToken, setLocalToken] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pdfFitToScreen, setPdfFitToScreen] = useState(true);

  // Initialize local token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setLocalToken(storedToken);
    }

    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));

    // Load profile
    loadStudentProfile();
  }, []);

  // Update email when user is loaded from auth context
  useEffect(() => {
    if (user?.email) {
      setPersonalInfo(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'education', 'skills', 'projects', 'documents'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    about: '',
    country: countriesData.default.name,
    location: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    gpa: '',
    portfolioUrl: '',
    preferredLocation: [],
    durationPreference: '',
    industriesOfInterest: [],
    previousInternshipsCount: 0,
    isPublic: true,
    github: '',
    linkedin: '',
    website: '',
    seniority: ['Student']
  });

  const [universitySuggestions, setUniversitySuggestions] = useState([]);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);

  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    degreeLevel: 'BACHELOR', // Default to Bachelor's
    durationMonths: '',
    startDate: '',
    endDate: ''
  });
  const [editingEducationId, setEditingEducationId] = useState(null);

  const [schools, setSchools] = useState([]);
  const [newSchool, setNewSchool] = useState('');
  const [editingSchoolId, setEditingSchoolId] = useState(null);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [projects, setProjects] = useState([]);
  const durationOptions = ['1 year', '1.5 years', '2 years', '3 years', '4 years', '5 years'];

  const parseDurationToMonths = (durationValue) => {
    const raw = String(durationValue || '').trim().toLowerCase();
    if (!raw) return null;

    const numberMatch = raw.match(/(\d+(?:\.\d+)?)/);
    if (!numberMatch) return null;

    const amount = Number(numberMatch[1]);
    if (Number.isNaN(amount) || amount <= 0) return null;

    // Accept only year-based input (e.g., "4 years", "1.5 year", "2 yr").
    if (raw.includes('year') || raw.includes('yr')) {
      return Math.round(amount * 12);
    }

    return null;
  };

  const formatMonthsAsDurationYears = (monthsValue) => {
    const months = Number(monthsValue);
    if (Number.isNaN(months) || months <= 0) return '';

    const years = months / 12;
    const roundedYears = Math.round(years * 10) / 10;
    return Number.isInteger(roundedYears)
      ? `${roundedYears} year${roundedYears === 1 ? '' : 's'}`
      : `${roundedYears} years`;
  };

  const calculateDurationFromDates = (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return '';

    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const normalizedMonths = monthDiff + (end.getDate() >= start.getDate() ? 0 : -1);
    return formatMonthsAsDurationYears(normalizedMonths);
  };

  // Logic to predict end date from start date + selected/typed duration
  const predictGraduationDate = (startDate, durationMonths) => {
    if (!startDate) return '';
    if (!durationMonths) return '';
    const date = new Date(startDate);
    const months = parseDurationToMonths(durationMonths);
    if (!months) return '';

    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'institution') {
      const country = personalInfo.country || 'Sri Lanka';
      const unis = universitiesData[country] || Object.values(universitiesData).flat();
      const filtered = unis.filter(u => 
        u.name.toLowerCase().includes(value.toLowerCase()) || 
        u.aliases?.some(a => a.toLowerCase().includes(value.toLowerCase()))
      ).slice(0, 5);
      setUniversitySuggestions(value ? filtered : []);
    }

    setNewEducation(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'endDate') {
        updated.durationMonths = calculateDurationFromDates(updated.startDate, updated.endDate);
      }
      if (name === 'startDate' || name === 'durationMonths' || name === 'degreeLevel') {
        updated.endDate = predictGraduationDate(updated.startDate, updated.durationMonths);
      }
      return updated;
    });
  };

  const handleDurationSelect = (selectedDuration) => {
    setNewEducation(prev => {
      const updated = { ...prev, durationMonths: selectedDuration };
      updated.endDate = predictGraduationDate(updated.startDate, updated.durationMonths);
      return updated;
    });
    setDurationDropdownOpen(false);
  };

  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    name: '',
    credentialUrl: '',
    issuedDate: ''
  });
  const [editingCertificationId, setEditingCertificationId] = useState(null);
  const [uploadedCertificateFiles, setUploadedCertificateFiles] = useState([]);
  const [certificateTitle, setCertificateTitle] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [isCertificateCropModalOpen, setIsCertificateCropModalOpen] = useState(false);
  const [certificateCropPreview, setCertificateCropPreview] = useState('');
  const [certificateCropZoom, setCertificateCropZoom] = useState(1);
  const [certificateCropOffsetX, setCertificateCropOffsetX] = useState(0);
  const [certificateCropOffsetY, setCertificateCropOffsetY] = useState(0);
  const [isCertificateCropDragging, setIsCertificateCropDragging] = useState(false);
  const [certificateCropDragStart, setCertificateCropDragStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [certificateCropOriginalFile, setCertificateCropOriginalFile] = useState(null);
  const [certificateCropFileName, setCertificateCropFileName] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const selectUniversity = (uni) => {
    setNewEducation(prev => ({ ...prev, institution: uni.name }));
    setUniversitySuggestions([]);
  };

  const selectSchool = (schoolItem) => {
    setNewSchool(schoolItem.name);
    setSchoolSuggestions([]);
  };

  const handleSchoolInputChange = (value) => {
    setNewSchool(value);
    const country = personalInfo.country || 'Sri Lanka';
    const availableSchools = schoolsData[country] || Object.values(schoolsData).flat();
    const filtered = availableSchools.filter((school) =>
      school.name.toLowerCase().includes(value.toLowerCase()) ||
      school.aliases?.some((alias) => alias.toLowerCase().includes(value.toLowerCase()))
    ).slice(0, 5);
    setSchoolSuggestions(value ? filtered : []);
  };

  const selectSkill = (skill) => {
    setNewSkill(skill);
    setSkillSuggestions([]);
  };

  const handleSkillInputChange = (value) => {
    setNewSkill(value);
    const filtered = skillsData.filter(s => 
      s.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    setSkillSuggestions(value ? filtered : []);
  };
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [showAllSchools, setShowAllSchools] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [errors, setErrors] = useState({});
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [projectExistingScreenshots, setProjectExistingScreenshots] = useState([]);
  const [projectRemovedScreenshotIds, setProjectRemovedScreenshotIds] = useState([]);
  const [projectNewScreenshotEntries, setProjectNewScreenshotEntries] = useState([]);
  const [projectMessage, setProjectMessage] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isProjectImageViewerOpen, setIsProjectImageViewerOpen] = useState(false);
  const [projectImageViewer, setProjectImageViewer] = useState({ src: '', title: '' });
  const [isProjectCropModalOpen, setIsProjectCropModalOpen] = useState(false);
  const [projectCropPreview, setProjectCropPreview] = useState('');
  const [projectCropFileName, setProjectCropFileName] = useState('');
  const [projectCropEntryId, setProjectCropEntryId] = useState('');
  const [projectCropZoom, setProjectCropZoom] = useState(1);
  const [projectCropOffsetX, setProjectCropOffsetX] = useState(0);
  const [projectCropOffsetY, setProjectCropOffsetY] = useState(0);
  const [isProjectCropDragging, setIsProjectCropDragging] = useState(false);
  const [projectCropDragStart, setProjectCropDragStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  // Stepper logic
  const steps = [
    {
      id: 'personal',
      name: 'Personal Details',
      icon: User,
      isCompleted: personalInfo.firstName && personalInfo.lastName && personalInfo.email && personalInfo.phone && personalInfo.dateOfBirth && personalInfo.address
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      isCompleted: education.length > 0
    },
    {
      id: 'skills',
      name: 'Skills',
      icon: Code,
      isCompleted: skills.length > 0
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: Briefcase,
      isCompleted: projects.length > 0
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      isCompleted: resumeFile || certifications.length > 0 || uploadedCertificateFiles.length > 0
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

  const setActiveStep = (stepId) => {
    setActiveTab(stepId);
  };
  const resumeInputRef = useRef(null);
  const certificateFileInputRef = useRef(null);
  const certificationFormRef = useRef(null);
  const educationFormRef = useRef(null);
  const schoolFormRef = useRef(null);
  const certificateCropFrameRef = useRef(null);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const cropContainerRef = useRef(null);
  const coverCropCanvasRef = useRef(null);
  const coverCropContainerRef = useRef(null);
  const projectCropCanvasRef = useRef(null);
  const projectCropContainerRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [storedProfileImage, setStoredProfileImage] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropZoom, setCropZoom] = useState(0.8);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropRotation, setCropRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [croppedImage, setCroppedImage] = useState(null);

  // Cover photo states
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [storedCoverImage, setStoredCoverImage] = useState(null);
  const [coverCropMode, setCoverCropMode] = useState(false);
  const [coverCropZoom, setCoverCropZoom] = useState(0.8);
  const [coverCropOffsetX, setCoverCropOffsetX] = useState(0);
  const [coverCropOffsetY, setCoverCropOffsetY] = useState(0);
  const [coverCropRotation, setCoverCropRotation] = useState(0);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState(false);
  const [isCoverImageModalOpen, setIsCoverImageModalOpen] = useState(false);

  // Load student profile
  const loadStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`students/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data;

      if (data && data.personalInfo) {
        // Handle both old format (firstName/lastName) and new format (fullName)
        let personalData = { ...data.personalInfo };

        // If we have firstName/lastName but no fullName, construct it
        if (!personalData.fullName && (personalData.firstName || personalData.lastName)) {
          personalData.fullName = `${personalData.firstName || ''} ${personalData.lastName || ''}`.trim();
        }

        setPersonalInfo({
          ...personalData,
          email: user?.email || personalData.email,
          country: countriesData.default.name,
          phone: toLocalSriLankaPhone(personalData.phone || ''),
          about: personalData.about || '',
          dateOfBirth: formatDateForInput(personalData.dateOfBirth),
          age: personalData.dateOfBirth ? calculateAgeFromDateOfBirth(personalData.dateOfBirth) : (personalData.age ?? ''),
          gpa: personalData.gpa || '',
          portfolioUrl: personalData.portfolioUrl || '',
          preferredLocation: Array.isArray(personalData.preferredLocation)
            ? personalData.preferredLocation
            : (personalData.preferredLocation ? [personalData.preferredLocation] : []),
          durationPreference: personalData.durationPreference || '',
          industriesOfInterest: personalData.industriesOfInterest || [],
          previousInternshipsCount: personalData.previousInternshipsCount || 0,
          isPublic: personalData.isPublic !== false,
          seniority: personalData.seniority || data.seniority || ['Student'],
          github: data.portfolio?.github || '',
          linkedin: data.portfolio?.linkedin || '',
          website: data.portfolio?.website || ''
        });
      }
      if (data.education) {
        setEducation(data.education);
      } else {
        setEducation([]);  // Ensure education is always an array
      }
      if (data.schools) {
        setSchools(data.schools);
      } else {
        setSchools([]);  // Ensure schools is always an array
      }
      if (data.skills) {
        setSkills(data.skills);
      } else {
        setSkills([]);  // Ensure skills is always an array
      }
      if (data.projects) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
      if (data.certifications) {
        setCertifications(data.certifications);
      } else {
        setCertifications([]);  // Ensure certifications is always an array
      }
      if (data.uploadedCertificates) {
        setUploadedCertificateFiles(data.uploadedCertificates);
      } else {
        setUploadedCertificateFiles([]);
      }
      if (data.resume && data.resume.filePath) {
        setResumeFile(data.resume);
      } else {
        setResumeFile(null);
      }
      if (data.profileImage && data.profileImage.filePath) {
        const url = data.profileImage.filePath;
        const fullImageUrl = url.startsWith('http') ? url : `${imageBaseUrl}/${url}`;
        setStoredProfileImage(fullImageUrl);
      }
      if (data.coverImage && data.coverImage.filePath) {
        const url = data.coverImage.filePath;
        const fullCoverUrl = url.startsWith('http') ? url : `${imageBaseUrl}/${url}`;
        setStoredCoverImage(fullCoverUrl);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to get token from all possible sources
  const getAuthToken = () => {
    let authToken = token || localToken;

    if (!authToken && typeof window !== 'undefined') {
      authToken = localStorage.getItem('token');
    }

    return authToken;
  };

  // Helper function to format degree level for display
  const formatDegreeLevel = (level) => {
    const levelMap = {
      'HIGH_SCHOOL': 'High School',
      'CERTIFICATE': 'Certificate',
      'ASSOCIATE': 'Associate\'s',
      'BACHELOR': 'Bachelor\'s',
      'MASTER': 'Master\'s',
      'DOCTORATE': 'Doctorate/PhD'
    };
    return levelMap[level] || level;
  };

  const normalizeProfileLink = (link = '') => {
    const trimmed = String(link).trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };



  // Handler for industries of interest (multi-select)
  const handleIndustryChange = (industry, checked) => {
    setPersonalInfo(prev => ({
      ...prev,
      industriesOfInterest: checked
        ? [...prev.industriesOfInterest, industry]
        : prev.industriesOfInterest.filter(item => item !== industry)
    }));
  };

  const startEditingCertification = (cert) => {
    setNewCertification({
      name: cert.name || '',
      credentialUrl: cert.credentialUrl || '',
      issuedDate: formatDateForInput(cert.issuedDate),
    });
    setEditingCertificationId(cert._id);
    setErrors({});
    setMessage('');
    
    // Auto-scroll to certification form
    setTimeout(() => {
      if (certificationFormRef.current) {
        certificationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const cancelEditingCertification = () => {
    setEditingCertificationId(null);
    setNewCertification({ name: '', credentialUrl: '', issuedDate: '' });
    setErrors({});
    setMessage('');
  };

  // Handler for certifications
  const handleSaveCertification = async () => {
    const certErrors = {};
    if (!newCertification.name) certErrors.name = 'Certification name is required';
    if (!newCertification.credentialUrl) certErrors.credentialUrl = 'Link is required';
    if (!newCertification.issuedDate) certErrors.issuedDate = 'Issue date is required';

    if (Object.keys(certErrors).length > 0) {
      setErrors(certErrors);
      setMessage('Error: Please fill in all required fields');
      return;
    }

    // Validate date is not in future
    if (newCertification.issuedDate && new Date(newCertification.issuedDate) > new Date()) {
      setErrors({ issuedDate: 'Date cannot be in the future' });
      setMessage('Error: Issued date cannot be in the future');
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const isEditing = Boolean(editingCertificationId);
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios[isEditing ? 'put' : 'post'](
        isEditing
          ? `students/profile/certification/${editingCertificationId}`
          : `students/profile/certification`,
        newCertification,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setCertifications(response.data.data.certifications);
      setEditingCertificationId(null);
      setNewCertification({ name: '', credentialUrl: '', issuedDate: '' });
      setMessage(isEditing ? 'Certification updated successfully' : 'Certification added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || (editingCertificationId ? 'Failed to update certification' : 'Failed to add certification');
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const closeCertificateCropModal = (resetFileSelection = false) => {
    setIsCertificateCropModalOpen(false);
    setCertificateCropPreview('');
    setCertificateCropZoom(1);
    setCertificateCropOffsetX(0);
    setCertificateCropOffsetY(0);
    setIsCertificateCropDragging(false);
    setCertificateCropDragStart({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
    setCertificateCropOriginalFile(null);
    setCertificateCropFileName('');

    if (resetFileSelection) {
      setCertificateFile(null);
      if (certificateFileInputRef.current) {
        certificateFileInputRef.current.value = '';
      }
    }
  };

  const handleCertificateFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) {
      setCertificateFile(null);
      return;
    }

    if (!selected.type?.startsWith('image/')) {
      setCertificateFile(selected);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCertificateCropPreview(String(reader.result || ''));
      setCertificateCropOriginalFile(selected);
      setCertificateCropFileName(selected.name || 'certificate-image');
      setCertificateCropZoom(1);
      setCertificateCropOffsetX(0);
      setCertificateCropOffsetY(0);
      setIsCertificateCropModalOpen(true);
    };
    reader.readAsDataURL(selected);
  };

  const startCertificateCropDrag = (clientX, clientY) => {
    setIsCertificateCropDragging(true);
    setCertificateCropDragStart({
      x: clientX,
      y: clientY,
      offsetX: certificateCropOffsetX,
      offsetY: certificateCropOffsetY,
    });
  };

  const moveCertificateCropDrag = (clientX, clientY) => {
    if (!isCertificateCropDragging) return;

    const deltaX = clientX - certificateCropDragStart.x;
    const deltaY = clientY - certificateCropDragStart.y;
    setCertificateCropOffsetX(certificateCropDragStart.offsetX + deltaX);
    setCertificateCropOffsetY(certificateCropDragStart.offsetY + deltaY);
  };

  const stopCertificateCropDrag = () => {
    setIsCertificateCropDragging(false);
  };

  const handleCertificateCropMouseDown = (event) => {
    event.preventDefault();
    startCertificateCropDrag(event.clientX, event.clientY);
  };

  const handleCertificateCropMouseMove = (event) => {
    moveCertificateCropDrag(event.clientX, event.clientY);
  };

  const handleCertificateCropTouchStart = (event) => {
    if (!event.touches?.length) return;
    const touch = event.touches[0];
    startCertificateCropDrag(touch.clientX, touch.clientY);
  };

  const handleCertificateCropTouchMove = (event) => {
    if (!event.touches?.length) return;
    const touch = event.touches[0];
    moveCertificateCropDrag(touch.clientX, touch.clientY);
  };

  const useOriginalCertificateImage = () => {
    if (certificateCropOriginalFile) {
      setCertificateFile(certificateCropOriginalFile);
      setMessage('Original image selected.');
      setTimeout(() => setMessage(''), 2000);
    }
    closeCertificateCropModal(false);
  };

  const applyCertificateCrop = async () => {
    if (!certificateCropPreview) return;

    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = certificateCropPreview;
      });

      const outputWidth = 1000;
      const outputHeight = 700;
      const frameRect = certificateCropFrameRef.current?.getBoundingClientRect();
      const frameWidth = frameRect?.width || 360;
      const frameHeight = frameRect?.height || 252;
      const containScale = Math.min(outputWidth / img.width, outputHeight / img.height);
      const drawWidth = img.width * containScale * certificateCropZoom;
      const drawHeight = img.height * containScale * certificateCropZoom;
      const offsetScaleX = outputWidth / frameWidth;
      const offsetScaleY = outputHeight / frameHeight;
      const drawX = ((outputWidth - drawWidth) / 2) + (certificateCropOffsetX * offsetScaleX);
      const drawY = ((outputHeight - drawHeight) / 2) + (certificateCropOffsetY * offsetScaleY);

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to initialize canvas');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      ctx.drawImage(
        img,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.92);
      });

      if (!blob) throw new Error('Failed to create cropped image');

      const baseName = (certificateCropFileName || 'certificate-image').replace(/\.[^/.]+$/, '');
      const croppedFile = new File([blob], `${baseName}-cropped.jpg`, { type: 'image/jpeg' });

      setCertificateFile(croppedFile);
      setMessage('Cropped image ready to upload.');
      setTimeout(() => setMessage(''), 2000);
      closeCertificateCropModal(false);
    } catch (error) {
      setMessage('Error: Could not crop image. Please try again.');
    }
  };

  // Separate certificate file upload (Cloudinary-backed)
  const handleCertificateFileUpload = async () => {
    if (!certificateFile) {
      setMessage('Please choose a certificate file first');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(certificateFile.type)) {
      setMessage('Please upload a valid certificate file (PDF, JPG, PNG, GIF, WEBP)');
      return;
    }

    if (certificateFile.size > 5 * 1024 * 1024) {
      setMessage('Certificate file must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('certificateFile', certificateFile);
      formData.append('title', certificateTitle || '');

      const response = await axios.post(
        `students/profile/certificate-file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );

      setUploadedCertificateFiles(response.data.data.uploadedCertificates || []);
      setCertificateTitle('');
      setCertificateFile(null);
      if (certificateFileInputRef.current) {
        certificateFileInputRef.current.value = '';
      }
      setMessage('Certificate file uploaded successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload certificate file';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const removeUploadedCertificateFile = async (fileId) => {
    try {
      setLoading(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.delete(
        `students/profile/certificate-file/${fileId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setUploadedCertificateFiles(response.data.data.uploadedCertificates || []);
      setMessage('Uploaded certificate file removed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove uploaded certificate file';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadUploadedCertificateFile = async (fileUrl, fileName) => {
    try {
      // Fetch the file from Cloudinary with blob response
      const response = await fetch(fileUrl);
      if (!response.ok) {
        setMessage('Error: Failed to download file');
        return;
      }

      const blob = await response.blob();
      
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'certificate';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Error: Failed to download file');
    }
  };

  // Handler for resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file');
      return;
    }

    try {
      setLoading(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(
        `students/profile/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      setResumeFile(response.data.data.student.resume);
      setMessage('Resume uploaded successfully (+5 matching points)');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload resume';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Preview resume function
  const handleResumePreview = () => {
    if (resumeFile && resumeFile.filePath) {
      setShowResumePreview(true);
    }
  };

  // Download resume function
  const handleResumeDownload = async () => {
    if (!resumeFile || !resumeFile.filePath) return;

    try {
      const url = resumeFile.filePath;
      const fullResumeUrl = url.startsWith('http') ? url : `${imageBaseUrl}/${url}`;
      const response = await fetch(fullResumeUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch resume file');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resumeFile.fileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const url = resumeFile.filePath;
      const fullResumeUrl = url.startsWith('http') ? url : `${imageBaseUrl}/${url}`;
      window.open(fullResumeUrl, '_blank');
      setMessage('Download could not be forced in this browser. Opened file in a new tab instead.');
    }
  };

  const handleResumeDelete = async () => {
    if (!resumeFile) return;

    const confirmed = window.confirm('Are you sure you want to delete your resume?');
    if (!confirmed) return;

    try {
      setLoading(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      await axios.delete(`students/profile/resume`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setResumeFile(null);
      setShowResumePreview(false);
      setMessage('Resume deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete resume';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove certification function
  const removeCertification = async (certificationId) => {
    try {
      setLoading(true);
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.delete(
        `students/profile/certification/${certificationId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setCertifications(response.data.data.certifications);
      if (editingCertificationId === certificationId) {
        setEditingCertificationId(null);
        setNewCertification({ name: '', credentialUrl: '', issuedDate: '' });
      }
      setMessage('Certification removed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove certification';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion — max 100% without certifications
  const calculateProfileCompletion = () => {
    let score = 0;

    // Personal Info (35 points)
    if (personalInfo?.fullName) score += 5;
    if (personalInfo?.email) score += 5;
    if (personalInfo?.phone) score += 5;
    if (personalInfo?.gpa) score += 10; // CRITICAL for matching
    if (personalInfo?.preferredLocation) score += 5; // CRITICAL for matching
    if (personalInfo?.industriesOfInterest?.length > 0) score += 5; // CRITICAL

    // Education (20 points)
    if (education?.length > 0) score += 15;
    if (education?.some(edu => edu.degreeLevel)) score += 5;

    // Skills (20 points)
    if (skills?.length >= 3) score += 15;
    if (skills?.some(skill => skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT')) score += 5;

    // Projects (5 points)
    if (projects?.length > 0) score += 5;

    // Documents (20 points)
    if (resumeFile) score += 15;
    if (certifications?.length > 0) score += 5; // Bonus — capped to 100

    return Math.min(score, 100);
  };

  // Update profile completion when data changes
  useEffect(() => {
    const completion = calculateProfileCompletion();
    setProfileCompletion(completion);
  }, [personalInfo, education, skills, projects, certifications, resumeFile]);

  const handleResetProfile = async () => {
    if (!confirm('⚠️ This will DELETE ALL your profile data (personal info, education, skills, certifications). This cannot be undone. Are you sure?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.delete(
        `students/profile/reset`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      // Reset all state
      setPersonalInfo({
        fullName: '',
        designation: '',
        email: user?.email || '',
        phone: '',
        about: '',
        country: countriesData.default.name,
        location: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        gpa: '',
        portfolioUrl: '',
        preferredLocation: [],
        durationPreference: '',
         industriesOfInterest: [],
         previousInternshipsCount: 0,
         isPublic: true,
         seniority: ['Student']
       });
      setIsEditingAbout(false);
      setEducation([]);
      setSkills([]);
      setProjects([]);
      setCertifications([]);
      setUploadedCertificateFiles([]);
      setCertificateTitle('');
      setCertificateFile(null);
      setResumeFile(null);
      setProfileCompletion(0);

      setMessage('✅ Profile reset successfully! You can now enter fresh data.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset profile';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    // Basic validation for critical fields
    const personalErrors = {};
    if (!personalInfo.fullName) {
        personalErrors.fullName = 'Full Name is required';
    } else if (!/^[A-Za-z\s\-']+$/.test(personalInfo.fullName)) {
        personalErrors.fullName = 'Name can only contain letters, spaces, and hyphens';
    }
    if (!personalInfo.location || !String(personalInfo.location).trim()) {
      personalErrors.location = 'Location is required';
    }
    if (!personalInfo.preferredLocation || personalInfo.preferredLocation.length === 0) personalErrors.preferredLocation = 'Please select your work mode';
    
    if (personalInfo.gpa && (parseFloat(personalInfo.gpa) < 0 || parseFloat(personalInfo.gpa) > 4.0)) {
        personalErrors.gpa = 'GPA must be between 0.0 and 4.0';
    }

    if (!personalInfo.dateOfBirth) {
      personalErrors.dateOfBirth = 'Date of birth is required';
    }

    if (personalInfo.dateOfBirth) {
      const dob = new Date(personalInfo.dateOfBirth);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (Number.isNaN(dob.getTime())) {
        personalErrors.dateOfBirth = 'Please enter a valid date of birth';
      } else if (dob > today) {
        personalErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    const computedAge = personalInfo.dateOfBirth ? calculateAgeFromDateOfBirth(personalInfo.dateOfBirth) : '';
    if (computedAge !== '' && (computedAge < 0 || computedAge > 100)) {
      personalErrors.age = 'Age must be between 0 and 100';
    }

    const phoneError = validateSriLankaLocalPhone(personalInfo.phone);
    if (phoneError) {
      personalErrors.phone = phoneError;
    }

    if ((personalInfo.about || '').length > 200) {
      personalErrors.about = 'About cannot exceed 200 characters';
    }

    if (Object.keys(personalErrors).length > 0) {
      setErrors(personalErrors);
      setMessage('Error: Please fill in all required fields marked with *');
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage('');

      let authToken = token || localToken;

      if (!authToken && typeof window !== 'undefined') {
        authToken = localStorage.getItem('token');
      }

      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `students/profile/personal`,
        {
          ...personalInfo,
          age: computedAge === '' ? '' : computedAge,
          country: countriesData.default.name,
          phone: `${DEFAULT_PHONE_CODE}${personalInfo.phone}`,
          portfolio: {
            github: personalInfo.github,
            linkedin: personalInfo.linkedin,
            website: personalInfo.website
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('Personal information saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save personal information';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEducation = async () => {
    // Validate required fields including degreeLevel and startDate
    const eduErrors = {};
    if (!newEducation.institution) eduErrors.institution = 'Institution is required';
    if (!newEducation.degree) eduErrors.degree = 'Degree title is required';
    if (!newEducation.field) eduErrors.field = 'Field of study is required';
    if (!newEducation.degreeLevel) eduErrors.degreeLevel = 'Degree level is required';
    if (!newEducation.durationMonths) eduErrors.durationMonths = 'Duration is required';
    if (newEducation.durationMonths && !parseDurationToMonths(newEducation.durationMonths)) {
      eduErrors.durationMonths = 'Please type duration with years (e.g., 4 years)';
    }
    if (!newEducation.startDate) eduErrors.startDate = 'Start date is required';

    if (Object.keys(eduErrors).length > 0) {
      setErrors(eduErrors);
      setMessage('Error: Please fill in all required fields');
      return;
    }

    // Validate dates
    if (newEducation.startDate && isNaN(new Date(newEducation.startDate).getTime())) {
      setErrors({ startDate: 'Invalid date' });
      setMessage('Please enter a valid start date');
      return;
    }

    if (newEducation.endDate && isNaN(new Date(newEducation.endDate).getTime())) {
      setErrors({ endDate: 'Invalid date' });
      setMessage('Please enter a valid end date');
      return;
    }

    // Validate that end date is after start date
    if (newEducation.startDate && newEducation.endDate) {
      if (new Date(newEducation.endDate) < new Date(newEducation.startDate)) {
        setErrors({ endDate: 'End date must be after start date' });
        setMessage('Error: End date must be after the start date');
        return;
      }
    }

    // Validate no future dates for start date
    if (newEducation.startDate && new Date(newEducation.startDate) > new Date()) {
      setErrors({ startDate: 'Start date cannot be in the future' });
      setMessage('Error: Start date cannot be in the future');
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage('');

      const isEditing = Boolean(editingEducationId);

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const parsedDurationMonths = parseDurationToMonths(newEducation.durationMonths);
      const educationPayload = {
        ...newEducation,
        durationMonths: parsedDurationMonths ? String(parsedDurationMonths) : ''
      };

      const response = await axios[isEditing ? 'put' : 'post'](
        isEditing
          ? `students/profile/education/${editingEducationId}`
          : `students/profile/education`,
        educationPayload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setEducation(response.data.data.education);
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        degreeLevel: 'BACHELOR',
        durationMonths: '',
        startDate: '',
        endDate: ''
      });
      setEditingEducationId(null);
      setMessage(isEditing ? 'Education updated successfully' : 'Education added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || (editingEducationId ? 'Failed to update education' : 'Failed to save education');
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditingEducation = (edu) => {
    setNewEducation({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      degreeLevel: edu.degreeLevel || 'BACHELOR',
      durationMonths: formatMonthsAsDurationYears(edu.durationMonths) || '',
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''
    });
    setEditingEducationId(edu._id);
    setErrors({});
    setMessage('');

    setTimeout(() => {
      if (educationFormRef.current) {
        educationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const cancelEditingEducation = () => {
    setEditingEducationId(null);
    setNewEducation({
      institution: '',
      degree: '',
      field: '',
      degreeLevel: 'BACHELOR',
      durationMonths: '',
      startDate: '',
      endDate: ''
    });
    setErrors({});
    setMessage('');
  };

  // Add School function (separate entry)
  const handleAddSchool = async () => {
    if (!newSchool.trim()) {
      setMessage('Error: Please enter a school name');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const isEditing = Boolean(editingSchoolId);
      const schoolPayload = {
        school: newSchool.trim()
      };

      const response = await axios[isEditing ? 'put' : 'post'](
        isEditing ? `students/profile/school/${editingSchoolId}` : `students/profile/school`,
        schoolPayload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setEducation(response.data.data.education);
      if (response.data.data.schools) {
        setSchools(response.data.data.schools);
      }
      setNewSchool('');
      setSchoolSuggestions([]);
      setEditingSchoolId(null);
      setMessage(isEditing ? 'School updated successfully' : 'School added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || (editingSchoolId ? 'Failed to update school' : 'Failed to save school');
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditingSchool = (schoolEntry) => {
    setNewSchool(schoolEntry.school || '');
    setSchoolSuggestions([]);
    setEditingSchoolId(schoolEntry._id);
    setErrors({});
    setMessage('');

    setTimeout(() => {
      if (schoolFormRef.current) {
        schoolFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const cancelEditingSchool = () => {
    setEditingSchoolId(null);
    setNewSchool('');
    setSchoolSuggestions([]);
    setErrors({});
    setMessage('');
  };

  // Remove education function
  const removeEducation = async (educationId) => {
    try {
      setLoading(true);
      let authToken = token || localToken;

      if (!authToken && typeof window !== 'undefined') {
        authToken = localStorage.getItem('token');
      }

      const response = await axios.delete(
        `students/profile/education/${educationId}`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );

      setEducation(response.data.data.education);
      setMessage('Education removed successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove education';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const removeSchool = async (schoolId) => {
    try {
      setLoading(true);
      let authToken = token || localToken;

      if (!authToken && typeof window !== 'undefined') {
        authToken = localStorage.getItem('token');
      }

      const response = await axios.delete(
        `students/profile/school/${schoolId}`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );

      setSchools(response.data.data.schools);
      setMessage('School removed successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove school';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) {
      setMessage('Please enter a skill name');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `students/profile/skill`,
        { name: newSkill, proficiency },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setSkills(response.data.data.skills);
      setNewSkill('');
      setProficiency('Intermediate');
      setMessage('Skill added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add skill';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const fileToPreview = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `new-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          file,
          name: file.name,
          preview: String(reader.result || ''),
        });
      };
      reader.onerror = () => reject(new Error('Failed to read project screenshot'));
      reader.readAsDataURL(file);
    });
  };

  const openProjectImageViewer = (src, title = 'Project image') => {
    setProjectImageViewer({ src, title });
    setIsProjectImageViewerOpen(true);
  };

  const closeProjectImageViewer = () => {
    setIsProjectImageViewerOpen(false);
    setProjectImageViewer({ src: '', title: '' });
  };

  const openProjectCropModal = (entryId) => {
    const entry = projectNewScreenshotEntries.find((item) => item.id === entryId);
    if (!entry) return;

    setProjectCropEntryId(entryId);
    setProjectCropPreview(entry.preview);
    setProjectCropFileName(entry.name || 'project-image');
    setProjectCropZoom(1);
    setProjectCropOffsetX(0);
    setProjectCropOffsetY(0);
    setProjectCropDragStart({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
    setIsProjectCropDragging(false);
    setIsProjectCropModalOpen(true);
  };

  const closeProjectCropModal = () => {
    setIsProjectCropModalOpen(false);
    setProjectCropPreview('');
    setProjectCropFileName('');
    setProjectCropEntryId('');
    setProjectCropZoom(1);
    setProjectCropOffsetX(0);
    setProjectCropOffsetY(0);
    setIsProjectCropDragging(false);
    setProjectCropDragStart({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  };

  const startProjectCropDrag = (clientX, clientY) => {
    setIsProjectCropDragging(true);
    setProjectCropDragStart({
      x: clientX,
      y: clientY,
      offsetX: projectCropOffsetX,
      offsetY: projectCropOffsetY,
    });
  };

  const moveProjectCropDrag = (clientX, clientY) => {
    if (!isProjectCropDragging) return;

    const deltaX = clientX - projectCropDragStart.x;
    const deltaY = clientY - projectCropDragStart.y;
    setProjectCropOffsetX(projectCropDragStart.offsetX + deltaX);
    setProjectCropOffsetY(projectCropDragStart.offsetY + deltaY);
  };

  const stopProjectCropDrag = () => {
    setIsProjectCropDragging(false);
  };

  const applyProjectCrop = async () => {
    if (!projectCropPreview || !projectCropEntryId) return;

    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load project image'));
        img.src = projectCropPreview;
      });

      const outputWidth = 1200;
      const outputHeight = 675;
      const frameRect = projectCropContainerRef.current?.getBoundingClientRect();
      const frameWidth = frameRect?.width || 360;
      const frameHeight = frameRect?.height || 203;
      const containScale = Math.min(outputWidth / image.width, outputHeight / image.height);
      const drawWidth = image.width * containScale * projectCropZoom;
      const drawHeight = image.height * containScale * projectCropZoom;
      const offsetScaleX = outputWidth / frameWidth;
      const offsetScaleY = outputHeight / frameHeight;
      const drawX = ((outputWidth - drawWidth) / 2) + (projectCropOffsetX * offsetScaleX);
      const drawY = ((outputHeight - drawHeight) / 2) + (projectCropOffsetY * offsetScaleY);

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to initialize canvas');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.92);
      });

      if (!blob) throw new Error('Failed to create cropped project image');

      const croppedFile = new File([blob], `${(projectCropFileName || 'project-image').replace(/\.[^/.]+$/, '')}-cropped.jpg`, {
        type: 'image/jpeg',
      });

      const preview = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to prepare cropped preview'));
        reader.readAsDataURL(croppedFile);
      });

      setProjectNewScreenshotEntries((prev) =>
        prev.map((entry) => (
          entry.id === projectCropEntryId
            ? { ...entry, file: croppedFile, preview }
            : entry
        ))
      );

      closeProjectCropModal();
    } catch (error) {
      setProjectMessage('Error: Could not crop project image');
    }
  };

  const handleProjectScreenshotsChange = async (selectedFiles) => {
    const files = Array.from(selectedFiles || []);

    if (files.length === 0) {
      return;
    }

    if (files.length + projectExistingScreenshots.length + projectNewScreenshotEntries.length > MAX_PROJECT_SCREENSHOTS) {
      setProjectMessage(`Please upload up to ${MAX_PROJECT_SCREENSHOTS} project screenshots`);
      setErrors((prev) => ({
        ...prev,
        projectImages: `You can upload up to ${MAX_PROJECT_SCREENSHOTS} images per project`,
      }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));
    if (invalidFile) {
      setProjectMessage('Please upload project screenshots as JPG, PNG, or WEBP images only');
      setErrors((prev) => ({
        ...prev,
        projectImages: 'Only JPG, PNG, and WEBP images are allowed',
      }));
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_PROJECT_SCREENSHOT_SIZE);
    if (oversizedFile) {
      setProjectMessage('Each project screenshot must be less than 5MB');
      setErrors((prev) => ({
        ...prev,
        projectImages: 'Each screenshot must be less than 5MB',
      }));
      return;
    }

    try {
      const entries = await Promise.all(files.map((file) => fileToPreview(file)));
      setProjectNewScreenshotEntries((prev) => [...prev, ...entries]);
      setProjectMessage('');
      setErrors((prev) => ({ ...prev, projectImages: '' }));
    } catch (error) {
      setProjectMessage('Error: Could not read selected screenshots');
    }
  };

  const removeExistingProjectScreenshot = (screenshotId) => {
    setProjectExistingScreenshots((prev) => prev.filter((shot) => shot._id !== screenshotId));
    setProjectRemovedScreenshotIds((prev) => {
      if (prev.includes(screenshotId)) return prev;
      return [...prev, screenshotId];
    });
  };

  const removeNewProjectScreenshot = (entryId) => {
    setProjectNewScreenshotEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const removeSkill = async (skillId) => {
    try {
      setLoading(true);

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.delete(
        `students/profile/skill/${skillId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setSkills(response.data.data.skills);
      setMessage('Skill removed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove skill';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    const projectErrors = {};
    if (!projectForm.title.trim()) {
      projectErrors.title = 'Project title is required';
    }

    if (Object.keys(projectErrors).length > 0) {
      setErrors(projectErrors);
      setProjectMessage('Error: Please fill in required project fields');
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setProjectMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setProjectMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', projectForm.title.trim());
      formData.append('description', projectForm.description.trim());
      formData.append('technologies', projectForm.technologies.trim());
      formData.append('repositoryUrl', normalizeProjectLink(projectForm.repositoryUrl));
      formData.append('liveUrl', normalizeProjectLink(projectForm.liveUrl));

      projectNewScreenshotEntries.forEach((entry) => {
        formData.append('projectImages', entry.file);
      });

      if (editingProjectId && projectRemovedScreenshotIds.length > 0) {
        formData.append('removeScreenshotIds', JSON.stringify(projectRemovedScreenshotIds));
      }

      const response = editingProjectId
        ? await axios.put(`students/profile/project/${editingProjectId}`, formData, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        : await axios.post('students/profile/project', formData, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

      const updatedProjects = response?.data?.data?.projects;
      setProjects(Array.isArray(updatedProjects) ? updatedProjects : []);
      setProjectForm(emptyProjectForm);
      setProjectExistingScreenshots([]);
      setProjectRemovedScreenshotIds([]);
      setProjectNewScreenshotEntries([]);
      setEditingProjectId(null);
      setProjectMessage(editingProjectId ? 'Project updated successfully' : 'Project added successfully');
      setTimeout(() => setProjectMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || (editingProjectId ? 'Failed to update project' : 'Failed to add project');
      setProjectMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditingProject = (project) => {
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      technologies: toTechString(project.technologies),
      repositoryUrl: project.repositoryUrl || '',
      liveUrl: project.liveUrl || '',
    });
    setProjectExistingScreenshots(Array.isArray(project.screenshots) ? project.screenshots : []);
    setProjectRemovedScreenshotIds([]);
    setProjectNewScreenshotEntries([]);
    setEditingProjectId(project._id);
    setErrors({});
    setProjectMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditingProject = () => {
    setProjectForm(emptyProjectForm);
    setProjectExistingScreenshots([]);
    setProjectRemovedScreenshotIds([]);
    setProjectNewScreenshotEntries([]);
    setEditingProjectId(null);
    setErrors({});
    setProjectMessage('');
  };

  const removeProject = async (projectId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this project?');
      if (!confirmed) return;

      setLoading(true);
      setProjectMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setProjectMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.delete(`students/profile/project/${projectId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const updatedProjects = response?.data?.data?.projects;
      setProjects(Array.isArray(updatedProjects) ? updatedProjects : []);

      if (editingProjectId === projectId) {
        cancelEditingProject();
      }

      setProjectMessage('Project removed successfully');
      setTimeout(() => setProjectMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove project';
      setProjectMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setMessage('Please upload a valid image file (JPG, JPEG, or PNG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5000000) {
        setMessage('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Enter crop mode with default values
        setCropMode(true);
        setCropZoom(0.8);
        setCropOffsetX(0);
        setCropOffsetY(0);
        setCropRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffsetX, y: e.clientY - cropOffsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCropOffsetX(e.clientX - dragStart.x);
    setCropOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - cropOffsetX, y: touch.clientY - cropOffsetY });
    } else if (e.touches.length === 2) {
      // Two-finger pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      setDragStart({ ...dragStart, distance });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setCropOffsetX(touch.clientX - dragStart.x);
      setCropOffsetY(touch.clientY - dragStart.y);
    } else if (e.touches.length === 2) {
      // Pinch zoom on two fingers
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      const delta = distance - dragStart.distance;
      const newZoom = Math.max(0.5, Math.min(3, cropZoom + delta * 0.01));
      setCropZoom(newZoom);
      setDragStart({ ...dragStart, distance });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.max(0.5, Math.min(3, cropZoom + delta));
    setCropZoom(newZoom);
  };

  const applyCrop = () => {
    if (!imagePreview) {
      return;
    }

    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const cropSize = 256; // Match visual preview size (w-64 h-64)
      canvas.width = cropSize;
      canvas.height = cropSize;

      ctx.save();

      // Create circular clipping path first
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Move to center for transforms
      ctx.translate(cropSize / 2, cropSize / 2);

      // Apply transforms: translate, rotate, then scale
      ctx.translate(cropOffsetX, cropOffsetY);
      ctx.rotate((cropRotation * Math.PI) / 180);
      ctx.scale(cropZoom, cropZoom);

      // Calculate scale to fit image in container
      const scale = Math.min(cropSize / img.width, cropSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Draw image centered at origin
      ctx.drawImage(
        img,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], profileImage.name, { type: 'image/png' });
          setProfileImage(croppedFile);
          setCroppedImage(canvas.toDataURL('image/png'));
          setCropMode(false);
          setImagePreview(canvas.toDataURL('image/png'));
          setMessage('Image cropped successfully');
          setTimeout(() => setMessage(''), 3000);
        }
      }, 'image/png');
    };

    img.src = imagePreview;
  };

  const cancelCrop = () => {
    setCropMode(false);
    setProfileImage(null);
    setImagePreview(null);
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
    setCropRotation(0);
    setCroppedImage(null);
    setIsDragging(false);
    setIsProfileImageModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cover image cropping functions
  const handleCoverMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - coverCropOffsetX, y: e.clientY - coverCropOffsetY });
  };

  const handleCoverMouseMove = (e) => {
    if (!isDragging) return;
    setCoverCropOffsetX(e.clientX - dragStart.x);
    setCoverCropOffsetY(e.clientY - dragStart.y);
  };

  const processCoverImage = () => {
    if (!coverImagePreview) {
      return;
    }

    const canvas = coverCropCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const cropWidth = 1200;
      const cropHeight = 540;
      const previewWidth = coverCropContainerRef.current?.clientWidth || 320;
      const previewHeight = coverCropContainerRef.current?.clientHeight || 144;
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.save();

      // Create rectangular clipping path
      ctx.beginPath();
      ctx.rect(0, 0, cropWidth, cropHeight);
      ctx.clip();

      // Move to center for transforms
      ctx.translate(cropWidth / 2, cropHeight / 2);

      // Apply transforms: translate, rotate, then scale
      ctx.translate(
        coverCropOffsetX * (cropWidth / previewWidth),
        coverCropOffsetY * (cropHeight / previewHeight)
      );
      ctx.rotate((coverCropRotation * Math.PI) / 180);
      ctx.scale(coverCropZoom, coverCropZoom);

      // Calculate scale to fit image in container
      const scale = Math.min(cropWidth / img.width, cropHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Draw image centered at origin
      ctx.drawImage(
        img,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], coverImage.name, { type: 'image/png' });
          setCoverImage(croppedFile);
          setCroppedCoverImage(canvas.toDataURL('image/png'));
          setCoverCropMode(false);
          setCoverImagePreview(canvas.toDataURL('image/png'));
          setMessage('Cover image cropped successfully');
          setTimeout(() => setMessage(''), 3000);
        }
      }, 'image/png');
    };

    img.src = coverImagePreview;
  };

  const cancelCoverCrop = () => {
    setCoverCropMode(false);
    setCoverImage(null);
    setCoverImagePreview(null);
    setCoverCropZoom(0.8);
    setCoverCropOffsetX(0);
    setCoverCropOffsetY(0);
    setCoverCropRotation(0);
    setCroppedCoverImage(null);
    setIsDragging(false);
    setIsCoverImageModalOpen(false);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) {
      setMessage('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', profileImage);

      const response = await axios.post(
        `students/profile/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      setMessage('Profile image uploaded successfully');
      setProfileImage(null);
      setImagePreview(null);
      setIsProfileImageModalOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Update stored profile image
      if (response.data.data && response.data.data.student && response.data.data.student.profileImage) {
        const url = response.data.data.student.profileImage.filePath;
        const fullImageUrl = url.startsWith('http') ? url : `${imageBaseUrl}/${url}`;
        setStoredProfileImage(fullImageUrl);
      }
      // Refresh auth context to update profile picture elsewhere (like Navbar)
      if (typeof checkUserLoggedIn === 'function') {
        checkUserLoggedIn();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload image';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setMessage('Please upload a valid image file (JPG, JPEG, or PNG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5000000) {
        setMessage('Image size must be less than 5MB');
        return;
      }

      setCoverImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
        // Enter crop mode with default values
        setCoverCropMode(true);
        setCoverCropZoom(0.8);
        setCoverCropOffsetX(0);
        setCoverCropOffsetY(0);
        setCoverCropRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCoverImage = async () => {
    if (!coverImage) {
      setMessage('Please select a cover image first');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const authToken = getAuthToken();
      if (!authToken) {
        setMessage('Error: No authentication token. Please login again.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('coverImage', coverImage);

      const response = await axios.post(
        `students/profile/cover`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      setMessage('Cover image uploaded successfully');
      setCoverImage(null);
      setCoverImagePreview(null);
      setIsCoverImageModalOpen(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
      // Update stored cover image
      if (response.data.data && response.data.data.student && response.data.data.student.coverImage) {
        const url = response.data.data.student.coverImage.filePath;
        const fullCoverUrl = url.startsWith('http') ? url : `${imageBaseUrl}/${url}`;
        setStoredCoverImage(fullCoverUrl);
      }
      // Refresh auth context
      if (typeof checkUserLoggedIn === 'function') {
        checkUserLoggedIn();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload cover image';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-500 font-medium">Manage your profile information and preferences</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-px bg-gray-100 mx-2" />
            {storedProfileImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-100 shadow-sm bg-white">
                <img
                  src={storedProfileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold border border-primary-100 uppercase">
                {personalInfo.fullName?.charAt(0) || user?.name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-8 pb-8 pt-10">
          {/* Remove the duplicate Settings title since we added it to header */}

          {/* Profile Completion Bar */}
          <StudentProfileCompletionBar profileCompletion={profileCompletion} />

          {message && (
            <div
              className={`mt-6 rounded-lg border px-4 py-3 text-sm font-medium ${
                message.startsWith('Error:')
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-6">
            {/* Left Column - Profile Card */}
            <div className="w-80 flex-shrink-0">
              <ProfileView
                user={user}
                personalInfo={personalInfo}
                defaultPhoneCode={DEFAULT_PHONE_CODE}
                storedProfileImage={storedProfileImage}
                storedCoverImage={storedCoverImage}
                onEditCoverImage={() => setIsCoverImageModalOpen(true)}
                onEditProfileImage={() => setIsProfileImageModalOpen(true)}
                skills={skills}
                education={education}
                schools={schools}
                projects={projects}
                certifications={certifications}
                uploadedCertificateFiles={uploadedCertificateFiles}
                showAllSkills={showAllSkills}
                onToggleShowAllSkills={() => setShowAllSkills((prev) => !prev)}
                showAllEducation={showAllEducation}
                onToggleShowAllEducation={() => setShowAllEducation((prev) => !prev)}
                showAllSchools={showAllSchools}
                onToggleShowAllSchools={() => setShowAllSchools((prev) => !prev)}
              />
            </div>

            {/* Right Column - Forms */}
            <div className="flex-1 min-w-0">
              {/* Stepper Navigation */}
              <Stepper 
                steps={steps} 
                activeTab={activeTab} 
                currentStepIndex={currentStepIndex} 
                onStepClick={setActiveStep}
              />

              {/* Content */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
                            <FileText size={14} />
                          </span>
                          Personal Info
                        </h3>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600">
                          <Pencil size={14} />
                          Details
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <User size={14} className="text-slate-600" />
                            Full Name
                          </label>
                          <Input
                            type="text"
                            name="fullName"
                            value={personalInfo.fullName || ''}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                            error={errors.fullName}
                            disabled={!!user?.name}
                            icon={User}
                            className="bg-slate-50"
                            placeholder="Your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Badge size={14} className="text-slate-600" />
                            Designation
                          </label>
                          <Input
                            type="text"
                            name="designation"
                            value={personalInfo.designation || ''}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, designation: e.target.value })}
                            error={errors.designation}
                            className="bg-slate-50"
                            placeholder="e.g. Student"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FaEarthAsia size={14} className="text-slate-600" />
                            Country
                          </label>
                          <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm flex items-center gap-3">
                            <img src={countriesData.default.flagUrl} alt="Sri Lanka flag" className="w-6 h-4 object-cover rounded-sm border border-slate-200" />
                            <span className="font-medium text-slate-900">{countriesData.default.name}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FaLocationDot size={14} className="text-slate-600" />
                            Location
                          </label>
                          <Input
                            type="text"
                            name="location"
                            value={personalInfo.location || ''}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                            error={errors.location}
                            className="bg-slate-50"
                            placeholder="e.g. Colombo"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CalendarDays size={14} className="text-slate-600" />
                            Date of Birth
                          </label>
                          <Input
                            type="date"
                            name="dateOfBirth"
                            value={personalInfo.dateOfBirth || ''}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const dob = e.target.value;
                              const ageFromDob = calculateAgeFromDateOfBirth(dob);
                              setPersonalInfo(prev => ({
                                ...prev,
                                dateOfBirth: dob,
                                age: ageFromDob
                              }));

                              if (dob) {
                                const selectedDate = new Date(dob);
                                const today = new Date();
                                today.setHours(23, 59, 59, 999);
                                setErrors(prev => ({
                                  ...prev,
                                  dateOfBirth: selectedDate > today ? 'Date of birth cannot be in the future' : '',
                                  age: ''
                                }));
                              } else {
                                setErrors(prev => ({ ...prev, dateOfBirth: '', age: '' }));
                              }
                            }}
                            error={errors.dateOfBirth}
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CalendarDays size={14} className="text-slate-600" />
                            Age
                          </label>
                          <Input
                            type="text"
                            name="age"
                            value={personalInfo.age === null || personalInfo.age === undefined || personalInfo.age === '' ? '' : String(personalInfo.age)}
                            disabled
                            error={errors.age}
                            icon={CalendarDays}
                            className="bg-slate-100 text-slate-600"
                            placeholder="Auto from date of birth"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FaPhone size={14} className="text-slate-600" />
                            Phone Number
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 select-none">
                              {DEFAULT_PHONE_CODE}
                            </div>
                            <input
                              type="tel"
                              value={personalInfo.phone || ''}
                              onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '');

                                if (digitsOnly.startsWith('0')) {
                                  setErrors(prev => ({
                                    ...prev,
                                    phone: 'First digit cannot be 0'
                                  }));
                                  return;
                                }

                                setPersonalInfo({ ...personalInfo, phone: digitsOnly.slice(0, 9) });
                                setErrors(prev => ({ ...prev, phone: '' }));
                              }}
                              onBlur={() => {
                                const phoneError = validateSriLankaLocalPhone(personalInfo.phone || '');
                                setErrors(prev => ({ ...prev, phone: phoneError }));
                              }}
                              maxLength={9}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="771234567"
                            />
                          </div>
                          {errors.phone && <p className="text-red-500 text-sm font-medium mt-2">{errors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Award size={14} className="text-slate-600" />
                            GPA
                          </label>
                          <Input
                            type="number"
                            name="gpa"
                            step="0.01"
                            value={personalInfo.gpa || ''}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, gpa: e.target.value })}
                            error={errors.gpa}
                            className="bg-slate-50 font-medium"
                            placeholder="3.8"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <MessageSquare size={14} className="text-slate-600" />
                            About
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingAbout(true)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                              title="Edit about"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPersonalInfo(prev => ({ ...prev, about: '' }));
                                setIsEditingAbout(false);
                                setErrors(prev => ({ ...prev, about: '' }));
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                              title="Delete about"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {isEditingAbout || !personalInfo.about ? (
                          <div>
                            <textarea
                              value={personalInfo.about || ''}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 200);
                                setPersonalInfo(prev => ({ ...prev, about: value }));
                                setErrors(prev => ({ ...prev, about: '' }));
                              }}
                              maxLength={200}
                              rows={3}
                              placeholder="Write a short profile summary..."
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="mt-1 flex items-center justify-between">
                              {errors.about ? <p className="text-red-500 text-xs font-medium">{errors.about}</p> : <span />}
                              <p className="text-xs text-slate-500">{(personalInfo.about || '').length}/200</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                            {personalInfo.about}
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <div className="space-y-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <GraduationCap size={14} className="text-slate-600" />
                            Seniority
                          </label>
                          <div className="flex gap-4 mt-1">
                            {['Student', 'Graduate'].map(level => (
                              <label key={level} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                                <input
                                  type="radio"
                                  name="seniority"
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                  checked={personalInfo.seniority ? personalInfo.seniority.includes(level) : false}
                                  onChange={() => setPersonalInfo({ ...personalInfo, seniority: [level] })}
                                />
                                <span className={`text-sm ${personalInfo.seniority?.includes(level) ? 'font-semibold text-indigo-600' : 'text-slate-600'}`}>{level}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="space-y-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Briefcase size={14} className="text-slate-600" />
                            Work Mode
                          </label>
                          <div className="flex flex-wrap gap-4 mt-2">
                            {['On-site', 'Remote', 'Hybrid'].map(mode => (
                              <label key={mode} className="flex items-center gap-2.5 cursor-pointer px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                  checked={personalInfo.preferredLocation?.includes(mode)}
                                  onChange={(e) => {
                                    const current = personalInfo.preferredLocation || [];
                                    const updated = Array.isArray(current) 
                                      ? (e.target.checked ? [...current, mode] : current.filter(m => m !== mode))
                                      : (e.target.checked ? [mode] : []);
                                    setPersonalInfo({ ...personalInfo, preferredLocation: updated });
                                    setErrors(prev => ({ ...prev, preferredLocation: '' }));
                                  }}
                                />
                                <span className="text-sm font-medium text-slate-700">{mode}</span>
                              </label>
                            ))}
                          </div>
                          {errors.preferredLocation && (
                            <p className="text-red-500 text-sm font-medium mt-2">{errors.preferredLocation}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 mt-8 pt-6 border-t border-slate-100">
                        <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase">
                          <FaEarthAsia size={14} className="text-emerald-600" />
                          Connect
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                              <FaLinkedin size={14} className="text-blue-600" />
                              LinkedIn
                            </label>
                            <Input
                              type="url"
                              name="linkedin"
                              value={personalInfo.linkedin || ''}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                              className="bg-slate-50 font-medium"
                              placeholder="linkedin.com/..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                              <FaGithub size={14} className="text-slate-900" />
                              GitHub
                            </label>
                            <Input
                              type="url"
                              name="github"
                              value={personalInfo.github || ''}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                              className="bg-slate-50 font-medium"
                              placeholder="github.com/..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                              <FaLink size={14} className="text-slate-700" />
                              Portfolio
                            </label>
                            <Input
                              type="url"
                              name="website"
                              value={personalInfo.website || ''}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                              className="bg-slate-50 font-medium"
                              placeholder="mysite.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button
                        onClick={handleSavePersonalInfo}
                        loading={loading}
                        icon={Save}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg"
                      >
                        Save Details
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div ref={educationFormRef}>
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-sm">
                          <GraduationCap size={14} />
                        </span>
                        Add Education
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Home size={14} className="text-slate-600" />
                              Institution
                            </label>
                            <Input
                              name="institution"
                              value={newEducation.institution}
                              onChange={handleEducationChange}
                              error={errors.institution}
                              className={`bg-slate-50 ${errors.institution ? 'ring-2 ring-red-200' : ''}`}
                              placeholder="eg: University of Jaffna"
                              autoComplete="off"
                            />
                          </div>
                          {universitySuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                              {universitySuggestions.map((uni, idx) => (
                                <button
                                  key={idx}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex flex-col"
                                  onClick={() => selectUniversity(uni)}
                                >
                                  <span className="font-semibold text-slate-900">{uni.name}</span>
                                  {uni.aliases && <span className="text-xs text-slate-500">{uni.aliases.join(', ')}</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <GraduationCap size={14} className="text-slate-600" />
                            Degree
                          </label>
                          <Input
                            name="degree"
                            value={newEducation.degree}
                            onChange={handleEducationChange}
                            error={errors.degree}
                            className={`bg-slate-50 ${errors.degree ? 'ring-2 ring-red-200' : ''}`}
                            placeholder="eg: Bachelor's Degree"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Badge size={14} className="text-slate-600" />
                            <span>
                              Degree Level <span className="text-purple-500">(+8 points if qualified)</span>
                            </span>
                          </label>
                          <select
                            name="degreeLevel"
                            value={newEducation.degreeLevel || ''}
                            onChange={handleEducationChange}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.degreeLevel ? 'border-red-500 bg-red-50' : 'border-purple-300 bg-purple-50'}`}
                          >
                            <option value="">Select Degree Level</option>
                            <option value="HIGH_SCHOOL">High School Diploma</option>
                            <option value="ASSOCIATE">Associate's Degree</option>
                            <option value="BACHELOR">Bachelor's Degree</option>
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Clock size={14} className="text-slate-600" />
                            Duration
                          </label>
                          <div className="relative">
                            <input
                              name="durationMonths"
                              type="text"
                              value={newEducation.durationMonths || ''}
                              onChange={handleEducationChange}
                              onFocus={() => setDurationDropdownOpen(true)}
                              onClick={() => setDurationDropdownOpen(true)}
                              onBlur={() => setTimeout(() => setDurationDropdownOpen(false), 150)}
                              placeholder="e.g., 4 years"
                              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.durationMonths ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
                            />
                            {durationDropdownOpen && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
                                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-100">
                                  Select or type a duration
                                </div>
                                <div className="max-h-56 overflow-y-auto">
                                  {durationOptions.map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleDurationSelect(option)}
                                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                    >
                                      <span>{option}</span>
                                      <span className="text-xs text-slate-400">Click to use</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                            <p>Type duration like <span className="font-semibold text-slate-700">4 years</span>.</p>
                          </div>
                          {errors.durationMonths && (
                            <p className="mt-1 text-xs text-red-600">{errors.durationMonths}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FileText size={14} className="text-slate-600" />
                            Field of Study
                          </label>
                          <Input
                            name="field"
                            value={newEducation.field}
                            onChange={handleEducationChange}
                            error={errors.field}
                            className={`bg-slate-50 ${errors.field ? 'ring-2 ring-red-200' : ''}`}
                            placeholder="eg: Software Engineering"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CalendarDays size={14} className="text-slate-600" />
                            Start Date
                          </label>
                          <Input
                            name="startDate"
                            type="date"
                            value={newEducation.startDate}
                            onChange={handleEducationChange}
                            error={errors.startDate}
                            max={new Date().toISOString().split('T')[0]}
                            className={`bg-slate-50 ${errors.startDate ? 'ring-2 ring-red-200' : ''}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CalendarDays size={14} className="text-slate-600" />
                            End Date (Optional)
                          </label>
                          <Input
                            name="endDate"
                            type="date"
                            value={newEducation.endDate}
                            onChange={handleEducationChange}
                            error={errors.endDate}
                            min={newEducation.startDate || undefined}
                            className={`bg-slate-50 ${errors.endDate ? 'ring-2 ring-red-200' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSaveEducation}
                          disabled={loading}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          {editingEducationId ? <Save size={14} /> : <Plus size={14} />}
                          {loading ? (editingEducationId ? 'Saving...' : 'Adding...') : (editingEducationId ? 'Save Changes' : 'Add Education')}
                        </button>
                        {editingEducationId && (
                          <button
                            onClick={cancelEditingEducation}
                            type="button"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-200">
                        <div className="space-y-4" ref={schoolFormRef}>
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-stone-500 to-slate-600 rounded-lg">
                              <Building2 size={14} className="text-white" />
                            </div>
                            Add School
                          </h4>
                          <p className="text-xs text-slate-600">Add your school information separately from your education</p>

                          <div className="space-y-2 relative">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Building2 size={14} className="text-slate-600" />
                              School Name
                            </label>
                            <Input
                              value={newSchool}
                              onChange={(e) => handleSchoolInputChange(e.target.value)}
                              placeholder="eg: Jaffna Central College"
                              className="bg-slate-50"
                              autoComplete="off"
                            />
                            {schoolSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                {schoolSuggestions.map((schoolItem, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex flex-col"
                                    onClick={() => selectSchool(schoolItem)}
                                  >
                                    <span className="font-semibold text-slate-900">{schoolItem.name}</span>
                                    {schoolItem.aliases && <span className="text-xs text-slate-500">{schoolItem.aliases.join(', ')}</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleAddSchool}
                              disabled={loading}
                              className="flex-1 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                            >
                              {editingSchoolId ? <Save size={14} /> : <Plus size={14} />}
                              {loading ? (editingSchoolId ? 'Saving...' : 'Adding...') : (editingSchoolId ? 'Save Changes' : 'Add School')}
                            </button>
                            {editingSchoolId && (
                              <button
                                onClick={cancelEditingSchool}
                                type="button"
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {education.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Your Education ({education.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {education.map((edu, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold text-slate-900">
                                  {edu.degree} in {edu.field}
                                  {edu.degreeLevel && (
                                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                      {formatDegreeLevel(edu.degreeLevel)}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-slate-700 mt-1">{edu.institution}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 ml-4">
                                <button
                                  onClick={() => startEditingEducation(edu)}
                                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded transition-colors"
                                  title="Edit education"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => removeEducation(edu._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                  title="Delete education"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {schools.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Building2 size={18} className="text-stone-600" />
                          Schools ({schools.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {schools.map((school, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-stone-50 hover:bg-stone-100 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">{school.school}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Added {new Date(school.addedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 ml-4">
                                <button
                                  onClick={() => startEditingSchool(school)}
                                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded transition-colors"
                                  title="Edit school"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => removeSchool(school._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                  title="Delete school"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
                      <button
                        onClick={() => setActiveStep('personal')}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <ArrowRight size={16} className="rotate-180" />
                        Previous: Personal
                      </button>
                      <button
                        onClick={() => setActiveStep('skills')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        Next: Skills
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg">
                          <Code size={16} className="text-white" />
                        </div>
                        Add Skills
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        <span className="font-semibold text-red-600">Critical for matching:</span> Skills drive Rules B1-B3.
                        Advanced/Expert levels get bonus points.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Skill name (e.g., JavaScript, Python)"
                            value={newSkill}
                            onChange={(e) => handleSkillInputChange(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                            autoComplete="off"
                          />
                          {skillSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                              {skillSuggestions.map((skill, idx) => (
                                <button
                                  key={idx}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors font-medium text-slate-700"
                                  onClick={() => selectSkill(skill)}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          value={proficiency}
                          onChange={(e) => setProficiency(e.target.value)}
                          className="px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          <option value="BEGINNER">BEGINNER</option>
                          <option value="INTERMEDIATE">INTERMEDIATE</option>
                          <option value="ADVANCED">ADVANCED (+bonus)</option>
                          <option value="EXPERT">EXPERT (+bonus)</option>
                        </select>
                        <button
                          onClick={addSkill}
                          disabled={loading}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      </div>
                    </div>

                    {skills.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Your Skills ({skills.length})</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {skills.map((skill, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${(skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT')
                                ? 'border-green-300 bg-green-50'
                                : 'border-slate-200 bg-slate-50'
                                } hover:bg-slate-100`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900">{skill.name}</p>
                                <p className={`text-xs font-semibold ${(skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT')
                                  ? 'text-green-700'
                                  : 'text-slate-600'
                                  }`}>
                                  {skill.proficiency}
                                  {(skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT') && ' 🏆'}
                                </p>
                              </div>
                              <button
                                onClick={() => removeSkill(skill._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
                      <button
                        onClick={() => setActiveStep('education')}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <ArrowRight size={16} className="rotate-180" />
                        Previous: Education
                      </button>
                      <button
                        onClick={() => setActiveStep('projects')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        Next: Projects
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <ProjectForm
                    loading={loading}
                    message={projectMessage}
                    errors={errors}
                    editingProjectId={editingProjectId}
                    projectForm={projectForm}
                    projects={projects}
                    projectExistingScreenshots={projectExistingScreenshots}
                    projectNewScreenshots={projectNewScreenshotEntries}
                    onProjectFormChange={(field, value) => {
                      setProjectForm((prev) => ({ ...prev, [field]: value }));
                    }}
                    onProjectScreenshotsChange={handleProjectScreenshotsChange}
                    onRemoveExistingScreenshot={removeExistingProjectScreenshot}
                    onRemoveNewScreenshot={removeNewProjectScreenshot}
                    onCropNewScreenshot={openProjectCropModal}
                    onViewProjectImage={openProjectImageViewer}
                    onSaveProject={handleSaveProject}
                    onCancelEditing={cancelEditingProject}
                    onStartEditingProject={startEditingProject}
                    onRemoveProject={removeProject}
                    onPrevious={() => setActiveStep('skills')}
                    onNext={() => setActiveStep('documents')}
                    previousLabel="Previous: Skills"
                    nextLabel="Next: Documents"
                  />
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    {/* Resume Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg">
                          <Upload size={16} className="text-white" />
                        </div>
                        Resume Upload <span className="text-green-600">(+5 matching points)</span>
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Upload your resume to get 5 bonus points in the matching algorithm (Rule C1).
                      </p>

                      <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          className="hidden"
                          ref={resumeInputRef}
                        />

                        {resumeFile ? (
                          <div className="text-center">
                            <div className="relative bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                              <button
                                onClick={handleResumeDelete}
                                className="absolute top-2 right-2 p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors"
                                title="Delete Resume"
                                disabled={loading}
                              >
                                <Trash2 size={20} />
                              </button>
                              <p className="font-semibold">✅ Resume Uploaded Successfully!</p>
                              <p className="text-sm">{resumeFile.fileName}</p>
                              <p className="text-xs">Uploaded: {new Date(resumeFile.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-3 justify-center flex-wrap">
                              <button
                                onClick={handleResumePreview}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                              >
                                <Eye size={16} />
                                Preview PDF
                              </button>
                              <button
                                onClick={handleResumeDownload}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download size={16} />
                                Download
                              </button>
                              <button
                                onClick={() => resumeInputRef.current?.click()}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                              >
                                <Upload size={16} />
                                Replace Resume
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload size={48} className="mx-auto text-green-500 mb-4" />
                            <button
                              onClick={() => resumeInputRef.current?.click()}
                              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                              disabled={loading}
                            >
                              {loading ? 'Uploading...' : 'Upload Resume (PDF)'}
                            </button>
                            <p className="text-xs text-slate-500 mt-2">PDF format only, max 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certifications Section */}
                    <div ref={certificationFormRef}>
                      <div className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                            <Award size={16} className="text-white" />
                          </div>
                          Online Certifications
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Add your professional certifications to improve your profile credibility.
                        </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input
                          label={<div className="flex items-center gap-2"><Award size={14} className="text-amber-600" /> Certification Name</div>}
                          placeholder="e.g., AWS Certified Developer"
                          value={newCertification.name}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                          error={errors.name}
                          className={`bg-slate-50 ${errors.name ? 'ring-2 ring-red-200' : ''}`}
                        />
                        <Input
                          label={<div className="flex items-center gap-2"><ExternalLink size={14} className="text-blue-600" /> Credential URL</div>}
                          placeholder="https://credential-url.com"
                          value={newCertification.credentialUrl}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
                          error={errors.credentialUrl}
                          className={`bg-slate-50 ${errors.credentialUrl ? 'ring-2 ring-red-200' : ''}`}
                        />
                        <Input
                          label={<div className="flex items-center gap-2"><CalendarDays size={14} className="text-purple-600" /> Issue Date</div>}
                          type="date"
                          value={newCertification.issuedDate}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, issuedDate: e.target.value }))}
                          error={errors.issuedDate}
                          max={new Date().toISOString().split('T')[0]}
                          className={`bg-slate-50 ${errors.issuedDate ? 'ring-2 ring-red-200' : ''}`}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSaveCertification}
                          disabled={loading}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          {editingCertificationId ? <Save size={14} /> : <Plus size={14} />}
                          {loading ? (editingCertificationId ? 'Saving...' : 'Adding...') : (editingCertificationId ? 'Save Changes' : 'Add Certification')}
                        </button>
                        {editingCertificationId && (
                          <button
                            onClick={cancelEditingCertification}
                            type="button"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      </div>

                      {/* Separate certificate file upload section */}
                      <div className="mt-6 rounded-xl border border-purple-200 bg-white p-5 shadow-sm">
                        <h4 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-sm">
                            <Upload size={14} />
                          </span>
                          Certificate File Upload
                        </h4>
                        <p className="text-xs text-slate-600 mb-4">
                          Upload certificate files from your device.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <Input
                            label={<div className="flex items-center gap-2"><FileText size={14} className="text-amber-600" /> Certificate Title (Optional)</div>}
                            placeholder="e.g., AWS Developer Certificate"
                            value={certificateTitle}
                            onChange={(e) => setCertificateTitle(e.target.value)}
                            className="bg-slate-50"
                          />
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Upload size={14} className="text-blue-600" />
                              Certificate File
                            </label>
                            <input
                              ref={certificateFileInputRef}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                              onChange={handleCertificateFileChange}
                              className="block w-full text-sm text-slate-700 file:mr-3 file:py-2.5 file:px-3.5 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-xs text-slate-600">Allowed: PDF, JPG, JPEG, WEBP (max 5MB)</p>
                          <button
                            onClick={handleCertificateFileUpload}
                            disabled={loading || !certificateFile}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                          >
                            <Upload size={14} />
                            {loading ? 'Uploading...' : 'Upload Certificate File'}
                          </button>
                        </div>
                      </div>

                      {/* Uploaded Certificate Files List (separate section) */}
                      {uploadedCertificateFiles.length > 0 && (
                        <div className="mt-6 max-w-4xl mx-auto">
                          <h4 className="text-base font-semibold text-slate-900 mb-4">Your Uploaded Certificates ({uploadedCertificateFiles.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {uploadedCertificateFiles.map((file, index) => (
                              <div
                                key={index}
                                className="p-2.5 rounded-xl border border-indigo-200 bg-white hover:border-indigo-300 transition-colors shadow-sm"
                              >
                                <div className="flex gap-2.5 items-center">
                                  <div className="w-28 md:w-32 h-20 rounded-lg overflow-hidden border border-indigo-100 bg-indigo-50 flex-shrink-0">
                                    {(file.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || '')) ? (
                                      <img
                                        src={file.filePath}
                                        alt={file.title || file.fileName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex flex-col items-center justify-center text-indigo-700">
                                        <FileText size={16} />
                                        <span className="text-[9px] font-semibold mt-0.5">Preview</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div>
                                      <h5 className="text-sm font-semibold text-slate-900 truncate">{file.title || file.fileName}</h5>
                                      <p className="text-xs text-slate-600 truncate mt-1">{file.fileName}</p>
                                      <p className="text-xs text-slate-500 mt-1">Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center justify-center gap-1.5">
                                    <a
                                      href={file.filePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                      title="Open file"
                                    >
                                      <Eye size={15} />
                                    </a>
                                    <button
                                      onClick={() => downloadUploadedCertificateFile(file.filePath, file.fileName)}
                                      className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors"
                                      title="Download file"
                                    >
                                      <Download size={15} />
                                    </button>
                                    <button
                                      onClick={() => removeUploadedCertificateFile(file._id)}
                                      className="text-red-700 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                      title="Delete file"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications List */}
                      {certifications.length > 0 && (
                        <div className="mt-6 max-w-4xl mx-auto">
                          <h4 className="text-base font-semibold text-slate-900 mb-4">Your Online Certifications ({certifications.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {certifications.map((cert, index) => (
                              <div
                                key={index}
                                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:border-purple-300 transition-colors shadow-sm"
                              >
                                <div className="flex gap-2.5 items-center">
                                  <div className="w-28 md:w-32 h-20 rounded-lg border border-purple-100 bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                                    <Award size={16} />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div>
                                      <h5 className="text-sm font-semibold text-slate-900 truncate">{cert.name}</h5>
                                      <p className="text-xs text-slate-500 mt-1">
                                        Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center justify-center gap-1.5">
                                    <a
                                      href={cert.credentialUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                      title="View credential"
                                    >
                                      <Eye size={15} />
                                    </a>
                                    <button
                                      onClick={() => startEditingCertification(cert)}
                                      className="text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                                      title="Edit certification"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      onClick={() => removeCertification(cert._id)}
                                      className="text-red-700 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                      title="Delete certification"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
                        <button
                          onClick={() => setActiveStep('projects')}
                          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          <ArrowRight size={16} className="rotate-180" />
                          Previous: Projects
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-20" /> {/* Spacer */}
        </main>

        {/* Modals Section */}
        {isProfileImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Update Profile Picture</h3>
                <button
                  onClick={() => setIsProfileImageModalOpen(false)}
                  className="text-slate-500 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {!cropMode ? (
                // Upload Section
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-slate-200 rounded-full border-2 border-slate-300 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={60} className="text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      <Upload size={16} />
                      Choose Image
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG (Max: 5MB)</p>
                  </div>

                  {profileImage && !cropMode && (
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-3">
                        Selected: <span className="font-medium">{profileImage.name}</span>
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUploadProfileImage}
                          disabled={loading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          {loading ? (
                            <>
                              <Loader className="animate-spin inline mr-2" size={14} />
                              Uploading...
                            </>
                          ) : (
                            'Upload Picture'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Crop Section
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900">Crop Your Image</h4>
                  <p className="text-xs text-slate-600">Drag to move • Scroll to zoom • Use sliders below</p>

                  <div className="flex justify-center">
                    <div
                      ref={cropContainerRef}
                      className="cursor-move touch-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onWheel={handleWheel}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                      <div className="relative w-48 h-48 bg-slate-300 rounded-full border-4 border-indigo-300 flex items-center justify-center overflow-hidden">
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Crop"
                            draggable="false"
                            style={{
                              transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom}) rotate(${cropRotation}deg)`,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                            className="pointer-events-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">
                        Zoom: {cropZoom.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={cropZoom}
                        onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">
                        Rotate: {cropRotation}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={cropRotation}
                        onChange={(e) => setCropRotation(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={cancelCrop}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyCrop}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Apply Crop
                    </button>
                  </div>
                  <canvas ref={cropCanvasRef} style={{ display: 'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Upload Modal */}
      {isCoverImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Update Cover Photo</h3>
                <button
                  onClick={() => setIsCoverImageModalOpen(false)}
                  className="text-slate-500 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {!coverCropMode ? (
                // Upload Section
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-80 h-36 bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden rounded-lg">
                      {coverImagePreview ? (
                        <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-500 text-sm">Cover Preview</div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      <Upload size={16} />
                      Choose Cover Image
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG (Max: 5MB) - Recommended: 1200x540px</p>
                  </div>

                  {coverImage && !coverCropMode && (
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-3">
                        Selected: <span className="font-medium">{coverImage.name}</span>
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setCoverImage(null);
                            setCoverImagePreview(null);
                            if (coverInputRef.current) {
                              coverInputRef.current.value = '';
                            }
                          }}
                          className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUploadCoverImage}
                          disabled={loading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          {loading ? (
                            <>
                              <Loader className="animate-spin inline mr-2" size={14} />
                              Uploading...
                            </>
                          ) : (
                            'Upload Cover'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Crop Section  
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900">Crop Your Cover Image</h4>
                  <p className="text-xs text-slate-600">Drag to move • Scroll to zoom • Use sliders below</p>

                  <div className="flex justify-center">
                    <div
                      ref={coverCropContainerRef}
                      className="cursor-move touch-none"
                      onMouseDown={handleCoverMouseDown}
                      onMouseMove={handleCoverMouseMove}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                      <div className="relative w-80 h-36 bg-slate-300 border-4 border-emerald-300 flex items-center justify-center overflow-hidden rounded-lg">
                        {coverImagePreview && (
                          <img
                            src={coverImagePreview}
                            alt="Crop"
                            draggable="false"
                            style={{
                              transform: `translate(${coverCropOffsetX}px, ${coverCropOffsetY}px) scale(${coverCropZoom}) rotate(${coverCropRotation}deg)`,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                            className="pointer-events-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">
                        Zoom: {coverCropZoom.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={coverCropZoom}
                        onChange={(e) => setCoverCropZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">
                        Rotate: {coverCropRotation}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={coverCropRotation}
                        onChange={(e) => setCoverCropRotation(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={cancelCoverCrop}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processCoverImage}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      Apply Crop
                    </button>
                  </div>
                  <canvas ref={coverCropCanvasRef} style={{ display: 'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Crop Modal */}
      {isCertificateCropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Crop Certificate Image</h3>
                <button
                  onClick={() => closeCertificateCropModal(true)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-4">Use the slider for a simple center crop.</p>

              <div className="flex justify-center mb-4">
                <div
                  ref={certificateCropFrameRef}
                  className="w-full max-w-sm aspect-[10/7] rounded-lg overflow-hidden border border-slate-300 bg-slate-100 cursor-move touch-none"
                  onMouseDown={handleCertificateCropMouseDown}
                  onMouseMove={handleCertificateCropMouseMove}
                  onMouseUp={stopCertificateCropDrag}
                  onMouseLeave={stopCertificateCropDrag}
                  onTouchStart={handleCertificateCropTouchStart}
                  onTouchMove={handleCertificateCropTouchMove}
                  onTouchEnd={stopCertificateCropDrag}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  {certificateCropPreview && (
                    <img
                      src={certificateCropPreview}
                      alt="Certificate preview"
                      draggable="false"
                      className="w-full h-full object-contain bg-white pointer-events-none"
                      style={{ transform: `translate(${certificateCropOffsetX}px, ${certificateCropOffsetY}px) scale(${certificateCropZoom})`, transformOrigin: 'center center' }}
                    />
                  )}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Zoom: {certificateCropZoom.toFixed(2)}x (drag image with mouse/finger to position)</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={certificateCropZoom}
                  onChange={(e) => setCertificateCropZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => closeCertificateCropModal(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={useOriginalCertificateImage}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Use Original
                </button>
                <button
                  onClick={applyCertificateCrop}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Image Viewer Modal */}
      {isProjectImageViewerOpen && (
        <div className="fixed inset-0 z-[90] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{projectImageViewer.title || 'Project image'}</h3>
                <p className="text-xs text-slate-500">Full-size preview</p>
              </div>
              <button
                onClick={closeProjectImageViewer}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto">
              <img
                src={projectImageViewer.src}
                alt={projectImageViewer.title || 'Project image'}
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Project Image Crop Modal */}
      {isProjectCropModalOpen && (
        <div className="fixed inset-0 z-[95] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Crop Project Image</h3>
                  <p className="text-xs text-slate-500">Drag to move and use the zoom slider before saving</p>
                </div>
                <button
                  onClick={closeProjectCropModal}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex justify-center mb-4">
                <div
                  ref={projectCropContainerRef}
                  className="w-full max-w-2xl aspect-[16/9] rounded-lg overflow-hidden border border-slate-300 bg-slate-100 cursor-move touch-none"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    startProjectCropDrag(event.clientX, event.clientY);
                  }}
                  onMouseMove={(event) => moveProjectCropDrag(event.clientX, event.clientY)}
                  onMouseUp={stopProjectCropDrag}
                  onMouseLeave={stopProjectCropDrag}
                  onTouchStart={(event) => {
                    if (!event.touches?.length) return;
                    const touch = event.touches[0];
                    startProjectCropDrag(touch.clientX, touch.clientY);
                  }}
                  onTouchMove={(event) => {
                    if (!event.touches?.length) return;
                    const touch = event.touches[0];
                    moveProjectCropDrag(touch.clientX, touch.clientY);
                  }}
                  onTouchEnd={stopProjectCropDrag}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  {projectCropPreview && (
                    <img
                      src={projectCropPreview}
                      alt="Project crop preview"
                      draggable="false"
                      className="w-full h-full object-contain bg-white pointer-events-none"
                      style={{ transform: `translate(${projectCropOffsetX}px, ${projectCropOffsetY}px) scale(${projectCropZoom})`, transformOrigin: 'center center' }}
                    />
                  )}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Zoom: {projectCropZoom.toFixed(2)}x</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={projectCropZoom}
                  onChange={(e) => setProjectCropZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeProjectCropModal}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={closeProjectCropModal}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Use Original
                </button>
                <button
                  onClick={applyProjectCrop}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Apply Crop
                </button>
              </div>
              <canvas ref={projectCropCanvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showResumePreview && resumeFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl h-full max-h-screen flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Resume Preview</h3>
              <div className="flex items-center gap-3">
                {/* Fit/Actual Size Toggle Button */}
                <button
                  onClick={() => setPdfFitToScreen(!pdfFitToScreen)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
                  title={pdfFitToScreen ? "View actual size" : "Fit to screen"}
                >
                  {pdfFitToScreen ? (
                    <>
                      <Maximize2 size={16} />
                      Actual Size
                    </>
                  ) : (
                    <>
                      <Minimize2 size={16} />
                      Fit to Screen
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleResumeDownload}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => setShowResumePreview(false)}
                  className="p-2 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                key={pdfFitToScreen ? 'fit' : 'actual'} // Force iframe reload on toggle
                src={resumeFile.filePath.startsWith('http') 
                  ? `${resumeFile.filePath}#toolbar=0&navpanes=0&scrollbar=1${pdfFitToScreen ? '&view=FitH' : '&zoom=100'}` 
                  : `${imageBaseUrl}/${resumeFile.filePath}#toolbar=0&navpanes=0&scrollbar=1${pdfFitToScreen ? '&view=FitH' : '&zoom=100'}`
                }
                className="w-full h-full border-0 rounded-lg"
                title="Resume Preview"
                onError={() => {
                  setMessage('Unable to preview PDF. You can download it instead.');
                  setShowResumePreview(false);
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>File: {resumeFile.fileName}</span>
                <span>Uploaded: {new Date(resumeFile.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
