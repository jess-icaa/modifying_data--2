const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3010;

const MenuItem = require('./schema.js');

app.use(express.static('static'));
app.use(bodyParser.json());

mongoose
.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err.message));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (err) {
    res.status(500).json({ error: `Error fetching menu items: ${err.message}`});
  }
});

app.post('/menu', async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are requried.' });
  }

  try {
    const newMenuItem = new MenuItem({ name, description, price });
    await newMenuItem.save();
    res.status(201).json(newMenuItem);
  } catch (err) {
    res.status(500).json({ error: `Error creating menu item: ${err.message}` });
  }
});

app.put('/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  if (!name && !description && !price) {
    return res.status(400).json({ error: 'At least one field (name, description, price) is required to update.' });
  }

  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      id, 
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    if(!updatedMenuItem) {
      return res.status(400).json({ error: 'Menu item not found' });
    }

    res.status(200).json(updatedMenuItem);
  } catch (err) {
    res.status(500).json({ error: `Error updating menu item: ${err.message}`});
  }
});

app.delete('/menu/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMenuItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found. '});
    }

    res.status(200).json({ message: 'menu item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: `Error deleting menu item: ${err.message}`});
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

