document.getElementById("excelFile").addEventListener("change", handleFile, false);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = "Order Payments";
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return alert("Sheet 'Order Payments' not found!");

    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    renderTable(jsonData);
    calculateAnalytics(jsonData);
  };

  reader.readAsArrayBuffer(file);
}

function renderTable(data) {
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (data.length === 0) return;

  // Create table headers
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th");
    th.className = "border px-4 py-2 text-xs font-semibold";
    th.textContent = key;
    tableHead.appendChild(th);
  });

  // Fill table rows
  data.forEach((row) => {
    const tr = document.createElement("tr");
    Object.values(row).forEach((value) => {
      const td = document.createElement("td");
      td.className = "border px-4 py-2 text-sm";
      td.textContent = value;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function calculateAnalytics(data) {
  let totalOrders = 0;
  let totalPayout = 0;
  let totalReturns = 0;

  data.forEach((row) => {
    const status = row["Live Order Status"];
    const payout = parseFloat(row["Total Payout"].toString().replace(/[^0-9.-]+/g, "")) || 0;
    const quantity = parseInt(row["Quantity"], 10) || 1;

    if (status && status.toLowerCase() === "delivered") {
      totalOrders += quantity;
      totalPayout += payout;
    } else if (status && status.toLowerCase().includes("returned")) {
      totalReturns += 1;
    }
  });

  const returnRatio = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(2) : 0;

  document.getElementById("totalOrders").textContent = totalOrders;
  document.getElementById("totalPayout").textContent = `₹${totalPayout.toLocaleString()}`;
  document.getElementById("totalReturns").textContent = totalReturns;
  document.getElementById("returnRatio").textContent = `${returnRatio}%`;
}
