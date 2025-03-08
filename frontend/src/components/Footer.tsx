const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-xl font-bold">Dr. AI</span>
            </div>
            <p className="text-gray-400 mt-1">Your AI Medical Assistant</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Dr. AI. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Disclaimer: Dr. AI provides information for educational purposes
              only.
              <br />
              Always consult with a qualified healthcare provider for medical
              advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
