import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TechnicianSidebar from '../../components/technician/TechnicianSidebar';
import RepairKanban from '../../components/technician/RepairKanban';
import AIDiagnostics from '../../components/technician/AIDiagnostics';
import PartsInventory from '../../components/technician/PartsInventory';
import TechnicianAnalytics from '../../components/technician/TechnicianAnalytics';
import { Bell, Search, Filter } from 'lucide-react';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [technician, setTechnician] = useState({ name: 'Loading...' });
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchTechnicianData();
    fetchRepairs();

    // Subscribe to new repair requests
    const channel = supabase
      .channel('repair_requests_insert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'repair_requests' }, (payload) => {
        const newNotification = {
          id: Date.now(),
          title: 'New Repair Request',
          message: `New ${payload.new.device_type} repair request`,
          time: new Date(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTechnicianData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'technician') { navigate('/login'); return; }

      setTechnician({ name: profile?.full_name || 'Technician' });
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
        .select(`*, technician:profiles!technician_id(full_name)`)
        .order('created_at', { ascending: false })
        .or(`technician_id.eq.${user.id},status.eq.pending`);

      const { data, error } = await query;
      if (error) throw error;
      setRepairs(data || []);
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

      if (newStatus === 'assigned' && repair?.technician_id === null) {
        updateData.technician_id = user.id;
      }

      const { error } = await supabase.from('repair_requests').update(updateData).eq('id', repairId);
      if (error) throw error;

      setRepairs(repairs.map(r => r.id === repairId ? { ...r, ...updateData } : r));
    } catch (error) {
      console.error('Error updating repair status:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <TechnicianSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        technicianName={technician.name}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64 text-sm"
              />
            </div>
            <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                  <p className="text-emerald-100 text-sm font-medium mb-1">Active Repairs</p>
                  <h3 className="text-3xl font-bold">{repairs.filter(r => ['assigned', 'diagnosing', 'repairing'].includes(r.status)).length}</h3>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mb-1">Completed Today</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {repairs.filter(r => r.status === 'completed' && new Date(r.updated_at).toDateString() === new Date().toDateString()).length}
                  </h3>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mb-1">Pending Requests</p>
                  <h3 className="text-3xl font-bold text-gray-900">{repairs.filter(r => r.status === 'pending').length}</h3>
                </div>
              </div>

              {/* Recent Activity / Kanban Preview */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Workflow</h3>
                <RepairKanban repairs={repairs} onStatusUpdate={handleStatusUpdate} />
              </div>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="h-[calc(100vh-12rem)]">
              <RepairKanban repairs={repairs} onStatusUpdate={handleStatusUpdate} />
            </div>
          )}

          {activeTab === 'diagnostics' && <AIDiagnostics />}

          {activeTab === 'inventory' && <PartsInventory />}

          {activeTab === 'analytics' && <TechnicianAnalytics />}
        </div>
      </div>
    </div>
  );
}