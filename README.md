# Resilient Connect

An offline-first emergency reporting platform designed for disaster recovery and rural areas with unreliable internet connectivity.

## 🎯 Project Overview

**Resilient Connect** is a progressive web application (PWA) that enables users to submit emergency reports and disaster-related information even when internet connectivity is unavailable. All reports are stored locally and automatically synchronized with the backend server when the connection is restored.

### Key Features

- **Offline-First Architecture**: Full functionality without internet connection
- **Auto-Sync**: Automatic synchronization when connectivity is restored
- **Smart Prioritization**: Text-only reports sync first for faster delivery
- **Multi-Category Support**: Emergency, Food, Medical, and Shelter reports
- **Real-time Network Status**: Visual indicator of online/offline status
- **Persistent Storage**: IndexedDB-based local database (Dexie.js)
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 📋 Project Structure

```
App-That-Works-Offline/
├── App.tsx                 # Main application component with routing
├── db.ts                   # Dexie database configuration
├── types.ts                # TypeScript type definitions
├── index.tsx               # React DOM entry point
├── index.html              # HTML template
├── package.json            # Project dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── metadata.json           # App metadata
├── sw.js                   # Service Worker for PWA
├── components/
│   ├── NetworkIndicator.tsx    # Online/Offline status indicator
│   └── ReportCard.tsx          # Report card display component
└── services/
    ├── api.ts              # API service layer (mock backend)
    └── syncManager.ts      # Sync queue management logic
```

## 🛠 Tech Stack

- **Frontend Framework**: React 19.2.3 with TypeScript
- **Routing**: React Router DOM 7.12.0
- **Local Database**: Dexie 4.2.1 (IndexedDB wrapper)
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS
- **Development**: TypeScript 5.8.2

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd App-That-Works-Offline
```

2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000` with hot module replacement enabled.

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📱 Core Features

### 1. **Dashboard View**

- Displays all reports organized by sync status
- Shows pending reports awaiting synchronization
- Displays synced reports that have been uploaded
- Manual sync trigger button with status updates
- Real-time report count

### 2. **Report Creation**

- Four report categories: Emergency, Food, Medical, Shelter
- Required fields: Name, Location, Category, Description
- Optional image attachment
- Automatic timestamp capture
- Geolocation permission request for precise location data

### 3. **Offline Functionality**

- All reports stored in local IndexedDB
- Works completely without internet connection
- Auto-detects when connectivity is restored
- Automatic sync queue processing

### 4. **Sync Manager**

- Batch processing (5 reports per batch)
- Smart prioritization: text-only reports sync before image reports
- Chronological ordering within priority groups
- Progress tracking with user feedback
- Error handling and recovery

### 5. **Network Indicator**

- Real-time online/offline status display
- Visual feedback with color coding:
  - 🟢 Green: Online
  - 🔴 Red: Offline (with pulse animation)
- Fixed position at bottom-right corner

## 💾 Data Storage

### Database Schema

**reports table**:

```typescript
interface Report {
  id?: number; // Auto-incremented primary key
  serverId?: string; // Backend-assigned ID
  name: string; // Reporter name
  location: string; // Report location
  category: ReportCategory; // Emergency | Food | Medical | Shelter
  description: string; // Report details
  timestamp: number; // Creation time (milliseconds)
  status: "pending" | "synced"; // Sync status
  hasImage: boolean; // Whether report includes image
  error?: string; // Sync error message if any
}
```

Dexie indexes: `++id, status, category, timestamp, hasImage`

## 🔄 Sync Logic

1. **Detection**: App listens for `online` event
2. **Retrieval**: Gets all reports with `status: 'pending'`
3. **Sorting**: Sorts by priority (no images first), then by timestamp
4. **Processing**: Sends reports in batches of 5
5. **Updating**: Updates report status to 'synced' or records error
6. **Feedback**: Provides progress updates to user

## 🌐 API Integration

Currently uses a simulated backend (`api.ts`) with:

- 800ms network delay simulation
- 10% failure rate for robustness testing
- Mock report submission endpoint

For production, replace the mock API with real backend endpoints.

## 📝 Type Definitions

Located in `types.ts`:

```typescript
enum ReportCategory {
  EMERGENCY = "Emergency",
  FOOD = "Food",
  MEDICAL = "Medical",
  SHELTER = "Shelter",
}

interface Report {
  id?: number;
  serverId?: string;
  name: string;
  location: string;
  category: ReportCategory;
  description: string;
  timestamp: number;
  status: "pending" | "synced";
  hasImage: boolean;
  error?: string;
}

interface NetworkStatus {
  isOnline: boolean;
}
```

## 🔒 Permissions

The app requires the following permission (in `metadata.json`):

- **Geolocation**: For capturing precise location coordinates in emergency reports

## 🏗 Architecture Highlights

### Offline-First Pattern

- All data persists locally first
- Network operations are secondary
- No data loss if connectivity drops during sync

### Progressive Enhancement

- Core functionality works offline
- Sync features activate when online
- Graceful degradation if backend is unavailable

### Error Resilience

- Failed reports remain in queue
- Each report tracks its own error state
- Automatic retry on next sync attempt
- User-friendly error messages

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Feedback**: Live sync status and progress updates
- **Color-Coded Status**: Visual distinction between pending and synced reports
- **Interactive Elements**: Disabled state during offline/syncing
- **Accessibility**: Semantic HTML and ARIA labels

## 📦 Dependencies

### Production

- `react@^19.2.3` - UI library
- `react-router-dom@^7.12.0` - Client-side routing
- `react-dom@^19.2.3` - React DOM renderer
- `dexie@^4.2.1` - IndexedDB wrapper

### Development

- `typescript@~5.8.2` - Type safety
- `vite@^6.2.0` - Build tool
- `@vitejs/plugin-react@^5.0.0` - React plugin for Vite
- `@types/node@^22.14.0` - Node types

## 🚀 Future Enhancements

- Image compression before sync
- Conflict resolution for duplicate reports
- User authentication
- Report tracking with unique IDs
- Analytics and reporting dashboard
- Multi-language support
- Push notifications for sync updates

## 🐛 Troubleshooting

### Reports not syncing

- Check network connection (use Network Indicator)
- Verify browser allows IndexedDB
- Check browser console for error messages
- Try manual sync button in Dashboard

### Lost reports after page refresh

- Ensure IndexedDB is enabled
- Check browser storage quota
- Try clearing cache and reloading

### Service Worker issues

- Clear browser cache
- Rebuild with `npm run build`
- Check browser DevTools > Application > Service Workers

## 📄 License

This project is private. All rights reserved.

## 👤 Author

Created by the Resilient Connect Team

---

**Last Updated**: January 17, 2026
