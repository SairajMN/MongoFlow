const { connectToDatabase } = require('./_db');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const { filter, update, options = {} } = req.body;

        // Validate input
        if (!filter || !update || typeof filter !== 'object' || typeof update !== 'object') {
            return res.status(400).json({
                error: 'Invalid input. Required: filter and update objects',
                example: {
                    filter: { name: "John Doe" },
                    update: { $set: { age: 31 } }
                }
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'update',
            collection: 'demo_collection'
        };

        // Perform update operation
        let result;
        if (options.multi || options.multiple) {
            result = await collection.updateMany(filter, update, options);
        } else {
            result = await collection.updateOne(filter, update, options);
        }

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsMatched = result.matchedCount;
        metrics.documentsModified = result.modifiedCount;

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.totalDocuments = stats.count;

        res.status(200).json({
            result,
            metrics,
            operationType: options.multi ? 'updateMany' : 'updateOne',
            documentRewrite: 'Documents rewritten with updates'
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'update'
        });
    }
}
