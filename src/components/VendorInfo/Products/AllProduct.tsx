// import React from 'react'

const AllProduct = () => {
  return <div>AllProduct</div>;
};
export default AllProduct;

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import { Doughnut } from "react-chartjs-2";
// import { NavLink } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { getVendorProducts } from "@/utils/VendorProductApi";
// import { useSelector } from "react-redux";
// import ProductDetailModal from "./ProductDetailModal";
// import { get_single_vendor } from "@/utils/vendorApi";

// ChartJS.register(ArcElement, Tooltip, Legend);

// interface Product {
//   _id: string;
//   name: string;
//   category: string;
//   sub_category: string;
//   price: number;
//   inventory: number;
//   createdAt: string;
//   description: string;
//   status: string;
//   subSubCategory: string;
//   images: string[];
//   productType?: string;
// }

// const AllProduct: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [rowsPerPage] = useState<number>(5);
//   const [category, setCategory] = useState<string>("");
//   const [status, setStatus] = useState<string>("");
//   const [selectedProduct, setSelectedProduct] = useState<any>();
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [selectedProductId, setSelectedProductId] = useState<string | null>(
//     null
//   );

//   const user = useSelector((state: any) => state.vendor);
//   const { data: products } = useQuery<Product[]>({
//     queryKey: ["products"],
//     queryFn: () => getVendorProducts(user.token),
//   });

//   const { data: vendors } = useQuery({
//     queryKey: ["vendor"],
//     queryFn: () => get_single_vendor(user.token),
//   });

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [category, status]);

//   const handleFilter = () => {
//     setCurrentPage(1); // Reset to first page when filtering
//     console.log(`Category: ${category}, Status: ${status}`);
//   };

//   // Filter products based on category and status
//   const filteredProducts =
//     products?.filter((product: Product) => {
//       const categoryMatch = !category || product.category === category;
//       const statusMatch =
//         !status ||
//         (status === "Stock" && product.inventory > 0) ||
//         (status === "Out-Of-Stock" && product.inventory <= 0);

//       return categoryMatch && statusMatch;
//     }) || [];

//   const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
//   const paginatedProducts = filteredProducts.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handleNext = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePrev = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleProductClick = (product: Product, id: any) => {
//     setSelectedProduct({
//       ...product,
//       productName: product.name,
//       subCategory: product.sub_category,
//       dateAdded: product.createdAt,
//     });

//     setSelectedProductId(id);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedProduct(null);
//   };

//   const chartData = {
//     labels: ["Clicks", "Sales", "Views"],
//     datasets: [
//       {
//         label: "Overview",
//         data: [25, 15, 40], // Replace with real data
//         backgroundColor: ["#FFA500", "#4CAF50", "#2196F3"],
//         hoverOffset: 6,
//       },
//     ],
//   };

//   const formatCurrency = (value: number | undefined) => {
//     if (value === undefined || value === null) return "";
//     try {
//       return new Intl.NumberFormat("en-NG", {
//         style: "currency",
//         currency: "NGN",
//         maximumFractionDigits: 2,
//       }).format(value as number);
//     } catch (e) {
//       return String(value);
//     }
//   };

//   return (
//     <main className="max-w-full p-4 overflow-x-hidden sm:p-5">
//       <motion.div
//         className="flex flex-wrap items-center justify-between gap-3 mb-5"
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-2xl font-bold">Products Overview</h1>
//         <NavLink to={"/app/new-product"}>
//           <button className="px-4 py-2 text-white bg-orange-500 rounded-lg">
//             + New Product
//           </button>
//         </NavLink>
//       </motion.div>

//       <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-3">
//         <motion.div
//           className="p-5 bg-white rounded-lg shadow md:col-span-2"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           style={{ maxWidth: "100%", maxHeight: "400px" }} // Responsive size
//         >
//           <Doughnut data={chartData} options={{ maintainAspectRatio: true }} />
//         </motion.div>
//       </div>

//       <div className="flex flex-wrap items-center min-w-0 gap-3 mb-5">
//         <motion.select
//           className="w-full p-2 border border-orange-500 rounded outline-orange-500 md:w-auto"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         >
//           <option value="">All Categories</option>
//           {vendors?.craftCategories?.map((cat: string) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </motion.select>
//         <motion.select
//           className="w-full p-2 border border-orange-500 rounded outline-orange-500 md:w-auto"
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//         >
//           <option value="">Status</option>
//           <option value="Stock">Stock</option>
//           <option value="Out-Of-Stock">Out-Of-Stock</option>
//         </motion.select>
//         <button
//           className="px-4 py-2 text-white bg-orange-500 rounded-lg"
//           onClick={handleFilter}
//         >
//           Filter
//         </button>
//         <input
//           type="text"
//           placeholder="Search Product..."
//           className="flex-1 w-full min-w-0 p-2 border border-orange-500 rounded md:w-auto outline-orange-500"
//         />
//       </div>

