import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminProducts } from "@/services/adminApi";
import { useSelector } from "react-redux";
import ProductDetailModal from "./ProductDetailModal";
import { RootState } from "@/components/redux/store";
import {
  Search,
  Filter,
  Plus,
  Package,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface Product {
  _id: string;
  name: string;
  category: string;
  sub_category: string;
  price: number;
  inventory: number;
  createdAt: string;
  description: string;
  status: string;
  subSubCategory: string;
  images: string[];
  productType?: string;
}

/* ------------------------------------------------------------------ */
/* Stock badge                                                         */
/* ------------------------------------------------------------------ */
const StockBadge = ({ inventory }: { inventory: number }) => {
  if (inventory <= 0)
    return (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">
        Out of Stock
      </span>
    );
  if (inventory < 10)
    return (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        Low Stock ({inventory})
      </span>
    );
  return (
    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
      In Stock ({inventory})
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Type badge                                                          */
/* ------------------------------------------------------------------ */
const TypeBadge = ({ type }: { type?: string }) => {
  const label =
    type === "auction" ? "Auction" : type === "flash sale" ? "Flash Sale" : "Sales";
  const cls =
    type === "auction"
      ? "bg-purple-100 text-purple-600"
      : type === "flash sale"
      ? "bg-orange-100 text-orange-600"
      : "bg-blue-100 text-blue-600";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const AllProduct: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 8;
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const admin = useSelector((state: RootState) => state.admin);
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getAdminProducts(admin.token),
  });

  const categoryOptions = [
    "Beauty and Wellness",
    "Jewelry and Gemstones",
    "Books and Poetry",
    "Vintage Stocks",
    "Home Décor and Accessories",
    "Plant and Seeds",
    "Spices, Condiments and Seasonings",
    "Local & Traditional Foods",
    "Fashion Clothing and Fabrics",
    "Traditional and Religious Items",
    "Art & Sculptures",
    "Music & Beats",
    "Drama, Plays & Short Skits",
    "Handmade Furniture",
    "Vintage & Antique Jewelry",
    "Traditional Musical Instruments(Religious & Ceremonial)",
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [category, status, searchTerm]);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "";
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(value as number);
    } catch {
      return String(value);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Chart data — derived from real products                          */
  /* ---------------------------------------------------------------- */
  const inStock = (products || []).filter((p) => p.inventory > 10).length;
  const lowStock = (products || []).filter(
    (p) => p.inventory > 0 && p.inventory <= 10
  ).length;
  const outOfStock = (products || []).filter((p) => p.inventory <= 0).length;

  // Category distribution (top 6)
  const categoryCounts = (products || []).reduce(
    (acc: Record<string, number>, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {}
  );
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const donutData = {
    labels: ["In Stock", "Low Stock", "Out of Stock"],
    datasets: [
      {
        label: "Products",
        data: [inStock, lowStock, outOfStock],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderColor: ["#fff", "#fff", "#fff"],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: topCategories.map(([cat]) =>
      cat.length > 18 ? cat.slice(0, 16) + "…" : cat
    ),
    datasets: [
      {
        label: "Products",
        data: topCategories.map(([, count]) => count),
        backgroundColor: "#F87645",
        borderRadius: 6,
        hoverBackgroundColor: "#ea6635",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { stepSize: 1 } },
    },
  };

  /* ---------------------------------------------------------------- */
  /* Filters                                                          */
  /* ---------------------------------------------------------------- */
  const filteredProducts =
    products?.filter((product: Product) => {
      const categoryMatch = !category || product.category === category;
      const statusMatch =
        !status ||
        (status === "Stock" && product.inventory > 0) ||
        (status === "Out-Of-Stock" && product.inventory <= 0);
      const searchMatch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && statusMatch && searchMatch;
    }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleProductClick = (product: Product, id: any) => {
    setSelectedProduct({
      ...product,
      productName: product.name,
      subCategory: product.sub_category,
      dateAdded: product.createdAt,
    });
    setSelectedProductId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Header ---------------------------------------------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Products Overview
            </h1>
            <NavLink to="/new-product">
              <button className="flex items-center gap-2 px-4 py-2 text-white bg-[#F87645] rounded-lg hover:bg-orange-600 transition-colors">
                <Plus className="w-4 h-4" />
                New Product
              </button>
            </NavLink>
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 mx-auto">
        {/* Stat cards ---------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Package className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {products?.length ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Stock</p>
                  <p className="text-2xl font-bold text-gray-800">{inStock}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-800">{outOfStock}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts --------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {/* Donut — stock breakdown */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Stock Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center">
              <div className="w-48 h-48">
                <Doughnut
                  data={donutData}
                  options={{
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: "bottom", labels: { font: { size: 11 } } },
                    },
                    cutout: "65%",
                  }}
                />
              </div>
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  In Stock
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Out
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bar — products per category */}
          <Card className="border-gray-200 shadow-sm bg-white md:col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <Package className="w-4 h-4 text-orange-500" />
                Products by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-48">
                {topCategories.length > 0 ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400">No category data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters -------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="p-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="p-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="Stock">In Stock</option>
            <option value="Out-Of-Stock">Out of Stock</option>
          </select>
        </div>

        {/* Table card ----------------------------------------------- */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-sm text-gray-500">Loading products…</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Package className="w-5 h-5 text-orange-500" />
                    All Products
                  </CardTitle>
                  <span className="text-sm text-gray-400">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F8FA] hover:bg-[#F5F8FA]">
                      <TableHead className="text-gray-600 font-semibold">Image</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Product</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Type</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Category</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Sub-Category</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Price</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Stock</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-16 text-center">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-base font-semibold text-gray-700">
                            No products found
                          </h3>
                          <p className="mt-1 text-sm text-gray-400">
                            Try adjusting your filters or search.
                          </p>
                          {(category || status || searchTerm) && (
                            <button
                              onClick={() => {
                                setCategory("");
                                setStatus("");
                                setSearchTerm("");
                              }}
                              className="mt-4 flex items-center gap-2 px-4 py-2 mx-auto rounded bg-[#F87645] text-white text-sm hover:bg-orange-600 transition-colors"
                            >
                              <Filter className="w-4 h-4" />
                              Reset Filters
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProducts.map((product: Product, index: number) => (
                        <motion.tr
                          key={product._id}
                          className="border-b border-gray-100 hover:bg-orange-50 cursor-pointer transition-colors"
                          onClick={() => handleProductClick(product, product._id)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <TableCell>
                            <div className="w-12 h-12 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[180px]">
                            <div className="font-medium text-gray-800 truncate" title={product.name}>
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {product.description?.slice(0, 60)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={product.productType} />
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-[140px] truncate">
                            {product.category}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-[120px] truncate">
                            {product.sub_category}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell>
                            <StockBadge inventory={product.inventory} />
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                            {product.createdAt.split("T")[0]}
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination ----------------------------------------- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded border border-gray-200 bg-white text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-[#F87645] text-white border-[#F87645]"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded border border-gray-200 bg-white text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productId={selectedProductId}
      />
    </div>
  );
};

export default AllProduct;
