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
    } catch (error: unknown) {
      console.log(error);
      toast.error((error as Error)?.message || "An unexpected error occurred", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
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
          <div className="flex justify-between items-center px-4 my-6">
            <div className="lg:hidden">
              <img src={Logo} width={50} alt="" />
            </div>
            <div className="w-full hidden text-end lg:block">
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
              <h2 className="text-2xl font-semibold text-left mb-4">
                Register
              </h2>
              <p>Sign up with</p>

              <motion.button className="w-full py-2 mb-4 border rounded-md flex items-center justify-center">
                <span className="text-xl">
                  <FcGoogle />
                </span>
              </motion.button>

              <div className="text-left text-black font-bold mb-4">OR</div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h1 className="text-left text-black font-bold mb-4">
                  Your Name
                </h1>
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Full name is required" })}
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-red-500 text-[10px]">{errors.name?.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full p-2 border rounded-md"
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
                    className="w-full p-2 border rounded-md"
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
                  className="w-full bg-orange-500 text-white p-3 font-semibold rounded-md hover:bg-orange-600 transition duration-300 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    "Sign up"
                  )}
                </button>
              </form>
              <div className="block lg:hidden text-left my-2">
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
