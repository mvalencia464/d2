'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plane,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Coffee,
  Briefcase,
  ChevronRight,
  Star,
  Wind,
  Gauge,
  Users,
  LayoutDashboard,
  ClipboardList,
  Ticket,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Plus,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHighLevel } from './hooks/useHighLevel';
import { useAirportDB, type AirportDBResult } from './hooks/useAirportDB';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type View =
  | 'dashboard' | 'flights' | 'fleet' | 'concierge' | 'profile' | 'booking' // User Views
  | 'admin-dashboard' | 'admin-flights' | 'admin-users' | 'admin-concierge'; // Admin Views
type AuthView = 'signin' | 'signup';
type FlightStatus = 'Confirmed' | 'Pending' | 'Complete' | 'Cancelled';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'Platinum' | 'Gold' | 'Member';
  balance: number;
  joinedDate?: Date;
}

interface Flight {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  date: Date;
  aircraft: string;
  status: FlightStatus;
  passengers: number;
  price: number;
}

interface ConciergeRequest {
  id: string;
  flightId: string;
  userId: string;
  type: string;
  details: string;
  status: 'Open' | 'Fulfilled';
  submittedAt: Date;
}

// --- Mock Data ---
const INITIAL_USERS: UserType[] = [
  {
    id: 'admin1',
    name: 'Mauricio Admin',
    email: 'mauricio@stokeleads.com',
    role: 'admin',
    status: 'Platinum',
    balance: 0,
    joinedDate: new Date(2021, 0, 1)
  },
  {
    id: 'user1',
    name: 'Alex Croft',
    email: 'alex.croft@example.com',
    role: 'user',
    status: 'Platinum',
    balance: 12500,
    joinedDate: new Date(2022, 3, 15)
  },
  {
    id: 'user2',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    role: 'user',
    status: 'Gold',
    balance: 4500,
    joinedDate: new Date(2023, 5, 20)
  }
];

const INITIAL_FLIGHTS: Flight[] = [
  { id: 'FL-1042', userId: 'user1', origin: 'RDM', destination: 'SFO', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), aircraft: 'Orange Diamond DA62', status: 'Confirmed', passengers: 4, price: 6500 },
  { id: 'FL-1099', userId: 'user1', origin: 'SEA', destination: 'RDM', date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), aircraft: 'Blue Diamond DA62', status: 'Pending', passengers: 2, price: 8200 },
  { id: 'FL-0901', userId: 'user1', origin: 'RDM', destination: 'VNY', date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), aircraft: 'Cirrus Vision Jet', status: 'Complete', passengers: 6, price: 12000 },
  { id: 'FL-1105', userId: 'user2', origin: 'RDM', destination: 'LAS', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), aircraft: 'Blue Diamond DA62', status: 'Confirmed', passengers: 3, price: 9500 },
];

