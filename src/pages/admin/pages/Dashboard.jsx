import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, UserCheck, Shield } from 'lucide-react';
import api from '@/api/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    completedProfiles: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Total Colleges',
      value: stats.totalColleges,
      icon: GraduationCap,
      description: 'Registered colleges',
      color: 'text-green-600'
    },
    {
      title: 'Completed Profiles',
      value: stats.completedProfiles,
      icon: UserCheck,
      description: 'Users with complete profiles',
      color: 'text-purple-600'
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: Shield,
      description: 'Administrator accounts',
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your InCampus platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              • Add new college
            </div>
            <div className="text-sm text-muted-foreground">
              • View user reports
            </div>
            <div className="text-sm text-muted-foreground">
              • Manage communities
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 