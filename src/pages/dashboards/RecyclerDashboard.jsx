import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Package,
  Truck,
  BarChart2,
  LogOut,
  Bell,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Sliders,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Car,
  RefreshCw,
  Plus,
  Map,
  Factory,
  PieChart,
  Briefcase
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays, isToday, isThisWeek } from 'date-fns';
import RouteOptimizer from '../../components/recycler/RouteOptimizer';
import FleetManager from '../../components/recycler/FleetManager';
import FacilityInventory from '../../components/recycler/FacilityInventory';
import RecyclerAnalytics from '../../components/recycler/RecyclerAnalytics';
import B2BMarketplace from '../../components/recycler/B2BMarketplace';

// Mini chart component for metrics cards
const MiniChart = ({ data, color }) => {
  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value / maxValue) * 80);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-12 w-full mt-2">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value / maxValue) * 80);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="white"
              stroke={color}
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
};

// Weather widget component
const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temp: 24,
    condition: 'Sunny',
    icon: <Sun className="h-8 w-8 text-amber-500" />
  });

  // In a real app, you would fetch actual weather data
  useEffect(() => {
    // Simulate different weather conditions
    const conditions = [
      { temp: 24, condition: 'Sunny', icon: <Sun className="h-8 w-8 text-amber-500" /> },
      { temp: 22, condition: 'Cloudy', icon: <Cloud className="h-8 w-8 text-gray-500" /> },
      { temp: 18, condition: 'Rainy', icon: <CloudRain className="h-8 w-8 text-blue-500" /> },
      { temp: 26, condition: 'Stormy', icon: <Zap className="h-8 w-8 text-amber-600" /> }
    ];

    setWeather(conditions[Math.floor(Math.random() * conditions.length)]);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Today's Weather</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{weather.temp}°C</p>
          <p className="text-sm text-gray-600">{weather.condition}</p>
        </div>
        {weather.icon}
      </div>
    </div>
  );
};

