import React, { useState } from "react";

interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  className,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className={`relative ${className}`}
    >
      {show && (
        <div className="absolute z-10 p-2 dark:bg-dark-bg min-h-96 overflow-auto dark:text-dark-text border border-gray-200 rounded shadow-md">
          {content}
        </div>
      )}
      {children}
    </div>
  );
};
