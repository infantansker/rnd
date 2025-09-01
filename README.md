# 🏃‍♂️ Run Development - Firebase Fitness App

A modern React fitness/running community app powered by **Firebase Firestore** for real-time data synchronization and seamless user experience.

## 🔥 **Firebase-Only Architecture**

This app uses a **pure Firebase architecture** with no backend server required:

- **Frontend**: React 18.3.1 with Firebase SDK
- **Database**: Firebase Firestore (NoSQL, real-time)
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting (recommended)
- **Storage**: Firebase Storage (for future features)

## ✨ **Features**

### 🏠 **Public Features**
- Hero section with fitness programs showcase
- Program & plan information
- User testimonials
- Contact form with EmailJS integration

### 🔐 **Authenticated User Features**
- **User Dashboard**: Personalized fitness metrics
- **Profile Management**: Complete user profile with running preferences
- **Achievement System**: Track fitness milestones and badges
- **Event Management**: Community run events and RSVPs
- **Real-time Statistics**: Running stats with live updates
- **Firebase Test Console**: Debug and monitor Firebase connectivity

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (free tier available)

### 1. Clone & Install
```bash
git clone https://github.com/TechVaseegrahHub/Run-Development.git
cd Run-Development
npm install
```

### 2. Firebase Setup
1. Create Firebase project at https://console.firebase.google.com/
2. Enable **Authentication** (Phone & Email providers)
3. Enable **Firestore Database** (start in test mode)
4. Copy your Firebase config to `src/firebase.js`

### 3. Configure Firestore Rules
Copy rules from `firestore.rules` to your Firebase Console → Firestore → Rules

### 4. Start Development
```bash
npm start
```

Your app will be available at `http://localhost:3000`

## 📱 **App Navigation**

### Public Routes
- `/` - Homepage with hero section
- `/events` - Public events listing
- `/login` - Authentication page

### Protected Routes (Requires Login)
- `/dashboard` - User dashboard with stats
- `/profile` - Complete user profile management
- `/user-events` - Personal event management
- `/firebase-test` - Firebase connectivity testing

## 🗄️ **Database Schema**

### Firestore Collections

#### `users/{userId}`
```javascript
{
  displayName: "John Doe",
  email: "john@example.com",
  phoneNumber: "+91XXXXXXXXXX",
  age: 25,
  location: "Thanjavur, Tamil Nadu",
  runningLevel: "Intermediate",
  goals: "Complete a 10K run",
  // ... other profile fields
}
```

#### `achievements/{userId}`
```javascript
{
  achievements: [
    {
      id: "early_bird",
      title: "Early Bird",
      description: "Attended 5 morning runs",
      earned: true,
      progress: 5,
      target: 5
    }
  ]
}
```

#### `userStatistics/{userId}`
```javascript
{
  totalRuns: 15,
  totalDistance: 75.5,
  currentStreak: 5,
  longestStreak: 12,
  lastRunDate: "2024-01-20"
}
```

#### `userEvents/{eventId}`
```javascript
{
  userId: "user_uid",
  eventName: "Weekly Community Run",
  eventDate: "2024-01-27",
  location: "C3 Cafe",
  rsvpStatus: "going"
}
```

## 🔐 **Security Features**

- **Firebase Auth**: Phone number & email verification
- **Firestore Rules**: User-specific data access control
- **Protected Routes**: Authentication-required pages
- **Real-time Validation**: Client-side form validation
- **Secure Configuration**: Environment-based config management

## 🛠️ **Development Scripts**

```bash
# Start development server
npm start

# Build for production  
npm run build

# Run tests
npm test

# Run Cypress E2E tests
npx cypress open
```

## 📦 **Key Dependencies**

### Core React
- `react` ^18.3.1 - Main React library
- `react-router-dom` ^7.8.0 - Client-side routing
- `react-icons` ^5.5.0 - Icon components

### Firebase
- `firebase` ^11.10.0 - Firebase SDK for web

### UI & Animation
- `framer-motion` ^10.0.1 - Animation library
- `react-scroll` ^1.8.7 - Smooth scrolling

### Communication
- `@emailjs/browser` ^3.6.2 - Email service integration

## 🌐 **Deployment Options**

### Option 1: Firebase Hosting (Recommended)
```bash
npm run build
firebase deploy
```

### Option 2: Netlify
```bash
npm run build
# Deploy build/ folder to Netlify
```

### Option 3: Vercel
```bash
npm run build  
# Connect GitHub repo to Vercel
```

## 📊 **Firebase Advantages**

| Feature | Firebase | Traditional Backend |
|---------|----------|-------------------|
| Setup Time | ⚡ Minutes | 🐌 Hours/Days |
| Scaling | 🔄 Automatic | 🔧 Manual |
| Real-time | ✅ Built-in | ❌ Custom coding |
| Offline Support | ✅ Automatic | ❌ Complex setup |
| Maintenance | 🆓 Zero | 💰 Ongoing costs |
| Security | 🔒 Built-in rules | 🛠️ Custom implementation |

## 🚨 **Troubleshooting**

### Common Issues

**Firebase Connection Failed**
```bash
# Check your firebase.js configuration
# Ensure Firestore is enabled in Firebase Console
# Verify API keys are correct
```

**Authentication Not Working**
```bash
# Enable Phone/Email providers in Firebase Console
# Check Firebase Auth settings
# Verify domain is authorized
```

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 **Support**

- **Documentation**: See `FIREBASE_SETUP.md` for detailed setup
- **Firebase Console**: https://console.firebase.google.com/
- **Issues**: Create GitHub issues for bug reports
- **Firebase Support**: https://firebase.google.com/support

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see LICENSE file for details.

---

**Built with ❤️ using React + Firebase**

🔗 **Live Demo**: [Coming Soon]  
🐙 **Repository**: https://github.com/TechVaseegrahHub/Run-Development

<!-- Trigger Netlify Build -->