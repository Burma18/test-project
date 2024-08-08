# REST API with NestJS

## Overview

This project is a simple REST API built with NestJS, featuring user authentication, CRUD operations for articles, and data caching. PostgreSQL is used for data storage, while Redis handles caching.

## Features

### Authentication API

- **User registration and authentication.**
- **JWT (JSON Web Tokens)** for handling authentication.

### PostgreSQL Integration

- **Connection to PostgreSQL** using TypeORM.
- **Database schema management** with migrations.

### CRUD Operations for Articles

- **Article Structure:** Title, description, published date, author.
- **Operations:** Create, read, update, and delete articles.
- **Validation:** Input data validation.
- **Pagination:** Paginated responses for article lists.
- **Filtering:** Filter articles by criteria such as publication date and author.
- **Authorization:** Restrict article creation and updates to authenticated users.

### Redis Caching

- **Caching of article read queries.**
- **Cache invalidation** upon article updates or deletions.

### Testing

- **Unit tests** for business logic validation.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/test-project.git
   ```
2. Navigate to the project directory:
   ```bash
   cd test-project
   ```
3. Install dependencies
   ```bash
   npm i
   ```

## Configuration

Set up the environment variables in a `.env` file. Required variables include:

```plaintext
PORT=port
POSTGRES_HOST=host
POSTGRES_PORT=poer
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dbName
REDIS_HOST=host
REDIS_PORT=port
NODE_ENV=environment
JWT_SECRET=jwtsecret
```

## Scripts:

```plaintext
npm start: Starts the server.
npm run dev: Starts the server in development mode.
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

```

## Endpoints

### Authentication:

- **POST** `/auth/register` - Register a new user.
- **POST** `/auth/login` - Authenticate and get a JWT.

### Articles:

- **GET** `/articles` - List articles with pagination and filtering.
- **GET** `/articles/:id` - Get a single article by ID.
- **POST** `/articles` - Create a new article (auth required).
- **PUT** `/articles/:id` - Update an article by ID (auth required).
- **DELETE** `/articles/:id` - Delete an article by ID (auth required).

### Users:

- **GET** `/users` - List all users (auth required).
- **GET** `/users/:id` - Get details of a single user by ID (auth required).
- **POST** `/users` - Create a new user (auth required).
- **PUT** `/users/:id` - Update user details by ID (auth required).
- **DELETE** `/users/:id` - Delete a user by ID (auth required).
