'use client';

import { useState, ReactNode } from 'react';
import Section1 from './tabs/Section1';
import Section2 from './tabs/Section2';
import Section3 from './tabs/Section3';
import Section4 from './tabs/Section4';
import Section5 from './tabs/Section5';
import Section6 from './tabs/Section6';
import Section7 from './tabs/Section7';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabTitles: string[] = [
    'TAE Qualifications & Units',
    'Tertiary Education',
    'Vocational Qualifications',
    'Industry Licences or Regulated Outcomes',
    'Vocational Experience',
    'Vocational Competency',
    'Professional Development',
  ];

  const sections: ReactNode[] = [
    <Section1 key="section1" />,
    <Section2 key="section2" />,
    <Section3 key="section3" />,
    <Section4 key="section4" />,
    <Section5 key="section5" />,
    <Section6 key="section6" />,
    <Section7 key="section7" />,
  ];

  return (
    <div className="p-4 text-sm">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabTitles.map((title, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition ${
              activeTab === index
                ? 'bg-[#e0f7f7] text-teal-800 border-teal-600'
                : 'bg-white text-gray-700 hover:bg-[#e6fffa] hover:text-teal-700 border-transparent'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {title}
          </button>
        ))}
      </div>
      <div>{sections[activeTab]}</div>
    </div>
  );
};

export default Tabs;
