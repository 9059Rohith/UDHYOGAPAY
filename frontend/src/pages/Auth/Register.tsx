import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { Alert } from '../../components/common/Alert';
import { submitWorkerApplication } from '../../services/workerApplicationService';
import { PROFESSIONS } from '../../utils/constants';
import mainLogo from '../../assets/main_logo.png';
import unityPeople from '../../assets/unity_people_holding_hands.png';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'worker',
    // Worker-specific fields
    profession: 'plumber',
    experience: 0,
    address: ''
  });
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password only for users
    if (formData.role === 'user') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    if (formData.phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    setLoading(true);

    try {
      if (formData.role === 'worker') {
        // Validate Aadhaar uploads
        if (!aadhaarFront || !aadhaarBack) {
          setError('Please upload both front and back images of your Aadhaar card');
          setLoading(false);
          return;
        }

        // Create FormData for file upload
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('personalEmail', formData.email);
        submitData.append('phone', formData.phone);
        submitData.append('profession', formData.profession);
        submitData.append('experience', formData.experience.toString());
        submitData.append('address', formData.address);
        submitData.append('aadhaarFront', aadhaarFront);
        submitData.append('aadhaarBack', aadhaarBack);

        // Submit worker application with Aadhaar files
        await submitWorkerApplication(submitData);
        
        // Navigate to pending approval page with email
        navigate(`/worker/pending-approval?email=${encodeURIComponent(formData.email)}`);
      } else {
        // Regular user registration
        const { confirmPassword, profession, experience, address, ...registerData } = formData;
        await register(registerData);
        navigate('/user/home');
      }
    } catch (err: any) {
      console.error('Registration error in component:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />
      
      {/* Clean Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 opacity-10">
        <img src={mainLogo} alt="decoration" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-15">
        <img src={unityPeople} alt="decoration" className="w-full h-full object-contain" />
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Join Udhyoga Pay today</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                placeholder="10 digit number"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Register As
              </label>
              <select
                id="role"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'worker' })}
              >
                <option value="user">User (Find Workers)</option>
                <option value="worker">Worker (Offer Services)</option>
              </select>
            </div>

            {/* Worker-specific fields */}
            {formData.role === 'worker' && (
              <>
                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  <select
                    id="profession"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  >
                    {PROFESSIONS.map((prof) => (
                      <option key={prof.value} value={prof.value}>
                        {prof.icon} {prof.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    type="number"
                    required
                    min="0"
                    max="50"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={2}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your current address"
                  />
                </div>

                <div>
                  <label htmlFor="aadhaarFront" className="block text-sm font-medium text-gray-700">
                    Aadhaar Card (Front) *
                  </label>
                  <input
                    id="aadhaarFront"
                    type="file"
                    required
                    accept="image/*"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAadhaarFront(e.target.files[0]);
                      }
                    }}
                  />
                  {aadhaarFront && (
                    <p className="mt-1 text-sm text-green-600">✓ {aadhaarFront.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="aadhaarBack" className="block text-sm font-medium text-gray-700">
                    Aadhaar Card (Back) *
                  </label>
                  <input
                    id="aadhaarBack"
                    type="file"
                    required
                    accept="image/*"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAadhaarBack(e.target.files[0]);
                      }
                    }}
                  />
                  {aadhaarBack && (
                    <p className="mt-1 text-sm text-green-600">✓ {aadhaarBack.name}</p>
                  )}
                </div>
              </>
            )}

            {/* Password fields only for users */}
            {formData.role === 'user' && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;
