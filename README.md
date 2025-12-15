# E-Commerce Platform

A full-stack e-commerce application built with NestJS, React, MongoDB, and Docker. This platform features user authentication, product management, shopping cart functionality, order processing, and an admin dashboard with discount code management.

## 🤔 Assumptions

- **Discount code notification:** Assumed that discount code will be available for the respective user while checkout
- **Discount code is auto generated:** Discount code is auto generated, because of the requirement of processing discound codes at each nth order

## 😇 Sincere Acknowledgements

- **UI:** An existing UI theme was used as a starting point and customized to fit the use case. Some visual inconsistencies may still be present. AI-assisted tools were selectively used to speed up UI adjustments and refinements.

- **README:** AI-assisted tooling (such as GitHub Copilot) was used to help generate and structure portions of the README to ensure clarity, completeness, and consistency in documentation.

- **Tests:** Due to time constraints, comprehensive unit and integration test coverage could not be completed. AI-assisted suggestions were initially used to scaffold a few test cases; however, as the codebase expanded, maintaining full test coverage alongside feature development became challenging within the given timeline.

## 🏗️ Architecture

### Tech Stack

**Backend:**

- **Framework:** NestJS (Node.js)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with Passport
- **Validation:** class-validator & class-transformer
- **Security:** bcrypt for password hashing

**Frontend:**

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM v7
- **Styling:** SCSS/Sass
- **Icons:** Lucide React

**Infrastructure:**

- **Containerization:** Docker & Docker Compose
- **Database:** MongoDB (containerized)
- **Development:** Hot-reload enabled for both frontend and backend

## 📋 Features

### User Features

- ✅ User registration and authentication
- ✅ Browse products with detailed information
- ✅ Add/remove items to/from shopping cart
- ✅ Update cart item quantities
- ✅ Checkout process with discount code support
- ✅ Order history and tracking
- ✅ Automatic discount application (every Nth order)

### Admin Features

- ✅ Admin authentication (separate login)
- ✅ View discount codes
- ✅ Product management capabilities
- ✅ Order overview and statistics

### Technical Features

- ✅ Role-based access control (User/Admin)
- ✅ JWT-based authentication
- ✅ RESTful API architecture
- ✅ Database seeding for initial data
- ✅ Dockerized development environment
- ✅ Environment-based configuration

## 🚀 Getting Started

### Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for local development without Docker)
- npm or yarn package manager

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd e-comm
```

2. **Environment Configuration:**

The project includes a `.env` file with default configurations:

```env
# MongoDB Configuration
MONGO_INITDB_DATABASE=ecommerce

# Backend Configuration
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://db-service:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NTH_ORDER=5

# Frontend Configuration
VITE_API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important:** Change the `JWT_SECRET` in production!

3. **Start the application with Docker:**

```bash
docker-compose up --build
```

This will start three services:

- **MongoDB:** `localhost:27017`
- **Backend API:** `localhost:3000`
- **Frontend:** `localhost:5173`

4. **Seed the database (optional):**

If you need to populate the database with initial data:

```bash
# Enter the backend container
docker exec -it backend sh

# Run the seed script
npm run seed
```

### Local Development (Without Docker)

**Backend:**

```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**MongoDB:**
Ensure MongoDB is running locally on `mongodb://localhost:27017`

## 📁 Project Structure

```
ecommerce/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── admin/             # Admin module (admin login, dashboard, discount management)
│   │   ├── auth/              # Authentication (signup, user login, JWT, guards, strategies)
│   │   ├── cart/              # Shopping cart functionality
│   │   ├── database/          # Database seeding utilities
│   │   ├── discount/          # Discount code management
│   │   ├── orders/            # Order processing and history
│   │   ├── products/          # Product management
│   │   ├── users/             # User management
│   │   ├── app.module.ts      # Root application module
│   │   └── main.ts            # Application entry point
│   ├── dockerfile             # Backend Docker configuration
│   └── package.json           # Backend dependencies
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Products.tsx
│   │   │   └── Signup.tsx
│   │   ├── services/          # API service layer
│   │   ├── styles/            # Global styles and SCSS
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Application entry point
│   ├── dockerfile             # Frontend Docker configuration
│   └── package.json           # Frontend dependencies
│
├── Docker-compose.yml          # Docker orchestration
├── .env                        # Environment variables
└── README.md                   # This file
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID

### Cart

- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PATCH /cart/:itemId` - Update cart item quantity
- `DELETE /cart/:itemId` - Remove item from cart

### Orders

- `GET /orders` - Get user's order history
- `POST /orders/checkout` - Create new order
- `GET /orders/:id` - Get order details

