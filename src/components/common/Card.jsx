import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-surface rounded-md shadow-card p-5 border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
