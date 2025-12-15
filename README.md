# E-Commerce Platform

A full-stack e-commerce application built with NestJS, React, MongoDB, and Docker. This platform features user authentication, product management, shopping cart functionality, order processing, and an admin dashboard with discount code management.

## 🏗️ Architecture

### Tech Stack

**Backend:**

- **Framework:** NestJS (Node.js)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with Passport
- **Validation:** class-validator & class-transformer
- **Security:** bcrypt for password hashing

If you need to populate the database with initial data:

```bash
# Enter the backend container
docker exec -it backend sh

# Run the seed script
npm run seed
```

## 📦 Database Schema

### User Schema

```typescript
{
  name: string;
  email: string(unique);
  password: string(hashed);
  role: "user" | "admin";
  isActive: boolean;
  totalOrders: number;
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

## 🔌 API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
