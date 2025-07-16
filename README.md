# FlowSketch Art Generator

FlowSketch is an innovative application that allows you to generate unique digital art using two distinct modes: **Flow Field Generation** and **AI Art Generation**.

## Features

-   **Flow Field Generation**: Create intricate and organic patterns based on mathematical flow fields, with adjustable parameters like dataset, scenario, number of samples, noise scale, and time step.
-   **AI Art Generation**: Leverage advanced AI models (like DALL·E 3) to generate stunning images from textual prompts. Includes a scientific prompt enhancement system for detailed, mathematically-inspired art.
-   **Scientific Datasets & Scenarios**: Explore specialized datasets (e.g., Neural Networks, DNA Sequences, Quantum Fields) and artistic scenarios (e.g., Cyberpunk, Bioluminescent, Holographic) for unique creations.
-   **Image Upscaling**: Enhance the resolution and detail of your generated artwork.
-   **Gallery**: Save your favorite artworks to a personal gallery, complete with titles, descriptions, tags, and generation parameters.
-   **Responsive Design**: Enjoy a seamless experience across various devices.

## Getting Started

### Prerequisites

-   Node.js (v18.x or higher)
-   npm or Yarn
-   A Vercel account (for deployment and environment variables)
-   An OpenAI API Key (for AI Art Generation)
-   A Supabase project (for the gallery feature)

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
    Create a `.env.local` file in the root of your project and add the following:

    \`\`\`env
    # Required for AI Art Generation (DALL·E 3)
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

    # Required for Supabase Gallery
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    \`\`\`
    Replace `YOUR_OPENAI_API_KEY`, `YOUR_SUPABASE_URL`, and `YOUR_SUPABASE_ANON_KEY` with your actual keys.

4.  **Set up Supabase Database (for Gallery):**
    Run the SQL script to create the `gallery` table in your Supabase project:
    \`\`\`sql
    -- scripts/create-gallery-tables.sql
    CREATE TABLE gallery (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      svg_content TEXT,
      upscaled_image_url TEXT,
      mode VARCHAR(50) NOT NULL,
      dataset VARCHAR(255) NOT NULL,
      scenario VARCHAR(255) NOT NULL,
      seed INTEGER NOT NULL,
      num_samples INTEGER,
      noise_scale DOUBLE PRECISION,
      time_step DOUBLE PRECISION,
      custom_prompt TEXT,
      upscale_method VARCHAR(255),
      tags TEXT[],
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable Row Level Security (RLS)
    ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

    -- Create a policy for anonymous users to read all artworks
    CREATE POLICY "Allow public read access" ON gallery FOR SELECT USING (TRUE);

    -- Create a policy for authenticated users to insert, update, and delete their own artworks
    CREATE POLICY "Allow authenticated users to manage their own artworks" ON gallery
    FOR ALL
    TO authenticated
    USING (auth.uid() = (SELECT id FROM auth.users WHERE id = auth.uid()));
    \`\`\`
    You might need to enable the `uuid-ossp` extension in your Supabase project if `uuid_generate_v4()` is not recognized.

5.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
    -   `api/generate-ai-art/route.ts`: API endpoint for DALL·E 3 image generation.
    -   `api/generate/route.ts`: Unified API endpoint for both flow and AI art generation.
    -   `api/enhance-prompt/route.ts`: API endpoint for prompt enhancement (currently client-side logic).
    -   `api/upscale-image/route.ts`: API endpoint for image upscaling.
    -   `gallery/page.tsx`: Gallery page to view saved artworks.
    -   `page.tsx`: Main art generator page.
-   `components/`: Reusable React components.
    -   `flow-art-generator.tsx`: The main component for generating art.
    -   `gallery/`: Components related to the artwork gallery.
        -   `gallery-grid.tsx`: Displays artworks in a grid.
        -   `gallery-page.tsx`: Main gallery page component.
        -   `gallery-viewer.tsx`: Modal for viewing single artwork details.
        -   `save-artwork-dialog.tsx`: Dialog for saving generated artwork.
    -   `ui/`: Shadcn UI components.
-   `lib/`: Utility functions and services.
    -   `flow-model.ts`: Logic for generating flow field SVG.
    -   `gallery-service.ts`: Supabase client for gallery operations.
    -   `supabase.ts`: Supabase client initialization.
    -   `client-upscaler.ts`: Client-side image upscaling logic.
    -   `plot-utils.ts`: Utilities for plotting (if any).
    -   `utils.ts`: General utility functions.
-   `public/`: Static assets.
-   `scripts/`: Database migration scripts (e.g., `create-gallery-tables.sql`).
-   `styles/`: Global CSS.
-   `tailwind.config.ts`: Tailwind CSS configuration.

## Contributing

Feel free to fork this project, open issues, or submit pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).
