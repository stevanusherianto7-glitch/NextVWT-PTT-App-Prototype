# NextVWT PTT App - Layer Breakdown & Compose Mapping

## Component Structure

### 1. ToggleSwitch Component
**File**: `ToggleSwitch.tsx`

#### Layer Breakdown:
- **Track (Capsule)**
  - Size: `80dp × 36dp`
  - Corner radius: `18dp` (fully rounded)
  - Gradient (ON): `#FFA500 → #FFC04D` (top to bottom)
  - Gradient (OFF): `#999999 → #CCCCCC` (top to bottom)
  - Inner shadow: `inset 0 2px 4px rgba(0,0,0,0.3)`
  - Outer shadow: `0 1px 2px rgba(0,0,0,0.1)`

- **Thumb (Circle)**
  - Size: `28dp` diameter
  - Corner radius: `14dp` (circular)
  - Gradient: `#FFFFFF → #E0E0E0` (top to bottom)
  - Shadow: `0 4px 6px rgba(0,0,0,0.4)`
  - Inner highlight: `inset 0 1px 2px rgba(255,255,255,0.8)`
  - Position: `2dp` from left (OFF), `46dp` from left (ON)
  - Animation: Spring animation (stiffness: 500, damping: 30)

#### Compose Mapping:
```kotlin
@Composable
fun ToggleSwitch(isOn: Boolean, onToggle: () -> Unit) {
    Box(
        modifier = Modifier
            .width(80.dp)
            .height(36.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = if (isOn) {
                        listOf(Color(0xFFFFA500), Color(0xFFFFC04D))
                    } else {
                        listOf(Color(0xFF999999), Color(0xFFCCCCCC))
                    }
                )
            )
            .clickable { onToggle() }
    ) {
        // Thumb circle with animation
    }
}
```

---

### 2. LCDPanel Component
**File**: `LCDPanel.tsx`

#### Layer Breakdown:
- **Background Panel**
  - Size: `280dp × 160dp`
  - Corner radius: `24dp`
  - Gradient: `#FFC966 → #FFA500` (top to bottom)
  - Inner shadow: `inset 0 4px 8px rgba(0,0,0,0.2)`
  - Outer shadow: `0 6px 12px rgba(0,0,0,0.3)`

- **Reflection Overlay**
  - Height: `64dp` from top
  - Corner radius: `24dp` (top only)
  - Gradient: `rgba(255,255,255,0.1) → transparent` (top to bottom)

- **CH Label**
  - Font size: `24sp`
  - Font weight: `700` (Bold)
  - Color: `#000000`
  - Opacity: `90%`

- **Channel Number**
  - Font family: `DSEG7 Classic Mini Bold`
  - Font size: `96sp`
  - Color: `#FFFFFF`
  - Letter spacing: `8px`
  - Text shadow: `2px 2px 4px rgba(0,0,0,0.6)`
  - Format: 3-digit with leading zeros (e.g., "001", "042", "999")

- **Status Icons**
  - User icon: `16dp`, color `#000000` with `70%` opacity
  - Signal bars: 5 bars, width `4dp` each, heights: `3dp, 6dp, 9dp, 12dp, 15dp`

#### Compose Mapping:
```kotlin
@Composable
fun LCDPanel(channel: Int, userCount: Int = 3) {
    Box(
        modifier = Modifier
            .width(280.dp)
            .height(160.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(Color(0xFFFFC966), Color(0xFFFFA500))
                )
            )
    ) {
        // Reflection overlay
        // CH Label
        // Channel number with DSEG7 font
        // Status icons
    }
}
```

---

### 3. ProgressBar Component
**File**: `ProgressBar.tsx`

#### Layer Breakdown:
- **Background Track**
  - Size: `280dp × 12dp`
  - Corner radius: `6dp`
  - Color: `#333333`
  - Inner shadow: `inset 0 2px 4px rgba(0,0,0,0.5)`

- **Progress Fill**
  - Height: `12dp`
  - Corner radius: `6dp`
  - Gradient: `#22C55E → #16A34A` (left to right)
  - Glow shadow: `0 0 8px rgba(34,197,94,0.6)`
  - Animation: `width` transition, duration `300ms`

#### Compose Mapping:
```kotlin
@Composable
fun ProgressBar(progress: Int) {
    Box(
        modifier = Modifier
            .width(280.dp)
            .height(12.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(Color(0xFF333333))
    ) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(progress / 100f)
                .clip(RoundedCornerShape(6.dp))
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(Color(0xFF22C55E), Color(0xFF16A34A))
                    )
                )
        )
    }
}
```

