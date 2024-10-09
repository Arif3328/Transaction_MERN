import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Include the CSS file for styling

function App() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('03');  // Default to March
  const [search, setSearch] = useState('');  // Search state
  const [page, setPage] = useState(1);       // Pagination state
  const [totalPages, setTotalPages] = useState(1);  // Total number of pages

  // Fetch transactions for the selected month, page, and search
  useEffect(() => {
    axios.get(`http://localhost:5000/getAllData?month=${month}&page=${page}&search=${search}`)
      .then((response) => {
        console.log(response.data.data)
        setTransactions(response.data.data.transactions);
        setTotalPages(response.data.data.totalPages);  // Update total pages from API response
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  }, [month, page, search]);  // Re-fetch data when month, page, or search changes

  // Handle next page button click
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Handle previous page button click
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Handle search box clear
  const clearSearch = () => {
    setSearch('');
  };

  return (
    <div className="App">
      <h1>Transactions Table</h1>

      {/* Month Selection Dropdown */}
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by title, description, price"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={clearSearch}>Clear Search</button>

      {/* Transactions Table */}
      <table className="transactions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction._id}</td>
              <td><img src={transaction.image} alt={transaction.title} style={{ width: '50px', height: '50px' }} /></td>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.dateOfSale}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={prevPage} disabled={page === 1}>Previous</button>
        <span> Page {page} of {totalPages} </span>
        <button onClick={nextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default App;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function App() {
//   const [transactions, setTransactions] = useState([]);
//   const [month, setMonth] = useState('03');  // Default to March
//   const [search, setSearch] = useState('');  // Search state
//   const [page, setPage] = useState(1);       // Pagination state
//   const [totalPages, setTotalPages] = useState(1); // Total number of pages

//   // Fetch transactions for the selected month, page, and search
//   useEffect(() => {
//     axios.get(`http://localhost:5000/getAllData`)
//       .then((response) => {
//         console.log(response.data.data)
//         setTransactions(response.data.data);
//         setTotalPages(response.data.data.length);  // Update total pages
//       })
//       .catch((error) => {
//         console.error('Error fetching transactions:', error);
//       });
//   }, [month, page, search]);  // Trigger fetch when month, page, or search changes

//   // Handle next page button click
//   const nextPage = () => {
//     if (page < totalPages) {
//       setPage(page + 1);
//     }
//   };

//   // Handle previous page button click
//   const prevPage = () => {
//     if (page > 1) {
//       setPage(page - 1);
//     }
//   };

//   // Handle search box clear
//   const clearSearch = () => {
//     setSearch('');
//   };

//   return (
//     <div className="App">
//       <h1>Transactions Table</h1>

//       {/* Month Selection Dropdown */}
//       <select value={month} onChange={(e) => setMonth(e.target.value)}>
//         <option value="01">January</option>
//         <option value="02">February</option>
//         <option value="03">March</option>
//         <option value="04">April</option>
//         <option value="05">May</option>
//         <option value="06">June</option>
//         <option value="07">July</option>
//         <option value="08">August</option>
//         <option value="09">September</option>
//         <option value="10">October</option>
//         <option value="11">November</option>
//         <option value="12">December</option>
//       </select>

//       {/* Search Box */}
//       <input
//         type="text"
//         placeholder="Search by title, description, price"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />
//       <button onClick={clearSearch}>Clear Search</button>

//       {/* Transactions Table */}
//       <table>
//         <thead>
//           <tr>
//             <th>Title</th>
//             <th>Description</th>
//             <th>Price</th>
//             <th>Date of Sale</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((transaction) => (
//             <tr key={transaction._id}>
//               <td>{transaction.title}</td>
//               <td>{transaction.description}</td>
//               <td>{transaction.price}</td>
//               <td>{transaction.dateOfSale}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination Controls */}
//       <div className="pagination">
//         <button onClick={prevPage} disabled={page === 1}>Previous</button>
//         <span> Page {page} of {totalPages} </span>
//         <button onClick={nextPage} disabled={page === totalPages}>Next</button>
//       </div>
//     </div>
//   );
// }

// export default App;
