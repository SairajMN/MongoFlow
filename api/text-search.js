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
            return res.status(400).json({
                error: 'Invalid search query.',
                example: {
                    $text: { $search: "engineer" },
                    score: { $meta: "textScore" }
                }
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'text-search',
            collection: 'demo_collection'
        };

        // Perform text search
        const cursor = collection.find(query);
        const documents = await cursor.toArray();

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.documentsFound = documents.length;

        // Get search stats
        if (documents.length > 0) {
            const stats = await collection.aggregate([
                { $match: query },
                { $group: { _id: null, avgScore: { $avg: { $meta: "textScore" } }, maxScore: { $max: { $meta: "textScore" } } } }
            ]).toArray();

            if (stats.length > 0) {
                metrics.averageScore = stats[0].avgScore;
                metrics.maxScore = stats[0].maxScore;
            }
        }

        // Get collection stats
        const collectionStats = await collection.stats();
        metrics.collectionSize = collectionStats.size;
        metrics.totalDocuments = collectionStats.count;

        res.status(200).json({
            result: documents,
            metrics,
            searchQuery: query,
            note: 'Text search requires text indexes on fields. Use create-index to add text indexes.'
        });

    } catch (error) {
        console.error('Text search error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'text-search',
            note: 'Text search requires text indexes. Create a text index first.'
        });
    }
}
