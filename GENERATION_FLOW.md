# Complete Flow: Generate 3 Image Formats (Standard, Dome, 360)

## Overview
Your system generates three distinct image formats from a single dataset/scenario selection:
1. **Standard** - Traditional square image (1024×1024)
2. **Dome** - Hemispherical fisheye for 21-meter planetarium dome projection (1024×1024)
3. **360° Panorama** - Equirectangular or stereographic format (1792×1024)

---

## Architecture Layers

### Layer 1: Frontend Component (`components/flow-art-generator.tsx`)
**Purpose**: User interface and generation orchestration

**Key States**:
- `generateTypes`: Boolean flags for which formats to generate
  - `standard: true/false`
  - `dome: true/false`
  - `panorama360: true/false`
- `dataset`: Selected cultural dataset (e.g., "vietnamese", "chile")
- `scenario`: Selected scenario within dataset (e.g., "trung-sisters")
- `colorScheme`: Color palette (e.g., "metallic", "copper-red")
- `projectionType`: For dome format (e.g., "fisheye") 
- `panoramaFormat`: For 360 format (e.g., "equirectangular", "stereographic")

**Generation Trigger**:
```javascript
// generateImages() function initiates the flow
- Validates at least one format selected
- Sets initial progress to "generating" for selected types only
- Calls `/api/generate-ai-art` with selective generation params
```

---

### Layer 2: Prompt Generation (`lib/ai-prompt.ts`)

**Core Function**: `buildPrompt(params)`

**Input Parameters**:
```typescript
{
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  panoramic360?: boolean
  panoramaFormat?: string    // for 360: "equirectangular" | "stereographic"
  projectionType?: string    // for dome: "fisheye" etc
  domeProjection?: boolean   // indicates dome format needed
}
```

**Output**: Neuralia godlevel prompt combining:
1. **Dataset description** (e.g., "Godlevel Vietnamese excellence...")
2. **Scenario content** (rich artistic narrative)
3. **Color scheme context**
4. **Technical parameters** (seed, samples, noise)
5. **Custom prompt** (if provided)

**Example Output**:
```
Godlevel Vietnamese Trung Sisters excellence featuring mathematical warrior precision...
[120+ words of artistic direction]
Color palette: metallic scheme with bronze and gold tones...
Seed: 1234, Samples: 4000, Noise scale: 0.08
[Total: ~500-800 words]
```

---

### Layer 3: API Route (`app/api/generate-ai-art/route.ts`)

**Endpoint**: `POST /api/generate-ai-art`

**Request Body**:
```javascript
{
  dataset: "chile",
  scenario: "atacama-giant",
  colorScheme: "copper-red",
  seed: 1234,
  numSamples: 4000,
  noiseScale: 0.08,
  provider: "openai",           // or "replicate"
  generateAll: false,           // selective generation
  generateTypes: {
    standard: true,
    dome: true,
    panorama360: false          // skip 360 this time
  },
  selectedAspectRatio: {...}
}
```

**Processing Flow**:
1. **Parse & Validate** - validateGenerationParams()
2. **Build Base Prompt** - buildPrompt() from lib/ai-prompt.ts
3. **Determine Generation Type** - Set flags:
   - `type === "360"` → `params.panoramic360 = true`
   - `type === "dome"` → `params.domeProjection = true`
   - `type === "standard"` → both false
4. **Selective Generation** - For each selected type:
   - Call `generateImage()` from utils.ts
   - Track progress: "generating" → "completed" or "failed"
5. **Return Results**:
   ```javascript
   {
     success: true,
     standard: "https://...",
     dome: "https://...",
     panorama360: undefined,      // not generated
     errors: [],
     prompt: "..." // full prompt used
   }
   ```

---

### Layer 4: Image Generation (`app/api/generate-ai-art/utils.ts`)

**Core Function**: `generateImage(prompt, type, params, provider, model)`

**For Each Format Type**:

