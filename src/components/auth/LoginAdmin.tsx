import { useForm, SubmitHandler } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import background from "../../assets/image/bg2.jpeg";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Silding from "../reuseable/Sliding";
import { Logo } from "../../assets/image";
import { setAdmin } from "../redux/slices/adminSlice";
import { loginAdmin } from "../../services/adminApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { jwtDecode } from "jwt-decode";


const bg = {
  backgroundImage: `url(${background})`,
};

type FormData = {
  emailOrPhone: string;
  password: string;
};

const LoginAdmin = () => {
  const dispatch = useDispatch();
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
      const response = await loginAdmin(data);
      console.log(response);
      const token = response?.data?.token;
      const decoded: any = jwtDecode(token);
      console.log(decoded);

      if (response?.data?.user && response?.data?.token && decoded) {
        dispatch(
          setAdmin({
            admin: response.data.user,
            token: response.data.token,
            role: decoded?.role,
          })
        );
        toast.success(response.message || "Login successful");
        navigate("/");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      toast.error((err as Error)?.message || String(err), {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google login not implemented yet", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="w-full h-screen">
      <ToastContainer />

      <div className="flex flex-col md:flex-row">
        <Silding />
        <motion.div
          style={bg}
          className="bg-center bg-no-repeat bg-cover w-full min-h-screen px-4 lg:ml-[500px]"
        >
          {/* Logo for small screens */}
          <div className="flex items-center justify-between px-4 my-6">
            <div className="lg:hidden">
              <img src={Logo} width={50} alt="Logo" />
            </div>
            {/* Sign Up Link */}
            <div className="hidden w-full text-end lg:block">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-6">
              <h2 className="mb-4 text-2xl font-semibold text-left">Login</h2>
              <a
                href="/"
                className="text-sm text-left text-blue-500 hover:underline"
              >
                Forgot Password?
              </a>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="mt-2">
                  <label className="block text-sm font-medium">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    {...register("emailOrPhone", {
                      required: "Email or phone is required",
                    })}

                    className="w-full p-3 mt-1 transition border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"

                    placeholder="Enter email or phone"
                  />
                  <p className="text-red-500 text-[10px]">
                    {errors.emailOrPhone?.message}
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

                <div className="flex items-center">
                  <motion.input type="checkbox" className="mr-2" />
                  <label className="text-sm">Keep me logged in</label>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center w-full p-3 font-semibold text-white transition duration-300 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <motion.button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center w-full py-2 mt-4 border"
              >
                <span className="text-xl">
                  <FcGoogle />
                </span>
                <span className="ml-2">Sign in with Google</span>
              </motion.button>
              <div className="block my-2 text-left lg:hidden">
                <span className="text-gray-600">Don't have an Account? </span>
                <Link to={"/"} className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginAdmin;
