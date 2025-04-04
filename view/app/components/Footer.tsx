import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFAF0] py-8 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Bottom Footer */}
        <div className="mt-8 flex justify-between items-center text-gray-500 text-sm">
          <p>&copy; {currentYear} SEES</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-900">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
