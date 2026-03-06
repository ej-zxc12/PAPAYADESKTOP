import React from 'react';
import { FiActivity, FiGlobe, FiShield, FiClock } from 'react-icons/fi';

const BottomBar = ({ isSidebarExpanded }) => {
  return (
    <footer 
      className={`fixed bottom-0 right-0 h-[40px] bg-[#FAFAFA] border-t border-[#E8EAE8] z-40 flex items-center justify-between px-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isSidebarExpanded ? 'left-[280px]' : 'left-[70px]'
      }`}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#5C6560]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#7EB88A] animate-pulse"></div>
          System Operational
        </div>
        <div className="h-4 w-px bg-[#E8EAE8]"></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-[#9CA89F]">
            <FiGlobe className="text-xs" />
            <span>Production v1.0.4</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9CA89F]">
            <FiShield className="text-xs" />
            <span>SSL Secured</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#9CA89F]">
        <FiClock className="text-xs" />
        <span>Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </footer>
  );
};

export default BottomBar;
