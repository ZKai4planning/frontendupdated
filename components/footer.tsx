// components/Footer.js
import Lottie from "lottie-react";
import aiLogo from "../public/ai4planning-logo-smooth.json";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 p-8 flex justify-center items-center">
      <Lottie 
        animationData={aiLogo} 
        loop={true} 
        style={{ width: 300, height: 150 }} 
      />
    </footer>
  );
};

export default Footer;
