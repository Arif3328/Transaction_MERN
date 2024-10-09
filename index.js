import express from 'express';
import axios from 'axios';
import Product from './models/Product.js';
import connectDB from './config.js';
import cors from 'cors';
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use(cors())

// Route to initialize the database with data from the third-party API
app.get('/initialize-db', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        // Insert data into MongoDB
        await Product.insertMany(products);
        res.status(200).json({ message: 'Database initialized with seed data' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Failed to initialize the database' });
    }
});
// // API to get all the transaction 
// app.get('/getAllData', async (req, res) => {

//     try {
//         const response = await Product.find();
//         res.status(200).json({ data: response });
//     } catch (error) {
//         console.error('Error initializing database:', error);
//         res.status(500).json({ error: 'Failed to initialize the database' });
//     }
// });


app.get('/getAllData', async (req, res) => {
    // Extract query parameters for pagination, search, and month
    const { page = 1, perPage = 10, search = '', month } = req.query;

    // Initialize query object
    let query = {};

    // Build search query: search in title, description, and price
    if (search) {
        const priceSearch = parseFloat(search); // Convert search input to number for price comparison
        query = {
            $or: [
                { title: new RegExp(search, 'i') },              // Search in title (case-insensitive)
                { description: new RegExp(search, 'i') },        // Search in description (case-insensitive)
                { price: priceSearch || { $exists: true } }      // Search in price if search is a valid number
            ]
        };
    }

    // Filter by month: match the date regardless of the year
    if (month) {
        query.dateOfSale = new RegExp(`-${month.padStart(2, '0')}-`); // Match the month, formatted to two digits (e.g., "03" for March)
    }

    try {
        // Fetch transactions with pagination and the constructed query
        const transactions = await Product.find(query)
            .skip((page - 1) * perPage) // Skip to the correct page
            .limit(parseInt(perPage));  // Limit the results to `perPage` items

        // Count total number of matching records for pagination
        const totalRecords = await Product.countDocuments(query);

        // Return the paginated response
        res.status(200).json({
            transactions,               // Data for the current page
            currentPage: parseInt(page), // Current page
            perPage: parseInt(perPage),  // Items per page
            totalPages: Math.ceil(totalRecords / perPage), // Total number of pages
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});


// API to list all transactions with pagination and search
app.get('/transactions', async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;

    // Build query based on search and month filters
    let query = {};
    if (search) {
        query = {
            $or: [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { price: parseInt(search) || { $exists: true } },
            ],
        };
    }
    // Filter transactions based on month
    if (month) {
        query.dateOfSale = new RegExp(`-${month}-`);
    }

    try {
        // Fetch transactions from the database with pagination
        const transactions = await Product.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        // Count total records for pagination
        const totalRecords = await Product.countDocuments(query);

        // Send paginated transactions along with total record count
        res.json({
            transactions,
            currentPage: parseInt(page),
            perPage: parseInt(perPage),
            totalPages: Math.ceil(totalRecords / perPage),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});


// API to get statistics
app.get('/statistics', async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: new RegExp(`-${month}-`) };

    try {
        const totalSales = await Product.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$price' } } }]);
        const soldItems = await Product.countDocuments({ ...query, sold: true });
        const unsoldItems = await Product.countDocuments({ ...query, sold: false });

        res.json({
            totalSales: totalSales[0]?.total || 0,
            soldItems,
            unsoldItems,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching statistics' });
    }
});

// API for bar chart (price range distribution)
app.get('/price-range', async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: new RegExp(`-${month}-`) };

    try {
        const priceRange = await Product.aggregate([
            { $match: query },
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                    default: '901+',
                    output: { count: { $sum: 1 } },
                }
            },
        ]);

        res.json(priceRange);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching price range' });
    }
});

// API for pie chart (category distribution)
app.get('/category-distribution', async (req, res) => {
    const { month } = req.query;
    const query = { dateOfSale: new RegExp(`-${month}-`) };

    try {
        const categories = await Product.aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching category distribution' });
    }
});

// Combined API
app.get('/combined-data', async (req, res) => {
    const { month } = req.query;

    try {
        const transactions = await Product.find({ dateOfSale: new RegExp(`-${month}-`) });
        const statistics = await app.get('/statistics', { month });
        const priceRange = await app.get('/price-range', { month });
        const categories = await app.get('/category-distribution', { month });

        res.json({
            transactions,
            statistics,
            priceRange,
            categories,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching combined data' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
