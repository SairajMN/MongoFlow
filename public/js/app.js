// MongoFlow Studio - Frontend JavaScript

class MongoFlowStudio {
    constructor() {
        this.currentTab = 'playground';
        this.flowStep = 0;
        this.flowSteps = [
            'User Input',
            'JSON Validation',
            'Operation Selection',
            'API Request',
            'Backend Processing',
            'Input Validation',
            'Database Connection',
            'MongoDB Operation',
            'BSON Conversion',
            'Index Lookup/Update',
            'Query Execution',
            'Result Processing',
            'Metrics Collection',
            'Response Formatting',
            'Response Returned'
        ];
        this.monacoEditor = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupCanvas();
        this.setupMonacoEditor();
        this.loadSampleData();
        this.initTutorial();
    }

    setupMonacoEditor() {
        const container = document.getElementById('jsonInput');

        // Load Monaco Editor
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

        require(['vs/editor/editor.main'], () => {
            this.monacoEditor = monaco.editor.create(container, {
                value: '',
                language: 'json',
                theme: 'vs-dark',
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true
            });

            // Update placeholder when operation changes
            this.updateInputPlaceholder();
        });
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Execute button
        document.getElementById('executeBtn').addEventListener('click', () => this.executeOperation());

        // Operation change
        document.getElementById('operation').addEventListener('change', () => this.updateInputPlaceholder());

        // Load sample data
        document.getElementById('loadSampleBtn').addEventListener('click', () => this.loadSampleData());
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;

        if (tabName === 'visualizer') {
            this.animateFlow();
        }
    }

    updateInputPlaceholder() {
        const operation = document.getElementById('operation').value;

        const placeholders = {
            insert: `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "department": "Engineering"
}`,
            'bulk-insert': `[
  {
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]`,
            find: `{
  "age": {
    "$gte": 25
  }
}`,
            'find-advanced': `{
  "filter": {
    "age": {
      "$gte": 25
    }
  },
  "options": {
    "sort": {
      "age": -1
    },
    "limit": 10
  }
}`,
            update: `{
  "filter": {
    "name": "John Doe"
  },
  "update": {
    "$set": {
      "age": 31,
      "department": "Senior Engineering"
    }
  }
}`,
            delete: `{
  "name": "John Doe"
}`,
            aggregate: `[
  {
    "$match": {
      "age": {
        "$gte": 25
      }
    }
  },
  {
    "$group": {
      "_id": "$department",
      "count": {
        "$sum": 1
      },
      "avgAge": {
        "$avg": "$age"
      }
    }
  }
]`,
            'text-search': `{
  "$text": {
    "$search": "engineer"
  },
  "score": {
    "$meta": "textScore"
  }
}`,
            'create-index': `{
  "name": "age_index",
  "key": {
    "age": 1
  },
  "options": {
    "unique": false
  }
}`,
            'list-indexes': `{}`,
            'drop-index': `"age_index"`,
            'validate-schema': `{
  "document": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "email": { "type": "string" },
      "age": { "type": "number", "minimum": 0 }
    },
    "required": ["name", "email"]
  }
}`,
            'change-stream': `{
  "collection": "demo_collection",
  "filter": {
    "operationType": "insert"
  }
}`,
            'query-cost': `{
  "query": {
    "age": { "$gte": 25 }
  },
  "operation": "find"
}`,
            'wiredtiger-metrics': `{}`,
            'schema-insights': `{}`
        };

        if (this.monacoEditor) {
            this.monacoEditor.setValue(placeholders[operation] || '{}');
            // Format the document
            setTimeout(() => {
                this.monacoEditor.getAction('editor.action.formatDocument').run();
            }, 100);
        }
    }