---

### 4. ControlButtons Component
**File**: `ControlButtons.tsx`

#### Layer Breakdown:
- **SCAN/SET Buttons**
  - Size: `80dp × 60dp`
  - Corner radius: `16dp`
  - Gradient: `#444444 → #000000` (top to bottom)
  - Shadow: `0 6px 0 #000000` (3D effect)
  - Outer shadow: `0 8px 12px rgba(0,0,0,0.4)`
  - Inner highlight: `inset 0 1px 0 rgba(255,255,255,0.25)`
  - Text color: `#FFFFFF`
  - Active state: `translateY(2px)`

- **UP/DOWN Buttons**
  - Size: `60dp × 36dp`
  - Corner radius: `12dp`
  - Gradient: `#555555 → #222222` (top to bottom)
  - Shadow: `0 4px 0 #111111` (3D effect)
  - Outer shadow: `0 6px 8px rgba(0,0,0,0.4)`
  - Inner highlight: `inset 0 1px 0 rgba(255,255,255,0.2)`
  - Icon: Chevron (Up/Down), size `20dp`, stroke width `3dp`
  - Active state: `translateY(2px)`

#### Compose Mapping:
```kotlin
@Composable
fun ControlButtons(
    onScan: () -> Unit,
    onSet: () -> Unit,
    onUp: () -> Unit,
    onDown: () -> Unit
) {
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        // SCAN button
        // UP/DOWN buttons column
        // SET button
    }
}
```

---

### 5. PTTButton Component
**File**: `PTTButton.tsx`

#### Layer Breakdown:
- **Button Background**
  - Size: `280dp × 100dp`
  - Corner radius: `50dp` (pill shape)
  - Gradient (IDLE): `#76FF03 → #00C853` (top to bottom)
  - Gradient (ACTIVE): `#00E676 → #00C853` (top to bottom)
  - Shadow (IDLE): `0 6px 0 #00A040` (3D effect)
  - Outer shadow (IDLE): `0 8px 16px rgba(0,0,0,0.4)`
  - Inner highlight: `inset 0 2px 0 rgba(255,255,255,0.3)`
  - Shadow (ACTIVE): `inset 0 4px 8px rgba(0,0,0,0.3)`
  - Active state: `translateY(4px)`

- **Text "P T T"**
  - Font size: `36sp`
  - Font weight: `700` (Bold)
  - Color: `#FFFFFF`
  - Letter spacing: `widest` (~0.1em)
  - Text shadow: `0 2px 4px rgba(0,0,0,0.4)`

- **Top Highlight**
  - Position: `top 8dp, left 32dp, right 32dp`
  - Height: `32dp`
  - Corner radius: `16dp` (circular)
  - Gradient: `rgba(255,255,255,0.2) → transparent` (top to bottom)

#### Compose Mapping:
```kotlin
@Composable
fun PTTButton(onPressStart: () -> Unit, onPressEnd: () -> Unit) {
    var isPressed by remember { mutableStateOf(false) }
    
    Box(
        modifier = Modifier
            .width(280.dp)
            .height(100.dp)
            .offset(y = if (isPressed) 4.dp else 0.dp)
            .clip(RoundedCornerShape(50.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = if (isPressed) {
                        listOf(Color(0xFF00E676), Color(0xFF00C853))
                    } else {
                        listOf(Color(0xFF76FF03), Color(0xFF00C853))
                    }
                )
            )
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
        // "P T T" text
        // Top highlight overlay
    }
}
```

---

## Layout Structure

### Main App Layout
**File**: `App.tsx`

#### Spacing & Alignment:
- Container padding: `24dp`
- Components vertical spacing: `24dp`
- All components: `center horizontal alignment`
- Background: Dark gradient (`#334155 → #1e293b`)

#### Component Order (Top to Bottom):
1. **TopBar** (with Logo + Toggle)
   - Logo size: `48dp × 48dp`
   - Logo gradient: `#FF0000 → #CC0000`
   - Logo border: `3dp solid #00FF00`
   - Title font size: `20sp`
   - Spacing between logo and title: `12dp`

2. **LCDPanel** (`280dp × 160dp`)

3. **ProgressBar** (`280dp × 12dp`)

4. **ControlButtons** (Row layout)
   - Spacing: `16dp`

5. **PTTButton** (`280dp × 100dp`)

---

## Design Tokens

