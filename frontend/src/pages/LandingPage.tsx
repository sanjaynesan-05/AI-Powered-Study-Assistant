import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { AuthForms } from '../components/AuthForms';
import { ArrowRight, Users, BookOpen, Target, Star } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);

  const features = [
    {
      icon: Users,
      title: 'AI Mentorship',
      description: 'Get personalized career guidance from our advanced AI mentor'
    },
    {
      icon: BookOpen,
      title: 'Learning Paths',
      description: 'Structured learning journeys tailored to your goals'
    },
    {
      icon: Target,
      title: 'Smart Recommendations',
      description: 'Receive job and course recommendations based on your skills'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'ZENLEARN helped me transition from student to professional developer!',
      avatar: '👩‍💻'
    },
    {
      name: 'Mike Chen',
      role: 'Data Scientist',
      content: 'The AI mentor provided exactly the guidance I needed for my career.',
      avatar: '👨‍🔬'
    },
    {
      name: 'Emily Davis',
      role: 'UX Designer',
      content: 'Amazing platform! The learning paths are perfectly structured.',
      avatar: '👩‍🎨'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Students Helped' },
    { number: '500+', label: 'Career Paths' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 
                        bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <Logo size="md" />
        
        <div className="flex items-center space-x-2 sm:space-x-3 w-full justify-end">
          <ThemeToggle />
          <button
            onClick={() => setAuthModal('login')}
            className="px-4 py-2 sm:px-6 sm:py-2 border border-blue-500 text-blue-600 dark:text-blue-400 
                     rounded-lg font-medium hover:bg-blue-500 hover:text-white text-sm sm:text-base
                     transform hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 
                       bg-clip-text text-transparent leading-tight">
          Your Career Journey Starts Here
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl leading-relaxed px-2">
          Get personalized mentorship, build impressive resumes, and discover learning paths 
          that align with your career goals.
        </p>
        <button
          onClick={() => setAuthModal('login')}
          className="group flex items-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                   text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 
                   transform hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl text-sm sm:text-base"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl 
                         shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300
                         border border-gray-200/50 dark:border-gray-700/50 text-center group
                         relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 relative z-10">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm relative z-10">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800 dark:text-gray-200 px-2">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-xl sm:rounded-2xl 
                           shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-500
                           border border-gray-200/50 dark:border-gray-700/50 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 
                                rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 
                                group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800 dark:text-gray-200 px-2">
            What Our Users Say
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl 
                         shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300
                         border border-gray-200/50 dark:border-gray-700/50 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center space-x-3 mb-3 sm:mb-4 relative z-10">
                  <div className="text-xl sm:text-2xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic relative z-10 text-sm sm:text-base leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex text-yellow-400 mt-2 sm:mt-3 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white
                         hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 relative z-10 leading-tight">
              Ready to Transform Your Career?
            </h2>
            <p className="text-blue-100 mb-4 sm:mb-6 relative z-10 text-sm sm:text-base px-2">
              Join thousands of students and professionals who are already succeeding with K Mentor
            </p>
            <button
              onClick={() => setAuthModal('login')}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-blue-600 rounded-lg font-bold 
                       hover:bg-gray-100 transform hover:scale-105 transition-all duration-300
                       shadow-lg hover:shadow-xl relative z-10 text-sm sm:text-base"
            >
              Start Your Journey Today
            </button>
          </div>
        </div>
      </section>

      {/* Auth Modals - responsive and prevent overflow */}
      {authModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-2 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <AuthForms type={authModal} onClose={() => setAuthModal(null)} />
          </div>
        </div>
      )}
    </div>
  );
};