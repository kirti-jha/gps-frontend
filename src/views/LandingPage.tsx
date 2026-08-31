import React, { useState } from 'react';
import {
  Navigation,
  Smartphone,
  Shield,
  Zap,
  Layers,
  History,
  Route,
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Radio,
  BarChart3,
  Menu,
  X,
  Play,
  Gauge,
  Battery
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onOpenMobileTracker: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDashboard, onOpenMobileTracker }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(48);

  const features = [
    {
      icon: Smartphone,
      title: 'Zero-Hardware GPS Engine',
      description: 'Your user mobile phone becomes the dedicated GPS hardware. No expensive OBD or satellite trackers required.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Zap,
      title: 'Sub-Second Real-Time Stream',
      description: 'Socket.IO & Redis pub/sub engine streams live coordinates, heading vectors, and telemetry directly to the map.',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      icon: Layers,
      title: 'PostGIS Spatial Geofencing',
      description: 'Draw precise polygon and circle perimeter zones. Automated spatial triggers send instant breach alerts on entry/exit.',
      color: 'from-emerald-400 to-teal-600'
    },
    {
      icon: Route,
      title: 'Automated Trip Segmentation',
      description: 'Automatically segments continuous GPS data into discrete journeys with start/end times, distance covered, and stop durations.',
      color: 'from-amber-400 to-orange-600'
    },
    {
      icon: History,
      title: '10x Route History Replay',
      description: 'Interactive timeline playback with speed scrubbing (1x to 10x) and point-in-time query ("Where was vehicle X at 14:37?").',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Radio,
      title: 'Offline Queue & Reconnection Sync',
      description: 'When cell signal drops, the mobile app queues GPS vectors locally in memory and batch-syncs instantly upon reconnection.',
      color: 'from-rose-500 to-pink-600'
    }
  ];

  const plans = [
    {
      name: 'Starter Fleet',
      price: '$29',
      period: '/month',
      description: 'Ideal for small delivery teams & courier fleets',
      features: ['Up to 10 Mobile Trackers', 'Live Map Tracking', '24h Location History', 'Basic Geofencing (2 Zones)', 'Email Notifications'],
      popular: false
    },
    {
      name: 'Business Enterprise',
      price: '$99',
      period: '/month',
      description: 'Comprehensive tracking for commercial logistics',
      features: ['Up to 100 Mobile Trackers', 'Sub-second WebSocket Stream', '30-Day Route Replay & Stats', 'Unlimited Polygon Geofences', 'Automated Trips Engine', 'CSV Data Exporter'],
      popular: true
    },
    {
      name: 'Custom SaaS / White-label',
      price: 'Custom',
      period: '',
      description: 'Dedicated cloud infrastructure & white-label app',
      features: ['Unlimited Mobile Trackers', 'Dedicated PostgreSQL + PostGIS Cluster', 'Custom Domain & Branding', 'Developer REST & Webhook APIs', '24/7 SLA Technical Support'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      {/* Background Ambient Glow FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px]" />
      </div>

      {/* Header / Navigation Bar */}
      <nav className="relative z-30 border-b border-white/5 backdrop-blur-md bg-dark-900/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onLaunchDashboard}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Navigation className="w-5 h-5 text-blue-400 transform -rotate-45" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Track<span className="text-blue-500">X</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#architecture" className="hover:text-blue-400 transition">Architecture</a>
            <a href="#pricing" className="hover:text-blue-400 transition">Pricing Plans</a>
            <button
              onClick={onOpenMobileTracker}
              className="text-slate-300 hover:text-cyan-400 transition flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Mobile Client</span>
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onLaunchDashboard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-dark-800 border border-dark-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-800 border-b border-dark-700 p-4 space-y-3 text-sm font-semibold">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Features</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Architecture</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300">Pricing</a>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMobileTracker(); }}
              className="w-full py-2.5 text-left text-cyan-400 font-bold flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Try Mobile Client</span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onLaunchDashboard(); }}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-extrabold text-center shadow-lg shadow-blue-600/30"
            >
              Launch Admin Dashboard
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>REAL-TIME HARDWARE-FREE GPS ENGINE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none font-sans">
            Transform Any Mobile Phone Into a <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Live GPS Hardware Tracker.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate dedicated GPS hardware costs. Track vehicle fleets, delivery couriers, and field staff with sub-second WebSocket telemetry, PostGIS spatial geofencing, and automated route replays.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDashboard}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <span>Explore Live Fleet Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenMobileTracker}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600 font-extrabold text-sm transition flex items-center justify-center gap-3"
            >
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span>Try Mobile Client</span>
            </button>
          </div>
        </div>

        {/* Interactive Dashboard Mockup Card */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
          <div className="bg-dark-900 rounded-2xl p-4 sm:p-6 space-y-4">
            {/* Header controls inside mockup */}
            <div className="flex items-center justify-between border-b border-dark-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs text-slate-400 font-bold ml-2">trackx-fleet-telemetry-live.map</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold font-mono">LIVE STREAM: ACTIVE</span>
              </div>
            </div>

            {/* Mockup Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Telemetry Status Widget */}
              <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Rahul (Delivery Van #4)</span>
                  <span className="font-mono text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">TRK-928374</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-700">
                    <div className="text-[10px] text-slate-400 font-bold">SPEED</div>
                    <div className="text-lg font-extrabold text-blue-400">{demoSpeed} km/h</div>
                  </div>
                  <div className="bg-dark-900 p-2.5 rounded-lg border border-dark-700">
                    <div className="text-[10px] text-slate-400 font-bold">BATTERY</div>
                    <div className="text-lg font-extrabold text-emerald-400">88%</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-1 bg-dark-900/60 p-2 rounded-lg">
                  <div>Location: 28.6139° N, 77.2090° E</div>
                  <div>Accuracy: ±6 meters</div>
                  <div>Status: Moving ➔ Connaught Place</div>
                </div>
              </div>

              {/* Map Preview Banner */}
              <div className="lg:col-span-2 bg-gradient-to-tr from-dark-800 via-dark-800 to-blue-950 p-6 rounded-xl border border-dark-700 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    PostGIS Spatial Engine
                  </span>
                  <h4 className="text-lg font-extrabold text-white">High-Precision Canvas Vector Markers</h4>
                  <p className="text-xs text-slate-300 max-w-md">
                    Animated smooth position transitions, polygon geofence breach evaluator, and distance metrics.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between relative z-10">
                  <button
                    onClick={onLaunchDashboard}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Open Live Interactive Map
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">Latency: &lt; 40ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 relative z-10 bg-dark-800/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for Commercial Fleet Scale</h2>
            <p className="text-slate-400 text-sm">
              Everything required to monitor commercial vehicles, delivery fleets, field agents, and assets in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-dark-800 border border-dark-700/80 p-6 rounded-2xl space-y-4 hover:border-blue-500/40 transition group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section id="architecture" className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Modular Architecture</span>
            <h2 className="text-3xl font-extrabold text-white">How TrackX Pipeline Operates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-dark-900 p-5 rounded-2xl border border-dark-700 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold mx-auto flex items-center justify-center text-xs">1</div>
              <h4 className="font-bold text-sm text-slate-100">Mobile Phone GPS</h4>
              <p className="text-[11px] text-slate-400">Collects vectors (Lat, Lng, Speed, Battery, Heading)</p>
            </div>
            <div className="bg-dark-900 p-5 rounded-2xl border border-dark-700 space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold mx-auto flex items-center justify-center text-xs">2</div>
              <h4 className="font-bold text-sm text-slate-100">Ingestion API</h4>
              <p className="text-[11px] text-slate-400">Filters accuracy &amp; checks speed jumps (&lt;250 km/h)</p>
            </div>
            <div className="bg-dark-900 p-5 rounded-2xl border border-dark-700 space-y-2">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold mx-auto flex items-center justify-center text-xs">3</div>
              <h4 className="font-bold text-sm text-slate-100">PostGIS + Redis</h4>
              <p className="text-[11px] text-slate-400">Evaluates polygon spatial geofences &amp; trip stops</p>
            </div>
            <div className="bg-dark-900 p-5 rounded-2xl border border-dark-700 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold mx-auto flex items-center justify-center text-xs">4</div>
              <h4 className="font-bold text-sm text-slate-100">Live Dashboard</h4>
              <p className="text-[11px] text-slate-400">Socket.IO animates markers live on OpenStreetMap</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative z-10 bg-dark-800/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Transparent SaaS Plans</h2>
            <p className="text-slate-400 text-sm">Deploy on cloud or run containerized on your own infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-dark-800 rounded-3xl p-8 space-y-6 relative flex flex-col justify-between border ${
                  plan.popular
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-dark-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                    MOST POPULAR
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                  <div className="space-y-2.5 pt-4 text-xs text-slate-300">
                    {plan.features.map((ft, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{ft}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onLaunchDashboard}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition shadow-md ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      : 'bg-dark-900 hover:bg-dark-700 text-slate-200 border border-dark-600'
                  }`}
                >
                  Start Tracking Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-dark-900 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
              TX
            </div>
            <span className="font-extrabold text-slate-200">TrackX Real-Time GPS Platform</span>
          </div>
          <div>
            &copy; 2026 TrackX Inc. Enterprise Mobile Hardware-Free Location Engine.
          </div>
        </div>
      </footer>
    </div>
  );
};
