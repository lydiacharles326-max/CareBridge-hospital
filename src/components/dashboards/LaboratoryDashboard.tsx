import React, { useState, useEffect } from 'react';
import { Appointment, User } from '../../types';
import { FlaskConical, Search, RefreshCw, CheckCircle, ClipboardList, Send } from 'lucide-react';

interface LaboratoryDashboardProps {
  currentUser: User;
}

export default function LaboratoryDashboard({ currentUser }: LaboratoryDashboardProps) {
  const [labs, setLabs] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState<Appointment | null>(null);
  
  // Results form
  const [testResult, setTestResult] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLabRequests = () => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        // Filter appointments that have ordered lab requests
        const filtered = appts.filter((a) => a.labRequest);
        setLabs(filtered);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchLabRequests();
    const interval = setInterval(fetchLabRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePostResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab || !selectedLab.labRequest) return;

    const updatedLabRequest = {
      ...selectedLab.labRequest,
      status: 'completed' as const,
      result: testResult.trim(),
      completedBy: currentUser.name,
      completedAt: new Date().toISOString(),
    };

    const updatedAppt: Appointment = {
      ...selectedLab,
      labRequest: updatedLabRequest,
    };

    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const updatedList = appts.map((a) => (a.id === selectedLab.id ? updatedAppt : a));
        localStorage.setItem('carebridge_appointments', JSON.stringify(updatedList));

        setLabs(updatedList.filter((a) => a.labRequest));
        setTestResult('');
        setSuccess(`Successfully uploaded diagnostic laboratory outcome for ${selectedLab.fullName}!`);
        setSelectedLab(null);

        setTimeout(() => setSuccess(''), 4000);

        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter listings
  const filteredLabs = labs.filter(
    (l) =>
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.labRequest?.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-800 to-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
              CareBridge Diagnostic Laboratory
            </span>
            <h2 className="text-2xl font-display font-extrabold">{currentUser.name}</h2>
            <p className="text-xs text-white/70 font-mono mt-1">
              Medical Laboratory Scientist (MLS) • Pathology Wing
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-center shrink-0">
            <span className="block text-xl font-bold font-mono">
              {labs.filter((l) => l.labRequest?.status === 'pending').length}
            </span>
            <span className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider">Pending Analysis</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Diagnostic Order Book */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
            <h3 className="font-display font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-secondary" /> Doctor Lab Requests
            </h3>
            <div className="relative w-full sm:w-44">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, test..."
                className="w-full text-xs pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {filteredLabs.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic">No lab tests ordered.</div>
            ) : (
              filteredLabs.map((l) => {
                const isPending = l.labRequest?.status === 'pending';

                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      setSelectedLab(l);
                      if (l.labRequest?.status === 'completed') {
                        setTestResult(l.labRequest.result || '');
                      } else {
                        setTestResult('');
                      }
                    }}
                    className={`p-3.5 border rounded-xl transition-all cursor-pointer text-left ${
                      selectedLab?.id === l.id
                        ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                        : isPending
                        ? 'border-amber-100 bg-amber-50/10'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-gray-800 text-xs">{l.fullName}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {l.id}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {l.labRequest?.status}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Ordered by: <strong>{l.labRequest?.requestedBy}</strong></span>
                      <span className="font-semibold text-gray-700">{l.labRequest?.testType}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Logging Outcome panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 card-shadow">
          {!selectedLab ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4 text-secondary">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-gray-700 text-sm mb-1">Select Ordered Analysis</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Select an ordered diagnostic request from the laboratory queue list on the left to process samples and write clinical diagnostic results.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  Patient Laboratory File
                </span>
                <h3 className="text-lg font-display font-extrabold text-primary">{selectedLab.fullName}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Ordered Specimen: <strong>{selectedLab.labRequest?.testType}</strong> • Doctor: {selectedLab.labRequest?.requestedBy}
                </p>
              </div>

              {selectedLab.labRequest?.instructions && (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase mb-1">Clinical Instructions:</span>
                  <p className="text-gray-600 italic">"{selectedLab.labRequest.instructions}"</p>
                </div>
              )}

              {selectedLab.labRequest?.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50/20 border border-green-150 rounded-xl text-xs space-y-2">
                    <span className="text-[10px] text-green-800 font-bold uppercase font-mono block">Published Diagnostic Results:</span>
                    <p className="text-gray-700 font-bold font-mono text-sm">{selectedLab.labRequest.result}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-green-100">
                      <span>Lab Scientist: {selectedLab.labRequest.completedBy}</span>
                      <span>Published: {new Date(selectedLab.labRequest.completedAt || '').toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLab(null)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Close Lab File
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostResult} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Write Diagnostic Laboratory Results *
                    </label>
                    <textarea
                      required
                      placeholder="e.g. Hematology Panel: PCV 41%, White Blood Cell Count 6.4 x 10^3 / uL. Malaria Parasite: Negative. No abnormal cells found."
                      rows={5}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none"
                      value={testResult}
                      onChange={(e) => setTestResult(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedLab(null)}
                      className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-success text-white hover:bg-success/90 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-success/10"
                    >
                      <Send className="h-4 w-4" /> Publish Diagnostics Result
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
