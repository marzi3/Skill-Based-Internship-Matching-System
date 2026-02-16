'use client';

import React, { useState } from 'react';

// Calendar Component
const Calendar = ({
  value = null,
  onChange = null,
  minDate = null,
  maxDate = null,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Check if date is within allowed range
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;

    setSelectedDate(newDate);
    if (onChange) {
      onChange(newDate.toISOString().split('T')[0]);
    }
  };

  const days = [];
  const totalDays = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const isDateSelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDateDisabled = (day) => {
    if (!day) return true;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 max-w-sm ${className}`.trim()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition duration-300"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <h3 className="text-lg font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition duration-300"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleSelectDate(day)}
            disabled={isDateDisabled(day)}
            className={`
              p-2 text-sm font-medium rounded-lg transition duration-300
              ${!day ? 'invisible' : ''}
              ${isDateSelected(day)
                ? 'bg-blue-600 text-white'
                : isDateDisabled(day)
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-900 hover:bg-gray-100'
              }
            `.trim()}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
