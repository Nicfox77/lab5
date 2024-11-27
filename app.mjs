import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3005;

// Middleware
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Database Connection
const conn = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test Database Connection
app.get('/dbTest', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT CURDATE() AS today');
        res.send(rows[0].today);
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).send('Database connection failed');
    }
});

// Landing Page
app.get('/', async (req, res) => {
    try {
        let authorSql = `SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName`;
        let categorySql = `SELECT DISTINCT category FROM q_quotes ORDER BY category`;

        const [authors] = await conn.query(authorSql);
        const [categories] = await conn.query(categorySql);

        res.render('index', { authors: authors, categories: categories });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

// Search by Keyword
app.get('/searchByKeyword', async (req, res) => {
    let keyword = req.query.keyword;
    let sql = `SELECT authorId, firstName, lastName, quote
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE quote LIKE ?`;
    let sqlParams = [`%${keyword}%`];
    const [rows] = await conn.query(sql, sqlParams);
    res.render('results', { quotes: rows });
});

// Search by Author
app.get('/searchByAuthor', async (req, res) => {
    let userAuthorId = req.query.authorId;
    let sql = `SELECT authorId, quote, firstName, lastName, quote
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE q_quotes.authorId = ?`;
    let sqlParams = [userAuthorId];
    const [rows] = await conn.query(sql, sqlParams);
    console.log("Quotes Data:", rows);

    res.render('results', { quotes: rows });
});

// Search by Category
app.get('/searchByCategory', async (req, res) => {
    let userCategory = req.query.category;
    let sql = `SELECT authorId, quote, firstName, lastName, category
            FROM q_quotes
            NATURAL JOIN q_authors
            WHERE category = ?`;
    let sqlParams = [userCategory];
    const [rows] = await conn.query(sql, sqlParams);
    console.log("Quotes Data:", rows);

    res.render('results', { quotes: rows });
});

app.get('/api/author/:id', async (req, res) => {
    let authorId = req.params.id;
    let sql = `SELECT *
            FROM q_authors
            WHERE authorId = ?`;
    let [rows] = await conn.query(sql, [authorId]);
    console.log("Quotes Data:", rows);

    res.send(rows)
});


// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
