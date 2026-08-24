# ResumeRoast AI 🔥

ResumeRoast AI is a premium, production-ready AI-powered Resume Analyzer & Builder web application. Students can upload their PDF resumes, which are parsed locally in memory. The text content is evaluated against a target job role by Google's Gemini AI to return:
- An **ATS Match Rate** (0-100)
- A highly constructive but humorous **AI Roast**
- Detailed **Section-by-Section Critiques** (Experience, Projects, Education, etc.)
- A checklist of **Missing Job Keywords** mapped by impact and instructions on where to add them
- Dynamic **AI Rewrites** ("Fix it for me") based on custom user prompts (utilizing STAR/metrics standards)
- A **Revision Version History** log
- Clean, single-column **ATS-Friendly PDF downloads** compiled via jsPDF

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router DOM, React Hook Form, Axios, React Hot Toast, React Dropzone, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT Cookie Authentication, Multer, PDF-Parse, jsPDF, `@google/generative-ai`.
- **Database**: MongoDB Atlas with Mongoose models.

---

## 📂 Folder Structure

```
jovacResumeProject/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Navbar, Sidebar, ATSGauge, Upload)
│   │   ├── context/        # Authentication Global Provider
│   │   ├── pages/          # Main Views (Landing, Login, Dashboard, Analysis, Profile)
│   │   ├── services/       # Axios client connection configurations
│   │   ├── App.jsx         # App router and layout definitions
│   │   └── main.jsx        # Mount point
│   ├── tailwind.config.js  # Theme overrides for dark SaaS aesthetic
│   └── package.json
│
├── server/                 # Express Backend
│   ├── config/             # DB configurations
│   ├── controllers/        # Request controller implementations
│   ├── middleware/         # Cookie/Token JWT protections
│   ├── models/             # Mongoose schemas (User, Resume, ResumeHistory)
│   ├── routes/             # Authentication & Resume routes
│   ├── services/           # Gemini AI SDK integrations
│   ├── utils/              # jsPDF resume compiles
│   ├── .env.example        # Environment template variables
│   └── server.js           # Server initialization script
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisite
1. **Node.js**: Ensure Node.js (v18+) is installed.
2. **MongoDB**: Install local MongoDB Community Server or setup a free database instance on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
3. **Gemini API Key**: Retrieve a free API key from the [Google AI Studio Console](https://aistudio.google.com/).

### Step 1: Clone and Configure Backend
1. Navigate into the `server` directory:
   ```bash
   cd server
   ```
2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
3. Set your configuration keys inside the `.env` file:
   - **`MONGO_URI`**: Set to your local MongoDB server `mongodb://127.0.0.1:27017/resumeroast` or Atlas Cluster connection string.
   - **`GEMINI_API_KEY`**: Set to your Google Gemini API key.
   - **`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`**: Set to secure cryptographic strings.
4. Start the server in hot-reload development mode:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`*

### Step 2: Configure and Start Client
1. Open a new terminal and navigate into the `client` directory:
   ```bash
   cd client
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client runs on `http://localhost:5173`*

---

## 🚀 Production Deployment

### 1. Database (MongoDB Atlas)
1. Set up a free cluster and white-list connection accesses (`0.0.0.0/0` for cloud hosting).
2. Save the connection string `mongodb+srv://...` for your server env.

### 2. Backend (Render / Heroku)
1. Connect your GitHub repository to [Render](https://render.com/).
2. Select **Web Service** and choose Node environment.
3. Configure build commands:
   ```bash
   cd server && npm install
   ```
4. Set start commands:
   ```bash
   cd server && node server.js
   ```
5. Set environment variables:
   - `MONGO_URI`, `GEMINI_API_KEY`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`, `CLIENT_URL=https://your-client-vercel-app.vercel.app`

### 3. Frontend (Vercel)
1. Import the root repository to [Vercel](https://vercel.com/).
2. Override **Root Directory** settings to point to `client`.
3. Set Framework Preset to **Vite**.
4. Deploy. The proxy configured in `vite.config.js` is automatically bypassed in production relative path calls. Set up environment key `VITE_API_URL` matching the backend Render web service url.

---

## 🔒 Security Measures
- **HTTPOnly Cookies**: Store token payloads in server-only secure cookies to mitigate XSS scripts.
- **Helmet**: Helmet secure headers are enabled.
- **CORS Policies**: Strict CORS domain white-listing configuration.
- **Rate Limiters**: Standard request limits on `/api` scopes to mitigate DDoS.
- **PDF Cap Size**: Multer blocks PDF attachments larger than 5MB to save resource memory.
