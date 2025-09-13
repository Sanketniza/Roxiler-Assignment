import  React from 'react';
import { Link } from 'react-router-dom';    

const Footer = () => {
  return (
    <footer className="bg-white py-6 shadow-inner mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()}{' '}
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Store Rating System
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;