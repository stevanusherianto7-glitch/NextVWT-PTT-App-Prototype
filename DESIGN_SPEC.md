# NextVWT PTT App - Design Specification & Technical Implementation

**Project Overview**: Real-time Push-to-Talk (PTT) communication application with Supabase backend, featuring user authentication, presence detection, and live channel monitoring.

*Based on Design Reference: NextVWT_Image_4_Jun_2026__14.26.22.png*

## 🏗️ Project Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
- **Authentication**: Google OAuth + Guest Login
- **Real-time**: Supabase Presence & Broadcast
- **Build Tool**: pnpm with workspace support
- **Testing**: Playwright E2E testing

### Directory Structure
```
src/
├── components/          # UI Components
│   ├── common/        # Reusable components
│   │   ├── ToggleSwitch.tsx
│   │   ├── Input.tsx
│   │   └── Button.tsx
│   ├── feature/       # Feature-specific components
│   │   ├── LCDPanel.tsx
│   │   ├── PTTButton.tsx
│   │   ├── ControlButtons.tsx
│   │   └── ProgressBar.tsx
│   └── layout/        # Layout components
│       ├── TopBar.tsx
│       ├── UserListModal.tsx
│       └── ErrorMessage.tsx
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── usePTTState.ts
│   ├── usePresence.ts
│   └── useChannelManagement.ts
├── lib/               # Utilities and configurations
│   ├── supabase.ts    # Supabase client configuration
│   ├── constants.ts   # App constants and tokens
│   ├── types.ts       # TypeScript type definitions
│   └── utils.ts       # Utility functions
├── store/             # State management
│   ├── authStore.ts   # Authentication state
│   ├── pttStore.ts    # PTT state management
│   └── presenceStore.ts # User presence state
└── App.tsx           # Root component
```

## 🎨 Design System

### Color Palette
```typescript
export const NextVWTColors = {
  // Primary Colors
  primary: {
    orange: {
      light: '#FFB84D',
      medium: '#FF9500',
      dark: '#FF7F00'
    },
    green: {
      light: '#4ADE80',
      medium: '#22C55E',
      dark: '#15803D',
      pressed: '#32CD32',
      pressedDark: '#228B22'
    }
  },
  
  // Component Colors
  components: {
    lcd: {
      bgStart: '#FFB84D',
      bgEnd: '#FF9500',
      text: '#FFFFFF',
      chLabel: '#000000'
    },
    ptt: {
      idleStart: '#4ADE80',
      idleEnd: '#22C55E',
      pressedStart: '#32CD32',
      pressedEnd: '#228B22',
      shadow: '#15803D'
    },
    toggle: {
      onStart: '#FF9500',
      onEnd: '#FFB84D',
      offStart: '#8a8a8a',
      offEnd: '#b8b8b8'
    },
    controls: {
      bgStart: '#333333',
      bgEnd: '#0a0a0a',
      shadow: '#000000'
    }
  },
  
  // UI Colors
  ui: {
    panel: {
      dark: '#2d2d2d',
      black: '#1c1c1c'
    },
    background: {
      start: '#475569', // slate-700
      middle: '#334155', // slate-800
      end: '#1e293b'    // slate-900
    },
    logo: {
      red: '#FF0000',
      redDark: '#D60000',
      green: '#00FF00'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9CA3AF'
    },
    status: {
      tx: '#EF4444', // red-500
      scan: '#60A5FA'  // blue-400
    }
  }
} as const;
```

## 📱 Component Specifications

### 1. LCD Panel Component
**File**: `src/components/feature/LCDPanel.tsx`

#### Visual Specifications:
- **Size**: `320px × 140px`  
- **Corner Radius**: `16px`
- **Background**: Vertical gradient `#FFB84D → #FF9500`

