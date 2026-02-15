# Contributing to HarvestHub

Thank you for your interest in contributing to HarvestHub! This document provides guidelines and best practices for contributing to the project.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites
- Node.js v22.13.1+
- MongoDB 8.2+
- Git
- Python 3.10+ (for AI features)
- Code editor (VS Code recommended)

### First Time Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HarvestHub.git
   cd HarvestHub/Farm
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/HarvestHub.git
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Buyer Dashboard
   cd ../Buyers
   npm install

   # Farmer Dashboard
   cd ../Farmer
   npm install
   ```

5. **Setup environment variables**
   ```bash
   # Create .env file in backend/
   cp backend/.env.example backend/.env
   # Edit with your configuration
   ```

6. **Start MongoDB**
   ```powershell
   Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Minimized
   ```

7. **Run all services**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start

   # Terminal 2: Buyer Dashboard
   cd Buyers && npm run dev

   # Terminal 3: Farmer Dashboard
   cd Farmer && npm run dev
   ```

## Development Setup

### Recommended VS Code Extensions
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **ES7+ React/Redux/React-Native snippets** - React snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **MongoDB for VS Code** - Database management
- **GitLens** - Git visualization

### Environment Configuration

**backend/.env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/harvestHub
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# YOLOv5
YOLO_MODEL_PATH=path/to/yolov5/model/best.pt
YOLO_PYTHON_PATH=path/to/python.exe

# Gemini AI
GEMINI_CHAT_API_KEY=your-gemini-api-key

# Ollama (optional)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Project Structure

```
Farm/
├── backend/          # Node.js/Express API
├── Buyers/           # Buyer Dashboard (React + TypeScript)
├── Farmer/           # Farmer Dashboard (React)
├── Landing/          # Landing Page
├── esp32-storage/    # ESP32 IoT Firmware
├── docs/             # Documentation (32 files)
└── scripts/          # Automation scripts (5 files)
```

See [docs/PROJECT_ORGANIZATION.md](docs/PROJECT_ORGANIZATION.md) for detailed structure.

## Coding Standards

### JavaScript/TypeScript

**Style Guide:**
- Use ES6+ features (arrow functions, destructuring, template literals)
- Use `const` by default, `let` when reassignment needed
- Avoid `var`
- Use meaningful variable names
- Keep functions small and focused (single responsibility)

**Example:**
```javascript
// ❌ Bad
var x = function(a) {
  return a + 1;
}

// ✅ Good
const incrementValue = (value) => {
  return value + 1;
}
```

### React Components

**Functional Components:**
- Use hooks (useState, useEffect, useContext)
- Keep components small and reusable
- Extract custom hooks for complex logic
- Use TypeScript types (Buyers dashboard)

**Example:**
```typescript
// ✅ Good React Component
import React, { useState, useEffect } from 'react';

interface CropCardProps {
  cropType: string;
  count: number;
  onView: () => void;
}

const CropCard: React.FC<CropCardProps> = ({ cropType, count, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="font-bold text-lg">{cropType}</h3>
      <p className="text-gray-600">Count: {count}</p>
      <button onClick={onView} className="btn-primary">View</button>
    </div>
  );
};
```

### CSS/Tailwind

**Design System:**
- **Colors:** 
  - Buyer: `green-500` to `green-600`
  - Farmer: `emerald-500` to `emerald-600`
- **Shadows:** `shadow-md`, `shadow-lg`, `shadow-xl`
- **Border Radius:** `rounded-xl` (inputs), `rounded-2xl` (containers)
- **Transitions:** `transition-all duration-200`

