import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartLine, 
  faGlobe, 
  faBookOpen, 
  faBullseye, 
  faSitemap, 
  faHandshake,
  faGraduationCap,
  faAppleWhole,
  faSeedling,
  faHandHoldingHeart,
  faCreditCard,
  faChartBar,
  faNewspaper,
  faCalendarDays,
  faFolderOpen,
  faUserGraduate,
  faUserPlus,
  faPhotoFilm,
  faArrowRightFromBracket,
  faChevronDown,
  faChevronRight,
  faXmark
} from '@fortawesome/free-solid-svg-icons'
import papayaLogo from '../shared/assets/logo.jpg?url'

const AutoExpandingSidebar = ({ activePage, setActivePage, openGroups, setOpenGroups, onLogout, onExpandedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const sidebarRef = useRef(null)
  const indicatorRef = useRef(null)
  const menuItemsRef = useRef({})
  const logoRef = useRef(null)
  const logoContainerRef = useRef(null)
  const subMenuRefs = useRef({})
  const ctx = useRef(null)

  // GSAP Context for cleanup
  useEffect(() => {
    ctx.current = gsap.context(() => {})
    return () => ctx.current.revert()
  }, [])

  const updateActiveBar = useCallback((immediate = false) => {
    let targetPage = activePage;
    
    // Logic to find the parent if the current active page is a submenu item but its group is closed
    menuItems.forEach(item => {
      if (item.hasSubmenu) {
        const isSubItemActive = item.submenu.some(sub => sub.id === activePage);
        if (isSubItemActive && !openGroups[item.id]) {
          targetPage = item.id;
        }
      }
    });

    const activeItem = menuItemsRef.current[targetPage]
    if (activeItem && indicatorRef.current && sidebarRef.current) {
      const rect = activeItem.getBoundingClientRect()
      const sidebarRect = sidebarRef.current.getBoundingClientRect()
      const relativeTop = rect.top - sidebarRect.top

      gsap.to(indicatorRef.current, {
        top: relativeTop,
        height: rect.height,
        duration: immediate ? 0 : 0.35,
        ease: 'power2.inOut',
        overwrite: true
      })
    }
  }, [activePage, openGroups])

  // Update bar on page change or menu shifts
  useEffect(() => {
    updateActiveBar()
  }, [activePage, openGroups, updateActiveBar])

  // Handle Sidebar Toggle with GSAP
  const toggleSidebar = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    if (onExpandedChange) onExpandedChange(newExpanded)

    ctx.current.add(() => {
      // Sidebar Width
      gsap.to(sidebarRef.current, {
        width: newExpanded ? 220 : 56,
        duration: 0.35,
        ease: 'power2.inOut'
      })

      // Labels Fade
      const labels = sidebarRef.current.querySelectorAll('.label-anim')
      gsap.to(labels, {
        opacity: newExpanded ? 1 : 0,
        x: newExpanded ? 0 : -10,
        duration: newExpanded ? 0.2 : 0.15,
        delay: newExpanded ? 0.18 : 0,
        ease: newExpanded ? 'power2.out' : 'power2.in'
      })
    })

    // Allow layout to settle before updating bar
    setTimeout(() => updateActiveBar(), 50)
  }

  const toggleGroup = (groupName) => {
    const isOpening = !openGroups[groupName]
    setOpenGroups(prev => ({ ...prev, [groupName]: isOpening }))
    
    const subMenu = subMenuRefs.current[groupName]
    if (subMenu) {
      ctx.current.add(() => {
        if (isOpening) {
          gsap.fromTo(subMenu, 
            { height: 0, opacity: 0 }, 
            { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' }
          )
        } else {
          gsap.to(subMenu, 
            { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut' }
          )
        }
      })
    }
    // Adjust timing to account for different layouts
    setTimeout(() => updateActiveBar(), isExpanded ? 360 : 100)
  }

  const handleItemClick = (e, item) => {
    // Click Flash
    const btn = menuItemsRef.current[item.id]
    gsap.fromTo(btn,
      { backgroundColor: 'rgba(239,159,39,0.25)' },
      { backgroundColor: 'transparent', duration: 0.6, clearProps: 'backgroundColor' }
    )

    if (item.hasSubmenu) {
      toggleGroup(item.id)
    } else {
      setActivePage(item.id)
    }
  }

  const handleIconHover = (itemId, isEntering) => {
    const btn = menuItemsRef.current[itemId]
    if (!btn) return
    const icon = btn.querySelector('.fa-icon-container')
    if (icon) {
      gsap.to(icon, {
        scale: isEntering ? 1.15 : 1,
        duration: 0.15,
        ease: isEntering ? 'back.out(2)' : 'power1.inOut'
      })
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: faChartLine, hasSubmenu: false },
    { id: 'website', label: 'Website Content', icon: faGlobe, hasSubmenu: true, 
      submenu: [
        { id: 'website_about_mission', label: 'Mission & Vision', icon: faBullseye },
        { id: 'orgchart', label: 'Organizational Chart', icon: faSitemap },
        { id: 'partners', label: 'Partners & Sponsors', icon: faHandshake }
      ]
    },
    { id: 'programs', label: 'Programs', icon: faGraduationCap, hasSubmenu: true,
      submenu: [
        { id: 'programs_apple_scholarship', label: 'Apple Scholarship', icon: faAppleWhole },
        { id: 'programs_pineapple_project', label: 'Pineapple Project', icon: faSeedling }
      ]
    },
    { id: 'donations', label: 'Donations', icon: faHandHoldingHeart, hasSubmenu: true,
      submenu: [
        { id: 'donations', label: 'Online Donations', icon: faCreditCard },
        { id: 'donations_reports', label: 'Donation Reports', icon: faChartBar }
      ]
    },
    { id: 'news', label: 'News & Updates', icon: faNewspaper, hasSubmenu: false },
    { id: 'calendar', label: 'Calendar', icon: faCalendarDays, hasSubmenu: false },
    { id: 'sf10', label: 'SF10', icon: faFolderOpen, hasSubmenu: false },
    { id: 'alumni', label: 'Alumni', icon: faUserGraduate, hasSubmenu: false },
    { id: 'messages', label: 'Add Accounts', icon: faUserPlus, hasSubmenu: false }
  ]

  const isActive = (itemId) => {
    if (activePage === itemId) return true;
    
    // Check if any sub-item is active while this group is closed
    const item = menuItems.find(m => m.id === itemId);
    if (item && item.hasSubmenu && !openGroups[itemId]) {
      return item.submenu.some(sub => sub.id === activePage);
    }
    
    return false;
  }

  return (
    <div className="fixed left-0 top-0 h-screen z-50">
      <div
        ref={sidebarRef}
        className={`h-full bg-white border-r border-[#E8EAE8] flex flex-col z-[70] relative w-[56px] overflow-hidden transition-all duration-300 ${!isExpanded ? 'collapsed' : ''}`}
        style={{ perspective: '1000px' }}
      >
        {/* Sliding Active Indicator Bar */}
        <div 
          ref={indicatorRef}
          id="activeBar"
          className="absolute left-0 w-[3px] bg-[#EF9F27] z-[80] rounded-r-[3px] shadow-[0_0_8px_rgba(239,159,39,0.4)]"
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Logo Section */}
        <div 
          ref={logoContainerRef}
          className="h-[70px] border-b border-[#E8EAE8] flex items-center px-2 bg-white relative cursor-pointer group"
          onClick={toggleSidebar}
        >
          <div className={`flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center w-full'}`}>
            <img
              ref={logoRef}
              src={papayaLogo}
              alt="Logo"
              className="w-8 h-8 rounded-full object-contain bg-white p-0.5 shadow-sm border border-[#F0C000]"
            />
            {isExpanded && (
              <span className="text-[16px] font-bold text-[#1A1F1B] whitespace-nowrap label-anim">Papaya Academy</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-4 overflow-y-auto scrollbar-hide flex-1 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  ref={el => menuItemsRef.current[item.id] = el}
                  className={`nav-item w-full flex items-center relative group transition-colors duration-200 ${
                    isExpanded ? 'px-3 py-2.5 gap-3 rounded-lg' : 'justify-center px-0 py-2.5'
                  } ${isActive(item.id) 
                    ? (isExpanded ? 'active-expanded' : 'active-collapsed') 
                    : 'text-[#5C6560] hover:bg-[#FFFAE8] hover:text-[#1A1F1B]'}`}
                  onClick={(e) => handleItemClick(e, item)}
                  onMouseEnter={() => handleIconHover(item.id, true)}
                  onMouseLeave={() => handleIconHover(item.id, false)}
                >
                  <div className={`fa-icon-container flex items-center justify-center w-8 h-8 flex-shrink-0 transition-all duration-200 rounded-lg ${isActive(item.id) ? 'nav-icon-active' : ''}`}>
                    <FontAwesomeIcon icon={item.icon} className="text-[17px]" />
                  </div>
                  
                  {isExpanded && (
                    <span className="text-[14px] font-medium whitespace-nowrap label-anim flex-1 text-left">
                      {item.label}
                    </span>
                  )}
                  
                  {isExpanded && item.hasSubmenu && (
                    <FontAwesomeIcon 
                      icon={openGroups[item.id] ? faChevronDown : faChevronRight} 
                      className="text-[10px] opacity-50 ml-auto" 
                    />
                  )}

                  {!isExpanded && (
                    <div className="icon-tooltip">{item.label}</div>
                  )}
                </button>

                {item.hasSubmenu && openGroups[item.id] && (
                  <div 
                    ref={el => subMenuRefs.current[item.id] = el}
                    className={`${isExpanded ? 'ml-4 border-l border-[#E8EAE8] my-1' : 'my-1'} space-y-0.5 overflow-hidden`}
                  >
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        ref={el => menuItemsRef.current[subItem.id] = el}
                        className={`nav-item w-full flex items-center transition-all duration-200 relative group ${
                          isExpanded 
                            ? `px-3 py-2 rounded-lg ${isActive(subItem.id) ? 'active-expanded' : 'text-[#5C6560] hover:bg-[#FFFAE8] hover:text-[#1A1F1B]'}`
                            : `justify-center py-2 ${isActive(subItem.id) ? 'active-collapsed' : 'text-[#5C6560] hover:bg-[#FFFAE8] hover:text-[#1A1F1B]'}`
                        }`}
                        onClick={(e) => {
                          setActivePage(subItem.id)
                          handleItemClick(e, subItem)
                        }}
                        onMouseEnter={() => handleIconHover(subItem.id, true)}
                        onMouseLeave={() => handleIconHover(subItem.id, false)}
                      >
                        <div className={`fa-icon-container flex items-center justify-center ${isExpanded ? 'w-6 mr-2' : 'w-8 h-8 rounded-lg'} flex-shrink-0 transition-all duration-200 ${isActive(subItem.id) ? 'nav-icon-active' : ''}`}>
                          <FontAwesomeIcon icon={subItem.icon} className={isExpanded ? 'text-[13px]' : 'text-[15px]'} />
                        </div>
                        {isExpanded && (
                          <span className="text-[13px] font-medium whitespace-nowrap label-anim text-left flex-1">{subItem.label}</span>
                        )}
                        {!isExpanded && (
                          <div className="icon-tooltip">{subItem.label}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-[#E8EAE8] p-2 space-y-1">
          <div className={`flex items-center p-2 rounded-lg hover:bg-[#FFFAE8] transition-all cursor-pointer ${isExpanded ? 'gap-3' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0C000] to-[#B8920A] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">D</div>
            {isExpanded && (
              <div className="flex-1 min-w-0 label-anim">
                <div className="text-[13px] font-semibold text-[#1A1F1B] truncate">Admin</div>
              </div>
            )}
          </div>
          <button
            className={`w-full flex items-center transition-all duration-200 ${isExpanded ? 'px-3 py-2.5 gap-3 rounded-lg' : 'justify-center py-2.5'} text-[#D97070] hover:bg-[#D97070]/10`}
            onClick={onLogout}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            {isExpanded && <span className="text-[14px] font-medium label-anim">Logout</span>}
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        /* Active States */
        .nav-item.active-expanded {
          background: rgba(254, 249, 195, 0.6);
          color: #92400E;
          border-left: 3px solid #EF9F27;
        }
        .nav-item.active-expanded .nav-icon-active {
          background: rgba(254, 249, 195, 0.8);
          color: #92400E;
        }

        .nav-item.active-collapsed {
          background: rgba(239, 159, 39, 0.12);
          border-left: 3px solid #EF9F27;
        }
        .nav-item.active-collapsed .fa-icon-container {
          color: #EF9F27;
        }

        /* Tooltips */
        .icon-tooltip {
          position: absolute;
          left: 58px;
          background: #1a1a1a;
          color: #fff;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s 2s, transform 0.2s 2s;
          z-index: 100;
        }
        .icon-tooltip::before {
          content: '';
          position: absolute;
          left: -4px; top: 50%;
          transform: translateY(-50%);
          border: 4px solid transparent;
          border-right-color: #1a1a1a;
          border-left: 0;
        }
        .nav-item:hover .icon-tooltip {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 0.2s 2s, transform 0.2s 2s;
        }
        /* Reset transition on leave to make it disappear instantly */
        .nav-item:not(:hover) .icon-tooltip {
          transition: opacity 0.1s 0s, transform 0.1s 0s;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

export default AutoExpandingSidebar