#### Styling Implementation:
```typescript
const lcdStyle = {
  background: `linear-gradient(180deg, ${colors.components.lcd.bgStart} 0%, ${colors.components.lcd.bgEnd} 100%)`,
  boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.35)',
  border: '2px solid rgba(0,0,0,0.15)'
};
```

#### Content Layout:
- **Padding**: `20px horizontal, 12px vertical`
- **Status Bar** (Top):
  - User icon: `14px`, color `#000000 @ 60% opacity`, stroke `2.5px`
  - Signal bars: 5 bars, width `6px`, heights: `4px, 6.5px, 9px, 11.5px, 14px`
  
- **CH Label**:
  - Font size: `28px`
  - Font weight: `700` (Bold)
  - Color: `#000000`
  - Position: Left of channel number

- **Channel Number**:
  - Font family: `DSEG7 Classic Mini Bold`
  - Font size: `80px`
  - Color: `#FFFFFF`
  - Letter spacing: `6px`
  - Text shadow: `2px 2px 6px rgba(0,0,0,0.5)`
  - Format: 3-digit (001-999)

- **Reflection Overlay**:
  - Height: `48px` from top
  - Gradient: `rgba(255,255,255,0.15) → transparent`

#### Props Interface:
```typescript
interface LCDPanelProps {
  channel: number;
  userCount?: number;
  isTransmitting?: boolean;
  showStatus?: boolean;
}
```

---

### 2. Progress Bar Component
**File**: `src/components/feature/ProgressBar.tsx`

#### Visual Specifications:
- **Size**: `320px × 10px`  
- **Corner Radius**: `5px`
- **Background**: `#2a2a2a` with inset shadow

#### Styling Implementation:
```typescript
const progressBarStyle = {
  background: '#2a2a2a',
  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6)',
  border: '1px solid rgba(0,0,0,0.3)'
};

// Progress Fill
const progressFillStyle = {
  background: `linear-gradient(90deg, ${colors.primary.green.light} 0%, ${colors.primary.green.medium} 100%)`,
  boxShadow: '0 0 10px rgba(74,222,128,0.5)',
  transition: 'width 300ms ease-out'
};
```

#### Props Interface:
```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  isTransmitting?: boolean;
  className?: string;
}
```

---

### 3. Control Buttons Component
**File**: `src/components/feature/ControlButtons.tsx`

#### Component Structure:
- **SCAN/SET Buttons**:
  - Size: `70px × 56px`  
  - Corner Radius: `12px`
  
- **UP/DOWN Buttons**:
  - Size: `56px × 36px`  
  - Corner Radius: `8px`

#### Styling Implementation:
```typescript
const controlButtonStyle = {
  background: `linear-gradient(180deg, ${colors.components.controls.bgStart} 0%, ${colors.components.controls.bgEnd} 100%)`,
  // Idle State
  boxShadow: '0 5px 0 #000000, 0 7px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
  transition: 'all 0.1s ease-out'
};

const controlButtonPressedStyle = {
  boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.6)',
  transform: 'translateY(3px)'
};
```

#### Props Interface:
```typescript
interface ControlButtonsProps {
  onScan: () => void;
  onSet: () => void;
  onUp: () => void;
  onDown: () => void;
  isScanning?: boolean;
  disabled?: boolean;
}
```

#### Button Group Layout:
```tsx
<div className="flex gap-3">
  <div className="flex flex-col gap-1.5">
    <ControlButton variant="up" onPress={onUp} />
    <ControlButton variant="down" onPress={onDown} />
  </div>
  <ControlButton variant="scan" onPress={onScan} isActive={isScanning} />
  <ControlButton variant="set" onPress={onSet} />
</div>
```

---

### 4. PTT Button Component
**File**: `src/components/feature/PTTButton.tsx`

#### Visual Specifications:
- **Size**: `300px × 80px`  
- **Corner Radius**: `40px` (pill shape)

