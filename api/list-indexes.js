const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'list-indexes',
            collection: 'demo_collection'
        };

        // Get all indexes
        const indexes = await collection.indexes();

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.totalIndexes = indexes.length;

        // Analyze indexes
        const analysis = indexes.map(index => ({
            name: index.name,
            key: index.key,
            unique: index.unique || false,
            sparse: index.sparse || false,
            background: index.background || false,
            version: index.v || 'N/A'
        }));

        metrics.indexAnalysis = analysis;
        metrics.defaultIndex = analysis.find(idx => idx.name === '_id_');
        metrics.customIndexes = analysis.filter(idx => idx.name !== '_id_');

        // Get collection stats
        const stats = await collection.stats();
        metrics.collectionSize = stats.size;
        metrics.totalDocuments = stats.count;

        res.status(200).json({
            result: indexes,
            metrics,
            indexSummary: {
                total: analysis.length,
                default: metrics.defaultIndex ? 1 : 0,
                custom: metrics.customIndexes.length,
                unique: analysis.filter(idx => idx.unique).length
            }
        });

    } catch (error) {
        console.error('List indexes error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'list-indexes'
        });
    }
}
