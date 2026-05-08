/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', 
          600: '#2563eb',
          900: '#1e3a8a',
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        status: {
          success: '#10b981', // Enrolled, Verified
          warning: '#f59e0b', // Pending, Follow-up
          danger: '#ef4444',  // Rejected, Overdue
          info: '#3b82f6',    // New, Draft
        },
        slate: {
          50: '#f8fafc', // App Background
          200: '#e2e8f0', // Borders
          500: '#64748b', // Secondary Text
          900: '#0f172a', // Primary Headings
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      }, // <-- COLORS OBJECT ENDS HERE
      
      // borderRadius and boxShadow must be HERE, outside of colors!
      borderRadius: {
        'xl': '0.75rem',  // Standard Cards
        '2xl': '1rem',    // Dashboard Containers
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'drawer': '-4px 0 24px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}