#### Styling Implementation:
```typescript
const pttIdleStyle = {
  background: `linear-gradient(180deg, ${colors.primary.green.light} 0%, ${colors.primary.green.medium} 100%)`,
  boxShadow: '0 6px 0 #15803D, 0 8px 20px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.25)',
  transform: 'translateY(0)',
  transition: 'all 100ms ease-out'
};

const pttPressedStyle = {
  background: `linear-gradient(180deg, ${colors.primary.green.pressed} 0%, ${colors.primary.green.pressedDark} 100%)`,
  boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)',
  transform: 'translateY(5px)'
};

const pttTextStyle = {
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '8px',
  color: '#FFFFFF',
  textShadow: '0 2px 6px rgba(0,0,0,0.5)',
  transition: 'transform 100ms ease-out'
};

// Top Highlight (Idle only)
const pttHighlightStyle = {
  position: 'absolute',
  top: '12px',
  left: '40px',
  right: '40px',
  height: '24px',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
  borderRadius: '12px',
  pointerEvents: 'none'
};
```

#### Props Interface:
```typescript
interface PTTButtonProps {
  onPressStart: () => void;
  onPressEnd: () => void;
  disabled?: boolean;
  isTransmitting?: boolean;
}
```

---

### 5. Toggle Switch Component
**File**: `src/components/feature/ToggleSwitch.tsx`

#### Visual Specifications:
- **Size**: `72px × 34px`  
- **Corner Radius**: `17px` (fully rounded)

#### Styling Implementation:
```typescript
const toggleTrackStyle = {
  // ON State
  background: `linear-gradient(180deg, ${colors.primary.orange.light} 0%, ${colors.primary.orange.medium} 100%)`,
  
  // OFF State
  '&.off': {
    background: `linear-gradient(180deg, ${colors.components.toggle.offStart} 0%, ${colors.components.toggle.offEnd} 100%)`
  },
  
  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.15)',
  border: '1px solid rgba(0,0,0,0.2)',
  position: 'relative',
  cursor: 'pointer'
};

const toggleThumbStyle = {
  width: '28px',
  height: '28px',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 100%)',
  boxShadow: '0 3px 6px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.9)',
  borderRadius: '50%',
  position: 'absolute',
  top: '2px',
  left: '3px',
  transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',

  // ON Position
  '&.on': {
    left: '41px'
  }
};
```

#### Props Interface:
```typescript
interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
  disabled?: boolean;
  label?: string;
}
```

---

### 6. Top Bar Component
**File**: `src/components/feature/TopBar.tsx`

#### Logo Specifications:
- **Size**: `44px × 44px`

```typescript
const logoStyle = {
  background: `linear-gradient(135deg, ${colors.brand.red} 0%, ${colors.brand.redDark} 100%)`,
  border: '2.5px solid #00FF00',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35), 0 2px 10px rgba(255,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px'
};

const logoTextStyle = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#FFFFFF'
};
```

#### Title Styling:
```typescript
const titleStyle = {
  fontSize: '19px',
  fontWeight: '700',
  fontFamily: "'Orbitron', sans-serif",
  color: '#FFFFFF',
  textShadow: '0 2px 4px rgba(0,0,0,0.6)',
  marginLeft: '12px'
};

const subtitleStyle = {
  fontSize: '11px',
  color: '#9CA3AF',
  marginLeft: '4px'
};
```

#### Props Interface:
```typescript
interface TopBarProps {
  userId?: string;
  isConnected?: boolean;
}
```

---

## 📱 Layout Structure

### Main Container Component
**File**: `src/components/layout/MainContainer.tsx`

```typescript
const mainContainerStyle = {
  width: '100%',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(180deg, 
    ${colors.background.slate700} 0%, 
    ${colors.background.slate800} 50%, 
    ${colors.background.slate900} 100%
  )`,
  padding: '32px',
  boxSizing: 'border-box'
};
```

### App Panel Component
**File**: `src/components/layout/AppPanel.tsx`

```typescript
const appPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: `linear-gradient(180deg, ${colors.background.panelLight} 0%, ${colors.background.panelDark} 100%)`,
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  boxShadow: shadows.OuterLarge,
  padding: '28px',
  gap: '20px',
  maxWidth: '400px',
  width: '100%'
};

