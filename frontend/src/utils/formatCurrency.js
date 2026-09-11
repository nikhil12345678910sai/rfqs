export function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "₹0.00";
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}