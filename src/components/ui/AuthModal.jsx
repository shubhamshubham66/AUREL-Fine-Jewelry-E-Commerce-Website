import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginForm.email) errs.email = 'Email is required';
    else if (!validateEmail(loginForm.email)) errs.email = 'Invalid email format';
    if (!loginForm.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    login(loginForm.email, loginForm.password);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const errs = {};
    if (!signupForm.name) errs.name = 'Name is required';
    if (!signupForm.email) errs.email = 'Email is required';
    else if (!validateEmail(signupForm.email)) errs.email = 'Invalid email format';
    if (!signupForm.password) errs.password = 'Password is required';
    if (signupForm.password !== signupForm.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    signup(signupForm.name, signupForm.email, signupForm.password);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close authentication modal backdrop"
          />
          <motion.div
            className="relative w-full max-w-md glass-strong rounded-xl p-6 sm:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cream/50 hover:text-gold transition-colors"
              aria-label="Close modal"
            >
              <FiX className="text-xl" />
            </button>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-cream/10 pb-3">
              <button
                onClick={() => switchTab('login')}
                className={`text-sm font-medium tracking-wide transition-colors pb-2 ${
                  tab === 'login'
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-cream/50 hover:text-cream'
                }`}
                aria-label="Login tab"
              >
                Login
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={`text-sm font-medium tracking-wide transition-colors pb-2 ${
                  tab === 'signup'
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-cream/50 hover:text-cream'
                }`}
                aria-label="Sign up tab"
              >
                Sign Up
              </button>
            </div>

            {success ? (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-4">
                  <span className="text-gold text-2xl">✓</span>
                </div>
                <p className="text-cream font-serif text-xl">Welcome to AUREL</p>
                <p className="text-cream/50 text-sm mt-1">Your luxury experience awaits</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {tab === 'login' ? (
                  <motion.form
                    key="login"
                    onSubmit={handleLogin}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-onyx/60 border border-cream/10 rounded-lg text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                          aria-label="Email address"
                        />
                      </div>
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-onyx/60 border border-cream/10 rounded-lg text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                          aria-label="Password"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-cream/50 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={loginForm.remember}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, remember: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-cream/20 bg-onyx"
                          aria-label="Remember me"
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        className="text-gold/70 text-sm hover:text-gold transition-colors"
                        aria-label="Forgot password"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="btn-gold w-full text-center mt-2"
                      aria-label="Sign in"
                    >
                      Sign In
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    onSubmit={handleSignup}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                        <input
                          type="text"
                          placeholder="Full name"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-onyx/60 border border-cream/10 rounded-lg text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                          aria-label="Full name"
                        />
                      </div>
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-onyx/60 border border-cream/10 rounded-lg text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                          aria-label="Email address"
                        />
                      </div>
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, password: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-onyx/60 border border-cream/10 rounded-lg text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                          aria-label="Password"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={signupForm.confirm}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, confirm: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-onyx/60 border border-cream/10 rounded-lg text-cream placeholder-cream/30 focus:outline-none focus:border-gold/40 transition-colors"
                          aria-label="Confirm password"
                        />
                      </div>
                      {errors.confirm && (
                        <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="btn-gold w-full text-center mt-2"
                      aria-label="Create account"
                    >
                      Create Account
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
