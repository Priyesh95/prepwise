# PrepWise - Quick Start Guide

## ⚡ Get PrepWise Running in 15 Minutes

Follow these steps in order. Don't skip any!

---

## Step 1: Install Dependencies (2 minutes)

```bash
cd prepwise
npm install
```

Wait for installation to complete.

---

## Step 2: Set Up Cloudflare Worker (7 minutes)

The Anthropic API requires a proxy to work from browsers. Follow these steps:

### 2.1: Create Cloudflare Account

1. Go to **[cloudflare.com](https://cloudflare.com)**
2. Click **Sign Up** (top right)
3. Create a **free** account (no credit card needed)
4. Verify your email

### 2.2: Create a Worker

1. From Cloudflare dashboard, click **Workers & Pages** (left sidebar)
2. Click **Create Application**
3. Click **Create Worker**
4. Name it: `prepwise-api-proxy`
5. Click **Deploy**

### 2.3: Add the Proxy Code

1. After deployment, click **Edit Code**
2. Delete all the default code you see
3. Go to your PrepWise project folder: `/cloudflare-worker/worker.js`
4. Open `worker.js` and copy ALL the code
5. Paste it into the Cloudflare editor
6. Click **Save and Deploy** (top right)

### 2.4: Copy Your Worker URL

After deploying, you'll see a URL like:

```
https://prepwise-api-proxy.yourusername.workers.dev
```

**Copy this entire URL!** You'll need it next.

### 2.5: Configure PrepWise

1. In your PrepWise project root (same folder as `package.json`), create a new file named `.env`
2. Add this line (replace with YOUR Worker URL):

```
VITE_API_ENDPOINT=https://prepwise-api-proxy.yourusername.workers.dev
```

**Important:** Use YOUR actual Worker URL from step 2.4!

---

## Step 3: Get Claude API Key (3 minutes)

1. Visit **[console.anthropic.com](https://console.anthropic.com)**
2. Sign up or log in
3. You'll get **$5 free credit** (about 150 quiz sessions!)
4. Go to **API Keys** → **Create Key**
5. Copy your API key (starts with `sk-ant-api03-`)
6. Keep it safe - you'll add it in PrepWise in a moment

---

## Step 4: Start PrepWise (1 minute)

```bash
npm run dev
```

Open your browser to **http://localhost:5173**

---

## Step 5: Use PrepWise (2 minutes)

1. **Add API Key:**
   - PrepWise will prompt you for your API key
   - Paste the key from Step 3
   - Click **Save Key & Continue**

2. **Upload a PDF:**
   - Click **Upload** in the header
   - Drag & drop a PDF or click **Browse Files**
   - Choose a small PDF for testing (5-20 pages works best)

3. **Generate Questions:**
   - Review the extracted text
   - Click **Continue**
   - Wait 1-2 minutes while AI generates questions
   - Start your quiz! 🎉

---

## ✅ Verification

### You'll Know It's Working When:

- ✅ No CORS errors in browser console (press F12)
- ✅ Questions generate successfully
- ✅ You can take quizzes

### If Something's Wrong:

1. **CORS errors?**
   - Check your `.env` file has the correct Worker URL
   - Restart dev server: Stop (Ctrl+C) and run `npm run dev` again
   - Clear browser cache (Cmd/Ctrl + Shift + R)

2. **Worker not found?**
   - Verify the Worker is deployed in Cloudflare dashboard
   - Double-check the URL in `.env` has no typos

3. **API key errors?**
   - Verify key starts with `sk-ant-api03-`
   - Check you have credits at console.anthropic.com
   - Try regenerating the key

---

## 📁 Your File Structure Should Look Like:

```
prepwise/
├── .env                          ← You created this
├── .env.example
├── package.json
├── cloudflare-worker/
│   ├── worker.js                ← You copied this code
│   └── README.md
├── src/
│   └── ...
└── ...
```

---

## 💰 Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| Cloudflare Worker | **FREE** | 100K requests/day |
| Claude API | **$5 free credit** | ~150 quiz sessions |
| Hosting PrepWise | **FREE** | Use Vercel/Netlify |
| **Total** | **$0** | 🎉 |

After the free credit, it's ~$0.03 per quiz session (very cheap!).

---

## 🚀 Next Steps

### For Development:
- Keep using `npm run dev` to test locally
- The Worker will handle all API calls

### For Production Deployment:

1. **Build PrepWise:**
   ```bash
   npm run build
   ```

2. **Deploy to hosting:**
   - **Vercel:** `vercel` or connect GitHub repo
   - **Netlify:** Drag `dist` folder or connect GitHub
   - **GitHub Pages:** Use GitHub Actions

3. **Your users will:**
   - Visit your deployed site
   - Add their own Claude API key
   - Start using PrepWise immediately!

**Important:** The Cloudflare Worker URL is baked into your build. Users don't need to configure anything!

---

## 📚 Additional Resources

- **Cloudflare Setup Details:** [cloudflare-worker/README.md](cloudflare-worker/README.md)
- **Anthropic Console:** [console.anthropic.com](https://console.anthropic.com)
- **Deployment Guide:** Coming in future updates!

---

## 🎯 Quick Reference

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Environment Variables:**
- `.env` - Your local configuration (not committed to git)
- Contains: `VITE_API_ENDPOINT=your-worker-url`

---

## ❓ Still Having Issues?

1. Check [cloudflare-worker/README.md](cloudflare-worker/README.md) for detailed troubleshooting
2. Verify all steps were completed in order
3. Check Cloudflare Worker logs for detailed errors
4. Make sure `.env` file is in the project root

---

**You're all set! Happy studying! 📚✨**
