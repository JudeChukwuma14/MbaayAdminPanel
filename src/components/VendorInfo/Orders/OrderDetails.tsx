import { Phone, Mail, Clock } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const UserDetail = () => {
  const userDetails = {
    name: "James Ikenna",
    status: "On Delivery",
    estimatedTime: "2-6 min",
    driver: {
      name: "Leonard Paul",
      phone: "+234 812 345 6782",
      email: "leonard123@gmail.com",
    },
    items: [
      { name: "Isi Agu Igbo Wears", category: "Fashion", qty: 2, price: 40000 },
      { name: "Isi Agu Igbo Wears", category: "Fashion", qty: 2, price: 40000 },
    ],
    history: [
      "Product Delivered by Driver",
      "Driver Arrived at Destination",
      "Preparing Your Order",
      "Placed Order",
    ],
    location: { lat: 6.5244, lng: 3.3792 }, // Example coordinates (Lagos, Nigeria)
  };

  const calculateTotal = () => {
    const subtotal = userDetails.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.1;
    return subtotal + tax;
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  return (
    <main className="p-5 bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-3 gap-6"
      >
        {/* Map and Delivery Status */}
        <div className="col-span-2 bg-white rounded-lg shadow p-5 relative">
          <h2 className="font-bold text-lg mb-4">Delivery Status</h2>
          <div className="absolute top-5 right-5 bg-yellow-400 text-white px-4 py-2 rounded-full">
            {userDetails.status} <span className="ml-2 text-sm">(Estimated Time: {userDetails.estimatedTime})</span>
          </div>
          <div className="h-64 rounded overflow-hidden">
            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userDetails.location}
                zoom={14}
              >
                <Marker position={userDetails.location} />
              </GoogleMap>
            </LoadScript>
          </div>
        </div>

        {/* Customer Details */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-lg shadow p-5 flex flex-col items-center"
        >
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="w-[220px] h-[200px]  mb-3 bg-red-500 rounded-lg"
          />
          <h3 className="font-bold text-lg">{userDetails.name}</h3>
          <h4>Customer</h4>
          <div className="flex space-x-3 mt-3">
            <motion.button className="bg-orange-500 text-white p-2 rounded-full">
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button className="bg-orange-500 text-white p-2 rounded-full">
              <FaWhatsapp className="w-5 h-5" />
            </motion.button>
            <motion.button className="bg-orange-500 text-white p-2 rounded-full">
              <Mail className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Items (previously Order History) */}
        <div className="col-span-2 bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">Items</h2>
          <ul className="space-y-3">
            {userDetails.items.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">x{item.qty}</p>
                  <p className="font-bold">${item.price.toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <p className="text-sm text-gray-500">Subtotal: ${calculateTotal() - calculateTotal() * 0.1}</p>
            <p className="text-sm text-gray-500">Tax (10%): ${calculateTotal() * 0.1}</p>
            <p className="font-bold">Total: ${calculateTotal()}</p>
          </div>
        </div>

        {/* Order History (previously Items) */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-bold text-lg mb-4">History</h2>
          <ul className="space-y-2">
            {userDetails.history.map((event, index) => (
              <li
                key={index}
                className="flex items-center space-x-3 text-gray-600"
              >
                <Clock className="w-5 h-5 text-orange-500" />
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Driver Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-lg shadow p-5"
        >
          <div className="flex">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="w-[60px] h-[60px]  mb-3 bg-red-500 rounded-lg"
          />
          <div className="ml-[20px]">
          <p className="font-bold">{userDetails.driver.name}</p>
          <h2 className="font-bold text-lg mb-4">Driver</h2>
          </div>
          </div>
          
          <div className="flex">
            <div className="w-[50px] h-[50px] border-orange-500 border text-orange-500  rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6" />
            </div>
          <div className="ml-[10px]">
            <h3 className="font-bold">Telephone Number</h3>
          <p className="text-sm text-gray-500 text-center">Phone: {userDetails.driver.phone}</p>
          </div>
          </div>
          <div className="flex mt-[10px]">
            <div className="w-[50px] h-[50px] border-orange-500 border text-orange-500 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 " />
            </div>
            <div className="ml-[10px]">
            <h3 className="font-bold">Email</h3>
            <p className="text-sm text-gray-500">Email: {userDetails.driver.email}</p>
            </div>
          </div>
          
        </motion.div>
      </motion.div>
    </main>
  );
};

export default UserDetail;