//       {/* Mobile list */}
//       <div className="space-y-3 md:hidden">
//         {paginatedProducts?.map((product: Product, index: number) => (
//           <motion.div
//             key={product._id}
//             className="min-w-0 p-4 overflow-hidden bg-white border border-gray-100 rounded-lg shadow"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 + index * 0.05 }}
//             onClick={() => handleProductClick(product, product._id)}
//           >
//             <div className="flex items-start justify-between min-w-0 gap-2">
//               <div className="flex items-start flex-1 min-w-0 gap-3">
//                 <img
//                   src={product.images?.[0] || "/placeholder.svg"}
//                   alt={product.name}
//                   className="flex-shrink-0 object-cover w-12 h-12 rounded sm:w-14 sm:h-14"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div
//                     className="max-w-full font-semibold break-words break-all"
//                     title={product.name}
//                   >
//                     {product.name}
//                   </div>
//                   <div className="max-w-full text-xs text-gray-500 break-words break-all">
//                     {product.description?.slice(0, 80)}
//                   </div>
//                 </div>
//               </div>
//               <div className="ml-2 text-sm text-gray-500">
//                 {product.createdAt.split("T")[0]}
//               </div>
//             </div>
//             <div className="grid min-w-0 grid-cols-1 gap-2 mt-2 text-sm sm:grid-cols-2">
//               <div className="min-w-0">
//                 <div className="text-xs text-gray-500">Category</div>
//                 <div
//                   className="max-w-full break-words break-all"
//                   title={product.category}
//                 >
//                   {product.category}
//                 </div>
//               </div>
//               <div className="min-w-0">
//                 <div className="text-xs text-gray-500">Sub-Category</div>
//                 <div
//                   className="max-w-full break-words break-all"
//                   title={product.sub_category}
//                 >
//                   {product.sub_category}
//                 </div>
//               </div>
//               <div className="min-w-0">
//                 <div className="text-xs text-gray-500">Amount</div>
//                 <div>{formatCurrency(product.price)}</div>
//               </div>
//               <div className="min-w-0">
//                 <div className="text-xs text-gray-500">Stock</div>
//                 <div
//                   className={`${
//                     product.inventory <= 0
//                       ? "text-red-500"
//                       : product.inventory < 10
//                       ? "text-amber-500"
//                       : "text-green-500"
//                   }`}
//                 >
//                   {product.inventory <= 0
//                     ? "Out of Stock"
//                     : product.inventory < 10
//                     ? "Low Stock"
//                     : "In Stock"}
//                 </div>
//               </div>
//               <div className="col-span-1 mt-2 sm:col-span-2">
//                 <span className="inline-block px-2 py-1 mr-2 text-xs text-gray-800 bg-gray-100 rounded">
//                   {product.productType === "auction"
//                     ? "Auction"
//                     : product.productType === "flash sale"
//                     ? "Flash Sale"
//                     : "Sales"}
//                 </span>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Desktop table */}
//       <div className="hidden overflow-x-auto md:block">
//         <motion.table
//           className="w-full overflow-hidden bg-white rounded-lg shadow"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Image</th>
//               <th className="p-3 text-left">Product Name</th>
//               <th className="p-3 text-left">Type</th>
//               <th className="p-3 text-left">Category</th>
//               <th className="p-3 text-left">Sub-Category</th>
//               <th className="p-3 text-left">Amount</th>
//               <th className="p-3 text-left">Stock</th>
//               <th className="p-3 text-left">Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedProducts?.map((product: Product, index: number) => (
//               <motion.tr
//                 key={product._id}
//                 className="cursor-pointer hover:bg-gray-50"
//                 onClick={() => handleProductClick(product, product._id)}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.3 + index * 0.1 }}
//               >
//                 <td className="w-20 p-3">
//                   <img
//                     src={product.images?.[0] || "/placeholder.svg"}
//                     alt={product.name}
//                     className="object-cover w-12 h-12 rounded"
//                   />
//                 </td>
//                 <td className="p-3 max-w-[200px]">
//                   <div
//                     className="font-semibold break-words break-all truncate"
//                     title={product.name}
//                   >
//                     {product.name}
//                   </div>
//                   <div className="text-xs text-gray-400 break-all break-words max-w-[200px]">
//                     {product.description?.slice(0, 80)}
//                   </div>
//                 </td>
//                 <td className="p-3">
//                   {product.productType === "auction"
//                     ? "Auction"
//                     : product.productType === "flash sale"
//                     ? "Flash Sale"
//                     : "Sales"}
//                 </td>
//                 <td className="p-3">{product.category}</td>
//                 <td className="p-3">{product.sub_category}</td>
//                 <td className="p-3">{formatCurrency(product.price)}</td>
//                 <td
//                   className={`p-3 ${
//                     product.inventory <= 0
//                       ? "text-red-500"
//                       : product.inventory < 10
//                       ? "text-amber-500"
//                       : "text-green-500"
//                   }`}
//                 >
//                   {product.inventory <= 0
//                     ? "Out of Stock"
//                     : product.inventory < 10
//                     ? "Low Stock"
//                     : "In Stock"}
//                 </td>
//                 <td className="p-3">{product.createdAt.split("T")[0]}</td>
//               </motion.tr>
//             ))}
//           </tbody>
//         </motion.table>
//       </div>

//       <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
//         <button
//           onClick={handlePrev}
//           disabled={currentPage === 1}
//           className="px-4 py-2 bg-gray-200 rounded"
//         >
//           Prev
//         </button>
//         <span>
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           onClick={handleNext}
//           disabled={currentPage === totalPages}
//           className="px-4 py-2 bg-gray-200 rounded"
//         >
//           Next
//         </button>
//       </div>

//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         productId={selectedProductId}
//       />
//     </main>
//   );
// };

// export default AllProduct;
