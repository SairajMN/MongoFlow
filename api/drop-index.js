const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const indexName = req.body;

        // Validate input
        if (typeof indexName !== 'string' || !indexName.trim()) {
            return res.status(400).json({
                error: 'Invalid index name. Must be a non-empty string.',
                example: '"age_index"'
            });
        }

        // Prevent dropping the default _id_ index
        if (indexName === '_id_') {
            return res.status(400).json({
                error: 'Cannot drop the default _id_ index.',
                note: 'The _id_ index is required and cannot be removed.'
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Check if index exists
        const indexes = await collection.indexes();
        const indexExists = indexes.some(idx => idx.name === indexName);

        if (!indexExists) {
            return res.status(404).json({
                error: `Index '${indexName}' not found.`,
                availableIndexes: indexes.map(idx => idx.name)
            });
        }

        // Track metrics
        const metrics = {
            operation: 'drop-index',
            collection: 'demo_collection',
            indexName: indexName
        };

        // Drop index
        const result = await collection.dropIndex(indexName);

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.indexDropped = result.ok === 1;

        // List remaining indexes
        const remainingIndexes = await collection.indexes();
        metrics.remainingIndexes = remainingIndexes.length;
        metrics.indexDetails = remainingIndexes.map(idx => ({
            name: idx.name,
            key: idx.key
        }));

        res.status(200).json({
            result: `Index '${indexName}' dropped successfully`,
            metrics,
            remainingIndexes: remainingIndexes
        });

    } catch (error) {
        console.error('Drop index error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'drop-index'
        });
    }
}
