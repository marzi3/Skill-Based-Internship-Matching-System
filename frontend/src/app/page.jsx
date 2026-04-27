'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Search, Users, Building, ShieldCheck, Code, PenTool } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading, getRoleDashboard } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="InternMatch Logo" className="h-12 w-auto object-contain" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:inline">
                  InternMatch
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/find-internships" className="text-gray-600 hover:text-indigo-600 transition-colors">Find Internships</Link>
              <Link href="/employers" className="text-gray-600 hover:text-indigo-600 transition-colors">For Employers</Link>
              {authLoading ? (
                <div className="w-20 h-10 rounded-full bg-gray-100 animate-pulse" />
              ) : user ? (
                <Link href={getRoleDashboard(user.role)} className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-black transition-all shadow-lg shadow-gray-200">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-900 font-medium hover:text-indigo-600 transition-colors">Sign In</Link>
                  <Link href="/register" className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-black transition-all shadow-lg shadow-gray-200">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50/50 to-white -z-10"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-200/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex absolute top-[15%] left-[10%] items-center justify-center p-4 bg-white shadow-xl shadow-indigo-100/50 rounded-2xl border border-indigo-50 z-0"
        >
          <Code className="text-indigo-500 w-8 h-8" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0], x: [0, -10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden md:flex absolute top-[40%] right-[10%] items-center justify-center p-4 bg-white shadow-xl shadow-purple-100/50 rounded-2xl border border-purple-50 z-20"
        >
          <PenTool className="text-purple-500 w-8 h-8" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="hidden md:flex absolute bottom-[25%] left-[20%] items-center justify-center p-4 bg-indigo-50 rounded-xl opacity-70"
        >
          <div className="w-5 h-5 rounded-md bg-indigo-400"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
              The #1 Platform for Verified Student Internships
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Launch your career with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">verified skills.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with top employers who value your real abilities.
              Our skill-based matching system ensures you find the perfect internship fit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center">
                Employer Login
              </Link>
            </div>
          </motion.div>

          {/* Stats/Social Proof */}
          <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {['Google', 'Microsoft', 'Spotify', 'Airbnb'].map((brand) => (
              <div key={brand} className="flex items-center justify-center text-xl font-bold text-gray-500">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose InternMatch?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We're revolutionizing the internship market by prioritizing verified skills over connections.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: "Verified Identity", desc: "Every student and employer is verified to ensure a safe, scam-free environment." },
              { icon: Search, title: "Smart Matching", desc: "Our algorithm matches you with roles that fit your specific skill set and career goals." },
              { icon: Building, title: "Top Companies", desc: "Access opportunities from verified startups to Fortune 500 companies." }
            ].map((feature, i) => (
              <motion.div
                whileHover={{ y: -10 }}
                key={i}
                className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How InternMatch Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Get hired for what you know, not who you know. Three simple steps to your next opportunity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
            {/* Desktop connecting line (hidden on mobile) */}
            <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-0.5 bg-indigo-100 z-0"></div>

            {[
              { step: "1", title: "Build Your Profile", desc: "Create an account and verify your identity and educational background via our secure portal." },
              { step: "2", title: "Complete Assessments", desc: "Take skill-specific tests to prove your proficiency in your chosen domain." },
              { step: "3", title: "Get Matched", desc: "Employers receive your anonymized, verified skill profile and reach out directly." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-indigo-50 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to find your perfect fit?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of students and hundreds of companies already using InternMatch to build the future workforce.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-4 rounded-full bg-white text-indigo-600 font-bold text-lg hover:bg-gray-50 transition-all shadow-lg text-center">
              Student Registration
            </Link>
            <Link href="/employers" className="px-8 py-4 rounded-full bg-indigo-700 text-white font-bold text-lg hover:bg-indigo-800 transition-all border border-indigo-500 text-center">
              Post an Internship
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="InternMatch Logo" className="h-10 w-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              <span className="text-2xl font-bold">InternMatch</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">© 2026 InternMatch Inc. All rights reserved.</p>
          </div>
          <div className="flex space-x-8">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}