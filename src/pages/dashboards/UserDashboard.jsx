import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Package,
  Clock,
  Award,
  LogOut,
  ShoppingBag,
  Wrench,
  Bell,
  User,
  Home,
  History,
  Gift,
  BookOpen,
  MapPin,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
  Lightbulb,
  BarChart2,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import PickupRequestModal from '../../components/PickupRequestModal';
import PickupHistory from '../../components/PickupHistory';
import Map from '../../components/Map';
import EducationalContent from '../../components/EducationalContent';
import RewardsSection from '../../components/RewardsSection';
import RepairRequestModal from '../../components/RepairRequestModal';
import RepairList from '../../components/RepairList';
import SmartScanner from '../../components/SmartScanner';
import ARRepairGuide from '../../components/ARRepairGuide';
import ImpactPet from '../../components/ImpactPet';
import Leaderboard from '../../components/Leaderboard';
import JourneyTracker from '../../components/JourneyTracker';

// Environmental impact tips
const ecoTips = [
  "Recycling one smartphone saves enough energy to power a laptop for 44 hours",
  "E-waste contains valuable materials like gold, silver, and rare earth metals that can be recovered",
  "Repairing devices extends their lifespan and reduces environmental impact",
  "Donating working electronics helps bridge the digital divide",
  "Proper e-waste disposal prevents toxic materials from entering landfills"
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeRepairs, setActiveRepairs] = useState(0);
  const [totalRecyclers, setTotalRecyclers] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);
  const [currentTip, setCurrentTip] = useState(0);
  const [pickupTrend, setPickupTrend] = useState(10); // Percentage increase from last month
  const [pointsTrend, setPointsTrend] = useState(15); // Percentage increase from last month
  const [repairsTrend, setRepairsTrend] = useState(-5); // Percentage decrease from last month
  const [totalWasteRecycled, setTotalWasteRecycled] = useState(0);
  const [upcomingPickups, setUpcomingPickups] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUser(profile);
            fetchActiveRepairs(authUser.id);
            fetchRecyclersCount();
            fetchTotalWasteRecycled(authUser.id);
            fetchUpcomingPickups(authUser.id);

            // Generate demo notifications
            setNotifications([
              {
                id: 1,
                title: 'Pickup Status Update',
                message: 'Your pickup request has been accepted',
                time: new Date(Date.now() - 3600000), // 1 hour ago
                read: false
              },
              {
                id: 2,
                title: 'Points Awarded',
                message: 'You earned 50 points for recycling',
                time: new Date(Date.now() - 86400000), // 1 day ago
                read: true
              },
              {
                id: 3,
                title: 'New Educational Content',
                message: 'Learn about proper battery disposal',
                time: new Date(Date.now() - 172800000), // 2 days ago
                read: true
              }
            ]);
            setHasNewNotifications(true);
          } else {
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();

    // Rotate eco tips every 10 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % ecoTips.length);
    }, 10000);

    // Handle window resize for sidebar
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(tipInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const fetchActiveRepairs = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('repair_requests')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['pending', 'assigned', 'diagnosing', 'repairing']);

      if (error) throw error;
      setActiveRepairs(data?.length || 0);
    } catch (error) {
      console.error('Error fetching active repairs:', error);
    }
  };

  const fetchRecyclersCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'recycler');

      if (error) throw error;
      setTotalRecyclers(data?.length || 0);
    } catch (error) {
      console.error('Error fetching recyclers count:', error);
    }
  };

  const fetchTotalWasteRecycled = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('quantity')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate total waste recycled in kg (assuming each item is ~2kg)
      const total = data?.reduce((sum, item) => sum + (item.quantity * 2), 0) || 0;
      setTotalWasteRecycled(total);
    } catch (error) {
      console.error('Error fetching total waste recycled:', error);
    }
  };

  const fetchUpcomingPickups = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setUpcomingPickups(data || []);
    } catch (error) {
      console.error('Error fetching upcoming pickups:', error);
    }
  };

  const handlePickupSuccess = () => {
    setShowPickupModal(false);
    setSuccessMessage('Pickup request submitted successfully!');
    setActiveTab('pickup-history');

    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const handleRepairSuccess = (repairData) => {
    setShowRepairModal(false);
    setSuccessMessage('Repair request submitted successfully! A technician will review your request shortly.');
    setActiveTab('repair-history');

    setActiveRepairs(prev => prev + 1);

    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setHasNewNotifications(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { id: 'pickup-history', label: 'Pickup History', icon: <History className="h-5 w-5" /> },
    { id: 'repair-history', label: 'Repair History', icon: <Wrench className="h-5 w-5" /> },
    { id: 'rewards', label: 'Rewards', icon: <Gift className="h-5 w-5" /> },
    { id: 'education', label: 'Educational Content', icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Top Navigation Bar - Glassmorphism */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              >
                {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="flex items-center group">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  E-Waste Manager
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                to="/marketplace"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Marketplace
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAllNotificationsAsRead();
                  }}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {hasNewNotifications && (
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50 transform origin-top-right transition-all duration-200">
                    <div className="py-3 px-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${notification.read ? '' : 'bg-emerald-50/50'}`}
                            >
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1.5 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-1 pr-3 rounded-full hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium shadow-sm">
                    {user?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.full_name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50 transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 gap-8">
        {/* Sidebar Navigation - Pill Style */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-transparent lg:block
            ${showSidebar ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'}
          `}
        >
          <div className="h-full flex flex-col lg:h-auto lg:sticky lg:top-24">
            <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setShowSidebar(false)} className="p-2 rounded-md text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setShowSidebar(false);
                  }}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full transition-all duration-200
                    ${activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                >
                  <span className={`mr-3 transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}

              {/* Eco Tip Card */}
              <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full bg-white/20 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -mb-2 -ml-2 h-16 w-16 rounded-full bg-black/10 blur-xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-300" />
                    </div>
                    <span className="ml-2 text-xs font-bold uppercase tracking-wider text-blue-100">Eco Tip</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white/90">
                    {ecoTips[currentTip]}
                  </p>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          {/* Overlay for mobile sidebar */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setShowSidebar(false)}
            ></div>
          )}

          {successMessage && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl shadow-sm flex items-center animate-fade-in-up">
              <div className="p-2 bg-emerald-100 rounded-full mr-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Welcome back, {user?.full_name?.split(' ')[0]}! 👋
                  </h1>
                  <p className="mt-1 text-gray-500">Here's what's happening with your eco-impact today.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200"
                  >
                    <Recycle className="h-4 w-4 mr-2 text-emerald-500" />
                    Smart Scan
                  </button>
                  <button
                    onClick={() => setShowAR(true)}
                    className="inline-flex items-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200"
                  >
                    <Wrench className="h-4 w-4 mr-2 text-blue-500" />
                    AR Guide
                  </button>
                  <button
                    onClick={() => setShowPickupModal(true)}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Schedule Pickup
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Pickup Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                      <Package className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pickupTrend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {pickupTrend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(pickupTrend)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold text-gray-900">{user?.pickups || 0}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Total Pickups</p>
                  </div>
                </div>

                {/* Repair Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                      <Wrench className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Active
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold text-gray-900">{activeRepairs}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Active Repairs</p>
                  </div>
                </div>

                {/* Points Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pointsTrend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {pointsTrend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(pointsTrend)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold text-gray-900">{user?.points || 0}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Reward Points</p>
                  </div>
                </div>

                {/* Marketplace Stats */}
                <Link to="/marketplace" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group block">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New Items
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold text-gray-900">Shop</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Visit Marketplace</p>
                  </div>
                </Link>
              </div>

              {/* Gamification & Community Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ImpactPet points={user?.points || 0} wasteRecycled={totalWasteRecycled} />
                </div>
                <div className="lg:col-span-2">
                  <Leaderboard />
                </div>
              </div>

              {/* Journey Tracker Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <JourneyTracker pickupId="12345" />
                {/* Map Section moved here to balance layout */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-500" />
                        Nearby Recyclers
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Find certified collection points near you</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full bg-gray-50 dark:bg-gray-900 relative min-h-[400px]">
                    <Map />
                  </div>
                </div>
              </div>

              {/* Impact Section - Premium Design */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                          <Leaf className="h-5 w-5 text-emerald-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-emerald-100">Your Environmental Impact</h2>
                      </div>
                      <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {totalWasteRecycled} <span className="text-emerald-300 text-2xl">kg recycled</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-200 mb-1">Next Goal: 100kg</p>
                      <div className="w-48 md:w-64 h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(100, (totalWasteRecycled / 100) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                      <p className="text-2xl font-bold text-white mb-1">{Math.round(totalWasteRecycled * 0.85)} kg</p>
                      <p className="text-sm text-emerald-200">CO₂ Emissions Saved</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                      <p className="text-2xl font-bold text-white mb-1">{Math.round(totalWasteRecycled * 0.4)} L</p>
                      <p className="text-sm text-emerald-200">Water Conserved</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                      <p className="text-2xl font-bold text-white mb-1">{Math.round(totalWasteRecycled * 0.25)} kg</p>
                      <p className="text-sm text-emerald-200">Metals Recovered</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Section Moved Up */}
            </div>
          )}

          {activeTab === 'pickup-history' && (
            <div className="animate-fade-in">
              <PickupHistory />
            </div>
          )}

          {activeTab === 'repair-history' && (
            <div className="animate-fade-in">
              <RepairList userRole="user" />
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="animate-fade-in">
              <RewardsSection />
            </div>
          )}

          {activeTab === 'education' && (
            <div className="animate-fade-in">
              <EducationalContent />
            </div>
          )}
        </main>
      </div>

      {showPickupModal && (
        <PickupRequestModal
          onClose={() => setShowPickupModal(false)}
          onSuccess={handlePickupSuccess}
        />
      )}

      {showRepairModal && (
        <RepairRequestModal
          onClose={() => setShowRepairModal(false)}
          onSuccess={handleRepairSuccess}
        />
      )}

      {showScanner && (
        <SmartScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={(item) => {
            setShowScanner(false);
            setSuccessMessage(`Identified: ${item}. Opening pickup request...`);
            setTimeout(() => setShowPickupModal(true), 1500);
          }}
        />
      )}

      {showAR && (
        <ARRepairGuide
          onClose={() => setShowAR(false)}
        />
      )}
    </div>
  );
}