// Vehicle status component
const VehicleStatus = () => {
  const vehicles = [
    { id: 1, name: 'Truck 01', status: 'available', lastService: '2025-02-15' },
    { id: 2, name: 'Van 03', status: 'on_route', lastService: '2025-01-28' },
    { id: 3, name: 'Truck 02', status: 'maintenance', lastService: '2025-03-01' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Vehicle Status</h3>
      <div className="space-y-2">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{vehicle.name}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
              vehicle.status === 'on_route' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
              {vehicle.status === 'available' ? 'Available' :
                vehicle.status === 'on_route' ? 'On Route' :
                  'Maintenance'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RecyclerDashboard() {
  const navigate = useNavigate();
  const [recycler, setRecycler] = useState({
    name: 'Green Recycling Co.',
    collectionsToday: 12,
    pendingPickups: 8,
    totalCollections: 156,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New pickup request from John Doe', time: new Date(), read: false },
    { id: 2, message: 'Pickup #1234 has been completed', time: subDays(new Date(), 1), read: true },
    { id: 3, message: 'Vehicle maintenance scheduled for tomorrow', time: subDays(new Date(), 2), read: true }
  ]);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [collectionTrends] = useState({
    today: [5, 8, 12, 10, 15, 12, 14],
    pending: [3, 5, 8, 7, 10, 8, 8],
    total: [120, 128, 135, 142, 148, 152, 156]
  });
  const [trendPercentages] = useState({
    today: 15,
    pending: -5,
    total: 8
  });

  useEffect(() => {
    fetchPickupRequests();

    // Subscribe to new pickup requests
    const channel = supabase
      .channel('pickup_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pickup_requests'
        },
        (payload) => {
          setPickupRequests(current => [payload.new, ...current]);

          // Add notification
          const newNotification = {
            id: Date.now(),
            message: `New pickup request from ${payload.new.user_name || 'a customer'}`,
            time: new Date(),
            read: false
          };

          setNotifications(prev => [newNotification, ...prev]);
          setHasNewNotifications(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      // Get user profile to check if they're a recycler
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'recycler') {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickupRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('pickup_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setPickupRequests(current =>
        current.map(request =>
          request.id === requestId
            ? { ...request, status: newStatus, updated_at: new Date().toISOString() }
            : request
        )
      );

      // Add notification
      const newNotification = {
        id: Date.now(),
        message: `Pickup request #${requestId.slice(0, 4)} updated to ${newStatus}`,
        time: new Date(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);
      setHasNewNotifications(true);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setHasNewNotifications(false);
  };

  const toggleExpandRequest = (id) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  const filteredRequests = pickupRequests.filter(request => {
    // Apply filter
    if (filter === 'today' && !isToday(new Date(request.created_at))) return false;
    if (filter === 'week' && !isThisWeek(new Date(request.created_at))) return false;

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.items?.toLowerCase().includes(searchLower) ||
        request.address?.toLowerCase().includes(searchLower) ||
        request.user_name?.toLowerCase().includes(searchLower) ||
        request.notes?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortBy === 'status') {
      return sortOrder === 'desc'
        ? b.status.localeCompare(a.status)
        : a.status.localeCompare(b.status);
    }
    if (sortBy === 'location') {
      return sortOrder === 'desc'
        ? b.address.localeCompare(a.address)
        : a.address.localeCompare(b.address);
    }
    return 0;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-10 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg shadow-md">
                <Recycle className="h-8 w-8 text-white transform transition-transform hover:rotate-45 duration-300" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">E-Waste Manager</span>
                <div className="flex items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{recycler.name}</span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">Partner</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Weather widget toggle */}
              <button
                className={`p-1 rounded-full ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                aria-label="Weather"
              >
                <Sun className="h-6 w-6" />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1 rounded-full ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAllNotificationsAsRead();
                  }}
                  className={`p-1 rounded-full ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative`}
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {hasNewNotifications && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className={`origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-20`}>
                    <div className={`py-2 px-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${notification.read ? '' : darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}
                            >
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{notification.message}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                {format(new Date(notification.time), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`px-4 py-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-2 ${darkMode ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'} focus:outline-none`}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showProfileMenu && (
                  <div className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 focus:outline-none z-20`}>
                    <div className="py-1">
                      <Link to="/profile" className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        Your Profile
                      </Link>
                      <Link to="/settings" className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        Settings
                      </Link>
                      <Link to="/login" className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        Sign out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Navigation */}
        <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'logistics'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Map className="h-4 w-4 mr-2" />
            Logistics & Fleet
          </button>
          <button
            onClick={() => setActiveTab('facility')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'facility'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Factory className="h-4 w-4 mr-2" />
            Facility & Inventory
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'analytics'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'b2b'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            B2B Market
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-lg rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 hover:shadow-xl group`}>
                <div className="p-5 bg-gradient-to-br from-transparent to-emerald-50 dark:to-emerald-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-shrink-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-md p-3 shadow-md group-hover:scale-105 transition-transform">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center">
                      {trendPercentages.today > 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+{trendPercentages.today}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">{trendPercentages.today}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <dl>
                      <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>Collections Today</dt>
                      <dd className={`mt-1 text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{recycler.collectionsToday}</dd>
                    </dl>
                    <MiniChart data={collectionTrends.today} color="#10b981" />
                    <div className="mt-1 text-xs text-gray-500">Last 7 days</div>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-lg rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 hover:shadow-xl group`}>
                <div className="p-5 bg-gradient-to-br from-transparent to-amber-50 dark:to-amber-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-shrink-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-md p-3 shadow-md group-hover:scale-105 transition-transform">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center">
                      {trendPercentages.pending > 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+{trendPercentages.pending}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">{trendPercentages.pending}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <dl>
                      <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>Pending Pickups</dt>
                      <dd className={`mt-1 text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{recycler.pendingPickups}</dd>
                    </dl>
                    <MiniChart data={collectionTrends.pending} color="#f59e0b" />
                    <div className="mt-1 text-xs text-gray-500">Last 7 days</div>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-lg rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 hover:shadow-xl group`}>
                <div className="p-5 bg-gradient-to-br from-transparent to-blue-50 dark:to-blue-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-shrink-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-md p-3 shadow-md group-hover:scale-105 transition-transform">
                      <BarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center">
                      {trendPercentages.total > 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+{trendPercentages.total}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">{trendPercentages.total}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <dl>
                      <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>Total Collections</dt>
                      <dd className={`mt-1 text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{recycler.totalCollections}</dd>
                    </dl>
                    <MiniChart data={collectionTrends.total} color="#3b82f6" />
                    <div className="mt-1 text-xs text-gray-500">Last 7 days</div>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-lg rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 hover:shadow-xl`}>
                <div className="p-5">
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Quick Tools</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center p-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-xs">Schedule</span>
                      </button>
                      <button className="flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span className="text-xs">Sync</span>
                      </button>
                    </div>
                    <WeatherWidget />
                    <VehicleStatus />
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Requests */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 mb-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 md:mb-0`}>Pickup Requests</h2>

                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} h-5 w-5`} />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md focus:ring-emerald-500 focus:border-emerald-500 w-full`}
                    />
                  </div>

                  {/* Filter buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'all'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : `${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border hover:bg-gray-200`
                        }`}
                    >
                      All Requests
                    </button>
                    <button
                      onClick={() => setFilter('today')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'today'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : `${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border hover:bg-gray-200`
                        }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setFilter('week')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'week'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : `${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border hover:bg-gray-200`
                        }`}
                    >
                      This Week
                    </button>
                  </div>

                  {/* Sort dropdown */}
                  <div className="relative">
                    <button
                      className={`flex items-center px-3 py-2 border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'} rounded-md hover:bg-gray-50`}
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      <span className="text-sm">Sort</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : sortedRequests.length > 0 ? (
                <div className="space-y-4">
                  {sortedRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${request.status === 'pending' ? 'border-l-4 border-yellow-400' :
                        request.status === 'accepted' ? 'border-l-4 border-blue-400' :
                          request.status === 'completed' ? 'border-l-4 border-green-400' :
                            'border-l-4 border-red-400'
                        }`}
                    >
                      <div className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="flex-shrink-0 mr-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                request.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                                  request.status === 'completed' ? 'bg-green-100 text-green-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                {request.status === 'pending' ? <Clock className="h-6 w-6" /> :
                                  request.status === 'accepted' ? <Truck className="h-6 w-6" /> :
                                    request.status === 'completed' ? <CheckCircle className="h-6 w-6" /> :
                                      <XCircle className="h-6 w-6" />}
                              </div>
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Pickup Request from {request.user_name || 'Customer'}
                              </h3>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                                  {getStatusIcon(request.status)}
                                  <span className="ml-1 capitalize">{request.status}</span>
                                </span>
                                <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {format(new Date(request.created_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <select
                              value={request.status}
                              onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                              className={`rounded-md px-3 py-1.5 text-sm font-medium ${darkMode ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-700 border-gray-300'} border shadow-sm focus:ring-emerald-500 focus:border-emerald-500`}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                              onClick={() => toggleExpandRequest(request.id)}
                              className={`p-1.5 rounded-md ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              {expandedRequest === request.id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Basic info - always visible */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-start gap-2">
                            <Package className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} />
                            <div>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Items</p>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{request.items}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quantity: {request.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} />
                            <div>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pickup Address</p>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{request.address}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Mail className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} />
                            <div>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact</p>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{request.user_email || 'No email provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {expandedRequest === request.id && (
                          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                {request.notes && (
                                  <div className="mb-4">
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Notes</p>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{request.notes}</p>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2 mt-4">
                                  <button className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-sm hover:bg-emerald-200 transition-colors">
                                    <Calendar className="h-4 w-4 mr-1.5" />
                                    Schedule Pickup
                                  </button>
                                  <button className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors">
                                    <Phone className="h-4 w-4 mr-1.5" />
                                    Contact Customer
                                  </button>
                                  <button className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors">
                                    <XCircle className="h-4 w-4 mr-1.5" />
                                    Cancel Request
                                  </button>
                                </div>
                              </div>

                              <div className="bg-gray-100 rounded-lg p-2 h-40 flex items-center justify-center">
                                <div className="text-center">
                                  <MapPin className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Map view would appear here</p>
                                  <p className="text-xs text-gray-500">Showing pickup location</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <Package className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>No pickup requests</h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    New requests will appear here when users schedule pickups.
                  </p>
                </div>
              )}
            </div>

            {/* Environmental Impact */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Environmental Impact</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-emerald-50'} rounded-lg p-4`}>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>E-Waste Collected</h3>
                  <p className="text-2xl font-bold text-emerald-600">1,250 kg</p>
                  <div className="mt-2 flex items-center text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>12% increase from last month</span>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg p-4`}>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>CO₂ Emissions Saved</h3>
                  <p className="text-2xl font-bold text-blue-600">875 kg</p>
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>8% increase from last month</span>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-4`}>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Recycling Efficiency</h3>
                  <p className="text-2xl font-bold text-amber-600">94%</p>
                  <div className="mt-2 flex items-center text-sm text-amber-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>3% increase from last month</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-8">
            <RouteOptimizer />
            <FleetManager />
          </div>
        )}

        {activeTab === 'facility' && (
          <FacilityInventory />
        )}

        {activeTab === 'analytics' && (
          <RecyclerAnalytics />
        )}

        {activeTab === 'b2b' && (
          <B2BMarketplace />
        )}
      </main>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-6 w-6 text-white" />
        </button>
      </div>
    </div >
  );
}

// Moon icon component for dark mode toggle
function Moon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

// ChevronUp icon component
function ChevronUp({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
}