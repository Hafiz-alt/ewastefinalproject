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
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PickupRequestModal from '../../components/PickupRequestModal';
import PickupHistory from '../../components/PickupHistory';
import Map from '../../components/Map';
import EducationalContent from '../../components/EducationalContent';
import RewardsSection from '../../components/RewardsSection';
import RepairRequestModal from '../../components/RepairRequestModal';
import RepairList from '../../components/RepairList';

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
  const [user, setUser] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
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
    setNotifications(prev => prev.map(notification => ({...notification, read: true})));
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <Recycle className="h-9 w-9 text-emerald-600 transition-transform duration-300 group-hover:rotate-45" />
                <span className="ml-2 text-xl font-bold text-gray-900">E-Waste Manager</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/marketplace"
                className="inline-flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Marketplace</span>
              </Link>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAllNotificationsAsRead();
                  }}
                  className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {hasNewNotifications && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="py-2 px-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-emerald-50'}`}
                            >
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User profile */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium">
                    {user?.full_name?.charAt(0) || <User className="h-5 w-5" />}
                  </div>
                  <span className="hidden sm:inline font-medium">{user?.full_name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showProfileMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
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

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Navigation (for larger screens) */}
        {showSidebar && (
          <aside className="w-64 bg-white shadow-md hidden lg:block">
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full transition-all ${
                      activeTab === item.id
                        ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`mr-3 ${
                      activeTab === item.id ? 'text-emerald-500' : 'text-gray-500 group-hover:text-gray-700'
                    }`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
              
              {/* Environmental Impact */}
              <div className="mt-8 px-3">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Your Impact
                </h3>
                <div className="mt-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">E-Waste Recycled</span>
                    <span className="text-sm font-bold text-emerald-600">{totalWasteRecycled} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (totalWasteRecycled / 100) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Goal: 100kg</p>
                </div>
              </div>
              
              {/* Eco Tip */}
              <div className="mt-6 mx-3 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-blue-800">Eco Tip</h4>
                    <p className="text-xs text-blue-700 mt-1">{ecoTips[currentTip]}</p>
                  </div>
                </div>
              </div>
            </nav>
          </aside>
        )}

        <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`${
                    activeTab === item.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap flex items-center pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg shadow-md flex items-center animate-fade-in">
              <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
              {successMessage}
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <button
                  onClick={() => setShowPickupModal(true)}
                  className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 transition-all duration-200 hover:shadow-xl group"
                >
                  <div className="p-5 bg-gradient-to-br from-white to-emerald-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-md p-3 shadow-md group-hover:scale-105 transition-transform">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center">
                        {pickupTrend > 0 ? (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">+{pickupTrend}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">{pickupTrend}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Schedule Pickup</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{user?.pickups || 0}</dd>
                      </dl>
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">Monthly Goal</div>
                          <div className="text-sm font-medium text-emerald-600">75%</div>
                        </div>
                        <div className="mt-1 overflow-hidden bg-gray-200 rounded-full h-2">
                          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowRepairModal(true)}
                  className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 transition-all duration-200 hover:shadow-xl group"
                >
                  <div className="p-5 bg-gradient-to-br from-white to-amber-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-shrink-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-md p-3 shadow-md group-hover:scale-105 transition-transform">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center">
                        {repairsTrend > 0 ? (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">+{repairsTrend}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">{repairsTrend}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Request Repair</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{activeRepairs}</dd>
                      </dl>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Active repairs</span>
                      </div>
                    </div>
                  </div>
                </button>
                
                <Link
                  to="/marketplace"
                  className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 transition-all duration-200 hover:shadow-xl group"
                >
                  <div className="p-5 bg-gradient-to-br from-white to-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-md p-3 shadow-md group-hover:scale-105 transition-transform">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+15%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Marketplace</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">Shop</dd>
                      </dl>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <BarChart2 className="h-4 w-4 mr-1" />
                        <span>Browse refurbished items</span>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 transition-all duration-200 hover:shadow-xl">
                  <div className="p-5 bg-gradient-to-br from-white to-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-md p-3 shadow-md">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center">
                        {pointsTrend > 0 ? (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">+{pointsTrend}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">{pointsTrend}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Reward Points</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{user?.points || 0}</dd>
                      </dl>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <Gift className="h-4 w-4 mr-1" />
                        <span>Redeem for rewards</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="mb-6 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Leaf className="h-5 w-5 text-emerald-500 mr-2" />
                      Your Environmental Impact
                    </h2>
                    <span className="text-sm text-emerald-600 font-medium">
                      {totalWasteRecycled} kg recycled
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(100, (totalWasteRecycled / 100) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-emerald-600">{Math.round(totalWasteRecycled * 0.85)} kg</p>
                      <p className="text-sm text-gray-600">CO₂ Emissions Saved</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-blue-600">{Math.round(totalWasteRecycled * 0.4)} L</p>
                      <p className="text-sm text-gray-600">Water Saved</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-amber-600">{Math.round(totalWasteRecycled * 0.25)} kg</p>
                      <p className="text-sm text-gray-600">Raw Materials Saved</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mb-6">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 text-emerald-500 mr-2" />
                      Nearby Recyclers
                      <span className="ml-2 text-sm font-normal text-gray-500">({totalRecyclers} total)</span>
                    </h2>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                        All
                      </button>
                      <button className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        E-Waste
                      </button>
                      <button className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Repair
                      </button>
                    </div>
                  </div>
                  <Map />
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></span>
                        <span className="text-gray-600 mr-4">E-Waste Collection</span>
                        
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                        <span className="text-gray-600">Repair Centers</span>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pickup-history' && (
            <PickupHistory />
          )}

          {activeTab === 'repair-history' && (
            <RepairList userRole="user" />
          )}

          {activeTab === 'rewards' && (
            <RewardsSection />
          )}

          {activeTab === 'education' && (
            <EducationalContent />
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
    </div>
  );
}