### Colors
```kotlin
object NextVWTColors {
    val OrangeLight = Color(0xFFFFC966)
    val OrangeDark = Color(0xFFFFA500)
    val OrangeToggle = Color(0xFFFFC04D)
    
    val GreenLight = Color(0xFF76FF03)
    val GreenMedium = Color(0xFF00E676)
    val GreenDark = Color(0xFF00C853)
    val GreenShadow = Color(0xFF00A040)
    
    val ProgressGreen = Color(0xFF22C55E)
    val ProgressGreenDark = Color(0xFF16A34A)
    
    val ButtonDark = Color(0xFF444444)
    val ButtonBlack = Color(0xFF000000)
    val ButtonMedium = Color(0xFF555555)
    val ButtonGray = Color(0xFF222222)
    
    val LogoRed = Color(0xFFFF0000)
    val LogoGreen = Color(0xFF00FF00)
}
```

### Shadows
```kotlin
object NextVWTShadows {
    val InnerShadowLight = "inset 0 2px 4px rgba(0,0,0,0.3)"
    val InnerShadowMedium = "inset 0 4px 8px rgba(0,0,0,0.2)"
    val InnerShadowDark = "inset 0 4px 8px rgba(0,0,0,0.3)"
    
    val OuterShadowSmall = "0 2px 4px rgba(0,0,0,0.2)"
    val OuterShadowMedium = "0 6px 12px rgba(0,0,0,0.3)"
    val OuterShadowLarge = "0 8px 16px rgba(0,0,0,0.4)"
    
    val Button3D_Large = "0 6px 0 #000000"
    val Button3D_Small = "0 4px 0 #111111"
    val PTT3D = "0 6px 0 #00A040"
}
```

### Corner Radius
```kotlin
object NextVWTRadius {
    val Small = 6.dp
    val Medium = 12.dp
    val Large = 16.dp
    val ExtraLarge = 24.dp
    val Pill = 50.dp
}
```

---

## Animation Specifications

### Toggle Switch Animation
- Type: Spring animation
- Stiffness: `500`
- Damping: `30`
- Property: `offsetX` (thumb position)

### PTT Button Press
- Type: Linear transition
- Duration: `150ms`
- Property: `offsetY` (vertical translation)
- Value: `0dp` → `4dp`

### Progress Bar
- Type: Linear transition
- Duration: `300ms`
- Property: `width`

### Control Button Press
- Type: Linear transition
- Duration: `100ms`
- Property: `offsetY`
- Value: `0dp` → `2px`

---

## Font Specifications

### DSEG7 Classic Mini Bold
- **Usage**: Channel number display
- **Size**: `96sp`
- **Weight**: Bold
- **Letter spacing**: `8px`
- **Source**: https://github.com/keshikan/DSEG

### System Font (Orbitron fallback)
- **Usage**: Labels, buttons, titles
- **Sizes**: 
  - Title: `20sp`
  - CH Label: `24sp`
  - Button text: `16sp`
  - PTT text: `36sp`
- **Weight**: `400` (Regular), `700` (Bold)

---

## State Management

### App States
1. **Power State**: `isPowerOn` (Boolean)
   - Affects all component opacity
   - Controls interaction availability

2. **Channel State**: `channel` (Int, 1-999)
   - Displayed in LCD Panel
   - Modified by Up/Down buttons

3. **Transmission State**: `isTransmitting` (Boolean)
   - Triggered by PTT button press
   - Shows TX indicator
   - Animates progress bar

4. **Scanning State**: `isScanning` (Boolean)
   - Triggered by SCAN button
   - Auto-increments channel
   - Shows SCAN indicator

### State Indicators
- **TX Indicator**: Red pulsing dot + "TX" label (top-right)
- **SCAN Indicator**: Blue pulsing dot + "SCAN" label (top-left)

---

## Implementation Notes for Android Kotlin + Jetpack Compose

1. **Gradient Implementation**: Use `Brush.verticalGradient()` or `Brush.horizontalGradient()`

2. **Shadow Implementation**: 
   - Use `Modifier.shadow()` for outer shadows
   - Use `drawBehind {}` with `drawIntoCanvas {}` for inner shadows

3. **Font Loading**: 
   - Add DSEG7 font to `res/font/` directory
   - Define in `Font()` and `FontFamily()`

4. **3D Button Effect**:
   - Use `Modifier.offset()` for position shift
   - Combine with conditional shadow rendering

5. **Animation**:
   - Use `animateFloatAsState()` for smooth transitions
   - Use `Animatable` for spring animations

6. **Touch Feedback**:
   - Use `Modifier.pointerInput()` with `detectTapGestures()`
   - Track press/release states for visual feedback
