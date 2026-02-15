# Project Organization Guide

**Date:** February 6, 2026  
**Status:** ✅ Complete

## Overview

This document explains the organizational structure of the HarvestHub project, including recent cleanup and reorganization efforts.

## Project Structure

```
Farm/
├── .git/                      Git repository
├── .gitignore                 Git ignore rules
├── README.md                  Main project documentation
│
├── backend/                   Backend API (Node.js/Express)
│   ├── models/               MongoDB Mongoose models (15 files)
│   ├── routes/               API route handlers
│   ├── middleware/           Authentication & validation
│   ├── services/             Business logic services
│   ├── uploads/              Crop images storage
│   ├── server.js             Main server entry point
│   ├── package.json          Backend dependencies
│   └── *.md                  Backend documentation
│
├── Buyers/                    Buyer Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── components/       React components (8 files)
│   │   │   ├── Layout.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NearbyFarmers.tsx
│   │   │   ├── FarmerDetail.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── Transaction.tsx
│   │   │   └── Transport.tsx
│   │   └── services/         API services
│   ├── vite.config.ts        Vite configuration (Port 3001)
│   └── package.json
│
├── Farmer/                    Farmer Dashboard (React + Vite)
│   ├── src/
│   │   └── app/
│   │       └── components/   React components
│   ├── vite.config.js        Vite configuration (Port 5173)
│   └── package.json
│
├── Landing/                   Landing Page (Port 3000)
│   └── public/               Static assets
│
├── esp32-storage/             ESP32 IoT Monitoring
│   ├── src/
│   │   └── main.cpp          ESP32 firmware
│   ├── platformio.ini        PlatformIO config
│   ├── README.md
│   ├── WIRING_GUIDE.md
│   └── QUICK_REFERENCE.md
│
├── docs/                      📚 Documentation Hub (32 files)
│   ├── AI_CHATBOT_SETUP.md
│   ├── BACKEND_STATUS_REPORT.md
│   ├── BUYER_DASHBOARD_COMPLETE_REPORT.md
│   ├── BUYER_REQUEST_*.md (7 files)
│   ├── ESP32_*.md (3 files)
│   ├── MESSAGING_*.md (2 files)
│   ├── OLLAMA_*.md (4 files)
│   ├── PRICE_GRAPH_*.md (Multiple files)
│   ├── QUICK_START_*.md (4 files)
│   ├── TRANSPORT_*.md (Multiple files)
│   └── ... (All .md documentation files)
│
└── scripts/                   🔧 Automation Scripts (5 files)
    ├── setup-price-graph.bat
    ├── setup-price-graph.sh
    ├── start-price-graph.bat
    ├── verify-price-graph.ps1
    └── verify-price-graph.sh
```

## Recent Changes (Feb 6, 2026)

### What Changed

**Before:**
- 39 files cluttering the root directory
- 32 markdown documentation files scattered
- 5 script files mixed with source code
- Difficult navigation and maintenance

**After:**
- Clean root directory (7 essential items)
- All docs centralized in `docs/` folder
- All scripts centralized in `scripts/` folder
- Improved project maintainability

### Files Organized

**Documentation (32 files moved to `docs/`):**
- AI and chatbot guides
- Backend status reports
- Buyer request documentation
- Database setup guides
- ESP32 integration guides
- Messaging implementation docs
- Ollama integration reports
- Price graph documentation
- Transport module guides
- Quick start guides
- Verification reports

**Scripts (5 files moved to `scripts/`):**
- `setup-price-graph.bat` - Windows batch setup
- `setup-price-graph.sh` - Unix shell setup
- `start-price-graph.bat` - Quick start script
- `verify-price-graph.ps1` - PowerShell verification
- `verify-price-graph.sh` - Shell verification

**Files Kept in Root:**
- `README.md` - Main project documentation
- `.gitignore` - Git ignore rules

## Folder Purposes

### `/backend`
**Purpose:** Backend API server  
**Technology:** Node.js, Express, MongoDB  
**Port:** 5000  
**Key Files:**
- `server.js` - Main entry point
- `models/` - 15 MongoDB models
- `routes/` - API endpoints
- `API_DOCUMENTATION.md` - Complete API reference

### `/Buyers`
**Purpose:** Buyer dashboard interface  
**Technology:** React, TypeScript, Vite, Tailwind CSS  
**Port:** 3001  
**Features:**
- Modern gradient UI design
- Crop discovery and purchasing
- AI chatbot assistant (Gemini)
- Real-time messaging
- Market insights (TradingEconomics)
- Transaction history

### `/Farmer`
**Purpose:** Farmer dashboard interface  
**Technology:** React, Vite, Tailwind CSS  
**Port:** 5173  
**Features:**
- Crop management with AI grading
- Storage monitoring (ESP32)
- Request management
- Messaging with buyers
- Analytics and earnings tracking

### `/Landing`
**Purpose:** Landing page with authentication  
**Technology:** React, Vite  
**Port:** 3000  
**Features:**
- User registration
- Login system
- Role selection (Farmer/Buyer)

