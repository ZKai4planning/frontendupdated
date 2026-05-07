import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = ({
  inline = false,
}: {
  inline?: boolean
}) => {
  // IMPORTANT: wa.me numbers must NOT include "+"
  const phoneNumber = "447777788885";
  const message = "Hello! I have a query.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className={
        inline
          ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:h-14 sm:w-14"
          : "fixed bottom-20 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:bottom-21 sm:right-6 sm:h-14 sm:w-14"
      }
    >
      <FaWhatsapp className="text-white text-2xl sm:text-3xl" />
    </button>
  );
};

export default WhatsAppButton;
