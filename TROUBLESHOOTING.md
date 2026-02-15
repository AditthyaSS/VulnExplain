# 🔧 Troubleshooting Guide

## Current Issues & Solutions

### 1. ❌ Invalid Gemini API Key Error

**Error**: `400 API Key not valid. Please pass a valid API key.`

**Problem**: The Gemini API key in your `.env` file is invalid or expired.

**Solution**:
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. **Delete any old/expired keys**
4. Click "Create API Key" (choose "Create API key in new project")
5. **Copy the NEW key**
6. Open `backend/.env` 
7. Replace line 15 with your new key:
   ```bash
   EMERGENT_LLM_KEY=your_new_api_key_here
   ```
8. **Save the file**
9. Restart the backend server (Ctrl+C, then rerun)

---

### 2. ❌ GitHub API Rate Limit (403 Error)

**Error**: `Failed to fetch repository. Status: 403.`

**Problem**: GitHub limits unauthenticated API requests to 60/hour. You've exceeded this.

**Solutions**:

#### Option A: Wait (Easiest)
- Wait ~1 hour for the rate limit to reset
- Use **code snippet** or **file upload** features instead

#### Option B: Add GitHub Token (Recommended)
This increases your limit to 5,000 requests/hour.

1. **Create GitHub Token**:
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name (e.g., "VulnExplain")
   - Select scope: **`repo`** (read access to repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Add to `.env`**:
   - Open `backend/.env`
   - Add at the bottom:
     ```bash
     GITHUB_TOKEN=ghp_yourTokenHere
     ```
   - Save the file

3. **Restart backend server**

---

## Current `.env` Issues

Your `.env` file has been updated. Here's what it should look like:

```bash
# MongoDB Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vuln_database"

# CORS Configuration
CORS_ORIGINS="*"

# Gemini AI API Key (REQUIRED)
EMERGENT_LLM_KEY=your_new_gemini_key_here  # ← UPDATE THIS!

# Gemini Model
GEMINI_MODEL=gemini-1.5-flash

# GitHub Token (Optional but recommended)
GITHUB_TOKEN=your_github_token_here  # ← ADD THIS (optional)
```

---

## Quick Verification Checklist

After fixing the above:

- [ ] New Gemini API key added to `.env`
- [ ] Backend server restarted
- [ ] Try auditing a **code snippet** first (doesn't need GitHub)
- [ ] If using repo scan, add GitHub token or wait for rate limit reset

---

## Alternative: Use Code Snippet Instead

If you want to test immediately without waiting:

1. Go to http://localhost:3000
2. Instead of "GitHub URL", use **"Code Snippet"** tab
3. Paste some code to analyze
4. This doesn't use GitHub API and will work immediately

---

## Need Help?

1. **Gemini API Issues**: https://ai.google.dev/gemini-api/docs
2. **GitHub Rate Limits**: https://docs.github.com/en/rest/rate-limit
3. **Check backend logs**: Look at the terminal running the backend for detailed errors
