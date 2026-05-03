import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2 7-7 7 7 2 2v8a2 2 0 01-2 2h-3v-7H10v7H7a2 2 0 01-2-2v-8z' },
  { to: '/services', label: 'Services', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { to: '/ai', label: 'AI Knowledge', icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5' },
  { to: '/faqs', label: 'FAQs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.008v.008H12V18z M3 12a9 9 0 1118 0 9 9 0 01-18 0z' },
  { to: '/content', label: 'Site Content', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/leads', label: 'Leads', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-zinc-900/40 z-30" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-zinc-100 flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-7 py-6 border-b border-zinc-100">
          <Link to="/" className="block">
            <div className="font-display text-3xl text-zinc-900 leading-none">CARVO</div>
            <div className="text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-bold mt-1">Admin Console</div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
                }`
              }
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
              </svg>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="px-4 py-3 rounded-xl bg-zinc-50">
            <div className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold mb-1">Signed in as</div>
            <div className="text-sm font-bold text-zinc-900 truncate">{user?.email}</div>
          </div>
          <button onClick={logout} className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 transition text-left">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-0 min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-zinc-100 px-5 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-display text-2xl">CARVO Admin</div>
        </header>

        <main className="p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