const panelDividerStyle = {
  width: '100%',
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  margin: '0 0 20px 0'
};
```

#### Component Structure:
```typescript
const AppPanel: React.FC<AppPanelProps> = ({ children }) => {
  return (
    <div style={mainContainerStyle}>
      <div style={appPanelStyle}>
        <TopBar />
        <div style={panelDividerStyle} />
        <LCDPanel />
        <ProgressBar />
        <ControlButtons />
        <PTTButton />
      </div>
    </div>
  );
};
```

#### Layout Specifications:
- Container padding: `28px`
- Components gap: `20px`
- Top bar bottom margin: `20px` (via divider)
- Maximum panel width: `400px`

---

## 🎭 Shadows & Effects

### Shadow Definitions
**File**: `src/styles/shadows.ts`

```typescript
export const shadows = {
  // Inner Shadows
  innerLight: 'inset 0 2px 5px rgba(0,0,0,0.35)',
  innerMedium: 'inset 0 3px 6px rgba(0,0,0,0.25)',
  innerDark: 'inset 0 4px 10px rgba(0,0,0,0.4)',
  innerStrong: 'inset 0 3px 6px rgba(0,0,0,0.6)',
  
  // Outer Shadows
  outerSmall: '0 2px 6px rgba(0,0,0,0.3)',
  outerMedium: '0 4px 10px rgba(0,0,0,0.35)',
  outerLarge: '0 8px 20px rgba(0,0,0,0.45)',
  outerXLarge: '0 25px 50px rgba(0,0,0,0.7)',
  
  // 3D Button Shadows
  button3DLarge: '0 5px 0 #000000',
  button3DSmall: '0 4px 0 #000000',
  ptt3D: '0 6px 0 #15803D',
  
  // Glow Effects
  glowGreen: '0 0 10px rgba(74,222,128,0.5)',
  glowRed: '0 0 8px rgba(239,68,68,0.5)'
} as const;

// Type-safe shadow utilities
export type ShadowKey = keyof typeof shadows;
export const getShadow = (key: ShadowKey) => shadows[key];
```

---

## 🎬 Animations

### Animation Utilities
**File**: `src/utils/animations.ts`

```typescript
// Toggle Switch Animation
export const toggleSwitchAnimation = {
  transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  timing: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// PTT Button Press Animation
export const pttButtonAnimation = {
  transform: {
    transition: 'transform 100ms ease-out',
    active: 'translateY(5px)',
    inactive: 'translateY(0px)'
  },
  boxShadow: {
    transition: 'box-shadow 100ms ease-out',
    active: '0 1px 0 #15803D',
    inactive: '0 6px 0 #15803D'
  }
};

// Progress Bar Animation
export const progressBarAnimation = {
  transition: 'width 300ms ease-out',
  timing: {
    duration: 300,
    easing: 'ease-out'
  }
};

// Control Button Press Animation
export const controlButtonAnimation = {
  transform: {
    transition: 'transform 100ms ease-out',
    active: 'translateY(3px)',
    inactive: 'translateY(0px)'
  },
  boxShadow: {
    transition: 'box-shadow 100ms ease-out',
    active: '0 1px 0 #000000',
    inactive: '0 4px 0 #000000'
  }
};

// CSS Animation Classes
export const animationClasses = {
  toggleThumb: 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
  pttButton: 'transition-all duration-100 ease-out',
  progressBar: 'transition-all duration-300 ease-out',
  controlButton: 'transition-all duration-100 ease-out'
} as const;
```

---

## 🔤 Typography

### Typography System
**File**: `src/styles/typography.ts`

```typescript
// Font Families (imported from CSS/Google Fonts)
export const fontFamilies = {
  dseg7: "'DSEG7 Classic Mini Bold', monospace",
  orbitron: "'Orbitron', sans-serif",
  inter: "'Inter', sans-serif"
} as const;

// Font Weights
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900
} as const;

