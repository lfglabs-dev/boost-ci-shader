// ============================================================================
// Boost-CI Procedural Fragment Shader (WebGL2 / OpenGL ES 3.0 / Shadertoy)
// ----------------------------------------------------------------------------
// - 100% Exact Euclidean Circular SDF & Gradients (Zero Bitmaps / Zero Textures)
// - Dual Optical-Size Variants via `u_variant`:
//     * 0.0 = High-Resolution Display Variant (104.5px ring, sharp 7:30 tip)
//     * 1.0 = Small / Favicon Bold Variant (178px ring, 70px anti-bleed gap)
// - Adaptive Dark-Theme Support via `u_dark_mode` (adapts dark gray/black
//   needle & track into refined brushed light metallic gray)
// - 4.4s Single-Shot Tachometer Choreography & Semantic Color Evolution:
//     Green-Lime start -> Boost Orange-Gold -> Vivid Scarlet Red struggle
//     -> cools back to Orange-Gold, sweeps highlight, and stops cleanly!
// - Define SHADERTOY when pasting into Shadertoy.com.
// ============================================================================

#ifndef SHADERTOY
#ifdef GL_ES
precision highp float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_progress;    // [0..1.12] manual gauge boost (-1.0 = exact static orange ref)
uniform float u_animate;     // 1.0 = 4.4s single-shot boost to orange stop, 0.0 = manual
uniform float u_speed;       // Animation speed multiplier (default 1.0)
uniform float u_bg_alpha;    // 1.0 = solid background, 0.0 = transparent (premultiplied)
uniform float u_variant;     // 0.0 = High-Resolution Display, 1.0 = Small / Favicon Bold
uniform float u_dark_mode;   // 0.0 = Light Theme, 1.0 = Dark Theme (light-gray needle/track)

out vec4 fragColor;
#endif

const float PI  = 3.14159265358979323846;
const float TAU = 6.28318530717958647692;
const float DEG = 0.01745329251994329577;

// ----------------------------------------------------------------------------
// Variant 0 (High-Resolution Display): Exact Euclidean Circular Crescent SDF
// ----------------------------------------------------------------------------
float sdHiResDialRing(vec2 p) {
    const vec2  C       = vec2(514.50, 530.00);
    const vec2  C_TAPER = vec2(522.9018, 593.8177);
    const vec2  C_CAP   = vec2(728.7504, 755.7728);
    const vec2  P_TIP   = vec2(281.6046, 809.0914);
    const float R_OUT   = 363.50;
    const float R_IN    = 259.00;
    const float R_TAPER = 323.3683;
    const float R_CAP   = 52.25;

    vec2  d   = p - C;
    float r   = length(d);
    float th  = atan(d.y, d.x);
    float th1 = (th > 1.8) ? (th - TAU) : th;

    if (th1 > 0.811578) return length(p - C_CAP) - R_CAP;
    if (th1 < -4.016976) return length(p - P_TIP);

    float dOut = r - R_OUT;
    float dIn  = (th1 > -1.701696) ? (R_IN - r) : (R_TAPER - length(p - C_TAPER));
    return max(dOut, dIn);
}

// ----------------------------------------------------------------------------
// Variant 1 (Small / Favicon Bold): ~91% Tight Fill, 178px Ring, R=18 Micro-Tip
// ----------------------------------------------------------------------------
float sdFaviconDialRing(vec2 p) {
    const vec2  C       = vec2(512.00, 532.00);
    const vec2  C_TAPER = vec2(559.4409, 638.5541);
    const vec2  C_CAP   = vec2(792.8584, 780.4825);
    const vec2  C_TIP   = vec2(191.1744, 841.8176);
    const vec2  T_OUT   = vec2(0.694658, 0.719340);
    const vec2  T_IN    = vec2(0.483227, 0.875495);
    const float R_OUT   = 464.00;
    const float R_IN    = 286.00;
    const float R_TAPER = 402.6379;
    const float R_CAP   = 89.00;
    const float R_TIP   = 18.00;

    vec2  d   = p - C;
    float r   = length(d);
    float th  = atan(d.y, d.x);
    float th1 = (th > 1.8) ? (th - TAU) : th;

    if (th1 > 0.724312) return length(p - C_CAP) - R_CAP;
    if (th1 < -3.2) {
        vec2 q = p - C_TIP;
        if (dot(q, T_OUT) > 0.0 && dot(q, T_IN) > 0.0) {
            return length(q) - R_TIP;
        }
    }

    float dOut = r - R_OUT;
    float dIn  = (th1 > -1.989675) ? (R_IN - r) : (R_TAPER - length(p - C_TAPER));
    return max(dOut, dIn);
}

