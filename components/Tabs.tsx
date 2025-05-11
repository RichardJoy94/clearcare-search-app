import { useState, ReactNode } from 'react';

interface TabProps {
  label: string;
  children: ReactNode;
}

function Tab({ label, children }: TabProps) {
  return <div>{children}</div>;
}

interface TabsProps {
  tabs: { label: string; content: ReactNode }[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              border: index === activeIndex ? '2px solid black' : '1px solid #ccc',
              borderBottom: index === activeIndex ? 'none' : '1px solid #ccc',
              backgroundColor: index === activeIndex ? '#fff' : '#f9f9f9'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[activeIndex].content}</div>
    </div>
  );
}
