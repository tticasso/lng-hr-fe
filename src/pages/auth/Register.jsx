// import React, { useState } from "react";
// import { createUserApi } from "../../apis/authApi";
// import {
//   CheckCircle,
//   AlertCircle,
//   UserPlus,
//   Loader2,
//   Shield,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const Register = () => {
//   // State quản lý form
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     roles: ["USER"],
//   });

//   const [status, setStatus] = useState({ type: "", message: "" }); // 'success' | 'error'
//   const [loading, setLoading] = useState(false);

//   const availableRoles = [
//     { value: "EMPLOYEE", label: "Nhân viên (User)" },
//     { value: "HR", label: "HR" },
//     { value: "ADMIN", label: "Quản trị viên (Admin)" },
//   ];

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleRoleChange = (roleValue) => {
//     setFormData({ ...formData, roles: [roleValue] });
//   };
//   const handleCancel = () => {
//     setFormData({
//       ...formData,
//       email: "",
//       password: "",
//       confirmPassword: "",
//     });
//     navigate(-1);
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus({ type: "", message: "" });

//     // Validate cơ bản
//     if (formData.password !== formData.confirmPassword) {
//       setStatus({ type: "error", message: "Mật khẩu xác nhận không khớp!" });
//       return;
//     }

//     if (formData.password.length < 6) {
//       setStatus({
//         type: "error",
//         message: "Mật khẩu phải có ít nhất 6 ký tự.",
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       // Gọi API tạo user
//       await createUserApi({
//         email: formData.email,
//         password: formData.password,
//         roles: formData.roles,
//       });

//       setStatus({
//         type: "success",
//         message: `Đã tạo tài khoản thành công cho email: ${formData.email}`,
//       });
//       toast.success(`Đã tạo tài khoản thành công cho: ${formData.email}`);
//       // Reset form
//       setFormData({
//         email: "",
//         password: "",
//         confirmPassword: "",
//         roles: ["USER"],
//       });
//     } catch (err) {
//       setStatus({
//         type: "error",
//         message: err.message || "Tạo tài khoản thất bại.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className=" bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
//       <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
//         {/* Header Form */}
//         <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               Tạo tài khoản mới
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               Dành cho Admin cấp quyền truy cập hệ thống cho nhân viên.
//             </p>
//           </div>
//           <div className="bg-blue-100 p-3 rounded-full">
//             <UserPlus className="text-blue-600" size={24} />
//           </div>
//         </div>

//         <div className="p-8">
//           {/* Thông báo trạng thái */}
//           {status.message && (
//             <div
//               className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
//                 status.type === "success"
//                   ? "bg-green-50 text-green-700 border border-green-200"
//                   : "bg-red-50 text-red-700 border border-red-200"
//               }`}
//             >
//               {status.type === "success" ? (
//                 <CheckCircle className="shrink-0" size={20} />
//               ) : (
//                 <AlertCircle className="shrink-0" size={20} />
//               )}
//               <span className="text-sm font-medium">{status.message}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email nhân viên <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 placeholder="employee@company.com"
//               />
//             </div>

//             {/* Password Group */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Mật khẩu <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Mật khẩu khởi tạo"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Xác nhận mật khẩu <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   required
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Nhập lại mật khẩu"
//                 />
//               </div>
//             </div>

//             {/* Role Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                 <Shield size={16} /> Phân quyền hệ thống
//               </label>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {availableRoles.map((role) => (
//                   <label
//                     key={role.value}
//                     className={`
//                       relative border rounded-lg p-4 flex cursor-pointer hover:bg-gray-50 transition-all
//                       ${
//                         formData.roles.includes(role.value)
//                           ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50"
//                           : "border-gray-200"
//                       }
//                     `}
//                   >
//                     <input
//                       type="radio"
//                       name="roles"
//                       value={role.value}
//                       checked={formData.roles.includes(role.value)}
//                       onChange={() => handleRoleChange(role.value)}
//                       className="sr-only" // Ẩn radio mặc định
//                     />
//                     <div className="flex flex-col">
//                       <span className="block text-sm font-medium text-gray-900">
//                         {role.value}
//                       </span>
//                       <span className="block text-xs text-gray-500 mt-1">
//                         {role.label}
//                       </span>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="pt-4 flex items-center justify-end border-t border-gray-100 mt-6">
//               <button
//                 type="button"
//                 className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 onClick={() => handleCancel()}
//               >
//                 Hủy bỏ
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
//               >
//                 {loading && (
//                   <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
//                 )}
//                 Tạo tài khoản
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;
