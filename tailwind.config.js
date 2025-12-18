/** @type {import('tailwindcss').Config} */
const { withUt } = require("uploadthing/tw");

module.exports = withUt({
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ========================================================================
      // COLORS - Dating App Brand Palette
      // ========================================================================
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#E91E63',
          hover: '#D81B60',
          50: '#FCE4EC',
          100: '#F8BBD9',
          200: '#F48FB1',
          300: '#F06292',
          400: '#EC407A',
          500: '#E91E63',
          600: '#D81B60',
          700: '#C2185B',
          800: '#AD1457',
          900: '#880E4F',
        },
        // Secondary - Success/Like green
        success: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Danger/Pass red
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Super Like blue
        superlike: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Background colors
        background: '#F8F9FA',
        surface: '#FFFFFF',
        muted: '#6B7280',
      },

      // ========================================================================
      // BORDER RADIUS - Accessible & Modern
      // ========================================================================
      borderRadius: {
        'xs': '0.25rem',   // 4px
        'sm': '0.375rem',  // 6px
        DEFAULT: '0.5rem', // 8px
        'md': '0.625rem',  // 10px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.25rem',  // 20px
        '3xl': '1.5rem',   // 24px
        'full': '9999px',
        // Accessible variants
        'accessible': '0.75rem',
        'accessible-lg': '1rem',
      },

      // ========================================================================
      // SPACING - Touch-friendly minimum targets
      // ========================================================================
      spacing: {
        // Touch target sizes (44px minimum for accessibility)
        'touch': '2.75rem',      // 44px - minimum touch target
        'touch-lg': '3.5rem',    // 56px - large touch target
        'touch-xl': '4rem',      // 64px - extra large touch target
        // Adaptive spacing
        'adaptive': 'var(--adaptive-spacing, 1rem)',
      },

      // ========================================================================
      // FONT SIZES - Accessible & Adaptive
      // ========================================================================
      fontSize: {
        // Base sizes with line height and letter spacing
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        // Accessible variants (larger)
        'base-accessible': ['1.125rem', { lineHeight: '1.75rem' }],
        'lg-accessible': ['1.25rem', { lineHeight: '1.875rem' }],
        'xl-accessible': ['1.5rem', { lineHeight: '2rem' }],
        '2xl-accessible': ['1.75rem', { lineHeight: '2.25rem' }],
      },

      // ========================================================================
      // MIN HEIGHT/WIDTH - Touch Targets
      // ========================================================================
      minHeight: {
        'touch': '44px',     // Minimum accessible touch target
        'touch-lg': '56px',  // Large touch target
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '56px',
      },

      // ========================================================================
      // BOX SHADOW - Depth & Focus States
      // ========================================================================
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'button': '0 2px 8px rgba(233, 30, 99, 0.3)',
        'button-hover': '0 4px 12px rgba(233, 30, 99, 0.4)',
        // Focus ring shadows
        'focus-ring': '0 0 0 3px rgba(233, 30, 99, 0.4)',
        'focus-ring-success': '0 0 0 3px rgba(34, 197, 94, 0.4)',
        'focus-ring-danger': '0 0 0 3px rgba(239, 68, 68, 0.4)',
      },

      // ========================================================================
      // ANIMATION - Smooth & Accessible
      // ========================================================================
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.15s ease-in',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'swipe-right': 'swipeRight 0.3s ease-out forwards',
        'swipe-left': 'swipeLeft 0.3s ease-out forwards',
        'swipe-up': 'swipeUp 0.3s ease-out forwards',
        // Reduced motion safe
        'fade-in-safe': 'fadeIn 0.1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateX(150%) rotate(30deg)', opacity: '0' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateX(-150%) rotate(-30deg)', opacity: '0' },
        },
        swipeUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-150%)', opacity: '0' },
        },
      },

      // ========================================================================
      // TRANSITION - Consistent Timing
      // ========================================================================
      transitionDuration: {
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
        'adaptive': 'var(--adaptive-animation-duration, 200ms)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // ========================================================================
      // Z-INDEX - Layering System
      // ========================================================================
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },

      // ========================================================================
      // ASPECT RATIO - Card Shapes
      // ========================================================================
      aspectRatio: {
        'card': '3 / 4',        // Standard dating card
        'card-compact': '4 / 3', // Compact card
        'photo': '1 / 1',        // Square photo
        'portrait': '3 / 4',     // Portrait
        'landscape': '16 / 9',   // Landscape
      },

      // ========================================================================
      // BACKDROP BLUR - Modern Glass Effect
      // ========================================================================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [
    // Custom plugin for adaptive utilities
    function({ addUtilities, addComponents, theme }) {
      // Adaptive utilities
      addUtilities({
        // Touch-friendly button base
        '.btn-touch': {
          'min-height': '44px',
          'min-width': '44px',
          'padding': '0.75rem 1.5rem',
          'border-radius': theme('borderRadius.lg'),
          'font-weight': '600',
          'transition': 'all 200ms ease',
          '&:focus': {
            'outline': 'none',
            'box-shadow': theme('boxShadow.focus-ring'),
          },
        },
        '.btn-touch-lg': {
          'min-height': '56px',
          'min-width': '56px',
          'padding': '1rem 2rem',
        },
        // Accessible focus ring
        '.focus-ring': {
          '&:focus': {
            'outline': 'none',
            'box-shadow': '0 0 0 3px rgba(233, 30, 99, 0.4)',
          },
          '&:focus-visible': {
            'outline': 'none',
            'box-shadow': '0 0 0 3px rgba(233, 30, 99, 0.4)',
          },
        },
        // Screen reader only (but focusable)
        '.sr-only-focusable': {
          '&:not(:focus)': {
            'position': 'absolute',
            'width': '1px',
            'height': '1px',
            'padding': '0',
            'margin': '-1px',
            'overflow': 'hidden',
            'clip': 'rect(0, 0, 0, 0)',
            'white-space': 'nowrap',
            'border-width': '0',
          },
        },
        // Reduced motion safe
        '.motion-safe': {
          '@media (prefers-reduced-motion: reduce)': {
            'animation': 'none !important',
            'transition': 'none !important',
          },
        },
        // Large text mode
        '.text-adaptive': {
          'font-size': 'calc(1rem * var(--adaptive-text-scale, 1))',
        },
      })

      // Component classes
      addComponents({
        // Primary button
        '.btn-primary': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'min-height': '44px',
          'padding': '0.75rem 1.5rem',
          'background': 'linear-gradient(135deg, #E91E63 0%, #D81B60 100%)',
          'color': 'white',
          'font-weight': '600',
          'border-radius': theme('borderRadius.lg'),
          'box-shadow': theme('boxShadow.button'),
          'transition': 'all 200ms ease',
          '&:hover': {
            'background': 'linear-gradient(135deg, #D81B60 0%, #C2185B 100%)',
            'box-shadow': theme('boxShadow.button-hover'),
            'transform': 'translateY(-1px)',
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
          '&:focus': {
            'outline': 'none',
            'box-shadow': `${theme('boxShadow.button')}, ${theme('boxShadow.focus-ring')}`,
          },
          '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
            'transform': 'none',
          },
        },
        '.btn-lg': {
          'min-height': '56px',
          'padding': '1rem 2rem',
          'font-size': '1.125rem',
        },
        // Card component
        '.card-dating': {
          'background': 'white',
          'border-radius': theme('borderRadius.2xl'),
          'box-shadow': theme('boxShadow.card'),
          'overflow': 'hidden',
          'transition': 'box-shadow 200ms ease, transform 200ms ease',
          '&:hover': {
            'box-shadow': theme('boxShadow.card-hover'),
          },
        },
        // Like/Pass action buttons
        '.btn-like': {
          'width': '64px',
          'height': '64px',
          'border-radius': '50%',
          'background': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          'color': 'white',
          'box-shadow': '0 4px 12px rgba(34, 197, 94, 0.3)',
          'transition': 'all 200ms ease',
          '&:hover': {
            'transform': 'scale(1.1)',
            'box-shadow': '0 6px 16px rgba(34, 197, 94, 0.4)',
          },
        },
        '.btn-pass': {
          'width': '64px',
          'height': '64px',
          'border-radius': '50%',
          'background': 'white',
          'border': '2px solid #EF4444',
          'color': '#EF4444',
          'box-shadow': '0 4px 12px rgba(239, 68, 68, 0.2)',
          'transition': 'all 200ms ease',
          '&:hover': {
            'transform': 'scale(1.1)',
            'background': '#FEF2F2',
          },
        },
        '.btn-superlike': {
          'width': '52px',
          'height': '52px',
          'border-radius': '50%',
          'background': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          'color': 'white',
          'box-shadow': '0 4px 12px rgba(59, 130, 246, 0.3)',
          'transition': 'all 200ms ease',
          '&:hover': {
            'transform': 'scale(1.1)',
            'box-shadow': '0 6px 16px rgba(59, 130, 246, 0.4)',
          },
        },
      })
    },
  ],
});
