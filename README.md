# Online Notepad 📝

A modern, feature-rich online notepad application built with React, TypeScript, and Tailwind CSS. Write, manage photos, customize fonts, and share your notes with anyone!

## ✨ Features

### 📝 Note Management
- Create and edit multiple notepads
- Auto-save functionality
- Public/Private visibility toggle
- Share notes with unique codes
- Full-featured text editor

### 📸 Photo Integration
- Upload multiple photos to your notepads
- View photos in fullscreen lightbox
- Download photos locally
- Responsive photo gallery
- Instant photo preview

### 🎨 Customization
- 3 Font families: Mono, Sans, Serif
- 5 Font sizes: XS to XL
- Clean, modern UI with Tailwind CSS
- Responsive design for all devices
- Dark mode ready

### 🔐 Privacy & Sharing
- Guest view for public notepads
- Private notes for registered users
- Share codes for easy sharing
- No backend required - localStorage persistence
- Data stays on your device

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📦 Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icons
- **localStorage API** - Client-side persistence

## 🌐 Deployment

Deploy to Vercel, Netlify, or GitHub Pages in minutes!

### Quick Deploy to Vercel
```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push

# 2. Go to vercel.com → Import Project → Select your repo
# 3. Done! Your app is live
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📱 Features by User Type

### Guest Users (No Login)
- ✅ View public notepads
- ✅ View attached photos in fullscreen
- ✅ Read notes with original formatting
- ❌ Cannot edit notes
- ❌ Cannot upload photos

### Logged-in Users
- ✅ Create unlimited notepads
- ✅ Edit and delete notes
- ✅ Upload multiple photos
- ✅ Download and delete photos
- ✅ Customize fonts and sizes
- ✅ Toggle privacy settings
- ✅ Share with unique codes

## 📂 Project Structure

```
Online-Notepad/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Header.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotepadEditor.jsx
│   │   └── Signup.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 Future Enhancements

- [ ] Cloud sync with Firebase/Supabase
- [ ] Real-time collaboration
- [ ] Markdown support
- [ ] Code syntax highlighting
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] AI-powered note organization
- [ ] Voice notes
- [ ] Note templates

## 📝 License

MIT - Feel free to use and modify

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 💬 Support

Have questions? Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or create an issue.

---

**Live Demo**: [Deploy to Vercel](https://vercel.com/new)

Made with ❤️ by Your Name
