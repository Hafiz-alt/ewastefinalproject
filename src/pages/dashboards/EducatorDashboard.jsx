import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Recycle, 
  BookOpen, 
  Users, 
  BarChart2, 
  LogOut,
  PenTool,
  Eye,
  ThumbsUp,
  Clock,
  Plus,
  Edit,
  Trash2,
  Bell,
  ChevronDown,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Award,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import CreateContentModal from '../../components/CreateContentModal';

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const [educator, setEducator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewContentModal, setShowNewContentModal] = useState(false);
  const [contentList, setContentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    activeUsers: 0,
    engagement: 0,
    trends: {
      views: [150, 220, 280, 250, 300, 320, 350],
      users: [80, 120, 150, 140, 160, 180, 200],
      engagement: [20, 35, 45, 40, 50, 55, 60]
    }
  });

  useEffect(() => {
    checkEducator();
    fetchDashboardData();
    
    // Subscribe to new content interactions
    const channel = supabase
      .channel('content_interactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'educational_content'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add notification for new content
            const notification = {
              id: Date.now(),
              title: 'New Content Published',
              message: `Your article "${payload.new.title}" has been published.`,
              time: new Date(),
              read: false
            };
            setNotifications(prev => [notification, ...prev]);
            setHasNewNotifications(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkEducator = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'educator') {
        navigate('/login');
        return;
      }

      setEducator(profile);
    } catch (error) {
      console.error('Error checking educator:', error);
      navigate('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data: content, error: contentError } = await supabase
        .from('educational_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      setContentList(content || []);
      setStats(prev => ({
        ...prev,
        totalContent: content?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentCreated = (newContent) => {
    setContentList(prev => [newContent, ...prev]);
    setStats(prev => ({
      ...prev,
      totalContent: prev.totalContent + 1
    }));
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('educational_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setContentList(prev => prev.filter(content => content.id !== contentId));
      
      // Show success message
      const notification = {
        id: Date.now(),
        title: 'Content Deleted',
        message: 'The educational content has been deleted successfully.',
        type: 'success',
        time: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const filteredContent = contentList.filter(content => {
    if (searchTerm) {
      return content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             content.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

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
      <nav className="bg-white shadow-sm">
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
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative"
                >
                  <Bell className="h-6 w-6" />
                  {hasNewNotifications && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-2 px-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-emerald-50'}`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(notification.time), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-medium">
                      {educator?.full_name?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{educator?.full_name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={() => navigate('/login')}
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

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                  <BookOpen className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Published Content</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalContent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+15%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                  <ThumbsUp className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-3%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.engagement}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Educational Content</h2>
              <button
                onClick={() => setShowNewContentModal(true)}
                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Content
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="divide-y divide-gray-200">
            {filteredContent.map((content) => (
              <div key={content.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(content.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {Math.floor(Math.random() * 1000)} views
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {Math.floor(Math.random() * 50)} comments
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => {/* Handle edit */}}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(content.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredContent.length === 0 && (
              <div className="p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new piece of content.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showNewContentModal && (
        <CreateContentModal
          onClose={() => setShowNewContentModal(false)}
          onSuccess={handleContentCreated}
        />
      )}
    </div>
  );
}