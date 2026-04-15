# Malwa Hardware

Full-stack web application for a hardware shop with product catalog, cart, checkout, admin management, live chat, and customer query handling.

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, React Router, Axios, Socket.io client, Firebase auth (frontend)
- Backend: Node.js, Express.js, Socket.io server
- Database: MongoDB Atlas
- ODM: Mongoose
- Admin auth: JWT
- File uploads: Cloudinary
- Tests: Jest + Supertest (backend), React Testing Library + Vitest (frontend)

## Backend Structure

```text
backend/
  src/
    config/
      db.js
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
      sequence.js
    app.js
    server.js
  scripts/
    seed.js
  tests/
    auth.test.js
    products.test.js
    orders.test.js
```

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI="mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
JWT_SECRET="super-secret-change-me"
PORT=5000
FRONTEND_URL="http://localhost:5173"
MAX_UPLOAD_SIZE_MB=5
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_FOLDER="malwa"
ADMIN_SEED_USERNAME="<admin-username>"
ADMIN_SEED_PASSWORD="<admin-password>"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

## Backend Commands

```bash
cd backend
npm install
npm run seed
npm run dev
```

## API (Brief)

- `POST /api/admin/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `GET /api/categories`
- `POST /api/categories` (admin)
- `POST /api/orders`
- `GET /api/orders` (admin)
- `GET /api/orders/:id` (admin)
- `PUT /api/orders/:id/status` (admin)
- `POST /api/queries`
- `GET /api/queries` (admin)
- `PUT /api/queries/:id/status` (admin)
- `POST /api/chats`
- `GET /api/chats` (admin)
- `GET /api/chats/:chatId/messages`
- `POST /api/uploads`

## Testing

Backend tests require `MONGO_URI` to be set:

```bash
cd backend
MONGO_URI="<your-test-uri>" npm test
```

## Docker

Copy the template and set real secrets before running:

```bash
cp .env.example .env
```

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Security Note

If you cloned this repo before the history rewrite, follow [SECURITY_ROTATION.md](SECURITY_ROTATION.md).
