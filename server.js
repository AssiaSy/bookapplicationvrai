const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Assy776992920@',
  database: 'books_db'
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create books table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      published_year INT,
      genre VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createTableQuery, err => {
    if (err) {
      console.error('Error creating books table:', err);
      return;
    }
    console.log('Books table created or already exists');
    
    // Add some sample data if table is empty
    db.query('SELECT COUNT(*) as count FROM books', (err, results) => {
      if (err) {
        console.error('Error checking for sample data:', err);
        return;
      }
      
      if (results[0].count === 0) {
        const sampleBooks = [
          { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', published_year: 1925, genre: 'Fiction', description: 'A story of wealth and the American Dream' },
          { title: 'To Kill a Mockingbird', author: 'Harper Lee', published_year: 1960, genre: 'Fiction', description: 'A novel about racial injustice in the American South' },
          { title: 'The Hobbit', author: 'J.R.R. Tolkien', published_year: 1937, genre: 'Fantasy', description: 'An adventure story set in Middle-earth' }
        ];
        
        sampleBooks.forEach(book => {
          db.query('INSERT INTO books (title, author, published_year, genre, description) VALUES (?, ?, ?, ?, ?)', 
            [book.title, book.author, book.published_year, book.genre, book.description],
            err => {
              if (err) console.error('Error inserting sample data:', err);
            }
          );
        });
        
        console.log('Sample data inserted');
      }
    });
  });
});

// API Routes

// Get all books
app.get('/api/books', (req, res) => {
  let query = 'SELECT * FROM books';
  const params = [];
  
  // Handle query parameters for filtering
  if (req.query.genre) {
    query += ' WHERE genre = ?';
    params.push(req.query.genre);
  }
  
  if (req.query.author) {
    query += params.length ? ' AND author LIKE ?' : ' WHERE author LIKE ?';
    params.push(`%${req.query.author}%`);
  }
  
  if (req.query.year) {
    query += params.length ? ' AND published_year = ?' : ' WHERE published_year = ?';
    params.push(parseInt(req.query.year));
  }
  
  // Add sorting
  if (req.query.sort) {
    const sortField = ['title', 'author', 'published_year'].includes(req.query.sort) 
      ? req.query.sort : 'title';
    const sortOrder = req.query.order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Failed to fetch books' });
    }
    res.json(results);
  });
});

// Get a single book by ID
app.get('/api/books/:id', (req, res) => {
  db.query('SELECT * FROM books WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching book:', err);
      return res.status(500).json({ error: 'Failed to fetch book' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(results[0]);
  });
});

// Create a new book
app.post('/api/books', (req, res) => {
  const { title, author, published_year, genre, description } = req.body;
  
  // Validate required fields
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  db.query(
    'INSERT INTO books (title, author, published_year, genre, description) VALUES (?, ?, ?, ?, ?)',
    [title, author, published_year, genre, description],
    (err, result) => {
      if (err) {
        console.error('Error creating book:', err);
        return res.status(500).json({ error: 'Failed to create book' });
      }
      
      res.status(201).json({
        id: result.insertId,
        title,
        author,
        published_year,
        genre,
        description
      });
    }
  );
});

// Update a book
app.put('/api/books/:id', (req, res) => {
  const { title, author, published_year, genre, description } = req.body;
  const id = req.params.id;
  
  // Validate required fields
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  db.query(
    'UPDATE books SET title = ?, author = ?, published_year = ?, genre = ?, description = ? WHERE id = ?',
    [title, author, published_year, genre, description, id],
    (err, result) => {
      if (err) {
        console.error('Error updating book:', err);
        return res.status(500).json({ error: 'Failed to update book' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      res.json({
        id: parseInt(id),
        title,
        author,
        published_year,
        genre,
        description
      });
    }
  );
});

// Delete a book
app.delete('/api/books/:id', (req, res) => {
  db.query('DELETE FROM books WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting book:', err);
      return res.status(500).json({ error: 'Failed to delete book' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});