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
    '2xl': 'w-24 h-24 text-xl',
    full: 'w-full h-full text-2xl',
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

  const getImageUrl = (source) => {
    if (!source) return null;
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    
    // For relative paths (local uploads), prepend the backend origin
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
    let baseUrl = apiUrl;
    try {
      const url = new URL(apiUrl);
      baseUrl = url.origin;
    } catch {
      baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
    }
    
    const cleanSource = source.startsWith('/') ? source.substring(1) : source;
    return `${baseUrl}/${cleanSource}`;
  };

  const imageSrc = getImageUrl(src);
  const wrapperClassName = className
    .replace(/\b(rounded[^\s]*|border[^\s]*|ring[^\s]*|shadow[^\s]*)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <div className={`relative inline-block ${wrapperClassName}`.trim()}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className={`
            ${sizeStyles[size]}
            object-cover border-2 border-gray-200
            ${className} rounded-full
          `.trim()}
        />
      ) : (
        <div
          className={`
            ${sizeStyles[size]}
            flex items-center justify-center font-bold
            text-white ${colorStyles[color]}
            ${className} rounded-full
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
