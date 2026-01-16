# Trello Clone - Kanban Project Management Application

A full-featured Kanban-style project management web application that replicates Trello's design and user experience. Built with modern web technologies including React.js, Node.js, Express, MySQL, and Prisma ORM.



## 🚀 Features

### Core Functionality

#### 📋 Board Management
- ✅ Create boards with custom titles and background colors
- ✅ View boards with all lists and cards in a Kanban layout
- ✅ Responsive board interface matching Trello's aesthetic

#### 📝 List Management
- ✅ Create, edit, and delete lists
- ✅ Drag-and-drop to reorder lists horizontally
- ✅ Inline title editing with keyboard shortcuts
- ✅ Visual feedback during drag operations

#### 🎴 Card Management
- ✅ Create cards with titles
- ✅ Edit card title and description with inline editing
- ✅ Delete and archive cards
- ✅ Drag-and-drop cards between lists
- ✅ Drag-and-drop to reorder cards within lists
- ✅ Smooth animations and visual feedback

#### 🎯 Card Details
- ✅ Add and remove colored labels
- ✅ Set due dates with visual indicators (overdue, today, complete)
- ✅ Create checklists with multiple items
- ✅ Mark checklist items as complete/incomplete
- ✅ Progress bar for checklist completion
- ✅ Assign members to cards with avatar display
- ✅ Rich card modal with comprehensive editing

#### 🔍 Search & Filter
- ✅ Search cards by title
- ✅ Real-time search results
- ✅ Filter UI (extensible for labels, members, due dates)

## 🛠️ Tech Stack

### Frontend
- **React.js 18.2** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Modern drag-and-drop library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma ORM** - Type-safe database client
- **MySQL** - Relational database
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Trello/
├── server/                 # Backend API
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Sample data seeding
│   ├── routes/            # API route handlers
│   │   ├── boards.js
│   │   ├── lists.js
│   │   ├── cards.js
│   │   ├── labels.js
│   │   ├── members.js
│   │   └── checklists.js
│   ├── server.js          # Express server
│   ├── package.json
│   └── .env              # Environment variables
│
└── client/                # Frontend React app
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Board/
    │   │   ├── List/
    │   │   ├── Card/
    │   │   ├── CardModal/
    │   │   └── SearchFilter/
    │   ├── services/      # API service layer
    │   │   └── api.js
    │   ├── App.jsx        # Main app component
    │   ├── main.jsx       # Entry point
    │   └── index.css      # Global styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
cd Trello
```

### Step 2: Setup MySQL Database
1. Start your MySQL server
2. Create a new database:
```sql
CREATE DATABASE trello_clone;
```

### Step 3: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MySQL credentials
# DATABASE_URL="mysql://username:password@localhost:3306/trello_clone"
# PORT=5000

# Generate Prisma Client
npm run prisma:generate

# Push database schema
npm run prisma:push

# Seed database with sample data
npm run prisma:seed

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### Step 4: Frontend Setup

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### Step 5: Access the Application

Open your browser and navigate to `http://localhost:3000`

You'll see a pre-populated board with:
- 4 lists (To Do, In Progress, Code Review, Done)
- 8 sample cards with various features
- 5 labels
- 4 team members
- 3 checklists

## 🎨 Design Philosophy

This application closely replicates Trello's design principles:

- **Clean Visual Hierarchy** - Clear distinction between boards, lists, and cards
- **Intuitive Interactions** - Hover states, focus indicators, and smooth transitions
- **Color Psychology** - Meaningful use of colors for labels and status indicators
- **Responsive Layout** - Horizontal scrolling for lists, vertical for cards
- **Accessibility** - Keyboard shortcuts and semantic HTML

### Color Palette
- **Primary Blue**: `#0079bf` - Trello's signature color
- **Labels**: Red, Orange, Blue, Purple, Green
- **Status Indicators**: Green (complete), Yellow (today), Red (overdue)
- **Neutral Grays**: For backgrounds and subtle UI elements

## 📖 API Documentation

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board with nested lists, cards, labels
- `POST /api/boards` - Create new board

### Lists
- `POST /api/lists` - Create new list
- `PUT /api/lists/:id` - Update list title
- `PUT /api/lists/reorder` - Reorder lists
- `DELETE /api/lists/:id` - Delete list

### Cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card (title, description, dueDate)
- `PUT /api/cards/move` - Move card between lists or reorder
- `PUT /api/cards/:id/archive` - Archive/unarchive card
- `DELETE /api/cards/:id` - Delete card
- `GET /api/cards/search?q=query&boardId=1` - Search cards

### Labels
- `GET /api/labels/:boardId` - Get all labels for board
- `POST /api/labels` - Create new label
- `POST /api/labels/cards/:cardId/labels/:labelId` - Add label to card
- `DELETE /api/labels/cards/:cardId/labels/:labelId` - Remove label from card

### Members
- `GET /api/members` - Get all members
- `POST /api/members/cards/:cardId/members/:memberId` - Assign member
- `DELETE /api/members/cards/:cardId/members/:memberId` - Remove member

### Checklists
- `POST /api/checklists` - Create checklist
- `POST /api/checklists/:id/items` - Add checklist item
- `PUT /api/checklists/items/:id` - Update item (toggle completion)
- `DELETE /api/checklists/items/:id` - Delete item
- `DELETE /api/checklists/:id` - Delete checklist

## 🎯 Key Implementation Details

### Drag-and-Drop Functionality
- Uses `@dnd-kit` library for modern, accessible drag-and-drop
- Optimistic UI updates for smooth user experience
- Server sync for persistence
- Visual feedback with drag overlays

### State Management
- React hooks for local component state
- API service layer for centralized backend communication
- Real-time updates after mutations

### Database Schema
Designed with Prisma ORM:
- **Boards** → **Lists** → **Cards** (one-to-many relationships)
- **Cards** ↔ **Labels** (many-to-many via CardLabel)
- **Cards** ↔ **Members** (many-to-many via CardMember)
- **Cards** → **Checklists** → **ChecklistItems** (nested one-to-many)

### Performance Optimizations
- Lazy loading of card details in modal
- Efficient position management for drag-and-drop
- Indexed database queries
- Minimal re-renders with proper React keys

## 🔐 Assumptions

1. **Authentication**: No login system implemented. App assumes a default user session. Sample members are pre-created for assignment functionality.

2. **Single Board**: Application defaults to viewing the first board (ID: 1) created by the seed script.

3. **Data Persistence**: MySQL must be running for the application to function.

4. **Browser Compatibility**: Optimized for modern browsers (Chrome, Firefox, Safari, Edge).

## 🚧 Future Enhancements

- User authentication and authorization
- Multiple board management
- Real-time collaboration with WebSockets
- Card attachments and file uploads
- Activity log and card history
- Email notifications
- Board templates
- Advanced filtering by labels, members, and due dates
- Dark mode support
- Mobile app version

## 🐛 Troubleshooting

### Backend won't start
- Ensure MySQL is running
- Check DATABASE_URL in `.env`
- Run `npm run prisma:generate` again

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check Vite proxy configuration in `vite.config.js`

### Database errors
- Ensure database `trello_clone` exists
- Run `npm run prisma:push` to sync schema
- Check MySQL user permissions

## 📝 Code Quality

- **Clean Architecture**: Separation of concerns (routes, services, components)
- **Reusable Components**: Modular React components
- **Type Safety**: Prisma for database type safety
- **Error Handling**: Comprehensive try-catch blocks
- **Comments**: Documented complex logic and API endpoints
- **Consistent Styling**: Tailwind utilities for maintainable CSS



