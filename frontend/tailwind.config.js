/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    50: '#f5f7ff',
                    100: '#ebf0ff',
                    200: '#d6e0ff',
                    300: '#b8c9ff',
                    400: '#8fa8ff',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    light: '#818cf8',
                    dark: '#4f46e5',
                    hover: '#4f46e5',
                },
                secondary: {
                    DEFAULT: '#ec4899',
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d',
                    900: '#831843',
                    light: '#f472b6',
                    dark: '#be185d',
                },
                accent: {
                    DEFAULT: '#14b8a6',
                    light: '#2dd4bf',
                    dark: '#0d9488',
                },
                success: {
                    DEFAULT: '#10b981',
                    light: '#6ee7b7',
                    dark: '#059669',
                },
                warning: {
                    DEFAULT: '#f59e0b',
                    light: '#fcd34d',
                    dark: '#d97706',
                },
                danger: {
                    DEFAULT: '#ef4444',
                    light: '#fca5a5',
                    dark: '#dc2626',
                },
                info: {
                    DEFAULT: '#3b82f6',
                    light: '#93c5fd',
                    dark: '#1d4ed8',
                },
                bg: {
                    primary: '#ffffff',
                    secondary: '#f8fafc',
                    tertiary: '#f1f5f9',
                    hover: '#e2e8f0',
                },
                text: {
                    primary: '#1e293b',
                    secondary: '#64748b',
                    tertiary: '#94a3b8',
                    light: '#cbd5e1',
                    white: '#ffffff',
                },
                border: {
                    DEFAULT: '#e2e8f0',
                    light: '#f1f5f9',
                },
                divider: '#cbd5e1',
                // Dark theme colors
                dark: {
                    bg: {
                        primary: '#0f172a',
                        secondary: '#1e293b',
                        tertiary: '#334155',
                        hover: '#475569',
                    },
                    text: {
                        primary: '#f1f5f9',
                        secondary: '#cbd5e1',
                        tertiary: '#94a3b8',
                        light: '#64748b',
                    },
                    border: {
                        DEFAULT: '#334155',
                        light: '#475569',
                    },
                    divider: '#64748b',
                }
            },
            spacing: {
                xs: '4px',
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
                '2xl': '32px',
                '3xl': '48px',
            },
            borderRadius: {
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                full: '9999px',
            },
            fontSize: {
                xs: '12px',
                sm: '14px',
                md: '16px',
                lg: '18px',
                xl: '20px',
                '2xl': '24px',
                '3xl': '30px',
            },
            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },
            boxShadow: {
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
            transitionDuration: {
                fast: '150ms',
                normal: '300ms',
                slow: '500ms',
            },
            transitionTimingFunction: {
                DEFAULT: 'ease-in-out',
            },
            zIndex: {
                dropdown: '1000',
                sticky: '1020',
                fixed: '1030',
                'modal-backdrop': '1040',
                modal: '1050',
                popover: '1060',
                tooltip: '1070',
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