// ----------------------------------------------------------------------------
// Variant 0 Needle SDF (High-Resolution Precision Razor Needle)
// ----------------------------------------------------------------------------
float sdHiResNeedleLocal(vec2 rp, out float tGrad) {
    vec2 a = vec2(460.16, 594.64);
    vec2 b = vec2(773.26, 340.70) - a;
    vec2 rel = rp - a;
    float sh = length(b);
    float qy = dot(rel, b) / sh;
    float t  = clamp(qy / sh, 0.0, 1.0);
    float s  = (rel.x * (-b.y) + rel.y * b.x) / sh - 0.90 * t * (1.0 - t);
    float qx = abs(s);

    float ra = 50.36;
    float rb = 1.78;
    float slope = (ra - rb) / sh;
    float c = sqrt(max(1.0 - slope * slope, 1e-6));
    float k = qx * (-slope) + qy * c;

    float d;
    if (k < 0.0) d = length(vec2(qx, qy)) - ra;
    else if (k > c * sh) d = length(vec2(qx, qy - sh)) - rb;
    else d = qx * c + qy * slope - ra;

    vec2 gVec = vec2(359.0, -282.0);
    tGrad = clamp(dot(rp - vec2(415.0, 622.0), gVec) / dot(gVec, gVec), 0.0, 1.0);
    return d - 4.70 * t * (1.0 - t);
}

// ----------------------------------------------------------------------------
// Variant 1 Needle SDF (Small / Favicon Bold Optical Needle: R=82 -> R=15)
// ----------------------------------------------------------------------------
float sdFaviconNeedleLocal(vec2 rp, out float tGrad) {
    vec2 a = vec2(454.45, 594.52);
    vec2 b = vec2(790.41, 322.95) - a;
    vec2 rel = rp - a;
    float sh = length(b);
    float qy = dot(rel, b) / sh;
    float t  = clamp(qy / sh, 0.0, 1.0);
    float qx = abs((rel.x * (-b.y) + rel.y * b.x) / sh);

    float ra = 82.00;
    float rb = 15.00;
    float slope = (ra - rb) / sh;
    float c = sqrt(max(1.0 - slope * slope, 1e-6));
    float k = qx * (-slope) + qy * c;

    float d;
    if (k < 0.0) d = length(vec2(qx, qy)) - ra;
    else if (k > c * sh) d = length(vec2(qx, qy - sh)) - rb;
    else d = qx * c + qy * slope - ra;

    vec2 gVec = vec2(407.0, -325.0);
    tGrad = clamp(dot(rp - vec2(395.0, 635.0), gVec) / dot(gVec, gVec), 0.0, 1.0);
    return d - 14.0 * t * (1.0 - t);
}

float easeOutPow(float u, float p) {
    return 1.0 - pow(max(1.0 - clamp(u, 0.0, 1.0), 0.0), p);
}
float easeInOut(float u) {
    u = clamp(u, 0.0, 1.0);
    return u * u * (3.0 - 2.0 * u);
}

