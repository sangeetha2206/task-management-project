const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Use environment variable in real apps for safety
const uri = 'mongodb+srv://sangeethamagesh062004:sangeetha8144@cluster0.ei021qz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let collection;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add tasks
app.post('/tasks', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: "Request body must be a JSON array" });
        }
        const result = await collection.insertMany(req.body);
        res.status(201).json({ insertedCount: result.insertedCount });
    } catch (error) {
        console.error("Insert error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Get task count by status
app.get('/tasks/status', async (req, res) => {
    try {
        const statusCount = await collection.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();
        res.json(statusCount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tasks for a member
app.get('/tasks/assignedTo/:name', async (req, res) => {
    try {
        const tasks = await collection.find({ assignedTo: req.params.name }).toArray();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete tasks by status
app.delete('/tasks/status/:status', async (req, res) => {
    try {
        const result = await collection.deleteMany({ status: req.params.status });
        res.json({ deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Connect to MongoDB Atlas once
async function startServer() {
    try {
        await client.connect();
        collection = client.db('taskManagement').collection('tasks');
        console.log('✅ Connected to MongoDB Atlas');

        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
}

startServer();
