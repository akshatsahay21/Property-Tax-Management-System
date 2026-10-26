import React from 'react';


const StatCard = ({ icon: Icon, iconBg, iconColor, label, count }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{count}</h3>
      </div>
    </div>
  );
};

export default StatCard;