const INITIAL_CONCIERGE: ConciergeRequest[] = [
  { id: 'CR-1', flightId: 'FL-1042', userId: 'user1', type: 'Catering', details: 'Gluten free options for 2 passengers, champagne on arrival.', status: 'Open', submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
];

const UPCOMING_FLIGHTS = [
  {
    id: 'FL-1042',
    origin: 'RDM', originCity: 'Bend, OR',
    destination: 'SFO', destinationCity: 'San Francisco, CA',
    date: new Date(2024, 5, 15, 9, 0),
    aircraft: 'Orange Diamond DA62',
    status: 'Confirmed',
    passengers: 4
  },
  {
    id: 'FL-1099',
    origin: 'SEA', originCity: 'Seattle, WA',
    destination: 'RDM', destinationCity: 'Bend, OR',
    date: new Date(2024, 6, 2, 16, 30),
    aircraft: 'Cirrus Vision Jet',
    status: 'Pending',
    passengers: 2
  }
];

const PAST_FLIGHTS = [
  {
    id: 'FL-0901',
    origin: 'RDM', originCity: 'Bend, OR',
    destination: 'VNY', destinationCity: 'Van Nuys, CA',
    date: new Date(2023, 11, 10, 14, 0),
    aircraft: 'Blue Diamond DA62',
    status: 'Complete',
    passengers: 6
  }
];

const FLEET = [
  {
    id: 'orange-diamond',
    name: 'Orange Diamond DA62',
    type: 'Twin Engine',
    seats: 6,
    range: '1,285 nm',
    speed: '192 kts',
    description: 'Our flagship Orange Diamond combines efficiency with comfort, perfect for regional travel with exceptional fuel economy and modern avionics.',
  },
  {
    id: 'blue-diamond',
    name: 'Blue Diamond DA62',
    type: 'Twin Engine',
    seats: 6,
    range: '1,285 nm',
    speed: '192 kts',
    description: 'The Blue Diamond offers the same exceptional performance and reliability as our Orange Diamond, providing flexibility for your travel needs.',
  },
  {
    id: 'vision-jet',
    name: 'Cirrus Vision Jet',
    type: 'Light Jet',
    seats: 5,
    range: '1,275 nm',
    speed: '311 kts',
    description: 'Experience the future of personal aviation with our Vision Jet. Featuring the Cirrus Airframe Parachute System and cutting-edge technology for ultimate safety and comfort.',
  }
];

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }>((
  { className, variant = 'primary', ...props }, ref
) => {
  const variants = {
    primary: 'bg-gradient-to-br from-direct2-orange to-direct2-orange-darker text-white hover:from-direct2-orange-dark hover:to-direct2-orange-darker shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 hover:from-slate-200 hover:to-slate-300 shadow-sm',
    outline: 'border-2 border-direct2-green bg-transparent hover:bg-direct2-green/10 text-direct2-green',
    ghost: 'bg-transparent hover:bg-direct2-green/10 text-direct2-green',
  };
  return (
    <button
      ref={ref}
      className={cn('inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50 disabled:pointer-events-none', variants[variant], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Confirmed': 'bg-slate-100 text-slate-700',
    'Pending': 'bg-slate-100 text-slate-600',
    'Complete': 'bg-slate-100 text-slate-700',
    'Cancelled': 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status as keyof typeof styles] || styles['Complete'])}>
      {status}
    </span>
  )
}

// --- Main Application Component ---

