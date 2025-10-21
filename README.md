# Backend Service — Collaborative Blog Platform

A **TypeScript-based backend service** for a collaborative multi-author blog platform built with **Node.js, Express, MongoDB**, and **Socket.io**.  
Implements **JWT authentication**, **dynamic role-based permissions**, **real-time comments**, and **OpenAPI documentation**.

---

## Tech Stack

- **Node.js** + **Express.js**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **CASL** (role-based permissions & access control)
- **Socket.io** (real-time)
- **Zod** (validation)
- **JWT** + **Refresh Tokens**
- **Swagger / OpenAPI**
- **Jest** (unit testing)
- **Modular Monolith Architecture**

---

## Project Structure

```
backend-service/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
|   |   ├── database.ts
|   |   ├── environment.ts
|   |   ├── logger.ts
|   |   └── redis.ts
│   ├── modules/
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.validation.ts
│   │   │   └── index.ts
│   │   ├── articles/
│   │   │   ├── article.model.ts
│   │   │   ├── article.service.ts
│   │   │   ├── article.controller.ts
│   │   │   ├── article.routes.ts
│   │   │   ├── article.validation.ts
│   │   │   └── index.ts
│   │   ├── comments/
│   │   │   ├── comment.model.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── comment.controller.ts
│   │   │   ├── comment.routes.ts
│   │   │   ├── comment.validation.ts
│   │   │   └── index.ts
│   │   ├── replies/
│   │   │   ├── reply.model.ts
│   │   │   ├── reply.service.ts
│   │   │   ├── reply.controller.ts
│   │   │   ├── reply.routes.ts
│   │   │   ├── reply.validation.ts
│   │   │   └── index.ts
│   │   ├── notifications/
│   │   │   ├── notification.model.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── notification.validation.ts
│   │   │   └── index.ts
│   │   └── shared/
│   │       ├── dto/
|   │       |   ├── pagination.dto.ts
|   |       |   └── search.dto.ts
│   │       ├── enums/
|   |       |   └──role.enum.ts
│   │       ├── interfaces/
│   |       |   ├── response.interface.ts
│   |       |   ├── schema.interface.ts
│   |       |   └── pagination.interface.ts
│   │       └── index.ts
│   ├── middlewares/
|   |   ├── auth.middleware.ts
|   |   ├── validation.middleware.ts
|   |   ├── response.middleware.ts
|   |   ├── swagger.middleware.ts
|   |   └── error.middleware.ts
│   └── utils/
│       ├── paginate.ts
│       └── filter.ts
├── __tests__/
├── .env.example
├── jest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Setup & Installation

### 1. Clone the repository

```
git clone git@github.com:MEAN-BLOG/back-end-service.git
cd backend-service
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5000
```

### 4. Run in development mode

```
npm run dev
```

### 5. Build for production

```
npm run build
npm start
```

---

## Architecture Overview

This project follows a **Modular Monolith** approach:  
Each module (User, Article, Comment, etc.) encapsulates its own **controllers**, **services**, **routes**, **schemas**, and **validation**.

### Example Module Structure

```
src/modules/articles/
│
├── article.controller.ts
├── article.service.ts
├── article.model.ts
├── article.routes.ts
├── article.validation.ts
└── index.ts
```

This pattern ensures **clean separation of concerns** while keeping inter-module communication lightweight and efficient.

---

## Security & Best Practices

- **JWT Authentication** with refresh tokens
- **bcrypt** for password hashing
- **Zod** for request validation
- **Helmet**, **CORS**, and **Rate Limiting** middleware
- **MongoDB query sanitization** to prevent injection attacks

---

## API Documentation (Swagger)

Swagger is auto-generated from route decorators and OpenAPI annotations.

### Access Swagger UI:

Once the server is running:

```
http://localhost:4000/api-docs
```

---

## Testing

Unit and integration tests are written using **Jest**.

### Run tests

```
npm test
```

---

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start development server with nodemon |
| `npm run build` | Compile TypeScript to JavaScript      |
| `npm start`     | Run compiled server                   |
| `npm test`      | Run Jest tests                        |
| `npm run lint`  | Run ESLint code checks                |

---

## Future Improvements

- Add **Redis caching** for performance
- Integrate **Web Push API** for real-time notifications
- Implement **rate-limited analytics tracking**
- Deploy using **Docker + Nginx reverse proxy**

---

## Author

**Raed R'dhaounia** \
Software engineer \
[GitHub Profile](https://github.com/RaedRdhaounia) \
[linkedIn Profile](https://www.linkedin.com/in/raed-rdhaounia/)
