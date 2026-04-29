import api from './api';

export const resumeService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const jobService = {
  analyze: (data: { title: string; company: string; description: string }) =>
    api.post('/job/analyze', data),
};

export const analysisService = {
  evaluate: (data: { resumeId: number; jobDescriptionId: number }) =>
    api.post('/score/evaluate', data),
  getResult: (id: number) => api.get(`/analysis/${id}`),
};
