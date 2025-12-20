'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to guard protected pages and redirect to onboarding if profile is incomplete
 *
 * Usage:
 * ```tsx
 * export default function DiscoverPage() {
 *   const { isReady, isProfileComplete } = useOnboardingGuard();
 *
 *   if (!isReady) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   // render page content
 * }
 * ```
 */
export function useOnboardingGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isProfileComplete = session?.user?.profileComplete ?? false;

  useEffect(() => {
    // Wait for session to load
    if (isLoading) return;

    // Not authenticated - middleware handles redirect to login
    if (!isAuthenticated) return;

    // Authenticated but profile not complete - redirect to onboarding
    if (!isProfileComplete && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isLoading, isAuthenticated, isProfileComplete, pathname, router]);

  return {
    isReady: !isLoading && isAuthenticated && isProfileComplete,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    session,
  };
}

/**
 * Hook to use on the onboarding page to redirect away if profile is already complete
 */
export function useOnboardingPageGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isProfileComplete = session?.user?.profileComplete ?? false;

  useEffect(() => {
    // Wait for session to load
    if (isLoading) return;

    // Not authenticated - middleware handles redirect to login
    if (!isAuthenticated) return;

    // Profile already complete - redirect to discover
    if (isProfileComplete) {
      router.replace('/discover');
    }
  }, [isLoading, isAuthenticated, isProfileComplete, router]);

  return {
    isReady: !isLoading && isAuthenticated && !isProfileComplete,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    session,
  };
}