#### **TYPE: STANDARD**
```
Size: 1024×1024
API: OpenAI DALL-E 3 or Replicate model
Enhanced Prompt Structure:
  "ULTIMATE ARTISTIC STANDARD COMPOSITION: {base_prompt}
   
   STANDARD ARTISTIC MASTERY:
   • Perfectly balanced and centered composition...
   • Optimal visual hierarchy with award-winning artistic quality...
   • Professional broadcast quality with godlevel artistic mastery...
   
   ARTISTIC EXCELLENCE: Perfect composition, professional framing, museum..."

Process:
  1. Sanitize prompt (remove weapons, violence terms)
  2. Add standard-specific enhancement wrapper
  3. Call DALL-E 3 with size "1024x1024"
  4. Return image URL
```

#### **TYPE: DOME**
```
Size: 1024×1024 (square, but with hemispherical content)
Projection: 180-degree fisheye zenith view
API: OpenAI DALL-E 3 or Replicate model

Enhanced Prompt Structure (CRITICAL):
  "Generate an ultra-wide-angle 180-degree hemispherical fisheye panorama. 
   The camera is oriented straight up along the z-axis (zenith view), 
   resulting in extreme barrel distortion.
   
   The sky must be positioned at the absolute, mathematically precise 
   center of the image, surrounded by curved environmental elements...
   
   Establish perfect radial geometry extending from the center outward 
   to the edges. The image must explicitly show the horizon completely absent...
   
   The surrounding elements must curve dramatically inward toward the frame edges.
   
   ARTISTIC CONTENT: {base_prompt}"

Process:
  1. Validate projectionType = "fisheye" (PRESET #1)
  2. Build comprehensive dome-specific prompt
  3. NO text/fonts anywhere in image
  4. Sky at absolute mathematical center
  5. Elements curve toward edges (barrel distortion)
  6. Call DALL-E 3 with size "1024x1024"
  7. Result designed for 21-meter planetarium dome projection
```

#### **TYPE: 360°**
```
Size: 1792×1024 (exact 16:9 ratio for panorama)
Format: Equirectangular or Stereographic projection
API: OpenAI DALL-E 3 or Replicate model

Enhanced Prompt Structure - EQUIRECTANGULAR:
  "PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA WITH ENHANCED LETTERBOXING - 
   DALL-E TRUE 2:1 RATIO WORKAROUND: {base_prompt}
   
   MANDATORY ENHANCED LETTERBOXING SPECIFICATIONS:
   • SOLID BLACK FRAMES at top and bottom (exactly 64 pixels each) 
     creating perfect 2:1 effective ratio
   • CENTER BAND contains equirectangular 360° content in precise 
     2:1 proportions (1792x896 effective area)
   • LEFT EDGE of center content must connect PERFECTLY with RIGHT EDGE 
     - seamless wrapping within center band
   • Professional latitude/longitude coordinate mapping...
   • ZERO visible seams, color breaks, lighting discontinuities...
   
   COMPOSITION STRUCTURE:
   • TOP: Solid black frame/border (exactly 64px height)
   • CENTER: 360° equirectangular panoramic content (1792x896 = true 2:1)
   • BOTTOM: Solid black frame/border (exactly 64px height)
   • Total: 1792x1024 with mathematically precise 2:1 panoramic extraction"

Enhanced Prompt Structure - STEREOGRAPHIC:
  "PROFESSIONAL STEREOGRAPHIC 360° PANORAMA - 1792x1024 FORMAT: {base_prompt}
   
   STEREOGRAPHIC 360° PANORAMIC MASTERY:
   • Premium stereographic projection with perfect circular distortion
   • Entire 360° panoramic view compressed into flawless circular frame
   • Center focus with expertly calculated radial distortion increasing 
     toward edges
   • {stereographicPerspective} perspective optimized for seamless 360° 
     panoramic experience"

Process:
  1. Determine panoramaFormat (equirectangular or stereographic)
  2. Build comprehensive 360-specific prompt with exact specifications
  3. NO text/fonts anywhere in image
  4. Seamless horizontal wrapping (critical for VR)
  5. Call DALL-E 3 with size "1792x1024"
  6. Result ready for VR viewers and 360° projection systems
```