### Admin

- `POST /admin/login` - Admin login
- `POST /admin/discount/generate` - Generate discount code
- `GET /admin/discount` - Get all discount codes
- `GET /admin/stats` - Get admin statistics

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based access control:

### User Roles

- **User:** Regular customers with access to shopping features
- **Admin:** Administrative users with access to management features

### Protected Routes

- User routes require valid JWT token
- Admin routes require JWT token with admin role
- Guards: [`JwtAuthGuard`](backend/src/auth/jwt-auth.guard.ts), [`RolesGuard`](backend/src/auth/roles.guard.ts)

### Token Flow

1. User logs in with credentials
2. Server validates and returns JWT token
3. Client stores token (localStorage/context)
4. Token included in Authorization header for protected requests
5. Server validates token on each request

## 🎯 Key Features Implementation

### Discount System

- **Automatic Discounts:** Every Nth order (configurable via `NTH_ORDER` env variable)
- **Admin-Generated Codes:** Admins can create custom discount codes
- **Single-Use Codes:** Each discount code can only be used once
- **Validation:** Codes are validated during checkout

### Shopping Cart

- **Persistent Cart:** Cart data stored in MongoDB
- **Real-time Updates:** Quantity changes reflected immediately
- **Price Calculation:** Automatic subtotal and total calculation
- **Stock Validation:** Prevents ordering out-of-stock items

### Order Processing

- **Order Creation:** Converts cart to order on checkout
- **Order History:** Users can view past orders
- **Status Tracking:** Orders have status (pending, completed, etc.)
- **Discount Application:** Discounts applied and recorded with orders

## 🛠️ Development

### Backend Development

- Hot-reload enabled with `nest start --watch`
- Linting: `npm run lint`
- Formatting: `npm run format`

### Frontend Development

- Hot-reload enabled with Vite
- Linting: `npm run lint`
- Build: `npm run build`

### Database Seeding

Seed script location: [`backend/src/database/seed.script.ts`](backend/src/database/seed.script.ts)

```bash
npm run seed
```

Seeds:

- Sample products
- Test users
- Admin accounts

## 🐳 Docker Configuration

### Services

**MongoDB (`db-service`):**

- Image: `mongo:latest`
- Port: `27017`
- Volume: `mongo-data` for data persistence

**Backend (`backend`):**

- Build: [`backend/dockerfile`](backend/dockerfile)
- Port: `3000`
- Hot-reload: Volume mounted for live code updates

**Frontend (`frontend`):**

- Build: [`frontend/dockerfile`](frontend/dockerfile)
- Port: `5173`
- Hot-reload: Volume mounted for live code updates

### Docker Commands

```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Execute commands in container
docker exec -it [container-name] sh
```

## 🔧 Configuration

### Environment Variables

| Variable                | Description                      | Default                                          |
| ----------------------- | -------------------------------- | ------------------------------------------------ |
| `MONGO_INITDB_DATABASE` | MongoDB database name            | `ecommerce`                                      |
| `NODE_ENV`              | Node environment                 | `development`                                    |
| `PORT`                  | Backend server port              | `3000`                                           |
| `MONGO_URI`             | MongoDB connection string        | `mongodb://db-service:27017/ecommerce`           |
| `JWT_SECRET`            | JWT signing secret               | `your-super-secret-jwt-key-change-in-production` |
| `NTH_ORDER`             | Nth order for automatic discount | `5`                                              |
| `VITE_API_URL`          | Backend API URL for frontend     | `http://localhost:3000`                          |
| `FRONTEND_URL`          | Frontend URL                     | `http://localhost:5173`                          |

## 📦 Database Schema

### User Schema

```typescript
{
  email: string(unique);
  password: string(hashed);
  role: "user" | "admin";
  createdAt: Date;
}
```

### Product Schema

```typescript
{
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: Date;
}
```

### Cart Schema

```typescript
{
  userId: ObjectId (ref: User)
  items: [{
    productId: ObjectId (ref: Product)
    quantity: number
    price: number
  }]
  updatedAt: Date
}
```

### Order Schema

```typescript
{
  userId: ObjectId (ref: User)
  items: [{
    productId: ObjectId (ref: Product)
    quantity: number
    price: number
  }]
  totalAmount: number
  discountCode?: string
  discountAmount: number
  status: string
  createdAt: Date
}
```

### Discount Schema

```typescript
{
  code: string (unique)
  discountPercentage: number
  isUsed: boolean
  usedBy?: ObjectId (ref: User)
  createdAt: Date
}
```

## 📝 License

This project is licensed under the UNLICENSED license.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using NestJS, React, and MongoDB**
