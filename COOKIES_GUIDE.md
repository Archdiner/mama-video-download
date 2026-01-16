# 🍪 Fixing "Sign in to confirm you're not a bot"

YouTube actively blocks requests from data centers (like Vercel). The **only genuine solution** 
is to provide a "Session Proof" (Cookies) so YouTube thinks the request is coming from your browser.

## Step 1: Get Your Cookies
1. Install the free Chrome extension: **[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflccgomhkjevpj)**
2. Go to **[YouTube.com](https://www.youtube.com)** (make sure you are logged out or use an incognito window for safety, though logged in works best)
3. Click the extension icon and run "Export"
4. Open the downloaded `cookies.txt` file
5. **Copy the entire content** of the file

## Step 2: Add to Vercel
1. Go to your **Vercel Dashboard** → Select your Project
2. Go to **Settings** → **Environment Variables**
3. Create a new variable:
   - **Key:** `YOUTUBE_COOKIES`
   - **Value:** [Paste the entire content of cookies.txt here]
4. Click **Save**
5. Go to **Deployments** → Click the three dots on the latest deployment → **Redeploy**

## Why is this necessary?
Google blocks all unauthenticated traffic from cloud servers (AWS, Vercel, Heroku). 
By adding cookies, your server "pretends" to be your home browser, which bypasses the check.
