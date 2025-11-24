import React, { useState, useEffect } from 'react';
import { 
  BarChart,
  LineChart,
  PieChart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Scale,
  Wrench,
  ShoppingBag,
  BookOpen,
  Users,
  AlertTriangle
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Line, Pie } from 'react-chartjs-2';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const dateRanges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Last Year', value: '1y' },
  { label: 'All Time', value: 'all' }
];

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [stats, setStats] = useState({
    totalWaste: 0,
    totalRepairs: 0,
    totalSales: 0,
    totalContent: 0,
    activeUsers: 0,
    trends: {
      waste: 0,
      repairs: 0,
      sales: 0,
      content: 0
    }
  });
  const [chartData, setChartData] = useState({
    repairsByType: null,
    salesByCategory: null,
    contentEngagement: null,
    wasteOverTime: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'all':
          startDate = new Date(0);
          break;
      }

      // Fetch total e-waste recycled
      const { data: wasteData, error: wasteError } = await supabase
        .from('pickup_requests')
        .select('quantity, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      if (wasteError) throw wasteError;

      // Fetch repairs data
      const { data: repairsData, error: repairsError } = await supabase
        .from('repair_requests')
        .select('device_type, status, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      if (repairsError) throw repairsError;

      // Fetch marketplace data
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(full_name),
          seller:profiles!orders_seller_id_fkey(full_name),
          product:products(*)
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      if (salesError) throw salesError;

      // Fetch educational content data
      const { data: contentData, error: contentError } = await supabase
        .from('educational_content')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (contentError) throw contentError;

      // Get active users count
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id')
        .gt('updated_at', subMonths(new Date(), 1).toISOString());

      if (activeUsersError) throw activeUsersError;

      // Calculate total waste recycled
      const totalWaste = wasteData.reduce((sum, item) => sum + (item.quantity || 0), 0);

      // Calculate trends
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      const { data: previousWasteData } = await supabase
        .from('pickup_requests')
        .select('quantity')
        .eq('status', 'completed')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const previousWaste = previousWasteData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const wasteTrend = previousWaste ? ((totalWaste - previousWaste) / previousWaste) * 100 : 0;

      // Calculate other trends similarly
      const { data: previousRepairsData } = await supabase
        .from('repair_requests')
        .select('id')
        .eq('status', 'completed')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const repairsTrend = previousRepairsData ? 
        ((repairsData.length - previousRepairsData.length) / previousRepairsData.length) * 100 : 0;

      const { data: previousSalesData } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'completed')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const salesTrend = previousSalesData ?
        ((salesData.length - previousSalesData.length) / previousSalesData.length) * 100 : 0;

      // Prepare chart data
      const repairsByType = prepareRepairsByTypeData(repairsData);
      const salesByCategory = prepareSalesByCategoryData(salesData);
      const contentEngagement = await prepareContentEngagementData(contentData);
      const wasteOverTime = prepareWasteOverTimeData(wasteData);

      // Fetch recent activity
      const recentActivity = await fetchRecentActivity();

      setStats({
        totalWaste,
        totalRepairs: repairsData.length,
        totalSales: salesData.length,
        totalContent: contentData.length,
        activeUsers: activeUsersData.length,
        trends: {
          waste: wasteTrend,
          repairs: repairsTrend,
          sales: salesTrend,
          content: 0 // Calculate this if you track content engagement
        }
      });

      setChartData({
        repairsByType,
        salesByCategory,
        contentEngagement,
        wasteOverTime
      });

      setRecentActivity(recentActivity);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    const [pickups, repairs, orders, content] = await Promise.all([
      supabase
        .from('pickup_requests')
        .select('*, user:profiles!pickup_requests_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('repair_requests')
        .select('*, user:profiles!repair_requests_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('orders')
        .select('*, buyer:profiles!orders_buyer_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('educational_content')
        .select('*, author:profiles!educational_content_author_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Combine and sort activities
    const activities = [
      ...(pickups.data || []).map(p => ({
        type: 'pickup',
        title: 'New Pickup Request',
        user: p.user?.full_name,
        date: p.created_at,
        details: `${p.quantity} items for pickup`
      })),
      ...(repairs.data || []).map(r => ({
        type: 'repair',
        title: 'New Repair Request',
        user: r.user?.full_name,
        date: r.created_at,
        details: `${r.device_type} repair`
      })),
      ...(orders.data || []).map(o => ({
        type: 'order',
        title: 'New Marketplace Order',
        user: o.buyer?.full_name,
        date: o.created_at,
        details: `Order #${o.id.slice(0, 8)}`
      })),
      ...(content.data || []).map(c => ({
        type: 'content',
        title: 'New Educational Content',
        user: c.author?.full_name,
        date: c.created_at,
        details: c.title
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    return activities;
  };

  const prepareRepairsByTypeData = (data) => {
    const deviceTypes = {};
    data.forEach(repair => {
      deviceTypes[repair.device_type] = (deviceTypes[repair.device_type] || 0) + 1;
    });

    return {
      labels: Object.keys(deviceTypes),
      datasets: [{
        data: Object.values(deviceTypes),
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#6366f1'
        ]
      }]
    };
  };

  const prepareSalesByCategoryData = (data) => {
    const categories = {};
    data.forEach(order => {
      const category = order.product?.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#6366f1'
        ]
      }]
    };
  };

  const prepareContentEngagementData = async (data) => {
    // Fetch actual engagement metrics from the database
    const { data: engagementData, error } = await supabase
      .from('content_engagement')
      .select('views, likes, comments, shares')
      .in('content_id', data.map(c => c.id));

    if (error) {
      console.error('Error fetching content engagement:', error);
      return {
        labels: ['Views', 'Likes', 'Comments', 'Shares'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#8b5cf6',
            '#ec4899'
          ]
        }]
      };
    }

    const totals = engagementData.reduce((acc, curr) => ({
      views: (acc.views || 0) + (curr.views || 0),
      likes: (acc.likes || 0) + (curr.likes || 0),
      comments: (acc.comments || 0) + (curr.comments || 0),
      shares: (acc.shares || 0) + (curr.shares || 0)
    }), {});

    return {
      labels: ['Views', 'Likes', 'Comments', 'Shares'],
      datasets: [{
        data: [
          totals.views || 0,
          totals.likes || 0,
          totals.comments || 0,
          totals.shares || 0
        ],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
          '#ec4899'
        ]
      }]
    };
  };

  const prepareWasteOverTimeData = (data) => {
    const months = {};
    data.forEach(item => {
      const monthYear = format(new Date(item.created_at), 'MMM yyyy');
      months[monthYear] = (months[monthYear] || 0) + (item.quantity || 0);
    });

    return {
      labels: Object.keys(months),
      datasets: [{
        label: 'E-Waste Collected (kg)',
        data: Object.values(months),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const downloadCSV = (data, filename) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('No valid data provided for CSV download');
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const downloadPDF = async () => {
    try {
      setExportLoading(true);
      
      const doc = new jsPDF();
      
      // Add title and date
      doc.setFontSize(20);
      doc.text('E-Waste Management Analytics Report', 15, 20);
      
      doc.setFontSize(12);
      doc.text(`Report Period: ${dateRanges.find(r => r.value === dateRange)?.label}`, 15, 30);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 15, 38);
      
      // Add key metrics
      doc.setFontSize(16);
      doc.text('Key Metrics Summary', 15, 50);
      
      doc.setFontSize(11);
      doc.text(`• Total E-Waste Recycled: ${stats.totalWaste} kg`, 20, 60);
      doc.text(`• Total Repairs Completed: ${stats.totalRepairs}`, 20, 68);
      doc.text(`• Marketplace Sales: ${stats.totalSales}`, 20, 76);
      doc.text(`• Educational Content Created: ${stats.totalContent}`, 20, 84);
      doc.text(`• Active Users: ${stats.activeUsers}`, 20, 92);
      
      // Recent activity table
      doc.setFontSize(16);
      doc.text('Recent Activity', 15, 105);
      
      const tableData = recentActivity.map(activity => [
        format(new Date(activity.date), 'yyyy-MM-dd'),
        activity.title,
        activity.user || 'Unknown',
        activity.details
      ]);
      
      doc.autoTable({
        head: [['Date', 'Activity', 'User', 'Details']],
        body: tableData,
        startY: 110,
        margin: { top: 10 }
      });
      
      doc.save(`ewaste_analytics_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => downloadCSV(recentActivity, 'activity_report')}
            disabled={!recentActivity?.length}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={downloadPDF}
            disabled={!recentActivity?.length || exportLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className={`h-4 w-4 mr-2 ${exportLoading ? 'animate-spin' : ''}`} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Scale className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total E-Waste</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalWaste} kg</p>
              </div>
            </div>
            <div className={`flex items-center ${stats.trends.waste >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trends.waste >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(stats.trends.waste).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Repairs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRepairs}</p>
              </div>
            </div>
            <div className={`flex items-center ${stats.trends.repairs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trends.repairs >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(stats.trends.repairs).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Marketplace Sales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
            <div className={`flex items-center ${stats.trends.sales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trends.sales >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(stats.trends.sales).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* E-Waste Collection Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">E-Waste Collection Trend</h3>
        <div className="h-64">
          {chartData.wasteOverTime && (
            <Line 
              data={chartData.wasteOverTime}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount in kg'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repairs by Device Type */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Repairs by Device Type</h3>
          <div className="h-64">
            {chartData.repairsByType && (
              <Pie 
                data={chartData.repairsByType}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Marketplace Sales by Category</h3>
          <div className="h-64">
            {chartData.salesByCategory && (
              <Bar 
                data={chartData.salesByCategory}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Content Engagement */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Educational Content Engagement</h3>
          <div className="h-64">
            {chartData.contentEngagement && (
              <Bar 
                data={chartData.contentEngagement}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'pickup' ? 'bg-emerald-100 text-emerald-600' :
                    activity.type === 'repair' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'order' ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {activity.type === 'pickup' ? <Scale className="h-5 w-5" /> :
                     activity.type === 'repair' ? <Wrench className="h-5 w-5" /> :
                     activity.type === 'order' ? <ShoppingBag className="h-5 w-5" /> :
                     <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <span className="text-sm text-gray-500">
                        {format(new Date(activity.date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.user} - {activity.details}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
}