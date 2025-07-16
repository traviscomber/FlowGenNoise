# FlowSketch Art Generator

Welcome to FlowSketch, an AI-powered art generator that transforms your ideas into stunning visuals. This application allows you to generate unique artworks based on various datasets and scenarios, with options for prompt enhancement and saving your creations to a gallery.

## Features

- **AI Art Generation**: Generate images using DALL·E 3 based on your input prompts.
- **Dataset Integration**: Choose from predefined datasets (e.g., "Scientific", "Nature", "Abstract") to influence the art style and content.
- **Scenario Selection**: Select specific scenarios within a dataset to further refine the generated art.
- **Prompt Enhancement**: Automatically enhance your prompts using AI to generate more detailed and artistic descriptions, tailored for scientific or general themes.
- **Image Upscaling**: Upscale generated images for higher resolution and quality.
- **Art Gallery**: Save your generated artworks to a personal gallery, complete with auto-generated names and descriptions.
- **Password Protection**: Secure your art generator with a simple password gate.

## Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or Yarn
- An OpenAI API Key (for DALL·E 3 and prompt enhancement)
- A Supabase project (for the art gallery)

### Installation

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

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project and add the following:

    \`\`\`env
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
    \`\`\`

    -   `OPENAI_API_KEY`: Get this from your [OpenAI dashboard](https://platform.openai.com/account/api-keys).
    -   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Get these from your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

4.  **Run Supabase Migrations (Optional, for Gallery):**
    If you want to use the art gallery feature, you'll need to set up your Supabase database. You can use the provided SQL script:

    \`\`\`bash
    # You'll need to connect to your Supabase database using a SQL client
    # and run the commands in scripts/create-gallery-tables.sql
    \`\`\`
    Alternatively, you can use the Supabase CLI to run migrations if you have it set up.

5.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  **Access the Generator**: If a password is set in `app/page.tsx`, enter `flowsketch2024` (or your custom password) to access the application.
2.  **Select Dataset and Scenario**: Choose from the dropdowns to define the context of your art.
3.  **Enter Prompt**: Type your initial idea into the prompt textarea.
4.  **Enhance Prompt (Optional)**: Click "Enhance Prompt" to let AI refine your input into a more detailed and artistic description.
5.  **Generate Art**: Click "Generate Art" to create your image.
6.  **Upscale Image (Optional)**: If you like the generated image, click "Upscale Image" to get a higher resolution version.
7.  **Save to Gallery**: Click "Save to Gallery" to store your artwork. You can provide a custom name and description, or let the system generate one for you.
8.  **View Gallery**: Navigate to `/gallery` to see all your saved artworks.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
    -   `api/`: API routes for art generation, prompt enhancement, and image upscaling.
    -   `gallery/`: Page for displaying the art gallery.
    -   `page.tsx`: Main application page with the FlowArtGenerator.
-   `components/`: React components.
    -   `auth/password-gate.tsx`: Component for password protection.
    -   `flow-art-generator.tsx`: The main component for the art generation interface.
    -   `gallery/`: Components related to the art gallery (grid, viewer, save dialog).
    -   `ui/`: Shadcn UI components.
-   `lib/`: Utility functions and services.
    -   `client-upscaler.ts`: Client-side image upscaling logic.
    -   `flow-model.ts`: Data models for datasets and scenarios.
    -   `gallery-service.ts`: Service for interacting with the Supabase gallery.
    -   `plot-utils.ts`: Utilities for plotting (if applicable).
    -   `supabase.ts`: Supabase client initialization.
    -   `utils.ts`: General utility functions.
-   `public/`: Static assets.
-   `scripts/`: SQL scripts for database setup.
-   `styles/`: Global CSS.
-   `tailwind.config.ts`: Tailwind CSS configuration.

## Contributing

Feel free to fork this repository, open issues, and submit pull requests.
