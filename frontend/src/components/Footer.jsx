import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/70 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-heading text-3xl text-slate-900">Malwa Hardware</p>
          <p className="mt-2 max-w-md text-sm text-slate-600">
           It Owns varities of Oil paints , Almira fittings , Hardware things , Almira locks , Door fittings etc.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="chip">Trusted Since 2001</span>
            <span className="chip">Fast Dispatch</span>
            <span className="chip">Owner Support</span>
          </div>
        </div>

        <div>
          <p className="font-heading text-lg text-slate-900">Quick Links</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 ">
            <Link to="/products" className="hover:text-cyan-700 hover:underline chip mr-40">
              Browse Products
            </Link>
            <Link to="/contact" className="hover:text-cyan-700 hover:underline chip mr-40">
              Submit Query
            </Link>
            <Link to="/about" className="hover:text-cyan-700 hover:underline chip mr-40">
              About Store
            </Link>
            <Link to="/auth" className="hover:text-cyan-700 hover:underline chip mr-40">
              My Account
            </Link>
          </div>
        </div>

        <div>
          <p className="font-heading text-lg text-slate-900">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Phone: 7891338352</p>
            <p>Email: support@malwahardware.com</p>
            <p>Address: New Cloth Market Chittorgarh (Rajasthan)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
