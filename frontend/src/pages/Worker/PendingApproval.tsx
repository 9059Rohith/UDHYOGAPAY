// Page feature: drives the PendingApproval screen and its user interactions.
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Clock, Mail, CheckCircle } from 'lucide-react';

const PendingApproval: React.FC = () => {
  const [searchParams] = useSearchParams();
  const registeredEmail = searchParams.get('email') || 'your registered email';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Animated Clock Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6">
                <Clock size={64} className="text-white animate-spin-slow" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6"></div>

            {/* Status Message */}
            <p className="text-xl text-gray-700 mb-8">
              Your worker application is under review
            </p>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <CheckCircle size={40} className="text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Submitted</h3>
                <p className="text-sm text-blue-700">
                  Your application has been received
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-400">
                <Clock size={40} className="text-yellow-600 mx-auto mb-3 animate-pulse" />
                <h3 className="font-semibold text-yellow-900 mb-2">Under Review</h3>
                <p className="text-sm text-yellow-700">
                  Admin is verifying your details
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <Mail size={40} className="text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Email Notification</h3>
                <p className="text-sm text-green-700">
                  You'll receive login credentials
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-left mb-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">What happens next?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                  <span>Our admin team will review your application and verify all submitted documents</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                  <span>Once approved, you will receive an email with your work credentials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                  <span>Use the provided email (e.g., worker1@udhyogapay.com) and password to login</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
                  <span>Start accepting bookings and earning money!</span>
                </li>
              </ul>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-left mb-6">
              <p className="text-sm text-yellow-800 mb-3">
                <strong>📧 Check Your Email:</strong> Once approved, you will receive your login credentials via email.
              </p>
              <p className="text-sm text-yellow-800 font-semibold">
                Email: {registeredEmail}
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                ⏰ <strong>Approval Time:</strong> 24-48 hours | 📁 <strong>Check spam folder</strong> if you don't see the email in your inbox.
              </p>
            </div>

            {/* Estimated Time */}
            <div className="text-gray-600 mb-6">
              <p className="text-sm">
                <strong>Estimated Review Time:</strong> 24-48 hours
              </p>
            </div>

            {/* Contact Support */}
            <div className="text-center">
              <p className="text-gray-600 mb-2">Have questions?</p>
              <a 
                href="mailto:support@udhyogapay.com" 
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PendingApproval;
