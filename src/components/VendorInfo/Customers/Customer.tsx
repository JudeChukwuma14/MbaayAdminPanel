import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, UserCheck } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  location: string;
  status: "Active" | "Inactive";
  avatar?: string; // URL for avatar
}

const CustomersPage: React.FC = () => {
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: "Janet Clerk",
      phone: "+234 7077283490",
      email: "janetclerk@gmail.com",
      location: "Center Park Orange St, London",
      status: "Active",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      name: "Joseph Bankole",
      phone: "+234 7077283490",
      email: "josephbankole@gmail.com",
      location: "Center Park Orange St, London",
      status: "Inactive",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      name: "James Koppier",
      phone: "+234 7077283490",
      email: "jameskoppier@gmail.com",
      location: "Center Park Orange St, London",
      status: "Inactive",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 4,
      name: "Flora Camper",
      phone: "+234 7077283490",
      email: "floracamper@gmail.com",
      location: "Center Park Orange St, London",
      status: "Active",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 5,
      name: "Steve Fisher",
      phone: "+234 7077283490",
      email: "stevefisher@gmail.com",
      location: "Center Park Orange St, London",
      status: "Active",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 6,
      name: "Monday Henry",
      phone: "+234 7077283490",
      email: "mondayhenry@gmail.com",
      location: "Center Park Orange St, London",
      status: "Active",
      avatar: "https://via.placeholder.com/40",
    },
  ]);

  const pageSize = 5;
  const totalPages = Math.ceil(customers.length / pageSize);

  const filteredCustomers =
    filter === "All" ? customers : customers.filter((c) => c.status === filter);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Summary Boxes */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="text-blue-500" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Total Customers</h2>
            <p className="text-2xl font-semibold">{customers.length}</p>
          </div>
        </motion.div>
        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-green-100 p-3 rounded-full">
            <User className="text-green-500" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Members</h2>
            <p className="text-2xl font-semibold">
              {customers.filter((c) => c.status === "Active").length}
            </p>
          </div>
        </motion.div>
        <motion.div
          className="p-4 bg-white rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="p-2 bg-green-100 rounded-full flex justify-center items-center"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <UserCheck className="text-green-600" size={20} />
            </motion.div>
            <h2 className="text-lg font-bold">Active Now</h2>
          </div>
          <div className="flex items-center mt-2 space-x-4">
            {customers
              .filter((c) => c.status === "Active")
              .slice(0, 5)
              .map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-full overflow-hidden w-10 h-10"
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Filter and Table */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-4"
      >
        <h1 className="text-2xl font-bold">Customers</h1>
        <motion.select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "All" | "Active" | "Inactive")
          }
          className="border border-orange-500 p-2 rounded shadow-sm focus:ring-2 focus:ring-orange-500 outline-orange-500"
          whileFocus={{ scale: 1.05 }}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </motion.select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto shadow rounded-lg"
      >
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                ID
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                Customer Name
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                Phone
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                Email
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                Location
              </th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => (
              <motion.tr
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * customer.id }}
                className="border-b"
                whileHover={{ scale: 1.02 }}
              >
                <td className="py-2 px-4 text-sm">{customer.id}</td>
                <td className="py-2 px-4 text-sm">{customer.name}</td>
                <td className="py-2 px-4 text-sm">{customer.phone}</td>
                <td className="py-2 px-4 text-sm">{customer.email}</td>
                <td className="py-2 px-4 text-sm">{customer.location}</td>
                <td className="py-2 px-4 text-sm">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      customer.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        className="flex justify-between items-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm text-gray-600">
          Showing {paginatedCustomers.length} of {filteredCustomers.length}{" "}
          results
        </p>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-orange-500 rounded shadow-sm bg-white text-gray-600 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
          >
            Prev
          </motion.button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded shadow-sm ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {index + 1}
            </motion.button>
          ))}
          <motion.button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-orange-500 rounded shadow-sm bg-white text-gray-600 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomersPage;
