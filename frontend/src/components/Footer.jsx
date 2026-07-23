import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import logoImage from "../assets/logos/main-logo.png";
const Footer = () => {
  const quickLinks = [
    { title: "About Us", links: ["Company", "Team", "Career", "Blog"] },
    { title: "Services", links: ["Web Design", "Development", "Marketing", "Consulting"] },
    { title: "Support", links: ["Help Center", "Contact Us", "FAQ", "Community"] }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, label: "Facebook", href: "#" },
    { icon: <FaTwitter />, label: "Twitter", href: "#" },
    { icon: <FaInstagram />, label: "Instagram", href: "#" },
    { icon: <FaLinkedin />, label: "LinkedIn", href: "#" },
    { icon: <FaGithub />, label: "GitHub", href: "#" }
  ];

  return (
    <footer className="bg-red-900 text-gray-300 rounded-t-3xl ">
      <div className="max-w-full h-auto mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src={logoImage}
                alt="Company Logo"
                className="h-8 w-8 rounded"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9";
                  e.target.onerror = null;
                }}
              />
              <h2 className="text-xl font-bold text-white">CARENT</h2>
            </div>
            <p className="text-md text-white">
              Empowering innovation through cutting-edge technology solutions and exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          {quickLinks.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-white hover:text-gray-400 transition-colors duration-300 text-md block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-white hover:text-gray-400 transition-colors duration-300 transform hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="text-sm text-white">
              <p>© {new Date().getFullYear()} CARENT. All rights reserved.</p>
              <div className="flex space-x-4 mt-2">
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;