// ----------------------------------------------------------------------------
// 4.4s Single-Shot Tachometer Kinematics (Green -> Orange -> Red -> Orange Stop)
// ----------------------------------------------------------------------------
void getBoostKinematics(float time, float manualProgress, float animateFlag,
                        out float needleRotRad, out float shimmerX,
                        out float sparkGlow, out float greenStart, out float redHeat) {
    const float START_DEG = -189.0;
    const float DURATION  = 4.4;

    if (animateFlag < 0.5) {
        if (manualProgress < 0.0) {
            // Exact static reference pose (0 deg, pure Boost Orange-Gold)
            needleRotRad = 0.0;
            shimmerX     = -1000.0;
            greenStart   = 0.0;
            redHeat      = 0.0;
            sparkGlow    = 0.0;
            return;
        }
        float p = clamp(manualProgress, 0.0, 1.15);
        float deg = (p <= 1.0) ? mix(START_DEG, 0.0, p) : (p - 1.0) * 166.15;
        needleRotRad = deg * DEG;
        shimmerX     = -1000.0;
        greenStart   = 1.0 - smoothstep(0.20, 0.48, p);
        redHeat      = smoothstep(0.58, 0.98, p);
        sparkGlow    = redHeat * 0.70;
        return;
    }

    // Single-shot clamp: once t >= 4.4s, stays parked cleanly at 0 deg Orange-Gold!
    if (time >= DURATION) {
        needleRotRad = 0.0;
        shimmerX     = -1000.0;
        greenStart   = 0.0;
        redHeat      = 0.0;
        sparkGlow    = 0.0;
        return;
    }

    float c = clamp(time / DURATION, 0.0, 1.0);
    float deg = START_DEG;
    shimmerX   = -1000.0;
    sparkGlow  = 0.0;
    greenStart = 0.0;
    redHeat    = 0.0;
    float tremorAmp = 0.0;

    if (c < 0.050) {
        // 1a. Quick idle throttle blip (Green-Lime start)
        float u = c / 0.050;
        deg = mix(-189.0, -165.0, easeOutPow(u, 2.4));
        greenStart = 1.00;
        sparkGlow  = u * 0.22;
        tremorAmp  = 0.35;
    } else if (c < 0.100) {
        // 1b. Blip settle before launch (Green-Lime)
        float u = (c - 0.050) / 0.050;
        deg = mix(-165.0, -182.0, easeInOut(u));
        greenStart = 1.00;
        sparkGlow  = (1.0 - u) * 0.18;
        tremorAmp  = 0.25;
    } else if (c < 0.220) {
        // 2a. 1st Gear brisk launch (Green warming toward chartreuse-gold)
        float u = (c - 0.100) / 0.120;
        deg = mix(-182.0, -104.0, easeOutPow(u, 2.1));
        greenStart = mix(1.00, 0.72, smoothstep(0.35, 1.0, u));
        sparkGlow  = 0.30 + 0.30 * sin(u * PI);
        tremorAmp  = 0.30 * u;
    } else if (c < 0.265) {
        // 2b. Clutch-in 1->2 upshift RPM drop
        float u = (c - 0.220) / 0.045;
        deg = mix(-104.0, -120.0, easeInOut(u));
        greenStart = mix(0.72, 0.55, easeInOut(u));
        sparkGlow  = 0.18;
    } else if (c < 0.400) {
        // 3a. 2nd Gear pull: transitions out of Green into pure Boost Gold-Orange!
        float u = (c - 0.265) / 0.135;
        deg = mix(-120.0, -46.0, easeOutPow(u, 2.3));
        greenStart = mix(0.55, 0.0, smoothstep(0.0, 0.92, u));
        redHeat    = smoothstep(0.70, 1.0, u) * 0.12;
        sparkGlow  = 0.42 + 0.32 * u;
        tremorAmp  = 0.45 * u;
    } else if (c < 0.445) {
        // 3b. Clutch-in 2->3 upshift RPM drop
        float u = (c - 0.400) / 0.045;
        deg = mix(-46.0, -61.0, easeInOut(u));
        redHeat   = mix(0.12, 0.05, easeInOut(u));
        sparkGlow = 0.22;
    } else if (c < 0.570) {
        // 4a. 3rd Gear pull — wind drag thickens & heats into vivid scarlet!
        float u = (c - 0.445) / 0.125;
        deg = mix(-61.0, -21.0, easeOutPow(u, 2.6));
        redHeat   = mix(0.05, 0.48, easeInOut(u));
        sparkGlow = mix(0.45, 0.78, u);
        tremorAmp = mix(0.35, 0.85, u);
    } else if (c < 0.615) {
        // 4b. High-load struggle — straining surge 1
        float u = (c - 0.570) / 0.045;
        deg = mix(-21.0, -14.5, easeInOut(u));
        redHeat   = mix(0.48, 0.68, easeInOut(u));
        sparkGlow = 0.84;
        tremorAmp = 0.95;
    } else if (c < 0.645) {
        // 4c. Momentary boost hesitation / load dip 1
        float u = (c - 0.615) / 0.030;
        deg = mix(-14.5, -17.2, easeInOut(u));
        redHeat   = mix(0.68, 0.55, easeInOut(u));
        sparkGlow = 0.65;
        tremorAmp = 0.80;
    } else if (c < 0.700) {
        // 4d. Fighting harder against load — surge 2 (bright scarlet!)
        float u = (c - 0.645) / 0.055;
        deg = mix(-17.2, -6.8, easeOutPow(u, 1.9));
        redHeat   = mix(0.55, 0.86, easeInOut(u));
        sparkGlow = 0.94;
        tremorAmp = 1.15;
    } else if (c < 0.730) {
        // 4e. Second slight load falter right before redline
        float u = (c - 0.700) / 0.030;
        deg = mix(-6.8, -9.0, easeInOut(u));
        redHeat   = mix(0.86, 0.74, easeInOut(u));
        sparkGlow = 0.78;
        tremorAmp = 1.00;
    } else if (c < 0.780) {
        // 4f. Final full-boost push punching to +2.6 deg — VIVID REDLINE!
        float u = (c - 0.730) / 0.050;
        deg = mix(-9.0, 2.6, easeOutPow(u, 1.8));
        redHeat   = mix(0.74, 1.00, easeOutPow(u, 1.6));
        sparkGlow = 1.00;
        tremorAmp = 1.25;
    } else if (c < 0.845) {
        // 4g. Crisp rev-limiter bounce settling onto 0.0 deg
        float u = (c - 0.780) / 0.065;
        deg = 2.6 * exp(-3.4 * u) * cos(u * PI * 3.0);
        redHeat   = 0.94 + 0.06 * sin(u * PI * 3.0);
        sparkGlow = mix(1.0, 0.52, u);
        tremorAmp = mix(0.80, 0.18, u);
        if (u > 0.60) {
            shimmerX = mix(-240.0, 120.0, (u - 0.60) / 0.40);
        }
    } else {
        // 5. Settles at 0.0 deg, cools smoothly from Red to Boost Orange-Gold,
        //    sweeps the specular highlight, and stops cleanly!
        float u = (c - 0.845) / 0.155;
        deg = 0.0;
        tremorAmp = 0.15 * max(0.0, 1.0 - u * 1.8);
        sparkGlow = 0.52 * max(0.0, 1.0 - u * 1.5);
        redHeat   = 1.0 - smoothstep(0.04, 0.62, u);
        if (u < 0.94) {
            shimmerX = mix(120.0, 1280.0, clamp(u / 0.88, 0.0, 1.0));
        }
    }

    float vib = (sin(time * 148.0) * 0.65 + sin(time * 233.0 + 1.3) * 0.35) * tremorAmp;
    needleRotRad = (deg + vib) * DEG;
}

