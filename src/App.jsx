
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      processData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const processData = (rows) => {
    let totalProfit = 0;
    let totalOrders = rows.length;
    let returned = 0;
    const skuData = {};

    rows.forEach((row) => {
      const sku = row.SKU || row["SKU Name"] || "Unknown SKU";
      const sellingPrice = parseFloat(row["Selling Price"] || 0);
      const commission = parseFloat(row["Commission"] || 0);
      const logistics = parseFloat(row["Logistics Charges"] || 0);
      const settled = parseFloat(row["Amount Settled"] || 0);
      const isReturned = (row["Order Status"] || "").toLowerCase().includes("return");

      const profit = settled - commission - logistics;
      totalProfit += profit;

      if (isReturned) returned++;

      if (!skuData[sku]) {
        skuData[sku] = { orders: 0, profit: 0 };
      }

      skuData[sku].orders++;
      skuData[sku].profit += profit;
    });

    const skuArray = Object.entries(skuData).map(([sku, info]) => ({
      sku,
      orders: info.orders,
      profit: info.profit.toFixed(2),
    }));

    setData(skuArray);
    setSummary({
      totalProfit: totalProfit.toFixed(2),
      totalOrders,
      returnRatio: ((returned / totalOrders) * 100).toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">📊 Meesho Profit Calculator</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-6" />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">Total Orders: {summary.totalOrders}</div>
          <div className="bg-white p-4 rounded-xl shadow">Total Profit: ₹{summary.totalProfit}</div>
          <div className="bg-white p-4 rounded-xl shadow">Return Ratio: {summary.returnRatio}%</div>
        </div>
      )}

      {data.length > 0 && (
        <table className="w-full bg-white rounded-xl shadow text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">SKU</th>
              <th className="p-2">Orders</th>
              <th className="p-2">Profit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{item.sku}</td>
                <td className="p-2">{item.orders}</td>
                <td className="p-2">₹{item.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
