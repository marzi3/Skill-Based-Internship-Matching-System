'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  LayoutDashboard,
  Plus,
  Search,
  Users,
  FileText,
  CheckCircle2,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  TrendingUp,
  Briefcase,
  Eye,
  Clock,
  Calendar,
  Download,
  Activity,
  Zap,
  Star,
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  Filter,
  Loader,
  AlertTriangle,
  Edit,
  Trash2,
  Power,
  XCircle,
} from 'lucide-react';

// Components
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

// Context
import { useAuth } from '@/context/AuthContext';

const EmployerDashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // API Integration States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiInternships, setApiInternships] = useState([]);
  const [skillAnalytics, setSkillAnalytics] = useState([]);
  const [stats, setStats] = useState([
    {
      id: 1,
      label: 'Internships Posted',
      value: '0',
      icon: Briefcase,
      color: 'primary',
      trend: '+0 this month',
    },
    {
      id: 2,
      label: 'Total Applicants',
      value: '0',
      icon: Users,
      color: 'success',
      trend: '+0 this week',
    },
    {
      id: 3,
      label: 'Skill Matches',
      value: '0',
      icon: CheckCircle2,
      color: 'accent',
      trend: '0% match rate',
    },
    {
      id: 4,
      label: 'Interviews Scheduled',
      value: '0',
      icon: Calendar,
      color: 'warning',
      trend: '+0 pending',
    },
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch data from backend API (only when user is authenticated)
  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in

    const fetchInternships = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch internships and skill demands in parallel with timeout
        const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

        const [postingsRes, skillsRes] = await Promise.all([
          Promise.race([axios.get('/api/internships/my-postings'), timeout(10000)]),
          Promise.race([axios.get('/api/internships/skill-demands'), timeout(10000)])
        ]);

        const data = postingsRes.data.data || [];
        setApiInternships(data);
        setSkillAnalytics(skillsRes.data.data || []);

        // Calculate statistics
        if (data.length > 0) {
          const totalApplicants = data.reduce((sum, int) => sum + (int.applicants?.length || 0), 0);
          const skillMatches = data.reduce((sum, int) => sum + (int.skillMatches || 0), 0);
          const interviews = data.reduce((sum, int) => sum + (int.interviews || 0), 0);

          setStats([
            {
              id: 1,
              label: 'Internships Posted',
              value: String(data.length),
              icon: Briefcase,
              color: 'primary',
              trend: `+${data.length} total`,
            },
            {
              id: 2,
              label: 'Total Applicants',
              value: String(totalApplicants),
              icon: Users,
              color: 'success',
              trend: `${totalApplicants > 0 ? 'Active pipeline' : 'No applicants yet'}`,
            },
            {
              id: 3,
              label: 'Skill Matches',
              value: String(skillMatches),
              icon: CheckCircle2,
              color: 'accent',
              trend: totalApplicants > 0 ? `${Math.round((skillMatches / (totalApplicants || 1)) * 100)}% match rate` : '0% match rate',
            },
            {
              id: 4,
              label: 'Interviews Scheduled',
              value: String(interviews),
              icon: Calendar,
              color: 'warning',
              trend: `Operational`,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [user]);

  // Skill Demand vs Supply Analytics Data - Falling back to defaults if API empty
  const displaySkillAnalytics = skillAnalytics.length > 0 ? skillAnalytics : [];

  // Top Matched Candidates Data
  const topCandidates = [];

  // Recent Activity Timeline
  const recentActivity = [];

  const toggleStatus = async (id) => {
    try {
      const response = await axios.patch(`/api/internships/${id}/status`);
      if (response.data.success) {
        setApiInternships(apiInternships.map(item =>
          item._id === id ? { ...item, status: response.data.data.status } : item
        ));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this internship?')) {
      try {
        await axios.delete(`/api/internships/${id}`);
        setApiInternships(apiInternships.filter(item => item._id !== id));
      } catch (err) {
        alert('Failed to delete internship');
      }
    }
  };

  // Live postings data - Use API data when available
  const livePostings = apiInternships.map((internship) => ({
    id: internship._id || internship.id,
    position: internship.positionTitle || 'Untitled Position',
    candidates: internship.applicants?.length || 0,
    status: internship.status || 'Hiring',
    expiry: internship.expiryDate
      ? new Date(internship.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Not Set',
    views: internship.views || 0,
    description: internship.description,
    requiredSkills: internship.requiredSkills || [],
  }));

  // Sidebar navigation items
  const sidebarItems = [
    { label: 'Dashboard', id: 'overview', icon: LayoutDashboard },
    { label: 'My Postings', id: 'postings', icon: Briefcase, path: '/employer/internships' },
    { label: 'Post Internship', id: 'post', icon: Plus, path: '/employer/internships/create' },
    { label: 'Search Candidates', id: 'search', icon: Search, path: '/employer/candidates' },
    { label: 'Applications', id: 'applications', icon: FileText, path: '/employer/applications' },
    { label: 'Messages', id: 'messages', icon: MessageSquare },
  ];

  // Get color classes based on color prop
  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-50 text-primary-600',
      secondary: 'bg-secondary-50 text-secondary-600',
      success: 'bg-success-50 text-success-600',
      warning: 'bg-warning-50 text-warning-600',
      danger: 'bg-danger-50 text-danger-600',
      accent: 'bg-accent-50 text-accent-600',
    };
    return colorMap[color] || colorMap.primary;
  };

  // Get status badge styling
  const getStatusStyle = (status) => {
    const statusMap = {
      'Hiring': { variant: 'success', label: 'Hiring' },
      'Reviewing': { variant: 'warning', label: 'Reviewing' },
      'Closed': { variant: 'danger', label: 'Closed' },
    };
    return statusMap[status] || statusMap['Reviewing'];
  };

  // Filter postings based on search and status
  const filteredPostings = livePostings.filter((posting) => {
    const matchesSearch = (posting?.position || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || posting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get color for match score
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'accent';
    return 'warning';
  };

  // Get activity icon color based on type
  const getActivityIconColor = (type) => {
    const colorMap = {
      application: 'text-primary-600',
      interview: 'text-secondary-600',
      alert: 'text-warning-600',
      match: 'text-success-600',
    };
    return colorMap[type] || 'text-primary-600';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-gray-200 sticky top-0 transition-all duration-300 flex flex-col`}
      >
        {/* Logo Area */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="text-lg font-bold text-primary-600">InternMatch</h2>
              <p className="text-xs text-gray-500">Employer Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            // Navigation links for specific items
            if (item.path) {
              return (
                <Link key={item.id} href={item.path} className="w-full">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm">{item.label}</span>}
                  </button>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/employer/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Employer Portal</h3>
              <p className="text-sm text-gray-500">Manage your internship postings</p>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Last Activity: 2 hours ago</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <Avatar
                    src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                    name={user?.name || 'User'}
                    size="md"
                  />
                  <div className="hidden sm:flex flex-col items-start">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Loading...'}</p>
                    <p className="text-xs text-gray-500">{user?.companyName || 'Employer'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <Link href="/employer/profile" className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900">
                      Profile
                    </Link>
                    <Link href="/employer/settings" className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900">
                      Preferences
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto">
          {/* Loading State */}
          {loading && activeSection === 'overview' && (
            <div className="flex items-center justify-center h-full">
              <Card shadow="md" rounded="lg" padding="lg" className="text-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-12 h-12 text-primary-600 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900">Loading Dashboard</h3>
                  <p className="text-sm text-gray-600">Fetching your internship data from the server...</p>
                </div>
              </Card>
            </div>
          )}

          {/* Error State */}
          {error && activeSection === 'overview' && (
            <div className="p-6 md:p-8">
              <Card shadow="md" rounded="lg" padding="lg" className="border-l-4 border-danger-600 bg-danger-50">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-danger-900 mb-2">Failed to Load Dashboard</h3>
                    <p className="text-sm text-danger-700 mb-4">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-danger-600 text-white hover:bg-danger-700 rounded-lg px-4 py-2 transition-all"
                    >
                      Retry Loading Data
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'overview' && !loading && !error && (
            <div className="p-6 md:p-8 space-y-8">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                    Welcome back, {user?.name?.split(' ')[0] || 'Employer'}
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening with {user?.companyName || 'your'} internship postings today
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // Generate export data
                    const exportData = {
                      totalInternships: stats[0].value,
                      totalApplicants: stats[1].value,
                      skillMatches: stats[2].value,
                      interviews: stats[3].value,
                      postings: filteredPostings,
                      exportDate: new Date().toLocaleDateString(),
                    };
                    // Create CSV or PDF download
                    let csvContent = "Report Type,Employer Dashboard Statistics\n";
                    csvContent += `Export Date,${exportData.exportDate}\n\n`;
                    csvContent += "Metric,Value\n";
                    csvContent += `Total Internships Posted,${exportData.totalInternships}\n`;
                    csvContent += `Total Applicants,${exportData.totalApplicants}\n`;
                    csvContent += `Skill Matches,${exportData.skillMatches}\n`;
                    csvContent += `Interviews Scheduled,${exportData.interviews}\n\n`;

                    csvContent += "Internship Position,Status,Applicants,Expiry Date\n";
                    exportData.postings.forEach(p => {
                      csvContent += `"${p.position}","${p.status}",${p.candidates},"${p.expiry}"\n`;
                    });

                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
                    element.setAttribute('download', 'employer-dashboard-report.csv');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="hidden sm:flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-4 py-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  const colorClass = getColorClasses(stat.color);
                  const cardContent = (
                    <Card key={stat.id} shadow="sm" rounded="lg" padding="md" className={stat.id === 1 ? 'cursor-pointer hover:shadow-md transition-all border-primary-100' : ''}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl ${colorClass}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                          <div className="mt-2 flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success-600" />
                          <p className="text-xs text-gray-600">{stat.trend}</p>
                        </div>
                      </div>
                    </Card>
                  );

                  return stat.id === 1 ? (
                    <Link key={stat.id} href="/employer/internships">
                      {cardContent}
                    </Link>
                  ) : cardContent;
                })}
              </div>

              {/* Skill Demand vs Supply Chart */}
              <Card shadow="sm" rounded="lg" padding="md">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Skill Demand vs Supply</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Comparison of required skills in your postings vs available candidates
                  </p>
                </div>

                <div className="space-y-5">
                  {displaySkillAnalytics.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm">Post an internship to see skill analytics.</p>
                    </div>
                  ) : displaySkillAnalytics.map((skill, idx) => {
                    // Logic to calculate max for scaling bars
                    const maxRequested = Math.max(...displaySkillAnalytics.map(s => s.requested));
                    const maxAvailable = Math.max(...displaySkillAnalytics.map(s => s.available));
                    const maxValue = Math.max(maxRequested, maxAvailable, 1);

                    const requestedPercent = (skill.requested / maxValue) * 100;
                    const availablePercent = (skill.available / maxValue) * 100;
                    const matchColorClass = getColorClasses(getMatchScoreColor(skill.matchPercent));

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">{skill.skill}</h3>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${matchColorClass}`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-bold">{skill.matchPercent}% Match</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {/* Requested Bar */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Required</span>
                              <span className="text-xs font-semibold text-gray-900">{skill.requested}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${requestedPercent}%` }}
                              />
                            </div>
                          </div>
                          {/* Available Bar */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Available</span>
                              <span className="text-xs font-semibold text-gray-900">{skill.available}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-success-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${availablePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Top Matched Candidates + Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Matched Candidates - Featured Section */}
                <div className="lg:col-span-2">
                  <Card shadow="sm" rounded="lg" padding="md" className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-secondary-600" />
                        <h2 className="text-lg font-bold text-gray-900">Best Matches for You</h2>
                      </div>
                      <p className="text-sm text-gray-600">
                        Top candidates based on skill alignment with your requirements
                      </p>
                    </div>

                    <div className="space-y-4">
                      {topCandidates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No matched candidates yet. Create a posting to get matches.</div>
                      ) : topCandidates.map((candidate, idx) => (
                        <Card
                          key={candidate.id}
                          shadow="none"
                          rounded="lg"
                          padding="md"
                          className="bg-white border border-gray-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <Avatar
                              src={candidate.avatar}
                              name={candidate.name}
                              size="lg"
                            />

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                                  <p className="text-xs text-gray-600">{candidate.experience} experience</p>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${getColorClasses(getMatchScoreColor(candidate.matchScore))}`}>
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-sm font-bold">{candidate.matchScore}%</span>
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="flex flex-wrap gap-2">
                                {candidate.topSkills.map((skill, skillIdx) => (
                                  <Badge
                                    key={skillIdx}
                                    variant="secondary"
                                    size="sm"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                            <Link href={`/employer/candidates/${candidate.id}`}>
                              <Button
                                size="sm"
                                className="flex-1 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-all"
                              >
                                View Profile
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            >
                              Schedule
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Recent Activity Timeline */}
                <Card shadow="sm" rounded="lg" padding="md">
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-600" />
                      <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">No recent activity to show.</div>
                    ) : recentActivity.map((activity, idx) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <div key={activity.id} className="flex gap-3">
                          {/* Timeline dot and line */}
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full bg-gray-100 ${getActivityIconColor(activity.type)}`}>
                              <ActivityIcon className="w-4 h-4" />
                            </div>
                            {idx < recentActivity.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                            )}
                          </div>

                          {/* Activity Content */}
                          <div className="flex-1 pt-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {activity.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Live Postings Table with Search & Filters */}
              <Card shadow="sm" rounded="lg" padding="md">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Live Postings</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {filteredPostings.length} of {livePostings.length} positions
                      </p>
                    </div>
                    <Link href="/employer/internships/create">
                      <Button
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg hover:-translate-y-0.5 rounded-xl px-4 py-2 transition-all duration-200 font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        Post New Role
                      </Button>
                    </Link>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search positions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-white cursor-pointer"
                      >
                        <option>All</option>
                        <option>Hiring</option>
                        <option>Reviewing</option>
                        <option>Closed</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Table */}
                {filteredPostings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Position
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Candidates
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Views
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPostings.map((posting) => {
                          const statusStyle = getStatusStyle(posting.status);
                          return (
                            <tr
                              key={posting.id}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {posting.position}
                                  </p>
                                  <p className="text-xs text-indigo-600 font-medium">
                                    Expires {posting.expiry}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-semibold text-gray-900">
                                    {posting.candidates}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    {posting.views}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={statusStyle.variant} size="sm">
                                  {statusStyle.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => toggleStatus(posting.id)}
                                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                    title="Toggle Status"
                                  >
                                    <Power className="w-4 h-4" />
                                  </button>
                                  <Link href={`/employer/internships/${posting.id}/edit`}>
                                    <button
                                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(posting.id)}
                                    className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No positions found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Placeholder sections */}
          {activeSection !== 'overview' && (
            <div className="p-8">
              <Card shadow="md" rounded="lg" padding="lg">
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {activeSection === 'post' && 'Post New Internship'}
                    {activeSection === 'search' && 'Search Candidates'}
                    {activeSection === 'applications' && 'Applications'}
                    {activeSection === 'messages' && 'Messages'}
                  </h2>
                  <p className="text-gray-600">
                    This section is coming soon. Regular dashboard content will appear
                    here.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployerDashboard;

