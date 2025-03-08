# Dr. AI - Medical Assistant Application

Dr. AI is a modern web application that serves as an AI-powered medical assistant. It allows patients to register, chat with an AI doctor, and upload medical documents for reference.

## Features

- **User Authentication**: Secure registration and login system
- **AI-Powered Chat**: Conversations with an AI medical assistant
- **Document Management**: Upload and manage medical PDF documents
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Tech Stack

### Frontend

- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests

### Backend

- Node.js with Express
- TypeScript
- MongoDB for database
- JWT for authentication
- OpenAI API for AI responses
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository

```
git clone https://github.com/yourusername/ai-doctor.git
cd ai-doctor
```

2. Install backend dependencies

```
cd backend
npm install
```

3. Configure environment variables
   Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

4. Install frontend dependencies

```
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server

```
cd backend
npm run dev
```

2. Start the frontend development server

```
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Chats

- `POST /api/chats` - Create a new chat
- `GET /api/chats` - Get all user chats
- `GET /api/chats/:id` - Get a specific chat
- `POST /api/chats/:id/messages` - Send a message in a chat
- `GET /api/chats/:id/messages` - Get all messages in a chat

### Documents

- `POST /api/documents` - Upload a document
- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get a specific document
- `DELETE /api/documents/:id` - Delete a document

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

Dr. AI provides information for educational purposes only. Always consult with a qualified healthcare provider for medical advice.
