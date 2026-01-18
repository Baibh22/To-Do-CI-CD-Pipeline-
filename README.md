# To-Do List Application

A full-stack task management application built with React, Node.js, Express, and MongoDB. Features a drag-and-drop Kanban board interface with user authentication and real-time task updates.

## Features

- **User Authentication** - Secure registration and login with JWT tokens
- **Kanban Board** - Drag-and-drop tasks between To Do, In Progress, and Done columns
- **Task Management** - Create, edit, delete, and reorder tasks
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Containerized Deployment** - Docker images for both frontend and backend
- **Kubernetes Ready** - Complete K8s manifests for production deployment

## Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Native drag-and-drop API
- Modern CSS with responsive design

**Backend:**
- Node.js with Express 5
- MongoDB with Mongoose ODM
- JWT authentication
- bcrypt for password hashing
- Structured JSON logging

**DevOps:**
- Docker multi-stage builds
- Kubernetes deployments with health checks
- GitHub Actions CI/CD pipeline
- Nginx for frontend serving

## Getting Started

### Prerequisites

- Node.js 22 or higher
- MongoDB instance (local or cloud)
- Docker (optional, for containerized development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo-app
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/todoapp
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGIN=http://localhost:5173
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

   (Optional) Create a `.env` file in the `frontend` directory if you need a custom API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

### Running Tests

Backend tests:
```bash
cd backend
npm test
```

Frontend linting:
```bash
cd frontend
npm run lint
```

## Docker Deployment

### Build Images

```bash
# Backend
docker build -t todo-backend ./backend

# Frontend
docker build -t todo-frontend ./frontend
```

### Run with Docker

```bash
# Backend (requires MongoDB connection)
docker run -p 5000:5000 \
  -e MONGO_URI=your-mongo-uri \
  -e JWT_SECRET=your-secret \
  -e CORS_ORIGIN=http://localhost \
  todo-backend

# Frontend
docker run -p 80:80 todo-frontend
```

## Kubernetes Deployment

1. **Update image references** in `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml` to match your container registry.

2. **Create secrets** from the example:
   ```bash
   cp k8s/secrets.example.yaml k8s/secrets.yaml
   # Edit secrets.yaml with your actual values
   ```

3. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/
   ```

4. **Access the application** via the ingress at `http://todo.local` (or your configured domain).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Login and receive JWT token

### Todos (requires authentication)
- `GET /api/todos` - Get all todos for the current user
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Update a todo (title, status, or order)
- `DELETE /api/todos/:id` - Delete a todo

### Health
- `GET /health` - Server health check with database status

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── lib/           # Utilities (logger, validators)
│   │   ├── middleware/    # Express middleware (auth, logging)
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API route handlers
│   │   ├── db.js          # Database connection
│   │   └── index.js       # Application entry point
│   ├── test/              # Unit tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── lib/           # API client utilities
│   │   ├── pages/         # React page components
│   │   ├── App.jsx        # Main app component with routing
│   │   └── main.jsx       # React entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── k8s/                   # Kubernetes manifests
└── .github/workflows/     # CI/CD pipeline
```

## Environment Variables

### Backend
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | No | localhost |

### Frontend
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | Auto-detected |

## CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs backend tests
2. Lints and builds the frontend
3. Builds Docker images for both services
4. Pushes images to GitHub Container Registry
5. Deploys to Kubernetes cluster

### Required GitHub Secrets
- `KUBECONFIG_DATA` - Base64-encoded kubeconfig file
- `MONGO_URI` - Production MongoDB connection string
- `JWT_SECRET` - Production JWT secret key

## Security Considerations

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days
- CORS is configured to only allow specified origins
- All API routes (except auth) require valid JWT authentication
- Secrets are managed via Kubernetes secrets (never committed to git)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