// ----------------------------------------------------------------------------
// Gauge Arc Shading: Green-Lime Start -> Boost Orange-Gold -> Vivid Scarlet Red
// ----------------------------------------------------------------------------
vec3 shadeOrange(vec2 p, float distToCut, float shimmerX, float sparkGlow,
                 float greenStart, float redHeat, float time, bool isFav) {
    vec2  gCenter = isFav ? vec2(615.0, 175.0) : vec2(620.0, 210.0);
    float gRadius = isFav ? 760.0 : 682.0;
    float d = clamp(length(p - gCenter) / gRadius, 0.0, 1.0);

    vec3 orangeCol;
    if (isFav) {
        vec3 f0 = vec3(1.0000, 0.8471, 0.2118); // #FFD836
        vec3 f1 = vec3(1.0000, 0.6392, 0.0471); // #FFA30C
        vec3 f2 = vec3(0.9961, 0.4941, 0.0118); // #FE7E03
        vec3 f3 = vec3(0.9882, 0.3373, 0.0078); // #FC5602
        vec3 f4 = vec3(0.9333, 0.2392, 0.0000); // #EE3D00
        if      (d < 0.22) orangeCol = mix(f0, f1, d / 0.22);
        else if (d < 0.52) orangeCol = mix(f1, f2, (d - 0.22) / 0.30);
        else if (d < 0.80) orangeCol = mix(f2, f3, (d - 0.52) / 0.28);
        else               orangeCol = mix(f3, f4, (d - 0.80) / 0.20);
    } else {
        vec3 c0 = vec3(0.9961, 0.8078, 0.1647); // #FECE2A
        vec3 c1 = vec3(0.9961, 0.6431, 0.0706); // #FEA412
        vec3 c2 = vec3(0.9961, 0.5451, 0.0157); // #FE8B04
        vec3 c3 = vec3(0.9961, 0.5294, 0.0118); // #FE8703
        vec3 c4 = vec3(0.9961, 0.5255, 0.0196); // #FE8605
        vec3 c5 = vec3(0.9961, 0.4627, 0.0196); // #FE7605
        vec3 c6 = vec3(0.9961, 0.3451, 0.0078); // #FE5802
        vec3 c7 = vec3(0.9922, 0.3059, 0.0078); // #FD4E02

        if      (d < 0.142) orangeCol = mix(c0, c1, d / 0.142);
        else if (d < 0.283) orangeCol = mix(c1, c2, (d - 0.142) / 0.141);
        else if (d < 0.425) orangeCol = mix(c2, c3, (d - 0.283) / 0.142);
        else if (d < 0.566) orangeCol = mix(c3, c4, (d - 0.425) / 0.141);
        else if (d < 0.708) orangeCol = mix(c4, c5, (d - 0.566) / 0.142);
        else if (d < 0.850) orangeCol = mix(c5, c6, (d - 0.708) / 0.142);
        else                orangeCol = mix(c6, c7, (d - 0.850) / 0.150);
    }

    vec3 col = orangeCol;

    // 1. Fresh Green-Lime initial low-RPM state
    if (greenStart > 0.001) {
        float dg = clamp(length(p - (isFav ? vec2(410.0, 340.0) : vec2(430.0, 360.0))) / (isFav ? 740.0 : 660.0), 0.0, 1.0);
        vec3 g0 = vec3(0.7059, 0.9490, 0.1725); // #B4F22C
        vec3 g1 = vec3(0.3843, 0.8902, 0.2196); // #62E338
        vec3 g2 = vec3(0.1647, 0.8157, 0.3059); // #2AD04E
        vec3 g3 = vec3(0.0941, 0.7137, 0.2784); // #18B647
        vec3 g4 = vec3(0.0627, 0.6275, 0.2510); // #10A040

        vec3 greenCol;
        if      (dg < 0.28) greenCol = mix(g0, g1, dg / 0.28);
        else if (dg < 0.58) greenCol = mix(g1, g2, (dg - 0.28) / 0.30);
        else if (dg < 0.85) greenCol = mix(g2, g3, (dg - 0.58) / 0.27);
        else                greenCol = mix(g3, g4, (dg - 0.85) / 0.15);

        col = mix(col, greenCol, clamp(greenStart, 0.0, 1.0));
    }

    // 2. Luminous Vivid Scarlet-Red high-load struggle state (less dark, vibrant tail)
    if (redHeat > 0.001) {
        float dr = clamp(length(p - (isFav ? vec2(780.0, 285.0) : vec2(760.0, 310.0))) / (isFav ? 760.0 : 690.0), 0.0, 1.0);
        vec3 r0 = vec3(1.0000, 0.3608, 0.1490); // #FF5C26 (0%)
        vec3 r1 = vec3(1.0000, 0.2196, 0.0784); // #FF3814 (24%)
        vec3 r2 = vec3(0.9725, 0.1255, 0.0471); // #F8200C (54%)
        vec3 r3 = vec3(0.9020, 0.0980, 0.0314); // #E61908 (80%)
        vec3 r4 = vec3(0.8196, 0.0902, 0.0314); // #D11708 (100% — vibrant scarlet, never dark maroon)

        vec3 redCol;
        if      (dr < 0.24) redCol = mix(r0, r1, dr / 0.24);
        else if (dr < 0.54) redCol = mix(r1, r2, (dr - 0.24) / 0.30);
        else if (dr < 0.80) redCol = mix(r2, r3, (dr - 0.54) / 0.26);
        else                redCol = mix(r3, r4, (dr - 0.80) / 0.20);

        col = mix(col, redCol, clamp(redHeat, 0.0, 1.0));
    }

    // 3. Subtle incandescent heat right behind the straining needle tip
    if (sparkGlow > 0.001) {
        float flicker = 0.86 + 0.14 * sin(time * 105.0);
        float edgeHeat = exp(-max(-distToCut, 0.0) * 0.034) * sparkGlow * flicker;
        vec3 sparkCol = mix(vec3(1.0, 0.96, 0.68), vec3(1.0, 0.56, 0.28), redHeat);
        col = mix(col, sparkCol, clamp(edgeHeat * 0.62, 0.0, 0.75));
    }

    // 4. Final left-to-right specular highlight sweep before parking
    if (shimmerX > -500.0) {
        float diagX = p.x + (540.0 - p.y) * 0.22;
        float band  = exp(-pow((diagX - shimmerX) / 115.0, 2.0));
        col = mix(col, vec3(1.0, 0.95, 0.82), band * 0.40);
    }

    return clamp(col, 0.0, 1.0);
}