### `/esp32-storage`
**Purpose:** IoT storage monitoring firmware  
**Technology:** ESP32, PlatformIO, DHT22 sensors  
**Features:**
- Real-time temperature/humidity monitoring
- Automatic alerts
- Web interface integration

### `/docs`
**Purpose:** Centralized documentation repository  
**Contents:** 32 markdown files covering:
- Setup guides (AI, ESP32, Database, Messaging)
- Implementation guides (Buyer Request, Transport)
- Quick start references
- Status reports and verification docs
- Complete feature documentation

### `/scripts`
**Purpose:** Automation and utility scripts  
**Contents:** 5 scripts for:
- Feature setup (price graph, TradingEconomics)
- Quick start automation
- System verification
- Health checks

## Navigation Tips

### Finding Documentation
1. **Feature Setup:** Look in `docs/QUICK_START_*.md`
2. **API Reference:** See `backend/API_DOCUMENTATION.md`
3. **Implementation Details:** Check `docs/*_IMPLEMENTATION.md`
4. **Status Reports:** Find in `docs/*_REPORT.md`

### Running Automation
1. **Setup Scripts:** Run from `scripts/setup-*.bat` or `.sh`
2. **Start Services:** Use `scripts/start-*.bat`
3. **Verification:** Execute `scripts/verify-*.ps1` or `.sh`

### Component Development
1. **Buyer Components:** `Buyers/src/components/`
2. **Farmer Components:** `Farmer/src/app/components/`
3. **Backend Models:** `backend/models/`
4. **API Routes:** `backend/routes/`

## Benefits of Organization

### Improved Maintainability
- ✅ Clear separation of concerns
- ✅ Logical folder structure
- ✅ Easy to find specific files
- ✅ Reduced cognitive load

### Better Onboarding
- ✅ New developers can navigate easily
- ✅ Documentation centralized in one place
- ✅ Scripts grouped for quick access
- ✅ README provides clear overview

### Enhanced Development
- ✅ Cleaner root directory
- ✅ No confusion between docs and code
- ✅ Scripts easily discoverable
- ✅ Source folders clearly defined

## Service Ports Reference

| Service | Port | Location | Status |
|---------|------|----------|--------|
| MongoDB | 27017 | Local | ✅ Running |
| Backend | 5000 | /backend | ✅ Running |
| Landing | 3000 | /Landing | ⚠️ Optional |
| Buyer | 3001 | /Buyers | ✅ Running |
| Farmer | 5173 | /Farmer | ✅ Running |

## Development Workflow

### 1. Starting Services
```powershell
# Terminal 1: Start MongoDB
Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Minimized

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Buyer Dashboard
cd Buyers
npm run dev

# Terminal 4: Start Farmer Dashboard
cd Farmer
npm run dev
```

### 2. Accessing Documentation
- Main docs: `/docs` folder
- Backend docs: `/backend/*.md`
- ESP32 docs: `/esp32-storage/*.md`
- Quick reference: `/docs/QUICK_START_*.md`

### 3. Using Scripts
```bash
# Windows
scripts\setup-price-graph.bat
scripts\start-price-graph.bat

# Unix/Linux/Mac
bash scripts/setup-price-graph.sh
bash scripts/verify-price-graph.sh
```

## File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| Root | 2 | Essential (README, .gitignore) |
| backend/ | 25+ | API server code |
| Buyers/src/ | 15+ | Buyer dashboard |
| Farmer/src/ | 20+ | Farmer dashboard |
| Landing/ | 10+ | Landing page |
| esp32-storage/ | 5+ | IoT firmware |
| docs/ | 32 | Documentation |
| scripts/ | 5 | Automation |

**Total Project:** 100+ files organized across 8 main directories

## Future Organization

### Recommended Additions
1. `/tests` - Unit and integration tests
2. `/docs/api` - API endpoint documentation
3. `/docs/architecture` - System architecture diagrams
4. `/scripts/deployment` - Production deployment scripts
5. `/config` - Configuration files

### Maintenance Tips
- Keep docs/ folder organized by feature
- Update README.md when adding new services
- Document all new scripts in scripts/ folder
- Maintain consistent naming conventions
- Archive old documentation to `/docs/archive`

## Related Documents

- [README.md](../README.md) - Main project documentation
- [BUYER_DASHBOARD_COMPLETE_REPORT.md](BUYER_DASHBOARD_COMPLETE_REPORT.md) - Buyer UI details
- [BACKEND_STATUS_REPORT.md](BACKEND_STATUS_REPORT.md) - Backend status
- [MESSAGING_IMPLEMENTATION_SUMMARY.md](MESSAGING_IMPLEMENTATION_SUMMARY.md) - Messaging feature
- [ESP32_WEB_INTEGRATION.md](ESP32_WEB_INTEGRATION.md) - IoT integration

---

*This organization was completed on February 6, 2026 to improve project maintainability and developer experience.*
