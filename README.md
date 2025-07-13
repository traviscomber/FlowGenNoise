# FlowSketch Art Generator

Welcome to FlowSketch, an application that allows you to generate beautiful mathematical and AI-enhanced artworks.

## Features

-   **Mathematical Art Generation**: Create intricate patterns based on various mathematical datasets like Mandelbrot, Julia, Sierpinski, Barnsley, and Newton fractals.
-   **AI-Enhanced Art Generation**: Leverage AI models (via DALL-E 3) to transform mathematical patterns into creative, scenario-driven artworks.
-   **Customizable Settings**: Adjust parameters such as dataset, color scheme, seed, samples, and noise to fine-tune your creations.
-   **Image Upscaling**: Upscale AI-generated images to 4K resolution for higher quality.
-   **Local Gallery**: Save your generated artworks to a local gallery for easy access and management.
-   **Cloud Sync (Supabase Integration)**: Securely sync your art gallery to the cloud using Supabase for backup and access across devices.
-   **Authentication**: Sign up or sign in with email and password to enable cloud sync.
-   **Conflict Resolution**: Resolve sync conflicts when local and cloud versions of an image differ.

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/vercel-labs/flowsketch-art-generator.git
cd flowsketch-art-generator
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
# or
npm install
# or
yarn install
\`\`\`

### 3. Set Up Supabase (Optional, for Cloud Sync)

FlowSketch uses Supabase for cloud storage and authentication.

1.  **Create a Supabase Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get API Keys**:
    *   Navigate to `Project Settings > API`.
    *   Copy your `Project URL` and `anon public` key.
    *   Copy your `service_role` key (used for server-side operations).
3.  **Set Environment Variables**: Create a `.env.local` file in the root of your project and add the following:

    \`\`\`env
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
    \`\`\`

    Replace the placeholders with your actual Supabase keys.

4.  **Run Supabase Migrations**:
    The project includes SQL scripts to set up the necessary tables and RLS policies for the gallery. You can run these directly from your Supabase SQL Editor or use the provided scripts.

    *   `scripts/supabase-setup-step1.sql`
    *   `scripts/supabase-setup-step2.sql`
    *   `scripts/supabase-setup-step3.sql`
    *   `scripts/supabase-setup-step4.sql`
    *   `scripts/supabase-setup-step5.sql`

    Execute these scripts in order in your Supabase SQL Editor.

### 4. Run the Development Server

\`\`\`bash
pnpm dev
# or
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
    -   `api/generate-ai-art/route.ts`: API route for DALL-E 3 image generation.
    -   `api/upscale-image/route.ts`: API route for image upscaling.
    -   `api/score-image/route.ts`: API route for aesthetic scoring.
-   `components/`: React components, including UI components from `shadcn/ui`.
    -   `flow-art-generator.tsx`: The main application component.
    -   `gallery.tsx`: Component for displaying and managing the art gallery.
    -   `cloud-sync.tsx`: Component for managing cloud sync settings and authentication.
-   `lib/`: Utility functions and services.
    -   `flow-model.ts`: Core logic for mathematical and AI art generation.
    -   `gallery-storage.ts`: Client-side local storage management for the gallery.
    -   `cloud-sync.ts`: Service for interacting with Supabase for cloud sync.
    -   `supabase.ts`: Supabase client initialization.
    -   `image-compression.ts`: Image compression utilities.
    -   `plot-utils.ts`: Utilities for SVG plotting.
-   `public/`: Static assets.
-   `scripts/`: SQL scripts for Supabase setup.

## Technologies Used

-   Next.js 14 (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Supabase (for database, authentication, and storage)
-   DALL-E 3 (via OpenAI API) for AI art generation
-   Replicate for image upscaling (via API route)
-   `lucide-react` for icons

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.
