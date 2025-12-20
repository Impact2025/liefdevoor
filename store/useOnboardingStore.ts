import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OnboardingMode = 'SIMPLE' | 'STANDARD' | 'ADVANCED' | null;

export interface PhotoData {
  id?: string;
  url: string;
  order: number;
}

export interface UserData {
  name: string;
  email: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | '';
  lookingFor: 'MALE' | 'FEMALE' | 'BOTH' | '';
  photos: PhotoData[];
  bio: string;
  interests: string;
  city: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  minAgePreference: number;
  maxAgePreference: number;
  rulesAccepted: boolean;
}

interface OnboardingState {
  step: number;
  totalSteps: number;
  mode: OnboardingMode;
  userData: UserData;
  profileComplete: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  isSaving: boolean;
  error: string | null;
  hasSynced: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: OnboardingMode) => void;
  updateUserData: (data: Partial<UserData>) => void;
  addPhoto: (photo: PhotoData) => void;
  removePhoto: (index: number) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Server sync actions
  syncWithServer: () => Promise<void>;
  saveStepToServer: (step: number, data: Record<string, unknown>) => Promise<boolean>;
}

const initialUserData: UserData = {
  name: '',
  email: '',
  birthDate: '',
  gender: '',
  lookingFor: '',
  photos: [],
  bio: '',
  interests: '',
  city: '',
  postcode: '',
  latitude: null,
  longitude: null,
  minAgePreference: 18,
  maxAgePreference: 99,
  rulesAccepted: false,
};

// Calculate total steps based on mode
function getTotalStepsForMode(mode: OnboardingMode): number {
  switch (mode) {
    case 'SIMPLE':
      return 10; // Skip pricing, age preference, interests, verification
    case 'ADVANCED':
      return 13; // All steps including verification
    case 'STANDARD':
    default:
      return 12; // All except verification
  }
}

// Get steps to skip based on mode
export function getSkippedSteps(mode: OnboardingMode): number[] {
  switch (mode) {
    case 'SIMPLE':
      return [2, 8, 11, 12]; // Skip: pricing, age preference, interests, verification
    case 'STANDARD':
      return [12]; // Skip: verification
    case 'ADVANCED':
    default:
      return []; // No skips
  }
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 1,
      totalSteps: 13,
      mode: null,
      userData: initialUserData,
      profileComplete: false,
      isLoading: false,
      isSyncing: false,
      isSaving: false,
      error: null,
      hasSynced: false,

      setStep: (step) => set({ step }),

      nextStep: () => {
        const { step, mode } = get();
        const skippedSteps = getSkippedSteps(mode);
        let nextStep = step + 1;

        // Skip over any skipped steps
        while (skippedSteps.includes(nextStep) && nextStep <= 13) {
          nextStep++;
        }

        if (nextStep <= 13) {
          set({ step: nextStep, error: null });
        }
      },

      prevStep: () => {
        const { step, mode } = get();
        const skippedSteps = getSkippedSteps(mode);
        let prevStep = step - 1;

        // Skip over any skipped steps
        while (skippedSteps.includes(prevStep) && prevStep >= 1) {
          prevStep--;
        }

        if (prevStep >= 1) {
          set({ step: prevStep, error: null });
        }
      },

      setMode: (mode) => set({
        mode,
        totalSteps: getTotalStepsForMode(mode)
      }),

      updateUserData: (data) =>
        set((state) => ({
          userData: { ...state.userData, ...data },
          error: null,
        })),

      addPhoto: (photo) =>
        set((state) => ({
          userData: {
            ...state.userData,
            photos: [...state.userData.photos, photo],
          },
        })),

      removePhoto: (index) =>
        set((state) => ({
          userData: {
            ...state.userData,
            photos: state.userData.photos.filter((_, i) => i !== index),
          },
        })),

      reorderPhotos: (fromIndex, toIndex) =>
        set((state) => {
          const newPhotos = [...state.userData.photos];
          const [removed] = newPhotos.splice(fromIndex, 1);
          newPhotos.splice(toIndex, 0, removed);
          // Update order values
          newPhotos.forEach((photo, idx) => {
            photo.order = idx;
          });
          return {
            userData: { ...state.userData, photos: newPhotos },
          };
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set({
        step: 1,
        mode: null,
        userData: initialUserData,
        profileComplete: false,
        error: null,
        hasSynced: false,
      }),

      // Sync current state from server
      syncWithServer: async () => {
        set({ isSyncing: true, error: null });

        try {
          const response = await fetch('/api/onboarding', {
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Not logged in - this is expected for new users
              set({ isSyncing: false, hasSynced: true });
              return;
            }
            throw new Error('Kon gegevens niet ophalen');
          }

          const data = await response.json();

          set({
            step: data.step || 1,
            mode: data.mode || null,
            profileComplete: data.profileComplete || false,
            userData: {
              name: data.userData?.name || '',
              email: data.userData?.email || '',
              birthDate: data.userData?.birthDate ?
                new Date(data.userData.birthDate).toISOString().split('T')[0] : '',
              gender: data.userData?.gender || '',
              lookingFor: data.userData?.lookingFor || '',
              photos: data.userData?.photos?.map((p: { id: string; url: string; order: number }) => ({
                id: p.id,
                url: p.url,
                order: p.order,
              })) || [],
              bio: data.userData?.bio || '',
              interests: data.userData?.interests || '',
              city: data.userData?.city || '',
              postcode: data.userData?.postcode || '',
              latitude: data.userData?.latitude || null,
              longitude: data.userData?.longitude || null,
              minAgePreference: data.userData?.minAgePreference || 18,
              maxAgePreference: data.userData?.maxAgePreference || 99,
              rulesAccepted: data.userData?.rulesAccepted || false,
            },
            isSyncing: false,
            hasSynced: true,
          });
        } catch (error) {
          console.error('Sync error:', error);
          set({
            isSyncing: false,
            hasSynced: true,
            error: error instanceof Error ? error.message : 'Synchronisatie mislukt'
          });
        }
      },

      // Save step data to server
      saveStepToServer: async (step: number, data: Record<string, unknown>) => {
        set({ isSaving: true, error: null });

        try {
          const response = await fetch('/api/onboarding', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ step, data }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Kon niet opslaan');
          }

          const result = await response.json();

          set({
            isSaving: false,
            profileComplete: result.profileComplete || false,
          });

          return true;
        } catch (error) {
          console.error('Save error:', error);
          set({
            isSaving: false,
            error: error instanceof Error ? error.message : 'Opslaan mislukt'
          });
          return false;
        }
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these specific fields
      partialize: (state) => ({
        step: state.step,
        mode: state.mode,
        userData: state.userData,
        profileComplete: state.profileComplete,
      }),
    }
  )
);

// Helper hook to check if onboarding is complete
export function useIsOnboardingComplete() {
  const { userData, profileComplete } = useOnboardingStore();

  // Check minimum requirements
  const hasGender = !!userData.gender;
  const hasBirthDate = !!userData.birthDate;
  const hasLookingFor = !!userData.lookingFor;
  const hasBio = userData.bio && userData.bio.length >= 10;
  const hasRulesAccepted = userData.rulesAccepted;
  const hasPhoto = userData.photos.length > 0;

  return profileComplete || (hasGender && hasBirthDate && hasLookingFor && hasBio && hasRulesAccepted && hasPhoto);
}
