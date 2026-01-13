const { connectToDatabase } = require('./_db');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const pipeline = req.body;

        // Validate input
        if (!Array.isArray(pipeline)) {
            return res.status(400).json({
                error: 'Invalid aggregation pipeline. Must be an array of stages.',
                example: [
                    { $match: { status: "active" } },
                    { $group: { _id: "$category", count: { $sum: 1 } } }
                ]
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'aggregate',
            collection: 'demo_collection',
            pipelineStages: pipeline.length
        };

        // Perform aggregation
        const result = await collection.aggregate(pipeline).toArray();

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsOutput = result.length;

        // Get aggregation stats (simulated)
        const explainResult = await collection.aggregate(pipeline).explain();
        if (explainResult.stages) {
            metrics.stagesExecuted = explainResult.stages.length;
        }

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.totalDocuments = stats.count;

        res.status(200).json({
            result,
            metrics,
            pipelineExecuted: pipeline,
            aggregationComplete: 'Pipeline executed successfully'
        });

    } catch (error) {
        console.error('Aggregate error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'aggregate'
        });
    }
}
