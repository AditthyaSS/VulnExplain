# 🚀 Quick Start: Groq API Setup

## What Changed?

VulnExplain now uses **Groq API with Llama 3.3-70b-versatile** instead of Gemini!

### Why Groq?
- ✅ **Free tier**: 30 requests/minute, 14,000 tokens/minute
- ✅ **Fast**: Ultra-fast inference (~280 tokens/second)
- ✅ **No credit card required**: Sign up and start using immediately
- ✅ **More reliable**: Better API availability

---

## Setup Steps (2 minutes)

### 1. Get Your Groq API Key

1. Visit: **https://console.groq.com/keys**
2. Sign up (free, no credit card needed)
3. Click **"Create API Key"**
4. Give it a name (e.g., "VulnExplain")
5. **Copy the key** (starts with `gsk_...`)

### 2. Add API Key to `.env`

Open `backend/.env` and add your key:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Restart Backend

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
python -m uvicorn server:app --reload --port 8000
```

### 4. Test It!

1. Go to http://localhost:3000
2. Try auditing a code snippet
3. Should work instantly! ⚡

---

## Model Options

Your `.env` is configured with the best model:

```bash
GROQ_MODEL=llama-3.3-70b-versatile  # Recommended
```

**Available models**:
- `llama-3.3-70b-versatile` - Best for security analysis (Recommended)
- `llama-3.1-70b-versatile` - Fast and capable
- `mixtral-8x7b-32768` - Good for long context

---

## Groq Free Tier Limits

| Metric | Limit |
|--------|-------|
| Requests/min | 30 |
| Tokens/min | 14,000 |
| Tokens/day | 14,400 |
| Speed | ~280 tokens/sec |

**This is MUCH better than Gemini's free tier!**

---

## Complete `.env` Configuration

```bash
# MongoDB Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vuln_database"

# CORS Configuration
CORS_ORIGINS="*"

# Groq API Key (REQUIRED)
GROQ_API_KEY=gsk_your_key_here  # ← Add your key!

# Groq Model
GROQ_MODEL=llama-3.3-70b-versatile

# GitHub Token (Optional)
# GITHUB_TOKEN=your_github_token
```

---

## Troubleshooting

### "Groq API key not configured"
- Make sure you added the key to `backend/.env`
- Restart the backend server

### Still getting errors?
- Check that your key starts with `gsk_`
- Verify you copied the entire key
- Check backend terminal for detailed error messages

---

**All done!** The app should now work perfectly with Groq! 🎉
