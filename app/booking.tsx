'use client';

import React, { useState } from 'react';
import { Plane, Calendar, Users, ArrowRight, MapPin, ChevronDown, Check, ArrowLeft, Info, Wind, Star, User } from 'lucide-react';
import { useHighLevel } from './hooks/useHighLevel';
import { useAirportSearch } from './hooks/useAirportSearch';

type Screen = 'HOME' | 'RESULTS' | 'DETAILS' | 'CONFIRMATION';
type TripType = 'one-way' | 'round-trip';

interface BookingData {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  selectedAircraft: Aircraft | null;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Aircraft {
  id: string;
  name: string;
  type: string;
  seats: number;
  speed: string;
  range: string;
  estimate: number;
  image: string;
}

// --- Direct2 Fleet ---
const MOCK_AIRCRAFT: Aircraft[] = [
  {
    id: 'da62-orange',
    name: 'Diamond DA62 (Orange)',
    type: 'Twin Engine',
    seats: 6,
    speed: '192 mph',
    range: '1,285 nm',
    estimate: 2800,
    image: 'https://images.unsplash.com/photo-1583070344499-bf3c53b95d78?q=80&w=2836&auto=format&fit=crop'
  },
  {
    id: 'da62-blue',
    name: 'Diamond DA62 (Blue)',
    type: 'Twin Engine',
    seats: 6,
    speed: '192 mph',
    range: '1,285 nm',
    estimate: 2800,
    image: 'https://images.unsplash.com/photo-1605450183428-eb9127d6d40a?q=80&w=2940&auto=format&fit=crop'
  },
  {
    id: 'cirrus-vision',
    name: 'Cirrus Vision Jet',
    type: 'Personal Jet',
    seats: 5,
    speed: '345 mph',
    range: '1,275 nm',
    estimate: 4500,
    image: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?q=80&w=2940&auto=format&fit=crop'
  }
];

export default function Direct2App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [bookingData, setBookingData] = useState<BookingData>({
    tripType: 'round-trip',
    origin: 'KBDN', // Default to Bend
    destination: '',
    departDate: '',
    returnDate: '',
    passengers: 2,
    selectedAircraft: null,
    contact: { name: '', email: '', phone: '' }
  });

  // Initialize hooks
  const { createContact } = useHighLevel();
  const { searchAirports } = useAirportSearch();

  const updateBooking = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen bookingData={bookingData} updateBooking={updateBooking} onNext={() => setCurrentScreen('RESULTS')} searchAirports={searchAirports} />;
      case 'RESULTS':
        return <ResultsScreen bookingData={bookingData} updateBooking={updateBooking} onNext={() => setCurrentScreen('DETAILS')} onBack={() => setCurrentScreen('HOME')} />;
      case 'DETAILS':
        return <DetailsScreen bookingData={bookingData} updateBooking={updateBooking} onNext={() => setCurrentScreen('CONFIRMATION')} onBack={() => setCurrentScreen('RESULTS')} createContact={createContact} />;
      case 'CONFIRMATION':
        return <ConfirmationScreen onReset={() => { setCurrentScreen('HOME'); setBookingData({ ...bookingData, selectedAircraft: null, destination: '', departDate: '', returnDate: '' }); }} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-900 selection:bg-amber-500/30">
       {/* Persistent Background */}
       <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519852476561-ec618b0183ba?q=80&w=2856&auto=format&fit=crop')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/50 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Simple Header */}
        <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="cursor-pointer" onClick={() => setCurrentScreen('HOME')}>
            <img
              src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/680efd80b3d583557eca3366.png"
              alt="Direct2"
              className="h-8 md:h-10 w-auto"
            />
          </div>
          <nav className="hidden md:flex gap-6 text-slate-300 text-sm font-medium">
            <button className="hover:text-amber-500 transition-colors">Concierge</button>
            <button className="hover:text-amber-500 transition-colors">Fleet</button>
            <button className="hover:text-amber-500 transition-colors">Sign In</button>
          </nav>
        </header>

        {/* Screen Content */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          {renderScreen()}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-slate-500 text-sm relative z-10">
          Direct2 &copy; {new Date().getFullYear()}. Premium Charter based in Bend, OR.
        </footer>
      </div>
    </div>
  );
}

// ================= SCREENS =================

