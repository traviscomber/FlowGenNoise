# FlowSketch Art Generator

FlowSketch is an AI-powered art generator that combines mathematical concepts with artificial intelligence to create unique and abstract artworks. Users can explore various datasets, scenarios, and color schemes, apply stereographic projections, enhance prompts with AI, and generate high-quality images.

## Features

-   **Mathematical Art Generation**: Create abstract art based on fractals, attractors, and other mathematical concepts.
-   **AI Prompt Enhancement**: Use AI to refine and enhance your art prompts for more creative outputs.
-   **AI Art Generation**: Generate images using AI models based on your parameters and enhanced prompts.
-   **Stereographic Projection**: Apply "little planet" or "tunnel vision" effects to your mathematical art.
-   **Image Upscaling**: Enhance the resolution of your generated images.
-   **Gallery**: Save and manage your favorite artworks in a personal gallery.
-   **Password Gate**: Secure your application with an optional password.

## Technologies Used

-   **Next.js**: React framework for building the web application.
-   **Tailwind CSS**: For styling and responsive design.
-   **shadcn/ui**: UI components for a modern and accessible interface.
-   **AI SDK**: For interacting with AI models (e.g., OpenAI for prompt enhancement and image generation).
-   **Supabase**: For database (gallery storage) and authentication (optional password gate).
-   **Replicate**: For image upscaling.

## Setup and Installation

1.  **Clone the repository**:
    \`\`\`bash
    git clone https://github.com/your-repo/flowsketch.git
    cd flowsketch
    \`\`\`

2.  **Install dependencies**:
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

3.  **Environment Variables**:
    Create a `.env.local` file in the root of your project and add the following environment variables:

    \`\`\`env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # OpenAI (for AI prompt enhancement and AI art generation)
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

    # Replicate (for image upscaling)
    REPLICATE_API_TOKEN="YOUR_REPLICATE_API_TOKEN"

    # Optional: Password Gate
    NEXT_PUBLIC_PASSWORD_GATE_PASSWORD="YOUR_DESIRED_PASSWORD"
    \`\`\`

    -   **Supabase**: You'll need to set up a Supabase project.
        -   Create a `gallery_items` table with columns: `id (uuid, primary key, default gen_random_uuid())`, `image_url (text)`, `prompt (text)`, `created_at (timestamp with time zone, default now())`.
        -   Enable Row Level Security (RLS) for the `gallery_items` table.
        -   Create a policy that allows `SELECT`, `INSERT`, and `DELETE` for authenticated users (or `anon` role if you want public access). For simplicity, you can allow `anon` for `SELECT` and `INSERT` for this demo.
    -   **OpenAI**: Get your API key from the OpenAI dashboard.
    -   **Replicate**: Get your API token from the Replicate dashboard.
    -   **Password Gate**: Set `NEXT_PUBLIC_PASSWORD_GATE_PASSWORD` to any string you want to use as the password for accessing the application. If this variable is not set, the password gate will not be active.

4.  **Run the development server**:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1.  **Generate Mathematical Art**:
    -   Select a `Dataset`, `Scenario`, and `Color Scheme`.
    -   Adjust `Number of Samples` and `Noise Scale`.
    -   Toggle `Enable Stereographic Projection` and choose a `Perspective` if desired.
    -   Click "Generate Art" to see the mathematical visualization.

2.  **Enhance Prompt**:
    -   Enter a `Custom Prompt` (optional).
    -   Click "Enhance Prompt" to use AI to refine your input based on the selected mathematical parameters. The enhanced prompt will appear in the "Enhanced Prompt" textarea.

3.  **Generate AI Art**:
    -   After generating mathematical art or enhancing a prompt, click "Generate AI Art". The AI will use the enhanced prompt (or a default prompt based on your settings) to create an image.

4.  **Upscale Image**:
    -   Click "Upscale Image" to increase the resolution of the currently displayed generated image.

5.  **Gallery**:
    -   All generated AI artworks are automatically saved to your Supabase gallery.
    -   Navigate to the "Gallery" tab to view, download, or delete your saved artworks.

## Project Structure

\`\`\`
.
├── app/
│   ├── api/
│   │   ├── enhance-prompt/
│   │   │   └── route.ts      # API route for AI prompt enhancement
│   │   ├── generate-ai-art/
│   │   │   └── route.ts      # API route for AI image generation
│   │   ├── generate-art/
│   │   │   └── route.ts      # API route for mathematical art generation (SVG)
│   │   └── upscale-image/
│   │       └── route.ts      # API route for image upscaling
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout for the application
│   └── page.tsx              # Main application page
├── components/
│   ├── auth/
│   │   └── password-gate.tsx # Password protection component
│   ├── ui/                   # shadcn/ui components
│   │   └── ...
│   └── flow-art-generator.tsx # Main art generator component
├── hooks/
│   └── ...
├── lib/
│   ├── client-upscaler.ts    # Client-side image upscaling logic
│   ├── flow-model.ts         # Mathematical model for art generation
│   ├── plot-utils.ts         # Utilities for drawing and plotting
│   ├── supabase.ts           # Supabase client initialization
│   └── utils.ts              # General utility functions
├── public/                   # Static assets
│   └── ...
├── styles/
│   └── globals.css           # Additional global styles
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies and scripts
