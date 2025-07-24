# FlowSketch Art Generator

This is a mathematical art generator that allows users to create stunning visuals based on various mathematical functions and parameters. It includes features for AI prompt enhancement, stereographic projection, and a gallery to save and manage generated artworks.

## Features

- **Mathematical Art Generation**: Choose from different datasets and scenarios to generate unique art.
- **AI Prompt Enhancement**: Enhance your art prompts using AI to get more creative results.
- **Stereographic Projection**: Apply stereographic projection for a different visual perspective.
- **Parameter Control**: Adjust noise, samples, and other parameters to fine-tune your art.
- **Color Schemes**: Select from various color schemes to customize the look of your artwork.
- **Gallery**: Save, load, and delete your generated artworks.
- **Download & Upscale**: Download your art or upscale it for higher resolution.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or Yarn
- Supabase project (for gallery functionality)

### Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/flowsketch-art-generator.git
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
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY" # For AI prompt enhancement
    REPLICATE_API_TOKEN="YOUR_REPLICATE_API_TOKEN" # For image upscaling
    \`\`\`
    Replace the placeholder values with your actual Supabase, OpenAI, and Replicate API keys.

4.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: React components, including UI components from `shadcn/ui`.
- `lib/`: Utility functions, Supabase client, and plotting logic.
- `public/`: Static assets.
- `styles/`: Global CSS.

## API Endpoints

- `/api/generate-art`: Generates mathematical art based on provided parameters.
- `/api/enhance-prompt`: Enhances a given prompt using an AI model.
- `/api/upscale-image`: Upscales an image using a third-party AI service.
- `/api/generate-ai-art`: Generates AI art based on a prompt.

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).
