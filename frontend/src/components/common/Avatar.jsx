'use client';

import React from 'react';

// Avatar Component
const Avatar = ({
  src = null,
  initials = '',
  name = '',
  size = 'md',
  color = 'blue',
  status = null, // 'online', 'offline', 'away'
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const colorStyles = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  const displayInitials = initials || (name ? name.charAt(0).toUpperCase() : 'U');

  return (
    <div className={`relative inline-block ${className}`.trim()}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`
            ${sizeStyles[size]}
            rounded-full object-cover border-2 border-gray-200
          `.trim()}
        />
      ) : (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full flex items-center justify-center font-bold
            text-white ${colorStyles[color]}
          `.trim()}
        >
          {displayInitials}
        </div>
      )}

      {status && (
        <div
          className={`
            absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
            ${statusColors[status]}
          `.trim()}
        ></div>
      )}
    </div>
  );
};

// Avatar Group Component
export const AvatarGroup = ({ avatars = [], max = 5, size = 'md' }) => {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-3">
      {displayAvatars.map((avatar, index) => (
        <div key={index} className="border-2 border-white rounded-full">
          <Avatar
            src={avatar.src}
            initials={avatar.initials}
            name={avatar.name}
            size={size}
            color={avatar.color}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className="border-2 border-white rounded-full">
          <div
            className={`
              bg-gray-300 text-gray-700 font-bold
              rounded-full flex items-center justify-center
              ${size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'}
            `.trim()}
          >
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
