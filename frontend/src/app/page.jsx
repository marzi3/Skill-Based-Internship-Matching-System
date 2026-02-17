'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [theme, setTheme] = useState('light');

  return (
    <main className={styles.main} data-theme={theme === 'dark' ? 'dark' : 'light'}>
      {/* Theme Switcher */}
      <div className={styles.themeSwitcher}>
        <button
          onClick={() => setTheme('light')}
          className={theme === 'light' ? styles.themeActive : styles.themeInactive}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? styles.themeActive : styles.themeInactive}
        >
          🌙 Dark
        </button>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <h1>Welcome to Internship Matching Platform</h1>
        <p>Find your perfect internship match based on skills and preferences.</p>
      </header>

      {/* Dashboard Navigation Cards */}
      <section className={styles.dashboardSection}>
        <h2>Choose Your Dashboard</h2>
        <div className={styles.cardGrid}>
          <a href="/student/dashboard" className={`${styles.dashboardCard} ${styles.cardStudent}`}>
            <div className={styles.cardIcon}>👨‍🎓</div>
            <h3>Student Dashboard</h3>
            <p>Find and apply for internship opportunities</p>
          </a>
          <a href="/employer/dashboard" className={`${styles.dashboardCard} ${styles.cardEmployer}`}>
            <div className={styles.cardIcon}>💼</div>
            <h3>Employer Dashboard</h3>
            <p>Post internships and manage applications</p>
          </a>
          <a href="/admin/dashboard" className={`${styles.dashboardCard} ${styles.cardAdmin}`}>
            <div className={styles.cardIcon}>👨‍💼</div>
            <h3>Admin Dashboard</h3>
            <p>Manage platform and users</p>
          </a>
        </div>
      </section>

      {/* Color Palette Preview */}
      <section className={styles.paletteSection}>
        <h2>Theme Colors</h2>
        <div className={styles.paletteGrid}>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--primary-color)' }}></div>
            <span>Primary</span>
          </div>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--secondary-color)' }}></div>
            <span>Secondary</span>
          </div>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--accent-color)' }}></div>
            <span>Accent</span>
          </div>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--success-color)' }}></div>
            <span>Success</span>
          </div>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--warning-color)' }}></div>
            <span>Warning</span>
          </div>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--danger-color)' }}></div>
            <span>Danger</span>
          </div>
        </div>
      </section>

      {/* Button Styles Preview */}
      <section className={styles.buttonsSection}>
        <h2>Button Styles</h2>
        <div className={styles.buttonGrid}>
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-success">Success Button</button>
          <button className="btn-danger">Danger Button</button>
          <button className="btn-outline">Outline Button</button>
        </div>
      </section>

      {/* Status Colors Preview */}
      <section className={styles.statusSection}>
        <h2>Status Messages</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusBox}>
            <p className="text-success">✓ Success: Application submitted successfully</p>
          </div>
          <div className={styles.statusBox}>
            <p className="text-warning">⚠ Warning: Deadline approaching soon</p>
          </div>
          <div className={styles.statusBox}>
            <p className="text-danger">✕ Error: Please fill all required fields</p>
          </div>
          <div className={styles.statusBox}>
            <p className="text-info">ℹ Info: New internship opportunities available</p>
          </div>
        </div>
      </section>
    </main>
  );
}
