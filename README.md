# TypeScript Node.js Starter Kit Documentation

This starter kit is a boilerplate project designed to accelerate the development of scalable Node.js applications using TypeScript. It integrates several essential features and best practices for modern backend development.

---

## **Project Structure**

The project is organized as follows:

```
.github/
├── workflows/               # GitHub Actions workflows
│   ├── docker-publish-dev.yml   # CI/CD for development environment
│   └── docker-publish-prod.yml  # CI/CD for production environment
Dockerfile                   # Docker configuration
.env.example                 # Environment variable example
index.ts                     # Entry point
src/
├── api/
│   ├── auth/                # Authentication-related API logic
│   │   ├── middlewares/     # Authentication middlewares
│   │   ├── controller.ts    # Auth controllers
│   │   └── index.ts         # Export file
│   ├── users/               # User-related API logic
│   │   ├── middlewares/     # User middlewares
│   │   ├── controller.ts    # User controllers
│   │   ├── model.ts         # Mongoose user schema
│   │   └── index.ts         # Export file
├── services/
│   ├── auth/                # Authentication services
│   │   ├── auth.ts          # Auth helper functions
│   │   └── jwt.ts           # JWT logic
│   ├── docs/                # API documentation utilities
│   │   ├── docs.ts          # Swagger setup
│   │   └── docsgenerator.ts # Generate docs and Postman output
│   ├── logger/              # Logging utilities
│   │   └── winston.ts       # Winston-based logging configuration
│   ├── mongo/               # MongoDB database connection
│   │   └── mongo.ts         # Mongoose connection setup
│   │   └── seeder/          # seeder for database
│   ├── validator/           # Request validators
│   │   ├── body/            # Zod-based body validators
│   │   └── query/           # Zod-based query validators
├── utils/                   # Utility functions
│   ├── libs                 # Custom error handling
│   │   ├── generator/       # Dynamic controller generator
│   │   ├── mongoose/        # Mongoose utilities (custom schema)
│   │   ├── queryFilters/    # Query filters
│   │   └── softDelete/      # Soft delete logic
│   └── enum.ts              # Enumerations
├── config.ts                # Configuration handling for `.env`
├── test/                    # Test configuration and helpers
│   └── jest.setup.ts        # Jest setup
```

---

## **Features**

### 1. **Environment Configuration**

- Centralized environment configuration using `.env` files.
- Managed by the `src/utils/config.ts` module for easy usage throughout the application.

### 2. **Authentication**

- Supports **JWT-based authentication** and **master-key authentication**.
- Includes role-based access control for fine-grained authorization.

### 3. **API Documentation**

- Swagger-based API documentation.
- Outputs Postman collection files for streamlined testing and collaboration.
    - Command: `npm run docs`

### 4. **Database Integration**

- **MongoDB** connection using Mongoose.
- Includes a pre-built user schema (`src/api/users/model.ts`).

### 5. **Dynamic Features**

- **Dynamic Routes Detection:** Automatically maps API routes based on file structure.
- **Dynamic Controller Generator:** Simplifies the addition of new endpoints.

### 6. **Validation**

- Request body validation using **Zod**.
- Custom validators located in `src/test/validator/body`.

### 7. **Testing**

- Jest is configured for testing TypeScript modules.
    - Jest setup: `src/test/jest.setup.ts`
    - Command: `npm run test`

### 8. **Logging**

- Uses **Winston** for application logging.
- Separate configurations for:
    - HTTP request logging.
    - General application logs.

### 9. **Containerization**

- Docker support with a pre-configured `Dockerfile`.
- GitHub Actions workflows (`.github/workflows`) for CI/CD to DockerHub and Render(Disabled).

### 10. **Pipeline Integration**

- Integration with GitHub Actions for automated builds and deployments.
- DockerHub pipelines for container publishing.

### 11. **Appwrite Integration**

- Appwrite integration for user management, authentication and buckets.

### 12. **Soft Delete**

- Soft delete logic for MongoDB.

### 13. **Swagger UI**

- Swagger UI for API documentation.
---

## **Getting Started**

### 1. **Install Dependencies**

```bash
npm install
```

### 2. **Set Up Environment Variables**

Create a `.env` file based on `.env.example` (example below):

```plaintext
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 3. **Run the Application**

Start the development server:

```bash
npm run dev
```

### 4. **Generate API Documentation**

```bash
npm run docs
```

The documentation will be available in `src/services/docs`.

### 5. **Run Tests**

```bash
npm run test
```

---

## **Planned Enhancements**

### 1. Improved Controller Generator

- Refine the dynamic controller generator to support more complex use cases.

---

## **Usage Highlights**

- **Config Management:** Access your environment variables directly from `src/utils/config.ts`.
- **Swagger Docs:** Use `docs` to view the API documentation in a browser or export to Postman.
- **Logging:** Centralized logging setup helps track application and HTTP activity.
- **Jest:** Comprehensive testing suite to ensure your app works as expected.