export default function Direct2AeroApp() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signinData, setSigninData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [users] = useState<UserType[]>(INITIAL_USERS);
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [conciergeRequests, setConciergeRequests] = useState<ConciergeRequest[]>(INITIAL_CONCIERGE);

  const [bookingData, setBookingData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    passengers: '1',
    aircraft: 'Orange Diamond DA62'
  });

  const [originSuggestions, setOriginSuggestions] = useState<AirportDBResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<AirportDBResult[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const { createContact, loading: hlLoading } = useHighLevel();
  const { searchAirports: searchAirportsDB } = useAirportDB();

  const isLoggedIn = currentUser !== null;

  // Handle URL parameters for initial view
  useEffect(() => {
    const view = searchParams.get('view');
    if (view && isLoggedIn) {
      // Map URL parameter to valid view
      const viewMap: Record<string, View> = {
        'concierge': 'concierge',
        'fleet': 'fleet',
        'flights': 'flights',
        'dashboard': 'dashboard',
        'profile': 'profile',
        'booking': 'booking'
      };

      if (view in viewMap) {
        setCurrentView(viewMap[view]);
      }
    }
  }, [searchParams, isLoggedIn]);
  const isAdmin = currentUser?.role === 'admin';

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Admin login check
    if (signinData.email === 'mauricio@stokeleads.com' && signinData.password === 'StokeLeadsD2') {
      setCurrentUser({
        id: 'admin1',
        name: 'Mauricio Admin',
        email: 'mauricio@stokeleads.com',
        role: 'admin',
        status: 'Platinum',
        balance: 0
      });
      setCurrentView('admin-dashboard');
      return;
    }

    // Regular user login (demo - any password works)
    if (signinData.email && signinData.password) {
      setCurrentUser({
        id: 'user1',
        name: 'Alex Croft',
        email: signinData.email,
        role: 'user',
        status: 'Platinum',
        balance: 12500
      });
      setCurrentView('dashboard');
      return;
    }

    setLoginError('Invalid credentials');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create contact in HighLevel with "app" tag
      await createContact({
        name: signupData.name,
        email: signupData.email,
        tags: ['app']
      });

      // Simulate signup success and log them in
      setTimeout(() => {
        setCurrentUser({
          id: 'newuser',
          name: signupData.name,
          email: signupData.email,
          role: 'user',
          status: 'Member',
          balance: 0
        });
        setCurrentView('dashboard');
      }, 500);
    } catch (error) {
      console.error('Signup error:', error);
      // Still allow them to proceed even if HighLevel fails
      setTimeout(() => {
        setCurrentUser({
          id: 'newuser',
          name: signupData.name,
          email: signupData.email,
          role: 'user',
          status: 'Member',
          balance: 0
        });
        setCurrentView('dashboard');
      }, 500);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('signin');
    setSigninData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '' });
    setLoginError('');
  };

  // --- Booking Handler ---
  const handleBookFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newFlight: Flight = {
      id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      origin: bookingData.origin,
      destination: bookingData.destination,
      date: new Date(`${bookingData.date}T${bookingData.time}`),
      aircraft: bookingData.aircraft,
      status: 'Pending',
      passengers: parseInt(bookingData.passengers),
      price: 6500 // Base price, could be calculated based on distance/aircraft
    };

    setFlights([...flights, newFlight]);
    setBookingData({
      origin: '',
      destination: '',
      date: '',
      time: '',
      passengers: '1',
      aircraft: 'Orange Diamond DA62'
    });
    setCurrentView('flights');
    alert('Flight booked successfully! Your booking is pending confirmation.');
  };

  // --- Airport Search Handlers using AirportDB ---
  const searchOriginAirports = async (query: string) => {
    if (query.length < 2) {
      setOriginSuggestions([]);
      return;
    }
    const results = await searchAirportsDB(query);
    setOriginSuggestions(results);
  };

  const searchDestAirports = async (query: string) => {
    if (query.length < 2) {
      setDestSuggestions([]);
      return;
    }
    const results = await searchAirportsDB(query);
    setDestSuggestions(results);
  };

  // --- Admin Action Functions ---
  const adminUpdateFlightStatus = (flightId: string, newStatus: FlightStatus) => {
    setFlights(flights.map(f => f.id === flightId ? { ...f, status: newStatus } : f));
  };

  const adminDeleteFlight = (flightId: string) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      setFlights(flights.filter(f => f.id !== flightId));
    }
  };

  const adminFulfillRequest = (requestId: string) => {
    setConciergeRequests(conciergeRequests.map(r => r.id === requestId ? { ...r, status: 'Fulfilled' as const } : r));
  };

  // --- Renderers for Main Views ---

  const RenderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">It's a great day for flying in Central Oregon.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setCurrentView('booking')}>
            <PlusIcon className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Next Flight</p>
            <p className="text-lg font-bold text-slate-900">In 14 Days</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Status</p>
            <p className="text-lg font-bold text-slate-900">{currentUser?.status}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Flight Credit</p>
            <p className="text-lg font-bold text-slate-900">${currentUser?.balance.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Next Flight Card prominent */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Trip</h2>
        {UPCOMING_FLIGHTS.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="bg-slate-900 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Plane className="h-6 w-6 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Flight {UPCOMING_FLIGHTS[0].id}</p>
                  <p className="text-lg font-bold">{UPCOMING_FLIGHTS[0].origin} <span className="text-slate-400 mx-2">→</span> {UPCOMING_FLIGHTS[0].destination}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-slate-300 text-sm font-medium">Departure</p>
                <p className="text-lg font-bold">{format(UPCOMING_FLIGHTS[0].date, 'MMM d, yyyy')}</p>
                <p className="text-sm text-slate-300">{format(UPCOMING_FLIGHTS[0].date, 'h:mm a')}</p>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Aircraft</p>
                <p className="font-medium text-slate-900">{UPCOMING_FLIGHTS[0].aircraft}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Passengers</p>
                <p className="font-medium text-slate-900">{UPCOMING_FLIGHTS[0].passengers} Pax</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Status</p>
                <StatusBadge status={UPCOMING_FLIGHTS[0].status} />
              </div>
              <div className="flex items-center justify-end">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setCurrentView('concierge')}>Request Concierge</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-slate-500">
            No upcoming flights.
          </Card>
        )}
      </div>
    </div>
  );

  const RenderFlights = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Flights</h1>
        <Button className="gap-2" onClick={() => setCurrentView('booking')}>
          <PlusIcon className="h-4 w-4" />
          Book Flight
        </Button>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h3>
          <div className="space-y-3">
            {UPCOMING_FLIGHTS.map((flight) => (
              <Card key={flight.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex h-12 w-12 bg-slate-100 rounded-full items-center justify-center">
                    <Calendar className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-slate-900">{flight.origin}</span>
                      <Plane className="h-4 w-4 text-slate-400 rotate-90" />
                      <span className="font-bold text-lg text-slate-900">{flight.destination}</span>
                    </div>
                    <p className="text-sm text-slate-500">{format(flight.date, 'MMMM d, yyyy • h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                     <p className="text-sm font-medium text-slate-900">{flight.aircraft}</p>
                     <StatusBadge status={flight.status} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 hidden sm:block" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h3>
          <div className="space-y-3">
            {PAST_FLIGHTS.map((flight) => (
              <Card key={flight.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-slate-700">{flight.origin}</span>
                      <Plane className="h-4 w-4 text-slate-400 rotate-90" />
                      <span className="font-bold text-lg text-slate-700">{flight.destination}</span>
                    </div>
                    <p className="text-sm text-slate-500">{format(flight.date, 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <StatusBadge status={flight.status} />
                  <Button variant="ghost" className="text-sm">View Receipt</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const RenderFleet = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Our Fleet</h1>
        <p className="text-slate-500 mt-1">Direct2 Aero operates a modern, diversified fleet based in Bend, Oregon.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {FLEET.map((aircraft) => (
          <Card key={aircraft.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 bg-slate-200">
              {/* Placeholder for Aircraft Image - in real app, use actual photos */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                 <Plane className="h-16 w-16 mb-2 opacity-20" />
                 <span className="text-xs font-medium uppercase tracking-widest">{aircraft.name}</span>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-slate-900/80 text-white text-xs font-medium rounded">
                  {aircraft.type}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{aircraft.name}</h3>
              <p className="text-sm text-slate-600 mb-4 flex-1">{aircraft.description}</p>
              
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">{aircraft.seats} Seats</p>
                </div>
                <div className="text-center">
                  <Gauge className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">{aircraft.speed}</p>
                </div>
                <div className="text-center">
                  <Wind className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">{aircraft.range}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const RenderConcierge = () => (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Concierge Services</h1>
        <p className="text-slate-500 mt-1">Let us enhance your travel experience. Tell us what you need.</p>
      </div>

      <Card className="p-6 md:p-8">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Request submitted!"); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="flight-select">Select Flight</Label>
              <select id="flight-select" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-slate-400 focus:bg-slate-50 transition-all">
                <option value="">-- Choose upcoming flight --</option>
                {UPCOMING_FLIGHTS.map(f => (
                  <option key={f.id} value={f.id}>{format(f.date, 'MMM d')} - {f.origin} to {f.destination}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <select id="service-type" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-slate-400 focus:bg-slate-50 transition-all">
                <option value="catering">In-Flight Catering</option>
                <option value="car">Ground Transportation</option>
                <option value="hotel">Accommodation Booking</option>
                <option value="special">Special Occasion</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium text-sm text-slate-900">Quick Selectors</p>
            <div className="flex flex-wrap gap-3">
              {['Premium Catering', 'Chauffeur Waiting', 'Rental Car', 'Hotel Suite', 'Champagne'].map((item) => (
                <label key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" className="rounded text-slate-900 focus:ring-slate-500" />
                  <span className="text-sm text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Specific Details & Instructions</Label>
            <textarea
              id="details"
              rows={5}
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-slate-50 transition-all"
              placeholder="Please describe any dietary restrictions, specific car models, or other preferences..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="px-8">
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const RenderProfile = () => (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and travel preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Profile Sidebar */}
        <nav className="flex flex-col space-y-1">
          <Button variant="secondary" className="justify-start">General</Button>
          <Button variant="ghost" className="justify-start">Travel Preferences</Button>
          <Button variant="ghost" className="justify-start">Payment Methods</Button>
          <Button variant="ghost" className="justify-start">Security</Button>
          <Button variant="ghost" className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700">Delete Account</Button>
        </nav>

        {/* Profile Content */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={currentUser?.name} />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input defaultValue={currentUser?.email} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input defaultValue="+1 (541) 555-0123" />
              </div>
              <div className="space-y-2">
                <Label>Home Base Airport</Label>
                <Input defaultValue="KRDM (Bend/Redmond)" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Travel Preferences</h3>
            <div className="space-y-4">
               <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <Input placeholder="e.g. Gluten-free, Nut allergy" />
              </div>
              <div className="space-y-2">
                <Label>Beverage Preferences</Label>
                <Input placeholder="e.g. Sparkling water, Pinot Noir" />
              </div>
               <div className="flex items-center gap-2">
                  <input type="checkbox" id="pets" className="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
                  <Label htmlFor="pets" className="font-normal">I often travel with pets</Label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const RenderBooking = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book a Flight</h1>
        <p className="text-slate-500">Reserve your private aviation experience.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleBookFlight} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <Label htmlFor="origin">Departure Airport</Label>
              <Input
                id="origin"
                type="text"
                placeholder="e.g. RDM, Portland, etc."
                required
                value={bookingData.origin}
                onChange={(e) => {
                  const value = e.target.value;
                  setBookingData({...bookingData, origin: value});
                  searchOriginAirports(value);
                  setShowOriginSuggestions(true);
                }}
                onFocus={() => {
                  if (bookingData.origin.length >= 2) {
                    searchOriginAirports(bookingData.origin);
                    setShowOriginSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
              />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {originSuggestions.map((airport, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-direct2-green/10 border-b border-slate-100 last:border-b-0"
                      onClick={() => {
                        setBookingData({...bookingData, origin: airport.iata || airport.icao});
                        setShowOriginSuggestions(false);
                      }}
                    >
                      <div className="font-semibold text-direct2-green">{airport.iata || airport.icao}</div>
                      <div className="text-sm text-slate-600">{airport.name}</div>
                      <div className="text-xs text-slate-500">{airport.city}, {airport.state || airport.country}</div>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500">Search by code, city, or airport name</p>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="destination">Arrival Airport</Label>
              <Input
                id="destination"
                type="text"
                placeholder="e.g. SFO, San Francisco, etc."
                required
                value={bookingData.destination}
                onChange={(e) => {
                  const value = e.target.value;
                  setBookingData({...bookingData, destination: value});
                  searchDestAirports(value);
                  setShowDestSuggestions(true);
                }}
                onFocus={() => {
                  if (bookingData.destination.length >= 2) {
                    searchDestAirports(bookingData.destination);
                    setShowDestSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
              />
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {destSuggestions.map((airport, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-direct2-green/10 border-b border-slate-100 last:border-b-0"
                      onClick={() => {
                        setBookingData({...bookingData, destination: airport.iata || airport.icao});
                        setShowDestSuggestions(false);
                      }}
                    >
                      <div className="font-semibold text-direct2-green">{airport.iata || airport.icao}</div>
                      <div className="text-sm text-slate-600">{airport.name}</div>
                      <div className="text-xs text-slate-500">{airport.city}, {airport.state || airport.country}</div>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500">Search by code, city, or airport name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Departure Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Departure Time</Label>
              <Input
                id="time"
                type="time"
                required
                value={bookingData.time}
                onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers">Number of Passengers</Label>
              <select
                id="passengers"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-slate-50 transition-all"
                value={bookingData.passengers}
                onChange={(e) => setBookingData({...bookingData, passengers: e.target.value})}
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
                <option value="5">5 Passengers</option>
                <option value="6">6 Passengers</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aircraft">Preferred Aircraft</Label>
              <select
                id="aircraft"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-slate-50 transition-all"
                value={bookingData.aircraft}
                onChange={(e) => setBookingData({...bookingData, aircraft: e.target.value})}
              >
                <option value="Orange Diamond DA62">Orange Diamond DA62</option>
                <option value="Blue Diamond DA62">Blue Diamond DA62</option>
                <option value="Cirrus Vision Jet">Cirrus Vision Jet</option>
              </select>
            </div>
          </div>

          <div className="bg-direct2-green/5 border border-direct2-green/20 rounded-lg p-4">
            <h3 className="font-semibold text-direct2-green mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><strong>Route:</strong> {bookingData.origin || '___'} → {bookingData.destination || '___'}</p>
              <p><strong>Date:</strong> {bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}</p>
              <p><strong>Time:</strong> {bookingData.time || 'Not selected'}</p>
              <p><strong>Passengers:</strong> {bookingData.passengers}</p>
              <p><strong>Aircraft:</strong> {bookingData.aircraft}</p>
              <p className="pt-2 text-lg font-bold text-direct2-green">Estimated Price: $6,500</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Confirm Booking
            </Button>
            <Button type="button" variant="outline" onClick={() => setCurrentView('dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  // --- Admin View Renderers ---
  const RenderAdminDashboard = () => {
    const totalRevenue = flights.filter(f => f.status !== 'Cancelled').reduce((sum, f) => sum + f.price, 0);
    const activeFlights = flights.filter(f => f.status === 'Confirmed' || f.status === 'Pending').length;
    const pendingRequests = conciergeRequests.filter(r => r.status === 'Open').length;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500">Direct2 Aero operational snapshot.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">Total Revenue (YTD)</p>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">Active Flights</p>
            <p className="text-2xl font-bold text-slate-900">{activeFlights}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">Total Members</p>
            <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'user').length}</p>
          </Card>
          <Card className={cn("p-6", pendingRequests > 0 ? 'bg-amber-50 border-amber-200' : '')}>
            <p className={cn("text-sm font-medium", pendingRequests > 0 ? 'text-amber-700' : 'text-slate-500')}>Open Concierge Req.</p>
            <p className={cn("text-2xl font-bold", pendingRequests > 0 ? 'text-amber-900' : 'text-slate-900')}>{pendingRequests}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
              <Button variant="ghost" onClick={() => setCurrentView('admin-flights')}>View All</Button>
            </div>
            <div className="space-y-4">
              {flights.slice(0, 5).map(flight => {
                const booker = users.find(u => u.id === flight.userId);
                return (
                  <div key={flight.id} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                    <div>
                      <p className="font-medium text-sm">{flight.origin} → {flight.destination}</p>
                      <p className="text-xs text-slate-500">{booker?.name} • {format(flight.date, 'MMM d')}</p>
                    </div>
                    <StatusBadge status={flight.status} />
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">New Members</h3>
              <Button variant="ghost" onClick={() => setCurrentView('admin-users')}>View All</Button>
            </div>
            <div className="space-y-4">
              {users.filter(u => u.role === 'user').slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">Joined {user.joinedDate ? format(user.joinedDate, 'MMM yyyy') : 'N/A'}</p>
                    </div>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const RenderAdminFlights = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flight Management</h1>
          <p className="text-slate-500">Manage all customer bookings.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4"/> Add Flight</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Flight ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Route</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {flights.sort((a,b) => b.date.getTime() - a.date.getTime()).map(flight => {
                const customer = users.find(u => u.id === flight.userId);
                return (
                  <tr key={flight.id} className="bg-white hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{flight.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{customer?.name}</p>
                      <p className="text-xs text-slate-500">{customer?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{flight.origin}</span>
                        <Plane className="h-3 w-3 rotate-90 text-slate-400" />
                        <span className="font-semibold">{flight.destination}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{flight.aircraft}</p>
                    </td>
                    <td className="px-6 py-4">
                      {format(flight.date, 'MMM d, yyyy')}
                      <br/>
                      <span className="text-slate-500 text-xs">{format(flight.date, 'h:mm a')}</span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={flight.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {flight.status === 'Pending' && (
                          <Button variant="ghost" onClick={() => adminUpdateFlightStatus(flight.id, 'Confirmed')} title="Confirm Flight" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 p-0">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" onClick={() => adminDeleteFlight(flight.id)} title="Delete Flight" className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const RenderAdminConcierge = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Concierge Requests</h1>
        <p className="text-slate-500">Fulfill special customer requirements.</p>
      </div>
      <div className="space-y-4">
        {conciergeRequests.sort((a,b) => (a.status === 'Open' ? -1 : 1)).map(req => {
          const requester = users.find(u => u.id === req.userId);
          const flight = flights.find(f => f.id === req.flightId);
          return (
            <Card key={req.id} className={cn("p-6 flex flex-col md:flex-row gap-6", req.status === 'Fulfilled' ? 'opacity-75 bg-slate-50' : 'border-l-4 border-l-amber-400')}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={req.status} />
                  <span className="text-xs text-slate-500">Submitted {format(req.submittedAt, 'MMM d')}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{req.type}</p>
                <p className="text-sm text-slate-600">{req.details}</p>
                <div className="pt-2 text-xs text-slate-500">
                  <p><strong>Customer:</strong> {requester?.name}</p>
                  <p><strong>Flight:</strong> {flight?.id} ({flight?.origin} → {flight?.destination})</p>
                </div>
              </div>
              {req.status === 'Open' && (
                <div className="flex items-center">
                  <Button onClick={() => adminFulfillRequest(req.id)} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Mark Fulfilled
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  );

  const RenderAdminUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Accounts</h1>
          <p className="text-slate-500">Manage member accounts and status.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Balance</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.filter(u => u.role === 'user').map(user => (
                <tr key={user.id} className="bg-white hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${user.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">{user.joinedDate ? format(user.joinedDate, 'MMM d, yyyy') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // --- Authentication Views ---

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Hero / Brand Side */}
        <div className="hidden md:flex md:w-1/2 bg-direct2-green text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68f9af62778d65ea5068fc57.webp')] bg-cover bg-center grayscale"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-direct2-green/70 via-direct2-green-dark/85 to-direct2-green-darker/95"></div>
          <div className="relative z-10">
            <img
              src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68f9a97d778d653cb867cba3.svg"
              alt="Direct2 Aero"
              className="h-16 w-auto brightness-0 invert"
            />
          </div>
          <div className="relative z-10 max-w-md">
            <blockquote className="text-xl font-normal leading-relaxed">
              "The only way to travel now. 1st Class Service every time. Well done and too proud to have you in Oregon."
            </blockquote>
            <p className="mt-4 text-slate-300">— Matt Langer</p>
          </div>
        </div>

        {/* Form Side View Switcher */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[380px] mx-auto space-y-6">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-8">
              <img
                src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68f9a97d778d653cb867cba3.svg"
                alt="Direct2 Aero"
                className="h-14 w-auto"
                style={{filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(100deg) brightness(95%) contrast(101%)'}}
              />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {authView === 'signin' ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {authView === 'signin' 
                  ? 'Welcome back. Please enter your details.' 
                  : 'Start your premium travel experience today.'}
              </p>
            </div>

            {authView === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="bg-white"
                    value={signinData.email}
                    onChange={(e) => setSigninData({...signinData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs text-slate-600 hover:underline" tabIndex={-1}>Forgot password?</button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="bg-white"
                    value={signinData.password}
                    onChange={(e) => setSigninData({...signinData, password: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full py-3">Sign In</Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full py-3" disabled={hlLoading}>
                  {hlLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="text-center text-sm">
              {authView === 'signin' ? (
                <p className="text-slate-600">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthView('signup')} className="font-semibold text-slate-900 hover:underline">Sign up</button>
                </p>
              ) : (
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <button onClick={() => setAuthView('signin')} className="font-semibold text-slate-900 hover:underline">Sign in</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated App Layout ---

  const NavItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: View }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        currentView === view 
          ? "bg-slate-900 text-white" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Subtle Watermark Icon */}
      <div className="fixed bottom-8 right-8 opacity-3 pointer-events-none z-0">
        <img
          src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68f9be07a2cacb17e7d61f3a.svg"
          alt=""
          className="w-64 h-64 md:w-96 md:h-96"
        />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <img
            src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68f9a97d778d653cb867cba3.svg"
            alt="Direct2 Aero"
            className="h-10 w-auto"
          />
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto p-4">
          {isAdmin ? (
            <>
              <div className="mb-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Portal</div>
              <nav className="space-y-1 mb-8">
                <NavItem icon={LayoutDashboard} label="Overview" view="admin-dashboard" />
                <NavItem icon={Ticket} label="Flights Manager" view="admin-flights" />
                <NavItem icon={ClipboardList} label="Concierge Req." view="admin-concierge" />
                <NavItem icon={Users} label="User Accounts" view="admin-users" />
              </nav>
              <div className="mb-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Views</div>
              <nav className="space-y-1 flex-1">
                <NavItem icon={Briefcase} label="Fleet View" view="fleet" />
              </nav>
            </>
          ) : (
            <nav className="space-y-1 flex-1">
              <NavItem icon={LayoutDashboardIcon} label="Dashboard" view="dashboard" />
              <NavItem icon={Plane} label="My Flights" view="flights" />
              <NavItem icon={Coffee} label="Concierge" view="concierge" />
              <NavItem icon={Briefcase} label="Fleet" view="fleet" />
            </nav>
          )}
          <div className="space-y-1 pt-4 border-t border-slate-200">
            {!isAdmin && <NavItem icon={Settings} label="Settings" view="profile" />}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
        {/* User mini profile */}
        <div className="p-4 border-t border-slate-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Menu overlay */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <img
          src="https://storage.googleapis.com/msgsndr/aewRs6OT3I7lUSwPF6ET/media/68f9a97d778d653cb867cba3.svg"
          alt="Direct2 Aero"
          className="h-10 w-auto"
        />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-slate-900/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-white border-l border-slate-200 p-4 flex flex-col" onClick={e => e.stopPropagation()}>
            {isAdmin ? (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">Admin</p>
                <nav className="space-y-1 flex-1">
                  <NavItem icon={LayoutDashboard} label="Overview" view="admin-dashboard" />
                  <NavItem icon={Ticket} label="Flights" view="admin-flights" />
                  <NavItem icon={ClipboardList} label="Concierge" view="admin-concierge" />
                  <NavItem icon={Users} label="Users" view="admin-users" />
                  <NavItem icon={Briefcase} label="Fleet" view="fleet" />
                </nav>
              </>
            ) : (
              <nav className="space-y-1 flex-1">
                <NavItem icon={LayoutDashboardIcon} label="Dashboard" view="dashboard" />
                <NavItem icon={Plane} label="My Flights" view="flights" />
                <NavItem icon={Coffee} label="Concierge" view="concierge" />
                <NavItem icon={Briefcase} label="Fleet" view="fleet" />
                <NavItem icon={Settings} label="Settings" view="profile" />
              </nav>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 mt-auto"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={cn("flex-1 transition-all duration-200 ease-in-out p-4 md:p-8 lg:p-10 mt-16 lg:mt-0 lg:ml-64")}>
        <div className="mx-auto max-w-6xl h-full">
          {currentView === 'dashboard' && <RenderDashboard />}
          {currentView === 'flights' && <RenderFlights />}
          {currentView === 'fleet' && <RenderFleet />}
          {currentView === 'concierge' && <RenderConcierge />}
          {currentView === 'profile' && <RenderProfile />}
          {currentView === 'booking' && <RenderBooking />}
          {currentView === 'admin-dashboard' && <RenderAdminDashboard />}
          {currentView === 'admin-flights' && <RenderAdminFlights />}
          {currentView === 'admin-concierge' && <RenderAdminConcierge />}
          {currentView === 'admin-users' && <RenderAdminUsers />}
        </div>
      </main>
    </div>
  );
}

// Additional icons needed that weren't in initial destructure
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}
function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
}
