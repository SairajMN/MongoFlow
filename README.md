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

## 🏗️ Architecture Deep Dive

### Frontend Architecture

MongoFlow Studio's frontend is built with modern React patterns and cutting-edge technologies:

#### **Core Technologies**

- **Next.js 15**: App Router for file-based routing and server-side rendering
- **React 19**: Latest React with concurrent features and improved performance
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Declarative animations and gesture handling

#### **Component Architecture**

The frontend follows a modular, component-driven architecture:

```typescript
// src/app/page.tsx - Main application component
// Features: Multi-tab interface, state management, real-time updates
```

**Key Components:**

- **Playground Tab**: Interactive MongoDB operation execution
- **Data Flow Tab**: Real-time visualization of data movement
- **Learning Tab**: Progressive curriculum with lesson management
- **Monitoring Tab**: Performance analytics and collection statistics

#### **State Management**

```typescript
// Complex state management with React hooks
const [activeTab, setActiveTab] = useState("playground");
const [operation, setOperation] = useState<Operation>("insert");
const [result, setResult] = useState<Record<string, unknown> | null>(null);
const [flowSteps, setFlowSteps] = useState<FlowStep[]>([...]);
```

**State Management Patterns:**

- **Local State**: useState for component-specific state
- **Derived State**: Computed values from existing state
- **Persistent State**: localStorage for user progress tracking
- **Real-time State**: Live metrics and performance data

#### **Animation System**

The application uses Framer Motion for sophisticated animations:

```typescript
// Data flow visualization with animated particles
<motion.div
  animate={{
    left: ["0%", "100%"],
    opacity: [0, 1, 1, 0],
  }}
  transition={{
    duration,
    delay,
    repeat: Infinity,
  }}
/>
```

**Animation Features:**

- **Page Transitions**: Smooth navigation between tabs
- **Data Flow**: Animated particles showing data movement
- **Loading States**: Skeleton screens and progress indicators
- **Interactive Feedback**: Hover effects and micro-interactions

#### **UI Component Library**

Built on shadcn/ui with Radix UI primitives:

```typescript
// Reusable form components
<Select value={operation} onValueChange={handleOperationChange}>
  <SelectTrigger className="border-emerald-500/30">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="insert">Insert One</SelectItem>
    <SelectItem value="find">Find</SelectItem>
  </SelectContent>
</Select>
```

**Component Categories:**

- **Form Controls**: Select, Input, Textarea with validation
- **Feedback**: Progress bars, loading spinners, alerts
- **Layout**: Cards, tabs, grids with responsive design
- **Data Display**: Tables, charts, code syntax highlighting

### API Architecture

The backend API is built with Next.js API routes, providing a RESTful interface to MongoDB:

#### **API Route Structure**

```typescript
// src/app/api/find/route.ts
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const collection = db.collection(getCollectionName());

    const query = body || {};
    const explainResult = await collection
      .find(query)
      .explain("executionStats");
    const documents = await collection.find(query).limit(100).toArray();
    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: { documents, count: documents.length },
      metrics: {
        executionTime,
        operation: "find",
        documentsExamined: explainResult.executionStats?.totalDocsExamined || 0,
        documentsReturned: documents.length,
        indexUsed:
          explainResult.queryPlanner?.winningPlan?.inputStage?.indexName ||
          "COLLSCAN",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
```

#### **API Endpoints**

| Endpoint              | Method | Description                 | Features                 |
| --------------------- | ------ | --------------------------- | ------------------------ |
| `/api/insert`         | POST   | Single document insertion   | Validation, metrics      |
| `/api/bulk-insert`    | POST   | Multiple document insertion | Atomic operations        |
| `/api/find`           | POST   | Document querying           | Query plans, limits      |
| `/api/update`         | POST   | Document updates            | Filter operations        |
| `/api/delete`         | POST   | Document deletion           | Safe deletion patterns   |
| `/api/aggregate`      | POST   | Aggregation pipelines       | Stage analysis           |
| `/api/stats`          | GET    | Collection statistics       | Performance insights     |
| `/api/reset`          | POST   | Database reset              | Demo data management     |
| `/api/create-index`   | POST   | Index creation              | Performance optimization |
| `/api/analyze-github` | POST   | GitHub repository analysis  | Code pattern detection   |

#### **Performance Monitoring**

Each API endpoint includes comprehensive performance tracking:

```typescript
const metrics = {
  executionTime: Date.now() - startTime,
  operation: "find",
  documentsExamined: explainResult.executionStats?.totalDocsExamined || 0,
  documentsReturned: documents.length,
  indexUsed:
    explainResult.queryPlanner?.winningPlan?.inputStage?.indexName ||
    "COLLSCAN",
};
```

**Metrics Collected:**

- **Execution Time**: Total operation duration
- **Document Counts**: Examined vs returned documents
- **Index Usage**: Whether queries use indexes or perform collection scans
- **Query Plans**: Detailed execution strategy analysis

#### **Error Handling**

Robust error handling with detailed error responses:

```typescript
catch (error) {
  const executionTime = Date.now() - startTime;
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: { executionTime },
    },
    { status: 500 }
  );
}
```

### MongoDB Integration

MongoFlow Studio integrates deeply with MongoDB, showcasing advanced database features:

#### **Connection Management**

```typescript
// src/lib/mongodb.ts - Cached connection pattern
const cached: CachedConnection = global.mongoCache || {
  client: null,
  db: null,
  promise: null,
};

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
      const db = client.db(DB_NAME);
      return { client, db };
    });
  }

  const { client, db } = await cached.promise;
  cached.client = client;
  cached.db = db;

  return { client, db };
}
```

**Connection Features:**

- **Connection Pooling**: Efficient reuse of database connections
- **Global Caching**: Prevents multiple connection instances
- **Environment Configuration**: Flexible MongoDB URI support
- **Error Recovery**: Automatic reconnection on failures

#### **Database Operations**

**CRUD Operations:**

- **Create**: `insertOne()`, `insertMany()` with validation
- **Read**: `find()` with query optimization and explain plans
- **Update**: `updateMany()` with atomic operations
- **Delete**: `deleteMany()` with safety checks

**Advanced Operations:**

- **Aggregation**: Pipeline processing with stage analysis
- **Indexing**: Dynamic index creation and management
- **Bulk Operations**: Efficient batch processing
- **Statistics**: Collection metrics and performance insights

#### **Query Optimization**

The application demonstrates MongoDB query optimization:

```typescript
// Query execution with explain plan
const explainResult = await collection.find(query).explain("executionStats");

// Index usage detection
const indexUsed =
  explainResult.queryPlanner?.winningPlan?.inputStage?.indexName || "COLLSCAN";
```

**Optimization Features:**

- **Index Detection**: Identifies when queries use indexes
- **Performance Metrics**: Documents examined vs returned
- **Query Plan Analysis**: Winning plan visualization
- **Collection Scan Warnings**: Alerts for unoptimized queries

#### **Data Flow Architecture**

MongoFlow visualizes the complete data flow:

```
Frontend (React/Next.js)
    ↓ HTTP Request
API Routes (Next.js)
    ↓ MongoDB Driver
MongoDB Database
    ↓ BSON Serialization
Response Flow (Reverse)
```

**Data Transformation:**

- **JSON Input**: User-friendly JSON editing
- **BSON Conversion**: Binary serialization for MongoDB
- **Query Execution**: Optimized database operations
- **Result Processing**: Data transformation and metrics

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
  "update": { "$set": { "age": 31 } }
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
