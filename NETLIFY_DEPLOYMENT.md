# Netlify Deployment Guide

This guide will help you deploy your React application to Netlify with optimal performance and security settings.

## 🚀 Quick Deployment

### Option 1: Git-based Deployment (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`

### Option 2: Manual Deployment
```bash
# Build the project
npm run build:optimized

# Deploy to Netlify
npm run netlify:deploy:prod
```

## ⚙️ Environment Variables

Add these environment variables in your Netlify dashboard under **Site settings > Environment variables**:

### Required Variables
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### Optional Variables
```
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
REACT_APP_API_BASE_URL=https://your-domain.netlify.app
REACT_APP_ENV=production
```

## 🔧 Build Settings

The following build settings are configured in `netlify.toml`:

- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Node Version**: 18
- **NPM Version**: 9

## 🛡️ Security Features

### Headers Configured
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **X-Content-Type-Options**: nosniff
- **Strict-Transport-Security**: max-age=31536000; includeSubDomains; preload
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: camera=(), microphone=(), geolocation=()

### CORS Configuration
- API endpoints have proper CORS headers
- Edge functions handle cross-origin requests

## ⚡ Performance Optimizations

### Caching Strategy
- **Static Assets**: 1 year cache with immutable flag
- **HTML Files**: No cache (always fresh)
- **Images/Fonts**: 1 year cache

### Build Optimizations
- Source maps disabled in production
- Bundle size analysis
- Image optimization recommendations

## 🔄 Redirects & Rewrites

### SPA Routing
All routes are redirected to `index.html` for client-side routing.

### API Routes
API calls to `/api/*` are proxied to Netlify Functions.

## 📊 Monitoring & Analytics

### Performance Monitoring
- Build size analysis
- Performance recommendations
- Bundle optimization suggestions

### Firebase Analytics
Configured for production tracking with proper measurement ID.

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Firebase Authentication Issues**
   - Verify domain is authorized in Firebase Console
   - Check environment variables are set correctly
   - Ensure Firebase project is properly configured

3. **Performance Issues**
   - Run `npm run optimize` to analyze build
   - Check for large images or assets
   - Consider code splitting for large bundles

### Debug Commands
```bash
# Analyze build performance
npm run optimize

# Preview production build locally
npm run preview

# Check build size
npm run build:analyze
```

## 📈 Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimization Checklist
- [ ] Images optimized (WebP format preferred)
- [ ] Bundle size < 5MB
- [ ] No source maps in production
- [ ] Proper caching headers
- [ ] CDN enabled
- [ ] Gzip compression enabled

## 🔐 Security Checklist

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Firebase rules properly set
- [ ] Environment variables secured
- [ ] No sensitive data in client code
- [ ] CORS properly configured

## 📞 Support

For deployment issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally with `npm run preview`
4. Check Firebase Console for auth issues

## 🎯 Next Steps

After successful deployment:
1. Set up custom domain
2. Configure SSL certificate
3. Set up monitoring and alerts
4. Configure backup strategies
5. Set up CI/CD pipeline
