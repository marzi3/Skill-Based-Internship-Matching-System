
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../../../components/common/Sidebar';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { X, User, GraduationCap, Code, Loader, Upload, Pencil, Plus, Trash2, Badge, Eye, ExternalLink, Download, CheckCircle, ArrowRight, FileText } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function StudentDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [localToken, setLocalToken] = useState(null);
  const [currentDate, setCurrentDate] = useState('');

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

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    designation: '',
    email: user?.email || '',
    phone: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    // CRITICAL MATCHING FIELDS
    gpa: '',
    portfolioUrl: '',
    preferredLocation: '',
    durationPreference: '',
    industriesOfInterest: [],
    previousInternshipsCount: 0,
    isPublic: true
  });

  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    degreeLevel: '', // REQUIRED for matching
    startDate: '',
    endDate: ''
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');

  // NEW MATCHING FIELDS
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    name: '',
    credentialUrl: '',
    issuedDate: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);

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
      id: 'documents', 
      name: 'Documents', 
      icon: FileText,
      isCompleted: resumeFile || certifications.length > 0
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

  const setActiveStep = (stepId) => {
    setActiveTab(stepId);
  };
  const resumeInputRef = useRef(null);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const cropContainerRef = useRef(null);
  const coverCropCanvasRef = useRef(null);
  const coverCropContainerRef = useRef(null);
  
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

      const response = await axios.get(`${apiUrl}/api/students/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data;
      
      if (data.personalInfo) {
        // Handle both old format (firstName/lastName) and new format (fullName)
        let personalData = { ...data.personalInfo };
        
        // If we have firstName/lastName but no fullName, construct it
        if (!personalData.fullName && (personalData.firstName || personalData.lastName)) {
          personalData.fullName = `${personalData.firstName || ''} ${personalData.lastName || ''}`.trim();
        }
        
        setPersonalInfo({
          ...personalData,
          email: user?.email || personalData.email,
          // Ensure all new fields have default values
          gpa: personalData.gpa || '',
          portfolioUrl: personalData.portfolioUrl || '',
          preferredLocation: personalData.preferredLocation || '',
          durationPreference: personalData.durationPreference || '',
          industriesOfInterest: personalData.industriesOfInterest || [],
          previousInternshipsCount: personalData.previousInternshipsCount || 0,
          isPublic: personalData.isPublic !== false
        });
      }
      if (data.education) {
        setEducation(data.education);
      } else {
        setEducation([]);  // Ensure education is always an array
      }
      if (data.skills) {
        setSkills(data.skills);
      } else {
        setSkills([]);  // Ensure skills is always an array
      }
      if (data.certifications) {
        setCertifications(data.certifications);
      } else {
        setCertifications([]);  // Ensure certifications is always an array
      }
      if (data.resume && data.resume.filePath) {
        setResumeFile(data.resume);
      } else {
        setResumeFile(null);
      }
      if (data.profileImage && data.profileImage.filePath) {
        const fullImageUrl = `${apiUrl}/${data.profileImage.filePath}`;
        setStoredProfileImage(fullImageUrl);
      }
      if (data.coverImage && data.coverImage.filePath) {
        const fullCoverUrl = `${apiUrl}/${data.coverImage.filePath}`;
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

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
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

  // Handler for certifications
  const handleAddCertification = async () => {
    if (!newCertification.name || !newCertification.credentialUrl) {
      setMessage('Please fill in all certification fields');
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

      const response = await axios.post(
        `${apiUrl}/api/students/profile/certification`,
        newCertification,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setCertifications(response.data.data.certifications);
      setNewCertification({ name: '', credentialUrl: '', issuedDate: '' });
      setMessage('Certification added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add certification';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
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
        `${apiUrl}/api/students/profile/resume`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      setResumeFile(response.data.data.resumeFile);
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
  const handleResumeDownload = () => {
    if (resumeFile && resumeFile.filePath) {
      const fullResumeUrl = `${apiUrl}/${resumeFile.filePath}`;
      window.open(fullResumeUrl, '_blank');
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
        `${apiUrl}/api/students/profile/certification/${certificationId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setCertifications(response.data.data.certifications);
      setMessage('Certification removed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove certification';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let score = 0;
    const maxScore = 100;

    // Personal Info (40 points)
    if (personalInfo?.fullName) score += 5;
    if (personalInfo?.email) score += 5;
    if (personalInfo?.phone) score += 5;
    if (personalInfo?.gpa) score += 10; // CRITICAL
    if (personalInfo?.portfolioUrl) score += 10; // CRITICAL  
    if (personalInfo?.preferredLocation) score += 5; // CRITICAL

    // Education (20 points)
    if (education?.length > 0) score += 15;
    if (education?.some(edu => edu.degreeLevel)) score += 5;

    // Skills (20 points) 
    if (skills?.length >= 3) score += 15;
    if (skills?.some(skill => skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT')) score += 5;

    // Additional (20 points)
    if (personalInfo?.industriesOfInterest?.length > 0) score += 5; // CRITICAL
    if (resumeFile) score += 10; // +5 bonus points
    if (certifications?.length > 0) score += 5;

    return Math.min(score, maxScore);
  };

  // Update profile completion when data changes
  useEffect(() => {
    const completion = calculateProfileCompletion();
    setProfileCompletion(completion);
  }, [personalInfo, education, skills, certifications, resumeFile]);

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
        `${apiUrl}/api/students/profile/reset`,
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
        location: '',
        dateOfBirth: '',
        gender: '',
        gpa: '',
        portfolioUrl: '',
        preferredLocation: '',
        durationPreference: '',
        industriesOfInterest: [],
        previousInternshipsCount: 0,
        isPublic: true
      });
      setEducation([]);
      setSkills([]);
      setCertifications([]);
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
    try {
      setLoading(true);
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
        `${apiUrl}/api/students/profile/personal`,
        personalInfo,
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
    if (!newEducation.institution || !newEducation.degree || !newEducation.field || !newEducation.degreeLevel || !newEducation.startDate) {
      setMessage('Please fill in all required fields including degree level and start date');
      return;
    }

    // Validate dates
    if (newEducation.startDate && isNaN(new Date(newEducation.startDate).getTime())) {
      setMessage('Please enter a valid start date');
      return;
    }

    if (newEducation.endDate && isNaN(new Date(newEducation.endDate).getTime())) {
      setMessage('Please enter a valid end date');
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
        `${apiUrl}/api/students/profile/education`,
        newEducation,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setEducation(response.data.data.education);
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        degreeLevel: '', // Reset degree level
        startDate: '',
        endDate: ''
      });
      setMessage('Education added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save education';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
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
        `${apiUrl}/api/students/profile/education/${educationId}`,
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
        `${apiUrl}/api/students/profile/skill`,
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
        `${apiUrl}/api/students/profile/skill/${skillId}`,
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
      const cropWidth = 400; // 4:1 aspect ratio for cover (like 1200x300)
      const cropHeight = 100;
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
      ctx.translate(coverCropOffsetX, coverCropOffsetY);
      ctx.rotate((coverCropRotation * Math.PI) / 180);
      ctx.scale(coverCropZoom, coverCropZoom);
      
      // Calculate scale to fit image in container
      const scale = Math.max(cropWidth / img.width, cropHeight / img.height);
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
        `${apiUrl}/api/students/profile/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
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
        const fullImageUrl = `${apiUrl}/${response.data.data.student.profileImage.filePath}`;
        setStoredProfileImage(fullImageUrl);
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
        `${apiUrl}/api/students/profile/cover`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
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
        const fullCoverUrl = `${apiUrl}/${response.data.data.student.coverImage.filePath}`;
        setStoredCoverImage(fullCoverUrl);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload cover image';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'personal',
      label: 'Personal Information',
      icon: User,
      onClick: () => setActiveTab('personal')
    },
    {
      id: 'education',
      label: 'Education Details',
      icon: GraduationCap,
      onClick: () => setActiveTab('education')
    },
    {
      id: 'skills',
      label: 'Skills & Certifications',
      icon: Code,
      onClick: () => setActiveTab('skills')
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        items={menuItems}
        brand="InternMatch"
        variant="light"
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        width="w-60"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

          {/* Profile Completion Bar */}
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-lg">Profile Completion</h3>
                <p className="text-sm opacity-90">Complete your profile for better matching results</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{profileCompletion}%</div>
                <div className="text-sm opacity-90">
                  +{Math.floor(profileCompletion/10)*5} bonus points
                </div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                style={{width: `${profileCompletion}%`}}
              ></div>
            </div>
            <div className="mt-3 text-sm opacity-90">
              {profileCompletion < 60 && "⚠️ Low completion - Add GPA, Portfolio, and Skills for better matches"}
              {profileCompletion >= 60 && profileCompletion < 80 && "📈 Good progress - Add more skills and certifications"}
              {profileCompletion >= 80 && profileCompletion < 95 && "🎯 Almost there - Upload resume for extra points"}
              {profileCompletion >= 95 && "🏆 Excellent! Your profile is optimized for matching"}
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left Column - Profile Card */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24">
                {/* Profile Header - Cover Photo or Gradient */}
                <div className="h-36 relative group">
                  {storedCoverImage ? (
                    <img 
                      src={storedCoverImage} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600"></div>
                  )}
                  {/* Cover Edit Icon Overlay */}
                  <button 
                    onClick={() => setIsCoverImageModalOpen(true)}
                    className="absolute top-2 right-2 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg p-2 flex items-center justify-center"
                  >
                    <Pencil size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
                
                {/* Profile Image - Positioned outside cover container */}
                <div className="relative -mt-12 flex justify-center pb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400 overflow-hidden shadow-lg relative group">
                    {storedProfileImage ? (
                      <img src={storedProfileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      personalInfo.fullName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                    {/* Edit Icon Overlay */}
                    <button 
                      onClick={() => setIsProfileImageModalOpen(true)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-full flex items-center justify-center"
                    >
                      <Pencil size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="pt-2 pb-6 px-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {personalInfo.fullName || 'Student'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{personalInfo.designation || 'Add designation'}</p>
                  </div>

                  {/* Experience Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact Info</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-600">📧 {user?.email || 'Not set'}</p>
                      <p className="text-slate-600">📱 {personalInfo.phone || 'Not set'}</p>
                      <p className="text-slate-600">📍 {personalInfo.location || 'Not set'}</p>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(showAllSkills ? skills : skills.slice(0, 4)).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {skills.length > 4 && !showAllSkills && (
                          <button
                            onClick={() => setShowAllSkills(true)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            +{skills.length - 4} more
                          </button>
                        )}
                        {skills.length > 4 && showAllSkills && (
                          <button
                            onClick={() => setShowAllSkills(false)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education Preview */}
                  {education.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Education</h4>
                      <div className="space-y-2">
                        {(showAllEducation ? education : education.slice(0, 2)).map((edu, index) => (
                          <div key={index} className="text-xs">
                            <p className="font-medium text-slate-900">{edu.degree}</p>
                            <p className="text-slate-600">{edu.institution}</p>
                          </div>
                        ))}
                        {education.length > 2 && !showAllEducation && (
                          <button
                            onClick={() => setShowAllEducation(true)}
                            className="text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer underline"
                          >
                            +{education.length - 2} more
                          </button>
                        )}
                        {education.length > 2 && showAllEducation && (
                          <button
                            onClick={() => setShowAllEducation(false)}
                            className="text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer underline"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="flex-1 min-w-0">
              {/* Stepper Navigation */}
              <div className="mb-8 px-4">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isActive = step.id === activeTab;
                    const isCompleted = step.isCompleted;
                    const isPast = index < currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => setActiveStep(step.id)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : isActive
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : isPast
                                ? 'border-slate-300 bg-white text-slate-400'
                                : 'border-slate-300 bg-white text-slate-400 hover:border-indigo-300'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={20} />
                            ) : (
                              <Icon size={20} />
                            )}
                          </button>
                          <span className={`mt-2 text-xs font-medium ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-500'}`}>
                            {step.name}
                          </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                          <div className="flex-1 h-0.5 mx-4 mb-6">
                            <div className={`h-full transition-colors ${
                              index < currentStepIndex || isCompleted
                                ? 'bg-green-500'
                                : 'bg-slate-200'
                            }`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">

                    {/* Personal Info Form */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-slate-900">Personal Info</h3>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <Pencil size={14} />
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          type="text"
                          name="fullName"
                          value={personalInfo.fullName || ''}
                          onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                          className="bg-slate-50"
                          placeholder="Enter your full name"
                        />
                        <Input
                          label="Designation"
                          type="text"
                          name="designation"
                          value={personalInfo.designation || ''}
                          onChange={(e) => setPersonalInfo({...personalInfo, designation: e.target.value})}
                          className="bg-slate-50"
                          placeholder="e.g., Computer Science Student"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={user?.email || personalInfo.email || ''}
                          readOnly
                          disabled
                          className="bg-slate-100 text-slate-600 cursor-not-allowed"
                        />
                        <Input
                          label="Phone"
                          type="tel"
                          value={personalInfo.phone || ''}
                          onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                          className="bg-slate-50"
                        />
                        <Input
                          label="Location"
                          type="text"
                          value={personalInfo.location || ''}
                          onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                          className="bg-slate-50 col-span-2"
                        />
                        
                        {/* CRITICAL MATCHING FIELDS */}
                        <Input
                          label="GPA *"
                          type="number"
                          name="gpa"
                          value={personalInfo.gpa || ''}
                          onChange={handlePersonalInfoChange}
                          className="bg-yellow-50 border-yellow-300"
                          placeholder="3.75"
                          min="0.0"
                          max="4.0"
                          step="0.01"
                        />
                        <Input
                          label="Portfolio URL *"
                          type="url"
                          name="portfolioUrl"
                          value={personalInfo.portfolioUrl || ''}
                          onChange={handlePersonalInfoChange}
                          className="bg-green-50 border-green-300"
                          placeholder="https://yourportfolio.com"
                        />
                        
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Preferred Location * <span className="text-blue-500">(+6 points)</span>
                          </label>
                          <select
                            name="preferredLocation"
                            value={personalInfo.preferredLocation || ''}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-3 border border-green-300 bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select Location</option>
                            <option value="Remote">Remote</option>
                            <option value="New York">New York</option>
                            <option value="San Francisco">San Francisco</option>
                            <option value="London">London</option>
                            <option value="Toronto">Toronto</option>
                            <option value="Berlin">Berlin</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Duration Preference <span className="text-blue-500">(+6 points)</span>
                          </label>
                          <select
                            name="durationPreference"
                            value={personalInfo.durationPreference || ''}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-3 border border-slate-300 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select Duration</option>
                            <option value="1-3 months">1-3 months</option>
                            <option value="3-6 months">3-6 months</option>
                            <option value="6+ months">6+ months</option>
                          </select>
                        </div>
                        
                        <div className="col-span-2 mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Industries of Interest * <span className="text-green-500">(+7 points per match)</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2 p-3 border border-green-300 bg-green-50 rounded-lg">
                            {['Technology', 'Finance', 'Healthcare', 'Marketing', 'Design', 'Engineering', 'Education', 'Manufacturing', 'Consulting'].map(industry => (
                              <label key={industry} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={personalInfo.industriesOfInterest?.includes(industry) || false}
                                  onChange={(e) => handleIndustryChange(industry, e.target.checked)}
                                  className="mr-2 rounded"
                                />
                                <span className="text-sm">{industry}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <Input
                          label="Previous Internships Count"
                          type="number"
                          name="previousInternshipsCount"
                          value={personalInfo.previousInternshipsCount || 0}
                          onChange={handlePersonalInfoChange}
                          className="bg-slate-50"
                          min="0"
                        />
                        
                        <div className="col-span-1">
                          <label className="flex items-center cursor-pointer p-3 border border-slate-300 bg-slate-50 rounded-lg">
                            <input
                              type="checkbox"
                              name="isPublic"
                              checked={personalInfo.isPublic !== false}
                              onChange={(e) => setPersonalInfo(prev => ({...prev, isPublic: e.target.checked}))}
                              className="mr-3 rounded"
                            />
                            <span className="text-sm font-medium">Make my profile visible to employers</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleSavePersonalInfo}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>

                    {message && (
                      <p className={`text-xs font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                      </p>
                    )}
                  
                    {/* Step Navigation */}
                    <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
                      <div>
                        {/* Previous button - hidden on first step */}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveStep('education')}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          Next: Education
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 mb-4">Add Education</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input
                          label="Institution"
                          name="institution"
                          value={newEducation.institution}
                          onChange={handleEducationChange}
                          className="bg-slate-50"
                          placeholder="e.g., University of ABC"
                        />
                        <Input
                          label="Degree"
                          name="degree"
                          value={newEducation.degree}
                          onChange={handleEducationChange}
                          className="bg-slate-50"
                          placeholder="e.g., Bachelor's, Master's"
                        />
                        
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Degree Level * <span className="text-purple-500">(+8 points if qualified)</span>
                          </label>
                          <select
                            name="degreeLevel"
                            value={newEducation.degreeLevel || ''}
                            onChange={handleEducationChange}
                            className="w-full p-3 border border-purple-300 bg-purple-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select Degree Level</option>
                            <option value="HIGH_SCHOOL">High School Diploma</option>
                            <option value="CERTIFICATE">Certificate Program</option>
                            <option value="ASSOCIATE">Associate's Degree</option>
                            <option value="BACHELOR">Bachelor's Degree</option>
                            <option value="MASTER">Master's Degree</option>
                            <option value="DOCTORATE">Doctorate/PhD</option>
                          </select>
                        </div>
                        
                        <Input
                          label="Field of Study"
                          name="field"
                          value={newEducation.field}
                          onChange={handleEducationChange}
                          className="bg-slate-50"
                          placeholder="e.g., Computer Science, Engineering"
                        />
                        <Input
                          label="Start Date"
                          name="startDate"
                          type="date"
                          value={newEducation.startDate}
                          onChange={handleEducationChange}
                          className="bg-slate-50"
                        />
                        <Input
                          label="End Date (Optional)"
                          name="endDate"
                          type="date"
                          value={newEducation.endDate}
                          onChange={handleEducationChange}
                          className="bg-slate-50"
                        />
                      </div>

                      <button
                        onClick={handleSaveEducation}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Plus size={14} />
                        {loading ? 'Adding...' : 'Add Education'}
                      </button>
                    </div>

                    {education.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Your Education ({education.length})</h3>
                        <div className="space-y-3">
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
                              <button
                                onClick={() => removeEducation(edu._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors ml-4"
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
                      <h3 className="text-base font-semibold text-slate-900 mb-4">Add Skills</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        <span className="font-semibold text-red-600">Critical for matching:</span> Skills drive Rules B1-B3. 
                        Advanced/Expert levels get bonus points.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <input
                          type="text"
                          placeholder="Skill name (e.g., JavaScript, Python)"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
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
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                (skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT') 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-slate-200 bg-slate-50'
                              } hover:bg-slate-100`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900">{skill.name}</p>
                                <p className={`text-xs font-semibold ${
                                  (skill.proficiency === 'ADVANCED' || skill.proficiency === 'EXPERT') 
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
                        onClick={() => setActiveStep('documents')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        Next: Documents
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    {/* Resume Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
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
                            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
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
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
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
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Certifications</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Add your professional certifications to improve your profile credibility.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input
                          label="Certification Name"
                          placeholder="e.g., AWS Certified Developer"
                          value={newCertification.name}
                          onChange={(e) => setNewCertification(prev => ({...prev, name: e.target.value}))}
                          className="bg-slate-50"
                        />
                        <Input
                          label="Credential URL"
                          placeholder="https://credential-url.com"
                          value={newCertification.credentialUrl}
                          onChange={(e) => setNewCertification(prev => ({...prev, credentialUrl: e.target.value}))}
                          className="bg-slate-50"
                        />
                        <Input
                          label="Issue Date"
                          type="date"
                          value={newCertification.issuedDate}
                          onChange={(e) => setNewCertification(prev => ({...prev, issuedDate: e.target.value}))}
                          className="bg-slate-50"
                        />
                      </div>
                      
                      <button
                        onClick={handleAddCertification}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Badge size={14} />
                        {loading ? 'Adding...' : 'Add Certification'}
                      </button>

                      {/* Certifications List */}
                      {certifications.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-base font-semibold text-slate-900 mb-4">Your Certifications ({certifications.length})</h4>
                          <div className="space-y-3">
                            {certifications.map((cert, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-sm font-semibold text-slate-900">{cert.name}</h5>
                                  <p className="text-sm text-blue-600 hover:text-blue-800">
                                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                      View Credential →
                                    </a>
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeCertification(cert._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors ml-4"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Profile Image Upload Modal */}
      {isProfileImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Update Profile Picture</h3>
                <button 
                  onClick={() => setIsProfileImageModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
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
                        <User size={60} className="text-slate-400" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Update Cover Photo</h3>
                <button 
                  onClick={() => setIsCoverImageModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {!coverCropMode ? (
                // Upload Section
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-80 h-20 bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden rounded-lg">
                      {coverImagePreview ? (
                        <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-400 text-sm">Cover Preview</div>
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
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG (Max: 5MB) - Recommended: 1200x300px</p>
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
                      <div className="relative w-80 h-20 bg-slate-300 border-4 border-emerald-300 flex items-center justify-center overflow-hidden rounded-lg">
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
          
          {/* Step Navigation */}
          <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
            <button
              onClick={() => setActiveStep('skills')}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <ArrowRight size={16} className="rotate-180" />
              Previous: Skills
            </button>
            <button
              onClick={() => {
                setMessage('Profile completed successfully! All your information has been saved.');
                setTimeout(() => setMessage(''), 3000);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Complete Profile
            </button>
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
                <button
                  onClick={handleResumeDownload}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => setShowResumePreview(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={`${apiUrl}/${resumeFile.filePath}#toolbar=0&navpanes=0&scrollbar=1`}
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