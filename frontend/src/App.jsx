import React, { useState, useEffect } from 'react';
import { Cpu, Radio, Tv, Shield, Calendar, Clock, CheckCircle2, Trash2, Sparkles, Layers, AlertTriangle, User, Mail, FileText } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [resources, setResources] = useState([
    { id: 'workspace-a', name: 'Cyber Lab Alpha', type: 'High-Performance Workstation', capacity: 4, icon: 'Cpu' },
    { id: 'workspace-b', name: 'Quantum Pod 01', type: 'Soundproof Focus Capsule', capacity: 1, icon: 'Radio' },
    { id: 'lounge-v', name: 'Neon VR Lounge', type: 'Immersive VR Studio', capacity: 6, icon: 'Tv' },
    { id: 'conf-matrix', name: 'The Matrix Boardroom', type: 'Executive Conference Room', capacity: 12, icon: 'Shield' }
  ]);

  const [selectedResource, setSelectedResource] = useState('workspace-a');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal Form State
  const [formData, setFormData] = useState({ userName: '', userEmail: '', notes: '' });

  // Fetch Slots
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/slots?date=${selectedDate}&resourceId=${selectedResource}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
      // Fallback local slots generator if backend server isn't running yet
      setSlots([
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
        { time: '17:00', available: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Bookings for resource & date
  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedDate}/${selectedResource}`);
      const data = await res.json();
      if (data.success) {
        setConfirmedBookings(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchBookings();
    setSelectedSlot(null);
  }, [selectedResource, selectedDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: selectedResource,
          date: selectedDate,
          timeSlot: selectedSlot,
          userName: formData.userName,
          userEmail: formData.userEmail,
          notes: formData.notes
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({ type: 'success', text: `Reservation confirmed for ${selectedSlot}!` });
        setFormData({ userName: '', userEmail: '', notes: '' });
        setSelectedSlot(null);
        fetchSlots();
        fetchBookings();
      } else {
        setMessage({ type: 'error', text: result.error || 'Booking failed due to conflict!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server offline or network error.' });
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Booking successfully canceled.' });
        fetchSlots();
        fetchBookings();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete booking.' });
    }
  };

  const getResourceIcon = (iconName) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-emerald-400" />;
      case 'Tv': return <Tv className="w-5 h-5 text-purple-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-pink-400" />;
      default: return <Layers className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-[#00ffcc] shadow-glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-[#00ffcc] font-mono text-xs tracking-widest uppercase mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" /> Next-Gen Workspace Reservation System
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            NEXUS <span className="text-[#00ffcc]">RESERVA</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time resource allocation engine with live backend slot verification.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>SYSTEM ACTIVE // NODE v18+</span>
        </div>
      </header>

      {/* FEEDBACK BANNER */}
      {message.text && (
        <div className={`p-4 rounded-xl font-medium text-sm flex items-center justify-between border ${
          message.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Time Slots */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Resource Selector */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00ffcc]" /> 1. Select Target Resource
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map((res) => (
                <button
                  key={res.id}
                  onClick={() => setSelectedResource(res.id)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between ${
                    selectedResource === res.id
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-[#00ffcc] shadow-glow-cyan'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {getResourceIcon(res.icon)}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Cap: {res.capacity}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-base ${selectedResource === res.id ? 'text-white' : 'text-slate-300'}`}>
                      {res.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{res.type}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Date Picker & Availability Grid */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00ffcc]" /> 2. Choose Time Slot
              </h2>
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Time Slot Buttons */}
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs animate-pulse">
                [ SCANNING AVAILABLE MATRIX SLOTS... ]
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`py-3 px-4 rounded-xl font-mono text-sm tracking-wide transition-all duration-200 border relative ${
                      !slot.available
                        ? 'bg-slate-900/20 border-slate-800/40 text-slate-600 cursor-not-allowed line-through'
                        : selectedSlot === slot.time
                        ? 'bg-[#00ffcc] text-slate-950 font-bold border-[#00ffcc] shadow-glow-green scale-105'
                        : 'bg-slate-900/60 border-slate-800 hover:border-[#00ffcc]/50 text-slate-200'
                    }`}
                  >
                    {slot.time}
                    {selectedSlot === slot.time && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Reservation Form & Active Bookings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* STEP 3: Booking Form Section */}
          <div className="glass-panel rounded-2xl p-6 border-t-2 border-t-[#00ffcc]">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#00ffcc]" /> 3. Reservation Details
            </h2>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SELECTED SLOT</label>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-sm text-[#00ffcc] flex items-center justify-between">
                  <span>{selectedSlot ? `${selectedDate} @ ${selectedSlot}` : 'No slot chosen'}</span>
                  {selectedSlot && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">FULL NAME</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brayden Gill"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-200 focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. dev@domain.com"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-200 focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">PURPOSE / NOTES</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Optional project note..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-200 focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedSlot}
                className={`w-full py-3 rounded-xl font-bold font-mono text-xs tracking-wider uppercase transition-all duration-200 shadow-lg ${
                  selectedSlot
                    ? 'bg-gradient-to-r from-[#00ffcc] to-[#00b8ff] text-slate-950 hover:brightness-110 shadow-glow-cyan'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Confirm Reservation
              </button>
            </form>
          </div>

          {/* STEP 4: Confirmed Reservations List */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Confirmed Log</span>
              <span className="px-2 py-0.5 text-xs bg-slate-800 rounded-md text-slate-300 font-normal">
                {confirmedBookings.length} Active
              </span>
            </h2>

            {confirmedBookings.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4 text-center">No reservations logged for this date.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {confirmedBookings.map((b) => (
                  <div key={b.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{b.userName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{b.timeSlot} • {b.userEmail}</div>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/60 transition"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
