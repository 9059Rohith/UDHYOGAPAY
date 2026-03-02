import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, KPICard, Badge } from '../../components/design-system';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeWorkers: number;
  activeUsers: number;
  completedBookings: number;
  pendingBookings: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  averageRating: number;
  topServices: Array<{ name: string; count: number; revenue: number }>;
  recentActivity: Array<any>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  bookingsByStatus: Record<string, number>;
  workerPerformance: Array<{ name: string; bookings: number; revenue: number; rating: number }>;
}

const ExecutiveDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard/stats?range=${dateRange}`);
      setStats (response.data);
    } catch (error: any) {
      showToast({ message: 'Failed to load dashboard statistics', type: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/admin/dashboard/export?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast({ message: `Report exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (error) {
      showToast({ message: 'Failed to export report', type: 'error' });
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time insights and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="all">All time</option>
          </select>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportData('csv')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
              >
                Export as CSV
              </button>
              <button
                onClick={() => exportData('excel')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                Export as Excel
              </button>
              <button
                onClick={() => exportData('pdf')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          color="green"
          trend={{ value: stats.revenueGrowth, isPositive: stats.revenueGrowth > 0, label: 'vs last period' }}
          sparklineData={stats.revenueByMonth?.map(m => m.revenue) || []}
        />
        
        <KPICard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={Calendar}
          color="blue"
          trend={{ value: stats.bookingsGrowth, isPositive: stats.bookingsGrowth > 0, label: 'vs last period' }}
        />
        
        <KPICard
          title="Active Workers"
          value={stats.activeWorkers}
          icon={Briefcase}
          color="purple"
        />
        
        <KPICard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {stats.revenueByMonth && stats.revenueByMonth.length > 0 ? (
                <div className="w-full h-full flex items-end justify-around gap-2">
                  {stats.revenueByMonth.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer"
                        style={{
                          height: `${(item.revenue / Math.max(...stats.revenueByMonth.map(m => m.revenue))) * 100}%`
                        }}
                        title={`₹${item.revenue.toLocaleString()}`}
                      />
                      <span className="text-xs text-gray-600">{item.month}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No revenue data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.bookingsByStatus || {}).map(([status, count]) => {
                const total = Object.values(stats.bookingsByStatus).reduce((a, b) => a + b, 0);
                const percentage = ((count / total) * 100).toFixed(1);
                
                const colorMap: Record<string, string> = {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-blue-500',
                  in_progress: 'bg-purple-500',
                  completed: 'bg-green-500',
                  cancelled: 'bg-red-500'
                };

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colorMap[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Bookings</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topServices?.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{service.name}</td>
                    <td className="text-right py-3 px-4 text-gray-600">{service.count}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold">
                      ₹{service.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Worker Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Performing Workers</CardTitle>
            <Badge variant="info">{stats.workerPerformance?.length || 0} Workers</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.workerPerformance?.map((worker, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{worker.name}</h4>
                  <Badge variant="success">#{index + 1}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bookings:</span>
                    <span className="font-medium">{worker.bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">₹{worker.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      {worker.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <CardTitle>Live Activity Feed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity?.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;