// --- 1. HOME SCREEN (SEARCH WIDGET) ---
function HomeScreen({ bookingData, updateBooking, onNext, searchAirports }: { bookingData: BookingData, updateBooking: (d: Partial<BookingData>) => void, onNext: () => void, searchAirports: (query: string) => any[] }) {
  const [isPaxOpen, setIsPaxOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState(bookingData.origin);
  const [destSearch, setDestSearch] = useState(bookingData.destination);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);

  const originResults = searchAirports(originSearch);
  const destResults = searchAirports(destSearch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.destination || !bookingData.departDate) {
      alert("Please fill in destination and departure date.");
      return;
    }
    onNext();
  };

  const selectOrigin = (iata: string) => {
    setOriginSearch(iata);
    updateBooking({ origin: iata });
    setShowOriginResults(false);
  };

  const selectDestination = (iata: string) => {
    setDestSearch(iata);
    updateBooking({ destination: iata });
    setShowDestResults(false);
  };

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight max-w-3xl">
          Your private gateway from the <span className="text-amber-500 italic">Cascades</span>.
        </h1>
        <p className="text-slate-300 text-lg mt-4 font-light tracking-wide max-w-2xl">
          Experience effortless travel. No lines, no waiting—just you and the open sky. Departing directly from Bend (KBDN).
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1.5">
          {(['one-way', 'round-trip'] as TripType[]).map(type => (
            <button
              key={type}
              onClick={() => updateBooking({ tripType: type })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-medium transition-all duration-300 ${bookingData.tripType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ArrowRight className={`w-4 h-4 ${type === 'round-trip' ? 'rotate-180 ml-[-8px]' : ''}`} />
              {type === 'round-trip' && <ArrowRight className="w-4 h-4 -ml-3" />}
              <span className="capitalize">{type.replace('-', ' ')}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Route */}
            <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 md:border md:border-slate-200 md:rounded-xl">
               <div className="relative p-4 bg-slate-50 md:bg-white border border-slate-200 md:border-0 rounded-xl md:rounded-none md:rounded-l-xl z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68251058c4693210f8c542da.svg"
                      alt="Departure"
                      className="w-5 h-5 flex-shrink-0"
                    />
                    <div className="flex-1 relative min-w-0">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From</label>
                      <input
                        type="text"
                        value={originSearch}
                        onChange={(e) => {
                          setOriginSearch(e.target.value);
                          setShowOriginResults(true);
                        }}
                        onFocus={() => setShowOriginResults(true)}
                        onBlur={() => setTimeout(() => setShowOriginResults(false), 200)}
                        className="w-full bg-transparent p-0 border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="Origin"
                      />
                      {showOriginResults && originResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-slate-200 max-h-60 overflow-y-auto z-[100]">
                          {originResults.map((airport) => (
                            <button
                              key={airport.iata}
                              type="button"
                              onClick={() => selectOrigin(airport.iata)}
                              className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-slate-100 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-slate-900">{airport.iata}</div>
                              <div className="text-sm text-slate-600">{airport.name}</div>
                              <div className="text-xs text-slate-400">{airport.city}, {airport.state || airport.country}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative p-4 bg-slate-50 md:bg-white border border-slate-200 md:border-0 md:border-l md:border-slate-100 rounded-xl md:rounded-none md:rounded-r-xl z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68251058c4693210f8c542da.svg"
                      alt="Arrival"
                      className="w-5 h-5 flex-shrink-0"
                    />
                    <div className="flex-1 relative min-w-0">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
                      <input
                        type="text"
                        value={destSearch}
                        onChange={(e) => {
                          setDestSearch(e.target.value);
                          setShowDestResults(true);
                        }}
                        onFocus={() => setShowDestResults(true)}
                        onBlur={() => setTimeout(() => setShowDestResults(false), 200)}
                        className="w-full bg-transparent p-0 border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="Destination"
                        autoFocus
                      />
                      {showDestResults && destResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-slate-200 max-h-60 overflow-y-auto z-[100]">
                          {destResults.map((airport) => (
                            <button
                              key={airport.iata}
                              type="button"
                              onClick={() => selectDestination(airport.iata)}
                              className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-slate-100 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-slate-900">{airport.iata}</div>
                              <div className="text-sm text-slate-600">{airport.name}</div>
                              <div className="text-xs text-slate-400">{airport.city}, {airport.state || airport.country}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
            {/* Dates */}
            <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 md:border md:border-slate-200 md:rounded-xl md:overflow-hidden">
               <div className={`relative flex items-center p-4 bg-slate-50 md:bg-white border border-slate-200 md:border-0 rounded-xl md:rounded-none ${bookingData.tripType === 'one-way' ? 'md:col-span-2' : ''}`}>
                  <Calendar className="text-slate-400 w-5 h-5 absolute left-4" />
                  <div className="ml-8 flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Depart</label>
                    <input type="date" value={bookingData.departDate} onChange={(e) => updateBooking({ departDate: e.target.value })} className="w-full bg-transparent p-0 border-none focus:ring-0 text-slate-900 font-medium" />
                  </div>
                </div>
                {bookingData.tripType === 'round-trip' && (
                  <div className="relative flex items-center p-4 bg-slate-50 md:bg-white border border-slate-200 md:border-0 md:border-l md:border-slate-100 rounded-xl md:rounded-none">
                    <Calendar className="text-slate-400 w-5 h-5 absolute left-4" />
                    <div className="ml-8 flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Return</label>
                      <input type="date" value={bookingData.returnDate} min={bookingData.departDate} onChange={(e) => updateBooking({ returnDate: e.target.value })} className="w-full bg-transparent p-0 border-none focus:ring-0 text-slate-900 font-medium" />
                    </div>
                  </div>
                )}
            </div>
            {/* Pax */}
            <div className="md:col-span-2 relative">
              <button type="button" onClick={() => setIsPaxOpen(!isPaxOpen)} className="w-full h-full flex items-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-slate-100 transition-colors">
                <Users className="text-slate-400 w-5 h-5 mr-3" />
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Pax</label>
                  <span className="text-slate-900 font-medium">{bookingData.passengers}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPaxOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPaxOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
                   <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">Passengers</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateBooking({ passengers: Math.max(1, bookingData.passengers - 1) })} className="w-8 h-8 bg-slate-100 rounded-full">-</button>
                        <span className="w-6 text-center">{bookingData.passengers}</span>
                        <button type="button" onClick={() => updateBooking({ passengers: Math.min(19, bookingData.passengers + 1) })} className="w-8 h-8 bg-slate-100 rounded-full">+</button>
                      </div>
                   </div>
                   <button type="button" onClick={() => setIsPaxOpen(false)} className="w-full mt-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Done</button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="w-full md:w-auto py-4 px-10 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5">
              <ArrowRight className="w-5 h-5" /> Search Flights
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. RESULTS SCREEN ---
function ResultsScreen({ bookingData, updateBooking, onNext, onBack }: { bookingData: BookingData, updateBooking: (d: Partial<BookingData>) => void, onNext: () => void, onBack: () => void }) {
  return (
    <div className="w-full max-w-6xl animate-in fade-in duration-500">
      <button onClick={onBack} className="text-slate-300 hover:text-amber-500 flex items-center gap-2 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Modify Search
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Summary */}
        <div className="w-full lg:w-80 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 text-slate-200 border border-slate-700/50 sticky top-8">
          <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-4">Trip Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">Route</div>
              <div className="text-xl font-serif text-white">{bookingData.origin} <span className="text-slate-500 mx-1">→</span> {bookingData.destination}</div>
              {bookingData.tripType === 'round-trip' && <div className="text-sm text-slate-400 mt-1">Round Trip</div>}
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-slate-400 text-xs uppercase font-bold mb-1">Depart</div>
                <div className="text-white">{bookingData.departDate}</div>
              </div>
              {bookingData.returnDate && (
                <div>
                   <div className="text-slate-400 text-xs uppercase font-bold mb-1">Return</div>
                   <div className="text-white">{bookingData.returnDate}</div>
                </div>
              )}
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">Passengers</div>
              <div className="flex items-center gap-2 text-white">
                <Users className="w-4 h-4 text-amber-500" /> {bookingData.passengers}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-serif text-white">Available Aircraft</h2>
          {MOCK_AIRCRAFT.map(aircraft => (
            <div key={aircraft.id} className="bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row transition-transform hover:scale-[1.01]">
              <div className="md:w-2/5 h-64 md:h-auto relative">
                <img src={aircraft.image} alt={aircraft.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  {aircraft.type}
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif text-slate-900">{aircraft.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/> {aircraft.seats} Seats</span>
                      <span className="flex items-center gap-1.5"><Wind className="w-4 h-4"/> {aircraft.speed}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 font-medium">Estimated Price</div>
                    <div className="text-2xl font-bold text-slate-900">${aircraft.estimate.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                   <button className="text-slate-500 text-sm font-medium flex items-center gap-1 hover:text-slate-900">
                     <Info className="w-4 h-4"/> Aircraft Details
                   </button>
                   <button 
                     onClick={() => { updateBooking({ selectedAircraft: aircraft }); onNext(); }}
                     className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                   >
                     Select Jet <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 3. DETAILS SCREEN ---
function DetailsScreen({ bookingData, updateBooking, onNext, onBack, createContact }: { bookingData: BookingData, updateBooking: (d: Partial<BookingData>) => void, onNext: () => void, onBack: () => void, createContact: (data: any) => Promise<any> }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.contact.name || !bookingData.contact.email) {
        alert("Please fill in required contact details.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create contact in HighLevel
      await createContact({
        name: bookingData.contact.name,
        email: bookingData.contact.email,
        phone: bookingData.contact.phone
      });

      // Success - move to confirmation
      onNext();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit booking';
      setError(errorMessage);
      console.error('Booking submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      <button onClick={onBack} className="text-slate-300 hover:text-amber-500 flex items-center gap-2 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Change Aircraft
      </button>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-32 bg-slate-900 relative overflow-hidden">
           <div className="absolute inset-0 opacity-50 bg-cover bg-center" style={{ backgroundImage: `url('${bookingData.selectedAircraft?.image}')` }} />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
           <div className="relative z-10 h-full flex items-center px-8 md:px-12">
              <div>
                <h2 className="text-white text-3xl font-serif">Finalize Your Request</h2>
                <p className="text-amber-500 font-medium mt-1">{bookingData.selectedAircraft?.name}</p>
              </div>
           </div>
        </div>

        <div className="p-8 md:p-12 grid gap-12 md:grid-cols-2">
          {/* Form */}
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500"/> Lead Passenger
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  value={bookingData.contact.name}
                  onChange={e => updateBooking({ contact: { ...bookingData.contact, name: e.target.value }})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                <input 
                  type="email"
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                  value={bookingData.contact.email}
                  onChange={e => updateBooking({ contact: { ...bookingData.contact, email: e.target.value }})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                  value={bookingData.contact.phone}
                  onChange={e => updateBooking({ contact: { ...bookingData.contact, phone: e.target.value }})}
                />
              </div>
            </div>
            <div className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg shadow-xl shadow-amber-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? (
                        <span className="animate-pulse">Submitting to HighLevel...</span>
                    ) : (
                        <span>Request Flight</span>
                    )}
                </button>
                <p className="text-xs text-slate-500 text-center mt-4">By clicking Request, you agree to our terms of service. No payment is required yet.</p>
            </div>
          </form>

          {/* Recap */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Itinerary Recap</h3>
              
              <div className="space-y-6">
                  <div className="flex items-start gap-4">
                      <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-600"><MapPin className="w-4 h-4"/></div>
                      <div>
                          <div className="font-bold text-slate-900">{bookingData.origin} to {bookingData.destination}</div>
                          <div className="text-sm text-slate-500 capitalize">{bookingData.tripType.replace('-', ' ')}</div>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="mt-1 bg-amber-100 p-2 rounded-full text-amber-600"><Calendar className="w-4 h-4"/></div>
                      <div>
                          <div className="font-bold text-slate-900">{bookingData.departDate}</div>
                          {bookingData.returnDate && <div className="text-sm text-slate-500">Returning: {bookingData.returnDate}</div>}
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="mt-1 bg-slate-200 p-2 rounded-full text-slate-600"><Plane className="w-4 h-4"/></div>
                      <div>
                          <div className="font-bold text-slate-900">{bookingData.selectedAircraft?.name}</div>
                          <div className="text-sm text-slate-500">{bookingData.passengers} Passengers</div>
                      </div>
                  </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-end">
                      <span className="text-sm text-slate-500 font-medium">Estimated Total</span>
                      <span className="text-3xl font-bold text-slate-900">${bookingData.selectedAircraft?.estimate.toLocaleString()}</span>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. CONFIRMATION SCREEN ---
function ConfirmationScreen({ onReset }: { onReset: () => void }) {
    return (
      <div className="w-full max-w-2xl animate-in zoom-in-95 duration-700">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-16 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">Request Received</h2>
              <p className="text-slate-500 text-lg mb-8">
                  Thank you. Our flight concierge team is reviewing your request and will contact you shortly with a formal quote and itinerary.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left inline-block w-full max-w-md">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500"/> What happens next?
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex gap-2"><span className="text-amber-500 font-bold">1.</span> We confirm aircraft availability.</li>
                      <li className="flex gap-2"><span className="text-amber-500 font-bold">2.</span> You'll receive a final contract to sign.</li>
                      <li className="flex gap-2"><span className="text-amber-500 font-bold">3.</span> Payment is secured, and you're ready to fly.</li>
                  </ul>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                 <button onClick={onReset} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                     Back to Home
                 </button>
                 <button className="px-8 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold hover:border-slate-900 transition-colors">
                     View Account
                 </button>
              </div>
          </div>
      </div>
    );
}
