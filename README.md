# FlowSketch Art Generator

This project is an AI-powered art generator that allows users to create complex mathematical and AI-generated artworks. It features:

- **Mathematical Art Generation**: Generate art based on various mathematical datasets (spirals, fractals, quantum, etc.) with customizable parameters like color schemes, sample points, and noise.
- **AI Art Generation**: Utilize AI models (DALL·E 3 via OpenAI, with Replicate as a fallback) to generate images from detailed prompts.
- **Prompt Enhancement**: An AI-powered prompt enhancement feature to transform basic inputs into rich, descriptive prompts for higher-quality AI art.
- **Stereographic Projection**: Apply "Little Planet" or "Tunnel Vision" stereographic effects to both mathematical and AI-generated art.
- **Image Upscaling**: Upscale generated images using a client-side upscaler.
- **Art Gallery**: Save generated artworks to a personal gallery for later viewing and management.
- **Authentication**: Secure access to the application using a password gate.

## Features

- **Mathematical Datasets**: Choose from a variety of mathematical foundations like spirals, quantum, strings, fractals, topology, moons, circles, blobs, checkerboard, gaussian, and grid.
- **Scenario Blending**: Blend mathematical structures with scenarios such as pure, quantum, cosmic, microscopic, forest, ocean, neural, crystalline, plasma, atmospheric, and geological.
- **Color Palettes**: Select from diverse color schemes including plasma, quantum, cosmic, thermal, spectral, crystalline, bioluminescent, aurora, metallic, prismatic, monochromatic, and infrared.
- **Stereographic Projection**: Toggle and select between "Little Planet" and "Tunnel Vision" projections for unique visual effects.
- **AI Prompt Enhancement**: Automatically enhance your art prompts using GPT-4o for more detailed and artistic descriptions.
- **Image Download**: Download generated artworks as PNG files.
- **Gallery Management**: Save, view, and delete artworks from your personal gallery.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API Key (for DALL·E 3 and GPT-4o)
- (Optional) Replicate API Token (for fallback image generation)
- (Optional) Supabase project for gallery storage and authentication

### Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/flowsketch-art-generator.git
    cd flowsketch-art-generator
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your API keys:

    \`\`\`env
    OPENAI_API_KEY=your_openai_api_key
    REPLICATE_API_TOKEN=your_replicate_api_token # Optional
    NEXT_PUBLIC_PASSWORD_GATE_PASSWORD=your_password # Optional, for password gate
    \`\`\`

    If using Supabase for the gallery:
    \`\`\`env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    \`\`\`

4.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
    -   `api/enhance-prompt/route.ts`: API route for AI prompt enhancement.
    -   `api/generate-ai-art/route.ts`: API route for AI image generation.
    -   `api/generate-art/route.ts`: API route for mathematical art generation.
    -   `api/upscale-image/route.ts`: API route for image upscaling.
-   `components/`: React components, including UI components from `shadcn/ui`.
    -   `flow-art-generator.tsx`: The main component for the art generator interface.
    -   `auth/password-gate.tsx`: Component for password-based authentication.
-   `lib/`: Utility functions and helpers.
    -   `flow-model.ts`: Core logic for mathematical art generation and stereographic projection.
    -   `plot-utils.ts`: Utilities for plotting and rendering.
    -   `client-upscaler.ts`: Client-side image upscaling logic.
    -   `supabase.ts`: Supabase client setup.
    -   `utils.ts`: General utility functions.
-   `public/`: Static assets.
-   `styles/`: Global CSS.

## Deployment

This project can be easily deployed to Vercel.

1.  **Connect your Git repository** to Vercel.
2.  **Add your environment variables** in the Vercel project settings.
3.  **Deploy!**

## Contributing

Feel free to fork the repository, open issues, and submit pull requests.
\`\`\`
