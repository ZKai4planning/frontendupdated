import React from "react";

const WhatsAppButton = () => {
  const phoneNumber = "+447777788885"; // country code included, no +
  const message = "Hello! I have a query.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className="
        fixed z-[9999]
        bottom-24 sm:bottom-5
        h-12 w-12 sm:h-14 sm:w-14
        rounded-full border-0
        bg-[#25D366]
        flex items-center justify-center
        shadow-[0_2px_10px_rgba(0,0,0,0.3)]
        transition hover:scale-105 active:scale-95
      "
      style={{
        cursor: "pointer",
        right: "max(16px, calc((100vw - 1740px) / 5 + 2px))",
      }}
    >
      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="white"
      >
        <path d="M16.027 2.003C8.827 2.003 3 7.831 3 15.027c0 2.65.705 5.2 2.033 7.438L3 30l7.735-2.002c2.163 1.196 4.602 1.83 7.292 1.83 7.2 0 13.027-5.827 13.027-13.027S23.227 2.003 16.027 2.003zm0 23.86c-2.313 0-4.582-.65-6.532-1.88l-.468-.292-4.585 1.187 1.223-4.467-.305-.476c-1.198-1.872-1.83-4.046-1.83-6.404 0-6.526 5.293-11.82 11.82-11.82s11.82 5.293 11.82 11.82c0 6.526-5.293 11.82-11.82 11.82zm6.455-8.682c-.352-.176-2.08-1.026-2.405-1.145-.325-.12-.562-.176-.798.177-.236.352-.917 1.145-1.123 1.38-.206.236-.412.265-.764.088-.352-.176-1.486-.548-2.83-1.745-1.046-.933-1.752-2.08-1.958-2.432-.206-.352-.022-.542.154-.717.158-.158.352-.412.528-.618.176-.206.236-.352.352-.588.118-.236.06-.442-.03-.618-.088-.176-.798-1.918-1.092-2.63-.288-.692-.58-.598-.798-.608-.206-.01-.442-.012-.678-.012s-.618.088-.94.442c-.324.354-1.236 1.208-1.236 2.948s1.266 3.418 1.44 3.654c.177.236 2.49 3.804 6.04 5.335.843.364 1.5.582 2.015.745.846.27 1.617.232 2.226.14.68-.102 2.08-.85 2.372-1.67.293-.82.293-1.52.205-1.67-.088-.148-.324-.236-.676-.412z" />
      </svg>
    </button>
  );
};

export default WhatsAppButton;
