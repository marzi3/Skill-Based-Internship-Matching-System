'use client';

import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hoverable = false,
  shadow = 'md',
  border = false,
  padding = 'md',
  rounded = 'lg',
  onClick = null,
  header = null,
  footer = null,
  image = null,
  badge = null,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white transition duration-300 ease-in-out';

  // Variant styles
  const variantStyles = {
    default: 'border-0',
    bordered: 'border border-gray-200',
    elevated: 'border-0',
  };

  // Shadow styles
  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Padding styles
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  // Border radius styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
  };

  // Hover effect
  const hoverEffect = hoverable
    ? 'hover:shadow-xl hover:scale-105 cursor-pointer'
    : '';

  // Combine all classes
  const cardClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${shadowStyles[shadow]}
    ${roundedStyles[rounded]}
    ${hoverEffect}
    ${onClick ? 'cursor-pointer' : ''}
    overflow-hidden
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}

      {/* Image Section */}
      {image && (
        <div className="w-full h-48 object-cover overflow-hidden bg-gray-100">
          <img
            src={image}
            alt="Card"
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        </div>
      )}

      {/* Header Section */}
      {header && (
        <div className={`border-b border-gray-200 ${paddingStyles[padding]}`}>
          {typeof header === 'string' ? (
            <h3 className="text-xl font-bold text-gray-900">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={!header && !footer ? paddingStyles[padding] : ''}>
        {typeof children === 'string' ? (
          <p className="text-gray-700 leading-relaxed">{children}</p>
        ) : (
          children
        )}
      </div>

      {/* Footer Section */}
      {footer && (
        <div
          className={`border-t border-gray-200 ${paddingStyles[padding]} bg-gray-50`}
        >
          {typeof footer === 'string' ? (
            <p className="text-sm text-gray-600">{footer}</p>
          ) : (
            footer
          )}
        </div>
      )}
    </div>
  );
};

// Card Grid Component
export const CardGrid = ({ children, columns = 3, gap = 'md', className = '' }) => {
  const gapStyles = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={`grid ${colStyles[columns]} ${gapStyles[gap]} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

// Feature Card Component (with icon, title, description)
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color = 'blue',
  ...props
}) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Card hoverable shadow="md" {...props}>
      <div className="flex flex-col items-center text-center">
        {Icon && (
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              colorStyles[color]
            }`}
          >
            <Icon size={32} />
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Card>
  );
};

// Internship Card Component (specific to your platform)
export const InternshipCard = ({
  title,
  company,
  location,
  salary,
  status,
  image,
  skills,
  onClick,
  ...props
}) => {
  return (
    <Card
      hoverable
      shadow="md"
      badge={status}
      image={image}
      onClick={onClick}
      {...props}
    >
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-blue-600 font-semibold mb-3">{company}</p>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {location}
        </div>

        {salary && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-green-600 font-bold text-lg">{salary}</p>
          </div>
        )}

        {skills && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Profile Card Component
export const ProfileCard = ({
  name,
  title,
  image,
  bio,
  skills,
  social,
  ...props
}) => {
  return (
    <Card shadow="lg" rounded="lg" {...props}>
      <div className="text-center">
        {image && (
          <img
            src={image}
            alt={name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100"
          />
        )}
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="text-blue-600 font-semibold mb-3">{title}</p>

        {bio && <p className="text-gray-600 text-sm mb-4">{bio}</p>}

        {skills && (
          <div className="mb-4">
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {social && (
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
            {social.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                {link.icon && <link.icon size={20} />}
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
