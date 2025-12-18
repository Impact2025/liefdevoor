import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Adaptive UI System
 * 
 * Biedt drie UI modes die automatisch of manueel geselecteerd kunnen worden:
 * - SIMPLE: Voor gebruikers met LVB of voorkeur voor eenvoud
 * - STANDARD: Default, balans tussen functionaliteit en eenvoud
 * - ADVANCED: Voor power users, meer features zichtbaar
 * 
 * Het systeem detecteert automatisch de beste mode maar gebruikers
 * kunnen altijd zelf kiezen.
 */

export type UIMode = 'simple' | 'standard' | 'advanced';

interface AdaptiveUIContextType {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  isSimpleMode: boolean;
  isStandardMode: boolean;
  isAdvancedMode: boolean;
  preferences: UIPreferences;
  updatePreferences: (prefs: Partial<UIPreferences>) => void;
}

interface UIPreferences {
  // Visuele voorkeuren
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Interactie voorkeuren
  audioFeedback: boolean;
  hapticFeedback: boolean;
  autoReadAloud: boolean;
  
  // Functionaliteit voorkeuren
  showAdvancedFilters: boolean;
  showAnalytics: boolean;
  quickActions: boolean;
  
  // Hulp voorkeuren
  showHints: boolean;
  confirmActions: boolean;
  simplifiedLanguage: boolean;
}

const defaultPreferences: UIPreferences = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  audioFeedback: false,
  hapticFeedback: true,
  autoReadAloud: false,
  showAdvancedFilters: false,
  showAnalytics: false,
  quickActions: true,
  showHints: true,
  confirmActions: true,
  simplifiedLanguage: false,
};

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

export const AdaptiveUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<UIMode>('standard');
  const [preferences, setPreferences] = useState<UIPreferences>(defaultPreferences);

  // Load preferences from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('ui-mode') as UIMode;
    const savedPreferences = localStorage.getItem('ui-preferences');
    
    if (savedMode) {
      setModeState(savedMode);
    } else {
      // Auto-detect best mode based on browser capabilities and user needs
      const detectedMode = detectOptimalMode();
      setModeState(detectedMode);
    }
    
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Save to localStorage when changed
  const setMode = (newMode: UIMode) => {
    setModeState(newMode);
    localStorage.setItem('ui-mode', newMode);
    
    // Update preferences based on mode
    const modePreferences = getModePreferences(newMode);
    updatePreferences(modePreferences);
  };

  const updatePreferences = (newPreferences: Partial<UIPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('ui-preferences', JSON.stringify(updated));
  };

  return (
    <AdaptiveUIContext.Provider
      value={{
        mode,
        setMode,
        isSimpleMode: mode === 'simple',
        isStandardMode: mode === 'standard',
        isAdvancedMode: mode === 'advanced',
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </AdaptiveUIContext.Provider>
  );
};

export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (!context) {
    throw new Error('useAdaptiveUI must be used within AdaptiveUIProvider');
  }
  return context;
};

// Helper: Detect optimal mode
function detectOptimalMode(): UIMode {
  // Check for accessibility preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  // Check for touch device (mobile)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth < 768;
  
  // Simple scoring system
  let simpleScore = 0;
  
  if (prefersReducedMotion) simpleScore += 2;
  if (prefersHighContrast) simpleScore += 2;
  if (isTouchDevice && isSmallScreen) simpleScore += 1;
  
  // Default to standard, but suggest simple if accessibility needs detected
  return simpleScore >= 3 ? 'simple' : 'standard';
}

// Helper: Get default preferences for each mode
function getModePreferences(mode: UIMode): Partial<UIPreferences> {
  switch (mode) {
    case 'simple':
      return {
        largeText: true,
        showHints: true,
        confirmActions: true,
        simplifiedLanguage: true,
        showAdvancedFilters: false,
        showAnalytics: false,
      };
    
    case 'standard':
      return {
        largeText: false,
        showHints: true,
        confirmActions: true,
        simplifiedLanguage: false,
        showAdvancedFilters: false,
        showAnalytics: false,
      };
    
    case 'advanced':
      return {
        largeText: false,
        showHints: false,
        confirmActions: false,
        simplifiedLanguage: false,
        showAdvancedFilters: true,
        showAnalytics: true,
        quickActions: true,
      };
  }
}

/**
 * UI Mode Selector Component
 * 
 * Laat gebruikers hun voorkeur kiezen met duidelijke uitleg
 */
