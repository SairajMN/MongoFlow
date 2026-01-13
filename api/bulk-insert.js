const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const documents = req.body;

        // Validate input
        if (!Array.isArray(documents)) {
            return res.status(400).json({
                error: 'Invalid input. Expected array of documents.',
                example: [
                    { name: "John Doe", email: "john@example.com" },
                    { name: "Jane Smith", email: "jane@example.com" }
                ]
            });
        }

        if (documents.length === 0) {
            return res.status(400).json({ error: 'Array cannot be empty' });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'bulk-insert',
            collection: 'demo_collection',
            documentsProvided: documents.length
        };

        // Perform bulk insert
        const result = await collection.insertMany(documents, {
            ordered: false // Continue on individual errors
        });

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsInserted = result.insertedCount;
        metrics.insertedIds = result.insertedIds ? Object.values(result.insertedIds) : [];

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size || 0;
        metrics.totalDocuments = stats.count || 0;

        res.status(200).json({
            result: {
                acknowledged: result.acknowledged,
                insertedCount: result.insertedCount,
                insertedIds: result.insertedIds
            },
            metrics,
            bsonConversion: 'JSON → BSON completed for all documents',
            indexUpdates: 'Indexes updated automatically'
        });

    } catch (error) {
        console.error('Bulk insert error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'bulk-insert'
        });
    }
}
