import React, { useState, useEffect } from 'react';
import {
  Plane,
  User,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Coffee,
  Car,
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
  Plus
} from 'lucide-react';
import { format, isAfter, isBefore, addDays, subDays } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type View = 
  | 'dashboard' | 'flights' | 'fleet' | 'concierge' | 'profile' // User Views
  | 'admin-dashboard' | 'admin-flights' | 'admin-users' | 'admin-concierge'; // Admin Views

type AuthView = 'signin' | 'signup';

type FlightStatus = 'Confirmed' | 'Pending' | 'Complete' | 'Cancelled';

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

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'Platinum' | 'Gold' | 'Member';
  balance: number;
  joinedDate: Date;
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

// --- Initial Mock Data Generators ---
const INITIAL_USERS: UserType[] = [
  {
    id: 'u1',
    name: 'Mauricio Admin',
    email: 'mauricio@stokeleads.com',
    role: 'admin',
    status: 'Platinum',
    balance: 0,
    joinedDate: new Date(2021, 0, 1)
  },
  {
    id: 'u2',
    name: 'Alex Croft',
    email: 'alex@example.com',
    role: 'user',
    status: 'Platinum',
    balance: 12500,
    joinedDate: new Date(2022, 3, 15)
  },
  {
    id: 'u3',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    role: 'user',
    status: 'Gold',
    balance: 4500,
    joinedDate: new Date(2023, 5, 20)
  }
];

const INITIAL_FLIGHTS: Flight[] = [
  // Upcoming for Alex
  { id: 'FL-1042', userId: 'u2', origin: 'RDM', destination: 'SFO', date: addDays(new Date(), 14), aircraft: 'Pilatus PC-12', status: 'Confirmed', passengers: 4, price: 6500 },
  { id: 'FL-1099', userId: 'u2', origin: 'SEA', destination: 'RDM', date: addDays(new Date(), 32), aircraft: 'Citation CJ3', status: 'Pending', passengers: 2, price: 8200 },
  // Past for Alex
  { id: 'FL-0901', userId: 'u2', origin: 'RDM', destination: 'VNY', date: subDays(new Date(), 45), aircraft: 'Citation XLS', status: 'Complete', passengers: 6, price: 12000 },
  // Others
  { id: 'FL-1105', userId: 'u3', origin: 'RDM', destination: 'LAS', date: addDays(new Date(), 5), aircraft: 'Citation CJ3', status: 'Confirmed', passengers: 3, price: 9500 },
];

const INITIAL_FLEET = [
  {
    id: 'pc12',
    name: 'Pilatus PC-12 NGX',
    type: 'Turboprop',
    seats: 8,
    range: '1,803 nm',
    speed: '290 kts',
    description: 'The ultimate versatile aircraft, perfect for regional hops in and out of Bend with exceptional comfort and short-field performance.',
  },
  {
    id: 'cj3',
    name: 'Cessna Citation CJ3+',
    type: 'Light Jet',
    seats: 7,
    range: '2,040 nm',
    speed: '416 kts',
    description: 'A powerhouse light jet offering superior range and speed for business trips up and down the coast.',
  },
  {
    id: 'xls',
    name: 'Citation XLS Gen2',
    type: 'Midsize Jet',
    seats: 9,
    range: '2,100 nm',
    speed: '441 kts',
    description: 'Stand-up cabin comfort with transcontinental range. The preferred choice for larger groups and longer luxury travel.',
  }
];

const INITIAL_CONCIERGE: ConciergeRequest[] = [
  { id: 'CR-1', flightId: 'FL-1042', userId: 'u2', type: 'Catering', details: 'Gluten free options for 2 passengers, champagne on arrival.', status: 'Open', submittedAt: subDays(new Date(), 2) }
];

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' }>(( 
  { className, variant = 'primary', ...props }, ref 
) => {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-900',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  };
  return (
    <button
      ref={ref}
      className={cn('inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none', variants[variant], className)}
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
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
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
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
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
    'Confirmed': 'bg-emerald-100 text-emerald-700',
    'Pending': 'bg-amber-100 text-amber-700',
    'Complete': 'bg-slate-100 text-slate-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Open': 'bg-blue-100 text-blue-700',
    'Fulfilled': 'bg-slate-100 text-slate-700',
    'Platinum': 'bg-slate-900 text-white',
    'Gold': 'bg-amber-100 text-amber-800',
    'Member': 'bg-slate-100 text-slate-700',
  };
  // @ts-ignore
  const selectedStyle = styles[status] || 'bg-slate-100 text-slate-700';
  
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", selectedStyle)}>
      {status}
    </span>
  )
}

// --- Main Application Component ---

