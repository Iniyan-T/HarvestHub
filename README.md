# 🌾 HarvestHub - Smart Agricultural Marketplace

## Overview
HarvestHub is an intelligent agricultural marketplace platform connecting farmers and buyers with AI-powered crop grading, IoT storage monitoring, and real-time communication.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22.13.1+ 
- MongoDB 8.2+ (Local installation at `C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe`)
- Python 3.10+ (for YOLOv5)
- Ollama (optional, for local AI chatbot)

### 0. Start MongoDB
```powershell
# Create data directory if it doesn't exist
New-Item -Path "C:\data\db" -ItemType Directory -Force

# Start MongoDB
Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Minimized
```

**MongoDB runs on:** `mongodb://localhost:27017`

### 1. Start Backend Server
```bash
cd Farm/backend
npm install
npm start
```
**Backend runs on:** `http://localhost:5000`

### 2. Start Landing Page
```bash
cd Farm/Landing
npm install
npm run dev
```
**Landing runs on:** `http://localhost:3000`

### 3. Start Farmer Dashboard
```bash
cd Farm/Farmer
npm install
npm run dev
```
**Farmer dashboard:** `http://localhost:5173`

### 4. Start Buyer Dashboard
```bash
cd Farm/Buyers
npm install
npm run dev
```
**Buyer dashboard:** `http://localhost:3001`

---

## 🏗️ Project Structure

```
Farm/
├── backend/           Backend API (Node.js/Express/MongoDB)
│   ├── models/       MongoDB Mongoose models
│   ├── routes/       API route handlers
│   ├── middleware/   Auth & validation
│   └── uploads/      Crop images storage
├── Landing/           Landing page with auth (React)
├── Farmer/            Farmer dashboard (React)
├── Buyers/            Buyer dashboard (React + TypeScript)
│   └── src/
│       ├── components/  React components
│       └── services/    API services
├── esp32-storage/     ESP32 IoT monitoring code
├── docs/              📚 Documentation (32 files)
│   ├── AI_CHATBOT_SETUP.md
│   ├── BUYER_REQUEST_IMPLEMENTATION.md
│   ├── ESP32_WEB_INTEGRATION.md
│   ├── MESSAGING_IMPLEMENTATION_SUMMARY.md
│   └── ... (28 more docs)
└── scripts/           🔧 Automation scripts (5 files)
    ├── setup-price-graph.bat/sh
    ├── start-price-graph.bat
    └── verify-price-graph.ps1/sh
```

---

## ✨ Key Features

### 🤖 AI Crop Grading
- **YOLOv5 Classification Model**
- Automatic Grade A/B/C classification
- 86.7% accuracy (current model)
- Local inference (no API costs)
- Confidence scores and quality metrics

### 🔐 Authentication System
- JWT-based authentication
- Role-based access control (Farmer, Buyer, Admin)
- Unique user IDs for all features
- Secure password hashing (bcrypt)

### 📊 Smart Storage Monitoring
- ESP32-based IoT sensors
- Real-time temperature/humidity tracking
- Automated alerts for critical conditions
- Historical data analytics

### 💬 Real-Time Messaging
- Direct farmer-buyer communication
- Conversation threads
- Order-related discussions

### 🤖 AI Chatbot Assistant
- Agricultural domain expertise
- Local LLM (Ollama/Llama 3.2)
- Fallback to Gemini API
- Context-aware responses

### 📦 Marketplace Features
- Search/filter by grade, location, price
- Bulk ordering
- Quality assurance
- Transaction management

---

## 🎯 Usage Flow

### For Farmers:
1. **Register** → Create farmer account on landing page
2. **Login** → Access farmer dashboard (port 5174)
3. **Upload Crops** → Take photo, AI grades automatically
4. **Monitor Storage** → View ESP32 sensor data
5. **Respond to Requests** → Accept/negotiate with buyers
6. **Track Sales** → Analytics and transaction history

