import React from 'react';

interface Tab {
  label: string;
  key: string;
}

interface ProviderDashboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const ProviderDashboardTabs: React.FC<ProviderDashboardTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-violet-900 w-full">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`relative pb-2 text-lg font-semibold transition-colors duration-200 focus:outline-none flex-1 text-center ${
            activeTab === tab.key
              ? 'text-white'
              : 'text-white/70'
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute left-0 right-0 bottom-0 h-1 rounded bg-blue-400" style={{ width: '100%' }} />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProviderDashboardTabs; 