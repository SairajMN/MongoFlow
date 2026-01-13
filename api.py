from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pymongo
import os
from datetime import datetime, timedelta
import threading
import time
import json
from pymongo.errors import PyMongoError
import jsonschema
from jsonschema import validate, ValidationError
from dotenv import load_dotenv
import ipaddress

# Load environment variables
load_dotenv('.env.local')

# IP Whitelist configuration based on MongoDB Atlas settings
ALLOWED_IPS = [
    '223.186.135.30/32',  # Specific IP from the task
    '0.0.0.0/0'          # Allow all IPs (includes current IP as noted)
]

def is_ip_allowed(client_ip):
    """Check if client IP is in allowed list"""
    try:
        client_addr = ipaddress.ip_address(client_ip)
        for allowed_cidr in ALLOWED_IPS:
            if client_addr in ipaddress.ip_network(allowed_cidr, strict=False):
                return True
        return False
    except ValueError:
        # Invalid IP address
        return False

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# Rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# IP Whitelist middleware for API routes
@app.before_request
def check_ip_whitelist():
    # Skip IP check for static files and root route
    if request.path == '/' or request.path.startswith('/css/') or request.path.startswith('/js/'):
        return

    # Only check API routes
    if request.path.startswith('/api/'):
        client_ip = get_remote_address()
        if not is_ip_allowed(client_ip):
            return jsonify({
                'error': 'Access denied. Your IP address is not whitelisted.',
                'clientIP': client_ip,
                'allowedIPs': ALLOWED_IPS
            }), 403

# MongoDB Atlas connection
MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = os.getenv('DB_NAME', 'mongoflow_demo')

client = None
db = None

def connect_to_database():
    global client, db
    if not client:
        if not MONGODB_URI:
            raise Exception('MongoDB connection not configured. Please set MONGODB_URI environment variable.')

        try:
            # Connect with TLS enabled for MongoDB Atlas
            client = pymongo.MongoClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                tls=True
            )
            db = client[DB_NAME]
            # Test connection
            client.admin.command('ping')
            print('Connected to MongoDB Atlas')
        except PyMongoError as e:
            print(f'MongoDB connection failed: {e}')
            raise Exception(f'Database connection failed: {e}')
    return db

# Auto-reset database (clear collections periodically)
def reset_database():
    try:
        db = connect_to_database()
        collections = db.list_collection_names()
        for collection_name in collections:
            db[collection_name].delete_many({})
        print('Database reset completed')
    except Exception as e:
        print(f'Error resetting database: {e}')

# Start auto-reset thread
def start_auto_reset():
    def auto_reset_worker():
        while True:
            time.sleep(1800000)  # 30 minutes
            reset_database()

    reset_thread = threading.Thread(target=auto_reset_worker, daemon=True)
    reset_thread.start()

# Initialize auto-reset on startup
start_auto_reset()

@app.route('/')
def serve_index():
    return send_from_directory('public', 'index.html')

@app.route('/api/insert', methods=['POST'])
@limiter.limit("10 per minute")
def insert_document():
    try:
        start_time = datetime.now()
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid JSON input'}), 400

        db = connect_to_database()
        collection = db.demo_collection

        # Track metrics
        metrics = {
            'operation': 'insert',
            'collection': 'demo_collection'
        }

        # Perform insert
        if isinstance(data, list):
            result = collection.insert_many(data)
            metrics['documentsInserted'] = len(data)
        else:
            result = collection.insert_one(data)
            metrics['documentsInserted'] = 1

        # Calculate execution time
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time

        # Get collection stats
        stats = db.command('collStats', 'demo_collection')
        metrics['collectionSize'] = stats.get('size', 0)
        metrics['documentCount'] = stats.get('count', 0)

        return jsonify({
            'result': result.raw_result if hasattr(result, 'raw_result') else str(result.inserted_id),
            'metrics': metrics,
            'bsonConversion': 'JSON → BSON completed',
            'indexUpdates': 'Indexes updated automatically'
        })

    except Exception as e:
        print(f'Insert error: {e}')
        return jsonify({
            'error': str(e),
            'operation': 'insert'
        }), 500

