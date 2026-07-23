import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/car";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email.trim().toLowerCase(), password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error.message === "Failed to fetch" ||
        error.message.includes("database connection")
          ? "Cannot reach the server. Make sure the backend is running."
          : error.message === "Email or password is incorrect"
            ? "Invalid email or password. Please try again."
            : error.message || "Invalid email or password. Please try again.";
      setError(message);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp(email, password, { name, phone });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email.trim().toLowerCase(), password);
      setError("Password has been reset successfully. Please sign in.");
    } catch (error) {
      setError(error.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray py-12 px-4 sm:px-6 lg:px-8 mt-6">
      {/* Login Form */}
      <div className="w-full max-w-md space-y-8 p-8 bg-gray-50 rounded-lg shadow-md border border-gray-200">
        {mode === "login" && (
          <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-red-800">
                Sign in to your account
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm/6 font-medium text-red-900 "
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6 "
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm/6 font-medium text-red-900"
                    >
                      Password
                    </label>
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        onClick={() => setMode("forgot")}
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base border-2 border-red-900 text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-red-900 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-red-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm/6 text-gray-400">
                Not a member?
                <a
                  href="#"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  onClick={() => setMode("register")}
                >
                  Register
                </a>
              </p>
            </div>
          </div>
        )}

        {mode === "register" && (
          <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-red-800">
                Create your account
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    Full Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    Phone Number
                  </label>
                  <div className="mt-2">
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-password"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="register-password"
                      type="password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base border-2 border-red-900 text-black outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className={`text-sm text-center ${error.includes("successful") ? "text-green-600" : "text-red-600"}`}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-red-900 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                  >
                    {loading ? "Creating account..." : "Sign up"}
                  </button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm/6 text-gray-400">
                Already have an account?
                <a
                  href="#"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        )}

        {mode === "forgot" && (
          <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-red-800">
                Reset your password
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="reset-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="reset-password"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    New password
                  </label>
                  <div className="mt-2">
                    <input
                      id="reset-password"
                      type="password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirm-reset-password"
                    className="block text-sm/6 font-medium text-red-900"
                  >
                    Confirm new password
                  </label>
                  <div className="mt-2">
                    <input
                      id="confirm-reset-password"
                      type="password"
                      name="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base border-2 border-red-900 outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-900 sm:text-sm/6"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className={`text-sm text-center ${error.includes("successfully") ? "text-green-600" : "text-red-600"}`}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-red-900 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-red-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm/6 text-gray-400">
                Remember your password?
                <a
                  href="#"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
