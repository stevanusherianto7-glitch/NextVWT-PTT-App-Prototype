# NextVWT Super Master Prompt Design System & UI/UX Guide

This document defines the visual standards, design tokens, component specifications, and interactive states for the NextVWT Push-to-Talk (PTT) application. It is based on the Glass Crystal design paradigm, focusing on depth, translucent materials, and premium aesthetics.

---

## 1. Overview & Technical Specifications

NextVWT is a modern, futuristic Walkie-Talkie (Push-to-Talk) Android application featuring a glass crystal visual language that delivers a premium, clean, and high-tech experience.

### Platform Target
- **Platform**: Android (Kotlin / Jetpack Compose)
- **Framework**: Jetpack Compose
- **Architecture**: MVVM + Repository
- **Min SDK**: 21 (Android 5.0+)
- **Target Device**: Phone (Portrait)

### Design Principles
1. **Glass Crystal & Depth**: Translucent glass materials featuring blur, refraction, and inner/outer glow.
2. **Clarity First**: Prominent information display with high-contrast text and a strong hierarchy.
3. **One-Hand Operation**: Large touch targets positioned for easy thumb reach.
4. **Status Awareness**: Immediate visual feedback for network connection, transmitting (TX), and receiving (RX) states.
5. **Consistency**: Unified shape languages, typography, and spacing.

---

## 2. Global Tokens

### Core Color Palette
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Crystal Green** | `#00E676` | Primary Accent / Success / Transmission Idle |
| **Crystal Amber** | `#FF8300` | Warning / Active LCD Panel Glow / Channel Indication |
| **Crystal Blue** | `#2979FF` | Info / Connection Connecting / Scan Active |
| **Crystal Red** | `#FF3D00` | Danger / Transmitting (TX) Active Glow |

### Neutrals (Glass System)
| Token Name | Hex Code | Opacity | Usage |
| :--- | :--- | :--- | :--- |
| **Glass White** | `#FFFFFF` | 80% (`#FFFFFFCC`) | Outer highlights, glass surfaces |
| **Glass Light** | `#FFFFFF` | 40% (`#FFFFFF66`) | Subtle reflection highlights |
| **Glass Gray** | `#B0BEC5` | 80% (`#B0BEC5CC`) | Secondary button tracks, disabled states |
| **Glass Dark** | `#263238` | 80% (`#263238CC`) | Background plate, dark glass overlays |

### Typography
- **Digital (Channel Number)**:
  - **Font**: `DSEG7 Classic Mini Bold` (or fallback monospace)
  - **Size**: `96sp` / `80dp`
  - **Vibe**: Retro LED / Digital segmented indicator
- **Heading / Title**:
  - **Font**: `Poppins SemiBold`
  - **Size**: `20sp`
- **Body / Label / Button**:
  - **Font**: `Roboto Regular` / `Poppins Bold` (PTT)
  - **Size**: `12sp` - `16sp`

### Grid, Layout & Spacing
- **Base Grid**: `8dp` grid system. All component margins, paddings, and sizing are multiples of 8dp.
- **Corner Radius**:
  - **Small**: `8dp` (Indicators, tooltips)
  - **Medium**: `16dp` (Control buttons, small cards)
  - **Large**: `24dp` (LCD display frame)
  - **Extra Large**: `32dp` (Main panel container)
  - **Pill**: `999dp` (PTT button, toggle switch track)

---

## 3. Glass Crystal Design System Flavors (V2 - V5)

The NextVWT interface features four distinct visual flavors of the Glass Crystal design system, each providing a unique material quality, refraction depth, and glow signature.

