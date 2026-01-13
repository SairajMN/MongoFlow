const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const data = req.body;

        // Validate input
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON input' });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'insert',
            collection: 'demo_collection'
        };

        // Perform insert
        let result;
        if (Array.isArray(data)) {
            result = await collection.insertMany(data);
            metrics.documentsInserted = data.length;
        } else {
            result = await collection.insertOne(data);
            metrics.documentsInserted = 1;
        }

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.documentCount = stats.count;

        res.status(200).json({
            result,
            metrics,
            bsonConversion: 'JSON → BSON completed',
            indexUpdates: 'Indexes updated automatically'
        });

    } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'insert'
        });
    }
}
