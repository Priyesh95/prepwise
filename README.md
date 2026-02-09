# PrepWise

**Smart Study, Better Results**

PrepWise is an AI-powered study companion that transforms your PDF study materials into interactive, intelligent quizzes. Upload your textbooks, lecture notes, or study guides, and let AI generate personalized questions to help you master any subject.

((https://prepwisepn.netlify.app/)


https://github.com/user-attachments/assets/88a8d1b3-2223-44ba-98d9-fd3b2ccfb307


---

## 🌟 Key Features

### 📄 **Intelligent PDF Processing**
- **Automatic Text Extraction**: Extracts text from PDF files with high accuracy
- **Scanned PDF Detection**: Warns users when PDFs are image-based for better transparency
- **Content Validation**: Ensures extracted text is meaningful and suitable for question generation
- **Multi-page Support**: Handles documents of any length (up to 50MB)

### 🤖 **AI-Powered Question Generation**
- **Multiple Question Types**:
  - **Multiple Choice Questions (MCQ)**: 4-option questions with distractors
  - **Single Word Answers**: Precise, fill-in-the-blank style questions
  - **Short Answer Questions**: Open-ended questions requiring detailed responses
- **Adaptive Difficulty**: Questions tailored to content complexity
- **Concept Extraction**: Automatically identifies key topics and concepts from your material
- **Smart Distractors**: MCQ options designed to test true understanding

### 📊 **Comprehensive Analytics & Tracking**
- **Performance Dashboard**: Track your progress across all study materials
- **Concept Mastery Scores**: See which topics you've mastered and which need review
- **Study Streak Tracking**: Build momentum with consecutive day tracking
- **Question Type Analysis**: Understand your strengths across different question formats
- **Historical Trends**: View performance over time for each material

### 🎯 **Intelligent Review System**
- **Mistake Review**: Automatically collects incorrect answers for focused practice
- **Detailed Feedback**: Get comprehensive explanations for every question
- **Strengths/Weaknesses Breakdown**: For short answers, see exactly what you got right and what you missed
- **Targeted Practice**: Re-quiz yourself on only the questions you got wrong

### ⚙️ **Flexible Quiz Configuration**
- **Customizable Question Counts**: Choose how many of each question type
- **Timer Options**: Practice with or without time pressure
- **Quick Practice Mode**: Fast 5-10 question sessions for quick review
- **Full Test Mode**: Comprehensive assessment covering all material

### 📱 **Responsive & Accessible Design**
- **Mobile-First**: Fully responsive on phones, tablets, and desktops
- **Keyboard Navigation**: Complete keyboard accessibility with visible focus states
- **Screen Reader Support**: ARIA labels and semantic HTML throughout
- **Reduced Motion Support**: Respects user preferences for minimal animations
- **Skip Navigation**: Quick access to main content for keyboard users

### 🎨 **Beautiful User Experience**
- **Medium-Inspired Design**: Clean, content-focused aesthetic
- **Smooth Animations**: Subtle transitions enhance usability without distraction
- **Loading States**: Skeleton screens and progress indicators for better perceived performance
- **Error Handling**: Graceful error boundaries prevent crashes
- **Dark Mode Ready**: Architecture supports future dark mode implementation

### 🔒 **Privacy & Security**
- **Local-First Storage**: All data stored in browser's IndexedDB
- **No Server Storage**: Your study materials never leave your device
- **Encrypted API Keys**: API keys securely encoded in localStorage
- **Client-Side Processing**: PDF processing happens entirely in your browser

---

## 🚀 Advantages Over Traditional Study Methods

### ✅ **Personalized to Your Materials**
Unlike generic quiz apps, PrepWise generates questions directly from YOUR specific study materials, ensuring perfect alignment with your curriculum.

### ✅ **Intelligent Feedback**
Get detailed explanations for every answer, not just "correct" or "incorrect". Understand WHY an answer is right or wrong.

### ✅ **Time-Saving**
No need to create flashcards or study guides manually. AI generates comprehensive questions in minutes.

### ✅ **Active Recall Practice**
Forces you to retrieve information from memory, the most effective study technique according to cognitive science.

### ✅ **Spaced Repetition Support**
Review wrong answers as many times as needed, naturally implementing spaced repetition.

### ✅ **Concept Identification**
Automatically identifies key concepts and tracks mastery, so you know exactly what to focus on.

### ✅ **Progress Tracking**
See your improvement over time with detailed analytics and performance trends.

### ✅ **Flexible Practice**
Study your way - quick 5-minute sessions or comprehensive 2-hour tests, timed or untimed.

### ✅ **Works Offline**
Once materials are uploaded and questions generated, the app works completely offline (after initial setup).

### ✅ **No Subscription Required**
Pay only for the AI API calls you use. No monthly subscriptions, no hidden fees.

---

## 🛠️ Technologies Used

### **Frontend**
- **React 18.3** - Modern UI library with hooks and concurrent features
- **React Router 7.1** - Client-side routing and navigation
- **Vite 6.0** - Lightning-fast build tool and dev server
- **CSS3** - Custom design system with CSS variables
- **IndexedDB (idb 8.0)** - Client-side database for offline storage

### **AI & APIs**
- **Anthropic Claude API** - Advanced AI for question generation and grading
  - Claude Opus 4.5 for complex question generation
  - Claude Sonnet 4.5 for answer evaluation
- **Cloudflare Workers** - API proxy and rate limiting
- **Cloudflare AI Gateway** - API request caching and cost optimization

### **PDF Processing**
- **pdf.js 4.9** - Mozilla's PDF rendering and text extraction library
- **Web Workers** - Background processing for large PDFs

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Git** - Version control

### **Deployment**
- **Cloudflare Pages** - Global CDN hosting with instant rollbacks
- **GitHub Actions** - CI/CD pipeline for automated deployments

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prepwise.git
   cd prepwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

5. **Add your API key**
   - Navigate to Settings
   - Enter your Anthropic API key
   - Start studying!

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

---

## 🎓 How to Use PrepWise

### 1. **Upload Your Study Material**
   - Click "Upload New Material" on the dashboard
   - Select a PDF file (textbooks, lecture notes, study guides)
   - Wait for text extraction (1-2 minutes for large files)

### 2. **Review Extracted Text**
   - Verify the text was extracted correctly
   - Edit if needed to correct any errors
   - Click "Continue" when satisfied

### 3. **Generate Questions**
   - AI analyzes your material and creates questions
   - Generates 20 MCQs, 15 Single Word, and 10 Short Answer questions
   - Takes 1-2 minutes depending on material length

### 4. **Configure Your Quiz**
   - Choose how many of each question type
   - Enable or disable timer (2 minutes per question)
   - Select shuffle options

### 5. **Take the Quiz**
   - Answer each question at your own pace
   - Skip questions if unsure (come back later)
   - Submit when complete

### 6. **Review Results**
   - See your overall score and breakdown by type
   - View concept mastery scores
   - Review all questions with correct answers

### 7. **Practice Mistakes**
   - Click "Review Wrong Answers"
   - See detailed feedback for each mistake
   - Practice only the questions you got wrong

### 8. **Track Progress**
   - Dashboard shows all materials
   - Study streak keeps you motivated
   - Weak concepts highlight areas needing focus

---

## 🏗️ Project Structure

```
prepwise/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── ErrorBoundary/
│   │   │   ├── Skeleton/
│   │   │   └── ...
│   │   └── layout/          # Layout components
│   │       ├── Container/
│   │       ├── Header/
│   │       └── Footer/
│   ├── pages/               # Page components
│   │   ├── Home/
│   │   ├── Dashboard/
│   │   ├── Upload/
│   │   ├── Quiz/
│   │   ├── Results/
│   │   ├── Review/
│   │   └── ...
│   ├── context/             # React Context providers
│   │   ├── ApiKeyContext/
│   │   └── QuizContext/
│   ├── hooks/               # Custom React hooks
│   │   └── useQuestionGeneration.js
│   ├── utils/               # Utility functions
│   │   ├── anthropic.js
│   │   ├── indexedDB.js
│   │   ├── pdfProcessor.js
│   │   └── ...
│   ├── styles/              # Global styles
│   │   ├── variables.css
│   │   ├── typography.css
│   │   ├── transitions.css
│   │   └── ...
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── docs/                    # Documentation images
└── package.json
```

---

## 🎯 Key Features Explained

### Question Generation Process
1. **Content Analysis**: AI reads and understands your study material
2. **Concept Extraction**: Identifies key topics and important information
3. **Question Creation**: Generates questions at varying difficulty levels
4. **Answer Generation**: Creates model answers and explanations
5. **Distractor Generation**: For MCQs, creates plausible wrong answers
6. **Quality Validation**: Ensures questions are clear and answerable

### Grading System
- **MCQ**: Binary scoring (100% or 0%)
- **Single Word**: Fuzzy matching with 80% threshold, case-insensitive
- **Short Answer**: AI-powered evaluation with:
  - Percentage score (0-100%)
  - Strengths: What you got right
  - Missing: Key points you missed
  - Errors: Misconceptions to correct

### Concept Tracking
- Extracts concepts from each question
- Tracks performance per concept across all attempts
- Calculates mastery percentage for each topic
- Highlights weak areas needing review

---

## 🔧 Configuration

### API Key Management
API keys are stored locally in your browser using encrypted localStorage. They never leave your device and are only used to make API calls to Anthropic.

### Cloudflare Integration
For production deployments, PrepWise uses Cloudflare Workers to:
- Proxy API requests to Anthropic
- Implement rate limiting
- Cache responses for cost optimization
- Add security headers
- Monitor usage and errors

---

## 📊 Performance Optimization

### Loading Optimization
- **Code Splitting**: Pages loaded on-demand
- **Lazy Loading**: Components loaded when needed
- **Asset Optimization**: Minimized CSS and JS bundles
- **CDN Delivery**: Static assets served from Cloudflare's global network

### Caching Strategy
- **Question Bank**: Stored in IndexedDB for instant access
- **API Responses**: Cached at Cloudflare edge for repeated queries
- **Static Assets**: Browser caching with long TTLs

### Offline Support
- **Service Worker Ready**: Architecture supports PWA conversion
- **IndexedDB Storage**: All user data available offline
- **Local Processing**: PDF extraction works without internet

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow existing code style and conventions
2. Use semantic HTML and accessible components
3. Test on multiple browsers and devices
4. Add comments for complex logic
5. Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude API
- **Mozilla** for pdf.js library
- **Cloudflare** for hosting and API infrastructure
- **React Team** for the amazing framework

---

## 📧 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

## 🚀 Roadmap

### Upcoming Features
- [ ] Export quiz results to PDF
- [ ] Share materials with other users
- [ ] Custom question templates
- [ ] Audio explanations for answers
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Collaborative study sessions
- [ ] Gamification (badges, achievements)
- [ ] Flashcard mode

---

**Built with ❤️ by the PrepWise Team**

*Smart Study, Better Results*
