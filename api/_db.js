const { MongoClient } = require('mongodb');

// MongoDB Atlas connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'mongoflow_demo';

let client = null;

async function connectToDatabase() {
    // Check if MongoDB URI is configured
    if (!uri) {
        throw new Error('MongoDB connection not configured. Please set MONGODB_URI environment variable.');
    }

    if (!client) {
        try {
            client = new MongoClient(uri, {
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            });
            await client.connect();
            console.log('Connected to MongoDB Atlas');
        } catch (error) {
            console.error('MongoDB connection failed:', error.message);
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }
    return client.db(dbName);
}

// Auto-reset database (clear collections periodically)
async function resetDatabase() {
    try {
        const db = await connectToDatabase();
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            await db.collection(collection.name).deleteMany({});
        }

        console.log('Database reset completed');
    } catch (error) {
        console.error('Error resetting database:', error);
    }
}

// Reset every 30 minutes (1800000 ms)
setInterval(resetDatabase, 1800000);

module.exports = { connectToDatabase, resetDatabase };
