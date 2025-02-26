import  { useState } from "react";
import { motion } from "framer-motion";
import {CreditCard, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const PaymentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("All status");

  const rowsPerPage = 5;
  const totalInvoices = 30_000;
  const paidInvoices = 1_893;
  const unpaidInvoices = 18_900;
  const overdueInvoices = 1_809;

  const invoices = Array.from({ length: 102 }, (_, i) => ({
    id: i + 1,
    customerName: `Customer ${i + 1}`,
    email: `customer${i + 1}@gmail.com`,
    date: "20 Nov 2024",
    amount: "$40,000",
    status: i % 2 === 0 ? "Paid" : i % 3 === 0 ? "Overdue" : "Unpaid",
  }));

  const filteredInvoices = filter === "All status" ? invoices : invoices.filter((invoice) => invoice.status === filter);

  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <main className="p-5">
      {/* Cards Section */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { title: "Total Invoices", value: `$${totalInvoices.toLocaleString()}`, icon: CreditCard, color: "text-blue-500" },
          { title: "Paid", value: `$${paidInvoices.toLocaleString()}`, icon: CheckCircle, color: "text-green-500" },
          { title: "Unpaid", value: `$${unpaidInvoices.toLocaleString()}`, icon: XCircle, color: "text-red-500" },
          { title: "Overdue", value: `$${overdueInvoices.toLocaleString()}`, icon: AlertCircle, color: "text-yellow-500" },
        ].map((card, index) => (
          <motion.div
            key={index}
            className={`bg-white p-5 rounded-lg shadow flex items-center justify-between ${card.color}`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h3 className="text-sm text-gray-500">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <card.icon className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      {/* Filter and Search Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          {["All status", "Paid", "Unpaid", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded ${
                filter === status ? "bg-orange-500 text-white" : "bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div>
          <input
            type="text"
            placeholder="Search Product..."
            className="border px-3 py-2 rounded-lg w-64 outline-orange-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-5 rounded-lg shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Invoice ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice) => (
              <motion.tr
                key={invoice.id}
                className="border-b hover:bg-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <td className="py-2">{invoice.id}</td>
                <td>{invoice.customerName}</td>
                <td>{invoice.email}</td>
                <td>{invoice.date}</td>
                <td>{invoice.amount}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-lg text-white ${
                      invoice.status === "Paid"
                        ? "bg-green-500"
                        : invoice.status === "Unpaid"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
           Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next 
          </button>
        </div>
      </div>
    </main>
  );
};

export default PaymentsPage;