// Font Sizes
export const fontSizes = {
  xs: '11px',    // Subtitle
  sm: '12px',    // Small labels
  base: '14px',  // Body text
  lg: '16px',    // Medium labels
  xl: '18px',    // Logo text
  '2xl': '19px', // Title
  '3xl': '24px', // Large headings
  '4xl': '32px'  // Extra large
} as const;

// Line Heights
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6
} as const;

// Text Shadows
export const textShadows = {
  none: 'none',
  subtle: '0 2px 4px rgba(0,0,0,0.6)',
  strong: '0 3px 6px rgba(0,0,0,0.8)'
} as const;

// Typography Variants
export const typography = {
  // Logo Text
  logo: {
    fontFamily: fontFamilies.dseg7,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.black,
    color: '#FFFFFF',
    textShadow: textShadows.subtle
  },
  
  // Main Title
  title: {
    fontFamily: fontFamilies.orbitron,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
    textShadow: textShadows.subtle
  },
  
  // Subtitle
  subtitle: {
    fontFamily: fontFamilies.inter,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    color: '#9CA3AF'
  },
  
  // LCD Display Text
  lcd: {
    fontFamily: fontFamilies.dseg7,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: '#00FF00',
    textShadow: '0 0 10px rgba(0,255,0,0.5)'
  }
} as const;
```

### Text Sizing System
**File**: `src/styles/textSizing.ts` (extends typography.ts)

```typescript
export const textSizes = {
  // LCD Display Sizes
  channelNumber: '80px',  // Large channel display
  pttText: '32px',        // PTT button text
  chLabel: '28px',        // Channel label
  
  // UI Component Sizes
  title: '19px',          // Main title
  logoText: '18px',       // Logo text
  buttonText: '13px',     // Button labels
  subtitle: '11px',       // Subtitle text
  powerLabel: '10px'      // Power switch label
} as const;

// Component-specific text styles
export const componentTextStyles = {
  // LCD Channel Display
  channelDisplay: {
    fontSize: textSizes.channelNumber,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.dseg7,
    fontWeight: fontWeights.bold,
    letterSpacing: '0.05em'
  },
  
  // PTT Button Text
  pttButtonText: {
    fontSize: textSizes.pttText,
    lineHeight: lineHeights.tight,
    fontFamily: fontFamilies.orbitron,
    fontWeight: fontWeights.bold,
    letterSpacing: '0.1em'
  },
  
  // Control Button Text
  controlButtonText: {
    fontSize: textSizes.buttonText,
    lineHeight: lineHeights.normal,
    fontFamily: fontFamilies.orbitron,
    fontWeight: fontWeights.medium,
    letterSpacing: '0.05em'
  }
} as const;
```

---

## 🔄 State Management

### State Management System
**File**: `src/types/states.ts`

```typescript
// Core Application State
export interface PTTAppState {
  isPowerOn: boolean;
  channel: number;        // Range: 1-999
  isTransmitting: boolean;
  isScanning: boolean;
  progress: number;      // Range: 0-100
}

// User Authentication State
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  } | null;
  isGuest: boolean;
}

// Presence State (Real-time)
export interface PresenceState {
  onlineUsers: Map<string, {
    id: string;
    name: string;
    lastSeen: Date;
    channel: number;
    isTransmitting: boolean;
  }>;
  currentUserChannel: number;
}

