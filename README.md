# PDF Annotator - Full Stack Application

A comprehensive PDF annotation application built with React, TypeScript, and Node.js that allows users to upload, view, and annotate PDF documents with persistent highlights.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **PDF Upload & Management**: Upload PDFs with drag-and-drop interface
- **Interactive PDF Viewer**: View PDFs with zoom, pagination, and navigation
- **Text Highlighting**: Select and highlight text with multiple colors
- **Persistent Annotations**: Automatically save and restore highlights
- **Personal Library**: Manage uploaded PDFs with rename and delete options

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Instant highlight creation and deletion
- **UUID Tracking**: Unique identification for all PDFs and highlights
- **Mock Backend**: Development-ready with simulated API responses
- **Type Safety**: Full TypeScript implementation

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React PDF** for PDF rendering
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend (Production Ready)
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Multer** for file uploads
- **UUID** for unique identifiers

## 🏃‍♂️ Quick Start

### Development Mode (Mock Backend)
The application is currently configured to run with a mock backend for immediate testing:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open http://localhost:5173
   - Create a new account or login
   - Upload and annotate PDFs immediately

### Production Setup (Real Backend)

1. **Setup MongoDB**
   ```bash
   # Install MongoDB locally or use MongoDB Atlas
   # Create a database named 'pdf_annotator'
   ```

2. **Configure Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   ```

3. **Start Backend Server**
   ```bash
   cd server
   npm start
   ```

4. **Update Frontend API**
   - Replace mock API calls in `src/utils/api.ts` with real API endpoints
   - Update API base URL to point to your backend server

## 📁 Project Structure

```
pdf-annotator/
├── src/
│   ├── components/
│   │   ├── Auth/           # Login and registration
│   │   ├── Dashboard/      # PDF library and upload
│   │   └── PDFViewer/      # PDF viewing and annotation
│   ├── context/           # React context for state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # API utilities and helpers
├── server/                # Backend Node.js application
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   └── middleware/       # Authentication and file upload
└── README.md
```

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with smooth animations
- **Color System**: Consistent blue (#3B82F6) and teal (#14B8A6) theme
- **Responsive Layout**: Optimized for all screen sizes
- **Interactive Elements**: Hover effects and micro-interactions
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/pdf_annotator
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
UPLOAD_DIR=./uploads
```

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `POST /api/pdfs/upload` - PDF upload
- `GET /api/pdfs` - List user PDFs
- `GET /api/pdfs/:id` - Get specific PDF
- `DELETE /api/pdfs/:id` - Delete PDF
- `PUT /api/pdfs/:id` - Rename PDF
- `POST /api/highlights` - Create highlight
- `GET /api/highlights/:pdfId` - Get PDF highlights
- `DELETE /api/highlights/:id` - Delete highlight

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables for production API

### Backend (Heroku/DigitalOcean)
1. Set up MongoDB Atlas for cloud database
2. Configure environment variables
3. Deploy Node.js application
4. Set up file storage (AWS S3 recommended for production)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **File Validation**: PDF file type and size validation
- **User Isolation**: Users can only access their own PDFs and highlights
- **CORS Protection**: Configured for secure cross-origin requests

## 🎯 Usage

1. **Register/Login**: Create an account or sign in
2. **Upload PDF**: Drag and drop or select PDF files
3. **View PDF**: Click "Open & Annotate" to view documents
4. **Highlight Text**: Select text and choose highlight color
5. **Manage Library**: Rename, delete, or organize your PDFs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ for professional document annotation**