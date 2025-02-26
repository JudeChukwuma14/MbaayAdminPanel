import { motion } from "framer-motion"
import { Download } from "lucide-react"

// interface InvoiceItem {
//   name: string
//   quantity: number
//   price: number
//   image: string
// }

export default function InvoicePreview() {
  const invoiceData = {
    id: "INV2398-123-459",
    dueDate: "20 November 2024",
    client: {
      name: "John Smith",
      email: "john_smith@gmail.com",
      avatar: "J",
    },
    productName: "An indian Lady's dress",
    items: [
      {
        name: "Indian Wears",
        quantity: 1,
        price: 1000,
        image:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-05%20021738-SONs22Y1k8Tm3iajRtzzC0N0nWSYbr.png",
      },
    ],
    currency: "USD - United States Dollars",
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        {/* Invoice Information Form */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-6">Invoice Information</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {invoiceData.client.avatar}
            </div>
            <div>
              <p className="font-medium">{invoiceData.client.name}</p>
              <p className="text-sm text-gray-500">{invoiceData.client.email}</p>
            </div>
            <span className="ml-auto text-purple-600 text-sm font-medium">Client</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
              <motion.input type="text" value={invoiceData.id} readOnly className="w-full p-2 border rounded-md bg-gray-50  outline-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <motion.input
                type="text"
                value={invoiceData.dueDate}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-50 outline-orange-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Detail</label>
            <textarea
              className="w-full p-2 border rounded-md bg-gray-50 outline-orange-500"
              rows={3}
              placeholder="Enter product details..."
            />
          </div>

          <div className="border rounded-md p-4 mb-6">
            <div className="flex justify-between mb-2 font-medium">
              <span>Items</span>
              <div className="flex gap-8">
                <span>QTY</span>
                <span>COST</span>
              </div>
            </div>
            {invoiceData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-[60px] h-[60px] rounded-md object-cover"
                  />
                  <span>{item.name}</span>
                </div>
                <div className="flex gap-8">
                  <motion.input
                    type="number"
                    value={item.quantity}
                    readOnly
                    className="w-16 p-1 border rounded-md text-center outline-orange-500"
                  />
                  <motion.input
                    type="text"
                    value={`$${item.price.toLocaleString()}`}
                    readOnly
                    className="w-24 p-1 border rounded-md text-right outline-orange-500"
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-4 pt-4 border-t">
              <span>Tax</span>
              <span>10 %</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Terms</label>
            <textarea
              className="w-full p-2 border rounded-md outline-orange-500"
              rows={4}
              placeholder="Enter notes or terms of service..."
            />
          </div>
        </motion.div>

        {/* Invoice Preview */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-6">Preview</h2>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-6">{invoiceData.id}</h3>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{invoiceData.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Name</p>
                <p className="font-medium">{invoiceData.productName}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-500">Billed to</p>
              <p className="font-medium">{invoiceData.client.name}</p>
              <p className="text-sm text-gray-600">{invoiceData.client.email}</p>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-4 font-medium text-sm text-gray-500 mb-4">
                <span>DESCRIPTION</span>
                <span className="text-center">QTY</span>
                <span className="text-right">UNIT PRICE</span>
                <span className="text-right">AMOUNT</span>
              </div>

              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 items-center py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-[60px] h-[60px] rounded-md object-cover"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-right">${item.price} USD</span>
                  <span className="text-right">${item.price * item.quantity} USD</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${invoiceData.items[0].price} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Discount -0%</span>
                <span>0</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${invoiceData.items[0].price} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Amount due</span>
                <span>${invoiceData.items[0].price} USD</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="font-medium mb-2">Attachment</p>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">📄</div>
                  <span>Productlist.PDF</span>
                </div>
                <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