// UI State
export interface UIState {
  isUserListModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

// Combined Global State
export interface AppState {
  ptt: PTTAppState;
  auth: AuthState;
  presence: PresenceState;
  ui: UIState;
}

// Initial State
export const initialState: AppState = {
  ptt: {
    isPowerOn: true,
    channel: 100,
    isTransmitting: false,
    isScanning: false,
    progress: 0
  },
  auth: {
    isAuthenticated: false,
    user: null,
    isGuest: false
  },
  presence: {
    onlineUsers: new Map(),
    currentUserChannel: 100
  },
  ui: {
    isUserListModalOpen: false,
    isSettingsModalOpen: false,
    isLoading: false,
    error: null
  }
};

// Action Types
export type AppAction =
  | { type: 'SET_POWER'; payload: boolean }
  | { type: 'SET_CHANNEL'; payload: number }
  | { type: 'SET_TRANSMITTING'; payload: boolean }
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_USER'; payload: AuthState['user'] }
  | { type: 'SET_GUEST'; payload: boolean }
  | { type: 'UPDATE_PRESENCE'; payload: PresenceState['onlineUsers'] }
  | { type: 'SET_UI_STATE'; payload: Partial<UIState> }
  | { type: 'RESET_STATE' };
```

### State Indicators
**File**: `src/components/Indicators.tsx`

#### TX/RX Indicators (Active during transmission/reception)
```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';

interface StatusIndicatorProps {
  active: boolean;
  type: 'TX' | 'RX';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ active, type }) => {
  const color = type === 'TX' ? 'red' : 'blue';
  const bgColor = active ? `bg-${color}-500` : 'bg-gray-600';
  const textColor = active ? `text-${color}-300` : 'text-gray-400';
  const pulseAnimation = active ? 'animate-pulse' : '';

  return (
    <div className={`
      ${bgColor} bg-opacity-20 
      border border-${color}-500 border-opacity-50 
      rounded-md px-2 py-1 flex items-center gap-2
    `}>
      <div className={`
        w-2 h-2 rounded-full 
        ${active ? `bg-${color}-500` : 'bg-gray-500'}
        ${pulseAnimation}
      `} />
      <span className={`
        ${textColor} 
        font-bold text-xs font-mono
      `}>
        {type}
      </span>
    </div>
  );
};

export const TransmissionIndicators: React.FC = () => {
  const { isTransmitting } = useAppSelector(state => state.ptt);

  return (
    <div className="flex gap-2">
      <StatusIndicator active={isTransmitting} type="TX" />
      <StatusIndicator active={false} type="RX" />
    </div>
  );
};
```

#### SCAN Indicator (In control button)
```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';

