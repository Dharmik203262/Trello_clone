# Quick Setup Guide

## Prerequisites Check

Before running the application, ensure:

### 1. MySQL is Running
- If using XAMPP: Start MySQL from XAMPP Control Panel
- If using WAMP: Start MySQL from WAMP Server
- If standalone: Run `mysql.server start` or start from Services

### 2. Create Database
Open MySQL command line or phpMyAdmin and run:
```sql
CREATE DATABASE trello_clone;
```

### 3. Configure Database Connection
Edit `server/.env` file with your MySQL credentials:
```env
DATABASE_URL="mysql://username:password@localhost:3306/trello_clone"
```

Common configurations:
- **XAMPP default**: `mysql://root:@localhost:3306/trello_clone`
- **WAMP default**: `mysql://root:@localhost:3306/trello_clone`  
- **Custom password**: `mysql://root:yourpassword@localhost:3306/trello_clone`

## Installation Steps

### Backend Setup
```bash
cd server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (creates tables)
npx prisma db push

# Seed database with sample data
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on: http://localhost:5000

### Frontend Setup (New Terminal)
```bash
cd client

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend will run on: http://localhost:3000

## Troubleshooting

### "nodemon is not recognized"
**Solution**: Make sure you ran `npm install` in the server directory

### "Can't reach database server at localhost:3306"
**Solution**: 
1. Check if MySQL is running
2. Verify port 3306 is used by MySQL
3. Update DATABASE_URL in .env with correct credentials

### "Database trello_clone does not exist"
**Solution**: Create the database:
```sql
CREATE DATABASE trello_clone;
```

### "Access denied for user 'root'@'localhost'"
**Solution**: Update the password in DATABASE_URL:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/trello_clone"
```

## Success Indicators

When everything is set up correctly:
- Backend shows: `🚀 Server running on http://localhost:5000`
- Frontend shows: `Local: http://localhost:3000`
- Opening http://localhost:3000 displays the Trello board

## Sample Data

The seed script creates:
- 1 board: "Product Development Roadmap"
- 4 lists: To Do, In Progress, Code Review, Done
- 8 cards with labels, members, checklists, and due dates
- 5 labels (colors)
- 4 team members
