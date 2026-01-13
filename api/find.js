const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const query = req.body;

        // Validate input
        if (!query || typeof query !== 'object') {
            return res.status(400).json({ error: 'Invalid query input' });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'find',
            collection: 'demo_collection'
        };

        // Perform find operation
        const cursor = collection.find(query);
        const documents = await cursor.toArray();

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsReturned = documents.length;

        // Get query stats (simulated)
        const explainResult = await cursor.explain();
        if (explainResult.executionStats) {
            metrics.documentsExamined = explainResult.executionStats.totalDocsExamined || 0;
            metrics.indexUsed = explainResult.executionStats.winningPlan?.inputStage?.indexName || 'No index';
        }

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.totalDocuments = stats.count;

        res.status(200).json({
            result: documents,
            metrics,
            queryPlan: explainResult.executionStats?.winningPlan || {}
        });

    } catch (error) {
        console.error('Find error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'find'
        });
    }
}
