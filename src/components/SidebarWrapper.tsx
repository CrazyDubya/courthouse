import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { useCourtroomStore } from '../store/useCourtroomStore';

interface SidebarWrapperProps {
  side: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ 
  side, 
  children, 
  className = '' 
}) => {
  const {
    isLeftSidebarCollapsed,
    isRightSidebarCollapsed,
    leftSidebarWidth,
    rightSidebarWidth,
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebarWidth,
    setRightSidebarWidth,
  } = useCourtroomStore();

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isCollapsed = side === 'left' ? isLeftSidebarCollapsed : isRightSidebarCollapsed;
  const width = side === 'left' ? leftSidebarWidth : rightSidebarWidth;
  const toggleSidebar = side === 'left' ? toggleLeftSidebar : toggleRightSidebar;
  const setWidth = side === 'left' ? setLeftSidebarWidth : setRightSidebarWidth;

  // Responsive width calculations
  const collapsedWidth = 80; // Icon-only width
  const currentWidth = isCollapsed ? collapsedWidth : width;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = side === 'left' ? e.clientX - startX : startX - e.clientX;
      const newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, setWidth, side]);

  // Check if mobile screen
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && !isCollapsed && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        className={`
          relative bg-gray-900 border-gray-800 overflow-hidden z-50
          ${side === 'left' ? 'border-r' : 'border-l'}
          ${isMobile ? 'fixed top-0 bottom-0 shadow-2xl' : 'relative'}
          ${isMobile && side === 'left' ? 'left-0' : ''}
          ${isMobile && side === 'right' ? 'right-0' : ''}
          ${className}
        `}
        style={{ 
          width: currentWidth,
          minWidth: isCollapsed ? collapsedWidth : 200,
          maxWidth: isMobile ? '80vw' : 600
        }}
        initial={false}
        animate={{
          width: currentWidth,
          x: isMobile && isCollapsed ? (side === 'left' ? -currentWidth : currentWidth) : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Collapse/Expand Toggle Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <HiMenu className="w-5 h-5" />
            ) : (
              <HiX className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className={`h-full ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 flex flex-col items-center space-y-4 mt-16"
              >
                {/* Collapsed view - just icons */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Controls</div>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <HiMenu className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resize Handle */}
        {!isCollapsed && !isMobile && (
          <div
            className={`
              absolute top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize z-20
              ${side === 'left' ? 'right-0' : 'left-0'}
              ${isResizing ? 'bg-blue-500' : ''}
            `}
            onMouseDown={handleMouseDown}
          >
            <div
              className={`
                absolute top-1/2 transform -translate-y-1/2 w-3 h-8 bg-gray-700 rounded-full opacity-0 hover:opacity-100 transition-opacity
                ${side === 'left' ? '-right-1' : '-left-1'}
                ${isResizing ? 'opacity-100' : ''}
              `}
            />
          </div>
        )}
      </motion.div>
    </>
  );
};

// Mobile Floating Action Button
export const MobileSidebarFAB: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const {
    isLeftSidebarCollapsed,
    isRightSidebarCollapsed,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useCourtroomStore();

  const isCollapsed = side === 'left' ? isLeftSidebarCollapsed : isRightSidebarCollapsed;
  const toggleSidebar = side === 'left' ? toggleLeftSidebar : toggleRightSidebar;

  // Only show on mobile when sidebar is collapsed
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (!isMobile || !isCollapsed) {
    return null;
  }

  return (
    <motion.button
      className={`
        fixed bottom-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50
        flex items-center justify-center lg:hidden
        ${side === 'left' ? 'left-6' : 'right-6'}
      `}
      onClick={toggleSidebar}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Open ${side} sidebar`}
    >
      <HiMenu className="w-6 h-6" />
    </motion.button>
  );
};