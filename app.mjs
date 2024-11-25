import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
const PORT = 3005;

dotenv.config(); // Load environment variables

const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));


// Example route to test database connection
app.get('/dbTest', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT CURDATE()');
        res.send(rows);
    } catch (error) {
        res.status(500).send('Database connection failed.');
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Root Route
app.get('/', async (req, res) => {
    const [authors] = await conn.query('SELECT authorId, firstName, lastName FROM q_authors');
    res.render('index', { authors });
});

// Search by Keyword
app.get('/searchByKeyword', async (req, res) => {
    const keyword = `%${req.query.keyword}%`;
    const [rows] = await conn.query(
        `SELECT quote, firstName, lastName FROM q_quotes 
         NATURAL JOIN q_authors 
         WHERE quote LIKE ?`,
        [keyword]
    );
    res.render('results', { quotes: rows });
});

// Search by Author
app.get('/searchByAuthor', async (req, res) => {
    const authorId = req.query.authorId;
    const [rows] = await conn.query(
        `SELECT quote, firstName, lastName FROM q_quotes 
         NATURAL JOIN q_authors 
         WHERE authorId = ?`,
        [authorId]
    );
    res.render('results', { quotes: rows });
});

// Local API for Author Info
app.get('/api/author/:id', async (req, res) => {
    const authorId = req.params.id;
    const [rows] = await conn.query(`SELECT * FROM q_authors WHERE authorId = ?`, [authorId]);
    res.json(rows[0]);
});
