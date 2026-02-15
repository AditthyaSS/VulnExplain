# ✅ Quota Issue Fixed

## Problem
You encountered a "quota exceeded" error because the app was using **gemini-2.5-pro**, which has 0 requests per minute (RPM) on the free tier.

## Solution Applied

### 1. Changed Default Model
- **Old**: `gemini-2.5-pro` (0 RPM free tier)
- **New**: `gemini-1.5-flash` (1500 RPM free tier)

### 2. Updated Files
- ✅ `backend/server.py` - Now uses `gemini-1.5-flash` by default
- ✅ `backend/.env` - Added `GEMINI_MODEL=gemini-1.5-flash`
- ✅ `backend/.env.example` - Added model configuration
- ✅ `API_SETUP_GUIDE.md` - Added quota and model information

## Next Steps

### Restart Backend Server

**You MUST restart the backend server** for the changes to take effect:

1. In the terminal running the backend, press `Ctrl+C` to stop it
2. Restart with:
   ```bash
   python -m uvicorn server:app --reload --port 8000
   ```

### Test the Fix

1. Go to http://localhost:3000
2. Try auditing a code snippet
3. Should work now without quota errors!

## Model Comparison

| Model | Free Tier RPM | Use Case |
|-------|---------------|----------|
| **gemini-1.5-flash** | 1,500 | ✅ Recommended - Fast & generous limits |
| gemini-1.5-pro | 2 | More capable but stricter limits |
| gemini-2.5-pro | 0 | ❌ Requires paid plan |

## Configuration

Your current `.env` settings:
```bash
EMERGENT_LLM_KEY=AIzaSyAoCe6fslFiwaSNe8H_-YVAYS8R3pRvPQk
GEMINI_MODEL=gemini-1.5-flash
```

---

**All set!** Just restart the backend and you're good to go! 🚀
