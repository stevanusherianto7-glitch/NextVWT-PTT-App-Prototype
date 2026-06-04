# NextVWT PTT App - Design Specification & Compose Mapping
*Berdasarkan Design Reference: NextVWT_Image_4_Jun_2026__14.26.22.png*

## 🎨 Color Palette

### Primary Colors
```kotlin
object NextVWTColors {
    // Orange (LCD Display)
    val OrangeLight = Color(0xFFFFB84D)
    val OrangeMedium = Color(0xFFFF9500)
    
    // Green (PTT Button)
    val GreenLight = Color(0xFF4ADE80)
    val GreenMedium = Color(0xFF22C55E)
    val GreenDark = Color(0xFF15803D)    // Shadow
    val GreenPressed = Color(0xFF32CD32)
    val GreenPressedDark = Color(0xFF228B22)
    
    // Progress Bar Green
    val ProgressGreen = Color(0xFF4ADE80)
    val ProgressGreenDark = Color(0xFF22C55E)
    
    // Control Buttons (Black)
    val ButtonDark = Color(0xFF333333)
    val ButtonBlack = Color(0xFF0a0a0a)
    val ButtonShadow = Color(0xFF000000)
    
    // Toggle Switch
    val ToggleOrangeLight = Color(0xFFFFB84D)
    val ToggleOrangeDark = Color(0xFFFF9500)
    val ToggleGrayLight = Color(0xFFb8b8b8)
    val ToggleGrayDark = Color(0xFF8a8a8a)
    
    // Background
    val PanelDark = Color(0xFF2d2d2d)
    val PanelBlack = Color(0xFF1c1c1c)
    
    // Logo
    val LogoRed = Color(0xFFFF0000)
    val LogoRedDark = Color(0xFFD60000)
    val LogoGreen = Color(0xFF00FF00)
}
```

## 📐 Component Specifications

### 1. LCD Panel
**Size**: `320dp × 140dp`  
**Corner Radius**: `16dp`

#### Styling:
```kotlin
background = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFB84D), Color(0xFFFF9500))
)
boxShadow = "inset 0 3px 6px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.35)"
border = "2px solid rgba(0,0,0,0.15)"
```

#### Content Layout:
- **Padding**: `20dp horizontal, 12dp vertical`
- **Status Bar** (Top):
  - User icon: `14dp`, color `#000000 @ 60% opacity`, stroke `2.5px`
  - Signal bars: 5 bars, width `6dp`, heights: `4dp, 6.5dp, 9dp, 11.5dp, 14dp`
  
- **CH Label**:
  - Font size: `28sp`
  - Font weight: `700` (Bold)
  - Color: `#000000`
  - Position: Left of channel number

- **Channel Number**:
  - Font family: `DSEG7 Classic Mini Bold`
  - Font size: `80sp`
  - Color: `#FFFFFF`
  - Letter spacing: `6px`
  - Text shadow: `2px 2px 6px rgba(0,0,0,0.5)`
  - Format: 3-digit (001-999)

- **Reflection Overlay**:
  - Height: `48dp` from top
  - Gradient: `rgba(255,255,255,0.15) → transparent`

---

### 2. Progress Bar
**Size**: `320dp × 10dp`  
**Corner Radius**: `5dp`

#### Styling:
```kotlin
background = Color(0xFF2a2a2a)
boxShadow = "inset 0 2px 5px rgba(0,0,0,0.6)"
border = "1px solid rgba(0,0,0,0.3)"

// Progress Fill
progressGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF4ADE80), Color(0xFF22C55E))
)
progressGlow = "0 0 10px rgba(74,222,128,0.5)"
animationDuration = 300.milliseconds
```

---

### 3. Control Buttons

#### SCAN / SET Buttons
**Size**: `70dp × 56dp`  
**Corner Radius**: `12dp`

```kotlin
background = Brush.verticalGradient(
    colors = listOf(Color(0xFF333333), Color(0xFF0a0a0a))
)

// Idle State
boxShadow = "0 5px 0 #000000, 0 7px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"

// Pressed State
boxShadow = "inset 0 3px 6px rgba(0,0,0,0.6)"
translateY = 3.dp
```

**Text**:
- Font size: `13sp`
- Font weight: `700`
- Letter spacing: `0.5px`
- Color: `#FFFFFF`

#### UP / DOWN Buttons
**Size**: `56dp × 36dp`  
**Corner Radius**: `8dp`

```kotlin
background = Brush.verticalGradient(
    colors = listOf(Color(0xFF333333), Color(0xFF0a0a0a))
)

// Idle State
boxShadow = "0 4px 0 #000000, 0 6px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)"

// Pressed State
boxShadow = "inset 0 3px 6px rgba(0,0,0,0.6)"
translateY = 3.dp
```

**Icon**:
- Size: `18dp`
- Stroke width: `3px`
- Color: `#FFFFFF`

