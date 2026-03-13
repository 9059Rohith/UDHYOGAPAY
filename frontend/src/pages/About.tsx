// Page feature: drives the About screen and its user interactions.
import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Users, Target, Award, Heart } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-yellow-600 to-green-600 bg-size-200 animate-gradient pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 animate-fade-in-up">
              About {APP_NAME}
            </h1>
            <p className="text-xl text-green-50 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Connecting skilled workers with those who need them - Building a better future together
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                At {APP_NAME}, we believe that finding skilled workers should be easy, fast, and reliable. 
                Our platform connects users with verified professionals in their area, making home services 
                accessible to everyone.
              </p>
              <p className="text-lg text-gray-600">
                We're committed to empowering workers by providing them with a platform to showcase their 
                skills and grow their business, while giving users peace of mind through our verification 
                process.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 animate-fade-in-up animation-delay-200">
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">10K+</h3>
                <p className="text-gray-600">Active Users</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">5K+</h3>
                <p className="text-gray-600">Verified Workers</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">50K+</h3>
                <p className="text-gray-600">Jobs Completed</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">98%</h3>
                <p className="text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Trust & Safety',
                desc: 'Every worker undergoes rigorous verification to ensure your safety and peace of mind.',
                icon: '🛡️',
              },
              {
                title: 'Transparency',
                desc: 'Clear pricing, honest reviews, and open communication between users and workers.',
                icon: '💎',
              },
              {
                title: 'Empowerment',
                desc: 'Helping workers grow their business and providing users with reliable services.',
                icon: '💪',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
              Built with ❤️ in India
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're a team of passionate individuals dedicated to making home services accessible 
              and affordable for everyone. Join us in building a better future!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(-50px, -20px) scale(1.05); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-2000 { animation-delay: 2s; }
        .bg-size-200 { background-size: 200% 200%; }
      `}</style>

      <Footer />
    </div>
  );
};

export default About;
