import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analysisService } from '../services/analysisService';

interface AnalysisData {
  id: number;
  overallScore: number;
  skillMatchScore: number;
  experienceRelevanceScore: number;
  keywordOptimizationScore: number;
  resumeStructureScore: number;
  aiFeedbackScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  aiAnalysis: string;
  status: string;
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = () => {
      analysisService.getResult(Number(id)).then(res => {
        setData(res.data);
        setLoading(false);
      });
    };
    fetchData();
    const interval = setInterval(() => {
      if (data?.status === 'PENDING' || data?.status === 'PROCESSING') {
        fetchData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, data?.status]);

  if (loading) return <p>Loading analysis...</p>;
  if (!data) return <p>Analysis not found.</p>;

  if (data.status === 'PENDING' || data.status === 'PROCESSING') {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Analyzing your resume...</h2>
        <p className="text-gray-500 mt-2">This may take a moment while our AI evaluates your resume.</p>
      </div>
    );
  }

  if (data.status === 'FAILED') {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-red-600 text-xl font-semibold">Analysis Failed</p>
        <p className="text-gray-500 mt-2">Something went wrong. Please try again.</p>
      </div>
    );
  }

  const scoreBar = (label: string, score: number) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{score?.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Analysis Result</h1>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-sm text-gray-500 uppercase">Overall ATS Score</p>
        <p className="text-5xl font-bold text-blue-600 mt-2">{data.overallScore?.toFixed(1)}</p>
        <p className="text-gray-500 mt-1">/ 100</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
        {scoreBar('Skill Match (45%)', data.skillMatchScore)}
        {scoreBar('Experience Relevance (20%)', data.experienceRelevanceScore)}
        {scoreBar('Keyword Optimization (15%)', data.keywordOptimizationScore)}
        {scoreBar('Resume Structure (10%)', data.resumeStructureScore)}
        {scoreBar('AI Feedback (10%)', data.aiFeedbackScore)}
      </div>

      {data.matchedSkills?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Matched Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.matchedSkills.map(s => (
              <span key={s} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>
      )}

      {data.missingSkills?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Missing Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.missingSkills.map(s => (
              <span key={s} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>
      )}

      {data.recommendations?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
