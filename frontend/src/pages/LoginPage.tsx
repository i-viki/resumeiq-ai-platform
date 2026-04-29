import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authService.login({ email, password });
      login(data);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border transition-colors bg-gray-50 hover:bg-white" 
                    placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border transition-colors bg-gray-50 hover:bg-white" 
                    placeholder="••••••••" />
                </div>
              </div>

              <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]">
                  Sign in
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Image/Gradient banner */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900">
        <div className="absolute inset-0 flex flex-col justify-center px-16 lg:px-24 text-white">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight">ResumeIQ</h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed font-light">
              Supercharge your job search with AI-powered resume analysis. Get instant feedback, ATS scoring, and actionable recommendations.
            </p>
            <div className="space-y-6">
              {[
                'Instant ATS Compatibility Scoring',
                'Tailored Job Description Matching',
                'Actionable AI Skill Gap Analysis'
              ].map((feature, i) => (
                <div key={i} className="flex items-center text-blue-50">
                  <CheckCircle2 className="h-6 w-6 mr-4 text-blue-400 flex-shrink-0" />
                  <span className="text-lg font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
