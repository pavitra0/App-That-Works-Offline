
import React from 'react';
import { Report, ReportCategory } from '../types';

interface Props {
  report: Report;
}

const ReportCard: React.FC<Props> = ({ report }) => {
  const getCategoryColor = (category: ReportCategory) => {
    switch (category) {
      case ReportCategory.EMERGENCY: return 'bg-red-100 text-red-700 border-red-200';
      case ReportCategory.FOOD: return 'bg-orange-100 text-orange-700 border-orange-200';
      case ReportCategory.MEDICAL: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ReportCategory.SHELTER: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getCategoryColor(report.category)}`}>
          {report.category}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(report.timestamp).toLocaleString()}
        </span>
      </div>
      
      <h3 className="font-bold text-slate-800 text-lg mb-1">{report.name}</h3>
      <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
        <i className="fa-solid fa-location-dot"></i> {report.location}
      </p>
      
      <p className="text-slate-600 text-sm line-clamp-3 mb-4">
        {report.description}
      </p>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs">
          {report.status === 'synced' ? (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> Synced
            </span>
          ) : (
            <span className="text-amber-600 font-semibold flex items-center gap-1 animate-pulse">
              <i className="fa-solid fa-clock"></i> Pending
            </span>
          )}
        </div>
        
        {report.hasImage && (
          <i className="fa-solid fa-image text-slate-400" title="Contains Image"></i>
        )}
      </div>

      {report.error && report.status === 'pending' && (
        <p className="mt-2 text-[10px] text-red-500 italic">
          Last error: {report.error}
        </p>
      )}
    </div>
  );
};

export default ReportCard;
