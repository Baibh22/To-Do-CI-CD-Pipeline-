# Frontend - To-Do List Application

React-based frontend for the To-Do List application, featuring a drag-and-drop Kanban board interface.

## Quick Start

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5173

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Environment Variables

Create a `.env` file if you need to customize the backend API URL:

```env
VITE_API_URL=http://localhost:5000
```

If not set, the app automatically detects the API URL based on the current hostname and port 5000.

## Features

- **Authentication Flow** - Login and registration pages with form validation
- **Kanban Board** - Three-column board (To Do, In Progress, Done)
- **Drag and Drop** - Native HTML5 drag-and-drop for task management
- **Task Operations** - Create, edit, delete, and move tasks between columns
- **Responsive Design** - Mobile-friendly interface
- **Error Handling** - User-friendly error messages and loading states
- **Protected Routes** - Automatic redirect to login for unauthenticated users

## Project Structure

```
src/
├── lib/
│   └── api.js          # API client with authentication
├── pages/
│   ├── LoginPage.jsx   # User login
│   ├── RegisterPage.jsx # User registration
│   └── TodosPage.jsx   # Main Kanban board
├── App.jsx             # Root component with routing
├── App.css             # Application styles
├── main.jsx            # React entry point
└── index.css           # Global styles
```

## Tech Stack

- **React 19** - UI library
- **React Router 7** - Client-side routing
- **Vite 7** - Build tool and dev server
- **ESLint** - Code linting

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Docker Build

```bash
docker build -t todo-frontend .
docker run -p 80:80 todo-frontend
```

The Dockerfile uses a multi-stage build with nginx to serve the static files efficiently.

## API Integration

The frontend communicates with the backend API using the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

Authentication is handled via JWT tokens stored in localStorage.

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

See the main project README for contribution guidelines.
