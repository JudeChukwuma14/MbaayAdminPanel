import { useState } from "react";
import { Eye, EyeOff, ShoppingCart, Package, BadgeDollarSign } from "lucide-react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [selectedMonths, setSelectedMonths] = useState(1);


  const totalOrders = 3234;
  const productsSold = 1455;
  const accountType = "Counter";

  const orders = [
    { id: "#12356", client: "Chukwuma Jude", product: "Wooden Pots (Clay)", qty: 10, price: "$50,000", category: "Arts and craft", status: "Pending" },
    { id: "#12357", client: "Abbas Mohammed", product: "Ankara Dress", qty: 15, price: "$75,000", category: "Fashion", status: "Rejected" },
    { id: "#12358", client: "Jane Doe", product: "Leather Bag", qty: 5, price: "$30,000", category: "Accessories", status: "Delivered" },
  ];

  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"], // Placeholder months
    datasets: [
      {
        label: "Revenue",
        data: [5000, 10000, 7500, 12000, 8000, 15000], // Replace with real data
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

 

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(200, 200, 200, 0.2)" } },
    },
  };
  

  return (
    <main className="p-5 flex-1 overflow-auto">
      {/* Cards Section */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { title: "Wallet Balance", value: balanceVisible ? "$34,000" : "****", icon: balanceVisible ? EyeOff : Eye, onClick: toggleBalanceVisibility },
          { title: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart },
          { title: "Products Sold", value: productsSold.toString(), icon: Package },
          { title: "Account Type", value: accountType, icon: BadgeDollarSign },
        ].map((card, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg p-5 shadow flex items-center justify-between"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h3 className="text-sm text-gray-500">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            {card.icon && (
              <motion.button onClick={card.onClick} >
                <card.icon className="w-6 h-6 text-gray-600" />
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Chart and Notifications */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          className="col-span-2 bg-white rounded-lg p-5 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-bold mb-4">Revenue Report</h2>
          <div className="flex justify-end mb-3">
            {[1, 3, 6].map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonths(month)}
                className={`px-3 py-1 rounded ${
                  selectedMonths === month ? "bg-orange-500 text-white" : "bg-gray-200"
                } mx-1`}
              >
                {month} Month{month > 1 && "s"}
              </button>
            ))}
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg p-5 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-bold mb-4">Recent Notifications</h2>
          <ul className="text-sm space-y-2">
            {["Your account is logged in", "Payment successfully processed", "New product added to inventory"].map((notif, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded shadow">{notif}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Orders Table */}
      <motion.div
        className="bg-white rounded-lg p-5 shadow mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="font-bold mb-4">All Orders</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th>Client Name</th>
              <th>Product Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, index) => (
              <motion.tr
                key={index}
                className="border-b hover:bg-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <td className="py-2">{order.id}</td>
                <td>{order.client}</td>
                <td>{order.product}</td>
                <td>{order.qty}</td>
                <td>{order.price}</td>
                <td>{order.category}</td>
                <td
                  className={`text-${
                    order.status === "Pending"
                      ? "yellow"
                      : order.status === "Delivered"
                      ? "green"
                      : "red"
                  }-500`}
                >
                  {order.status}
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
      </motion.div>
    </main>
  );
};

export default Dashboard;
