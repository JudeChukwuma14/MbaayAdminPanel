import { SubmitHandler, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import background from "../../assets/image/bg2.jpeg";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { createAdmin } from "../../services/adminApi";
import Silding from "../reuseable/Sliding";
import { Logo } from "../../assets/image";
const bg = {
  backgroundImage: `url(${background})`,
};
type FormData = {
  name: string;
  email: string;
  password: string;
};

const SignupAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      toast.success(response.message, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login-admin");
    } catch (err) {
      toast.error((err as Error)?.message || String(err), {
        position: "top-right",
        autoClose: 4000,
      });
    }finally {
      setIsLoading(false);
    }
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
          <div className="flex items-center justify-between px-4 my-6">
            <div className="lg:hidden">
              <img src={Logo} width={50} alt="" />
            </div>
            <div className="hidden w-full text-end lg:block">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login-admin">
                <span className="text-blue-500 hover:underline">
                  Sign in
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-screen ">
            <div className="w-full max-w-md p-6">
              <h2 className="mb-4 text-2xl font-semibold text-left">
                Register
              </h2>
              <p>Sign up with</p>

              <motion.button className="flex items-center justify-center w-full py-2 mb-4 border rounded-md">
                <span className="text-xl">
                  <FcGoogle />
                </span>
              </motion.button>

              <div className="mb-4 font-bold text-left text-black">OR</div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h1 className="mb-4 font-bold text-left text-black">
                  Your Name
                </h1>
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Full name is required" })}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-orange-600"
                  />
                  <p className="text-red-500 text-[10px]">{errors.name?.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-orange-600"
                  />
                  <p className="text-red-500 text-[10px]">
                    {errors.email?.message}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: 8,
                    })}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-orange-600"
                  />
                  <p className="text-red-500 text-[10px]">
                    {errors.password?.message}
                  </p>
                </div>

                <div className="flex items-center">
                  <motion.input type="checkbox" className="mr-2" />
                  <label className="text-sm">
                    I agree to the{" "}
                    <a href="#" className="text-blue-500">
                      Terms & Conditions
                    </a>
                  </label>
                </div>

                <div className="flex items-center">
                  <motion.input type="checkbox" className="mr-2" />
                  <label className="text-sm">Keep me logged in</label>
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
              </form>
              <div className="block my-2 text-left lg:hidden">
                <span className="text-gray-600">Don't have an Account? </span>
                <Link to="/login-admin" className="text-blue-500 hover:underline">
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
