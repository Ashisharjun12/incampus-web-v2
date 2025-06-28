import React from 'react';

const RightSidebar = () => {
  return (
    <div className="h-screen min-h-0 flex flex-col border-l border-border bg-background px-4 py-6">
      <h2 className="text-lg font-bold mb-4">Right Sidebar</h2>
      <div className="text-muted-foreground text-sm">
        {/* Add widgets, trending, suggestions, etc. here */}
        <p>This is a placeholder for the right sidebar content.</p>
      </div>
    </div>
  );
};

export default RightSidebar; 