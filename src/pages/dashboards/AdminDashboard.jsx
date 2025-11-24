import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Recycle, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Filter,
  Trash2,
  UserPlus,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart2,
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorBoundary from '../../components/ErrorBoundary';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import jsPDF from 'jspdf';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchUsers();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile?.role !== 'admin') {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      setError('Error verifying admin access');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action, userId) => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        
        setUsers(current => current.filter(user => user.id !== userId));
        
        const newNotification = {
          id: Date.now(),
          message: 'User removed successfully',
          type: 'success',
          time: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
        setHasNewNotifications(true);
      } else if (action === 'update' && selectedUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            role: selectedUser.role,
            full_name: selectedUser.full_name
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        setShowUserModal(false);
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      const newNotification = {
        id: Date.now(),
        message: `Error: ${error.message || 'Something went wrong'}`,
        type: 'error',
        time: new Date()
      };
      setNotifications(prev => [newNotification, ...prev]);
      setHasNewNotifications(true);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Error signing out');
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();

      const { data: ewasteData, error: ewasteError } = await supabase
        .from('ewaste_records')
        .select('amount')
        .gte('created_at', startDate)
        .lt('created_at', endDate);
      if (ewasteError) throw ewasteError;
      const totalAmount = ewasteData.reduce((sum, record) => sum + record.amount, 0);

      const { data: newUsers, error: newUsersError } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', startDate)
        .lt('created_at', endDate);
      if (newUsersError) throw newUsersError;
      const newUserCount = newUsers.length;

      const doc = new jsPDF();
      const formattedMonth = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      doc.setFontSize(16);
      doc.text(`Monthly Report - ${formattedMonth}`, 10, 10);
      doc.setFontSize(12);
      doc.text(`Total e-waste collected: ${totalAmount} kg`, 10, 20);
      doc.text(`New users: ${newUserCount}`, 10, 30);
      doc.save(`report_${selectedMonth}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Error generating report');
    } finally {
      setIsGenerating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <Recycle className="h-8 w-8 text-emerald-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Admin Dashboard</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <BarChart2 className="h-5 w-5 mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Users className="h-5 w-5 mr-2" />
                Users
              </button>
            </nav>
          </div>

          {activeTab === 'analytics' ? (
            <div>
              <div className="mb-4 flex items-center space-x-4">
                <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
                  Select Month:
                </label>
                <input
                  type="month"
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className={`px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
              <AnalyticsDashboard selectedMonth={selectedMonth} />
            </div>
          ) : (
            <>
              {/* Search and filters */}
              <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Users</option>
                      <option value="recycler">Recyclers</option>
                      <option value="technician">Technicians</option>
                      <option value="educator">Educators</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* User list */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .filter(user => {
                          if (filter !== 'all' && user.role !== filter) return false;
                          if (searchTerm) {
                            const searchLower = searchTerm.toLowerCase();
                            return (
                              user.full_name?.toLowerCase().includes(searchLower) ||
                              user.email?.toLowerCase().includes(searchLower)
                            );
                          }
                          return true;
                        })
                        .map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'recycler' ? 'bg-green-100 text-green-800' :
                                user.role === 'technician' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'educator' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-900 mr-3"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUserAction('delete', user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Edit User Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedUser.full_name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="user">User</option>
                    <option value="recycler">Recycler</option>
                    <option value="technician">Technician</option>
                    <option value="educator">Educator</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUserAction('update')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}