export default function Direct2AeroApp() {
  // --- Application State ---
  const [users] = useState<UserType[]>(INITIAL_USERS);
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [conciergeRequests, setConciergeRequests] = useState<ConciergeRequest[]>(INITIAL_CONCIERGE);
  
  // --- Session State ---
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // --- Actions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Hardcoded Admin Check requested by user
    if (loginEmail === 'mauricio@stokeleads.com' && loginPass === 'StokeLeadsD2') {
      const adminUser = users.find(u => u.email === 'mauricio@stokeleads.com');
      if (adminUser) {
        setCurrentUser(adminUser);
        setCurrentView('admin-dashboard');
        return;
      }
    }

    // Demo Regular User Login (simplistic for demo purposes)
    const regularUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    // For demo, any password works for regular users if email matches mock data
    if (regularUser && regularUser.role === 'user' && loginPass.length > 0) {
       setCurrentUser(regularUser);
       setCurrentView('dashboard');
       return;
    }

    setLoginError('Invalid credentials. Try mauricio@stokeleads.com / StokeLeadsD2');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('signin');
    setLoginEmail('');
    setLoginPass('');
    setLoginError('');
  };

  const submitConciergeRequest = (flightId: string, type: string, details: string) => {
    if (!currentUser) return;
    const newReq: ConciergeRequest = {
      id: `CR-${Math.floor(Math.random() * 10000)}`,
      flightId,
      userId: currentUser.id,
      type,
      details,
      status: 'Open',
      submittedAt: new Date()
    };
    setConciergeRequests([newReq, ...conciergeRequests]);
    alert("Concierge request submitted successfully.");
  };

  // --- Admin Actions ---
  const adminUpdateFlightStatus = (flightId: string, newStatus: FlightStatus) => {
    setFlights(flights.map(f => f.id === flightId ? { ...f, status: newStatus } : f));
  };

  const adminDeleteFlight = (flightId: string) => {
    if (window.confirm('Are you sure you want to delete this flight booking?')) {
      setFlights(flights.filter(f => f.id !== flightId));
    }
  };

  const adminFulfillRequest = (reqId: string) => {
    setConciergeRequests(conciergeRequests.map(r => r.id === reqId ? { ...r, status: 'Fulfilled' as const } : r));
  }

  // --- Derived Data for Views ---
  const userUpcomingFlights = flights
    .filter(f => currentUser && f.userId === currentUser.id && isAfter(f.date, new Date()) && f.status !== 'Cancelled')
    .sort((a, b) => a.date.getTime() - b.date.getTime());
    
  const userPastFlights = flights
    .filter(f => currentUser && f.userId === currentUser.id && isBefore(f.date, new Date()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // --- RENDERERS: CUSTOMER VIEWS ---

  const RenderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">It's a great day for flying in Central Oregon.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Next Flight</p>
            <p className="text-lg font-bold text-slate-900">
              {userUpcomingFlights.length > 0 
                ? format(userUpcomingFlights[0].date, 'MMM d') 
                : 'None planned'}
            </p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Status</p>
            <p className="text-lg font-bold text-slate-900">{currentUser?.status}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Flight Credit</p>
            <p className="text-lg font-bold text-slate-900">${currentUser?.balance.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Trip</h2>
        {userUpcomingFlights.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="bg-slate-900 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Flight {userUpcomingFlights[0].id}</p>
                  <p className="text-lg font-bold">{userUpcomingFlights[0].origin} <span className="text-slate-400 mx-2">→</span> {userUpcomingFlights[0].destination}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-blue-200 text-sm font-medium">Departure</p>
                <p className="text-lg font-bold">{format(userUpcomingFlights[0].date, 'MMM d, yyyy')}</p>
                <p className="text-sm text-slate-300">{format(userUpcomingFlights[0].date, 'h:mm a')}</p>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Aircraft</p>
                <p className="font-medium text-slate-900">{userUpcomingFlights[0].aircraft}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Passengers</p>
                <p className="font-medium text-slate-900">{userUpcomingFlights[0].passengers} Pax</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Status</p>
                <StatusBadge status={userUpcomingFlights[0].status} />
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Book Flight
        </Button>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h3>
          {userUpcomingFlights.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No upcoming flights.</p>
          ) : (
            <div className="space-y-3">
              {userUpcomingFlights.map((flight) => (
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
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past History</h3>
          <div className="space-y-3">
            {userPastFlights.map((flight) => (
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
                  <Button variant="ghost" size="sm">Receipt</Button>
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
        {INITIAL_FLEET.map((aircraft) => (
          <Card key={aircraft.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 bg-slate-200">
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

  const RenderConcierge = () => {
    const [selectedFlight, setSelectedFlight] = useState('');
    const [serviceType, setServiceType] = useState('catering');
    const [details, setDetails] = useState('');

    return (
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Concierge Services</h1>
          <p className="text-slate-500 mt-1">Let us enhance your travel experience. Tell us what you need.</p>
        </div>

        <Card className="p-6 md:p-8">
          <form className="space-y-6" onSubmit={(e) => { 
            e.preventDefault(); 
            submitConciergeRequest(selectedFlight, serviceType, details);
            setDetails('');
            setSelectedFlight('');
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="flight-select">Select Flight</Label>
                <select 
                  id="flight-select" 
                  required
                  value={selectedFlight}
                  onChange={(e) => setSelectedFlight(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">-- Choose upcoming flight --</option>
                  {userUpcomingFlights.map(f => (
                    <option key={f.id} value={f.id}>{format(f.date, 'MMM d')} - {f.origin} to {f.destination}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <select 
                  id="service-type" 
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="Catering">In-Flight Catering</option>
                  <option value="Transportation">Ground Transportation</option>
                  <option value="Accommodation">Accommodation Booking</option>
                  <option value="Special Occasion">Special Occasion</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Specific Details & Instructions</Label>
              <textarea
                id="details"
                rows={5}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Please describe any dietary restrictions, specific car models, or other preferences..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="px-8" disabled={!selectedFlight}>
                Submit Request
              </Button>
            </div>
          </form>
        </Card>

        {/* User's past requests */}
        <div className="mt-12 space-y-4">
          <h3 className="text-lg font-medium text-slate-900">My Active Requests</h3>
          {conciergeRequests.filter(r => r.userId === currentUser?.id).length === 0 ? (
            <p className="text-slate-500">No active concierge requests.</p>
          ) : (
            conciergeRequests.filter(r => r.userId === currentUser?.id).map(req => (
              <Card key={req.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{req.type} <span className="text-slate-400 mx-2">•</span> <span className="text-sm font-normal">Flight {req.flightId}</span></p>
                  <p className="text-sm text-slate-500 truncate max-w-md">{req.details}</p>
                </div>
                <StatusBadge status={req.status} />
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  const RenderProfile = () => (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and travel preferences.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <nav className="flex flex-col space-y-1">
          <Button variant="secondary" className="justify-start">General</Button>
          <Button variant="ghost" className="justify-start">Travel Preferences</Button>
          <Button variant="ghost" className="justify-start">Payment Methods</Button>
          <Button variant="ghost" className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700">Sign Out</Button>
        </nav>
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
                <Input defaultValue={currentUser?.email} disabled className="bg-slate-50" />
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
        </div>
      </div>
    </div>
  );

  // --- RENDERERS: ADMIN VIEWS ---

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
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('admin-flights')}>View All</Button>
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
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('admin-users')}>View All</Button>
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
                        <p className="text-xs text-slate-500">Joined {format(user.joinedDate, 'MMM yyyy')}</p>
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
  }

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
                          <Button variant="ghost" size="icon" onClick={() => adminUpdateFlightStatus(flight.id, 'Confirmed')} title="Confirm Flight" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => adminDeleteFlight(flight.id)} title="Delete Flight" className="text-red-400 hover:text-red-600 hover:bg-red-50">
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
                <h3 className="text-lg font-bold text-slate-900">{req.type} Request</h3>
                <p className="text-slate-700 bg-slate-100 p-3 rounded-md text-sm">"{req.details}"</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{requester?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Plane className="h-4 w-4" />
                    <span>Flight {flight?.id} ({flight?.origin}→{flight?.destination})</span>
                  </div>
                </div>
              </div>
              {req.status === 'Open' && (
                <div className="flex items-start justify-end">
                  <Button onClick={() => adminFulfillRequest(req.id)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4" /> Mark Fulfilled
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
        {conciergeRequests.length === 0 && (
          <p className="text-slate-500 italic">No concierge requests found.</p>
        )}
      </div>
    </div>
  );

  const RenderAdminUsers = () => (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500">View and manage portal members.</p>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status Level</th>
              <th className="px-6 py-3">Balance</th>
              <th className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id} className="bg-white">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-6 py-4 font-medium">${user.balance.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-500">{format(user.joinedDate, 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );


  // --- VIEW ROUTER ---
  const renderCurrentView = () => {
    switch (currentView) {
      // User Views
      case 'dashboard': return <RenderDashboard />;
      case 'flights': return <RenderFlights />;
      case 'fleet': return <RenderFleet />;
      case 'concierge': return <RenderConcierge />;
      case 'profile': return <RenderProfile />;
      // Admin Views
      case 'admin-dashboard': return <RenderAdminDashboard />;
      case 'admin-flights': return <RenderAdminFlights />;
      case 'admin-concierge': return <RenderAdminConcierge />;
      case 'admin-users': return <RenderAdminUsers />;
      default: return <RenderDashboard />;
    }
  }

  // --- UNAUTHENTICATED VIEW ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Hero / Brand Side */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483304528321-0674f0040030?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Wind className="h-8 w-8" />
              <span>direct2 aero</span>
            </div>
          </div>
          <div className="relative z-10 max-w-md">
            <blockquote className="text-2xl font-medium leading-relaxed">
              "The most seamless way to fly in and out of Central Oregon. Their Pilatus fleet is perfect for mountain flying."
            </blockquote>
            <p className="mt-4 text-slate-400"> Sarah Jenkins, Bend Resident</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[380px] mx-auto space-y-6">
            <div className="md:hidden flex justify-center mb-8">
               <div className="flex items-center gap-2 text-2xl font-bold text-slate-900 tracking-tight">
                  <Wind className="h-8 w-8" />
                  <span>direct2 aero</span>
                </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {authView === 'signin' ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {authView === 'signin' ? 'Welcome back. Please enter your details.' : 'Start your premium travel experience today.'}
              </p>
            </div>

            {/* Hint for Demo purposes */}
            <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
              <p><strong>Admin Demo:</strong> mauricio@stokeleads.com / StokeLeadsD2</p>
              <p className="mt-1"><strong>User Demo:</strong> alex@example.com / (any password)</p>
            </div>

            {authView === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded bg-red-50 text-red-600 text-sm font-medium">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-white" 
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
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="bg-white" 
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">Sign In</Button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); alert("Sign up simulation complete. Please sign in."); setAuthView('signin'); }} className="space-y-4">
                <div className="space-y-2"><Label>Full Name</Label><Input required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" required /></div>
                <Button type="submit" className="w-full" size="lg">Create Account</Button>
              </form>
            )}

            <div className="text-center text-sm">
              {authView === 'signin' ? (
                <p>Don't have an account? <button onClick={() => setAuthView('signup')} className="font-semibold text-slate-900 hover:underline">Sign up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setAuthView('signin')} className="font-semibold text-slate-900 hover:underline">Sign in</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED LAYOUT ---
  const NavItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: View }) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full",
        currentView === view ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-slate-900 text-white">
           <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Wind className="h-6 w-6" />
              <span>direct2 aero</span>
            </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto p-4">
          {isAdmin ? (
            // Admin Navigation
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
            // Regular User Navigation
            <nav className="space-y-1 flex-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" />
              <NavItem icon={Plane} label="My Flights" view="flights" />
              <NavItem icon={Coffee} label="Concierge" view="concierge" />
              <NavItem icon={Briefcase} label="Fleet" view="fleet" />
            </nav>
          )}

          <div className="space-y-1 pt-4 border-t border-slate-200 mt-auto">
            {!isAdmin && <NavItem icon={Settings} label="Settings" view="profile" />}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Mini Profile */}
        <div className={cn("p-4 border-t border-slate-200 flex items-center gap-3", isAdmin ? 'bg-slate-900 text-white border-slate-800' : '')}>
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold", isAdmin ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600')}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium truncate", isAdmin ? 'text-white' : 'text-slate-900')}>{currentUser.name}</p>
            <p className={cn("text-xs truncate", isAdmin ? 'text-slate-400' : 'text-slate-500')}>{isAdmin ? 'Administrator' : currentUser.status + ' Member'}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 h-16 flex items-center justify-between">
         <div className="flex items-center gap-2 text-lg font-bold">
            <Wind className="h-6 w-6" />
            <span>direct2 aero {isAdmin && <span className="text-xs bg-slate-800 px-2 py-1 rounded ml-2 font-normal uppercase">Admin</span>}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-slate-900/90" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-white p-4 flex flex-col" onClick={e => e.stopPropagation()}>
             {isAdmin ? (
               <nav className="space-y-1 flex-1">
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">Admin</p>
                <NavItem icon={LayoutDashboard} label="Overview" view="admin-dashboard" />
                <NavItem icon={Ticket} label="Flights" view="admin-flights" />
                <NavItem icon={ClipboardList} label="Concierge" view="admin-concierge" />
                <NavItem icon={Users} label="Users" view="admin-users" />
              </nav>
             ) : (
              <nav className="space-y-1 flex-1">
                <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" />
                <NavItem icon={Plane} label="My Flights" view="flights" />
                <NavItem icon={Coffee} label="Concierge" view="concierge" />
                <NavItem icon={Briefcase} label="Fleet" view="fleet" />
                <NavItem icon={Settings} label="Settings" view="profile" />
              </nav>
             )}
            <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 mt-auto">
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={cn("flex-1 transition-all duration-200 ease-in-out p-4 md:p-8 lg:p-10 mt-16 lg:mt-0 lg:ml-64")}>
        <div className="mx-auto max-w-6xl h-full">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}
