const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'A1B2C3d$',
  database: 'customerData'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(express.json());

app.get('/customers', (req, res) => {
  connection.query('SELECT id, Name, Mobno, JCNo, Model FROM customers', (error, results) => {
    if (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

app.post('/saveRemarks', (req, res) => {
  const { id, remarks, date } = req.body;
  console.log('Received data for saving remarks:', { id, remarks, date });
  if (!id || !remarks || !date) {
    res.status(400).json({ error: 'id, remarks, and date are required' });
    return;
  }
  
  connection.query('UPDATE customers SET Remarks = ?, Date = ? WHERE id = ?', [remarks, date, id], (error, results) => {
    if (error) {
      console.error('Error saving remarks:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    console.log('Remarks saved successfully for id:', id);
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
