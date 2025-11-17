import { SubmitHandler, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import background from "../../assets/image/bg2.jpeg";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { createAdmin } from "../../services/adminApi";
import Silding from "../reuseable/Sliding";
import { Logo } from "../../assets/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const bg = {
  backgroundImage: `url(${background})`,
};
enum AdminRole {
  Admin = "Admin",
  CustomerCare = "Customer care",
  SuperAdmin = "Super Admin",
}

type FormData = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

const SignupAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await createAdmin(data);
      console.log("Register logs", response);
      toast.success(`${response?.data?.role} created successfully `, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login-admin");
    } catch (err) {
      toast.error((err as Error)?.message || String(err), {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen">
      <div className="flex flex-col md:flex-row">
        <Silding />
        <motion.div
          style={bg}
          className="bg-center bg-no-repeat bg-cover w-full min-h-screen px-4 lg:ml-[500px]"
        >
          <div className="flex items-center justify-between px-4 my-6">
            <div className="lg:hidden">
              <img src={Logo} width={50} alt="" />
            </div>
            <div className="hidden w-full text-end lg:block">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login-admin">
                <span className="text-blue-500 hover:underline">Sign in</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen ">
            <div className="w-full max-w-md p-6">
              <h2 className="mb-4 text-2xl font-semibold text-left">
                Register
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Full name is required" })}
                    className="w-full p-3 mt-1 transition border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-red-500 text-[10px]">
                    {errors.name?.message}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {

                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,

                        message: "Invalid email address",
                      },
                    })}
                    className="w-full p-3 mt-1 transition border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-red-500 text-[10px]">
                    {errors.email?.message}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full p-3 mt-1 transition border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    <span
                      className="absolute text-gray-500 cursor-pointer right-5 top-5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <select
                    {...register("role", { required: "Please select a role" })}
                    className="w-full p-3 mt-1 transition border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a role</option>
                    {Object.values(AdminRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center w-full p-3 font-semibold text-white transition duration-300 bg-orange-500 rounded-md hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    "Sign up"
                  )}
                </button>
                <motion.button className="flex items-center justify-center w-full py-2 mb-4 border rounded-md">
                  <span className="flex items-center gap-2 text-lg text-gray-600">
                    <FcGoogle size={20} /> Google
                  </span>
                </motion.button>
              </form>
              <div className="block my-2 text-left lg:hidden">
                <span className="text-gray-600">Don't have an Account? </span>
                <Link
                  to="/login-admin"
                  className="text-blue-500 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupAdmin;