---

## Complete Request-Response Cycle

### Step 1: User Selects Options in UI
```javascript
const generateTypes = {
  standard: true,      // Generate standard 1024×1024
  dome: true,         // Generate fisheye dome 1024×1024
  panorama360: false  // Skip 360° panorama
}
```

### Step 2: Frontend Calls Generation API
```javascript
POST /api/generate-ai-art
{
  dataset: "chile",
  scenario: "atacama-giant",
  colorScheme: "copper-red",
  seed: 1234,
  panoramic360: false,        // Set by API based on type
  projectionType: "fisheye",
  generateAll: false,
  generateTypes: {
    standard: true,
    dome: true,
    panorama360: false
  }
}
```

### Step 3: API Route Processes
```javascript
// 1. Validate parameters
const params = validateGenerationParams(body)

// 2. Build prompt
const finalPrompt = buildPrompt({
  dataset: "chile",
  scenario: "atacama-giant",
  colorScheme: "copper-red",
  seed: 1234,
  // ... other params
})
// Result: "Godlevel Chile: Copper, Cordillera & Consciousness excellence 
//         featuring Atacama Giant geoglyph magical emergence from desert...
//         [extensive neuralia godlevel description]"

// 3. Generate Standard
const standardResult = await generateImage(finalPrompt, "standard", params, 
                                          "openai", "dall-e-3")
// Enhanced with: "ULTIMATE ARTISTIC STANDARD COMPOSITION: {prompt}"
// Size: 1024×1024
// Result URL: https://...standard-image-url

// 4. Generate Dome
const domeResult = await generateImage(finalPrompt, "dome", params, 
                                       "openai", "dall-e-3")
// Enhanced with: "Generate ultra-wide-angle 180-degree hemispherical fisheye...
//                [comprehensive dome specifications]...
//                ARTISTIC CONTENT: {prompt}"
// Size: 1024×1024 (with zenith fisheye distortion)
// Result URL: https://...dome-image-url

// 5. Skip 360 (not selected)

// 6. Return Results
{
  success: true,
  standard: "https://...standard-image-url",
  dome: "https://...dome-image-url",
  panorama360: undefined,
  errors: [],
  prompt: "Full prompt used for generation",
  parameters: { ... },
  selectiveGeneration: true
}
```

### Step 4: Frontend Displays Results
```javascript
// Received response with standard + dome URLs
results.standard → Displays in standard tab (1024×1024 square)
results.dome → Displays in dome tab (1024×1024 fisheye zenith view)
// 360 tab empty since not generated
```

---

## Key Technical Details

### Prompt Enhancement by Type

**STANDARD**: Adds compositional mastery directives
- Balanced framing
- Museum-grade quality
- Professional broadcast standards

**DOME**: Adds hemispherical fisheye specifications
- 180-degree zenith view
- Sky at mathematical center
- Barrel distortion toward edges
- NO horizon line
- Elements curve inward
- NO text overlays

**360°**: Adds panoramic seamless wrapping specifications
- Either equirectangular with letterboxing (2:1 center band)
- OR stereographic with circular projection
- Left edge connects to right edge seamlessly
- NO text overlays
- Professional latitude/longitude mapping

### Resolution Standards
- **Standard**: 1024×1024 (DALL-E 3 native)
- **Dome**: 1024×1024 (DALL-E 3 native, fisheye content)
- **360°**: 1792×1024 (16:9 true panorama ratio, DALL-E 3 native)

### Color Schemes Integration
All 25 COLOR_SCHEMES available (metallic, copper-red, royal, etc.) work across all 3 formats:
- Colors embedded in dataset description
- Colors referenced in godlevel enhancement text
- Maintains visual consistency across formats

