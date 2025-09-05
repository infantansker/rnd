# 🚀 Deployment Guide

## 📋 **Quick Setup**

### **1. Create Netlify Account**
- Go to [netlify.com](https://netlify.com)
- Sign up with GitHub
- Connect your `TechVaseegrahHub/Run-Development` repository

### **2. Deploy Your Site**
- Click "New site from Git"
- Select GitHub → `TechVaseegrahHub/Run-Development`
- Click "Deploy site"

### **3. Configure Environment Variables**
Add these in Netlify dashboard → Site settings → Environment variables:

```
NODE_VERSION=18
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

**Firebase Variables (optional):**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyAc0WzUsgae17Zyo4dN3WfuBIvgpVBrTQA
REACT_APP_FIREBASE_AUTH_DOMAIN=techvaseegrah-runanddevelop.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=techvaseegrah-runanddevelop
REACT_APP_FIREBASE_STORAGE_BUCKET=techvaseegrah-runanddevelop.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=876140121414
REACT_APP_FIREBASE_APP_ID=1:876140121414:web:4bc391bcb17cbe35c32947
REACT_APP_FIREBASE_MEASUREMENT_ID=G-GZJS335Y7G
```

## 🔧 **Build Settings**
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Node version**: 18

## 🎯 **Result**
Your site will be available at: `https://your-site-name.netlify.app`

## 🆘 **Troubleshooting**
- Check build logs in Netlify dashboard
- Verify environment variables are set
- Ensure Firebase domain is authorized

---

**Your React app is optimized and ready for deployment!** 🎉