// ----------------------------------------------------------------------------
// Ahead Metallic Track Shading (adapts to light gray in Dark Theme)
// ----------------------------------------------------------------------------
vec3 shadeDark(vec2 p, bool isFav, float darkMode) {
    float dLight = clamp(length(p - (isFav ? vec2(1180.0, 465.0) : vec2(1170.0, 465.0))) / (isFav ? 640.0 : 580.0), 0.0, 1.0);

    vec3 lightThemeCol;
    if (isFav) {
        vec3 f0 = vec3(1.0000, 1.0000, 1.0000);
        vec3 f1 = vec3(0.5216, 0.5294, 0.5647);
        vec3 f2 = vec3(0.2902, 0.2980, 0.3255);
        vec3 f3 = vec3(0.1529, 0.1608, 0.1804);
        vec3 f4 = vec3(0.1176, 0.1255, 0.1451);
        if      (dLight < 0.46) lightThemeCol = mix(f0, f1, dLight / 0.46);
        else if (dLight < 0.62) lightThemeCol = mix(f1, f2, (dLight - 0.46) / 0.16);
        else if (dLight < 0.78) lightThemeCol = mix(f2, f3, (dLight - 0.62) / 0.16);
        else                    lightThemeCol = mix(f3, f4, (dLight - 0.78) / 0.22);
    } else {
        vec3 c0 = vec3(1.0000, 1.0000, 1.0000);
        vec3 c1 = vec3(0.5098, 0.5098, 0.5294);
        vec3 c2 = vec3(0.3176, 0.3216, 0.3373);
        vec3 c3 = vec3(0.1922, 0.1961, 0.2118);
        vec3 c4 = vec3(0.1608, 0.1647, 0.1804);
        if      (dLight < 0.520) lightThemeCol = mix(c0, c1, dLight / 0.520);
        else if (dLight < 0.614) lightThemeCol = mix(c1, c2, (dLight - 0.520) / 0.094);
        else if (dLight < 0.732) lightThemeCol = mix(c2, c3, (dLight - 0.614) / 0.118);
        else if (dLight < 0.859) lightThemeCol = mix(c3, c4, (dLight - 0.732) / 0.127);
        else                     lightThemeCol = c4;
    }

    if (darkMode < 0.001) return lightThemeCol;

    // Dark-theme adaptation: brushed light metallic gray (#FFFFFF -> #D4D8E2 -> #B3B9C6 -> #868E9E)
    float dNight = clamp(length(p - vec2(1150.0, 465.0)) / (isFav ? 650.0 : 610.0), 0.0, 1.0);
    vec3 n0 = vec3(1.0000, 1.0000, 1.0000);
    vec3 n1 = vec3(0.8314, 0.8471, 0.8863); // #D4D8E2
    vec3 n2 = vec3(0.7020, 0.7255, 0.7765); // #B3B9C6
    vec3 n3 = vec3(0.5961, 0.6275, 0.6863); // #98A0AF
    vec3 n4 = vec3(0.5255, 0.5569, 0.6196); // #868E9E

    vec3 nightCol;
    if      (dNight < 0.48) nightCol = mix(n0, n1, dNight / 0.48);
    else if (dNight < 0.65) nightCol = mix(n1, n2, (dNight - 0.48) / 0.17);
    else if (dNight < 0.82) nightCol = mix(n2, n3, (dNight - 0.65) / 0.17);
    else                    nightCol = mix(n3, n4, (dNight - 0.82) / 0.18);

    return mix(lightThemeCol, nightCol, clamp(darkMode, 0.0, 1.0));
}

