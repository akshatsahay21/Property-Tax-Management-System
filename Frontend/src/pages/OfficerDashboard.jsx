import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import useOfficerEntries from '../hooks/useOfficerEntries';
import { Shield, Check, X, Inbox } from 'lucide-react';

export default function OfficerDashboard() {
  const { entries, loading, error, fetchPending, fetchDrafts, approveEntry, rejectEntry } = useOfficerEntries();
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPending();
    } else {
      fetchDrafts();
    }
  }, [activeTab, fetchPending, fetchDrafts]);

  const handleApprove = async (id) => {
    setActionError('');
    const result = await approveEntry(id);
    if (result.success) {
      fetchPending();
    } else {
      setActionError(result.message);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setActionError('');
    const result = await rejectEntry(rejectingId, rejectionReason);
    if (result.success) {
      setRejectingId(null);
      setRejectionReason('');
      fetchPending();
    } else {
      setActionError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Officer Portal" icon={Shield} iconColor="text-primary-400" dark />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Action-level error */}
        {actionError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-5 border border-red-100 text-center">
            {actionError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          {[
            { key: 'pending', label: 'Pending Reviews' },
            { key: 'drafts', label: 'My Rejected Drafts' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setRejectingId(null); setRejectionReason(''); }}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
            <Inbox className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-600 font-medium">No entries found.</p>
            <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-6">
          {!loading && entries.map(entry => (
            <div key={entry._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {entry.status === 'draft' && <div className="h-1 w-full bg-orange-400"></div>}
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {entry.image && (
                  <div className="md:w-56 h-44 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                    <img
                      src={`http://localhost:5000${entry.image}`}
                      alt="Entry"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{entry.fullName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="text-sm text-slate-500">📱 {entry.mobileNumber}</span>
                        <span className="text-sm text-slate-500">📍 {entry.address}</span>
                      </div>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>

                  {entry.inspector && (
                    <p className="text-xs text-slate-400 mb-2">
                      Submitted by: <span className="font-medium text-slate-600">{entry.inspector.name}</span> ({entry.inspector.email})
                    </p>
                  )}

                  {entry.description && (
                    <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100 text-sm text-slate-700 leading-relaxed flex-1">
                      {entry.description}
                    </div>
                  )}

                  {entry.status === 'draft' && entry.rejectionReason && (
                    <div className="mb-4 bg-orange-50 text-orange-800 p-3 rounded-lg text-sm border border-orange-100">
                      <span className="font-semibold">Rejection Reason:</span> {entry.rejectionReason}
                    </div>
                  )}

                  {/* Action buttons - only for pending tab */}
                  {activeTab === 'pending' && rejectingId !== entry._id && (
                    <div className="flex gap-3 mt-auto border-t border-slate-100 pt-4">
                      <button
                        onClick={() => handleApprove(entry._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectingId(entry._id); setRejectionReason(''); }}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  )}

                  {/* Rejection form */}
                  {rejectingId === entry._id && (
                    <form onSubmit={handleRejectSubmit} className="mt-auto border-t border-slate-100 pt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reason for rejection:
                      </label>
                      <textarea
                        required
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none mb-3 resize-none text-sm"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="E.g. Image is blurry, please upload a clearer one..."
                      ></textarea>
                      <div className="flex gap-3">
                        <button type="submit"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors">
                          Confirm Rejection
                        </button>
                        <button type="button"
                          onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
