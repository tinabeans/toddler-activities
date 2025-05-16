# Toddler Activities Randomizer

A fun web application that helps parents and caregivers find engaging activities for toddlers. Built with Next.js and Tailwind CSS.

## Features

- 🎲 Random activity suggestions
- 🎯 Category-based filtering
- 📊 Activity completion tracking
- ✏️ Add and edit activities (Development mode only)
- 🌈 Category-specific color themes
- 📱 Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Local Storage for activity tracking

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development vs Production Mode

### Development Mode
- Full access to all features including adding and editing activities
- Activities are stored in `public/activities.json`
- Changes to activities are persisted to the JSON file

### Production Mode
- Read-only access to activities
- Activity completion tracking still works (stored in browser's localStorage)
- Adding and editing activities is disabled
- Activities are served from the static JSON file

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your repository
4. Deploy!

Note: In production, the application runs in read-only mode for activities. Any activities you want available in production should be added during development and committed to the repository.

## Local Storage

The application uses localStorage to track:
- Completed activities
- Activity completion counts
- User preferences

This data is stored in the user's browser and persists across sessions.

## License

MIT