#### Button Group Layout
```kotlin
Row(
    horizontalArrangement = Arrangement.spacedBy(12.dp)
) {
    // SCAN button (70×56dp)
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        // UP button (56×36dp)
        // DOWN button (56×36dp)
    }
    // SET button (70×56dp)
}
```

---

### 4. PTT Button
**Size**: `300dp × 80dp`  
**Corner Radius**: `40dp` (pill shape)

#### Styling:
```kotlin
// Idle State
background = Brush.verticalGradient(
    colors = listOf(Color(0xFF4ADE80), Color(0xFF22C55E))
)
boxShadow = "0 6px 0 #15803D, 0 8px 20px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.25)"
translateY = 0.dp

// Pressed State
background = Brush.verticalGradient(
    colors = listOf(Color(0xFF32CD32), Color(0xFF228B22))
)
boxShadow = "inset 0 4px 10px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)"
translateY = 5.dp

animationDuration = 100.milliseconds
```

**Text "PTT"**:
- Font size: `32sp`
- Font weight: `700`
- Letter spacing: `8px`
- Color: `#FFFFFF`
- Text shadow: `0 2px 6px rgba(0,0,0,0.5)`

**Top Highlight** (Idle only):
- Position: `top 12dp, left 40dp, right 40dp`
- Height: `24dp`
- Gradient: `rgba(255,255,255,0.25) → transparent`

---

### 5. Toggle Switch
**Size**: `72dp × 34dp`  
**Corner Radius**: `17dp` (fully rounded)

#### Track:
```kotlin
// ON State
background = Brush.verticalGradient(
    colors = listOf(Color(0xFFFF9500), Color(0xFFFFB84D))
)

// OFF State
background = Brush.verticalGradient(
    colors = listOf(Color(0xFF8a8a8a), Color(0xFFb8b8b8))
)

boxShadow = "inset 0 2px 5px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.15)"
border = "1px solid rgba(0,0,0,0.2)"
```

#### Thumb:
**Size**: `28dp` diameter

```kotlin
background = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFFFFF), Color(0xFFE8E8E8))
)
boxShadow = "0 3px 6px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.9)"

// Position
left = if (isOn) 41.dp else 3.dp

// Animation
springAnimation(
    stiffness = 600f,
    damping = 35f
)
```

---

### 6. Top Bar

#### Logo
**Size**: `44dp × 44dp`

```kotlin
background = Brush.linearGradient(
    colors = listOf(Color(0xFFFF0000), Color(0xFFD60000)),
    start = Offset(0f, 0f),
    end = Offset(1f, 1f)
)
border = "2.5px solid #00FF00"
boxShadow = "inset 0 2px 4px rgba(0,0,0,0.35), 0 2px 10px rgba(255,0,0,0.5)"
```

**Logo Text "N"**:
- Font size: `18sp`
- Font weight: `900`
- Color: `#FFFFFF`

#### Title "NextVWT"
- Font size: `19sp`
- Font weight: `700`
- Font family: `Orbitron`
- Color: `#FFFFFF`
- Text shadow: `0 2px 4px rgba(0,0,0,0.6)`

#### Subtitle "(ID)"
- Font size: `11sp`
- Color: `#9CA3AF` (gray-400)

---

## 📱 Layout Structure

### Main Container
```kotlin
Box(
    modifier = Modifier
        .fillMaxSize()
        .background(
            brush = Brush.verticalGradient(
                colors = listOf(
                    Color(0xFF475569), // slate-700
                    Color(0xFF334155), // slate-800
                    Color(0xFF1e293b)  // slate-900
                )
            )
        )
        .padding(32.dp),
    contentAlignment = Alignment.Center
) {
    // App panel
}
```

### App Panel
```kotlin
Column(
    modifier = Modifier
        .clip(RoundedCornerShape(24.dp))
        .background(
            brush = Brush.verticalGradient(
                colors = listOf(Color(0xFF2d2d2d), Color(0xFF1c1c1c))
            )
        )
        .border(
            width = 1.dp,
            color = Color.White.copy(alpha = 0.05f),
            shape = RoundedCornerShape(24.dp)
        )
        .padding(28.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(20.dp)
) {
    TopBar()
    HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
    LCDPanel()
    ProgressBar()
    ControlButtons()
    PTTButton()
}
```

**Spacing**:
- Container padding: `28dp`
- Components gap: `20dp`
- Top bar bottom padding: `20dp`

---

## 🎭 Shadows & Effects