// ----------------------------------------------------------------------------
// Needle Shading (adapts from carbon-black to brushed light-gray in Dark Theme)
// ----------------------------------------------------------------------------
vec3 shadeNeedle(float tGrad, float redHeat, bool isFav, float darkMode) {
    vec3 c0 = isFav ? vec3(0.0549, 0.0549, 0.0627) : vec3(0.0745, 0.0745, 0.0784);
    vec3 c1 = isFav ? vec3(0.0902, 0.0941, 0.1098) : vec3(0.1020, 0.1020, 0.1176);
    vec3 c2 = isFav ? vec3(0.1176, 0.1255, 0.1490) : vec3(0.1451, 0.1490, 0.1647);
    vec3 c3 = isFav ? vec3(0.1451, 0.1529, 0.1804) : vec3(0.1686, 0.1725, 0.1922);
    vec3 c4 = isFav ? vec3(0.1216, 0.1255, 0.1490) : vec3(0.1490, 0.1490, 0.1686);

    vec3 lightBase;
    if      (tGrad < 0.25) lightBase = mix(c0, c1, tGrad * 4.0);
    else if (tGrad < 0.50) lightBase = mix(c1, c2, (tGrad - 0.25) * 4.0);
    else if (tGrad < 0.75) lightBase = mix(c2, c3, (tGrad - 0.50) * 4.0);
    else                   lightBase = mix(c3, c4, (tGrad - 0.75) * 4.0);

    // Dark-theme adaptation: crisp brushed light silver-gray (#BDC4D1 -> #EEF2F8)
    vec3 n0 = vec3(0.7412, 0.7686, 0.8196); // #BDC4D1
    vec3 n1 = vec3(0.8118, 0.8353, 0.8824); // #CFD5E1
    vec3 n2 = vec3(0.8863, 0.9059, 0.9412); // #E2E7F0
    vec3 n3 = vec3(0.9333, 0.9490, 0.9725); // #EEF2F8
    vec3 nightBase;
    if      (tGrad < 0.35) nightBase = mix(n0, n1, tGrad / 0.35);
    else if (tGrad < 0.72) nightBase = mix(n1, n2, (tGrad - 0.35) / 0.37);
    else                   nightBase = mix(n2, n3, (tGrad - 0.72) / 0.28);

    vec3 base = mix(lightBase, nightBase, clamp(darkMode, 0.0, 1.0));
    float tipGlint = smoothstep(0.55, 1.0, tGrad) * redHeat * 0.24;
    vec3 glintCol  = mix(vec3(0.72, 0.12, 0.05), vec3(1.0, 0.62, 0.52), clamp(darkMode, 0.0, 1.0));
    return mix(base, glintCol, tipGlint);
}