export const ScanIndicator: React.FC = () => {
  const { isScanning } = useAppSelector(state => state.ptt);

  return (
    <div className={`
      absolute bottom-1 left-1/2 transform -translate-x-1/2
      w-1.5 h-1.5 rounded-full transition-all duration-300
      ${isScanning ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}
    `} />
  );
};
```

---

## 🛠️ Implementation Examples

### Complete PTT Button Composable
```kotlin
@Composable
fun PTTButton(
    onPressStart: () -> Unit,
    onPressEnd: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isPressed by remember { mutableStateOf(false) }
    
    val offset by animateDpAsState(
        targetValue = if (isPressed) 5.dp else 0.dp,
        animationSpec = tween(100)
    )
    
    Box(
        modifier = modifier
            .width(300.dp)
            .height(80.dp)
            .offset(y = offset)
            .clip(RoundedCornerShape(40.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = if (isPressed) {
                        listOf(Color(0xFF32CD32), Color(0xFF228B22))
                    } else {
                        listOf(Color(0xFF4ADE80), Color(0xFF22C55E))
                    }
                )
            )
            .drawBehind {
                // Custom shadow drawing
            }
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        isPressed = true
                        onPressStart()
                        tryAwaitRelease()
                        isPressed = false
                        onPressEnd()
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        // Highlight overlay (idle only)
        if (!isPressed) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .height(24.dp)
                    .align(Alignment.TopCenter)
                    .offset(y = 12.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.25f),
                                Color.Transparent
                            )
                        )
                    )
            )
        }
        
        Text(
            text = "PTT",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            letterSpacing = 8.sp,
            style = LocalTextStyle.current.copy(
                shadow = Shadow(
                    color = Color.Black.copy(alpha = 0.5f),
                    offset = Offset(0f, 2f),
                    blurRadius = 6f
                )
            )
        )
    }
}
```

---

## 📋 Implementation Checklist

### Core Components
**File**: `src/components/`

- [ ] **DisplayPanel.tsx** - LCD display with channel and user info
  - [ ] Import DSEG7 Classic Mini Bold font
  - [ ] Add Orbitron font for UI text
  - [ ] Implement dynamic user name display
  - [ ] Add channel number formatting
  - [ ] Create responsive layout

- [ ] **PTTButton.tsx** - Main push-to-talk button
  - [ ] Implement 3D press effect with shadow/offset
  - [ ] Add touch/mouse feedback
  - [ ] Create gradient backgrounds
  - [ ] Add press state animations
  - [ ] Implement haptic feedback (optional)

- [ ] **ControlButtons.tsx** - Power, Scan, Settings buttons
  - [ ] Create half-capsule shapes
  - [ ] Add silver glowing effects
  - [ ] Implement toggle states
  - [ ] Add icon integration

- [ ] **ChannelSlider.tsx** - Channel selection slider
  - [ ] Custom silver range slider
  - [ ] Real-time value display
  - [ ] Smooth drag interactions

### State Management
**File**: `src/hooks/`

- [ ] **useAppSelector.ts** - Redux/Context selector hooks
- [ ] **useAppDispatch.ts** - Action dispatcher hooks
- [ ] **usePresence.ts** - Real-time presence management
- [ ] **useAuth.ts** - Authentication logic
- [ ] **usePTT.ts** - Push-to-talk functionality

### Real-time Features
**File**: `src/services/`

- [ ] **supabase.ts** - Supabase client configuration
- [ ] **presence.ts** - Real-time presence tracking
- [ ] **broadcast.ts** - Real-time data broadcasting
- [ ] **auth.ts** - Authentication service (Google OAuth)

### UI/UX Features
**File**: `src/components/Modals/`

- [ ] **UserListModal.tsx** - Online users display
  - [ ] Real-time user list
  - [ ] Channel indicators
  - [ ] Presence status
  - [ ] Search/filter functionality

- [ ] **SettingsModal.tsx** - Application settings
  - [ ] Theme preferences
  - [ ] Audio settings
  - [ ] Account settings

### Styling & Theming
**File**: `src/styles/`

- [ ] **tokens.ts** - Design tokens (colors, spacing, typography)
- [ ] **global.css** - Global styles and resets
- [ ] **animations.ts** - Custom animations (pulse, glow effects)
- [ ] **components.css** - Component-specific styles

### Performance & Optimization
- [ ] Implement lazy loading for modals
- [ ] Optimize real-time subscriptions
- [ ] Add error boundaries
- [ ] Implement offline fallbacks
- [ ] Test on various screen sizes
- [ ] Verify accessibility (contrast ratios, touch targets)

### Testing
- [ ] Unit tests for core components
- [ ] Integration tests for state management
- [ ] E2E tests for user flows
- [ ] Performance testing with multiple users
- [ ] Cross-browser compatibility testing

---

## 🎯 Design Fidelity Notes

**Critical for matching design spec:**
1. Shadow layering must be precise (3D effect)
2. Gradient angle and color stops must be exact
3. Corner radius consistency across all components
4. Spacing must be consistent with 4dp grid
5. Font size and letter spacing exact for DSEG7 display
6. Animation timing must be smooth (spring vs linear)
7. Color opacity values for overlays and glows
8. Border thickness and colors for subtle details

**Verification tools:**
- Color picker for exact color matching
- Ruler/measure tool for spacing verification
- Shadow analyzer untuk shadow parameter accuracy
- Animation preview untuk timing verification
