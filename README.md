# FlowSketch Complex Mathematical Art Generator

FlowSketch is an advanced web application that allows users to generate stunning and unique mathematical art. It combines complex mathematical datasets with various scenarios and color schemes to create intricate visual results. Users can also leverage AI to enhance their art prompts and generate AI-powered artwork.

## Features

- **Mathematical Art Generation**:
  - Select from a variety of complex mathematical datasets (e.g., Quantum Spirals, Fractal Dimensions, Topological Spaces).
  - Blend with different scenarios (e.g., Pure Mathematical, Quantum Realm, Cosmic Scale).
  - Choose from diverse color palettes (e.g., Plasma, Quantum, Cosmic).
  - Adjust parameters like seed, number of samples, noise scale, and time step.
  - Enable Stereographic Projection for artistic "little planet" or "tunnel vision" effects.

- **AI Art Generation & Enhancement**:
  - Use AI to enhance your custom art prompts, adding descriptive and creative details.
  - Generate AI-powered artwork based on your enhanced or custom prompts.

- **Image Actions**:
  - Download generated artwork as PNG.
  - Upscale images for higher resolution and detail (mathematical upscaling for SVG, pixel-based for AI art).

- **Art Gallery**:
  - Automatically saves generated artworks to a local gallery (using localStorage).
  - Load previous artworks and their settings from the gallery.
  - Remove artworks from the gallery.

## Technologies Used

- **Next.js**: React framework for building the web application.
- **React**: UI library for building interactive user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
- **Lucide React**: Icon library.
- **AI SDK**: For integrating AI models (e.g., OpenAI for prompt enhancement and AI art generation).
- **Supabase**: (Optional) For persistent storage of gallery items (requires environment variables).
- **HTML Canvas API**: For rendering mathematical art client-side.

## Getting Started

### Prerequisites

- Node.js (v18.18.0 or later)
- npm or yarn

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

3.  **Environment Variables:**
    Create a `.env.local` file in the root of your project and add the following environment variables. These are crucial for AI features and optional for Supabase gallery integration.

    \`\`\`env
    # Required for AI features (e.g., prompt enhancement, AI art generation)
    OPENAI_API_KEY=your_openai_api_key_here
    REPLICATE_API_TOKEN=your_replicate_api_token_here # Used for AI art generation

    # Optional: For Supabase gallery integration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    \`\`\`
    Replace `your_openai_api_key_here`, `your_replicate_api_token_here`, `your_supabase_project_url`, and `your_supabase_anon_key` with your actual keys.

    **Note on Supabase:** If you plan to use the gallery feature with Supabase, you'll need to set up a Supabase project and create a `gallery_items` table. A basic SQL script for this might look like:

    \`\`\`sql
    CREATE TABLE gallery_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      image_url TEXT NOT NULL,
      prompt TEXT,
      parameters JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    \`\`\`
    You'll also need to enable the `uuid-ossp` extension in your Supabase project for `uuid_generate_v4()`.

### Running the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components, including `FlowArtGenerator` and `shadcn/ui` components.
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions and core logic (e.g., `flow-model.ts` for mathematical art generation, `client-upscaler.ts` for image upscaling, `supabase.ts` for Supabase client).
- `public/`: Static assets.
- `styles/`: Global CSS.

## Contributing

Feel free to fork the repository, open issues, and submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
