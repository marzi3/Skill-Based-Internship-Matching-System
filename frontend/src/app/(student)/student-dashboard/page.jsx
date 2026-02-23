'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from '../../../components/common/Sidebar';
import TopBar from '../../../components/common/TopBar';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { X, User, GraduationCap, Code, Loader, Upload, Pencil, Plus, Trash2, Badge } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function StudentDashboard() {
  const { token, loading: authLoading } = useAuth();
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

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    designation: '',
    dateOfBirth: '',
    gender: ''
  });

  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: ''
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState('Intermediate');

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
        setPersonalInfo(data.personalInfo);
      }
      if (data.education) {
        setEducation(data.education);
      }
      if (data.skills) {
        setSkills(data.skills);
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

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducation(prev => ({ ...prev, [name]: value }));
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
        education,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setMessage('Education details saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save education';
      setMessage(`Error: ${errorMsg}`);
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
        {/* Top Bar */}
        <TopBar navigationItems={['📁 Student Dashboard', '⚙️ Settings']} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

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
                      personalInfo.firstName?.charAt(0)?.toUpperCase() || 'U'
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
                      {personalInfo.firstName && personalInfo.lastName
                        ? `${personalInfo.firstName} ${personalInfo.lastName}`
                        : 'Student'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{personalInfo.designation || 'Add designation'}</p>
                  </div>

                  {/* Experience Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact Info</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-600">📧 {personalInfo.email || 'Not set'}</p>
                      <p className="text-slate-600">📱 {personalInfo.phone || 'Not set'}</p>
                      <p className="text-slate-600">📍 {personalInfo.location || 'Not set'}</p>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            +{skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'personal'
                      ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  Personal Details
                </button>
                <button
                  onClick={() => setActiveTab('education')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'education'
                      ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  Education
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'skills'
                      ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  Skills
                </button>
              </div>

              {/* Content */}
              <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
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
                          value={`${personalInfo.firstName} ${personalInfo.lastName}`.trim() || ''}
                          readOnly
                          className="bg-slate-50"
                        />
                        <Input
                          label="Designation"
                          type="text"
                          value={personalInfo.designation || ''}
                          onChange={(e) => setPersonalInfo({...personalInfo, designation: e.target.value})}
                          className="bg-slate-50"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={personalInfo.email || ''}
                          onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                          className="bg-slate-50"
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
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-slate-900">Education</h3>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors">
                          <Plus size={14} />
                          Add Education
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <Input
                          label="Institution"
                          value={education.institution || ''}
                          onChange={(e) => setEducation({...education, institution: e.target.value})}
                          className="bg-slate-50"
                        />
                        <Input
                          label="Degree"
                          value={education.degree || ''}
                          onChange={(e) => setEducation({...education, degree: e.target.value})}
                          className="bg-slate-50"
                        />
                        <Input
                          label="Field of Study"
                          value={education.field || ''}
                          onChange={(e) => setEducation({...education, field: e.target.value})}
                          className="bg-slate-50 col-span-2"
                        />
                      </div>

                      <button
                        onClick={handleSaveEducation}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {loading ? 'Saving...' : 'Save Education'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 mb-4">Add Skills</h3>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <input
                          type="text"
                          placeholder="Skill name"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <select
                          value={proficiency}
                          onChange={(e) => setProficiency(e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
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
                              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900">{skill.name}</p>
                                <p className="text-xs text-slate-600">{skill.proficiency}</p>
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
        </div>
      )}
    </div>
  );
}
