# 📘 Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-10-21

## [1.0.0] - 2025-10-21

## [Unreleased]

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

## 🧱 Version History

| Version   | Date       | Summary                                             |
| --------- | ---------- | --------------------------------------------------- |
| **1.0.1** | 2025-10-21 | Update changelog for v1.0.1 release                 |
| **1.0.0** | 2024-12-21 | Initial stable release — Express + TypeScript setup |
| **0.1.0** | 2024-10-10 | Early development phase — project scaffolding       |

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

- [Unreleased]: https://github.com/your-org/your-repo/compare/v1.0.1...HEAD
- [1.0.1]: https://github.com/your-org/your-repo/releases/tag/v1.0.1
- [1.0.0]: https://github.com/your-org/your-repo/releases/tag/v1.0.0

---
