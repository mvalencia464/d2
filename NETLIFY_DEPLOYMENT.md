# Netlify Deployment Guide for Direct2 Booking

## 🚨 IMPORTANT: Environment Variables Required

Your app is deployed at: **https://direct2booking.netlify.app/**

However, it's currently showing a **500 Server Configuration Error** because the environment variables are missing on Netlify.

## ✅ Fix the Error - Add Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard
1. Open: https://app.netlify.com
2. Select your site: **direct2booking**
3. Go to **Site settings** (or **Site configuration**)
4. Click on **Environment variables** in the left sidebar

### Step 2: Add These 3 Environment Variables

Click **Add a variable** and add each of these:

#### Variable 1: HighLevel Location ID
- **Key**: `NEXT_PUBLIC_HIGHLEVEL_LOCATION_ID`
- **Value**: `aewRs6OT3I7lUSwPF6ET`
- **Scopes**: All scopes (Production, Deploy Previews, Branch deploys)

#### Variable 2: HighLevel Access Token
- **Key**: `HIGHLEVEL_TOKEN`
- **Value**: `pit-55ddf0a8-5847-4786-a6af-9a93a30bf9ce`
- **Scopes**: All scopes (Production, Deploy Previews, Branch deploys)
- **⚠️ IMPORTANT**: This is a SECRET - do NOT share publicly

#### Variable 3: AirportDB API Token
- **Key**: `NEXT_PUBLIC_AIRPORTDB_API_TOKEN`
- **Value**: `99f52363e055e4f953d178d0ac2799e6ba95a62fe561644195d4c86abd08bf1379275da47ad054d5d7c853fd5562ab0d`
- **Scopes**: All scopes (Production, Deploy Previews, Branch deploys)

### Step 3: Redeploy Your Site

After adding the environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete (usually 1-2 minutes)
4. Visit https://direct2booking.netlify.app/ - it should work now! ✅

## 🔍 How to Verify It's Working

### Test 1: Check the Homepage
1. Go to https://direct2booking.netlify.app/
2. You should see the Direct2 booking widget
3. No errors in the browser console

### Test 2: Test the Booking Flow
1. Fill in the booking form:
   - Origin: KBDN (default)
   - Destination: KSEA
   - Select dates
   - Click "Search Flights"
2. Select an aircraft
3. Fill in contact details:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1 (555) 123-4567
4. Click "Request Flight"
5. You should see the confirmation screen
6. Check your HighLevel dashboard - a new contact should be created!

### Test 3: Check Browser Console
1. Open browser DevTools (F12 or right-click → Inspect)
2. Go to the **Console** tab
3. There should be NO errors
4. If you see errors, check that all 3 environment variables are set correctly

## 🔧 Troubleshooting

### Error: "Server configuration error"
**Cause**: Environment variables not set on Netlify
**Fix**: Follow Step 2 above to add all 3 environment variables, then redeploy

### Error: "Failed to create contact"
**Cause**: HighLevel API token is incorrect or expired
**Fix**: 
1. Check that `HIGHLEVEL_TOKEN` is set correctly
2. Verify the token is still valid in your HighLevel dashboard
3. Redeploy after fixing

### Error: "Airport not found"
**Cause**: AirportDB API token is incorrect
**Fix**: 
1. Check that `NEXT_PUBLIC_AIRPORTDB_API_TOKEN` is set correctly
2. Verify the token at https://airportdb.io
3. Redeploy after fixing

### Site shows old version after deploying
**Cause**: Browser cache
**Fix**: 
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or clear browser cache
3. Or open in incognito/private window

## 📊 Environment Variables Explained

### Why do we need these?

1. **NEXT_PUBLIC_HIGHLEVEL_LOCATION_ID**
   - Your HighLevel location/business ID
   - Used to associate contacts with your business
   - Prefix `NEXT_PUBLIC_` means it's accessible in the browser

2. **HIGHLEVEL_TOKEN**
   - Your private API access token
   - Used to authenticate with HighLevel API
   - NO `NEXT_PUBLIC_` prefix = server-side only (secure!)
   - Never exposed to the browser

3. **NEXT_PUBLIC_AIRPORTDB_API_TOKEN**
   - Your AirportDB API token
   - Used to fetch airport data
   - Prefix `NEXT_PUBLIC_` means it's accessible in the browser

### Security Notes

- ✅ `HIGHLEVEL_TOKEN` is server-side only (secure)
- ✅ Environment variables are NOT committed to GitHub
- ✅ `.env.local` is in `.gitignore`
- ⚠️ Never share your `HIGHLEVEL_TOKEN` publicly
- ⚠️ If token is compromised, regenerate it in HighLevel dashboard

## 🎯 Quick Copy-Paste for Netlify

If you prefer to copy-paste, here are the exact values:

```
NEXT_PUBLIC_HIGHLEVEL_LOCATION_ID=aewRs6OT3I7lUSwPF6ET
HIGHLEVEL_TOKEN=pit-55ddf0a8-5847-4786-a6af-9a93a30bf9ce
NEXT_PUBLIC_AIRPORTDB_API_TOKEN=99f52363e055e4f953d178d0ac2799e6ba95a62fe561644195d4c86abd08bf1379275da47ad054d5d7c853fd5562ab0d
```

## 📱 After Deployment

Once deployed successfully:

1. ✅ Your booking widget is live at https://direct2booking.netlify.app/
2. ✅ All bookings will create contacts in HighLevel
3. ✅ Airport search will work with real data
4. ✅ Automatic deployments on every GitHub push

## 🔄 Automatic Deployments

Netlify is connected to your GitHub repo, so:
- Every time you push to `main` branch
- Netlify automatically builds and deploys
- Usually takes 1-2 minutes
- You'll get an email notification when done

## 📝 Next Steps

After fixing the environment variables:

1. [ ] Add environment variables to Netlify
2. [ ] Redeploy the site
3. [ ] Test the booking flow
4. [ ] Verify contacts are created in HighLevel
5. [ ] Share the live URL with your team!

## 🆘 Need Help?

If you're still seeing errors after following this guide:

1. Check the Netlify deploy logs:
   - Go to **Deploys** tab
   - Click on the latest deploy
   - Check the **Deploy log** for errors

2. Check the browser console:
   - Open DevTools (F12)
   - Look for error messages
   - Share the error message for help

3. Verify environment variables:
   - Go to **Site settings** → **Environment variables**
   - Make sure all 3 variables are listed
   - Check for typos in the keys

---

**Your site will work perfectly once you add the environment variables and redeploy!** 🚀

