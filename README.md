# FlowSketch: Mathematical Art Generator

FlowSketch is a web application that allows users to generate stunning mathematical art based on chaotic attractors and flow fields. Users can customize various parameters, select different datasets (like Lorenz, Rossler, Duffing), choose color schemes, and apply scenarios (e.g., stereographic projection, turbulence).

## Features

- **Interactive Art Generation**: Visualize complex mathematical systems in real-time.
- **Customizable Parameters**: Adjust particle count, speed, line length, and dataset-specific parameters.
- **Diverse Datasets**: Explore various chaotic attractors like Lorenz, Rossler, Duffing, Aizawa, and Thomas.
- **Color Schemes**: Apply different color palettes to your art.
- **Scenarios**: Experiment with unique visualization modes, including stereographic projection and turbulent noise.
- **AI Prompt Enhancement**: Use AI to enhance your art generation prompts for more creative outputs.
- **AI Art Generation**: Generate AI-powered art based on your prompts.
- **Download & Upscale**: Download your generated art as PNG and upscale it for higher resolution.
- **Gallery**: Save your favorite artworks to a personal gallery powered by Supabase.
- **Responsive Design**: Enjoy the application on various screen sizes.

## Technologies Used

- **Next.js**: React framework for building the web application.
- **React Three Fiber**: React renderer for Three.js, enabling 3D graphics in React.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
- **Vercel AI SDK**: For integrating AI models (OpenAI/Replicate) for prompt enhancement and AI art generation.
- **Supabase**: For database (gallery storage) and object storage (image uploads).
- **Replicate**: For image upscaling (via API route).

## Setup and Installation

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-username/flowsketch.git
cd flowsketch
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Set up Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

\`\`\`env
# OpenAI API Key for prompt enhancement
OPENAI_API_KEY=your_openai_api_key

# Replicate API Token for AI art generation and upscaling
REPLICATE_API_TOKEN=your_replicate_api_token

# Supabase Project URL and Anon Key for gallery features
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # Only needed for server-side operations requiring elevated privileges, not strictly for this app's current Supabase usage.
\`\`\`

**How to get these keys:**

- **OpenAI API Key**: Sign up at [OpenAI](https://platform.openai.com/) and generate an API key.
- **Replicate API Token**: Sign up at [Replicate](https://replicate.com/) and find your API token in your account settings.
- **Supabase**:
    1. Go to [Supabase](https://supabase.com/) and create a new project.
    2. In your project settings, navigate to "API" to find your `Project URL` and `anon public` key.
    3. For the gallery, you'll need to set up a table. You can use the following SQL:

        \`\`\`sql
        CREATE TABLE artworks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          image_url TEXT NOT NULL,
          dataset TEXT,
          color_scheme TEXT,
          scenario TEXT,
          parameters JSONB,
          num_particles INTEGER,
          particle_speed REAL,
          line_length REAL,
          prompt TEXT,
          enhanced_prompt TEXT
        );

        -- Enable Row Level Security (RLS)
        ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

        -- Create a policy that allows all users to read artworks (public gallery)
        CREATE POLICY "Allow public read access" ON artworks FOR SELECT USING (true);

        -- Create a policy that allows authenticated users to insert artworks
        CREATE POLICY "Allow authenticated users to insert" ON artworks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        -- Create a policy that allows authenticated users to delete their own artworks
        CREATE POLICY "Allow authenticated users to delete their own artworks" ON artworks FOR DELETE USING (auth.uid() = user_id); -- Assuming you add a user_id column later if you implement user-specific galleries. For now, this might need adjustment or be removed if no user_id is tracked.
