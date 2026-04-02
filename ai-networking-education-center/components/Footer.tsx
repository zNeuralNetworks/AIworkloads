
import React from 'react';
import { Settings } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-slate-950 py-12 border-t border-slate-900 text-center relative z-10">
      <div className="container mx-auto px-6">
        <p className="text-slate-500 text-sm">
          Scientific Workflow Architecture. Architecture reference for workload behavior and infrastructure implications.
        </p>
        
        {/* Discreet Admin Trigger - No Hint */}
        <button 
          onClick={onAdminClick}
          className="absolute bottom-4 right-4 text-slate-800 hover:text-slate-600 transition-colors p-2"
        >
          <Settings size={14} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
