# FlowSketch Art Generator

A Next.js application that generates beautiful flow-based artwork using toy datasets and AI, with direct client-side bicubic upscaling and Cloudinary storage.

## Features

- **Dataset-based Art Generation**: Create art from mathematical datasets (spirals, checkerboard, moons, gaussian, grid)
- **AI-Powered Generation**: Use DALL-E 3 to create high-quality base images
- **Direct Client-side Upscaling**: 4x bicubic upscaling without server dependencies
- **Cloudinary Integration**: Automatic storage and management of generated artwork
- **Multiple Color Schemes**: Choose from magma, viridis, plasma, cividis, and grayscale
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary upload preset
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

\`\`\`env
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
\`\`\`

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API (DALL-E 3)
- Cloudinary for image storage
- Canvas API for client-side upscaling
