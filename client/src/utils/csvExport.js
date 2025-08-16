export function exportToCSV(transactions = [], filename = "export.csv") {
  if (!Array.isArray(transactions)) return;

  const pad = (n) => String(n).padStart(2, "0");
  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    return `${pad(date.getDate())}-${pad(
      date.getMonth() + 1
    )}-${date.getFullYear()}`;
  };

  const escapeCell = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    const escaped = s.replace(/"/g, '""');
    if (/[",\n\r]/.test(escaped)) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount",
    "Payment Method",
    "Description",
  ];

  const rows = transactions.map((tx) => {
    const date = formatDate(tx.date);
    const type = tx.type || "";
    const category = tx.category || "";
    const amount = tx.amount != null ? tx.amount : "";
    const paymentMethod = tx.paymentMethod || "";
    const description = tx.description || "";

    return [date, type, category, amount, paymentMethod, description]
      .map(escapeCell)
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");

  try {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (err) {}
}

export default exportToCSV;
