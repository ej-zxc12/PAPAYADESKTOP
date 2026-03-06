import React, { useState } from 'react'
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
  faEnvelope,
  faPhotoFilm,
  faArrowRightFromBracket,
  faChevronDown,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import papayaLogo from '../shared/assets/logo.jpg?url'

const AutoExpandingSidebar = ({ activePage, setActivePage, openGroups, setOpenGroups, onLogout, onExpandedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  const handleExpandedChange = (expanded) => {
    setIsExpanded(expanded)
    if (onExpandedChange) {
      onExpandedChange(expanded)
    }
  }

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faChartLine,
      hasSubmenu: false
    },
    {
      id: 'website',
      label: 'Website Content',
      icon: faGlobe,
      hasSubmenu: true,
      submenu: [
        { id: 'website_about_mission', label: 'Mission & Vision', icon: faBullseye },
        { id: 'orgchart', label: 'Organizational Chart', icon: faSitemap },
        { id: 'partners', label: 'Partners & Sponsors', icon: faHandshake }
      ]
    },
    {
      id: 'programs',
      label: 'Programs',
      icon: faGraduationCap,
      hasSubmenu: true,
      submenu: [
        { id: 'programs_apple_scholarship', label: 'Apple Scholarship', icon: faAppleWhole },
        { id: 'programs_pineapple_project', label: 'Pineapple Project', icon: faSeedling }
      ]
    },
    {
      id: 'donations',
      label: 'Donations',
      icon: faHandHoldingHeart,
      hasSubmenu: true,
      submenu: [
        { id: 'donations', label: 'Online Donations', icon: faCreditCard },
        { id: 'donations_reports', label: 'Donation Reports', icon: faChartBar }
      ]
    },
    {
      id: 'news',
      label: 'News & Updates',
      icon: faNewspaper,
      hasSubmenu: false
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: faCalendarDays,
      hasSubmenu: false
    },
    {
      id: 'sf10',
      label: 'SF10',
      icon: faFolderOpen,
      hasSubmenu: false
    },
    {
      id: 'alumni',
      label: 'Alumni',
      icon: faUserGraduate,
      hasSubmenu: false
    },
    {
      id: 'messages',
      label: 'Messages / Website Inquiries',
      icon: faEnvelope,
      hasSubmenu: false
    }
  ]

  const isActive = (itemId) => {
    return activePage === itemId
  }

  const handleItemClick = (item) => {
    if (item.hasSubmenu) {
      toggleGroup(item.id)
    } else {
      setActivePage(item.id)
    }
  }

  const handleSubItemClick = (subItem) => {
    setActivePage(subItem.id)
  }

  return (
    <div className="fixed left-0 top-0 h-screen z-50">
      <div
        className={`h-full bg-white border-r border-[#E8EAE8] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col z-[70] ${
          isExpanded ? 'w-[280px]' : 'w-[70px]'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '0.3s' }}
        onMouseEnter={() => handleExpandedChange(true)}
        onMouseLeave={() => handleExpandedChange(false)}
      >
        {/* Logo Section - Aligned with TopBar height */}
        <div className="h-[70px] border-b border-[#E8EAE8] flex items-center px-4 bg-white">
          <div className={`flex items-center ${
            isExpanded ? 'gap-3' : 'justify-center w-full'
          }`}>
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={papayaLogo}
                alt="Papaya Academy logo"
                className="w-10 h-10 rounded-full object-contain bg-white p-1 shadow-md border-2 border-[#F0C000]"
              />
            </div>

            {/* Papaya Academy Text */}
            {isExpanded && (
              <div className="flex flex-col min-w-0">
                <div className="text-lg font-bold text-[#1A1F1B] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Papaya Academy
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expand Hint */}
        {!isExpanded && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[#1E3A5F] opacity-0 transition-opacity duration-300 hover:opacity-100" />
        )}

        {/* Main Navigation */}
        <nav className="py-4 overflow-y-auto" style={{ 
          scrollbarWidth: 'thin', 
          scrollbarColor: '#E2E8F0 transparent',
          height: 'calc(100% - 200px)' // Account for top header and footer only
        }}>
          <div className="space-y-1 px-3">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  className={`w-full flex items-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative group ${
                    isExpanded 
                      ? 'px-4 py-3 gap-3 rounded-lg' 
                      : 'justify-center px-2 py-3 rounded-lg'
                  } ${
                    isActive(item.id)
                      ? 'bg-[#FEF3C0] text-[#B8920A] border-l-3 border-l-[#F0C000]'
                      : 'text-[#5C6560] hover:bg-[#FFFAE8] hover:text-[#1A1F1B]'
                  }`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Icon */}
                  <div className={`flex items-center justify-center ${
                    isExpanded ? 'w-5 text-base' : 'w-5 text-[18px]'
                  } flex-shrink-0`}>
                    <FontAwesomeIcon icon={item.icon} />
                  </div>

                  {/* Label */}
                  {isExpanded && (
                    <span 
                      className="text-[14.5px] font-medium whitespace-nowrap"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        animation: 'slideIn 0.3s ease-out'
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Chevron for submenu items */}
                  {isExpanded && item.hasSubmenu && (
                    <div className="ml-auto flex items-center justify-center w-4 h-4">
                      <FontAwesomeIcon 
                        icon={openGroups[item.id] ? faChevronDown : faChevronRight}
                        className="text-xs transition-transform duration-300"
                        style={{
                          transform: openGroups[item.id] ? 'rotate(0deg)' : 'rotate(0deg)',
                          opacity: isExpanded ? 1 : 0
                        }}
                      />
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && hoveredItem === item.id && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-[#1E3A5F] text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50"
                      style={{
                        animation: 'fadeIn 0.2s ease-out'
                      }}
                    >
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1E3A5F]" />
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {isExpanded && item.hasSubmenu && openGroups[item.id] && (
                  <div 
                    className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      maxHeight: openGroups[item.id] ? '500px' : '0px'
                    }}
                  >
                    <div className="ml-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.id}
                          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 group ${
                            isActive(subItem.id)
                              ? 'bg-[#FEF3C0] text-[#B8920A] border-l-3 border-l-[#F0C000]'
                              : 'text-[#5C6560] hover:bg-[#FFFAE8] hover:text-[#1A1F1B]'
                          }`}
                          onClick={() => handleSubItemClick(subItem)}
                          style={{
                            paddingLeft: '48px'
                          }}
                        >
                          <div className="w-4 h-4 flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={subItem.icon} className="text-sm" />
                          </div>
                          <span 
                            className="text-[13.5px] font-medium whitespace-nowrap"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-[#E8EAE8] mt-auto">
          {/* Admin Profile */}
          <div className={`p-3 ${
            isExpanded ? 'px-3' : 'px-2'
          }`}>
            <div className={`flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-[#FFFAE8] ${
              isExpanded ? 'gap-3' : 'justify-center'
            }`}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full border-2 border-[#E8EAE8] bg-gradient-to-br from-[#F0C000] to-[#B8920A] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">D</span>
              </div>

              {/* User Info */}
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1A1F1B] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Admin User
                  </div>
                  <div className="text-xs text-[#5C6560] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    admin@papayaacademy.edu
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className={`px-3 pb-3 ${
            isExpanded ? 'px-3' : 'px-2'
          }`}>
            <button
              className={`w-full flex items-center transition-all duration-300 group ${
                isExpanded 
                  ? 'px-4 py-3 gap-3 rounded-lg justify-start' 
                  : 'justify-center px-2 py-3 rounded-lg'
              } text-[#D97070] hover:bg-[rgba(217,112,112,0.1)]`}
              onClick={onLogout}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </div>
              {isExpanded && (
                <span className="text-[14.5px] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .border-l-3 {
          border-left-width: 3px;
        }

        /* Custom scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #E8EAE8;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background-color: #9CA89F;
        }
      `}</style>
    </div>
  )
}

export default AutoExpandingSidebar
