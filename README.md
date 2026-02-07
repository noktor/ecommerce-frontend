# 🛒 E-commerce Frontend

React frontend application for the E-commerce platform, built with TypeScript, Vite, and modern React patterns.

## 📋 Features

- ✅ **React 18** with TypeScript
- ✅ **Vite** for fast development and optimized builds
- ✅ **User Authentication** - Registration, login, email verification, password reset
- ✅ **Product Catalog** - Browse and filter products
- ✅ **Shopping Cart** - Add/remove items, view cart
- ✅ **Order Management** - Create and view orders
- ✅ **Responsive Design** - Modern UI with clean styling

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Cart.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ProductList.tsx
│   └── ...
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── services/            # API services
│   ├── api.ts
│   └── auth.ts
└── main.tsx            # Application entry point
```

## 🚀 Installation

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### Step 1: Install dependencies

```bash
pnpm install
```

### Step 2: Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, create `.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

See `.env.example` for the template.

### Step 3: Start development server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type check without building

### Type Checking

```bash
pnpm check
```

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## 🌐 Environment Variables

### `VITE_API_URL`

The base URL for the backend API. This should point to your backend server.

**Development:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Production:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

**Important**: Variables prefixed with `VITE_` are public and included in the build bundle. Never put secrets or API keys here.

## 🔗 Backend Integration

This frontend connects to the [E-commerce Backend](https://github.com/your-org/ecommerce-hexagonal-backend) API.

### API Endpoints Used

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:productId` - Remove item from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### CORS Configuration

Make sure your backend CORS configuration allows requests from your frontend URL.

## 🐳 Docker

### Build Docker Image

```bash
docker build -t ecommerce-frontend .
```

### Run Container

```bash
docker run -p 5173:5173 -e VITE_API_URL=http://localhost:3000/api ecommerce-frontend
```

## 📦 Deployment

### Build for Production

1. Set `VITE_API_URL` environment variable to your production backend URL
2. Build the application:

```bash
pnpm build
```

3. Deploy the `dist/` directory to your hosting service (Vercel, Netlify, etc.)

### Environment-Specific Builds

- Development: Uses `.env` file
- Production: Uses `.env.production` file or environment variables

## 🧪 Testing

Type checking is available via:

```bash
pnpm check
```

## 📝 Notes

- The frontend uses JWT tokens stored in `localStorage` for authentication
- All API requests include the authentication token in the `Authorization` header
- The application handles authentication state via React Context
- Email verification and password reset links are handled via URL parameters

## 🔗 Related Repositories

- [E-commerce Backend](https://github.com/your-org/ecommerce-hexagonal-backend) - Backend API with hexagonal architecture

## 📄 License

MIT