@app.route('/api/bulk-insert', methods=['POST'])
@limiter.limit("5 per minute")
def bulk_insert():
    try:
        start_time = datetime.now()
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({'error': 'Bulk insert expects an array of documents'}), 400

        if len(data) == 0:
            return jsonify({'error': 'Array cannot be empty'}), 400

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'bulk-insert',
            'collection': 'demo_collection',
            'documentsInserted': len(data)
        }

        result = collection.insert_many(data)

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time

        stats = db.command('collStats', 'demo_collection')
        metrics['collectionSize'] = stats.get('size', 0)
        metrics['documentCount'] = stats.get('count', 0)

        return jsonify({
            'result': {
                'acknowledged': result.acknowledged,
                'insertedCount': len(result.inserted_ids),
                'insertedIds': [str(id) for id in result.inserted_ids]
            },
            'metrics': metrics,
            'bulkInsertComplete': 'Documents inserted successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/find', methods=['POST'])
def find_documents():
    try:
        start_time = datetime.now()
        query = request.get_json()

        if not isinstance(query, dict):
            return jsonify({'error': 'Invalid query format'}), 400

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'find',
            'collection': 'demo_collection'
        }

        result = list(collection.find(query))

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['documentsFound'] = len(result)

        return jsonify({
            'result': result,
            'metrics': metrics,
            'queryExecuted': 'Find operation completed'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/find-advanced', methods=['POST'])
def find_advanced():
    try:
        start_time = datetime.now()
        data = request.get_json()

        if not isinstance(data, dict) or 'filter' not in data:
            return jsonify({'error': 'Advanced find expects filter object'}), 400

        filter_query = data['filter']
        options = data.get('options', {})

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'find-advanced',
            'collection': 'demo_collection'
        }

        cursor = collection.find(filter_query)

        # Apply options
        if 'sort' in options:
            cursor = cursor.sort(options['sort'])
        if 'limit' in options:
            cursor = cursor.limit(options['limit'])
        if 'skip' in options:
            cursor = cursor.skip(options['skip'])
        if 'projection' in options:
            cursor = cursor.project(options['projection'])

        result = list(cursor)

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['documentsFound'] = len(result)

        return jsonify({
            'result': result,
            'metrics': metrics,
            'advancedQueryComplete': 'Advanced find operation completed'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update', methods=['POST'])
def update_documents():
    try:
        start_time = datetime.now()
        data = request.get_json()

        if not isinstance(data, dict) or 'filter' not in data or 'update' not in data:
            return jsonify({'error': 'Update expects filter and update objects'}), 400

        filter_query = data['filter']
        update_doc = data['update']

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'update',
            'collection': 'demo_collection'
        }

        result = collection.update_many(filter_query, update_doc)

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['documentsModified'] = result.modified_count
        metrics['documentsMatched'] = result.matched_count

        return jsonify({
            'result': result.raw_result,
            'metrics': metrics,
            'updateComplete': 'Update operation completed'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete', methods=['POST'])
def delete_documents():
    try:
        start_time = datetime.now()
        query = request.get_json()

        if not isinstance(query, dict):
            return jsonify({'error': 'Invalid delete query'}), 400

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'delete',
            'collection': 'demo_collection'
        }

        result = collection.delete_many(query)

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['documentsDeleted'] = result.deleted_count

        return jsonify({
            'result': result.raw_result,
            'metrics': metrics,
            'deleteComplete': 'Delete operation completed'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/aggregate', methods=['POST'])
def aggregate():
    try:
        start_time = datetime.now()
        pipeline = request.get_json()

        if not isinstance(pipeline, list):
            return jsonify({
                'error': 'Invalid aggregation pipeline. Must be an array of stages.',
                'example': [
                    {'$match': {'status': 'active'}},
                    {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
                ]
            }), 400

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'aggregate',
            'collection': 'demo_collection',
            'pipelineStages': len(pipeline)
        }

        result = list(collection.aggregate(pipeline))

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['documentsOutput'] = len(result)

        # Get aggregation explain
        try:
            explain_result = collection.aggregate(pipeline).explain()
            if 'stages' in explain_result:
                metrics['stagesExecuted'] = len(explain_result['stages'])
        except:
            pass

        stats = db.command('collStats', 'demo_collection')
        metrics['collectionSize'] = stats.get('size', 0)
        metrics['totalDocuments'] = stats.get('count', 0)

        return jsonify({
            'result': result,
            'metrics': metrics,
            'pipelineExecuted': pipeline,
            'aggregationComplete': 'Pipeline executed successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/text-search', methods=['POST'])
def text_search():
    try:
        start_time = datetime.now()
        data = request.get_json()

        if not isinstance(data, dict) or '$text' not in data:
            return jsonify({'error': 'Text search requires $text operator'}), 400

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'text-search',
            'collection': 'demo_collection'
        }

        # Add text score if not present
        if 'score' not in data:
            data['score'] = {'$meta': 'textScore'}

        result = list(collection.find(data).sort([('score', {'$meta': 'textScore'})]))

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['documentsFound'] = len(result)

        return jsonify({
            'result': result,
            'metrics': metrics,
            'textSearchComplete': 'Text search completed'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-index', methods=['POST'])
def create_index():
    try:
        start_time = datetime.now()
        data = request.get_json()

        if not isinstance(data, dict) or 'key' not in data:
            return jsonify({'error': 'Index creation requires key specification'}), 400

        index_name = data.get('name', '')
        key = data['key']
        options = data.get('options', {})

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'create-index',
            'collection': 'demo_collection'
        }

        if index_name:
            options['name'] = index_name

        result = collection.create_index(key, **options)

        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        metrics['executionTimeMs'] = execution_time
        metrics['indexName'] = result

        return jsonify({
            'result': result,
            'metrics': metrics,
            'indexCreated': 'Index created successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/list-indexes', methods=['POST'])
def list_indexes():
    try:
        db = connect_to_database()
        collection = db.demo_collection

        indexes = list(collection.list_indexes())

        return jsonify({
            'result': indexes,
            'indexCount': len(indexes),
            'listIndexesComplete': 'Indexes listed successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drop-index', methods=['POST'])
def drop_index():
    try:
        index_name = request.get_json()

        if not isinstance(index_name, str):
            return jsonify({'error': 'Index name must be a string'}), 400

        db = connect_to_database()
        collection = db.demo_collection

        metrics = {
            'operation': 'drop-index',
            'collection': 'demo_collection',
            'indexName': index_name
        }

        result = collection.drop_index(index_name)

        return jsonify({
            'result': result,
            'metrics': metrics,
            'indexDropped': 'Index dropped successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Schema validation endpoint
@app.route('/api/validate-schema', methods=['POST'])
@limiter.limit("20 per minute")
def validate_schema():
    try:
        data = request.get_json()

        if not isinstance(data, dict) or 'document' not in data or 'schema' not in data:
            return jsonify({'error': 'Schema validation requires document and schema fields'}), 400

        document = data['document']
        schema = data['schema']

        try:
            validate(instance=document, schema=schema)
            return jsonify({
                'valid': True,
                'message': 'Document validates against schema successfully'
            })
        except ValidationError as e:
            return jsonify({
                'valid': False,
                'error': str(e.message),
                'path': str(e.absolute_path) if e.absolute_path else None
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Change streams endpoint (simplified for demo)
change_stream_connections = {}

@app.route('/api/change-stream', methods=['POST'])
@limiter.limit("5 per minute")
def change_stream():
    try:
        data = request.get_json()
        collection_name = data.get('collection', 'demo_collection')

        db = connect_to_database()
        collection = db[collection_name]

        # Create change stream (in production, this would be WebSocket-based)
        pipeline = []
        if 'filter' in data:
            pipeline.append({'$match': data['filter']})

        # For demo purposes, we'll simulate change stream by watching recent changes
        # In production, use WebSocket for real-time updates
        changes = list(collection.watch(pipeline, max_await_time_ms=1000))

        return jsonify({
            'changes': [{'operationType': change['operationType'], 'documentKey': change.get('documentKey')} for change in changes[:10]],  # Limit for demo
            'changeStreamActive': True,
            'collection': collection_name
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# WiredTiger metrics endpoint
@app.route('/api/wiredtiger-metrics', methods=['GET'])
@limiter.limit("10 per minute")
def wiredtiger_metrics():
    try:
        db = connect_to_database()

        # Get WiredTiger storage statistics
        server_status = db.command('serverStatus')

        wiredtiger_stats = server_status.get('wiredTiger', {})

        # Get collection-specific WiredTiger stats
        collection_stats = db.command('collStats', 'demo_collection')

        metrics = {
            'wiredTiger': {
                'cache': wiredtiger_stats.get('cache', {}),
                'connection': wiredtiger_stats.get('connection', {}),
                'dataHandle': wiredtiger_stats.get('data-handle', {}),
                'log': wiredtiger_stats.get('log', {}),
                'session': wiredtiger_stats.get('session', {}),
                'threadState': wiredtiger_stats.get('thread-state', {}),
                'transaction': wiredtiger_stats.get('transaction', {})
            },
            'collection': {
                'wiredTigerSize': collection_stats.get('wiredTiger', {}).get('size', 0),
                'wiredTigerCreationString': collection_stats.get('wiredTiger', {}).get('creationString', ''),
                'wiredTigerURI': collection_stats.get('wiredTiger', {}).get('uri', '')
            }
        }

        return jsonify({
            'metrics': metrics,
            'wiredTigerMetricsRetrieved': 'Storage engine metrics collected successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Query cost analyzer
@app.route('/api/query-cost', methods=['POST'])
@limiter.limit("10 per minute")
def query_cost():
    try:
        data = request.get_json()

        if not isinstance(data, dict) or 'query' not in data:
            return jsonify({'error': 'Query cost analysis requires query field'}), 400

        query = data['query']
        operation = data.get('operation', 'find')

        db = connect_to_database()
        collection = db.demo_collection

        cost_analysis = {}

        if operation == 'find':
            # Explain the find query
            explain_result = collection.find(query).explain()
            cost_analysis = {
                'executionStats': explain_result.get('executionStats', {}),
                'queryPlanner': explain_result.get('queryPlanner', {}),
                'serverInfo': explain_result.get('serverInfo', {})
            }
        elif operation == 'aggregate':
            # Explain aggregation pipeline
            pipeline = query if isinstance(query, list) else [query]
            explain_result = collection.aggregate(pipeline).explain()
            cost_analysis = {
                'executionStats': explain_result.get('executionStats', {}),
                'queryPlanner': explain_result.get('queryPlanner', {}),
                'serverInfo': explain_result.get('serverInfo', {})
            }

        return jsonify({
            'costAnalysis': cost_analysis,
            'queryCostAnalyzed': 'Query cost analysis completed'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Schema insight engine
@app.route('/api/schema-insights', methods=['GET'])
@limiter.limit("20 per minute")
def schema_insights():
    try:
        db = connect_to_database()
        collection = db.demo_collection

        # Sample documents to analyze schema
        sample_docs = list(collection.find().limit(100))

        if not sample_docs:
            return jsonify({
                'insights': {},
                'message': 'No documents found for schema analysis'
            })

        # Analyze schema patterns
        insights = {
            'totalDocuments': len(sample_docs),
            'fieldAnalysis': {},
            'dataTypes': {},
            'nestedFields': {},
            'arrayFields': {},
            'estimatedSchema': {}
        }

        field_types = {}
        field_counts = {}

        for doc in sample_docs:
            analyze_document(doc, field_types, field_counts, '')

        # Process field analysis
        for field, types in field_types.items():
            insights['fieldAnalysis'][field] = {
                'types': list(types.keys()),
                'frequency': types,
                'coverage': field_counts[field] / len(sample_docs) * 100
            }

        return jsonify({
            'insights': insights,
            'schemaInsightsGenerated': 'Schema analysis completed successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def analyze_document(doc, field_types, field_counts, prefix):
    if isinstance(doc, dict):
        for key, value in doc.items():
            field_path = f"{prefix}.{key}" if prefix else key

            if field_path not in field_types:
                field_types[field_path] = {}
                field_counts[field_path] = 0

            type_name = type(value).__name__
            field_types[field_path][type_name] = field_types[field_path].get(type_name, 0) + 1
            field_counts[field_path] += 1

            # Recursively analyze nested objects
            if isinstance(value, (dict, list)):
                analyze_document(value, field_types, field_counts, field_path)

    elif isinstance(doc, list):
        for item in doc:
            analyze_document(item, field_types, field_counts, prefix)

if __name__ == '__main__':
    app.run(debug=True)
