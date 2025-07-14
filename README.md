# Yellow Ladder Coffee - Backend

A Node.js/Express.js backend service for managing orders at Yellow Ladder Coffee shop.

## Table of Contents
- [Yellow Ladder Coffee - Backend](#yellow-ladder-coffee---backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technology Stack](#technology-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
  - [API Documentation](#api-documentation)
    - [Endpoints](#endpoints)
      - [Health Check](#health-check)
      - [Orders API](#orders-api)
        - [Get All Orders](#get-all-orders)
        - [Get a Specific Order](#get-a-specific-order)
        - [Create a New Order](#create-a-new-order)
        - [Update Order Status](#update-order-status)
        - [Get Orders Statistics](#get-orders-statistics)
  - [Database](#database)
  - [Development](#development)
  - [Production Deployment](#production-deployment)
  - [License](#license)

## Features
- RESTful API for order management
- JSON-based database storage with automatic backups
- Filter and search orders by various criteria
- Health check endpoint for monitoring

## Technology Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **LowDB** - JSON-based database
- **UUID** - Unique identifier generation
- **Nodemon** - Development server with hot reload
- **CORS** - Cross-Origin Resource Sharing support

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/espython/yellow-coffee-ladder-backend.git
   cd yellow-coffee-ladder-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Configuration
Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
```

## API Documentation

### Endpoints

#### Health Check
```
GET /health
```
Returns the health status of the API and database.

#### Orders API

##### Get All Orders
```
GET /api/orders
```
Returns a list of all orders.

**Query Parameters:**
- `status`: Filter by order status (pending, completed, cancelled)
- `search`: Search for specific items by name (case-insensitive)
- `dateRange`: Filter orders by date range (today, week, month, year)

Examples:
- `/api/orders?status=pending` - Get all pending orders
- `/api/orders?search=cold+brew` - Search for orders containing "cold brew"
- `/api/orders?dateRange=week` - Get orders from the last 7 days
- `/api/orders?status=pending&search=cold+brew&dateRange=week` - Combined filters

##### Get a Specific Order
```
GET /api/orders/:id
```
Returns details for a specific order by ID.

##### Create a New Order
```
POST /api/orders
```
Creates a new order.

**Request Body:**
```json
{
  "items": [
    {
      "name": "Cold Brew Coffee",
      "price": 4.50,
      "quantity": 2
    },
    {
      "name": "Croissant",
      "price": 3.25,
      "quantity": 1
    }
  ]
}
```

##### Update Order Status
```
PATCH /api/orders/:id/status
```
Updates the status of an order.

**Request Body:**
```json
{
  "status": "completed"
}
```
Valid status values: `pending`, `completed`, `cancelled`

##### Get Orders Statistics
```
GET /api/orders/stats
```
Returns statistics about orders.

## Database
The application uses LowDB, a lightweight JSON-based database. The database file is stored in the `data/db.json` file and is automatically initialized at startup.

A backup of the database is automatically created when the server shuts down gracefully (SIGINT signal).

## Development
To run the server in development mode with hot reloading:
```bash
npm run dev
```

Other useful commands:
- `npm run build` - Compiles TypeScript to JavaScript
- `npm run clean` - Removes the dist directory
- `npm start` - Starts the production server (runs compiled JavaScript)

## Production Deployment
For production deployment:

1. Set environment variables:
```
NODE_ENV=production
PORT=<desired-port>
```

2. Build and start the application:
```bash
npm run build
npm start
```

## License
ISC
