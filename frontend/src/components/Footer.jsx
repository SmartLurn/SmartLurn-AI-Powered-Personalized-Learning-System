import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 px-5 py-3">
      <p className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SmartLurn · Learn better, together
      </p>
    </footer>
  );
};

export default Footer;