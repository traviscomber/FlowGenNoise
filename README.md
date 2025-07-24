# FlowSketch Art Generator

FlowSketch is an AI-powered art generator that allows you to create stunning mathematical and AI-generated art. Explore various datasets, scenarios, and color schemes, adjust parameters, and even enable stereographic projections to create unique visual masterpieces. Enhance your prompts using AI and manage your generated artworks in a personal gallery.

## Features

- **Mathematical Art Generation**: Choose from a variety of complex mathematical datasets (spirals, fractals, quantum fields, etc.) and apply different scenarios (cosmic, neural, forest, etc.) to generate intricate patterns.
- **AI Art Generation**: Utilize AI models to generate art from text prompts.
- **Prompt Enhancement**: Enhance your AI art prompts using an integrated AI assistant for more detailed and creative descriptions.
- **Customizable Parameters**: Adjust parameters like seed, noise scale, number of samples, and time step to fine-tune your art.
- **Stereographic Projections**: Transform your art into "little planet" or "tunnel" stereographic projections for unique visual effects.
- **Color Schemes**: Select from a wide range of predefined color palettes to set the mood and style of your artwork.
- **Gallery Management**:
  - **Save Artworks**: Store your generated art in a personal gallery.
  - **Load Artworks**: Reload saved artworks to view or re-edit their parameters.
  - **Delete Artworks**: Remove unwanted artworks from your gallery.
  - **Clear Gallery**: Delete all saved artworks.
- **Download & Upscale**: Download your generated art as SVG files or upscale them to higher resolutions for printing or detailed viewing.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or Yarn
- Vercel CLI (optional, for local development and deployment)

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
    Create a `.env.local` file in the root directory and add your API keys and Supabase credentials.

    \`\`\`env
    OPENAI_API_KEY=your_openai_api_key
    REPLICATE_API_TOKEN=your_replicate_api_token
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # For server-side operations
    \`\`\`

    -   **OpenAI API Key**: Required for AI prompt enhancement and AI art generation.
    -   **Replicate API Token**: Required for AI art generation (if using Replicate models).
    -   **Supabase**: Used for gallery storage and user authentication. You'll need to set up a Supabase project and configure your tables.

4.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Supabase Setup (for Gallery and Auth)

1.  **Create a new Supabase project.**
2.  **Go to "Table editor"** and create a new table named `artworks` with the following schema:

    \`\`\`sql
    CREATE TABLE public.artworks (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      image_url text NOT NULL,
      prompt text NOT NULL,
      parameters jsonb NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      ai_enhanced_prompt text
    );

    ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own artworks."
      ON public.artworks FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own artworks."
      ON public.artworks FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own artworks."
      ON public.artworks FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own artworks."
      ON public.artworks FOR DELETE
      USING (auth.uid() = user_id);
    \`\`\`

3.  **Enable Email Authentication** in your Supabase project settings if you plan to use the `PasswordGate` component.

## Usage

-   **Generate Math Art**: Select a dataset, scenario, color scheme, and adjust parameters. Click "Generate Math Art" to see your creation.
-   **Generate AI Art**: Enter a text prompt and click "Generate AI Art".
-   **Enhance Prompt**: Use the "Enhance Prompt with AI" button to get a more detailed prompt for AI art generation.
-   **Gallery**: Save your favorite artworks to the gallery. You can load them back or delete them.
-   **Download/Upscale**: Use the buttons below the generated art to download it as SVG or upscale it.

## Technologies Used

-   Next.js (App Router)
-   React
-   Tailwind CSS
-   shadcn/ui
-   Vercel AI SDK
-   Supabase (for database and authentication)
-   Replicate (for AI art generation)
-   OpenAI (for prompt enhancement)

## Contributing

Feel free to fork the repository, open issues, or submit pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).
