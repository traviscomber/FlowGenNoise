# FlowSketch Art Generator

This project is an abstract mathematical art generator with AI prompt enhancement and stereographic projection capabilities.

## Features

- Generate mathematical art based on various datasets and scenarios.
- Enhance art prompts using AI (GPT-4o) for more detailed descriptions.
- Apply stereographic projections (Little Planet, Tunnel Vision) to the generated art.
- Generate AI art from enhanced prompts using Replicate.
- Upscale generated images.
- Save and manage generated artworks in a gallery using Supabase.

## Setup

1.  **Clone the repository:**
    \`\`\`bash
    git clone <repository-url>
    cd flowsketch-art-generator
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`
3.  **Environment Variables:**
    Create a `.env.local` file in the root of your project and add the following:

    \`\`\`
    NEXT_PUBLIC_PASSWORD_GATE_PASSWORD=your_secure_password
    OPENAI_API_KEY=your_openai_api_key
    REPLICATE_API_TOKEN=your_replicate_api_token
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a892f1b1c7bdc70a55dcd654bd3d33635f44cf6584 # Example SDXL model version
    \`\`\`
    *   `NEXT_PUBLIC_PASSWORD_GATE_PASSWORD`: A password to gate access to the application.
    *   `OPENAI_API_KEY`: Your API key for OpenAI (used by AI SDK for prompt enhancement).
    *   `REPLICATE_API_TOKEN`: Your API token for Replicate (used for AI art generation and upscaling).
    *   `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project URL and public anon key for client-side access.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key for server-side operations (e.g., saving gallery items).
    *   `REPLICATE_MODEL_VERSION`: The specific model version you want to use from Replicate for AI art generation (e.g., for Stable Diffusion XL).

4.  **Supabase Database Setup:**
    In your Supabase project, create a table named `gallery_items` with the following schema:

    \`\`\`sql
    CREATE TABLE gallery_items (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      image_url text NOT NULL,
      prompt text,
      created_at timestamp with time zone DEFAULT now()
    );
    \`\`\`
    Ensure that your `gallery_items` table has RLS (Row Level Security) enabled and appropriate policies for `select` (public access) and `insert` (authenticated or service role access). For simplicity in this demo, you might initially set `insert` to allow anonymous users if you're not implementing full user authentication.

5.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
\`\`\`
