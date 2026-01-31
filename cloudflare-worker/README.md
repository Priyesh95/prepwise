# Cloudflare Worker Setup for PrepWise

This Cloudflare Worker acts as a proxy to solve CORS issues when calling the Anthropic API from the browser.

## Why Do We Need This?

The Anthropic API doesn't support CORS (Cross-Origin Resource Sharing), which means browsers block direct calls. This Worker sits between your app and Anthropic's API, adding the necessary CORS headers.

## Setup Steps

### Step 1: Sign Up for Cloudflare

1. Go to [cloudflare.com](https://cloudflare.com)
2. Create a **free** account (no credit card required)
3. Verify your email

### Step 2: Create a Worker

1. From the Cloudflare dashboard, click **Workers & Pages** in the left sidebar
2. Click **Create Application**
3. Click **Create Worker**
4. Give it a name: `prepwise-api-proxy` (or any name you prefer)
5. Click **Deploy**

### Step 3: Add the Proxy Code

1. After deployment, you'll see a success screen
2. Click **Edit Code** button
3. You'll see a code editor with some default code
4. **Delete all the default code**
5. Open the `worker.js` file from this directory
6. **Copy all the code** from `worker.js`
7. **Paste it** into the Cloudflare editor (replacing everything)
8. Click **Save and Deploy** (top right)

### Step 4: Copy Your Worker URL

After deployment, you'll see your Worker URL. It looks like:

```
https://prepwise-api-proxy.yourusername.workers.dev
```

**Copy this entire URL** - you'll need it in the next step.

### Step 5: Configure PrepWise

1. In your PrepWise project, create a file named `.env` in the root directory
2. Add this line (replace with your actual Worker URL):

```
VITE_API_ENDPOINT=https://prepwise-api-proxy.yourusername.workers.dev
```

**Important:** Make sure to replace `yourusername` with your actual Cloudflare subdomain!

### Step 6: Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 7: Test It

1. Open http://localhost:5173
2. Go to Settings and add your Claude API key
3. Upload a small PDF
4. Try generating questions
5. If it works - you're done! 🎉

## How to Verify It's Working

Open your browser's Developer Console (F12) and look for:

✅ **Working:** You see API responses without errors
❌ **Not Working:** You see CORS errors mentioning `api.anthropic.com`

## Free Tier Limits

- **100,000 requests per day** - More than enough!
- **No credit card required**
- **No expiration**

If each quiz generation uses ~30 API calls, you can support **3,333 quiz generations per day** for free.

## Deployment to Production

When deploying PrepWise to production (Vercel, Netlify, etc.):

1. Make sure your `.env` file has the Worker URL
2. Build your project: `npm run build`
3. Deploy to your hosting platform
4. The Worker URL is baked into the build - users don't need to configure anything!

## Troubleshooting

### "Worker not found" or 404 errors

- Double-check the Worker URL in your `.env` file
- Make sure there are no typos
- Verify the Worker is deployed (check Cloudflare dashboard)

### Still seeing CORS errors

- Clear browser cache and hard refresh (Cmd/Ctrl + Shift + R)
- Restart your dev server after creating/editing `.env`
- Make sure `.env` is in the project root (same level as `package.json`)

### API errors (not CORS)

- Verify your Claude API key is valid at [console.anthropic.com](https://console.anthropic.com)
- Check you have credits remaining in your Anthropic account
- Try regenerating your API key

### Worker not responding

1. Go to Cloudflare dashboard
2. Click on your Worker
3. Check the **Logs** tab for errors
4. Verify the code was deployed correctly

## Updating the Worker

If you need to update the Worker code:

1. Go to Cloudflare dashboard
2. Click on your Worker
3. Click **Edit Code**
4. Make your changes
5. Click **Save and Deploy**

Changes take effect immediately!

## Monitoring Usage

To check your Worker usage:

1. Go to Cloudflare dashboard
2. Click on your Worker
3. View the **Metrics** tab
4. See requests, errors, and CPU time

## Cost

**Free tier includes:**
- 100,000 requests/day
- No credit card required
- Perfect for personal projects

**Paid plan (if you ever need it):**
- $5/month for 10 million requests
- You probably won't need this for PrepWise!

## Security Notes

- API keys are passed from the browser to the Worker to Anthropic
- The Worker doesn't store or log API keys
- Consider adding rate limiting for production apps
- The Worker is stateless and doesn't store any data

## Support

If you run into issues:
1. Check the troubleshooting section above
2. Verify all steps were followed correctly
3. Check Cloudflare Worker logs for detailed error messages

## Next Steps

After setting up the Worker:
1. ✅ Add your Claude API key in PrepWise
2. ✅ Upload a test PDF
3. ✅ Generate questions
4. ✅ Deploy to production when ready!
