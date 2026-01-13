const { connectToDatabase } = require('./_db');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const filter = req.body;

        // Validate input
        if (!filter || typeof filter !== 'object') {
            return res.status(400).json({
                error: 'Invalid filter input',
                example: { name: "John Doe" }
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'delete',
            collection: 'demo_collection'
        };

        // Perform delete operation
        let result;
        if (filter._id || Object.keys(filter).length === 1) {
            // Single document delete
            result = await collection.deleteOne(filter);
        } else {
            // Multiple documents delete
            result = await collection.deleteMany(filter);
        }

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsDeleted = result.deletedCount;

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.remainingDocuments = stats.count;

        res.status(200).json({
            result,
            metrics,
            operationType: filter._id ? 'deleteOne' : 'deleteMany',
            storageReclaim: 'Storage space reclaimed'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'delete'
        });
    }
}
