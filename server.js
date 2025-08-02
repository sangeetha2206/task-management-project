const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Add tasks
app.post('/tasks', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('taskManagement');
        const collection = database.collection('tasks');
        const tasks = req.body; // Expecting an array of tasks
        const result = await collection.insertMany(tasks);
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
        const database = client.db('taskManagement');
        const collection = database.collection('tasks');
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
    const assignedTo = req.params.name;
    try {
        await client.connect();
        const database = client.db('taskManagement');
        const collection = database.collection('tasks');
        const tasksForMember = await collection.find({ assignedTo }).toArray();
        res.json(tasksForMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

// Delete tasks by status
app.delete('/tasks/status/:status', async (req, res) => {
    const status = req.params.status;
    try {
        await client.connect();
        const database = client.db('taskManagement');
        const collection = database.collection('tasks');
        const result = await collection.deleteMany({ status });
        res.json({ deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
