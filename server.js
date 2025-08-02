const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual MongoDB Atlas URI
const uri = 'mongodb+srv://sangeethamagesh062004:sangeetha8144@cluster0.ei021qz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add tasks
app.post('/tasks', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('taskManagement').collection('tasks');
        const result = await collection.insertMany(req.body);
        res.status(201).json({ insertedCount: result.insertedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

// Get task count by status
app.get('/tasks/status', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('taskManagement').collection('tasks');
        const statusCount = await collection.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();
        res.json(statusCount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

// Get tasks assigned to a specific member
app.get('/tasks/assignedTo/:name', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('taskManagement').collection('tasks');
        const tasksForMember = await collection.find({ assignedTo: req.params.name }).toArray();
        res.json(tasksForMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

// Delete tasks by status
app.delete('/tasks/status/:status', async (req, res) => {
    try {
        await client.connect();
        const collection = client.db('taskManagement').collection('tasks');
        const result = await collection.deleteMany({ status: req.params.status });
        res.json({ deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
