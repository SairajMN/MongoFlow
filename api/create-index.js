const { connectToDatabase } = require('./_db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        const { name, key, options = {} } = req.body;

        // Validate input
        if (!name || !key || typeof key !== 'object') {
            return res.status(400).json({
                error: 'Invalid index specification.',
                example: {
                    name: "age_index",
                    key: { age: 1 },
                    options: { unique: false, background: true }
                }
            });
        }

        const db = await connectToDatabase();
        const collection = db.collection('demo_collection');

        // Track metrics
        const metrics = {
            operation: 'create-index',
            collection: 'demo_collection',
            indexName: name
        };

        // Create index
        const result = await collection.createIndex(key, {
            name,
            ...options
        });

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        metrics.executionTimeMs = executionTime;
        metrics.indexCreated = result;

        // List all indexes after creation
        const indexes = await collection.indexes();
        metrics.totalIndexes = indexes.length;
        metrics.indexDetails = indexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            unique: idx.unique || false
        }));

        res.status(200).json({
            result: `Index '${name}' created successfully`,
            metrics,
            indexKey: key,
            indexOptions: options,
            allIndexes: indexes
        });

    } catch (error) {
        console.error('Create index error:', error);
        res.status(500).json({
            error: error.message,
            operation: 'create-index'
        });
    }
}
