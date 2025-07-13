# FlowSketch Art Generator

FlowSketch is a generative art application that allows users to create beautiful mathematical and AI-enhanced artworks. It features:

*   **Mathematical Art Generation**: Create intricate patterns using various datasets like Mandelbrot, Julia, Sierpinski, Barnsley, Newton, Spirals, Checkerboard, Moons, Gaussian, and Grid.
*   **AI-Enhanced Art Generation**: Leverage DALL-E 3 to generate unique artworks based on textual prompts and creative scenarios, blending mathematical concepts with artistic themes.
*   **Image Upscaling**: Upscale AI-generated images to 4K resolution for high-quality prints.
*   **Local Gallery**: Save and manage your generated artworks locally in your browser.
*   **Cloud Sync (Supabase Integration)**: Securely sync your art gallery to the cloud, allowing access across devices and preventing data loss.
*   **User Authentication**: Sign up and sign in with email and password to manage your cloud gallery.

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository**:
    \`\`\`bash
    git clone <repository-url>
    cd flowsketch-art-generator
    \`\`\`

2.  **Install dependencies**:
    \`\`\`bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    \`\`\`

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root of your project and add the following environment variables:

    \`\`\`
    # OpenAI API Key for DALL-E 3 image generation
    OPENAI_API_KEY=your_openai_api_key

    # Supabase Project URL and Anon Key for cloud sync and authentication
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # Used for server-side operations if needed
    \`\`\`
    You can obtain these keys from your OpenAI and Supabase dashboards.

4.  **Run Supabase Migrations (Optional, for fresh Supabase setup)**:
    If you are setting up a new Supabase project, you can run the SQL scripts provided in the `scripts/` directory. These scripts will set up the necessary tables and RLS policies for the gallery and user management.

    *   Go to your Supabase project dashboard -> SQL Editor.
    *   Execute the scripts in the following order:
        1.  `scripts/supabase-schema.sql`
        2.  `scripts/supabase-setup-step1.sql`
        3.  `scripts/supabase-setup-step2.sql`
        4.  `scripts/supabase-setup-step3.sql`
        5.  `scripts/supabase-setup-step4.sql`
        6.  `scripts/supabase-setup-step5.sql`

5.  **Run the development server**:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Mathematical Art
Select from various mathematical datasets and customize parameters like seed, samples, noise, and color scheme to generate unique abstract patterns.

### AI Enhanced Art
Utilize DALL-E 3 to create art. Provide a textual prompt or choose from predefined creative scenarios to guide the AI in generating stunning images.

### Gallery & Cloud Sync
Your generated artworks are automatically saved to a local gallery. With Supabase integration, you can sign in to sync your gallery to the cloud, ensuring your art is backed up and accessible from anywhere.

### Upscaling
AI-generated images can be upscaled to 4K resolution, perfect for high-quality prints or detailed viewing.

## Project Structure

*   `app/`: Next.js App Router pages and API routes.
    *   `api/generate-art/route.ts`: Server-side endpoint for mathematical art generation.
    *   `api/generate-ai-art/route.ts`: Server-side endpoint for AI art generation (DALL-E 3).
    *   `api/upscale-image/route.ts`: Server-side endpoint for image upscaling.
*   `components/`: React components, including UI components from `shadcn/ui`.
    *   `flow-art-generator.tsx`: The main component for art generation.
    *   `gallery.tsx`: Component to display and manage the user's art gallery.
    *   `cloud-sync.tsx`: Component for displaying cloud sync status and actions.
*   `lib/`: Utility functions and services.
    *   `flow-model.ts`: Core logic for mathematical art generation and AI prompt construction.
    *   `gallery-storage.ts`: Manages local storage for the art gallery.
    *   `cloud-sync.ts`: Handles Supabase integration for cloud sync and authentication.
    *   `supabase.ts`: Supabase client initialization.
    *   `plot-utils.ts`: Utilities for SVG plotting.
    *   `client-upscaler.ts`: Client-side image enhancement utilities.
    *   `image-compression.ts`: Client-side image compression utilities.
    *   `utils.ts`: General utility functions.
*   `public/`: Static assets.
*   `scripts/`: SQL scripts for Supabase database setup.
*   `styles/`: Global CSS styles.
*   `tailwind.config.ts`, `postcss.config.mjs`: Tailwind CSS configuration.
*   `next.config.mjs`: Next.js configuration.
*   `package.json`: Project dependencies and scripts.
*   `tsconfig.json`: TypeScript configuration.

## Contributing

Feel free to fork this project, open issues, or submit pull requests.
