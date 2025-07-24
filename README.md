# FlowSketch - Mathematical Art Generator

FlowSketch is an advanced mathematical art generator that allows users to create stunning visual artworks based on complex mathematical datasets and scenarios. It features:

- **Diverse Mathematical Datasets:** Explore patterns from Quantum Spirals, Quantum Fields, String Theory, Fractal Dimensions, Topological Spaces, Hyperbolic Moons, Manifold Torus, Voronoi Dynamics, Fractal Checkerboard, Multi-Modal Gaussian, and Non-Linear Grids.
- **Scenario Blending:** Apply various artistic scenarios like Pure Mathematical, Quantum Realm, Cosmic Scale, Microscopic World, Living Forest, Deep Ocean, Neural Networks, Crystal Lattice, Plasma Physics, Atmospheric Physics, Geological Time, and Biological Systems to transform the mathematical patterns.
- **AI Art Generation:** Generate AI-powered artwork based on your chosen mathematical dataset and scenario, with optional prompt enhancement for professional results.
- **Stereographic Projections:** Create unique "Little Planet" or "Tunnel Vision" effects, perfect for social media sharing.
- **Image Upscaling:** Enhance generated artworks with mathematical detail (for SVG) or pixel-based enhancement (for AI art).
- **Art Gallery:** Automatically save and manage your generated artworks in a local gallery, with the ability to reload settings from any saved piece.

## Technologies Used

- **Next.js App Router:** For a modern, full-stack React framework.
- **React:** For building interactive user interfaces.
- **TypeScript:** For type safety and improved developer experience.
- **Tailwind CSS:** For rapid and responsive UI development.
- **shadcn/ui:** A collection of reusable components built with Radix UI and Tailwind CSS.
- **AI SDK (Vercel):** For integrating with OpenAI's DALL·E 3 and Replicate for AI image generation.
- **Supabase:** (Optional, for future gallery persistence) A backend-as-a-service for database and authentication.
- **Simplex Noise & Alea:** For generating procedural noise and seeded randomness in mathematical patterns.
- **Canvas API:** For client-side image upscaling and enhancement.

## Getting Started

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
\`\`\`

### 3. Set up Environment Variables

Create a `.env.local` file in the root of your project and add the following:

\`\`\`env
# Optional: For AI Art Generation (DALL-E 3)
OPENAI_API_KEY=your_openai_api_key

# Optional: Fallback for AI Art Generation (Replicate)
REPLICATE_API_TOKEN=your_replicate_api_token

# Optional: For Supabase Gallery Persistence
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

-   **`OPENAI_API_KEY`**: Get this from your OpenAI dashboard.
-   **`REPLICATE_API_TOKEN`**: Get this from your Replicate dashboard. This is used as a fallback if OpenAI fails.
-   **`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Get these from your Supabase project settings. These are used for saving generated art to a gallery.

### 4. Run the development server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Deploy to Vercel

You can deploy this project to Vercel with a few clicks. Make sure to set your environment variables in the Vercel project settings.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fflowsketch&env=OPENAI_API_KEY,REPLICATE_API_TOKEN,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=API%20keys%20for%20AI%20generation%20and%20Supabase%20for%20gallery%20persistence.&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys%0Ahttps%3A%2F%2Freplicate.com%2Faccount%2Fapi-tokens%0Ahttps%3A%2F%2Fsupabase.com%2Fdashboard%2Fprojects)

## Supabase Setup (Optional)

If you want to use the gallery feature with Supabase, you need to create a `gallery_items` table.

1.  Go to your Supabase project dashboard.
2.  Navigate to the "SQL Editor" section.
3.  Run the following SQL script to create the `gallery_items` table:

    \`\`\`sql
    CREATE TABLE gallery_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      image_url TEXT NOT NULL,
      prompt TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    \`\`\`

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.
\`\`\`