### Summary Comparison Table
| Specification | Glass Crystal V2 | Glass Crystal V3 | Glass Crystal V4 | Glass Crystal V5 |
| :--- | :--- | :--- | :--- | :--- |
| **Theme Name** | Premium Crystal (Diamond Cut) | Glass Rounded (Soft Crystal) | Dark Glass (Smoked Crystal) | Aurora Glass (Color Crystal) |
| **Material Quality** | High-refraction, sharp faceted edges | Soft, rounded polished glass | Semi-translucent dark smoked glass | Translucent glass with colorful back-gradient |
| **Depth & Refraction** | Extremely deep, sharp border bevels | Smooth, deep rounded bevels | Stealth, deep dark plate inset | Multi-layered colored refraction |
| **Highlight Style** | Sharp & brilliant white flares | Diffuse, soft white glow | Thin, elegant edge highlights | Dynamic colored reflections |
| **Ambient Glow** | Ice Blue (`#E0F7FA` glow) | Cyan Blue (`#E0F2F1` glow) | Neon Green (`#39FF14` glow) | Purple / Magenta (`#E040FB` glow) |
| **Accent Color** | Emerald Green (`#00C853`) | Cyan / Cobalt Blue (`#00B0FF`) | Neon Green (`#00E676`) | Purple / Hot Pink (`#FF4081`) |
| **Vibe** | Futuristic Premium | Clean & Modern | Rugged & Professional | Stylish & Expressive |

---

## 4. Component Sizing & Styling Specs

### A. LCD Display
- **Sizing**: `320dp x 140dp`
- **Bevel Frame**: Inset shadow border, `24dp` corner radius.
- **Background Gradient**:
  - V2: `#FFB84D → #FF9500` (Amber)
  - V4: `#004D40 → #00241A` (Dark Green)
- **Overlay**: Glossy diagonal sheen reflection from top-left to bottom-right.
- **Text Layout**:
  - Top: User nickname ("Pebe Herianto") on left, 5-bar signal strength indicator on right.
  - Middle: large `CH` label (28sp) and 3-digit channel number (e.g. `136`) using DSEG7 font.
  - Bottom: Group icon and active user count indicator (e.g., `01`).

### B. Control Buttons (SCAN, UP/DOWN, SET)
- **Sizing**:
  - SCAN & SET: `70dp x 56dp` (Medium corner radius: `12dp`)
  - UP/DOWN Column: `56dp x 36dp` per button (Corner radius: `8dp`)
- **3D Effect**:
  - Idle: `0 5px 0 #000000` shadow offset.
  - Pressed: `0 1px 0 #000000` shadow offset, translates down by `4dp`.
- **Material**: Dark metallic plate with a glass refraction ring on the outer bezel.

### C. PTT (Push-To-Talk) Button
- **Sizing**: `300dp x 80dp` (Pill-shaped, `40dp` corner radius).
- **Text**: `PTT` (32sp, Poppins Bold, letter-spacing `6dp`).
- **Glow states**:
  - **Idle**: Rich green gradient with top-inner white reflection highlight.
  - **Active (TX)**: Pulsing red gradient (`#FF3D00`) with red ambient glow.
  - **Receiving (RX)**: Active green glow, pulsing green borders.

---

## 5. Interaction States & Micro-Interactions

1. **Tombol Press (Tactile Feedback)**:
   - On Press: Play physical click sound (50ms sine chirp) + trigger haptic vibration (15ms).
   - On Release: Play Roger Beep tone (Motorola style 1380Hz) + trigger haptic vibration (10ms).
2. **Status Change**:
   - Transits connection state (Offline → Connecting → Online) using a smooth color sweep animation (`300ms`).
3. **Channel Change**:
   - Number segments on the LCD display flip or cross-fade smoothly with a `150ms` ease-in-out transition.
4. **Connection Pulse**:
   - While connecting, the status badge pulses (`1.5s` duration, radial ripple expanding outward).
5. **Power Toggle**:
   - Sliding the power switch triggers a slide transition (`200ms` spring physics) and fades out the LCD backlight.

---

## 6. Figma Export & Asset Specifications
- All icons (User, Group, Channel, Scan, Mic, Volume) must be exported as scalable vector graphics (`SVG`) to maintain crisp glass rendering on high-DPI screens.
- Image assets (e.g., dial textures, noise maps) should be exported at `@1x`, `@2x`, and `@3x` resolution in 32-bit `PNG` format with alpha transparency.
- Layouts must be built entirely with Auto Layout constraints to adapt seamlessly to varying screen dimensions.
