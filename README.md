BantAI - NCAP Checker

A comprehensive web application for managing and analyzing traffic violations, built with modern web technologies and AI capabilities.

## 🚀 Features

- **AI-Powered Analysis**
  - Intelligent violation analysis
  - Automated appeal generation
  - Chat interface for violation queries

- **Violation Management**
  - Upload and track traffic violations
  - Interactive violation map visualization
  - Detailed violation analytics and charts
  - Plate number search functionality

- **Vehicle Management**
  - Comprehensive vehicle tracking
  - Violation history per vehicle
  - Vehicle registration management

- **User Dashboard**
  - Personalized user interface
  - Real-time violation updates
  - Statistical overview of violations

- **Authentication System**
  - Secure user authentication
  - Role-based access control
  - User profile management

## 🛠️ Technology Stack

- **Frontend**
  - React 18 with TypeScript
  - Vite for build tooling
  - TailwindCSS for styling
  - Shadcn UI components
  - React Router for navigation
  - React Query for data fetching
  - Framer Motion for animations

- **Backend**
  - Firebase Authentication
  - Firebase Firestore
  - Express.js server
  - Google Cloud Vertex AI
  - Google Maps API integration

- **Development Tools**
  - TypeScript
  - ESLint
  - Prettier
  - Tailwind CSS
  - Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Google Cloud account
- Netlify account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CimanesDev/BantAI.git
   cd BantAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Netlify Deployment

### Configuration

1. Create a `netlify.toml` file in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Environment Variables:
   Add the following environment variables in your Netlify dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Deployment Steps

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Handling Client-Side Routing

The `netlify.toml` configuration ensures that:
- All routes are redirected to `index.html`
- Page refreshes work correctly
- Deep linking is supported
- 404 pages are handled properly

## 🔒 Security

- Firebase Authentication for secure user management
- Role-based access control
- Secure API endpoints
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Google Cloud Platform
- Firebase
- Shadcn UI
- All contributors and supporters
