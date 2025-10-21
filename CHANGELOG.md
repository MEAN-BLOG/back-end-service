# 📘 Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-12-21

### 🚀 Added

- Initial project setup with TypeScript + Express
- Core middleware (`helmet`, `cors`, `morgan`)
- Environment-based configuration system
- Development and production environment setup
- Initial documentation and project structure

### 🧩 Changed

- Standardized folder structure for modular expansion

---

## [1.0.1] - 2025-10-21

### 🚀 Added

- **Database Integration**
  - MongoDB connection setup using Mongoose
  - Centralized connection utility with environment validation
- **User Management**
  - Authentication with JWT and bcrypt
  - Role-based access control (`Guest`, `Writer`, `Editor`, `Admin`)
- **Article Module**
  - Full CRUD endpoints
  - Validation with Zod and middleware integration
- **Comment System**
  - Nested replies (parent-child structure)
  - API route documentation
- **Notification System**
  - Real-time notifications (Socket.io / WebSocket setup)
- **Validation & Security**
  - Comprehensive input sanitization
  - Unified error handling middleware
- **Code Quality**
  - Shared `interfaces` and `enums` modules for schema consistency
  - Strict TypeScript types across models and controllers

### 🧩 Changed

- Refactored project architecture according to `README.md` guidelines
- Moved enums and interfaces into shared modules
- Updated import paths for better module resolution
- Improved validation and error-handling logic
- Enhanced folder structure for scalability and clarity

### 🐞 Fixed

- Environment variable validation issues
- TypeScript linting and build errors
- Module resolution and relative path inconsistencies

### 🗑️ Removed

- Deprecated hardcoded configurations
- Old sample endpoints no longer in use

### ⚠️ Deprecated

- Temporary mock routes (to be replaced with production endpoints)

---
## [1.0.2] - 2025-10-21

### 🚀 Added

- **Authentication Module**
  - Completed all auth routes: `register`, `login`, `logout`, `refresh-token`, `profile details`
  - JWT-based access and refresh token management
  - Role-based access middleware fully integrated
- **API Documentation**
  - Swagger docs updated for all auth endpoints
- **Testing**
  - Unit and integration tests for authentication flows

### 🧩 Changed

- Refined middleware error handling for auth routes
- Improved response format consistency across all endpoints
- Updated Zod validation schemas for stricter input checks

### 🐞 Fixed

- Resolved token expiration edge cases
- Fixed minor TypeScript type mismatches in auth controllers

### ⚠️ Deprecated

- Temporary mock authentication endpoints removed  

---

## 🧱 Version History

| Version   | Date       | Summary                                             |
| --------- | ---------- | --------------------------------------------------- |
| **1.0.0** | 2025-10-21 | Initial stable release — Express + TypeScript setup |
| **1.0.1** | 2025-10-21 | Update changelog for v1.0.1 release                 |
| **1.0.2** | 2025-10-21 | Completed authentication module with full routes and testing |

---

## 🧑‍💻 Contributing

When contributing to this project, please update the changelog with your changes.

### Adding a new entry

1. Add your updates under the `[Unreleased]` section
2. Use one of the categories: `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`
3. Keep entries concise but descriptive
4. Include PR or commit references when relevant (e.g., `[#42]`)

### Creating a new release

1. Move `[Unreleased]` changes under a new version section
2. Update `package.json` version
3. Add the release date
4. Create a new empty `[Unreleased]` section for future changes

---

## 🔗 Version Compare Links

- [Unreleased]: https://github.com/your-org/your-repo/compare/v0.0.0...HEAD
- [1.0.0] [https://github.com/MEAN-BLOG/back-end-service/releases/tag/v1.0.0]
- [1.0.1] [https://github.com/MEAN-BLOG/back-end-service/releases/tag/v1.0.1]
- [1.0.2] [https://github.com/MEAN-BLOG/back-end-service/releases/tag/v1.0.2]

---
