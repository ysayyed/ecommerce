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
