# FlowSketch: Complex Mathematical Art Generator

FlowSketch is an advanced web application that allows users to generate stunning abstract art based on complex mathematical datasets and theoretical physics scenarios. It leverages both pure mathematical algorithms and AI models (DALL-E 3, Replicate) to create unique visual compositions.

## Features

- **Diverse Mathematical Datasets:** Explore patterns derived from Quantum Spirals, String Theory, Fractal Dimensions, Topological Spaces, Hyperbolic Moons, and more.
- **Scenario Blending:** Apply contextual transformations to your datasets, visualizing them through the lens of Quantum Realms, Cosmic Scales, Neural Networks, Microscopic Worlds, and other scientific themes.
- **Rich Color Palettes:** Choose from a variety of scientifically inspired color schemes like Plasma, Quantum, Cosmic, Thermal, Spectral, and Crystalline.
- **Stereographic Projections:** Generate captivating "Little Planet" or "Tunnel Vision" effects, perfect for social media and unique artistic expressions.
- **AI Art Generation:** Utilize advanced AI models to create high-resolution artworks based on your mathematical and scenario selections.
- **AI Prompt Enhancement:** Automatically generate "god-level" prompts for AI art, incorporating detailed scientific and artistic terminology for museum-quality results.
- **Mathematical Upscaling:** For SVG-generated art, truly enhance detail by re-rendering with more data points.
- **Client-Side Upscaling:** For AI-generated art, apply advanced pixel enhancement.
- **Art Gallery:** Automatically save your generated artworks to a local gallery, allowing you to revisit, download, and reload settings.
- **Responsive Design:** Enjoy a seamless experience across desktop and mobile devices.

## Technologies Used

- **Next.js 14 (App Router):** For a powerful React framework with server components and API routes.
- **React:** Building the user interface.
- **TypeScript:** For type safety and improved developer experience.
- **Tailwind CSS:** For rapid and responsive styling.
- **shadcn/ui:** Beautifully designed and accessible UI components.
- **Vercel AI SDK:** For seamless integration with OpenAI (DALL-E 3) and other AI models.
- **Replicate API:** As a fallback for AI image generation.
- **SVG:** For rendering mathematical visualizations directly in the browser.
- **HTML Canvas API:** For client-side image upscaling.
- **Local Storage:** For persisting the art gallery.

## Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or Yarn

### Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/flowsketch.git
    cd flowsketch
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`
3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your API keys:
    \`\`\`
    OPENAI_API_KEY=your_openai_api_key_here
    REPLICATE_API_TOKEN=your_replicate_api_token_here # Optional, for fallback
    \`\`\`
    You can get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/).
    You can get a Replicate API token from [Replicate](https://replicate.com/account/api-tokens).

### Running the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

\`\`\`
.
├── app/
│   ├── api/
│   │   ├── generate-ai-art/  # API route for AI image generation
│   │   ├── enhance-prompt/   # API route for AI prompt enhancement
│   │   └── upscale-image/    # API route for server-side upscaling (if implemented)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main application page
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── flow-art-generator.tsx # Main art generation component
├── lib/
│   ├── flow-model.ts         # Core mathematical dataset and rendering logic
│   ├── client-upscaler.ts    # Client-side image upscaling utilities
│   └── utils.ts              # General utility functions
├── public/                   # Static assets
├── styles/                   # Global CSS
└── ... (other config files)
\`\`\`

## How to Use

1.  **Select Mathematical Dataset:** Choose a base mathematical pattern (e.g., Quantum Spirals, Fractal Dimensions).
2.  **Select Scenario Blend:** Apply a thematic filter (e.g., Cosmic Scale, Neural Networks) to influence the visual interpretation.
3.  **Choose Color Palette:** Pick a color scheme that complements your desired aesthetic.
4.  **Adjust Parameters:** Fine-tune the `Seed`, `Sample Points`, and `Noise Scale` for unique variations.
5.  **Enable Stereographic Projection (Optional):** Toggle this to create "Little Planet" or "Tunnel Vision" effects.
6.  **Generate Art:**
    *   **Complex Math:** Click "Generate Complex Math Art" to create an SVG visualization directly from the mathematical algorithms.
    *   **AI Art:** Switch to the "AI Art" tab. You can either write a `Custom Prompt` or click "Enhance" to have the AI generate a detailed prompt based on your settings. Then click "Generate AI Art".
7.  **Actions:**
    *   **Download:** Save your generated artwork.
    *   **Enhance:** For SVG art, "Add Mathematical Detail" to re-render with more data points. For AI art, "Enhance AI Art" to apply pixel-based upscaling.
8.  **Gallery:** All generated artworks are automatically saved to your local gallery. Click on any image to load its settings and regenerate or modify.

## Contributing

Feel free to fork the repository, open issues, and submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
