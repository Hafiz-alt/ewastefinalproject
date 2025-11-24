import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Recycle, 
  Wrench, 
  Clock, 
  CheckCircle, 
  LogOut, 
  Bell, 
  Search,
  User,
  ChevronDown,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Tablet,
  HardDrive,
  AlertTriangle,
  Filter,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import RepairList from '../../components/RepairList';

// Map device types to appropriate icons
const deviceIcons = {
  'Smartphone': <Smartphone className="h-5 w-5" />,
  'Laptop': <Laptop className="h-5 w-5" />,
  'Desktop': <HardDrive className="h-5 w-5" />,
  'Tablet': <Tablet className="h-5 w-5" />,
  'Monitor': <Monitor className="h-5 w-5" />,
  'Printer': <Printer className="h-5 w-5" />,
  'Other': <Wrench className="h-5 w-5" />
};

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [technician, setTechnician] = useState({
    name: 'Loading...',
    activeRepairs: 0,
    completedToday: 0,
    totalRepairs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);

  useEffect(() => {
    fetchTechnicianData();
    fetchRepairs();
    
    // Subscribe to new repair requests
    const channel = supabase
      .channel('repair_requests_insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'repair_requests'
        },
        (payload) => {
          // Add notification
          const newNotification = {
            id: Date.now(),
            title: 'New Repair Request',
            message: `New ${payload.new.device_type} repair request from ${payload.new.user_name || 'a customer'}`,
            time: new Date(),
            read: false
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setHasNewNotifications(true);
          
          // Play notification sound (commented out as the file might not exist)
          // new Audio('/notification.mp3').play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Apply filters and search
    if (!repairs.length) return;
    
    let result = [...repairs];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(repair => repair.status === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(repair => 
        (repair.device_type && repair.device_type.toLowerCase().includes(term)) ||
        (repair.device_model && repair.device_model.toLowerCase().includes(term)) ||
        (repair.issue_description && repair.issue_description.toLowerCase().includes(term)) ||
        (repair.user_name && repair.user_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredRepairs(result);
  }, [repairs, filter, searchTerm]);

  const fetchTechnicianData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Get technician profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();
        
      if (profile?.role !== 'technician') {
        navigate('/login');
        return;
      }

      // Get repair statistics
      const { data: activeRepairs } = await supabase
        .from('repair_requests')
        .select('id')
        .eq('technician_id', user.id)
        .in('status', ['assigned', 'diagnosing', 'repairing']);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: completedToday } = await supabase
        .from('repair_requests')
        .select('id')
        .eq('technician_id', user.id)
        .eq('status', 'completed')
        .gte('updated_at', today.toISOString());

      const { data: totalRepairs } = await supabase
        .from('repair_requests')
        .select('id')
        .eq('technician_id', user.id)
        .eq('status', 'completed');

      setTechnician({
        name: profile?.full_name || 'Technician',
        activeRepairs: activeRepairs?.length || 0,
        completedToday: completedToday?.length || 0,
        totalRepairs: totalRepairs?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching technician data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRepairs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from('repair_requests')
        .select(`
          *,
          technician:profiles!technician_id(full_name)
        `)
        .order('created_at', { ascending: false });

      // For technicians, show repairs assigned to them and pending repairs
      query = query.or(`technician_id.eq.${user.id},status.eq.pending`);

      const { data, error } = await query;

      if (error) throw error;
      setRepairs(data || []);
      setFilteredRepairs(data || []);
    } catch (error) {
      console.error('Error fetching repairs:', error);
    }
  };

  const handleStatusUpdate = async (repairId, newStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const repair = repairs.find(r => r.id === repairId);
      const updateData = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If status is changing to assigned, set the technician_id
      if (newStatus === 'assigned' && repair?.technician_id === null) {
        updateData.technician_id = user.id;
      }

      const { error } = await supabase
        .from('repair_requests')
        .update(updateData)
        .eq('id', repairId);

      if (error) throw error;

      // Update local state
      const updatedRepairs = repairs.map(repair =>
        repair.id === repairId
          ? { 
              ...repair, 
              status: newStatus, 
              updated_at: new Date().toISOString(),
              technician_id: updateData.technician_id || repair.technician_id
            }
          : repair
      );
      
      setRepairs(updatedRepairs);
      
      // Refresh statistics
      fetchTechnicianData();
    } catch (error) {
      console.error('Error updating repair status:', error);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({...notification, read: true})));
    setHasNewNotifications(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Recycle className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">E-Waste Manager</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAllNotificationsAsRead();
                  }}
                  className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative"
                >
                  <Bell className="h-6 w-6" />
                  {hasNewNotifications && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                                {new Date(notification.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
              
              {/* Profile dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span>{technician.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showProfileMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
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
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage repair requests and track your performance
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Repairs</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{technician.activeRepairs}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="text-sm font-medium text-blue-600">{technician.activeRepairs > 0 ? '25%' : '0%'}</div>
                </div>
                <div className="mt-1 overflow-hidden bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: technician.activeRepairs > 0 ? '25%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{technician.completedToday}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  {technician.completedToday > 0 ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Great job today!
                    </span>
                  ) : (
                    <span>No repairs completed yet today</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Repairs</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{technician.totalRepairs}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span>Lifetime completed repairs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repair Requests */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Repair Requests</h2>
            
            {/* Search and filters */}
            <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by device, issue, or customer..."
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex space-x-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      filter === 'all' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      filter === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter('assigned')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      filter === 'assigned' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Assigned
                  </button>
                  <button
                    onClick={() => setFilter('diagnosing')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      filter === 'diagnosing' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Diagnosing
                  </button>
                  <button
                    onClick={() => setFilter('repairing')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      filter === 'repairing' 
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Repairing
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      filter === 'completed' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
            
            {/* Repair list */}
            <div className="space-y-4">
              {filteredRepairs.length > 0 ? (
                filteredRepairs.map((repair) => (
                  <div
                    key={repair.id}
                    className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${
                      repair.status === 'pending' ? 'border-l-4 border-yellow-400' : 
                      repair.status === 'assigned' ? 'border-l-4 border-blue-400' : 
                      repair.status === 'diagnosing' ? 'border-l-4 border-purple-400' : 
                      repair.status === 'repairing' ? 'border-l-4 border-indigo-400' : 
                      repair.status === 'completed' ? 'border-l-4 border-green-400' : 
                      'border-gray-200'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center mb-3 sm:mb-0">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              {deviceIcons[repair.device_type] || <Wrench className="h-5 w-5 text-emerald-600" />}
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {repair.device_type} {repair.device_model && `- ${repair.device_model}`}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                repair.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                                repair.status === 'diagnosing' ? 'bg-purple-100 text-purple-800' : 
                                repair.status === 'repairing' ? 'bg-indigo-100 text-indigo-800' : 
                                repair.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                repair.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                <span className="capitalize">{repair.status}</span>
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                From: {repair.user_name || 'Customer'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {repair.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(repair.id, 'assigned')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                              Accept Request
                            </button>
                          )}
                          {repair.status === 'assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(repair.id, 'diagnosing')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              Start Diagnosis
                            </button>
                          )}
                          {repair.status === 'diagnosing' && (
                            <button
                              onClick={() => handleStatusUpdate(repair.id, 'repairing')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Start Repair
                            </button>
                          )}
                          {repair.status === 'repairing' && (
                            <button
                              onClick={() => handleStatusUpdate(repair.id, 'completed')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Mark Completed
                            </button>
                          )}
                          <Link
                            to={`/repair/${repair.id}`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Issue Description</h4>
                          <p className="mt-1 text-sm text-gray-900 line-clamp-2">{repair.issue_description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Customer Address</h4>
                          <p className="mt-1 text-sm text-gray-900 line-clamp-2">{repair.address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Requested {new Date(repair.created_at).toLocaleDateString()}
                        </div>
                        {repair.estimated_completion && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Est. completion: {new Date(repair.estimated_completion).toLocaleDateString()}
                          </div>
                        )}
                        {repair.estimated_cost && (
                          <div className="text-sm font-medium text-emerald-600">
                            Est. cost: ${repair.estimated_cost}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No repair requests found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search or filters'
                      : filter !== 'all'
                        ? `No ${filter} repair requests found`
                        : 'New repair requests will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}