import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getAdminPaymentsAndInvoices } from "../../../services/adminApi";
import { RootState } from "@/components/redux/store";

export default function InvoicePreview() {
  const admin = useSelector((state: RootState) => state.admin);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPaymentsInvoices'],
    queryFn: () => getAdminPaymentsAndInvoices(admin.token),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-8">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 p-8">Error loading invoice data</div>;
  }

  const totalRevenue = data?.paymentSummary?.totalRevenue || 0;
  const successfulPayments = data?.paymentSummary?.successfulPayments || 0;
  const pendingPayments = data?.paymentSummary?.pendingPayments || 0;
  const failedPayments = data?.paymentSummary?.failedPayments || 0;

  const invoices = data?.invoices || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        {/* Payment Summary */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-6">Payment Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Successful Payments:</span>
              <span className="font-semibold text-green-600">{successfulPayments}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Payments:</span>
              <span className="font-semibold text-red-600">{pendingPayments}</span>
            </div>
            <div className="flex justify-between">
              <span>Failed Payments:</span>
              <span className="font-semibold text-yellow-600">{failedPayments}</span>
            </div>
          </div>
        </motion.div>

        {/* Invoices List */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-6">Invoices</h2>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {invoices.map((invoice: any) => (
              <div key={invoice._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">Invoice ID: {invoice._id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    invoice.status === "Paid" ? "bg-green-100 text-green-800" :
                    invoice.status === "Unpaid" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Customer: {invoice.order?.buyerInfo?.name || 'N/A'}</p>
                  <p>Email: {invoice.order?.buyerInfo?.email || 'N/A'}</p>
                  <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  <p>Amount: ${invoice.amount?.toLocaleString()}</p>
                </div>
                <button className="mt-2 text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

