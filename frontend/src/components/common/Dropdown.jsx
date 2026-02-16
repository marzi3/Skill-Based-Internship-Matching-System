'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Dropdown Component
const Dropdown = ({
  trigger,
  items = [],
  isOpen = false,
  onOpenChange = null,
  align = 'left', // 'left', 'center', 'right'
  className = '',
}) => {
  const [open, setOpen] = useState(isOpen);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onOpenChange]);

  const alignStyles = {
    left: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    right: 'right-0',
  };

  return (
    <div className={`relative inline-block ${className}`.trim()}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="inline-flex items-center gap-2"
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={contentRef}
          className={`
            absolute top-full mt-2 w-48 bg-white rounded-lg
            shadow-lg border border-gray-200 z-50
            ${alignStyles[align]}
          `.trim()}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div key={index}>
                {item.divider ? (
                  <div className="my-1 border-t border-gray-200"></div>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-300"
                    onClick={() => {
                      setOpen(false);
                      if (onOpenChange) onOpenChange(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                      if (onOpenChange) onOpenChange(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-300 font-medium"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