### Shadow Definitions
```kotlin
object NextVWTShadows {
    // Inner Shadows
    val InnerLight = "inset 0 2px 5px rgba(0,0,0,0.35)"
    val InnerMedium = "inset 0 3px 6px rgba(0,0,0,0.25)"
    val InnerDark = "inset 0 4px 10px rgba(0,0,0,0.4)"
    val InnerStrong = "inset 0 3px 6px rgba(0,0,0,0.6)"
    
    // Outer Shadows
    val OuterSmall = "0 2px 6px rgba(0,0,0,0.3)"
    val OuterMedium = "0 4px 10px rgba(0,0,0,0.35)"
    val OuterLarge = "0 8px 20px rgba(0,0,0,0.45)"
    val OuterXLarge = "0 25px 50px rgba(0,0,0,0.7)"
    
    // 3D Button Shadows
    val Button3D_Large = "0 5px 0 #000000"
    val Button3D_Small = "0 4px 0 #000000"
    val PTT3D = "0 6px 0 #15803D"
    
    // Glow Effects
    val GlowGreen = "0 0 10px rgba(74,222,128,0.5)"
    val GlowRed = "0 0 8px rgba(239,68,68,0.5)"
}
```

---

## 🎬 Animations

### Toggle Switch Animation
```kotlin
val thumbPosition by animateFloatAsState(
    targetValue = if (isOn) 41f else 3f,
    animationSpec = spring(
        dampingRatio = 0.6f,
        stiffness = 600f
    )
)
```

### PTT Button Press
```kotlin
val buttonOffset by animateDpAsState(
    targetValue = if (isPressed) 5.dp else 0.dp,
    animationSpec = tween(durationMillis = 100)
)
```

### Progress Bar
```kotlin
val progressWidth by animateFloatAsState(
    targetValue = progress / 100f,
    animationSpec = tween(durationMillis = 300)
)
```

### Control Button Press
```kotlin
val buttonOffset by animateDpAsState(
    targetValue = if (isPressed) 3.dp else 0.dp,
    animationSpec = tween(durationMillis = 100)
)
```

---

## 🔤 Typography

### Font Families
```kotlin
val dseg7Family = FontFamily(
    Font(R.font.dseg7_classic_mini_bold, FontWeight.Bold)
)

val orbitronFamily = FontFamily(
    Font(R.font.orbitron_regular, FontWeight.Normal),
    Font(R.font.orbitron_bold, FontWeight.Bold),
    Font(R.font.orbitron_black, FontWeight.Black)
)
```

### Font Sizes
```kotlin
object NextVWTTypography {
    val ChannelNumber = 80.sp
    val PTTText = 32.sp
    val CHLabel = 28.sp
    val Title = 19.sp
    val LogoText = 18.sp
    val ButtonText = 13.sp
    val Subtitle = 11.sp
    val PowerLabel = 10.sp
}
```

---

## 🔄 State Management

### Application States
```kotlin
data class PTTAppState(
    val isPowerOn: Boolean = true,
    val channel: Int = 100,        // Range: 1-999
    val isTransmitting: Boolean = false,
    val isScanning: Boolean = false,
    val progress: Int = 0          // Range: 0-100
)
```

### State Indicators

#### TX Indicator (Active during transmission)
```kotlin
Box(
    modifier = Modifier
        .background(Color(0x33EF4444), RoundedCornerShape(6.dp))
        .border(1.dp, Color(0x4DEF4444), RoundedCornerShape(6.dp))
        .padding(horizontal = 8.dp, vertical = 4.dp)
) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(Color(0xFFEF4444))
                // Pulse animation
        )
        Text(
            text = "TX",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFF87171)
        )
    }
}
```

#### SCAN Indicator (In control button)
```kotlin
// Small blue dot at bottom of SCAN button when scanning
Box(
    modifier = Modifier
        .size(6.dp)
        .clip(CircleShape)
        .background(Color(0xFF60A5FA))
        // Pulse animation
)
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

## 📋 Checklist untuk Implementasi Android

- [ ] Import font DSEG7 Classic Mini Bold ke `res/font/`
- [ ] Import font Orbitron (Regular, Bold, Black) ke `res/font/`
- [ ] Setup custom shadow drawing dengan `drawBehind {}` untuk inner shadows
- [ ] Implement 3D button effect dengan conditional shadow + offset
- [ ] Setup spring animations untuk toggle switch
- [ ] Implement touch feedback untuk semua interactive components
- [ ] Add pulse animation untuk TX indicator
- [ ] Setup state management dengan ViewModel
- [ ] Test di berbagai screen sizes untuk responsiveness
- [ ] Verify color accuracy dengan design spec
- [ ] Test accessibility (contrast ratios, touch targets)
- [ ] Implement haptic feedback untuk button presses (optional)

---

## 🎯 Design Fidelity Notes

**Critical untuk matching design spec:**
1. Shadow layering harus presisi (3D effect)
2. Gradient angle dan color stops harus exact
3. Corner radius consistency di semua components
4. Spacing harus konsisten dengan 4dp grid
5. Font size dan letter spacing exact untuk DSEG7 display
6. Animation timing harus smooth (spring vs linear)
7. Color opacity values untuk overlays dan glows
8. Border thickness dan colors untuk subtle details

**Tools untuk verifikasi:**
- Color picker untuk exact color matching
- Ruler/measure tool untuk spacing verification
- Shadow analyzer untuk shadow parameter accuracy
- Animation preview untuk timing verification
