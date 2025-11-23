
export enum UserRole {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
}

export enum AgeGroup {
  EARLY = 'EARLY',     // 0-4
  DISCOVERY = 'DISCOVERY', // 5-8
  JUNIOR = 'JUNIOR'    // 9-13
}

export enum GameType {
  SMART = 'SMART', // Cognitive tasks
  FUN = 'FUN',     // Rewards
}

export enum GameCategory {
  LOGIC = 'LOGIC',
  MATH = 'MATH',
  MEMORY = 'MEMORY',
  CREATIVITY = 'CREATIVITY',
  LANGUAGE = 'LANGUAGE'
}

export interface GameModule {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minAge: number;
  locked?: boolean;
  progress?: number; // 0-100
  rewardPoints?: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatarUrl: string;
  points: number;
  age: number;
  pin?: string;
  settings?: {
    dailyLimitMin: number;
    allowedGames: string[];
  };
  // New Preferences
  buddy?: AgeGroup; // Preferred Owl Persona (overrides age default)
  preferredDifficulty?: 'Easy' | 'Medium' | 'Hard';
  themePreference?: AgeGroup; // Overrides visual color scheme
}

export interface SmartGame {
  id: string;
  title: string;
  description: string;
  question: string;
  correctAnswer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options?: string[]; // Multiple choice options
  inputType?: 'text' | 'choice'; // Input method
  rewardPoints?: number; // Points awarded for correct answer
}

export interface OwlMessage {
  id: string;
  sender: 'user' | 'owl';
  text: string;
  timestamp: number;
}

export interface InteractionLog {
  id: string;
  childId: string;
  activity: string;
  timestamp: Date;
  details?: string;
}

export interface GameConfig {
  id: string;
  type: GameType;
  minAge: number;
  maxAge: number;
  config: Record<string, any>;
}

export enum ViewState {
  LANDING,
  ONBOARDING,
  PARENT_LOGIN,
  PARENT_DASHBOARD,
  FAMILY_PORTAL,
  CHILD_DASHBOARD,
  GAME_SESSION,
  IMAGE_GENERATOR
}

export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  border: string;
  muted: string;
}

export const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 4) return AgeGroup.EARLY;
  if (age <= 8) return AgeGroup.DISCOVERY;
  return AgeGroup.JUNIOR;
};

export const getThemeColors = (group: AgeGroup): ThemeColors => {
  switch (group) {
    case AgeGroup.EARLY:
      return { 
        bg: 'bg-early-bg', 
        surface: 'bg-white',
        primary: 'bg-early-primary', 
        secondary: 'bg-early-secondary', 
        text: 'text-early-text', 
        accent: 'text-early-accent',
        border: 'border-early-primary',
        muted: 'text-early-text/60'
      };
    case AgeGroup.DISCOVERY:
      return { 
        bg: 'bg-disco-bg', 
        surface: 'bg-white',
        primary: 'bg-disco-primary', 
        secondary: 'bg-disco-secondary', 
        text: 'text-disco-text', 
        accent: 'text-disco-accent',
        border: 'border-disco-primary',
        muted: 'text-disco-text/60'
      };
    case AgeGroup.JUNIOR:
      return { 
        bg: 'bg-junior-bg', 
        surface: 'bg-junior-surface', 
        primary: 'bg-junior-primary', 
        secondary: 'bg-junior-secondary', 
        text: 'text-junior-text', 
        accent: 'text-junior-accent',
        border: 'border-junior-primary',
        muted: 'text-junior-text/60'
      };
  }
};
