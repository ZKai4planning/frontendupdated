import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  // IMPORTANT: wa.me numbers must NOT include "+"
  const phoneNumber = "447768262279";
  const message = "Hello! I have a query.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className="
        fixed z-9999
        bottom-24 sm:bottom-5
        h-12 w-12 sm:h-14 sm:w-14
        rounded-full
        bg-[#25D366]
        flex items-center justify-center
        shadow-lg
        transition-transform duration-200
        hover:scale-110 active:scale-95
      "
      style={{
        right: "max(16px, calc((100vw - 1740px) / 5 + 2px))",
      }}
    >
      <FaWhatsapp className="text-white text-2xl sm:text-3xl" />
    </button>
  );
};

export default WhatsAppButton;