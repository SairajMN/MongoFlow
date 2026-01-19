# MongoFlow Studio

🚀 **Interactive MongoDB Visualization & Learning Platform**

MongoFlow Studio is a comprehensive, no-login MongoDB playground designed to demonstrate how data flows from UI to database with real-time feedback. Perfect for learning MongoDB internals, understanding query performance, and visualizing application architecture.

![MongoFlow Studio](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## ✨ Features

### 🎮 Interactive Playground

- **CRUD Operations**: Insert, Find, Update, Delete with real-time execution
- **Bulk Operations**: Efficiently insert multiple documents
- **Aggregation Pipelines**: Build complex data processing workflows
- **JSON Editor**: Intuitive input methods (JSON or UI form builder)
- **Sample Data**: Pre-loaded datasets for quick experimentation

### 🔄 Real-time Data Flow Visualization

- **Architecture View**: See data flow through Frontend → API → MongoDB → Response
- **Animated Transitions**: Watch data packets move through each layer
- **Performance Metrics**: Execution time, documents examined, index usage
- **Live Monitoring**: Real-time request/response tracking

### 📚 Learning Mode

- **Progressive Curriculum**: 12+ lessons from beginner to advanced
- **Interactive Tutorials**: Hands-on MongoDB operations with guided explanations
- **Skill Assessment**: Track progress through beginner/intermediate/advanced levels
- **Code Examples**: Real-world scenarios and best practices

### 📊 Performance Monitoring

- **Query Analytics**: Execution times, document counts, index utilization
- **Collection Statistics**: Storage size, average object size, index details
- **Health Insights**: Performance recommendations and optimization tips
- **Historical Logs**: Query performance tracking over time

### 🔍 GitHub Repository Analyzer

- **Code Analysis**: Scan any GitHub repo for MongoDB operations
- **Architecture Mapping**: Visualize data flow patterns in real projects
- **Operation Distribution**: See which MongoDB operations are most used
- **Collection Discovery**: Automatically identify database collections

### 🎨 Modern UI/UX

- **Dark Theme**: Developer-friendly dark interface
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Accessible**: WCAG compliant with keyboard navigation

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/mongoflow-studio.git
cd mongoflow-studio
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Create environment file:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=mongoflow_demo
GITHUB_TOKEN=your_github_token_optional
```

5. Run the development server:

```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable       | Description                                    | Required |
| -------------- | ---------------------------------------------- | -------- |
| `MONGODB_URI`  | MongoDB connection string                      | Yes      |
| `DB_NAME`      | Database name                                  | Yes      |
| `GITHUB_TOKEN` | GitHub personal access token for repo analysis | No       |

## API Routes

| Endpoint              | Method | Description                           |
| --------------------- | ------ | ------------------------------------- |
| `/api/insert`         | POST   | Insert a single document              |
| `/api/bulk-insert`    | POST   | Insert multiple documents             |
| `/api/find`           | POST   | Query documents                       |
| `/api/update`         | POST   | Update documents                      |
| `/api/delete`         | POST   | Delete documents                      |
| `/api/aggregate`      | POST   | Run aggregation pipeline              |
| `/api/stats`          | GET    | Get collection statistics             |
| `/api/reset`          | POST   | Reset the demo collection             |
| `/api/create-index`   | POST   | Create an index                       |
| `/api/analyze-github` | POST   | Analyze GitHub repo for MongoDB usage |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes for MongoDB operations
│   │   ├── aggregate/       # Aggregation pipeline execution
│   │   ├── analyze-github/  # GitHub repository analysis
│   │   ├── bulk-insert/     # Bulk document insertion
│   │   ├── create-index/    # Index creation
│   │   ├── delete/          # Document deletion
│   │   ├── find/            # Document querying
│   │   ├── insert/          # Single document insertion
│   │   ├── reset/           # Database reset
│   │   ├── stats/           # Collection statistics
│   │   └── update/          # Document updates
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Main application page
├── components/
│   ├── ErrorReporter.tsx    # Error boundary and reporting
│   └── ui/                  # Reusable UI components (shadcn/ui)
├── hooks/                   # Custom React hooks
└── lib/
    ├── mongodb.ts           # MongoDB connection and utilities
    └── utils.ts             # Helper functions
```

## Usage Examples

### Basic CRUD Operations

```javascript
// Insert a document
POST /api/insert
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

// Find documents
POST /api/find
{
  "age": { "$gte": 25 }
}

// Update documents
POST /api/update
{
  "filter": { "name": "John Doe" },
  "update": { "$set": { "status": "active" } }
}

// Delete documents
POST /api/delete
{
  "name": "John Doe"
}
```

### Aggregation Pipeline

```javascript
POST /
  api /
  aggregate[
    ({ $match: { age: { $gte: 25 } } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } })
  ];
```

### Bulk Operations

```javascript
POST / api / bulk -
  insert[
    ({ name: "User 1", email: "user1@example.com" },
    { name: "User 2", email: "user2@example.com" })
  ];
```

## Learning Curriculum

### Beginner Level

1. **MongoDB Basics** - Core concepts and document structure
2. **CRUD Operations** - Create, Read, Update, Delete fundamentals
3. **Bulk Insert** - Efficient multi-document operations
4. **Finding Documents** - Query basics and filtering
5. **Filtering Conditions** - Advanced query operators

### Intermediate Level

6. **Updating Documents** - Modification operations
7. **Deleting Documents** - Removal operations
8. **Aggregation Match** - Pipeline filtering
9. **Aggregation Group** - Data grouping and aggregation
10. **Aggregation Sort & Limit** - Result ordering and pagination

### Advanced Level

11. **Aggregation Project** - Data transformation
12. **Aggregation Unwind** - Array processing

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure responsive design for all new components

## FAQ

### Q: Do I need a MongoDB account to use MongoFlow Studio?

A: Yes, you'll need either a MongoDB Atlas account (recommended) or a local MongoDB instance. The application uses a demo database that gets automatically created.

### Q: Is my data secure?

A: MongoFlow Studio is designed for learning and demonstration purposes. While we don't store your personal data, all operations are performed on a demo collection that can be reset at any time.

### Q: Can I use this in production?

A: This is primarily an educational tool. For production use, consider implementing proper authentication, rate limiting, and security measures.

### Q: How do I reset the demo data?

A: Use the "Reset DB" button in the header to clear all demo data and start fresh.

### Q: What MongoDB operations are supported?

A: Currently supports insert, bulk-insert, find, update, delete, and aggregation operations. More advanced features may be added in future updates.

## Roadmap

- [ ] Monaco Editor integration for better JSON editing
- [ ] Real-time collaboration features
- [ ] Custom query templates and snippets
- [ ] Performance comparison between different query approaches
- [ ] Integration with MongoDB Compass
- [ ] Export/import functionality for datasets
- [ ] Advanced aggregation pipeline builder
- [ ] Schema validation and design tools

## Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check the documentation
- Review the learning tutorials for guidance

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## License

MIT
