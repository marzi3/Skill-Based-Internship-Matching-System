'use client';

import { useState } from 'react';
import Header from '../components/common/Header';

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <>
      <Header />
      <main className="min-h-screen p-8 md:p-12 transition-colors duration-300 bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 text-gray-900" data-theme={theme === 'dark' ? 'dark' : 'light'}>
      
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4 flex gap-3 z-50 p-3 rounded-lg shadow-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <button
          onClick={() => setTheme('light')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${theme === 'light' ? 'shadow-md' : ''}`}
          style={{ 
            backgroundColor: theme === 'light' ? 'var(--primary-color)' : 'var(--bg-tertiary)',
            color: theme === 'light' ? 'var(--text-white)' : 'var(--text-secondary)'
          }}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${theme === 'dark' ? 'shadow-md' : ''}`}
          style={{ 
            backgroundColor: theme === 'dark' ? 'var(--primary-color)' : 'var(--bg-tertiary)',
            color: theme === 'dark' ? 'var(--text-white)' : 'var(--text-secondary)'
          }}
        >
          🌙 Dark
        </button>
      </div>

      {/* Dashboard Navigation Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>Choose Your Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <a href="/student/dashboard" className="flex flex-col items-center justify-center p-8 rounded-lg shadow-sm border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg no-underline" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <div className="text-5xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Student Dashboard</h3>
            <p className="text-center mb-0" style={{ color: 'var(--text-secondary)' }}>Find and apply for internship opportunities</p>
          </a>
          <a href="/employer/dashboard" className="flex flex-col items-center justify-center p-8 rounded-lg shadow-sm border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg no-underline" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Employer Dashboard</h3>
            <p className="text-center mb-0" style={{ color: 'var(--text-secondary)' }}>Post internships and manage applications</p>
          </a>
          <a href="/admin/dashboard" className="flex flex-col items-center justify-center p-8 rounded-lg shadow-sm border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg no-underline" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <div className="text-5xl mb-4">👨‍💼</div>
            <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h3>
            <p className="text-center mb-0" style={{ color: 'var(--text-secondary)' }}>Manage platform and users</p>
          </a>
        </div>
      </section>

      {/* Color Palette Preview */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Theme Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-24 rounded-lg shadow-md border transition-transform hover:scale-105" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--border-color)' }}></div>
            <span className="font-medium text-center text-sm" style={{ color: 'var(--text-primary)' }}>Primary</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-24 rounded-lg shadow-md border transition-transform hover:scale-105" style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--border-color)' }}></div>
            <span className="font-medium text-center text-sm" style={{ color: 'var(--text-primary)' }}>Secondary</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-24 rounded-lg shadow-md border transition-transform hover:scale-105" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--border-color)' }}></div>
            <span className="font-medium text-center text-sm" style={{ color: 'var(--text-primary)' }}>Accent</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-24 rounded-lg shadow-md border transition-transform hover:scale-105" style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--border-color)' }}></div>
            <span className="font-medium text-center text-sm" style={{ color: 'var(--text-primary)' }}>Success</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-24 rounded-lg shadow-md border transition-transform hover:scale-105" style={{ backgroundColor: 'var(--warning-color)', borderColor: 'var(--border-color)' }}></div>
            <span className="font-medium text-center text-sm" style={{ color: 'var(--text-primary)' }}>Warning</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-24 rounded-lg shadow-md border transition-transform hover:scale-105" style={{ backgroundColor: 'var(--danger-color)', borderColor: 'var(--border-color)' }}></div>
            <span className="font-medium text-center text-sm" style={{ color: 'var(--text-primary)' }}>Danger</span>
          </div>
        </div>
      </section>

      {/* Button Styles Preview */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Button Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button className="btn-primary w-full">Primary Button</button>
          <button className="btn-secondary w-full">Secondary Button</button>
          <button className="btn-success w-full">Success Button</button>
          <button className="btn-danger w-full">Danger Button</button>
          <button className="btn-outline w-full">Outline Button</button>
        </div>
      </section>

      {/* Status Colors Preview */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Status Messages</h2>
        <div className="grid gap-4">
          <div className="p-4 rounded-md border-l-4" style={{ backgroundColor: 'var(--bg-primary)', borderLeftColor: 'var(--primary-color)' }}>
            <p className="text-success mb-0 font-medium">✓ Success: Application submitted successfully</p>
          </div>
          <div className="p-4 rounded-md border-l-4" style={{ backgroundColor: 'var(--bg-primary)', borderLeftColor: 'var(--primary-color)' }}>
            <p className="text-warning mb-0 font-medium">⚠ Warning: Deadline approaching soon</p>
          </div>
          <div className="p-4 rounded-md border-l-4" style={{ backgroundColor: 'var(--bg-primary)', borderLeftColor: 'var(--primary-color)' }}>
            <p className="text-danger mb-0 font-medium">✕ Error: Please fill all required fields</p>
          </div>
          <div className="p-4 rounded-md border-l-4" style={{ backgroundColor: 'var(--bg-primary)', borderLeftColor: 'var(--primary-color)' }}>
            <p className="text-info mb-0 font-medium">ℹ Info: New internship opportunities available</p>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Typography Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h1 className="mb-3 mt-0 text-3xl font-bold">Heading 1 (H1)</h1>
            <p className="text-xs mb-0" style={{ color: 'var(--text-tertiary)' }}>30px, Bold, Primary color</p>
          </div>
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h2 className="mb-3 mt-0 text-2xl font-bold">Heading 2 (H2)</h2>
            <p className="text-xs mb-0" style={{ color: 'var(--text-tertiary)' }}>24px, Bold, Primary text</p>
          </div>
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h3 className="mb-3 mt-0 text-xl font-bold">Heading 3 (H3)</h3>
            <p className="text-xs mb-0" style={{ color: 'var(--text-tertiary)' }}>20px, Bold, Primary text</p>
          </div>
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <p className="text-base mb-3" style={{ color: 'var(--text-secondary)' }}>Body text (16px)</p>
            <p className="text-xs mb-0" style={{ color: 'var(--text-tertiary)' }}>Regular weight, secondary color</p>
          </div>
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>Small text (14px)</p>
            <p className="text-xs mb-0" style={{ color: 'var(--text-tertiary)' }}>Regular weight, tertiary color</p>
          </div>
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <a href="#" className="text-base no-underline transition-colors hover:underline mb-3 block" style={{ color: 'var(--primary-color)' }}>Link text (16px)</a>
            <p className="text-xs mb-0" style={{ color: 'var(--text-tertiary)' }}>Primary color, underline on hover</p>
          </div>
        </div>
      </section>

      {/* Spacing System */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Spacing System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-center min-h-[80px]" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-white)', padding: 'var(--spacing-sm)' }}>
              <p className="m-0 font-medium">--spacing-sm (8px)</p>
            </div>
          </div>
          <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-center min-h-[80px]" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-white)', padding: 'var(--spacing-md)' }}>
              <p className="m-0 font-medium">--spacing-md (12px)</p>
            </div>
          </div>
          <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-center min-h-[80px]" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-white)', padding: 'var(--spacing-lg)' }}>
              <p className="m-0 font-medium">--spacing-lg (16px)</p>
            </div>
          </div>
          <div className="rounded-md overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-center min-h-[80px]" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-white)', padding: 'var(--spacing-xl)' }}>
              <p className="m-0 font-medium">--spacing-xl (24px)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">Email Input</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="font-medium">Text Area</label>
            <textarea
              id="message"
              placeholder="Enter your message..."
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="select" className="font-medium">Select Dropdown</label>
            <select id="select" className="w-full">
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </section>

      {/* Cards Showcase */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Card Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <h3>Basic Card</h3>
            <p>This is a basic card with default styling using the card class.</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
            <h3>Primary Card</h3>
            <p>This is a card with a primary color accent on the left.</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
            <h3>Success Card</h3>
            <p>This is a card with a success color accent on the left.</p>
          </div>
        </div>
      </section>

      {/* Shadows & Effects */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Shadow Levels</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-8 rounded-lg text-center border transition-transform hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-sm)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <p className="m-0 font-medium" style={{ color: 'var(--text-primary)' }}>Small Shadow</p>
          </div>
          <div className="p-8 rounded-lg text-center border transition-transform hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <p className="m-0 font-medium" style={{ color: 'var(--text-primary)' }}>Medium Shadow</p>
          </div>
          <div className="p-8 rounded-lg text-center border transition-transform hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <p className="m-0 font-medium" style={{ color: 'var(--text-primary)' }}>Large Shadow</p>
          </div>
          <div className="p-8 rounded-lg text-center border transition-transform hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-xl)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <p className="m-0 font-medium" style={{ color: 'var(--text-primary)' }}>Extra Large Shadow</p>
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Border Radius Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="h-28 flex items-center justify-center font-bold border" style={{ borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'var(--text-white)', borderColor: 'var(--border-color)' }}>
            <p className="m-0">4px</p>
          </div>
          <div className="h-28 flex items-center justify-center font-bold border" style={{ borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'var(--text-white)', borderColor: 'var(--border-color)' }}>
            <p className="m-0">8px</p>
          </div>
          <div className="h-28 flex items-center justify-center font-bold border" style={{ borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'var(--text-white)', borderColor: 'var(--border-color)' }}>
            <p className="m-0">12px</p>
          </div>
          <div className="h-28 flex items-center justify-center font-bold border" style={{ borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'var(--text-white)', borderColor: 'var(--border-color)' }}>
            <p className="m-0">16px</p>
          </div>
          <div className="h-28 flex items-center justify-center font-bold border" style={{ borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'var(--text-white)', borderColor: 'var(--border-color)' }}>
            <p className="m-0">Full</p>
          </div>
        </div>
      </section>

      {/* Full Color Grid */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Complete Color Palette</h2>
        <div className="grid gap-8">
          {/* Primary Colors */}
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h4 className="m-0 mb-4 text-base" style={{ color: 'var(--text-primary)' }}>Primary Colors</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Dark</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Primary</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Light</span>
              </div>
            </div>
          </div>

          {/* Status Colors */}
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h4 className="m-0 mb-4 text-base" style={{ color: 'var(--text-primary)' }}>Status Colors</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--success-color)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Success</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--warning-color)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Warning</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--danger-color)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Danger</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--info-color)', color: 'var(--text-white)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', borderColor: 'var(--border-color)' }}>
                <span>Info</span>
              </div>
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <h4 className="m-0 mb-4 text-base" style={{ color: 'var(--text-primary)' }}>Neutral / Background</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                <span>Primary</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                <span>Secondary</span>
              </div>
              <div className="h-24 rounded-md flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                <span>Tertiary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Font Weights */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Font Weights</h2>
        <div className="grid gap-4 p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <p className="m-0 text-lg" style={{ fontWeight: 'var(--font-weight-light)', color: 'var(--text-primary)' }}>Light (300) - The quick brown fox</p>
          <p className="m-0 text-lg" style={{ fontWeight: 'var(--font-weight-normal)', color: 'var(--text-primary)' }}>Normal (400) - The quick brown fox</p>
          <p className="m-0 text-lg" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>Medium (500) - The quick brown fox</p>
          <p className="m-0 text-lg" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>Semibold (600) - The quick brown fox</p>
          <p className="m-0 text-lg" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>Bold (700) - The quick brown fox</p>
        </div>
      </section>

      {/* Code Block / Variables Reference */}
      <section className="mb-12 p-8 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Quick Variable Reference</h2>
        <div className="p-4 rounded-md border mb-4" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <h4 className="mt-0 mb-3 text-base" style={{ color: 'var(--text-primary)' }}>Primary Colors</h4>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--primary-color): #6366f1</code>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--primary-light): #818cf8</code>
          <code className="block px-3 py-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--primary-dark): #4f46e5</code>
        </div>
        <div className="p-4 rounded-md border mb-4" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <h4 className="mt-0 mb-3 text-base" style={{ color: 'var(--text-primary)' }}>Spacing (Base 4px)</h4>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--spacing-sm): 8px</code>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--spacing-md): 12px</code>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--spacing-lg): 16px</code>
          <code className="block px-3 py-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--spacing-xl): 24px</code>
        </div>
        <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <h4 className="mt-0 mb-3 text-base" style={{ color: 'var(--text-primary)' }}>Border Radius</h4>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--radius-sm): 4px</code>
          <code className="block px-3 py-2 mb-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--radius-md): 8px</code>
          <code className="block px-3 py-2 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--primary-color)', color: 'var(--primary-dark)' }}>var(--radius-lg): 12px</code>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t-2 text-center" style={{ borderTopColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
        <p className="mb-3">All colors, spacing, and styles are defined in <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--primary-color)' }}>src/styles/globals.css</code></p>
        <p>Team members can import and use variables from <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--primary-color)' }}>src/styles/variables.css</code></p>
      </footer>
    </main>
    </>
  );
}