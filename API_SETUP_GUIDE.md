# 🔑 API Key Setup Guide

This guide will help you set up the required API keys for **VulnExplain**.

## Required API Key

### 1. Google Gemini API Key

VulnExplain uses Google's Gemini AI to perform intelligent security vulnerability analysis. You'll need a Gemini API key to run the application.

#### How to Get Your Gemini API Key:

1. **Visit Google AI Studio**: https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Create API Key**:
   - Click on "Create API Key" button
   - Choose "Create API key in new project" or select an existing project
   - Copy the generated API key

4. **Add to Backend `.env` file**:
   - Open `backend/.env`
   - Replace `your_gemini_api_key_here` with your actual API key
   
   ```bash
   EMERGENT_LLM_KEY=AIza...your_actual_key_here
   ```

#### Pricing & Limits:

- **Free Tier Models**:
  - **gemini-1.5-flash** (Recommended): 1,500 requests per minute (RPM) - Fast and generous limits
  - **gemini-1.5-pro**: 2 requests per minute - More capable but stricter limits
  
- **Paid/Restricted Models**:
  - **gemini-2.5-pro**: 0 RPM on free tier (requires paid plan)

- **For details**: https://ai.google.dev/pricing

#### Model Configuration:

The app defaults to **gemini-1.5-flash** for optimal free tier usage. You can change this in `backend/.env`:

```bash
# Use gemini-1.5-flash (recommended for free tier)
GEMINI_MODEL=gemini-1.5-flash

# Or use gemini-1.5-pro (slower rate limits but more capable)
# GEMINI_MODEL=gemini-1.5-pro
```

**Note**: If you encounter "quota exceeded" errors, make sure you're using `gemini-1.5-flash` or wait for the quota to reset.

## Configuration Files

### Backend Configuration (`backend/.env`)

```bash
# MongoDB Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vuln_database"

# CORS Configuration
CORS_ORIGINS="*"

# Gemini AI API Key (REQUIRED)
EMERGENT_LLM_KEY=your_gemini_api_key_here  # ← Replace this!

# Gemini Model Configuration (Optional - defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash
```

### Frontend Configuration (`frontend/.env`)

```bash
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

*Note: Frontend configuration is already set up for local development.*

## Verification

After adding your API key, verify the setup:

1. **Start MongoDB** (if not already running):
   ```bash
   # Windows (if using MongoDB as a service)
   net start MongoDB
   ```

2. **Start Backend**:
   ```bash
   cd backend
   python -m uvicorn server:app --reload --port 8000
   ```

3. **Check API Health**:
   - Visit: http://localhost:8000/api/
   - Should return: `{"message": "VulnExplain API - B2B Security Audit SaaS"}`

4. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

5. **Test the Application**:
   - Frontend: http://localhost:3000
   - Try auditing a simple code snippet to verify the Gemini API is working

## Troubleshooting

### Error: "quota exceeded for gemini-2.5-pro"
- **Solution**: The app now uses `gemini-1.5-flash` by default (1500 RPM free)
- Restart the backend server: Stop (Ctrl+C) and run `python -m uvicorn server:app --reload --port 8000` again
- If you manually set `GEMINI_MODEL=gemini-2.5-pro`, change it to `gemini-1.5-flash`

### Error: "Emergent LLM key not configured"
- Make sure you've added your Gemini API key to `backend/.env`
- Restart the backend server after adding the key

### MongoDB Connection Issues
- Ensure MongoDB is installed and running
- Verify `MONGO_URL` in `.env` matches your MongoDB connection string

### CORS Errors
- Current configuration allows all origins (`*`)
- For production, update `CORS_ORIGINS` to specific domains

## Security Best Practices

⚠️ **Important**:
- **Never commit** `.env` files to version control
- The `.gitignore` already includes `.env` files
- Use `.env.example` as a template for team members
- Rotate API keys periodically
- Use environment-specific keys (development vs production)

## Need Help?

- **Gemini API Documentation**: https://ai.google.dev/docs
- **VulnExplain API Docs**: http://localhost:8000/docs (when backend is running)

---

**Ready to go?** Once you've added your Gemini API key, start both servers and begin auditing! 🚀