export const UIModeSelectorModal: React.FC<{
  onClose: () => void;
  showOnboarding?: boolean;
}> = ({ onClose, showOnboarding = false }) => {
  const { mode, setMode } = useAdaptiveUI();
  const [selectedMode, setSelectedMode] = useState<UIMode>(mode);

  const modes = [
    {
      id: 'simple' as UIMode,
      icon: '🎯',
      name: 'Eenvoudig',
      tagline: 'Duidelijk en overzichtelijk',
      description: 'Grote knoppen, stap-voor-stap begeleiding, eenvoudige taal. Perfect voor iedereen die het rustig aan wil doen.',
      benefits: [
        'Extra grote knoppen en tekst',
        'Duidelijke instructies bij elke stap',
        'Bevestigingen bij belangrijke keuzes',
        'Geen verborgen menu\'s of complexiteit',
      ],
      audience: 'Aangeraden voor: nieuwe gebruikers, rustig tempo',
    },
    {
      id: 'standard' as UIMode,
      icon: '⚡',
      name: 'Standaard',
      tagline: 'Beste van beide werelden',
      description: 'Moderne interface met slimme functies, maar zonder overbodige complexiteit. Voor de meeste mensen perfect.',
      benefits: [
        'Moderne, intuïtieve interface',
        'Balans tussen functionaliteit en eenvoud',
        'Handige snelkoppelingen',
        'Slim ontworpen voor efficiëntie',
      ],
      audience: 'Aangeraden voor: meeste gebruikers',
    },
    {
      id: 'advanced' as UIMode,
      icon: '🚀',
      name: 'Geavanceerd',
      tagline: 'Maximale controle',
      description: 'Alle features en opties direct beschikbaar. Voor ervaren gebruikers die volledige controle willen.',
      benefits: [
        'Geavanceerde filters en zoekopties',
        'Gedetailleerde statistieken en analytics',
        'Keyboard shortcuts en quick actions',
        'Minimale bevestigingen, maximale snelheid',
      ],
      audience: 'Aangeraden voor: power users, tech-savvy',
    },
  ];

  const handleConfirm = () => {
    setMode(selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-accessible shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-accessible">
          <h2 className="text-2xl-accessible font-bold mb-2">
            {showOnboarding ? 'Welkom! Kies jouw ervaring' : 'Pas jouw ervaring aan'}
          </h2>
          <p className="text-base-accessible opacity-90">
            Selecteer de modus die het beste bij jou past. Je kunt dit altijd later wijzigen.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="p-6 grid md:grid-cols-3 gap-6">
          {modes.map((modeOption) => (
            <button
              key={modeOption.id}
              onClick={() => setSelectedMode(modeOption.id)}
              className={`
                text-left p-6 rounded-accessible border-2 transition-all
                ${selectedMode === modeOption.id
                  ? 'border-primary-600 bg-primary-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {/* Icon & Name */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{modeOption.icon}</span>
                <div>
                  <h3 className="font-bold text-xl">{modeOption.name}</h3>
                  <p className="text-sm text-gray-600">{modeOption.tagline}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4">
                {modeOption.description}
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-4">
                {modeOption.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Audience */}
              <p className="text-xs text-gray-500 italic pt-4 border-t border-gray-200">
                {modeOption.audience}
              </p>

              {/* Selected indicator */}
              {selectedMode === modeOption.id && (
                <div className="mt-4 bg-primary-600 text-white text-center py-2 rounded font-semibold text-sm">
                  ✓ Geselecteerd
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Important note */}
        <div className="mx-6 mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-accessible">
          <p className="text-sm text-blue-900">
            <strong>Geen zorgen!</strong> Je kunt dit altijd wijzigen in je instellingen. 
            Experimenteer en kies wat het beste voelt voor jou. 🎨
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t-2 border-gray-200">
          {!showOnboarding && (
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Annuleren
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            className="btn-primary btn-lg ml-auto"
          >
            {showOnboarding ? 'Beginnen' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Adaptive Component Wrapper
 * 
 * Toont verschillende varianten van een component op basis van de UI mode
 */
export const Adaptive: React.FC<{
  simple?: React.ReactNode;
  standard?: React.ReactNode;
  advanced?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ simple, standard, advanced, children }) => {
  const { mode } = useAdaptiveUI();

  if (mode === 'simple' && simple) return <>{simple}</>;
  if (mode === 'standard' && standard) return <>{standard}</>;
  if (mode === 'advanced' && advanced) return <>{advanced}</>;
  
  return <>{children}</>;
};
