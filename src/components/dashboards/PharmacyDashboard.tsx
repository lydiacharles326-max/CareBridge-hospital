import React, { useState, useEffect } from 'react';
import { Appointment, User } from '../../types';
import { Pill, Search, RefreshCw, CheckCircle, PackageOpen, ClipboardList, Printer } from 'lucide-react';

interface PharmacyDashboardProps {
  currentUser: User;
}

export default function PharmacyDashboard({ currentUser }: PharmacyDashboardProps) {
  const [prescriptions, setPrescriptions] = useState<Appointment[]>([]);
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated pharmacy inventory state
  const [inventory, setInventory] = useState([
    { id: 'INV-001', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 450, unit: 'capsules' },
    { id: 'INV-002', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 1200, unit: 'tablets' },
    { id: 'INV-003', name: 'Metformin 850mg', category: 'Antidiabetic', stock: 320, unit: 'tablets' },
    { id: 'INV-004', name: 'Ibuprofen 400mg', category: 'Analgesic / Anti-inflammatory', stock: 800, unit: 'tablets' },
    { id: 'INV-005', name: 'Atorvastatin 20mg', category: 'Cardiovascular', stock: 150, unit: 'tablets' },
    { id: 'INV-006', name: 'Omeprazole 20mg', category: 'Gastrointestinal', stock: 540, unit: 'capsules' },
  ]);

  const fetchPrescriptions = () => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        // Filter appointments that have prescriptions ordered
        const ordered = appts.filter((a) => a.prescription);
        setPrescriptions(ordered);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(fetchPrescriptions, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDispense = (appt: Appointment) => {
    if (!appt.prescription) return;

    const updatedPrescription = {
      ...appt.prescription,
      status: 'dispensed' as const,
    };

    const updatedAppt: Appointment = {
      ...appt,
      prescription: updatedPrescription,
    };

    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const updatedList = appts.map((a) => (a.id === appt.id ? updatedAppt : a));
        localStorage.setItem('carebridge_appointments', JSON.stringify(updatedList));
        
        // Refresh local queue
        setPrescriptions(updatedList.filter((a) => a.prescription));

        // Deduct simulated stock if match exists
        const medName = appt.prescription.medicineName.toLowerCase();
        setInventory(prev =>
          prev.map(item => {
            if (medName.includes(item.name.toLowerCase().split(' ')[0])) {
              return { ...item, stock: Math.max(0, item.stock - 10) };
            }
            return item;
          })
        );

        setSuccess(`Dispensed ${appt.prescription.medicineName} successfully to patient ${appt.fullName}!`);
        setTimeout(() => setSuccess(''), 4000);

        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter listings
  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prescription?.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-800 to-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-green-300 font-bold uppercase tracking-wider">
              CareBridge Clinical Pharmacy Hub
            </span>
            <h2 className="text-2xl font-display font-extrabold">{currentUser.name}</h2>
            <p className="text-xs text-white/70 font-mono mt-1">
              Chief Clinical Pharmacist • Dispensing Station A
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-center shrink-0">
            <span className="block text-xl font-bold font-mono">
              {prescriptions.filter((p) => p.prescription?.status === 'pending').length}
            </span>
            <span className="text-[10px] text-green-200 font-semibold uppercase tracking-wider">Pending Orders</span>
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
        {/* Left Col: Prescription Dispensary Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
            <h3 className="font-display font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-secondary" /> Doctor Prescription Requests
            </h3>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, medicine..."
                className="w-full text-xs pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {filteredPrescriptions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic">No prescriptions found.</div>
            ) : (
              filteredPrescriptions.map((p) => {
                const isPending = p.prescription?.status === 'pending';

                return (
                  <div
                    key={p.id}
                    className={`p-4 border rounded-xl transition-all ${
                      isPending ? 'border-amber-100 bg-amber-50/10' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-gray-800 text-xs">{p.fullName}</h4>
                          <span className="text-[9px] font-mono text-gray-400">ID: {p.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                              isPending ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {p.prescription?.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Prescribed by: {p.prescription?.prescribedBy} • {p.department}
                        </p>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() => handleDispense(p)}
                          className="px-3 py-1.5 bg-success hover:bg-success/90 text-white text-[10px] font-extrabold uppercase tracking-wider rounded transition-colors flex items-center gap-1 shrink-0"
                        >
                          Dispense Meds
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Printing labels for: ${p.prescription?.medicineName}\nPatient: ${p.fullName}`)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[10px] font-bold uppercase rounded flex items-center gap-1 shrink-0"
                        >
                          <Printer className="h-3 w-3" /> Print Rx Label
                        </button>
                      )}
                    </div>

                    <div className="mt-3 p-3 bg-white border border-gray-100 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-800">{p.prescription?.medicineName}</span>
                        <span className="font-mono text-success">{p.prescription?.dosage}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Frequency Schedule: {p.prescription?.frequency}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Pharmacy Inventory Logistics */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-4">
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <PackageOpen className="h-5 w-5 text-success" />
            <h3 className="font-display font-bold text-gray-800 text-sm">Dispensary Stock Inventory</h3>
          </div>

          <div className="space-y-3">
            {inventory.map((med) => (
              <div key={med.id} className="p-3 bg-gray-50/55 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-gray-800">{med.name}</h4>
                  <span className="text-[9px] text-gray-400 font-mono">{med.id} • {med.category}</span>
                </div>
                <div className="text-right">
                  <strong className={`font-mono text-sm block ${med.stock < 200 ? 'text-red-500' : 'text-gray-700'}`}>
                    {med.stock}
                  </strong>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">{med.unit} left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
