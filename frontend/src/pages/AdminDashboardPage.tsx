import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, BarChart2, Activity, UserCog } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  averageScore: number;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get<AdminStats>('/admin/stats/overview'),
          api.get<User[]>('/admin/users')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Failed to update user role");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <UserCog className="w-8 h-8 mr-3 text-purple-600" />
          Admin Control Panel
        </h1>
        <p className="text-gray-500 mt-1">Manage users and monitor platform analytics.</p>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-4 rounded-lg text-blue-600 mr-5">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Registered Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-purple-50 p-4 rounded-lg text-purple-600 mr-5">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Analyses Run</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalAnalyses ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-green-50 p-4 rounded-lg text-green-600 mr-5">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Global Avg ATS Score</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.averageScore ? stats.averageScore.toFixed(1) : '--'}</p>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-1.5 pl-3 pr-8 ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 font-medium' :
                        u.role === 'JOB_SEEKER' ? 'bg-gray-50 text-gray-700' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <option value="JOB_SEEKER">JOB SEEKER</option>
                      <option value="RECRUITER">RECRUITER</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
