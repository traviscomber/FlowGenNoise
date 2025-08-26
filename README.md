# FlowSketch Art Generator

*AI-Powered Cultural Heritage Art Generation Platform*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/travis-projects-c14a785a/v0-flow-sketch-deployment)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/tLz33TUZDhy)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## Overview

FlowSketch Art Generator is a sophisticated AI-powered platform that creates stunning cultural heritage artwork using advanced prompt engineering and multiple projection formats. The platform specializes in generating museum-quality art across diverse cultural datasets with support for standard, 360° panoramic, and dome projection formats.

## ✨ Key Features

### 🎨 **Advanced Art Generation**
- **Cultural Heritage Datasets**: Vietnamese, Indonesian, Thai, ASEAN Mythology, Celebrities & Icons
- **Mathematical Art**: Fractals, Mandelbrot sets, Julia sets, Escher-inspired patterns
- **Specialized Effects**: Mind conflict visualizations, substance effects (FX), organic couture
- **Portrait Systems**: Heads & portraits, faces & expressions with cultural diversity

### 🌐 **Multiple Projection Formats**
- **Standard Format**: High-quality 1024x1024 compositions
- **360° Panoramic**: Seamless equirectangular and stereographic projections (1792x1024)
- **Dome Projection**: Hemispherical fisheye for planetarium displays with authentic barrel distortion

### 🎯 **Professional Features**
- **Neuralia Godlevel Prompts**: Sophisticated prompt engineering with mathematical precision
- **Custom Prompt Enhancement**: AI-powered prompt optimization while preserving user input
- **Color Scheme Integration**: Metallic, neon, pastel, and specialized color palettes
- **Safety Bypass System**: Advanced content policy navigation for cultural artwork

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/flowsketch-art-generator.git
   cd flowsketch-art-generator
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your OpenAI API key:
   \`\`\`env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Project Settings

3. **Environment Variables**
   \`\`\`env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   \`\`\`

### Deploy with Vercel CLI

\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

## 📖 Usage Guide

### Basic Art Generation

1. **Select Dataset**: Choose from cultural heritage, mathematical, or specialized collections
2. **Pick Scenario**: Select specific artistic scenarios within your chosen dataset
3. **Choose Format**: Standard, 360° panoramic, or dome projection
4. **Customize**: Add custom prompts or use enhancement features
5. **Generate**: Create your masterpiece with AI-powered generation

### Advanced Features

#### Custom Prompt Enhancement
- Input your creative ideas in the custom prompt field
- Use the "Enhance" button to optimize prompts while preserving your input
- System combines user creativity with scenario-specific elements

#### Dome Projection Formats
- **Fisheye**: 180° hemispherical with extreme barrel distortion
- **Tunnel Up**: Upward perspective for ceiling projection
- **Tunnel Down**: Downward perspective for floor projection  
- **Little Planet**: Stereographic spherical world effect

#### 360° Panoramic Formats
- **Equirectangular**: Standard VR format with seamless horizontal wrapping
- **Stereographic**: Circular fisheye compression of full 360° view

## 🎨 Cultural Datasets

### Heritage Collections
- **Vietnamese Heritage**: Traditional art, historical figures, cultural celebrations
- **Indonesian Archipelago**: 17,000 islands diversity, ethnic groups, traditional arts
- **Thai Culture**: Royal heritage, Buddhist art, traditional festivals
- **ASEAN Mythology**: Ancient creatures, folklore beings, cultural legends

### Artistic Collections  
- **Celebrities & Icons**: Dynamic celebrity representations across entertainment industries
- **Mathematical Art**: Fractal patterns, geometric precision, algorithmic beauty
- **Mind Conflict**: Surreal psychological visualizations, internal struggles
- **FX Substance Effects**: Altered perception states, visual consciousness expansion

## 🛠️ Technical Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: OpenAI DALL-E 3 with advanced prompt engineering
- **Deployment**: Vercel with serverless functions

### API Endpoints
- `/api/generate-ai-art` - Main AI art generation with safety bypass
- `/api/enhance-prompt` - Intelligent prompt enhancement
- `/api/generate-art` - Alternative generation pipeline
- `/api/upscale-image` - Image upscaling to 4K resolution

### Performance Optimizations
- Serverless function timeouts configured for AI generation
- Image optimization with Next.js Image component
- Efficient prompt caching and enhancement systems
- Professional-grade error handling and fallback systems

## 🔧 Configuration

### Environment Variables
\`\`\`env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional (for enhanced features)
OPENAI_KEY=alternative-key-fallback
\`\`\`

### Vercel Configuration
The project includes optimized `vercel.json` with:
- Extended function timeouts for AI generation (60s)
- Proper image domain configuration
- Serverless function optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [v0.dev](https://v0.dev) - AI-powered development platform
- Powered by [OpenAI DALL-E 3](https://openai.com) - Advanced AI image generation
- Cultural heritage datasets inspired by authentic Southeast Asian traditions
- Mathematical art algorithms based on fractal geometry and computational aesthetics

## 📞 Support

- **Documentation**: [v0.dev/chat/projects/tLz33TUZDhy](https://v0.dev/chat/projects/tLz33TUZDhy)
- **Deployment**: [Vercel Dashboard](https://vercel.com/travis-projects-c14a785a/v0-flow-sketch-deployment)
- **Issues**: Create an issue in this repository for bug reports or feature requests

---

**FlowSketch Art Generator** - Where Cultural Heritage Meets AI Innovation
