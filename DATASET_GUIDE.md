# How to Add New Datasets Safely

This guide ensures you can add new datasets without breaking the system.

## ✅ Current Status
- **43 datasets** loaded and working
- **16 scientific** datasets (astronomy, mathematics, fractals, etc.)
- **27 commercial** datasets (cultural, artistic, gaming, etc.)
- All datasets have proper metadata entries

## 📋 Step-by-Step Guide to Add a New Dataset

### Step 1: Choose a Dataset Key
- Use lowercase with hyphens: `new-years-celebrations`
- Keep it descriptive and unique
- No spaces, special characters, or underscores

### Step 2: Add to CULTURAL_DATASETS

\`\`\`typescript
export const CULTURAL_DATASETS = {
  // ... existing datasets ...
  
  "your-dataset-key": {
    name: "🎉 Your Dataset Display Name",
    description: "Clear description of what this dataset contains",
    scenarios: {
      "scenario-1": {
        description: "Detailed scenario description with visual elements, technical specs, and atmospheric details.",
      },
      "scenario-2": {
        description: "Another scenario with rich visual details.",
      },
      // Add 5-20 scenarios per dataset
    },
  },
}
\`\`\`

### Step 3: Add to DATASET_METADATA

\`\`\`typescript
export const DATASET_METADATA = {
  // ... existing metadata ...
  
  "your-dataset-key": {
    category: "scientific" as const, // or "commercial"
    tags: ["tag1", "tag2", "tag3"], // 3-6 relevant tags
    displayName: "🎉 Your Dataset Display Name",
    description: "Brief description for the UI",
    icon: "🎉", // Single emoji icon
  },
}
\`\`\`

## ⚠️ Common Mistakes to Avoid

### 1. **String Formatting Issues**
❌ DON'T use escaped quotes:
\`\`\`typescript
description: \"This will break\"
\`\`\`

✅ DO use regular quotes:
\`\`\`typescript
description: "This works perfectly"
\`\`\`

### 2. **Missing Commas**
❌ DON'T forget commas between entries:
\`\`\`typescript
"scenario-1": {
  description: "First scenario"
}
"scenario-2": { // Missing comma above!
\`\`\`

✅ DO add commas:
\`\`\`typescript
"scenario-1": {
  description: "First scenario"
},
"scenario-2": {
\`\`\`

### 3. **Unclosed Braces**
❌ DON'T leave objects unclosed:
\`\`\`typescript
"your-dataset": {
  name: "Dataset",
  scenarios: {
    "scene-1": {
      description: "Scene"
    }
  }
  // Missing closing brace!
\`\`\`

✅ DO close all braces:
\`\`\`typescript
"your-dataset": {
  name: "Dataset",
  scenarios: {
    "scene-1": {
      description: "Scene"
    }
  }
}, // Properly closed
\`\`\`

### 4. **Metadata Mismatch**
❌ DON'T add dataset without metadata:
\`\`\`typescript
// Added to CULTURAL_DATASETS but NOT to DATASET_METADATA
\`\`\`

✅ DO add both:
\`\`\`typescript
// Add to CULTURAL_DATASETS
// AND add to DATASET_METADATA
\`\`\`

## 🎯 Best Practices

### Rich Scenario Descriptions
Include these elements for better image generation:
- **Visual details**: colors, textures, materials
- **Atmospheric elements**: lighting, mood, ambiance
- **Technical specs**: resolution, precision, quality
- **Cultural authenticity**: traditional elements, heritage
- **Emotional depth**: feelings, expressions, psychology

### Example of a Good Scenario:
\`\`\`typescript
"times-square-nye": {
  description: "Godlevel Times Square New Year's Eve excellence featuring massive LED billboards with countdown displays, confetti cannons releasing millions of colorful pieces, dense crowd of celebrating people with champagne glasses, iconic ball drop with crystalline facets catching light, winter atmosphere with steam rising from street vents, vibrant neon colors reflecting on wet pavement, infinite celebration dimensional artistry, computational festivity through algorithmic New Year mastery, photorealistic crowd detail with individual expressions of joy, cinematic wide-angle perspective capturing the full square energy.",
}
\`\`\`

## 🔍 Validation Checklist

Before saving your changes:
- [ ] Dataset key is lowercase with hyphens
- [ ] All strings use regular quotes (not escaped `\"`)
- [ ] All commas are in place
- [ ] All braces are closed `{}`
- [ ] Metadata entry matches dataset key exactly
- [ ] Category is either "scientific" or "commercial"
- [ ] Tags are relevant and lowercase
- [ ] Icon is a single emoji
- [ ] At least 5 scenarios per dataset
- [ ] Descriptions are detailed and rich

## 📊 Current Dataset Categories

### Scientific (16 datasets)
- Astronomy, mathematics, fractals, geometry, physics

### Commercial (27 datasets)
- Cultural heritage, portraits, gaming, fashion, mythology

## 🚀 After Adding a Dataset

1. Save the file
2. Check for syntax errors in the console
3. Refresh the app
4. Verify the dataset appears in the dropdown
5. Test generating an image with the new dataset

## 💡 Tips for Success

1. **Start small**: Add 5-10 scenarios first, test, then add more
2. **Copy existing patterns**: Use similar datasets as templates
3. **Test frequently**: Save and test after each dataset addition
4. **Keep descriptions detailed**: More detail = better images
5. **Use consistent formatting**: Follow the existing style

## 🆘 If Something Breaks

1. Check the browser console for error messages
2. Look for the line number in the error
3. Common issues:
   - Missing comma
   - Unclosed brace
   - Escaped quote (`\"`)
   - Mismatched keys between CULTURAL_DATASETS and DATASET_METADATA
4. Revert to last working version if needed
5. Add datasets one at a time to isolate issues

## 📝 Template for Quick Copy-Paste

\`\`\`typescript
// Add to CULTURAL_DATASETS
"dataset-key": {
  name: "🎯 Dataset Name",
  description: "Dataset description",
  scenarios: {
    "scenario-1": {
      description: "Detailed scenario description.",
    },
    "scenario-2": {
      description: "Another detailed scenario.",
    },
  },
},

// Add to DATASET_METADATA
"dataset-key": {
  category: "commercial" as const,
  tags: ["tag1", "tag2", "tag3"],
  displayName: "🎯 Dataset Name",
  description: "Brief UI description",
  icon: "🎯",
},
\`\`\`

---

**Remember**: The system is stable at 43 datasets. Follow this guide carefully when adding new ones!
