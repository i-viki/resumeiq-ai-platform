import { useState } from 'react';
import { resumeService, jobService, analysisService } from '../services/analysisService';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const resumeRes = await resumeService.upload(file);
      const jobRes = await jobService.analyze({ title: jobTitle, company, description: jobDescription });
      const evalRes = await analysisService.evaluate({
        resumeId: resumeRes.data.id,
        jobDescriptionId: jobRes.data.id,
      });
      navigate(`/analysis/${evalRes.data.analysisId}`);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analyze Resume</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Resume</h2>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {file ? (
                <>
                  <FileText className="w-10 h-10 text-blue-500 mb-3" />
                  <p className="text-sm text-gray-700 font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to choose a different file</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, or TXT</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="sr-only"
              required
            />
          </label>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Job Description</h2>
          <input type="text" placeholder="Job Title" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
            className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)}
            className="w-full border rounded px-3 py-2" />
          <textarea placeholder="Paste the full job description..." value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 h-40" required />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>
    </div>
  );
}
