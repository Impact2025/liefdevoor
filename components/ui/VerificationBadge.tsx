'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  isPhotoVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'w-4 h-4',
    icon: 'w-2.5 h-2.5',
    label: 'text-xs',
  },
  md: {
    container: 'w-6 h-6',
    icon: 'w-4 h-4',
    label: 'text-sm',
  },
  lg: {
    container: 'w-8 h-8',
    icon: 'w-5 h-5',
    label: 'text-base',
  },
};

export function VerificationBadge({
  isVerified,
  isPhotoVerified = false,
  size = 'md',
  showLabel = false,
  className = '',
  animated = true,
}: VerificationBadgeProps) {
  const sizes = sizeClasses[size];

  if (!isVerified && !isPhotoVerified) {
    return null;
  }

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={isPhotoVerified ? 'Foto geverifieerd' : 'Geverifieerd profiel'}
    >
      <motion.div
        className={`${sizes.container} rounded-full flex items-center justify-center ${
          isPhotoVerified
            ? 'bg-gradient-to-br from-purple-500 to-purple-700'
            : 'bg-blue-500'
        }`}
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isPhotoVerified ? (
          <ShieldCheck className={`${sizes.icon} text-white`} />
        ) : (
          <CheckCircle2 className={`${sizes.icon} text-white`} />
        )}
      </motion.div>

      {showLabel && (
        <span className={`${sizes.label} font-medium ${
          isPhotoVerified ? 'text-purple-700' : 'text-blue-600'
        }`}>
          {isPhotoVerified ? 'Geverifieerd' : 'Bevestigd'}
        </span>
      )}
    </div>
  );

  return badge;
}

// Expanded badge for profile headers
export function VerificationBadgeExpanded({
  isVerified,
  isPhotoVerified = false,
  className = '',
}: {
  isVerified: boolean;
  isPhotoVerified?: boolean;
  className?: string;
}) {
  if (!isVerified && !isPhotoVerified) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
        isPhotoVerified
          ? 'bg-purple-100 border border-purple-200'
          : 'bg-blue-50 border border-blue-100'
      } ${className}`}
    >
      {isPhotoVerified ? (
        <>
          <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-purple-700">
            Identiteit geverifieerd
          </span>
          <Sparkles className="w-3 h-3 text-purple-400" />
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600">
            Profiel bevestigd
          </span>
        </>
      )}
    </motion.div>
  );
}

// Badge for discover cards (positioned absolutely)
export function VerificationBadgeOverlay({
  isVerified,
  isPhotoVerified = false,
  position = 'top-right',
}: {
  isVerified: boolean;
  isPhotoVerified?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) {
  if (!isVerified && !isPhotoVerified) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'bottom-left': 'bottom-3 left-3',
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} z-10`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isPhotoVerified
            ? 'bg-gradient-to-br from-purple-500 to-purple-700'
            : 'bg-blue-500'
        }`}
        title={isPhotoVerified ? 'Foto geverifieerd' : 'Geverifieerd'}
      >
        {isPhotoVerified ? (
          <ShieldCheck className="w-5 h-5 text-white" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-white" />
        )}
      </div>
    </motion.div>
  );
}

export default VerificationBadge;
