import React, { useState } from 'react';
import Web3 from 'web3';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Replace with your contract address and Infura project ID
const CONTRACT_ADDRESS = '0xDf0544702106ceD00505Ff1fEb7D6Cb0912eEbfC';
const INFURA_PROJECT_ID = '7397550ad411423f8fe36a339dfda5a5';

// Initialize Web3 with Infura provider
const web3 = new Web3(`https://polygon-amoy.infura.io/v3/${INFURA_PROJECT_ID}`);

// ABI for the smart contract
const ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "data",
        "type": "uint256"
      }
    ],
    "name": "addData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getData",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

const App = () => {
  const [id, setId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (!id) throw new Error('ID cannot be empty');
      const parsedId = web3.utils.toBigInt(id); // Convert ID to BigNumber
      const result = await contract.methods.getData(parsedId).call();
      const formattedResult = result.map(value => web3.utils.toBigInt(value));
      
      console.log('Contract response:', formattedResult); // Log the response for debugging
      setData(formattedResult);
    } catch (err) {
      console.error('Error:', err); // Log the error for debugging
      setError(err.message);
    }
    setLoading(false);
  };

  const chartData = data.map((value, index) => ({
    index,
    value: Number(value),
  }));

  return (
    <div>
      <h1>Fetch Data from Smart Contract</h1>
      <input
        type="text"
        placeholder="Enter ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {error && <p>Error: {error}</p>}
      
      <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Index</th>
                <th className="px-4 py-2 border">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((value, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{index}</td>
                  <td className="border px-4 py-2">{value.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;
