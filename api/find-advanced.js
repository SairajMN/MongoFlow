const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const { filter = {}, options = {} } = req.body;

        // Validate input
        if (typeof filter !== 'object' || typeof options !== 'object') {
            return res.status(400).json({
                error: 'Invalid input. Expected filter and options objects.',
                example: {
                    filter: { age: { $gte: 25 } },
                    options: { sort: { age: -1 }, limit: 10, projection: { name: 1, age: 1 } }
                }
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'find-advanced',
            collection: 'demo_collection'
        };

        // Build query with options
        let query = collection.find(filter);

        // Apply options
        if (options.sort) query = query.sort(options.sort);
        if (options.limit) query = query.limit(options.limit);
        if (options.skip) query = query.skip(options.skip);
        if (options.projection) query = query.project(options.projection);

        // Execute query
        const documents = await query.toArray();

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsReturned = documents.length;
        metrics.queryOptions = options;

        // Get query stats (simulated)
        const explainResult = await query.explain();
        if (explainResult.executionStats) {
            metrics.documentsExamined = explainResult.executionStats.totalDocsExamined || 0;
            metrics.indexUsed = explainResult.executionStats.winningPlan?.inputStage?.indexName || 'No index';
            metrics.executionStages = explainResult.executionStats.winningPlan ? 1 : 0;
        }

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.totalDocuments = stats.count;

        res.status(200).json({
            result: documents,
            metrics,
            queryPlan: explainResult.executionStats?.winningPlan || {},
            appliedOptions: options
        });

    } catch (error) {
        console.error('Advanced find error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'find-advanced'
        });
    }
}
