# Lost & Found

  full-stack Lost & Found application for posting lost or found items, browsing categories, submitting claims, reporting posts, and managing announcements through an admin area.

The project is split into:

- `frontend/` - Expo React Native app using Expo Router
- `backend/` - Express API backed by MongoDB

## Features

- User registration and login with ID/NIC based accounts
- Lost and found item feeds
- Category based browsing and search
- Add, edit, like, comment on, and delete item posts
- Claim requests for found/lost items
- Report flow for suspicious or inappropriate posts
- Announcements section
- Admin screens for users, posts, reports, categories, claims, and announcements
- Local offline/demo storage through AsyncStorage when no API URL is configured
- Optional MongoDB API mode for persistent shared data

## Tech Stack

### Frontend

- Expo SDK 52
- React Native
- Expo Router
- TypeScript
- AsyncStorage
- React Query

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing

## Project Structure

```text
lost-found/
  backend/
    package.json
    server.js
  frontend/
    app/
    assets/
    components/
    constants/
    hooks/
    lib/
    server/
    package.json
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB connection string
- Expo Go or an Android/iOS emulator for mobile testing

## Backend Setup

From the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/lost-found
JWT_SECRET=change-this-secret
```

Start the API:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

When the backend starts, it creates a development admin account if one does not already exist:

```text
ID/NIC: IV6859070
Password: Admin@070
```

Change these credentials before using the app outside local development.

## Frontend Setup

From the frontend folder:

```bash
cd frontend
npm install
```

To run with the backend API, create a `.env` file in `frontend/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For a physical phone, replace `localhost` with your computer's LAN IP address, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000
```

Start Expo:

```bash
npm start
```

Other available frontend commands:

```bash
npm run android
npm run ios
npm run web
```

## Running Without the Backend

If `EXPO_PUBLIC_API_URL` is not set, the frontend falls back to local AsyncStorage. This is useful for demos and quick UI testing, but data stays on the device/browser where it was created.

## API Overview

Main backend routes:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`
- `GET /bootstrap`
- `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`
- `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`
- `POST /items/:id/like`
- `POST /items/:id/comment`
- `POST /claims`, `PATCH /claims/:id`, `DELETE /claims/:id`
- `POST /reports`, `PATCH /reports/:id`, `DELETE /reports/:id`
- `POST /announcements`, `PATCH /announcements/:id`, `DELETE /announcements/:id`

Authenticated routes require a JWT bearer token from login or registration.

## Build Notes

The frontend includes EAS configuration in `frontend/eas.json` for Android development, preview, and production builds.

The `frontend/server/` folder contains a small Node server for serving static Expo build output in deployment-style environments.

## Development Notes

- Frontend source lives mostly in `frontend/app`, `frontend/components`, and `frontend/lib`.
- Shared app data types and local storage helpers are in `frontend/lib/storage.ts`.
- API helpers are in `frontend/lib/api.ts`.
- The backend currently keeps all API models and routes in `backend/server.js`.
- No automated test scripts are currently defined in either package.

