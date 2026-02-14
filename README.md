# VulnExplain - Security Audit SaaS Platform

A comprehensive B2B security audit platform that analyzes code snippets and repositories for vulnerabilities using AI-powered analysis.

## 🚀 Features

- **AI-Powered Security Analysis**: Leverages Gemini AI for intelligent vulnerability detection
- **CWE-Based Classification**: Deterministic severity mapping based on industry-standard CWE identifiers
- **Financial Impact Assessment**: Calculates remediation costs, downtime, compliance fines, and reputation impact
- **Multi-Input Support**: Analyze code snippets, uploaded files, or GitHub repositories
- **PDF Report Generation**: Professional security audit reports with detailed findings
- **Modern Dashboard**: Beautiful, dark-mode enabled React interface with real-time analytics
- **SOC 2 Compliance Mapping**: Automatic mapping of vulnerabilities to SOC 2 controls

## 📋 Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **AI**: Google Generative AI (Gemini)
- **Authentication**: JWT-based (python-jose, passlib)
- **Report Generation**: ReportLab

### Frontend
- **Framework**: React 19
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios
- **Build Tool**: CRACO (Create React App Configuration Override)

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

4. Configure your environment variables:
   - `MONGO_URL`: MongoDB connection string
   - `DB_NAME`: Database name
   - `EMERGENT_LLM_KEY`: Your Emergent AI/Gemini API key
   - `CORS_ORIGINS`: Allowed CORS origins

5. Start the backend server:
```bash
python -m uvicorn server:app --reload --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

4. Configure your environment variables:
   - `REACT_APP_BACKEND_URL`: Backend API URL (default: http://localhost:8000)

5. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=vuln_database
CORS_ORIGINS=*
EMERGENT_LLM_KEY=your_api_key_here
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## 📖 API Endpoints

- `GET /api/` - Health check
- `POST /api/audit` - Audit a code snippet
- `POST /api/audit-repo` - Audit a repository or uploaded file
- `POST /api/generate-report` - Generate PDF security report

## 🚀 Production Deployment

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build directory with your preferred web server
```

## 🎨 Features Highlights

### Security Analysis
- Deterministic severity scoring based on CWE mapping
- Deduplication of findings
- Evidence-based vulnerability detection
- No speculative or hypothetical issues

### Financial Impact
- Developer remediation costs
- Potential downtime losses
- DPDP Act 2023 compliance fines
- Reputation and customer churn impact

### User Experience
- Clean, modern UI with dark mode support
- Real-time vulnerability categorization
- Interactive charts and analytics
- Responsive design for all devices

## 🧪 Development

The project includes:
- Custom emergentintegrations wrapper for AI integration
- Hot-reload for both frontend and backend
- Comprehensive error handling
- Async/await patterns throughout

## 📝 License

This project is proprietary software.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

---

Built with ❤️ using FastAPI, React, and Gemini AI
