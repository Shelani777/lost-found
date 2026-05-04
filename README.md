# Lost & Found App

A complete full-stack React Native application for university/campus lost and found management.

**Repository:** [https://github.com/Shelani777/lost-found.git](https://github.com/Shelani777/lost-found.git)
**Backend URL:** [https://lost-found-production-ad14.up.railway.app](https://lost-found-production-ad14.up.railway.app)

## Group Members & Modules

- **Member 1:** IT24101598 – Marikkar F.M.M.A – Claim Request
- **Member 2:** IT24100982 – Agaash N – Found Item
- **Member 3:** IT24101276 – Thubakaran T – Announcement
- **Member 4:** IT24102222 – Illankoon I.M.C.P – Category
- **Member 5:** IT24102472 – Harinie S – Lost Item
- **Member 6:** IT24101020 – De Silva T.H.S.M – Report / Complaint

## Project Structure

This repository contains two main folders:

1. `frontend/` - React Native (Expo) mobile application
2. `backend/` - Node.js/Express MERN stack backend API

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

## 1. Backend Setup

The backend handles the API, authentication, and database connections.

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file based on the .env.example
# The essential variables are MONGO_URI, JWT_SECRET, and API_PORT

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:4000`.

## 2. Frontend Setup

The frontend is a React Native app built with Expo and Expo Router.

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the Expo development server
npm run start
# OR
npx expo start --clear
```

### Running on a Device
1. Install the "Expo Go" app from the App Store or Google Play Store.
2. Make sure your phone and computer are on the same Wi-Fi network.
3. Scan the QR code shown in the terminal using:
   - iOS: The default Camera app
   - Android: The Expo Go app directly

### Important Note on API URLs
If you are running the backend locally, the frontend needs to connect to your computer's IP address.
In the frontend's `.env` file, change the `EXPO_PUBLIC_API_URL` to your local IP:
`EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP_ADDRESS>:4000`

## Features Included

- Complete User Authentication (Login / Register)
- Post Lost Items or Found Items with Images
- Browse Items with Status Tracking (Open, Claimed, Closed)
- Make Claims on Found Items
- System Admin Dashboard
- Report inappropriate posts
- Dark/Light Theme Support
- Real-time Status updates

## Technology Stack

- **Frontend:** React Native, Expo, React Navigation (Expo Router), Expo Image
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Security:** JWT (JSON Web Tokens), bcryptjs