**Responsive Design:**
```jsx
// Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

### Backend API

**Express Routes:**
```javascript
// routes/crops.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Get all crops
// @route   GET /api/crops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const crops = await Crop.find().populate('farmer', 'name location');
    res.json({ success: true, data: crops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new crop
// @route   POST /api/crops
// @access  Private (Farmer)
router.post('/', protect, async (req, res) => {
  // Implementation
});

module.exports = router;
```

**Response Format:**
```javascript
// ✅ Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}

// ❌ Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details (development only)"
}
```

### MongoDB Models

**Mongoose Schema:**
```javascript
const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    enum: ['wheat', 'rice', 'corn', 'tomato', 'potato'],
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Crop', CropSchema);
```

## Git Workflow

### Branch Naming

- **Feature:** `feature/description` (e.g., `feature/buyer-messaging`)
- **Bugfix:** `bugfix/description` (e.g., `bugfix/login-error`)
- **Hotfix:** `hotfix/description` (e.g., `hotfix/security-patch`)
- **Docs:** `docs/description` (e.g., `docs/api-reference`)

### Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(buyer): add AI chatbot assistant

- Integrated Gemini API
- Added chat UI component
- Implemented message history

Closes #42

---

fix(backend): resolve MongoDB connection timeout

Fixed connection string and added retry logic

---

docs(readme): update installation instructions

Added MongoDB setup steps and port configuration
```

### Workflow Steps

1. **Sync with upstream**
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat(component): add amazing feature"
   ```

4. **Keep branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request** on GitHub

## Testing Guidelines

### Manual Testing Checklist

**Before submitting PR:**
- [ ] All services start without errors
- [ ] No console errors in browser
- [ ] Features work as expected
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Forms validate correctly
- [ ] API endpoints return correct data
- [ ] Authentication works properly
- [ ] Database operations succeed

### API Testing

**Using curl:**
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected route
curl -X GET http://localhost:5000/api/crops \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Using Postman:**
1. Import API collection (if available)
2. Set environment variables (BASE_URL, TOKEN)
3. Run collection tests

## Documentation

### Code Comments

**When to comment:**
- Complex algorithms or logic
- Non-obvious design decisions
- API endpoint descriptions
- Component props documentation

**Example:**
```javascript
/**
 * Calculates the optimal price based on:
 * - Current market rates
 * - Crop quality grade
 * - Seasonal demand factors
 * 
 * @param {string} cropType - Type of crop (wheat, rice, etc.)
 * @param {string} grade - Quality grade (A, B, C)
 * @returns {number} Suggested price per kg
 */
const calculateOptimalPrice = (cropType, grade) => {
  // Implementation
};
```

### Adding Documentation

**For new features:**
1. Create doc in `/docs` folder
2. Use naming: `FEATURE_NAME_IMPLEMENTATION.md`
3. Include:
   - Overview
   - Technical details
   - API endpoints (if applicable)
   - UI components
   - Testing instructions

**Quick Start guides:**
- File: `docs/QUICK_START_FEATURE.md`
- Include setup steps, usage, and troubleshooting

## Pull Request Process

### Before Creating PR

1. **Test thoroughly** (see Testing Guidelines)
2. **Update documentation** if needed
3. **Run linter** (if configured)
4. **Format code** consistently
5. **Review your own changes** on GitHub

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] All services run without errors
- [ ] Responsive design verified

## Screenshots (if applicable)
Add screenshots of UI changes

## Related Issues
Closes #issue_number

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process

1. **Maintainer review** - Code quality and functionality
2. **Requested changes** - Address all feedback
3. **Approval** - Minimum 1 approval required
4. **Merge** - Maintainer merges to main

### After Merge

1. **Delete feature branch**
   ```bash
   git branch -d feature/amazing-feature
   git push origin --delete feature/amazing-feature
   ```

2. **Sync your fork**
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   git push origin main
   ```

## Code Review Guidelines

### As a Reviewer

**Look for:**
- Code clarity and readability
- Proper error handling
- Security vulnerabilities
- Performance issues
- Consistent styling
- Documentation completeness

**Feedback style:**
- Be respectful and constructive
- Explain the "why" behind suggestions
- Use code examples when helpful
- Acknowledge good solutions

### As an Author

- Respond to all comments
- Ask for clarification if needed
- Mark resolved conversations
- Push updates in new commits (don't force push)

## Getting Help

### Resources
- **Documentation:** `/docs` folder
- **API Reference:** `backend/API_DOCUMENTATION.md`
- **Organization Guide:** `docs/PROJECT_ORGANIZATION.md`

### Contact
- Open an issue for bugs or feature requests
- Tag maintainers for urgent matters
- Check existing issues before creating new ones

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to HarvestHub! 🌾
