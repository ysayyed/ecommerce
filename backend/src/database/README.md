# Database Seeding

This directory contains the database seeding functionality for the e-commerce application.

## Overview

The seeding system automatically populates the database with initial data from JSON files on application startup. It includes:

- User data with encrypted passwords
- Product catalog data

## Features

- ✅ **Automatic seeding on application load** - Seeds run when the app starts
- ✅ **Idempotent operations** - Checks if data exists before seeding
- ✅ **Password encryption** - Uses bcrypt to hash user passwords
- ✅ **Standalone script** - Can be run independently via npm command

## Files

- [`seed.service.ts`](./seed.service.ts) - Core seeding logic
- [`seed.module.ts`](./seed.module.ts) - NestJS module configuration
- [`seed.script.ts`](./seed.script.ts) - Standalone script for manual seeding

## Data Sources

- **Users**: [`backend/src/users/users.json`](../users/users.json)
  - Contains admin and regular user accounts
  - Passwords are automatically encrypted during seeding
- **Products**: [`backend/src/products/products.json`](../products/products.json)
  - Contains product catalog with prices, stock, and images

## Usage

### Automatic Seeding (Default)

The seeding runs automatically when you start the application:

```bash
npm run start:dev
```

The seed service will:

1. Check if data already exists in the database
2. If no data exists, seed users and products
3. If data exists, skip seeding and log a message

### Manual Seeding

To run seeding manually (useful for resetting data):

```bash
npm run seed
```

## How It Works

1. **On Application Load** ([`main.ts`](../main.ts)):
   - The [`SeedService`](./seed.service.ts) is retrieved from the app context
   - The `seed()` method is called before the server starts listening

2. **Seeding Process**:
   - Checks if users or products already exist in the database
   - If data exists, exits without re-adding
   - If no data exists:
     - Reads user data from JSON and encrypts passwords using bcrypt (salt rounds: 10)
     - Reads product data from JSON
     - Inserts all data into MongoDB

3. **Password Encryption**:
   - Original passwords from [`users.json`](../users/users.json):
     - Admin: `admin*123`
     - User: `john*123`
   - These are hashed using bcrypt before storage

## Default Accounts

After seeding, you can login with:

**Admin Account:**

- Email: `admin@example.com`
- Password: `admin*123`

**Regular User:**

- Email: `john@example.com`
- Password: `john*123`

## Resetting Data

To reset the database and re-seed:

1. Clear the database collections (users and products)
2. Restart the application or run `npm run seed`

## Error Handling

- All errors during seeding are logged with detailed messages
- If seeding fails, the error is thrown and logged
- The application will continue to start even if seeding fails (for production resilience)

## Configuration

The seeding behavior can be modified in [`seed.service.ts`](./seed.service.ts):

- Change bcrypt salt rounds (currently 10)
- Modify the data existence check logic
- Add additional data sources
