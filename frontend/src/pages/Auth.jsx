import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

const initialRegisterForm = {
  firstName: '',
  lastName: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading, loginWithEmail, registerWithEmail, loginWithGoogle } = useUserAuth();

  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const redirectTo = useMemo(() => location.state?.from || '/', [location.state]);

  useEffect(() => {
    if (!loading && currentUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, loading, navigate, redirectTo]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await loginWithEmail(loginForm.email, loginForm.password);
      setMessage('Login successful.');
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError?.message || 'Unable to login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Password and confirm password must match.');
      setSubmitting(false);
      return;
    }

    try {
      await registerWithEmail(registerForm);
      setMessage('Account created successfully.');
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError?.message || 'Unable to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await loginWithGoogle();
      setMessage('Google login successful.');
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError?.message || 'Google login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="surface-panel mx-auto max-w-md">
      <h1 className="font-heading text-3xl text-slate-900">User Login & Registration</h1>
      <p className="mt-2 text-sm text-slate-600">Create your ID and continue shopping with your account.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === 'login' ? 'bg-ember text-white' : 'text-slate-600 hover:bg-white'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === 'register' ? 'bg-ember text-white' : 'text-slate-600 hover:bg-white'
          }`}
        >
          Register
        </button>
      </div>

      {mode === 'login' ? (
        <form className="mt-4 space-y-3" onSubmit={handleLogin}>
          <input
            required
            type="email"
            value={loginForm.email}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
          />
          <input
            required
            type="password"
            value={loginForm.password}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Password"
          />
          <button
            disabled={submitting}
            type="submit"
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <form className="mt-4 space-y-3" onSubmit={handleRegister}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={registerForm.firstName}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, firstName: event.target.value }))}
              placeholder="First Name"
            />
            <input
              required
              value={registerForm.lastName}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, lastName: event.target.value }))}
              placeholder="Last Name"
            />
          </div>
          <input
            value={registerForm.displayName}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, displayName: event.target.value }))}
            placeholder="Display Name (optional)"
          />
          <input
            required
            type="email"
            value={registerForm.email}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
          />
          <input
            required
            type="password"
            value={registerForm.password}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Password"
          />
          <input
            required
            type="password"
            value={registerForm.confirmPassword}
            onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            placeholder="Confirm Password"
          />
          <button
            disabled={submitting}
            type="submit"
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={handleGoogleLogin}
        className="btn-secondary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue with Google
      </button>

      {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-5 text-xs text-slate-500">
        By continuing, you agree to keep your account details up to date. You can edit profile details from your
        profile page any time.
      </p>
      <Link to="/" className="mt-3 inline-block text-xs font-semibold text-cyan-700 hover:underline">
        Back to home
      </Link>
    </section>
  );
}

export default Auth;
