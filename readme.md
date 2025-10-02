Here’s complete `README.md` file with everything in one place—installation, technologies, structure, and how to run both frontend and backend:

---

![gif](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3docnlnYzE1YXo3bjFxbjEydWQ3Y2x4c3l2YzNwdTJtaGY1bmExbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEdv44BQhHojnGY7u/giphy.gif)

# 🌱 EcoScan - Smart Product Scanner App

A cross-platform mobile app built with **Expo Router** for intelligent product scanning and environmental impact tracking. Features barcode scanning, product details, user profiles, and gamified recycling points system.

---

## 🧰 Technologies Used

- **Frontend**: Expo Router, React Native, TypeScript
- **Styling**: React Native StyleSheet with LinearGradient
- **Navigation**: File-based routing with Expo Router
- **Icons**: Expo Vector Icons (@expo/vector-icons)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (local)
- **API Communication**: RESTful endpoints

## 📁 Project Architecture

```bash
ecoscan/
├── frontend/ # Expo + React Native App
│ ├── app/ # 🔥 EXPO ROUTER - All app logic here
│ │ ├── (tabs)/ # Tab navigation group
│ │ │ ├── \_layout.tsx # Tab bar configuration
│ │ │ ├── index.tsx # Home screen (MainMenu)
│ │ │ └── explore.tsx # Statistics/History screen
│ │ ├── contexts/ # Global state management
│ │ │ └── app-context.tsx # App-wide context (user, products, etc.)
│ │ ├── types/ # TypeScript interfaces
│ │ │ └── index.ts # Product, UserProfile interfaces
│ │ ├── \_layout.tsx # Root layout with providers
│ │ ├── greeting.tsx # Welcome/onboarding screen
│ │ ├── scan.tsx # Product scanner screen
│ │ ├── product.tsx # Product details screen
│ │ ├── success.tsx # Scan success confirmation
│ │ └── user-profile.tsx # User profile management
│ ├── components/ # Reusable UI components
│ │ ├── ui/ # Basic UI elements
│ │ ├── greeting-screen.tsx # Welcome screen component
│ │ ├── main-menu.tsx # Home dashboard component
│ │ ├── scan-screen.tsx # Scanner UI component
│ │ ├── product-details.tsx # Product info component
│ │ ├── statistics-screen.tsx # History/stats component
│ │ ├── success-screen.tsx # Success feedback component
│ │ └── user-profile.tsx # Profile management component
│ ├── constants/ # App constants and themes
│ ├── hooks/ # Custom React hooks
│ └── assets/ # Images, icons, fonts
└── backend/ # Node.js + Express + SQLite
├── server.js # Main server file
├── package.json
└── data.db # SQLite database
```

---

## 🏗 Frontend Architecture Guidelines

### **🔥 Expo Router File-Based Navigation**

This app uses Expo Router's file-based routing system. The `app/` directory structure directly maps to your app's navigation.

### **📍 Where to Add New Features:**

#### **1. New Screens/Pages**

```bash
# Add new route screens in app/
app/
├── your-new-screen.tsx          # Creates /your-new-screen route
├── (group)/                     # Route groups for organization
│   └── grouped-screen.tsx       # Creates /(group)/grouped-screen route
```

#### **2. New Components**

```bash
# Add reusable components in components/
components/
├── your-component.tsx           # Reusable UI component
├── ui/                          # Basic UI elements (buttons, inputs)
│   └── your-ui-component.tsx
```

#### **3. New Types**

```bash
# Add TypeScript interfaces in app/types/
app/types/
└── index.ts                     # Add interfaces here
```

#### **4. Global State**

```bash
# Extend context in app/contexts/
app/contexts/
└── app-context.tsx              # Add new state/actions here
```

### **🧭 Navigation Patterns**

```tsx
// Navigation examples
import { router } from "expo-router";

// Navigate to screens
router.push("/scan"); // Go to scan screen
router.push("/(tabs)/explore"); // Go to explore tab
router.back(); // Go back
```

### **📱 Component Communication**

```tsx
// Use context for global state
import { useAppContext } from "../contexts/app-context";

function YourComponent() {
  const { userProfile, scannedProducts, addScannedProduct } = useAppContext();
  // Your component logic
}
```

### **🎨 Styling Guidelines**

- Use React Native StyleSheet for component styling
- Use LinearGradient for enhanced visual effects
- Follow existing color scheme and design patterns
- Keep components responsive with Dimensions API

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Project

### Start the backend server

```bash
cd backend
node server.js
```

> Server runs at `http://localhost:3000`

### Start the Expo frontend

```bash
cd ../frontend
npx expo start
```

> Use Expo Go app or emulator to preview

---

## 🔗 Connecting Frontend to Backend

In your frontend code, replace `localhost` with your local IP:

```js
fetch("http://192.168.x.x:3000/items");
```

> Ensure both devices are on the same Wi-Fi and CORS is enabled in backend.

---

## 🧪 Testing

- Add items via POST `/items`
- Retrieve items via GET `/items`
- View results in Expo app styled with Tailwind classes

---

## � App Flow & Features

### **Core User Journey:**

1. **Welcome Screen** → Onboarding experience
2. **Main Menu** → Dashboard with user stats and quick actions
3. **Scanner** → Barcode/product scanning functionality
4. **Product Details** → Environmental impact & recycling info
5. **Success Screen** → Points awarded confirmation
6. **Statistics** → Scan history and user progress
7. **Profile** → User account and achievements

### **Key Features:**

- 📱 **Product Scanning**: Mock barcode scanning with product database
- 🏆 **Gamification**: Points system and user levels
- 📊 **Statistics**: Track scanning history and environmental impact
- ♻️ **Recycling Guidance**: Product-specific disposal instructions
- 👤 **User Profiles**: Personalized experience with achievements

---

## 🛠 Backend API Endpoints

The backend provides RESTful endpoints for the scanner app:

```bash
# Example endpoints (implement as needed)
GET    /api/products/:barcode    # Get product info by barcode
POST   /api/scans               # Log a new scan
GET    /api/users/:id/profile   # Get user profile
PUT    /api/users/:id/profile   # Update user profile
GET    /api/users/:id/history   # Get scan history
```

---

## 🚀 Development Tips

### **Adding New Screens:**

1. Create a new `.tsx` file in `app/` directory
2. Add route configuration in `app/_layout.tsx` if needed
3. Create corresponding component in `components/` if complex
4. Update navigation in existing screens

### **State Management:**

- Use `app/contexts/app-context.tsx` for global state
- Local state with `useState` for component-specific data
- Extend context interface in `app/types/index.ts`

### **Best Practices:**

- Follow TypeScript strict mode
- Use relative imports within `app/` directory
- Keep components small and focused
- Implement proper error handling
- Test navigation flows thoroughly

---

## 📌 Notes

- **Expo Router**: File-based routing system - file structure = navigation structure
- **TypeScript**: Fully typed for better development experience
- **Context API**: Global state management without external libraries
- **Mock Data**: Scanner currently uses mock product data (replace with real API)
- **Cross-Platform**: Runs on iOS, Android, and Web
