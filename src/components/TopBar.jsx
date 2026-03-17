import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';

const TopBar = ({ title, subtitle, isSidebarExpanded, onNotificationClick, unreadCount = 0 }) => {
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const bellRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const prevTitleRef = useRef(title);

  useEffect(() => {
    // Topbar slide down
    gsap.fromTo(headerRef.current, 
      { y: -70, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    // Page title transition
    if (prevTitleRef.current !== title) {
      const tl = gsap.timeline();
      tl.to(titleRef.current, { y: -10, opacity: 0, duration: 0.2, ease: 'power2.in' })
        .fromTo(titleRef.current, 
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
      prevTitleRef.current = title;
    }
  }, [title]);

  useEffect(() => {
    // Bell wiggle if unread
    if (unreadCount > 0 && bellRef.current) {
      gsap.to(bellRef.current, {
        rotation: 15,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => gsap.to(bellRef.current, { rotation: 0 })
      });
      
      // Badge pulse
      gsap.to(badgeRef.current, {
        scale: 1.2,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    } else if (badgeRef.current) {
      gsap.set(badgeRef.current, { scale: 1 });
      gsap.killTweensOf(badgeRef.current);
    }
  }, [unreadCount]);

  const handleSearchFocus = () => {
    gsap.to(searchRef.current, { width: 320, duration: 0.4, ease: 'power2.out' });
  };

  const handleSearchBlur = () => {
    gsap.to(searchRef.current, { width: 256, duration: 0.4, ease: 'power2.inOut' });
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 right-0 h-[70px] bg-white border-b border-[#E2E8F0] z-40 flex items-center justify-between px-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isSidebarExpanded ? 'left-[280px]' : 'left-[70px]'
      }`}
    >
      {/* Left Section: Title */}
      <div className="flex items-center">
        <div ref={titleRef} className="flex flex-col">
          <h1 className="text-lg font-bold text-[#1A1F1B] leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            {title || 'Dashboard Overview'}
          </h1>
          {subtitle && (
            <span className="text-xs text-[#5C6560]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Search, Notifications, Profile */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA89F]">
            <FontAwesomeIcon icon={faSearch} className="text-sm" />
          </span>
          <input
            ref={searchRef}
            type="text"
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search records..."
            className="block w-64 pl-10 pr-4 py-2 bg-[#FAFAFA] border border-[#E8EAE8] rounded-full text-sm placeholder-[#9CA89F] focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-shadow"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Notifications */}
        <button 
          onClick={onNotificationClick}
          className="relative p-2 text-[#5C6560] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-full transition-colors group"
        >
          <div ref={bellRef}>
            <FontAwesomeIcon icon={faBell} className="text-xl" />
          </div>
          {unreadCount > 0 && (
            <span 
              ref={badgeRef}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F0C000] rounded-full border-2 border-white"
            ></span>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-[#E8EAE8]"></div>

        {/* Profile Info */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-[#FAFAFA] p-1.5 rounded-lg transition-all group"
          onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -2, duration: 0.2 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.2 })}
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-[#1A1F1B] group-hover:text-[#F0C000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Admin User
            </span>
            <span className="text-[11px] text-[#9CA89F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Super Administrator
            </span>
          </div>
          <div className="w-9 h-9 rounded-full border-2 border-[#E8EAE8] bg-[#FAFAFA] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
            <span className="text-[#5C6560] text-xs font-bold">D</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
