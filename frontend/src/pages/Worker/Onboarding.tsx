// Page feature: drives the Onboarding screen and its user interactions.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PROFESSIONS } from '../../utils/constants';
import { Navbar } from '../../components/common/Navbar';
import { Alert } from '../../components/common/Alert';
import { Textarea } from '../../components/common/Textarea';

const WorkerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profession: 'plumber',
    experience: 0,
    description: '',
    aadhar: null as File | null,
    policeVerification: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'aadhar' | 'policeVerification') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.aadhar && !formData.policeVerification) {
      setError('Please upload at least one document');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('profession', formData.profession);
      data.append('experience', formData.experience.toString());
      if (formData.description) {
        data.append('description', formData.description);
      }

      if (formData.aadhar) {
        data.append('aadhar', formData.aadhar);
      }

      if (formData.policeVerification) {
        data.append('policeVerification', formData.policeVerification);
      }

      await api.post('/workers/kyc', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('KYC documents uploaded successfully! Awaiting admin approval.');
      navigate('/worker/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Worker KYC Verification</h1>
            <p className="text-gray-600 mt-2">Upload your documents to get verified</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession
              </label>
              <select
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {PROFESSIONS.map((prof) => (
                  <option key={prof.value} value={prof.value}>
                    {prof.icon} {prof.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You / Skills (Optional)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your skills, experience, and why you'd be a great worker..."
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhar Card (PDF/Image)
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange(e, 'aadhar')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.aadhar && (
                <p className="mt-2 text-sm text-green-600">✓ {formData.aadhar.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police Verification Certificate (PDF/Image)
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange(e, 'policeVerification')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.policeVerification && (
                <p className="mt-2 text-sm text-green-600">✓ {formData.policeVerification.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Submit KYC Documents'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WorkerOnboarding;
