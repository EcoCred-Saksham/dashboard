import React, { useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';
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
  const [apiResult, setApiResult] = useState(null);
  const [pred, setPred] = useState(true);

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

      if (formattedResult.length >= 2) {
        const val1 = Number(formattedResult[formattedResult.length - 2]);
        const val2 = Number(formattedResult[formattedResult.length - 1]);
        await predictApi(val1, val2);
      } else {
        throw new Error('Not enough data to make an API request');
      }
    } catch (err) {
      console.error('Error:', err); // Log the error for debugging
      setError(err.message);
    }
    setLoading(false);
  };

  const predictApi = async (val1, val2) => {
    try {
      const response = await axios.post('https://swach-ml-api.onrender.com/predict', {
        val1: val1.toString(),
        val2: val2.toString(),
      });

      console.log('API response:', response.data);
      setApiResult(response.data);
    } catch (err) {
      console.error('API Error:', err);
      setError('Prediction Fetched Successfully!');
    }
  };

  const chartData = data.map((value, index) => ({
    index,
    value: Number(value),
  }));

  return (
    <div>
      <h1 className='text-3xl font-extrabold'>Enter your Wallet ID</h1>
      <input
      className='border-double b border-4 border-s-orange-100 px-1 rounded-sm m-4'
        type="text"
        placeholder="Enter ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button className='bg-green-600 rounded-md shadow-md px-2 text-center text-white' onClick={fetchData} disabled={loading}>
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

      {apiResult && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Prediction Result</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 border font-bold">Year Ahead</th>
                  <th className="px-4 py-2 border font-bold">Prediction</th>
                </tr>
              </thead>
              <tbody>
                {apiResult.prediction.map((value, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-4 py-2">{index} Year Ahead</td>
                    <td className="border px-4 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
