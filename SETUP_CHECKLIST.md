# PrepWise Setup Checklist

Use this checklist to ensure you've completed all steps correctly.

## ✅ Pre-Setup

- [ ] Node.js installed (v18 or higher)
- [ ] Git installed (optional, but recommended)
- [ ] Text editor ready (VS Code, etc.)

## ✅ Part 1: Install PrepWise

- [ ] Downloaded/cloned PrepWise project
- [ ] Opened terminal in project directory
- [ ] Ran `npm install` successfully
- [ ] No errors during installation

## ✅ Part 2: Cloudflare Worker Setup

### Account Creation
- [ ] Signed up at cloudflare.com
- [ ] Verified email address
- [ ] Can log in to Cloudflare dashboard

### Worker Deployment
- [ ] Clicked "Workers & Pages" in sidebar
- [ ] Created new Worker named `prepwise-api-proxy`
- [ ] Clicked "Edit Code"
- [ ] Deleted default code
- [ ] Copied code from `/cloudflare-worker/worker.js`
- [ ] Pasted code into Cloudflare editor
- [ ] Clicked "Save and Deploy"
- [ ] Saw success message

### Worker URL
- [ ] Copied Worker URL (looks like `https://prepwise-api-proxy.USERNAME.workers.dev`)
- [ ] Saved URL in a safe place

## ✅ Part 3: Configure PrepWise

- [ ] Created `.env` file in project root (same level as `package.json`)
- [ ] Added line: `VITE_API_ENDPOINT=https://your-worker-url.workers.dev`
- [ ] Replaced `your-worker-url` with actual Worker URL
- [ ] Saved `.env` file
- [ ] File is named exactly `.env` (not `.env.txt`)

## ✅ Part 4: Claude API Key

- [ ] Visited console.anthropic.com
- [ ] Created account or logged in
- [ ] Confirmed $5 free credit
- [ ] Went to API Keys section
- [ ] Created new API key
- [ ] Copied key (starts with `sk-ant-api03-`)
- [ ] Kept key safe for next step

## ✅ Part 5: Start PrepWise

- [ ] Ran `npm run dev` in terminal
- [ ] Saw "Local: http://localhost:5173" message
- [ ] Opened browser to http://localhost:5173
- [ ] PrepWise loaded successfully

## ✅ Part 6: First Use

- [ ] Prompted to add API key
- [ ] Pasted Claude API key
- [ ] Clicked "Save Key & Continue"
- [ ] Redirected to Dashboard
- [ ] Clicked "Upload" in header

## ✅ Part 7: Test Upload & Generation

- [ ] Selected a PDF file (5-20 pages recommended)
- [ ] PDF uploaded successfully
- [ ] Saw "Processing" screen
- [ ] Text extracted successfully
- [ ] Reviewed extracted text
- [ ] Clicked "Continue"
- [ ] Questions generating...
- [ ] **45 questions generated successfully** 🎉
- [ ] Redirected to Configure page

## ✅ Verification

### Check These:
- [ ] No CORS errors in browser console (F12 → Console tab)
- [ ] Questions generated without errors
- [ ] Can see MCQ, Single Word, and Short Answer questions
- [ ] Can navigate through the app

### If Any Issues:
- [ ] Checked `.env` file for correct Worker URL
- [ ] Restarted dev server (Ctrl+C then `npm run dev`)
- [ ] Cleared browser cache (Cmd/Ctrl + Shift + R)
- [ ] Verified Worker is deployed in Cloudflare
- [ ] Checked Cloudflare Worker logs for errors

## 🎉 Success!

If all checkboxes above are checked, you're ready to use PrepWise!

---

## 📝 Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check `.env` has correct Worker URL, restart dev server |
| Worker 404 | Verify Worker is deployed in Cloudflare dashboard |
| API key invalid | Regenerate key at console.anthropic.com |
| No questions generated | Check API credits, check Cloudflare logs |
| Build errors | Run `npm install` again |

---

## 🚀 Next Steps After Setup

### For Development:
- [ ] Test with different PDFs
- [ ] Try different question types
- [ ] Customize settings

### For Production:
- [ ] Run `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Share with users!

---

## 📚 Resources

- **Detailed Guide:** [QUICKSTART.md](QUICKSTART.md)
- **Cloudflare Help:** [cloudflare-worker/README.md](cloudflare-worker/README.md)
- **Anthropic Console:** [console.anthropic.com](https://console.anthropic.com)

---

**Print this checklist and mark items as you complete them!**