### Error Handling
- **Primary Attempt**: Safety-bypassed prompt with retry logic (3 retries, exponential backoff)
- **Secondary Attempt**: Ultra-safe fallback prompt if primary fails
- **Graceful Degradation**: Returns partial results (standard only) if dome or 360 fails
- **User Feedback**: Errors logged per format type

---

## Workflow Diagram

```
┌─────────────────────────────────┐
│  Frontend UI (flow-art-generator)
│  - Select Dataset/Scenario/Colors
│  - Choose Formats (Standard/Dome/360)
│  - Click "Generate"
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  API Route (/api/generate-ai-art)               │
│  1. Parse & validate params                      │
│  2. Build base prompt (buildPrompt)             │
│  3. Route by format type                         │
└──────────┬────────────┬────────────┬─────────────┘
           │            │            │
           ▼            ▼            ▼
    ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
    │  STANDARD   │ │    DOME     │ │   360°       │
    │  (if sel)   │ │   (if sel)  │ │   (if sel)   │
    └────┬────────┘ └────┬────────┘ └──────┬───────┘
         │                │                │
         ▼                ▼                ▼
    ┌─────────────────────────────────────────────┐
    │  Utils (generateImage function)             │
    │  - Enhance prompt based on type            │
    │  - Call provider (OpenAI/Replicate)        │
    │  - Handle retries + safety bypass          │
    └────┬────────┬────────┬──────────────────────┘
         │        │        │
    STANDARD  DOME     360°
    1024×1024 1024×1024 1792×1024
    Standard  Fisheye   Equirect/
    Compose   Zenith    Stereo
              View      Panorama
         │        │        │
         └────┬───┴────┬───┘
              ▼        ▼
         ┌──────────────────┐
         │  DALL-E 3 API    │
         │  Generate Images │
         └─────────┬────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
    Image URLs          Error Messages
    (https://...)       (if any failed)
         │                    │
         └────────┬───────────┘
                  ▼
    ┌────────────────────────────┐
    │  Return Response to Frontend│
    │  - standard URL (if succ)   │
    │  - dome URL (if succ)       │
    │  - panorama360 URL (if succ)│
    │  - errors array             │
    └────────────┬────────────────┘
                 ▼
    ┌────────────────────────────┐
    │  Display Results in Tabs    │
    │  - Standard Tab             │
    │  - Dome Tab                 │
    │  - 360° Tab                 │
    └────────────────────────────┘
```

---

## Selective Generation Feature

Instead of always generating all 3, users can choose:

```javascript
// Generate only specific formats
generateTypes: {
  standard: true,      // ✓ Generate
  dome: false,         // ✗ Skip
  panorama360: true    // ✓ Generate
}

// API automatically skips dome generation
// Returns only standard + 360° results
// Reduces API costs and generation time
```

---

## Quick Reference: Format Specifications

| Aspect | Standard | Dome | 360° |
|--------|----------|------|------|
| **Size** | 1024×1024 | 1024×1024 | 1792×1024 |
| **Aspect Ratio** | 1:1 | 1:1 (fisheye) | 16:9 |
| **Projection** | Standard | 180° Fisheye Zenith | Equirect/Stereo |
| **View** | Normal framing | Up-looking (sky center) | 360° wrapping |
| **Use Case** | Gallery/Web | Planetarium Dome | VR/360 Viewers |
| **Key Feature** | Balanced comp | Barrel distortion | Seamless wrapping |
| **Text/Fonts** | Standard OK | NO text overlay | NO text overlay |

---

## Summary

Your system creates a unified flow where:
1. **One dataset/scenario/color selection** generates artistic content
2. **Three specialized enhanced prompts** create format-specific instructions
3. **Single API call** routes to generate 1, 2, or all 3 formats
4. **Specialized prompt engineering** ensures each format is optimized:
   - Standard: Museum-quality composition
   - Dome: Hemispherical fisheye for 21-meter planetarium
   - 360°: Seamless equirectangular or stereographic panorama
5. **Results returned selectively** - only formats user selected
6. **Frontend displays** results in appropriate tabs/viewers
