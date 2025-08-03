'use client';

import React from 'react';

type ProgressCircleProps = {
  percentage: number;
  label: string;
  color?: 'green' | 'red' | 'orange' | 'blue';
};

export default function ProgressCircle({
  percentage,
  label,
  color = 'blue',
}: ProgressCircleProps) {
  const radius = 45;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap: Record<string, string> = {
    green: 'stroke-green-500 text-green-600',
    red: 'stroke-red-500 text-red-600',
    orange: 'stroke-orange-500 text-orange-600',
    blue: 'stroke-blue-500 text-blue-600',
  };

  const colorClass = colorMap[color] || colorMap.blue;

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2} className="mb-2">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          stroke="currentColor"
          className={`transition-all duration-700 ${colorClass}`}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className={`text-sm font-medium ${colorClass.split(' ')[1]}`}>{label}</div>
    </div>
  );
}