    async executeOperation() {
        const operation = document.getElementById('operation').value;
        const input = this.monacoEditor ? this.monacoEditor.getValue().trim() : '';

        if (!input) {
            this.showError('💡 Please enter JSON input first. Use the dropdown examples or check the placeholder text for guidance.');
            return;
        }

        // Validate JSON syntax
        let data;
        try {
            data = JSON.parse(input);
        } catch (parseError) {
            this.showError(`❌ Invalid JSON syntax: ${parseError.message}\n\n💡 Tip: Check for missing commas, quotes, or brackets.`);
            return;
        }

        // Basic validation based on operation type
        const validationError = this.validateInput(operation, data);
        if (validationError) {
            this.showError(validationError);
            return;
        }

        try {
            this.setLoading(true);
            this.updateStatus('Validating input...', 10);

            // Start flow animation
            this.flowStep = 0;
            this.animateFlow();

            this.updateStatus('Sending request to server...', 30);

            // Make API request
            const response = await this.makeAPIRequest(operation, data);

            this.updateStatus('Processing results...', 80);

            // Display results
            this.displayResults(response);

            this.updateStatus('Complete!', 100);

            // Complete flow animation
            this.flowStep = this.flowSteps.length - 1;
            this.animateFlow();

        } catch (error) {
            this.showError(error.message);
            this.updateStatus('Error occurred', 0, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    validateInput(operation, data) {
        switch (operation) {
            case 'insert':
                if (typeof data !== 'object' || Array.isArray(data)) {
                    return '❌ Insert operation expects a single document object, not an array.\n\nExample: {"name": "John", "age": 30}';
                }
                if (Object.keys(data).length === 0) {
                    return '❌ Document cannot be empty. Add at least one field.';
                }
                break;

            case 'bulk-insert':
                if (!Array.isArray(data)) {
                    return '❌ Bulk insert expects an array of documents.\n\nExample: [{"name": "John"}, {"name": "Jane"}]';
                }
                if (data.length === 0) {
                    return '❌ Array cannot be empty. Add at least one document.';
                }
                for (let i = 0; i < data.length; i++) {
                    if (typeof data[i] !== 'object' || Array.isArray(data[i])) {
                        return `❌ Document at index ${i} must be an object, not an array.`;
                    }
                }
                break;

            case 'find':
            case 'delete':
                if (typeof data !== 'object') {
                    return `❌ ${operation} operation expects a query object.\n\nExample: {"age": {"$gte": 25}}`;
                }
                break;

            case 'update':
                if (typeof data !== 'object' || !data.filter || !data.update) {
                    return '❌ Update operation expects an object with "filter" and "update" fields.\n\nExample: {"filter": {"name": "John"}, "update": {"$set": {"age": 31}}}';
                }
                break;

            case 'aggregate':
                if (!Array.isArray(data)) {
                    return '❌ Aggregation expects an array of pipeline stages.\n\nExample: [{"$match": {"age": {"$gte": 25}}}]';
                }
                break;

            case 'drop-index':
                if (typeof data !== 'string') {
                    return '❌ Drop index expects a string index name.\n\nExample: "age_index"';
                }
                break;

            case 'validate-schema':
                if (typeof data !== 'object' || !data.document || !data.schema) {
                    return '❌ Schema validation expects an object with "document" and "schema" fields.\n\nExample: {"document": {"name": "John"}, "schema": {"type": "object", "required": ["name"]}}';
                }
                break;

            case 'change-stream':
                if (typeof data !== 'object') {
                    return '❌ Change stream expects an object with optional "collection" and "filter" fields.\n\nExample: {"collection": "demo_collection", "filter": {"operationType": "insert"}}';
                }
                break;

            case 'query-cost':
                if (typeof data !== 'object' || !data.query) {
                    return '❌ Query cost analysis expects an object with "query" and optional "operation" fields.\n\nExample: {"query": {"age": {"$gte": 25}}, "operation": "find"}';
                }
                break;

            case 'wiredtiger-metrics':
            case 'schema-insights':
                if (typeof data !== 'object') {
                    return `❌ ${operation.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} expects an empty object or specific parameters.\n\nExample: {}`;
                }
                break;
        }
        return null; // No validation errors
    }

    async makeAPIRequest(operation, data) {
        const endpoints = {
            insert: '/api/insert',
            'bulk-insert': '/api/bulk-insert',
            find: '/api/find',
            'find-advanced': '/api/find-advanced',
            update: '/api/update',
            delete: '/api/delete',
            aggregate: '/api/aggregate',
            'text-search': '/api/text-search',
            'create-index': '/api/create-index',
            'list-indexes': '/api/list-indexes',
            'drop-index': '/api/drop-index',
            'validate-schema': '/api/validate-schema',
            'change-stream': '/api/change-stream',
            'query-cost': '/api/query-cost',
            'wiredtiger-metrics': '/api/wiredtiger-metrics',
            'schema-insights': '/api/schema-insights'
        };

        const response = await fetch(endpoints[operation], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Provide more user-friendly error messages
            let errorMessage = responseData.error || `HTTP ${response.status}: ${response.statusText}`;

            if (errorMessage.includes('MongoDB connection not configured')) {
                errorMessage = '🚨 Database not connected! Please check your MongoDB setup. See README for instructions.';
            } else if (errorMessage.includes('Database connection failed')) {
                errorMessage = '🚨 Cannot connect to MongoDB. Check your connection string and network.';
            } else if (errorMessage.includes('Invalid input')) {
                errorMessage = `❌ Invalid input format. Please check your JSON syntax and try again.\n\n${responseData.example ? 'Example: ' + JSON.stringify(responseData.example, null, 2) : ''}`;
            }

            throw new Error(errorMessage);
        }

        return responseData;
    }

    displayResults(response) {
        const resultOutput = document.getElementById('resultOutput');
        const metricsDiv = document.getElementById('metrics');

        // Display results
        resultOutput.textContent = JSON.stringify(response.result || response, null, 2);

        // Display metrics
        if (response.metrics) {
            metricsDiv.innerHTML = Object.entries(response.metrics)
                .map(([key, value]) => `<div class="metric-item"><span>${key}:</span><span>${value}</div>`)
                .join('');
        } else {
            metricsDiv.innerHTML = '<div class="metric-item">No metrics available</div>';
        }
    }

    showError(message) {
        document.getElementById('resultOutput').textContent = `Error: ${message}`;
        document.getElementById('metrics').innerHTML = '';
    }

    setLoading(loading) {
        const btn = document.getElementById('executeBtn');
        btn.disabled = loading;
        btn.textContent = loading ? 'Executing...' : 'Execute Operation';

        // Add/remove executing animation class
        if (loading) {
            btn.classList.add('executing');
        } else {
            btn.classList.remove('executing');
        }

        // Update status indicator
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const progressFill = document.getElementById('progressFill');

        if (loading) {
            statusIndicator.className = 'status-processing';
            statusText.textContent = 'Processing your request...';
            progressFill.style.width = '30%';
        } else {
            statusIndicator.className = 'status-success';
            statusText.textContent = 'Ready to execute operations';
            progressFill.style.width = '100%';
            setTimeout(() => {
                progressFill.style.width = '0%';
            }, 1000);
        }
    }

    updateStatus(message, progress = 0, type = 'processing') {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const progressFill = document.getElementById('progressFill');

        statusIndicator.className = `status-${type}`;
        statusText.textContent = message;
        progressFill.style.width = `${progress}%`;
    }

    setupCanvas() {
        this.canvas = document.getElementById('flowCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    animateFlow() {
        if (this.currentTab !== 'visualizer') return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const steps = this.flowSteps;
        const stepHeight = this.canvas.height / steps.length;
        const currentTime = Date.now();
        const pulseSpeed = 0.005;

        steps.forEach((step, index) => {
            const y = index * stepHeight + stepHeight / 2;
            const isActive = index <= this.flowStep;
            const isCurrent = index === this.flowStep;

            // Pulsing effect for current step
            let radius = 20;
            if (isCurrent) {
                radius = 20 + Math.sin(currentTime * pulseSpeed) * 5;
            }

            // Draw circle with gradient
            const gradient = this.ctx.createRadialGradient(100, y, 0, 100, y, radius);
            if (isActive) {
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#5a67d8');
            } else {
                gradient.addColorStop(0, '#ddd');
                gradient.addColorStop(1, '#bbb');
            }

            this.ctx.beginPath();
            this.ctx.arc(100, y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.strokeStyle = isActive ? '#667eea' : '#aaa';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw animated data flow particles
            if (isActive && index < this.flowStep) {
                const particleCount = 3;
                for (let p = 0; p < particleCount; p++) {
                    const particleY = y + (p - 1) * 10;
                    const particleX = 100 + Math.sin(currentTime * 0.01 + p) * 15;

                    this.ctx.beginPath();
                    this.ctx.arc(particleX, particleY, 3, 0, 2 * Math.PI);
                    this.ctx.fillStyle = '#667eea';
                    this.ctx.fill();
                }
            }

            // Draw animated arrow
            if (index < steps.length - 1) {
                const nextY = (index + 1) * stepHeight + stepHeight / 2;
                const arrowProgress = isActive ? 1 : 0;

                // Arrow shaft
                this.ctx.beginPath();
                this.ctx.moveTo(140, y);
                this.ctx.lineTo(140, y + (nextY - y) * arrowProgress);
                this.ctx.strokeStyle = isActive ? '#667eea' : '#aaa';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();

                // Animated arrow head
                if (isActive) {
                    const headY = y + (nextY - y) * arrowProgress;
                    this.ctx.beginPath();
                    this.ctx.moveTo(130, headY - 10);
                    this.ctx.lineTo(150, headY - 10);
                    this.ctx.lineTo(140, headY + 10);
                    this.ctx.closePath();
                    this.ctx.fillStyle = '#667eea';
                    this.ctx.fill();
                }
            }

            // Draw text with shadow
            this.ctx.fillStyle = isActive ? '#333' : '#aaa';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(step, 170, y + 5);
            this.ctx.shadowBlur = 0; // Reset shadow
        });

        // Update flow step info with timing
        const currentStepText = steps[this.flowStep] || 'Idle';
        const elapsedTime = this.flowStep > 0 ? `${this.flowStep * 1000}ms` : '';
        document.getElementById('flowStep').textContent = `${currentStepText}${elapsedTime ? ` (${elapsedTime})` : ''}`;

        // Animate to next step if not complete
        if (this.flowStep < steps.length - 1) {
            setTimeout(() => {
                this.flowStep++;
                this.animateFlow();
            }, 1000);
        } else if (this.flowStep === steps.length - 1) {
            // Add completion animation
            setTimeout(() => {
                this.showCompletionEffect();
            }, 2000);
        }
    }

    showCompletionEffect() {
        if (this.currentTab !== 'visualizer') return;

        const steps = this.flowSteps;
        const stepHeight = this.canvas.height / steps.length;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Draw completion burst
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * 100;
            const y = centerY + Math.sin(angle) * 100;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#28a745';
            this.ctx.fill();
        }

        // Draw success message
        this.ctx.fillStyle = '#28a745';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✅ Operation Complete!', centerX, centerY - 50);
        this.ctx.textAlign = 'start';
    }

    async loadSampleData(autoLoad = false) {
        const sampleType = document.getElementById('sampleData').value;
        if (!sampleType && !autoLoad) return;

        const sampleDatasets = {
            users: [
                { name: "Alice Johnson", email: "alice@example.com", age: 28, department: "Engineering", skills: ["JavaScript", "React"], salary: 75000, hireDate: new Date("2020-03-15") },
                { name: "Bob Smith", email: "bob@example.com", age: 32, department: "Marketing", skills: ["SEO", "Content"], salary: 65000, hireDate: new Date("2019-08-20") },
                { name: "Charlie Brown", email: "charlie@example.com", age: 25, department: "Engineering", skills: ["Python", "Django"], salary: 70000, hireDate: new Date("2021-01-10") },
                { name: "Diana Prince", email: "diana@example.com", age: 30, department: "HR", skills: ["Recruiting", "Training"], salary: 60000, hireDate: new Date("2018-11-05") },
                { name: "Eve Wilson", email: "eve@example.com", age: 27, department: "Engineering", skills: ["Java", "Spring"], salary: 72000, hireDate: new Date("2020-07-22") },
                { name: "Frank Miller", email: "frank@example.com", age: 35, department: "Sales", skills: ["Negotiation", "CRM"], salary: 55000, hireDate: new Date("2017-05-30") },
                { name: "Grace Lee", email: "grace@example.com", age: 29, department: "Engineering", skills: ["Node.js", "MongoDB"], salary: 78000, hireDate: new Date("2019-12-01") }
            ],
            products: [
                { name: "Laptop Pro", price: 1299.99, category: "Electronics", stock: 50, rating: 4.5 },
                { name: "Wireless Headphones", price: 199.99, category: "Electronics", stock: 100, rating: 4.2 },
                { name: "Coffee Maker", price: 79.99, category: "Appliances", stock: 30, rating: 4.0 },
                { name: "Running Shoes", price: 129.99, category: "Sports", stock: 75, rating: 4.3 },
                { name: "Book: MongoDB Guide", price: 39.99, category: "Books", stock: 20, rating: 4.8 }
            ],
            orders: [
                { customerId: "user123", items: [{ productId: "prod1", quantity: 1 }, { productId: "prod2", quantity: 2 }], total: 1699.97, status: "completed", orderDate: new Date() },
                { customerId: "user456", items: [{ productId: "prod3", quantity: 1 }], total: 79.99, status: "pending", orderDate: new Date() },
                { customerId: "user789", items: [{ productId: "prod4", quantity: 1 }, { productId: "prod5", quantity: 1 }], total: 169.98, status: "shipped", orderDate: new Date() }
            ],
            logs: [
                { level: "INFO", message: "User login successful", timestamp: new Date(), userId: "user123", ip: "192.168.1.1" },
                { level: "ERROR", message: "Database connection failed", timestamp: new Date(), service: "auth", errorCode: "DB_CONN_ERROR" },
                { level: "WARN", message: "High memory usage detected", timestamp: new Date(), service: "web", memoryUsage: 85 },
                { level: "INFO", message: "Order processed successfully", timestamp: new Date(), orderId: "ord_12345", amount: 299.99 },
                { level: "DEBUG", message: "Cache hit for user profile", timestamp: new Date(), userId: "user456", cacheKey: "profile:user456" }
            ]
        };

        const btn = document.getElementById('loadSampleBtn');
        const originalText = btn.textContent;

        try {
            // Show loading animation
            btn.classList.add('loading');
            btn.textContent = autoLoad ? 'Loading sample data...' : 'Loading...';
            this.setLoading(true);

            const data = sampleDatasets[sampleType];

            // Insert sample data
            const response = await fetch('/api/bulk-insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const successMessage = `🎉 Successfully loaded ${data.length} sample ${sampleType} documents!`;
                document.getElementById('resultOutput').textContent = successMessage;
                document.getElementById('resultOutput').className = 'success sample-loaded';

                // Add success animation
                document.getElementById('resultOutput').classList.add('success-animation');

                // Show interactive hint
                if (autoLoad) {
                    this.showInteractiveHint('Great! Sample data loaded. Try executing the operation above!', document.getElementById('executeBtn'));
                }

                if (!autoLoad) {
                    document.getElementById('sampleData').value = '';
                }
            } else {
                throw new Error('Failed to load sample data');
            }
        } catch (error) {
            this.showError(`❌ Error loading sample data: ${error.message}`);
            document.getElementById('resultOutput').className = 'error';
        } finally {
            this.setLoading(false);
            btn.classList.remove('loading');
            btn.textContent = originalText;
        }
    }

    initTutorial() {
        // Tutorial functionality will be added here
        this.tutorialData = {
            basics: {
                title: "MongoDB Basics",
                content: `
                    <h3>🎯 What is MongoDB?</h3>
                    <p>MongoDB is a <strong>document-oriented NoSQL database</strong> that stores data in flexible, JSON-like documents. Unlike traditional relational databases, MongoDB doesn't require a fixed schema.</p>

                    <h3>📄 Documents</h3>
                    <p>Documents are the basic unit of data in MongoDB. They're similar to JSON objects:</p>
                    <div class="operation-examples">
                        <pre><code>{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "skills": ["JavaScript", "React", "Node.js"]
}</code></pre>
                    </div>

                    <h3>📁 Collections</h3>
                    <p>Collections are groups of documents, similar to tables in relational databases. Documents in the same collection don't need to have the same fields.</p>

                    <h3>🏗️ Databases</h3>
                    <p>Databases contain collections. A MongoDB server can host multiple databases.</p>

                    <div class="operation-help">
                        <h4>💡 Key Concepts to Remember:</h4>
                        <ul>
                            <li><strong>Documents</strong> = JSON-like objects with fields and values</li>
                            <li><strong>Collections</strong> = Groups of related documents</li>
                            <li><strong>Databases</strong> = Containers for collections</li>
                            <li><strong>Flexible Schema</strong> = Documents can have different fields</li>
                        </ul>
                    </div>
                `,
                nextAction: () => this.switchTab('playground')
            },
            crud: {
                title: "CRUD Operations",
                content: `
                    <h3>🔧 CRUD Operations</h3>
                    <p>CRUD stands for Create, Read, Update, Delete - the four basic operations for managing data.</p>

                    <h4>📝 Create (Insert)</h4>
                    <p>Add new documents to a collection:</p>
                    <div class="operation-examples">
                        <pre><code>db.users.insertOne({
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28
})</code></pre>
                    </div>

                    <h4>📖 Read (Find)</h4>
                    <p>Query documents from a collection:</p>
                    <div class="operation-examples">
                        <pre><code>// Find all users
db.users.find({})

// Find users older than 25
db.users.find({ "age": { "$gt": 25 } })

// Find one user by name
db.users.findOne({ "name": "Alice Johnson" })</code></pre>
                    </div>

                    <h4>✏️ Update</h4>
                    <p>Modify existing documents:</p>
                    <div class="operation-examples">
                        <pre><code>// Update a specific field
db.users.updateOne(
  { "name": "Alice Johnson" },
  { "$set": { "age": 29 } }
)

// Increment a value
db.users.updateOne(
  { "name": "Alice Johnson" },
  { "$inc": { "loginCount": 1 } }
)</code></pre>
                    </div>

                    <h4>🗑️ Delete</h4>
                    <p>Remove documents from a collection:</p>
                    <div class="operation-examples">
                        <pre><code>// Delete one document
db.users.deleteOne({ "name": "Alice Johnson" })

// Delete all documents matching criteria
db.users.deleteMany({ "age": { "$lt": 18 } })</code></pre>
                    </div>

                    <div class="operation-help">
                        <h4>🎯 Try it yourself!</h4>
                        <p>Switch to the Playground tab and try these operations with the sample data.</p>
                        <button onclick="switchToPlaygroundAndLoadUsers()" class="learn-btn" style="margin-top: 1rem;">Try CRUD Operations</button>
                    </div>
                `,
                nextAction: () => this.switchTab('playground')
            },
            queries: {
                title: "Advanced Querying",
                content: `
                    <h3>🔍 Query Operators</h3>
                    <p>MongoDB provides powerful query operators for complex searches:</p>

                    <h4>Comparison Operators</h4>
                    <div class="operation-examples">
                        <pre><code>// Greater than
{ "age": { "$gt": 25 } }

// Less than or equal
{ "age": { "$lte": 30 } }

// In array
{ "department": { "$in": ["Engineering", "HR"] } }

// Between values
{ "age": { "$gte": 20, "$lte": 35 } }</code></pre>
                    </div>

                    <h4>Logical Operators</h4>
                    <div class="operation-examples">
                        <pre><code>// AND (implicit)
{ "age": { "$gte": 25 }, "department": "Engineering" }

// OR
{ "$or": [
  { "age": { "$lt": 25 } },
  { "department": "Management" }
] }

// AND with OR
{ "age": { "$gte": 25 },
  "$or": [
    { "department": "Engineering" },
    { "department": "HR" }
  ]
}</code></pre>
                    </div>

                    <h4>Array Operators</h4>
                    <div class="operation-examples">
                        <pre><code>// Array contains element
{ "skills": { "$in": ["JavaScript"] } }

// Array size
{ "skills": { "$size": 3 } }

// Element match
{ "projects": {
  "$elemMatch": {
    "name": "Web App",
    "status": "completed"
  }
}}</code></pre>
                    </div>

                    <h4>Regular Expressions</h4>
                    <div class="operation-examples">
                        <pre><code>// Pattern matching
{ "email": { "$regex": "@company\\.com$" } }

// Case-insensitive search
{ "name": { "$regex": "^john", "$options": "i" } }</code></pre>
                    </div>

                    <div class="operation-help">
                        <h4>💡 Pro Tips:</h4>
                        <ul>
                            <li>Use dot notation for nested fields: <code>{"user.address.city": "New York"}</code></li>
                            <li>Combine multiple conditions with logical operators</li>
                            <li>Use <code>$exists</code> to check if a field exists</li>
                            <li>Regular expressions are powerful but can be slow - consider text indexes</li>
                        </ul>
                    </div>
                `,
                nextAction: () => this.switchTab('playground')
            },
            aggregation: {
                title: "Aggregation Framework",
                content: `
                    <h3>📊 Aggregation Pipeline</h3>
                    <p>The aggregation framework processes data through a series of stages in a pipeline:</p>

                    <h4>Common Pipeline Stages</h4>
                    <div class="operation-examples">
                        <pre><code>db.sales.aggregate([
  // Stage 1: Filter documents
  { "$match": { "status": "completed" } },

  // Stage 2: Group and calculate
  { "$group": {
    "_id": "$category",
    "totalSales": { "$sum": "$amount" },
    "avgRating": { "$avg": "$rating" },
    "count": { "$sum": 1 }
  }},

  // Stage 3: Sort results
  { "$sort": { "totalSales": -1 } },

  // Stage 4: Limit output
  { "$limit": 5 }
])</code></pre>
                    </div>

                    <h4>📈 Grouping Examples</h4>
                    <div class="operation-examples">
                        <pre><code>// Group by department
{
  "$group": {
    "_id": "$department",
    "employeeCount": { "$sum": 1 },
    "avgAge": { "$avg": "$age" },
    "maxSalary": { "$max": "$salary" }
  }
}

// Group by multiple fields
{
  "$group": {
    "_id": {
      "department": "$department",
      "year": { "$year": "$hireDate" }
    },
    "count": { "$sum": 1 }
  }
}</code></pre>
                    </div>

                    <h4>🔧 Data Transformation</h4>
                    <div class="operation-examples">
                        <pre><code>// Add computed fields
{ "$addFields": {
  "fullName": {
    "$concat": ["$firstName", " ", "$lastName"]
  },
  "ageInMonths": { "$multiply": ["$age", 12] }
}}

// Reshape documents
{ "$project": {
  "name": 1,
  "department": 1,
  "salaryRange": {
    "$cond": {
      "if": { "$gte": ["$salary", 100000] },
      "then": "High",
      "else": {
        "$cond": {
          "if": { "$gte": ["$salary", 50000] },
          "then": "Medium",
          "else": "Low"
        }
      }
    }
  }
}}</code></pre>
                    </div>

                    <div class="operation-help">
                        <h4>🚀 Advanced Features:</h4>
                        <ul>
                            <li><strong>$lookup</strong> - Join data from other collections</li>
                            <li><strong>$unwind</strong> - Deconstruct arrays into separate documents</li>
                            <li><strong>$facet</strong> - Run multiple aggregation pipelines in one</li>
                            <li><strong>$graphLookup</strong> - Perform graph traversals</li>
                        </ul>
                    </div>
                `,
                nextAction: () => this.switchTab('playground')
            },
            indexing: {
                title: "Performance & Indexing",
                content: `
                    <h3>⚡ Database Performance</h3>
                    <p>Indexes are special data structures that improve query performance by allowing MongoDB to quickly locate documents.</p>

                    <h4>📇 Single Field Index</h4>
                    <div class="operation-examples">
                        <pre><code>// Create index on age field
db.users.createIndex({ "age": 1 })

// Create index on email (unique)
db.users.createIndex(
  { "email": 1 },
  { "unique": true }
)</code></pre>
                    </div>

                    <h4>🔗 Compound Index</h4>
                    <div class="operation-examples">
                        <pre><code>// Index on multiple fields
db.users.createIndex({
  "department": 1,
  "age": -1
})

// Index for sorting
db.products.createIndex({
  "category": 1,
  "price": 1,
  "rating": -1
})</code></pre>
                    </div>

                    <h4>🔍 Text Index</h4>
                    <div class="operation-examples">
                        <pre><code>// Create text index for search
db.articles.createIndex({
  "title": "text",
  "content": "text"
})

// Search with text index
db.articles.find({
  "$text": {
    "$search": "database performance"
  }
})</code></pre>
                    </div>

                    <h4>📊 Index Management</h4>
                    <div class="operation-examples">
                        <pre><code>// List all indexes
db.users.getIndexes()

// Drop specific index
db.users.dropIndex("age_1")

// Drop all indexes
db.users.dropIndexes()</code></pre>
                    </div>

                    <div class="operation-help">
                        <h4>💡 Index Best Practices:</h4>
                        <ul>
                            <li>Create indexes for frequently queried fields</li>
                            <li>Use compound indexes for multi-field queries</li>
                            <li>Consider sort order in compound indexes</li>
                            <li>Monitor index usage with <code>explain()</code></li>
                            <li>Don't over-index - each index uses memory and slows writes</li>
                        </ul>
                    </div>
                `,
                nextAction: () => this.switchTab('playground')
            },
            advanced: {
                title: "Advanced Features",
                content: `
                    <h3>🔬 Advanced MongoDB Features</h3>
                    <p>Explore powerful MongoDB capabilities available in the Playground!</p>

                    <h4>📝 Schema Validation</h4>
                    <p>Enforce document structure and data types to maintain data quality:</p>
                    <div class="operation-examples">
                        <pre><code>// Try in Playground: Select "Schema Validation"
{
  "document": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  "schema": {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
      "name": { "type": "string" },
      "email": { "type": "string" },
      "age": { "type": "number", "minimum": 0 }
    }
  }
}</code></pre>
                    </div>

                    <h4>🔄 Change Streams</h4>
                    <p>Monitor real-time database changes (perfect for reactive applications):</p>
                    <div class="operation-examples">
                        <pre><code>// Try in Playground: Select "Change Streams"
{
  "collection": "demo_collection",
  "filter": {
    "operationType": "insert"
  }
}</code></pre>
                    </div>

                    <h4>⚡ Query Cost Analysis</h4>
                    <p>Analyze query performance and execution plans:</p>
                    <div class="operation-examples">
                        <pre><code>// Try in Playground: Select "Query Cost Analysis"
{
  "query": {
    "age": { "$gte": 25 }
  },
  "operation": "find"
}</code></pre>
                    </div>

                    <h4>📊 WiredTiger Metrics</h4>
                    <p>Monitor MongoDB's storage engine performance:</p>
                    <div class="operation-examples">
                        <pre><code>// Try in Playground: Select "WiredTiger Metrics"
{}</code></pre>
                    </div>

                    <h4>🔍 Schema Insights</h4>
                    <p>Automatically analyze your data schema patterns:</p>
                    <div class="operation-examples">
                        <pre><code>// Try in Playground: Select "Schema Insights"
{}</code></pre>
                    </div>

                    <div class="operation-help">
                        <h4>🎯 What You'll Learn:</h4>
                        <ul>
                            <li><strong>Schema Validation</strong> - Ensure data quality and consistency</li>
                            <li><strong>Change Streams</strong> - Build reactive, real-time applications</li>
                            <li><strong>Performance Analysis</strong> - Optimize queries and understand execution</li>
                            <li><strong>Storage Engine Metrics</strong> - Monitor database performance</li>
                            <li><strong>Schema Analysis</strong> - Understand your data structure automatically</li>
                        </ul>

                        <div class="tutorial-note" style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <strong>💡 Beginner Tip:</strong> Start with Schema Validation - it's like defining rules for your data, ensuring only valid information gets stored!
                        </div>
                    </div>
                `,
                nextAction: () => this.switchTab('playground')
            }
        };
    }

    showTutorial(concept) {
        const tutorialContent = document.getElementById('tutorial-content');
        const tutorial = this.tutorialData[concept];

        if (tutorial) {
            tutorialContent.innerHTML = `
                <div class="tutorial-lesson">
                    <h2>${tutorial.title}</h2>
                    ${tutorial.content}
                    <div style="margin-top: 2rem; text-align: center;">
                        <button onclick="app.tryInPlayground('${concept}')" class="learn-btn tryit-btn">🚀 Try It Now</button>
                    </div>
                </div>
            `;
        }
    }

    tryInPlayground(concept) {
        // Switch to playground tab
        this.switchTab('playground');

        // Map tutorial concepts to appropriate sample datasets
        const conceptToSampleMap = {
            basics: 'users',
            crud: 'users',
            queries: 'users',
            aggregation: 'products',
            indexing: 'users',
            advanced: 'logs'
        };

        const sampleType = conceptToSampleMap[concept] || 'users';

        // Load the appropriate sample data
        setTimeout(() => {
            document.getElementById('sampleData').value = sampleType;
            this.loadSampleData();

            // Set appropriate operation based on concept
            const operationMap = {
                basics: 'find',
                crud: 'find',
                queries: 'find-advanced',
                aggregation: 'aggregate',
                indexing: 'find',
                advanced: 'find'
            };

            if (operationMap[concept]) {
                document.getElementById('operation').value = operationMap[concept];
                this.updateInputPlaceholder();
            }

            // Show welcome message
            this.showWelcomeMessage(concept);
        }, 500); // Small delay to ensure tab switch is complete
    }

    showWelcomeMessage(concept) {
        const messages = {
            basics: "Welcome to the Playground! Sample user data has been loaded. Try finding all documents with an empty query {}.",
            crud: "CRUD operations ready! Sample users loaded. Try inserting a new user or updating an existing one.",
            queries: "Advanced querying enabled! Use the 'Find (with options)' to explore query operators like $gt, $in, etc.",
            aggregation: "Aggregation pipeline ready! Sample product data loaded. Try grouping by category to see totals.",
            indexing: "Indexing demo ready! Sample users loaded. Try creating an index on the 'age' field first.",
            advanced: "Advanced features unlocked! Try Schema Validation first - it's like defining rules for your data quality!"
        };

        if (messages[concept]) {
            // Create welcome message element
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.textContent = `🎯 ${messages[concept]}`;
            welcomeDiv.style.animation = 'slideIn 0.8s ease';

            // Insert at the top of the result panel
            const resultPanel = document.querySelector('.result-panel');
            resultPanel.insertBefore(welcomeDiv, resultPanel.firstChild);

            // Remove after 8 seconds
            setTimeout(() => {
                if (welcomeDiv.parentNode) {
                    welcomeDiv.remove();
                }
            }, 8000);
        }
    }

    showInteractiveHint(message, targetElement) {
        // Remove existing hints
        const existingHints = document.querySelectorAll('.hint-bubble');
        existingHints.forEach(hint => hint.remove());

        // Create hint bubble
        const hint = document.createElement('div');
        hint.className = 'hint-bubble';
        hint.textContent = message;

        // Position near target element
        const rect = targetElement.getBoundingClientRect();
        hint.style.left = (rect.left + rect.width / 2) + 'px';
        hint.style.top = (rect.top - 50) + 'px';

        document.body.appendChild(hint);

        // Show hint
        setTimeout(() => hint.classList.add('show'), 100);

        // Remove after 5 seconds
        setTimeout(() => {
            hint.classList.remove('show');
            setTimeout(() => hint.remove(), 300);
        }, 5000);
    }
}

// Global function for tutorial buttons
function showTutorial(concept) {
    if (window.app) {
        window.app.showTutorial(concept);
    }
}

function switchToPlaygroundAndLoadUsers() {
    if (window.app) {
        window.app.switchTab('playground');
        // Load users sample data
        document.getElementById('sampleData').value = 'users';
        window.app.loadSampleData();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MongoFlowStudio();
});
