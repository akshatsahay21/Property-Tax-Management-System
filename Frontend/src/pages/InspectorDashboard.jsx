import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import useEntries from '../hooks/useEntries';
import { Upload, FileText, CheckCircle, Clock } from 'lucide-react';

export default function InspectorDashboard() {
  const { entries, counts, loading, error, fetchEntries, createEntry, resubmitEntry } = useEntries();
  const [formData, setFormData] = useState({ fullName: '', mobileNumber: '', address: '', description: '' });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setImage(e.target.files[0]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ fullName: '', mobileNumber: '', address: '', description: '' });
    setImage(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('image', image);

    const result = editingId
      ? await resubmitEntry(editingId, data)
      : await createEntry(data);

    setFormLoading(false);
    if (result.success) {
      resetForm();
    } else {
      setFormError(result.message);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      fullName: entry.fullName,
      mobileNumber: entry.mobileNumber,
      address: entry.address,
      description: entry.description || '',
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Inspector Portal" icon={Upload} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Submitted" count={counts.submitted} />
          <StatCard icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600" label="Approved" count={counts.approved} />
          <StatCard icon={FileText} iconBg="bg-orange-50" iconColor="text-orange-600" label="Drafts / Rejected" count={counts.draft} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Submission Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <Upload size={18} className="text-primary-500" />
                {editingId ? 'Edit & Resubmit' : 'New Entry'}
              </h2>

              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{formError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name: 'fullName', label: 'Full Name', type: 'text' },
                  { name: 'mobileNumber', label: 'Mobile Number', type: 'text' },
                  { name: 'address', label: 'Address', type: 'text' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      required
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Upload Image {editingId && <span className="text-slate-400 font-normal">(optional, replaces existing)</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                  >
                    {formLoading ? 'Saving...' : editingId ? 'Resubmit Entry' : 'Submit Entry'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Entries List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Your Entries</h2>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && entries.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                <FileText className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-slate-500">No entries submitted yet.</p>
              </div>
            )}

            <div className="space-y-5">
              {entries.map(entry => (
                <div key={entry._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col sm:flex-row gap-5">
                  {entry.image && (
                    <div className="sm:w-44 h-32 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000${entry.image}`}
                        alt="Entry"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-base font-semibold text-slate-800 truncate">{entry.fullName}</h3>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="text-sm text-slate-500">📱 {entry.mobileNumber}</p>
                    <p className="text-sm text-slate-500">📍 {entry.address}</p>
                    {entry.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{entry.description}</p>}

                    {entry.status === 'draft' && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-sm text-red-600 mb-2">
                          <span className="font-medium">Rejection Reason:</span> {entry.rejectionReason}
                        </p>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
                        >
                          Edit &amp; Resubmit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
