import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    soldItems: 0,
    notSoldItems: 0
  });
  const [priceRanges, setPriceRanges] = useState([]);

  // Fetch transactions
  const fetchTransactions = async (month, searchTerm = '', page = 1) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/transactions?month=${month}&search=${searchTerm}&page=${page}&perPage=10`
      );
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async (month) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/transactions/statistics?month=${month}`
      );
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch price ranges data
  const fetchPriceRanges = async (month) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/transactions/price-ranges?month=${month}`
      );
      setPriceRanges(response.data);
    } catch (error) {
      console.error('Error fetching price ranges:', error);
    }
  };

  // Fetch data when the component mounts or the selected month changes
  useEffect(() => {
    fetchTransactions(selectedMonth);
    fetchStatistics(selectedMonth);
    fetchPriceRanges(selectedMonth);
  }, [selectedMonth]);

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchTransactions(selectedMonth, value, currentPage);
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const value = e.target.value;
    setSelectedMonth(value);
    setCurrentPage(1);
    fetchTransactions(value, searchTerm, 1);
    fetchStatistics(value);
    fetchPriceRanges(value);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTransactions(selectedMonth, searchTerm, nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const previousPage = currentPage - 1;
      setCurrentPage(previousPage);
      fetchTransactions(selectedMonth, searchTerm, previousPage);
    }
  };

  // Prepare data for the bar chart
  const barChartData = {
    labels: priceRanges.map(range => range.range),
    datasets: [
      {
        label: `Bar Charts - ${selectedMonth}`,
        data: priceRanges.map(range => range.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="App w-full pt-2">
      <div className='flex justify-center text-center'>
        <h1 className='font-bold text-2xl border p-10 bg-blue-100 rounded-full'>Transaction Dashboard</h1>
      </div>

      <div className='flex justify-evenly my-3'>
        {/* Input field for searching transactions */}
        <input
          className="bg-blue-100 rounded-[0.75rem] w-[15vw] p-[5px] text-slate-900"
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearch}
        />

        {/* Dropdown for selecting the month */}
        <select
          className="bg-blue-100 rounded-[0.75rem] w-[15vw] h-9 px-3 text-slate-400"
          value={selectedMonth} onChange={handleMonthChange} >
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      {/* Table for displaying transactions */}
      <div className='flex items-center justify-center'>
        <table className='border border-solid border-slate-900 w-[95vw]' cellPadding="10" cellSpacing="0">
          <thead className='border border-solid border-slate-900'>
            <tr>
              <th className='border border-solid border-slate-900'>ID</th>
              <th className='border border-solid border-slate-900'>Title</th>
              <th className='border border-solid border-slate-900'>Description</th>
              <th className='border border-solid border-slate-900'>Price</th>
              <th className='border border-solid border-slate-900'>Category</th>
              <th className='border border-solid border-slate-900'>Sold</th>
              <th className='border border-solid border-slate-900'>Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className='border border-solid border-slate-900'>{transaction.id}</td>
                  <td className='border border-solid border-slate-900'>{transaction.title}</td>
                  <td className='border border-solid border-slate-900'>{transaction.description}</td>
                  <td className='border border-solid border-slate-900'>{transaction.price}</td>
                  <td className='border border-solid border-slate-900'>{transaction.category}</td>
                  <td className='border border-solid border-slate-900'>{transaction.sold ? 'Yes' : 'No'}</td>
                  <td className='border border-solid border-slate-900'>
                    <img src={transaction.image} alt={transaction.title} width="50" height="50" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className='my-3 flex justify-between mx-10 max-w-[95vw] font-semibold'>
        <button 
          className='border border-solid border-slate-900 py-1 px-3 rounded-xl cursor-pointer bg-blue-100 text-slate-500'
          onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
        <button 
          className='border border-solid border-slate-900 py-1 px-3 rounded-xl cursor-pointer bg-blue-100 text-slate-500'
          onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* Statistics Display */}
      <div className='flex flex-col items-center justify-center'>
      <h2 className='font-bold text-2xl mt-5 mb-2'>Statistics - {selectedMonth}</h2>
      <div className='w-[25vw] border border-solid border-slate-900 rounded-xl p-7'>
        <div className='flex justify-between'>
          <h3>Total Sale Amount</h3>
          <p>${statistics.totalSales.toFixed(2)}</p>
        </div>

        <div className='flex justify-between'>
          <h3>Total Sold Items</h3>
          <p>{statistics.soldItems}</p>
        </div>

        <div className='flex justify-between'>
          <h3>Total Not Sold Items</h3>
          <p>{statistics.notSoldItems}</p>
        </div>
      </div>
      </div>

      {/* Bar Chart for price ranges */}
      <div className='mt-5 w-[90vw] m-auto'>
        <Bar data={barChartData} options={{responsive: true, maintainAspectRatio: false,}} />
      </div>
    </div>
  );
};

export default App;
