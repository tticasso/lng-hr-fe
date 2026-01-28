import React from "react";

const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  const baseStyle =
    "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
    secondary:
      "bg-white text-text-primary border border-gray-300 hover:bg-gray-50 focus:ring-gray-200",
    danger: "bg-error text-white hover:bg-red-600 focus:ring-error",
    ghost: "text-secondary hover:bg-gray-100 hover:text-text-primary",
    OT: "bg-orange-500 text-white shadow-md hover:bg-orange-600 focus:ring-orange-500",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