vec4 blendOver(vec4 dstPremul, vec3 srcRgb, float srcAlpha) {
    return vec4(
        srcRgb * srcAlpha + dstPremul.rgb * (1.0 - srcAlpha),
        srcAlpha + dstPremul.a * (1.0 - srcAlpha)
    );
}

// ----------------------------------------------------------------------------
// Core Render Function
// ----------------------------------------------------------------------------
vec4 renderBoostCI(vec2 fragCoord, vec2 resolution, float time, float progress,
                   float animateFlag, float bgAlpha, float variant, float darkMode) {
    float scale  = min(resolution.x, resolution.y) / 1024.0;
    vec2  offset = (resolution - vec2(1024.0) * scale) * 0.5;
    vec2  p      = (fragCoord - offset) / max(scale, 1e-5);
    p.y = 1024.0 - p.y;

    float aa = 0.75 / max(scale, 1e-4);
    bool isFav = (variant > 0.5);

    float needleRotRad, shimmerX, sparkGlow, greenStart, redHeat;
    getBoostKinematics(time, progress, animateFlag, needleRotRad, shimmerX, sparkGlow, greenStart, redHeat);

    vec2  piv = isFav ? vec2(512.0, 548.0) : vec2(512.5, 551.5);
    float cs  = cos(-needleRotRad);
    float sn  = sin(-needleRotRad);
    vec2  rp  = vec2(
        (p.x - piv.x) * cs - (p.y - piv.y) * sn,
        (p.x - piv.x) * sn + (p.y - piv.y) * cs
    ) + piv;

    float thPiv = atan(p.y - piv.y, p.x - piv.x);
    thPiv = (thPiv > 1.8) ? (thPiv - TAU) : thPiv;
    float thNeedle = (isFav ? -0.679806 : -0.68940) + needleRotRad;

    float dRing = isFav ? sdFaviconDialRing(p) : sdHiResDialRing(p);
    float dCutOrange = isFav
        ? (0.500421 * rp.x + 0.865782 * rp.y - 590.141)
        : ((rp.y + 0.641593 * rp.x - 800.180) / 1.18915);
    float dCutDark = isFav
        ? (-0.741650 * rp.x - 0.670787 * rp.y + 887.839)
        : ((-1.279080 * rp.x + 1365.525 - rp.y) / 1.62359);

    float dOrange = (thPiv <= thNeedle + 0.22)
        ? max(dRing, (thPiv > thNeedle - 0.75) ? dCutOrange : -1000.0)
        : 1000.0;

    float dDark = (thPiv >= thNeedle - 0.22)
        ? max(dRing, (thPiv < thNeedle + 0.75) ? dCutDark : -1000.0)
        : 1000.0;

    float needleT;
    float dNeedle = isFav ? sdFaviconNeedleLocal(rp, needleT) : sdHiResNeedleLocal(rp, needleT);

    vec3 bgRgb = mix(vec3(1.0), vec3(0.0627, 0.0784, 0.1137), clamp(darkMode, 0.0, 1.0));
    vec4 outPremul = vec4(bgRgb * bgAlpha, bgAlpha);

    float aDark = 1.0 - smoothstep(-aa, aa, dDark);
    if (aDark > 0.0) {
        outPremul = blendOver(outPremul, shadeDark(p, isFav, darkMode), aDark);
    }

    float aOrange = 1.0 - smoothstep(-aa, aa, dOrange);
    if (aOrange > 0.0) {
        outPremul = blendOver(outPremul, shadeOrange(p, dCutOrange, shimmerX, sparkGlow, greenStart, redHeat, time, isFav), aOrange);
    }

    float aNeedle = 1.0 - smoothstep(-aa, aa, dNeedle);
    if (aNeedle > 0.0) {
        outPremul = blendOver(outPremul, shadeNeedle(needleT, redHeat, isFav, darkMode), aNeedle);
    }

    return outPremul;
}

#ifdef SHADERTOY
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    bool manual = iMouse.z > 0.5;
    float prog  = clamp(iMouse.x / max(iResolution.x, 1.0) * 1.12, 0.0, 1.12);
    float autoFav = (min(iResolution.x, iResolution.y) <= 96.0) ? 1.0 : 0.0;
    fragColor   = renderBoostCI(fragCoord, iResolution.xy, iTime, prog, manual ? 0.0 : 1.0, 1.0, autoFav, 0.0);
}
#else
void main() {
    float spd = (u_speed > 0.0) ? u_speed : 1.0;
    fragColor = renderBoostCI(gl_FragCoord.xy, u_resolution, u_time * spd, u_progress, u_animate, u_bg_alpha, u_variant, u_dark_mode);
}
#endif
