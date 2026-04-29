import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, BarChart2, UploadCloud, PlusCircle, ArrowRight, Activity } from 'lucide-react';

interface RecentAnalysis {
  id: number;
  jobTitle: string;
  overallScore: number | null;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  resumesUploaded: number;
  recentAnalyses: RecentAnalysis[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats').then(res => setStats(res.data)).catch(() => { });
  }, []);


  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your resume analyses today.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Analysis
        </Link>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-4 rounded-lg text-blue-600 mr-5">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Analyses</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalAnalyses ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-green-50 p-4 rounded-lg text-green-600 mr-5">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Avg ATS Score</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.averageScore ? stats.averageScore.toFixed(1) : '--'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-purple-50 p-4 rounded-lg text-purple-600 mr-5">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Resumes Uploaded</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.resumesUploaded ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Main content section */}
      {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Job Title</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentAnalyses.map(a => (
                  <tr key={a.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.jobTitle}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{a.overallScore?.toFixed(1) ?? '--'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${a.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          a.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                            a.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link to={`/analysis/${a.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center transition-colors">
                        View Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 border-dashed p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No analyses yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Upload your first resume and a job description to get a comprehensive ATS compatibility score and AI-powered improvement recommendations.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Start First Analysis
          </Link>
        </div>
      )}
    </div>
  );
}
