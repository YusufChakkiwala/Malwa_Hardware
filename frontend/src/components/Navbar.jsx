import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' }
];

function Navbar() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { currentUser, profile, logoutUser } = useUserAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const clickTimesRef = useRef([]);
  const menuRef = useRef(null);

  const displayName = useMemo(() => {
    return profile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  }, [profile?.displayName, currentUser?.displayName, currentUser?.email]);

  const avatarUrl = profile?.avatarUrl || currentUser?.photoURL || '';
  const navLinks = currentUser ? [...links, { to: '/orders/history', label: 'My Orders' }] : links;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogoClick = (event) => {
    const now = Date.now();
    clickTimesRef.current = [...clickTimesRef.current, now].filter((time) => now - time <= 3000);
    if (clickTimesRef.current.length >= 5) {
      clickTimesRef.current = [];
      event.preventDefault();
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/auth');
  };

  return (
    <>
      <div className="border-b border-cyan-200/70 bg-cyan-50/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs text-cyan-900 md:px-6">
          <p className="font-semibold tracking-wide">Same-Day Dispatch for In-Stock Items</p>
          <p className="hidden font-medium text-cyan-700 md:block">Need help? Live chat is available 9AM to 9PM</p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link to="/" onClick={handleLogoClick} className="group flex items-center gap-2">
            <span className="rounded-xl border border-amber-300/70 bg-amber-100 px-2 py-1 text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">
              MH
            </span>
            <div className="leading-tight">
              <p className="font-heading text-xl tracking-tight text-slate-900 md:text-2xl">Malwa Hardware</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Tools and Supplies</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'
                      : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/cart" className="btn-primary px-3 py-2 text-xs md:text-sm">
              Cart ({itemCount})
            </Link>

            {currentUser ? (
              <div ref={menuRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/50"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-cyan-100" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-800">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[128px] truncate text-xs font-semibold text-slate-700 md:max-w-[170px]">Hi, {displayName}</span>
                </button>

                {menuOpen && (
                  <div className="float-in absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1 shadow-industrial">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      Profile Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn-secondary hidden px-3 py-2 text-xs md:inline-flex md:text-sm">
                Login / Register
              </Link>
            )}

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? 'X' : '≡'}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white/95 px-4 py-3 md:hidden">
            <nav className="grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700"
                  >
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700"
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;
