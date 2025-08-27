# Vue 3 + Vite

# Bible Q&A Frontend

A modern Vue.js frontend application for asking biblical questions and receiving AI-powered scripture-based answers.

## Features

- 🤖 AI-powered biblical Q&A
- 💾 Save and manage favorite answers
- 🔍 Search through saved answers
- 📱 Fully responsive design
- ♿ Accessibility-first approach
- 🎨 Modern glass-morphism UI

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Styling**: Custom CSS with CSS Variables
- **HTTP Client**: Axios
- **Testing**: Vitest + Playwright
- **Deployment**: Heroku

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)
- `NODE_ENV`: Environment (development/production)

## Deployment

### Heroku Deployment

1. Create a new Heroku app:
   ```bash
   heroku create your-bible-qa-frontend
   ```

2. Set environment variables:
   ```bash
   heroku config:set VITE_API_URL=https://your-bible-qa-api-81c2e54b07f7.herokuapp.com
   heroku config:set NODE_ENV=production
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm start` - Start production server

## Project Structure

```
src/
├── components/          # Vue components
│   ├── ui/             # Reusable UI components
│   ├── QuestionForm.vue
│   ├── AnswerDisplay.vue
│   └── SavedAnswers.vue
├── composables/        # Vue composables
├── services/           # API and business logic
├── styles/            # Global styles
└── tests/             # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

MIT License
