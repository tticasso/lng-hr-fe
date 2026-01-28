// import React, { useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
// import logoLNG from "../../assets/LNG.png";

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || "/";

//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       await login(formData.email, formData.password);
//       navigate(from, { replace: true });
//     } catch (err) {
//       setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex w-full bg-gray-50">
//       {/* Cột trái: Hình ảnh Branding */}
//       <div className="hidden lg:flex w-1/2 bg-blue-200 items-center justify-center relative overflow-hidden rounded-r-2xl">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 opacity-90 z-10" />
//         <img
//           src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
//           alt="Office"
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//         <div className="relative z-20 text-white p-12 text-center flex flex-col justify-center items-center">
//           <img className="w-1/2" src={logoLNG} alt="logoLNG" />
//           <h2 className="text-4xl font-bold mb-4">LNG HR System</h2>
//           <p className="text-blue-100 text-lg">
//             Quản lý nhân sự hiệu quả, tối ưu hóa quy trình làm việc.
//           </p>
//         </div>
//       </div>

//       {/* Cột phải: Form Đăng nhập */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
//               <Lock size={24} />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Chào mừng trở lại!
//             </h1>
//             <p className="text-sm text-gray-500 mt-2">
//               Vui lòng đăng nhập để truy cập hệ thống.
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email Field */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   placeholder="name@company.com"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Mật khẩu
//                 </label>
//                 <a
//                   href="#"
//                   className="text-sm font-medium text-blue-600 hover:text-blue-500"
//                 >
//                   Quên mật khẩu?
//                 </a>
//               </div>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
//                   Đang xử lý...
//                 </>
//               ) : (
//                 "Đăng nhập"
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-xs text-gray-400">
//             &copy; 2025 IT LNG Inc. All rights reserved.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