### For Buyers:
1. **Register** → Create buyer account on landing page
2. **Login** → Access buyer dashboard (port 3001)
3. **Browse Crops** → Filter by grade, location, price
4. **Send Requests** → Request specific crops from farmers
5. **Message Farmers** → Direct communication
6. **Place Orders** → Bulk ordering with delivery tracking

---

## 📚 Documentation

> **Note:** All documentation files are now organized in the `/docs` folder.

### Quick Starts
- [AI Chatbot Setup](docs/AI_CHATBOT_SETUP.md)
- [Buyer Request Quick Start](docs/QUICK_START_BUYER_REQUEST.md)
- [ESP32 Quick Start](docs/QUICK_START_ESP32.md)
- [Messaging Quick Start](docs/QUICK_START_MESSAGING.md)

### Implementation Guides
- [Buyer Request Implementation](docs/BUYER_REQUEST_IMPLEMENTATION.md)
- [Farmer Request View Guide](docs/FARMER_REQUEST_VIEW_GUIDE.md)
- [ESP32 Web Integration](docs/ESP32_WEB_INTEGRATION.md)

### Complete Reports
- [Buyer Dashboard Complete Report](docs/BUYER_DASHBOARD_COMPLETE_REPORT.md)
- [Buyer Request Complete Summary](docs/BUYER_REQUEST_COMPLETE_SUMMARY.md)
- [Messaging Implementation Summary](docs/MESSAGING_IMPLEMENTATION_SUMMARY.md)

### Backend Documentation
- [API Documentation](backend/API_DOCUMENTATION.md)
- [Database Architecture](backend/DATABASE_ARCHITECTURE.md)
- [Messaging Guide](backend/MESSAGING_GUIDE.md)
- [Setup Instructions](backend/SETUP_INSTRUCTIONS.md)

### Recent Updates
- [Project Cleanup Summary](PROJECT_CLEANUP_SUMMARY.md) - Feb 6, 2026

---

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# YOLOv5 Model
YOLO_MODEL_PATH=C:\Users\iniya\yolov5\runs\train-cls\exp4_improved2\weights\best.pt
YOLO_PYTHON_PATH=C:\Users\iniya\yolo_env\Scripts\python.exe

# Ollama (optional)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Gemini API (fallback)
GEMINI_CHAT_API_KEY=your_gemini_key
```

---

## 🚦 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Landing Page | 3000 | http://localhost:3000 |
| Buyer Dashboard | 3001 | http://localhost:3001 |
| Farmer Dashboard | 5173 | http://localhost:5173 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TypeScript (Buyers)
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)

### AI/ML
- YOLOv5 (crop classification)
- Ollama (local LLM)
- Google Gemini API (fallback)

### IoT
- ESP32 (Arduino framework)
- DHT22 sensors
- PlatformIO

---

## 🐛 Known Issues & Solutions

### Issue: Port Already in Use
**Solution:** Kill process using the port
```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | 
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Issue: MongoDB Connection Error
**Solution:** Check MONGODB_URI in .env file

### Issue: YOLOv5 Model Not Found
**Solution:** Update YOLO_MODEL_PATH in .env to correct model location

---

## 📈 Model Training Status

### Current Production Model
- **Name:** exp4_improved2
- **Architecture:** YOLOv5s
- **Accuracy:** 86.7% top-1
- **Epochs:** 100
- **Status:** ✅ Active in production

### Training in Progress
- **Name:** exp5_advanced
- **Architecture:** YOLOv5m (11.6M params)
- **Target Epochs:** 150
- **Current:** 24/150 epochs
- **Status:** ⏳ Background training

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

HarvestHub Development Team

---

## 📞 Support

For issues and questions:
- Check documentation in `/docs` folder (32 comprehensive guides)
- Run automation scripts in `/scripts` folder
- Review [Database Setup Guide](backend/DATABASE_SETUP_GUIDE.md)
- Check backend logs for API errors

### Automation Scripts
Located in `/scripts`:
- `setup-price-graph.bat/sh` - Setup price graph feature with TradingEconomics
- `start-price-graph.bat` - Quick start for price graph
- `verify-price-graph.ps1/sh` - Verify installation and connectivity

---

*Last Updated: February 6, 2026*
