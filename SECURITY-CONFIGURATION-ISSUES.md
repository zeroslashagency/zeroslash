# Security & Configuration Issues - ACTION REQUIRED

## 🚨 CRITICAL: Exposed API Keys Found

### Issue 1: Google Apps Script URLs Exposed in Code

**Files with hardcoded URLs:**
- `/app/api/contact/route.ts` - Line 40
- `/app/api/waitlist/route.ts`
- `/app/api/addons/route.ts`
- `/app/api/project/route.ts`

**Exposed URL:**
```
https://script.google.com/macros/s/AKfycbyLGTKzQBMmuIOSwTjRcP73_eCsmKpQW2da5ILkoqFH7V-EFCle9SQBgB6YzuzeXVCYBA/exec
```

**Risk:** Anyone can see this URL in your public GitHub repo and potentially spam your forms.

---

## ✅ IMMEDIATE FIX REQUIRED

### Step 1: Add Environment Variables in Vercel

1. Go to: **https://vercel.com/zeroslashagency/zeroslash/settings/environment-variables**

2. Add these environment variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GS_CONTACT_WEB_APP_URL` | `https://script.google.com/macros/s/AKfycbyLGTKzQBMmuIOSwTjRcP73_eCsmKpQW2da5ILkoqFH7V-EFCle9SQBgB6YzuzeXVCYBA/exec` | Production, Preview, Development |
| `GS_WAITLIST_WEB_APP_URL` | (Your waitlist script URL) | Production, Preview, Development |
| `GS_ADDONS_WEB_APP_URL` | (Your addons script URL) | Production, Preview, Development |
| `GS_PROJECT_WEB_APP_URL` | (Your project script URL) | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://zeroslash.in` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://zeroslash-preview.vercel.app` | Preview |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-5WHBQG0GVE` | Production, Preview |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | (Your Bing verification code) | Production |

3. Click **"Save"** for each variable

4. **Redeploy** your site after adding variables

---

### Step 2: Google Search Console DNS Verification

**Problem:** The TXT record was not found in your DNS.

**Current DNS records found:**
```
v=spf1 include:zoho.in ~all
```

**You need to ADD (not replace) this TXT record:**

#### If using Zoho Mail DNS:

1. Log in to your domain registrar (where you bought zeroslash.in)
2. Go to **DNS Management** or **DNS Settings**
3. **Add a NEW TXT record** (don't delete existing ones):

```
Type: TXT
Host: @ (or leave blank, or "zeroslash.in")
Value: google-site-verification=913dXJVGzJHNm__G_CPsML1r98xkLM9oLG-wjJIo5hM
TTL: 3600
```

**Important:** You'll have MULTIPLE TXT records:
- ✅ Keep: `v=spf1 include:zoho.in ~all` (for email)
- ✅ Add: `google-site-verification=913dXJVGzJHNm__G_CPsML1r98xkLM9oLG-wjJIo5hM` (for Google)

4. **Wait 15-30 minutes** for DNS propagation
5. Go back to Google Search Console and click **"Verify"** again

---

### Step 3: Alternative Verification Method (Faster)

Since the HTML meta tag is already in your code:

1. Deploy your site to Vercel (with the changes we made)
2. Wait 2-3 minutes for deployment
3. Go to Google Search Console
4. Click **"Use a different method"**
5. Select **"HTML tag"** method
6. Click **"Verify"**

This will work immediately after deployment!

---

## 📋 Vercel Configuration Checklist

### Environment Variables You Need:

**Required (Backend):**
- [ ] `GS_CONTACT_WEB_APP_URL` - Contact form webhook
- [ ] `GS_WAITLIST_WEB_APP_URL` - Waitlist webhook
- [ ] `GS_ADDONS_WEB_APP_URL` - Addons webhook
- [ ] `GS_PROJECT_WEB_APP_URL` - Project form webhook

**Required (Frontend - NEXT_PUBLIC_):**
- [ ] `NEXT_PUBLIC_SITE_URL` - Your domain
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID
- [ ] `NEXT_PUBLIC_BING_SITE_VERIFICATION` - Bing verification (optional)

### After Adding Environment Variables:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. Or push a new commit to trigger rebuild

---

## 🔒 Security Recommendations

### 1. Remove Hardcoded URLs from Code (I'll do this)

We need to remove the fallback URLs from the code and rely only on environment variables.

### 2. Add Rate Limiting

Consider adding rate limiting to your API routes to prevent spam:
- Use Vercel Edge Config or Upstash Redis
- Limit submissions per IP address
- Add CAPTCHA if spam becomes an issue

### 3. Add CORS Protection

Your API routes should only accept requests from your domain:
```typescript
// Add to API routes
if (origin !== 'https://zeroslash.in') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 🔍 How to Check Everything is Perfect

### 1. Check Environment Variables:
```bash
# In Vercel dashboard
Settings → Environment Variables → Should see all variables listed
```

### 2. Check DNS TXT Records:
```bash
# Online tool
https://mxtoolbox.com/SuperTool.aspx?action=txt%3azeroslash.in

# Command line
nslookup -type=TXT zeroslash.in
```

You should see BOTH:
- `v=spf1 include:zoho.in ~all`
- `google-site-verification=913dXJVGzJHNm__G_CPsML1r98xkLM9oLG-wjJIo5hM`

### 3. Check Deployment:
```bash
# Visit your site
https://zeroslash.in

# Check if forms work
Test contact form submission
```

### 4. Check Google Search Console:
- Verification status should be ✅ green
- Submit sitemap: `sitemap.xml`
- Request indexing for main pages

---

## ⚡ Quick Setup Steps (In Order)

1. **Add Vercel Environment Variables** (5 minutes)
   - Copy values from code to Vercel dashboard
   - Save all variables

2. **Add DNS TXT Record** (5 minutes)
   - Log in to domain registrar
   - Add Google verification TXT record
   - Wait 15-30 minutes

3. **Deploy Code Changes** (I'll push cleaned code)
   - Remove hardcoded URLs
   - Rely on environment variables only

4. **Verify Google Search Console** (2 minutes)
   - Use HTML tag method (faster)
   - Submit sitemap

5. **Test Everything** (5 minutes)
   - Submit contact form
   - Check Analytics tracking
   - Check site loads properly

---

## 🆘 Need Help?

**Which domain registrar do you use for zeroslash.in?**
- GoDaddy
- Namecheap
- Cloudflare
- HostGator
- Other (please specify)

I can provide specific instructions for your provider!

**Where is your email hosted?**
- Zoho Mail (detected from DNS)
- Gmail/Google Workspace
- Other

**Vercel Token Created:**
✅ Token name: `qwertyui`
✅ Expires: July 9, 2026
✅ Can be used for API deployments

---

## Current Status

- ❌ Environment variables not configured in Vercel
- ❌ Google DNS verification failed
- ⚠️ API keys exposed in code (will fix)
- ✅ Google HTML meta tag added (alternative verification)
- ✅ SEO optimizations complete
- ✅ Code pushed to GitHub

**Next: I'll remove the hardcoded URLs from the code.**
