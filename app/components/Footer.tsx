import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F5F5F5] py-8 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-gray-700">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold mb-4">Your Account</h3>
            <ul className="space-y-2">
              <li>Sign Up</li>
              <li>Log In</li>
              <li>Help</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-bold mb-4">Socials</h3>
            <ul className="space-y-2">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Tiktok</li>
            </ul>
          </div>
        </div>

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
