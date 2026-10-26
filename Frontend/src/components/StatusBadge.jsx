import React from 'react';

/**
 * StatusBadge - Renders a colour-coded pill for an entry status
 */
const StatusBadge = ({ status }) => {
  const styles = {
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    draft: 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
