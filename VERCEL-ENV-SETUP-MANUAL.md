# Vercel Environment Variables - Quick Setup

## 🚀 MANUAL SETUP (5 Minutes)

### Step 1: Go to Your Vercel Project Settings

1. Open: **https://vercel.com/dashboard**
2. Find your **zeroslash** project
3. Click on it
4. Go to **Settings** tab (top navigation)
5. Click **Environment Variables** in left sidebar

---

## Step 2: Add These Environment Variables

Copy and paste each variable exactly as shown below.

For each variable, select **ALL ENVIRONMENTS** (Production, Preview, Development):

### Backend Variables (Secret - NOT exposed to frontend):

#### 1. Contact Form
```
Name: GS_CONTACT_WEB_APP_URL
Value: https://script.google.com/macros/s/AKfycbyLGTKzQBMmuIOSwTjRcP73_eCsmKpQW2da5ILkoqFH7V-EFCle9SQBgB6YzuzeXVCYBA/exec
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 2. Waitlist Form
```
Name: GS_WAITLIST_WEB_APP_URL
Value: https://script.google.com/macros/s/AKfycbywj4XiflD7Zs0QGyjUeCUsIG3oTX20VY6gpL3xFjzOCBFo9BuZ1eHdWFqBplPE051T/exec
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 3. Addons Form
```
Name: GS_ADDONS_WEB_APP_URL
Value: https://script.google.com/macros/s/AKfycbx_EDJds3agTzNiNq-AxQHaV1JXlDx5KJrMMGZ9ZdRH-26_FAaRZBkWHKZmYyRHCsbM6w/exec
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 4. Project Form
```
Name: GS_PROJECT_WEB_APP_URL
Value: https://script.google.com/macros/s/AKfycby9EOSUZhXCxXfEzB66BCcBe-dAb4ktjzUK8gLFCD5TfhIPL39mQlyO1BBjPblHmUgR/exec
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### Frontend Variables (Public - NEXT_PUBLIC_):

#### 5. Site URL (Production Only)
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://zeroslash.in
Environments: ✅ Production ONLY
```

#### 6. Google Analytics (All Environments)
```
Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-5WHBQG0GVE
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## Step 3: Redeploy Your Site

After adding all variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots menu)
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

---

## ✅ Checklist

- [ ] Added `GS_CONTACT_WEB_APP_URL` (all environments)
- [ ] Added `GS_WAITLIST_WEB_APP_URL` (all environments)
- [ ] Added `GS_ADDONS_WEB_APP_URL` (all environments)
- [ ] Added `GS_PROJECT_WEB_APP_URL` (all environments)
- [ ] Added `NEXT_PUBLIC_SITE_URL` (production only)
- [ ] Added `NEXT_PUBLIC_GA_MEASUREMENT_ID` (all environments)
- [ ] Clicked "Redeploy" after adding variables
- [ ] Waited for deployment to complete

---

## 🔍 How to Verify Everything Works

### 1. Check Environment Variables in Vercel:
- Should see 6 variables listed
- Each should show correct environments (Production/Preview/Development)

### 2. Check Deployment Status:
- Go to Deployments tab
- Latest deployment should show "Ready" with green checkmark
- Click on deployment to see build logs

### 3. Test Your Website:
```
https://zeroslash.in
```

- Visit the site
- Try submitting contact form
- Check if forms work without errors
- Open browser console (F12) - should see no errors

### 4. Check Analytics:
- Visit your site
- Wait 1-2 minutes
- Check Google Analytics dashboard
- Should see real-time visitors

---

## 🚨 Common Issues

### "Project not found" in API
**Fix:** The API needs your exact Project ID. Find it at:
- Vercel Dashboard → Your Project → Settings → General
- Copy "Project ID" value
- Use that in the script instead of "zeroslash"

### Forms showing "Server configuration error"
**Cause:** Environment variables not set or deployment not redeployed
**Fix:**
1. Verify all 6 variables exist in Vercel dashboard
2. Redeploy the site
3. Clear browser cache and test again

### Google Analytics not tracking
**Cause:** `NEXT_PUBLIC_GA_MEASUREMENT_ID` not set
**Fix:**
1. Add the variable in Vercel
2. Make sure it's set for Production environment
3. Redeploy
4. Wait 5-10 minutes for data to appear

---

## 📸 Visual Guide

### Adding Environment Variable:

1. **Name field:** Enter variable name (e.g., `GS_CONTACT_WEB_APP_URL`)
2. **Value field:** Paste the URL
3. **Environments:** Check all boxes ✅ Production ✅ Preview ✅ Development
4. Click **"Save"** button

Repeat for all 6 variables.

---

## ⚡ Quick Copy-Paste (All Variables)

```
GS_CONTACT_WEB_APP_URL=https://script.google.com/macros/s/AKfycbyLGTKzQBMmuIOSwTjRcP73_eCsmKpQW2da5ILkoqFH7V-EFCle9SQBgB6YzuzeXVCYBA/exec

GS_WAITLIST_WEB_APP_URL=https://script.google.com/macros/s/AKfycbywj4XiflD7Zs0QGyjUeCUsIG3oTX20VY6gpL3xFjzOCBFo9BuZ1eHdWFqBplPE051T/exec

GS_ADDONS_WEB_APP_URL=https://script.google.com/macros/s/AKfycbx_EDJds3agTzNiNq-AxQHaV1JXlDx5KJrMMGZ9ZdRH-26_FAaRZBkWHKZmYyRHCsbM6w/exec

GS_PROJECT_WEB_APP_URL=https://script.google.com/macros/s/AKfycby9EOSUZhXCxXfEzB66BCcBe-dAb4ktjzUK8gLFCD5TfhIPL39mQlyO1BBjPblHmUgR/exec

NEXT_PUBLIC_SITE_URL=https://zeroslash.in

NEXT_PUBLIC_GA_MEASUREMENT_ID=G-5WHBQG0GVE
```

---

## 🎯 Current Status

- ✅ Removed hardcoded API URLs from code (security fix)
- ✅ Code will fail gracefully if env vars missing
- ⏳ Waiting for you to add environment variables in Vercel
- ⏳ Waiting for redeployment after adding variables

**After you complete Steps 1-3 above, everything will work perfectly!**

---

## Need Help?

Screenshot your Vercel environment variables page and share it - I can help verify!
