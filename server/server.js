const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock data for simplicity
const fetchTransactionData = async () => {
  const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  return response.data;
};

// Helper function to get month from date string
const getMonthFromDate = (dateStr) => {
  const [year, month] = dateStr.split('-');
  return new Date(year, month - 1).toLocaleString('default', { month: 'long' });
};

// Route to get all transactions with search and pagination
app.get('/transactions', async (req, res) => {
  const { month, search = '', page = 1, perPage = 10 } = req.query;
  const data = await fetchTransactionData();
  
  const filteredByMonth = data.filter(item => getMonthFromDate(item.dateOfSale) === month);

  const searchLower = search.toLowerCase();
  const filteredTransactions = filteredByMonth.filter(transaction => 
    transaction.title.toLowerCase().includes(searchLower) ||
    transaction.description.toLowerCase().includes(searchLower) ||
    transaction.price.toString().includes(searchLower)
  );

  const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredTransactions.length / perPage);

  res.json({ transactions: paginatedTransactions, totalPages });
});

// Route to get statistics
app.get('/transactions/statistics', async (req, res) => {
  const { month } = req.query;
  const data = await fetchTransactionData();

  const filteredByMonth = data.filter(item => getMonthFromDate(item.dateOfSale) === month);
  
  const totalSales = filteredByMonth.reduce((total, transaction) => total + transaction.price, 0);
  const soldItems = filteredByMonth.filter(transaction => transaction.sold).length;
  const notSoldItems = filteredByMonth.filter(transaction => !transaction.sold).length;

  res.json({ totalSales, soldItems, notSoldItems });
});

// Route to get price range data for the bar chart
app.get('/transactions/price-ranges', async (req, res) => {
  const { month } = req.query;
  const data = await fetchTransactionData();

  const filteredByMonth = data.filter(item => getMonthFromDate(item.dateOfSale) === month);

  const ranges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: Infinity }
  ];

  const counts = ranges.map(range => ({
    range: `${range.min} - ${range.max === Infinity ? 'above 900' : range.max}`,
    count: filteredByMonth.filter(item => item.price >= range.min && item.price <= range.max).length
  }));

  res.json(counts);
});

// Route to get category data for the pie chart
app.get('/transactions/categories', async (req, res) => {
  const { month } = req.query;
  const data = await fetchTransactionData();

  const filteredByMonth = data.filter(item => getMonthFromDate(item.dateOfSale) === month);

  const categoryCounts = filteredByMonth.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(categoryCounts).map(category => ({
    category,
    count: categoryCounts[category]
  }));

  res.json(categories);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
