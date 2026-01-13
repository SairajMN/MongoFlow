# 🧠 MongoFlow Studio

A **production-ready web application** that visually demonstrates how data flows from **UI → Frontend Logic → Backend APIs → MongoDB**, including internal processing, metrics, and real-time feedback.

## ✨ Features

- **No Login Required** - Public MongoDB playground
- **Interactive UI** with tab-based layout and JSON editor
- **Real-time Flow Visualization** - See data transformation step-by-step
- **Advanced Operations** - CRUD, Bulk Insert, Advanced Find, Text Search, Index Management
- **Sample Data Loader** - Pre-built datasets (Users, Products, Orders, Logs)
- **Performance Metrics** - Execution time, index usage, document counts, query plans
- **Auto-reset Database** - Safe public demo environment (resets every 30 minutes)
- **BSON Visualization** - Understand JSON → BSON conversion process
- **Index Management** - Create, list, and drop indexes with detailed analysis
- **Text Search** - Full-text search with scoring and highlighting
- **Advanced Querying** - Sort, limit, projection, and complex filters
- **IP Whitelist Security** - API access restricted to configured IP ranges (based on MongoDB Atlas settings)
- **Responsive Design** - Works perfectly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- **MongoDB Atlas account (Required for full functionality)**
- Vercel account (for deployment)

### MongoDB Atlas Setup (Required)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a free account and cluster

2. **Get Connection String**
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Whitelist IP Addresses**
   - Add `0.0.0.0/0` to IP whitelist (for Vercel deployment)
   - Or add your local IP for development

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/SairajMN/MongoFlow.git
   cd MongoFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables** (Optional - works in demo mode without MongoDB)
   Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb+srv://mongoflow:<db_password>@cluster0.trpwdys.mongodb.net/?appName=Cluster0
   DB_NAME=mongoflow_demo
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

   **🎯 Quick Start Guide:**
   - **Step 1**: Choose "Load Sample Data" to get started with pre-built datasets
   - **Step 2**: Select an operation from the dropdown (Insert, Find, Update, etc.)
   - **Step 3**: Use the placeholder text as a guide for JSON input
   - **Step 4**: Click "Execute Operation" to see the magic happen!
   - **Step 5**: Switch to "Data Flow Visualizer" tab to see the real-time processing flow

### Deployment to Vercel

1. **Connect to Vercel**
   ```bash
   vercel login
   vercel link
   ```

2. **Set environment variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add DB_NAME
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Without MongoDB (Demo Mode)

If you don't have MongoDB Atlas set up, the application will show connection errors. All API endpoints will return helpful error messages explaining how to configure the database connection.

## 🏗️ Architecture

### Frontend (Vanilla JS)
- **HTML**: Static interface with tabs and panels
- **CSS**: Responsive styling with animations
- **JavaScript**: JSON validation, API calls, flow visualization

### Backend (Python Flask on Vercel)
- **API Routes**: `/api/insert`, `/api/bulk-insert`, `/api/find`, `/api/find-advanced`, `/api/update`, `/api/delete`, `/api/aggregate`, `/api/text-search`, `/api/create-index`, `/api/list-indexes`, `/api/drop-index`, `/api/validate-schema`, `/api/change-stream`, `/api/wiredtiger-metrics`, `/api/query-cost`, `/api/schema-insights`
- **Rate Limiting**: Flask-Limiter for API protection
- **Schema Validation**: JSON Schema validation with jsonschema
- **Change Streams**: Real-time MongoDB change stream monitoring
- **WiredTiger Metrics**: Storage engine performance metrics
- **Query Cost Analysis**: Execution plan and performance analysis
- **Schema Insights**: Automatic schema pattern detection
- **Validation**: Input sanitization and comprehensive error handling
- **Metrics**: Advanced performance tracking and collection stats

### Database (MongoDB Atlas)
- **Dynamic Collections**: Auto-created collections
- **BSON Conversion**: JSON to BSON visualization
- **Index Tracking**: Query plan analysis with explain()
- **Change Streams**: Real-time data change monitoring
- **WiredTiger Engine**: Storage engine metrics and performance
- **Auto-reset**: Periodic database cleanup (30 minutes)

## 📊 Data Flow Visualization

1. **User Input** → JSON validation
2. **API Request** → Fetch to backend
3. **Backend Processing** → Input validation
4. **MongoDB Operation** → CRUD execution
5. **BSON Conversion** → Data transformation
6. **Index Update** → Automatic indexing
7. **Response** → Formatted results

## 🎯 API Endpoints

### POST `/api/insert`
Insert documents into collection
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

### POST `/api/find`
Query documents
```json
{
  "age": { "$gte": 25 }
}
```

### POST `/api/update`
Update documents
```json
{
  "filter": { "name": "John Doe" },
  "update": { "$set": { "age": 31 } }
}
```

### POST `/api/delete`
Delete documents
```json
{
  "name": "John Doe"
}
```

### POST `/api/aggregate`
Run aggregation pipeline
```json
[
  { "$match": { "age": { "$gte": 25 } } },
  { "$group": { "_id": "$department", "count": { "$sum": 1 } } }
]
```

### POST `/api/bulk-insert`
Insert multiple documents at once
```json
[
  { "name": "John Doe", "email": "john@example.com" },
  { "name": "Jane Smith", "email": "jane@example.com" }
]
```

### POST `/api/find-advanced`
Advanced query with options
```json
{
  "filter": { "age": { "$gte": 25 } },
  "options": { "sort": { "age": -1 }, "limit": 10, "projection": { "name": 1, "age": 1 } }
}
```

### POST `/api/text-search`
Full-text search
```json
{
  "$text": { "$search": "engineer" },
  "score": { "$meta": "textScore" }
}
```

### POST `/api/create-index`
Create database index
```json
{
  "name": "age_index",
  "key": { "age": 1 },
  "options": { "unique": false }
}
```

### POST `/api/list-indexes`
List all indexes
```json
{}
```

### POST `/api/drop-index`
Drop an index
```json
"age_index"
```

### POST `/api/validate-schema`
Validate document against JSON schema
```json
{
  "document": { "name": "John", "age": 30 },
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "age": { "type": "number" }
    },
    "required": ["name"]
  }
}
```

### POST `/api/change-stream`
Monitor real-time database changes
```json
{
  "collection": "demo_collection",
  "filter": { "operationType": "insert" }
}
```

### GET `/api/wiredtiger-metrics`
Get WiredTiger storage engine metrics
```json
{}
```

### POST `/api/query-cost`
Analyze query performance and cost
```json
{
  "query": { "age": { "$gte": 25 } },
  "operation": "find"
}
```

### GET `/api/schema-insights`
Generate automatic schema insights
```json
{}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Demo URI |
| `DB_NAME` | Database name | `mongoflow_demo` |

### Auto-reset Settings

The database automatically resets every 30 minutes to maintain a clean demo environment.

## 🎨 Customization

### Styling
Modify `public/css/style.css` for custom themes and layouts.

### Flow Steps
Update `public/js/app.js` to customize the visualization flow steps.

### API Logic
Extend `api/*.js` files to add new operations or modify existing ones.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vercel for serverless deployment
- The MongoDB community for inspiration

---

**MongoFlow Studio** - Learn MongoDB by seeing how data really flows! 🚀
