'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setSubscribeMessage(''), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Stay Updated with Internship Opportunities
          </h3>
          <p className="text-blue-100 mb-6">
            Subscribe to our newsletter for the latest internship postings and job market insights.
          </p>
          <form
            onSubmit={handleNewsletterSubscribe}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-3 rounded-lg text-gray-900 font-medium flex-1 sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300"
            >
              Subscribe
            </button>
          </form>
          {subscribeMessage && (
            <p className="text-white mt-3 font-medium">{subscribeMessage}</p>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <span className="text-white font-bold text-lg">IM</span>
              </div>
              <h4 className="text-xl font-bold text-white">InternMatch</h4>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Connecting talented students with great internship opportunities through AI-powered matching.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.5v8.5h2.5v-4.34c0-.55.49-1.03 1.04-1.04.58 0 1.05.5 1.05 1.04v4.34h2.5M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.68-1.68-1.68-.93 0-1.68.75-1.68 1.68s.75 1.68 1.68 1.68m1.39 9.94v-8.5H5.5v8.5h2.77z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-0.44 7-2v-1a4.44 4.44 0 00-1-3.48 4.37 4.37 0 00-.5-1.52z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1" />
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm-1-8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 8h-2v-3.5a1.5 1.5 0 0 0-3 0V17h-2v-7h2v1c.5-1 1.5-1.5 3-1.5s3 .5 3 3v4.5z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h5 className="text-lg font-bold text-white mb-4">For Students</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Browse Internships
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  My Applications
                </Link>
              </li>
              <li>
                <Link href="/career-advice" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Career Advice
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h5 className="text-lg font-bold text-white mb-4">For Employers</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/post-internship" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Post an Internship
                </Link>
              </li>
              <li>
                <Link href="/find-talent" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Find Talent
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/employer-guide" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Employer Guide
                </Link>
              </li>
              <li>
                <Link href="/company" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Company Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h5 className="text-lg font-bold text-white mb-4">Support & Legal</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-gray-400 hover:text-blue-400 transition duration-300">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800"></div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} InternMatch. All rights reserved. | Made with ❤️
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/sitemap" className="text-gray-500 hover:text-gray-300 transition duration-300">
              Sitemap
            </Link>
            <Link href="/status" className="text-gray-500 hover:text-gray-300 transition duration-300">
              System Status
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-300 transition duration-300">
              Report Issues
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
