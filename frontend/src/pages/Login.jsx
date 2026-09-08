import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormError("");
    setFieldErrors({});
    try {
      const res = await api.post("/auth/google", { credential: credentialResponse.credential });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error;
      setFormError(typeof msg === "string" ? msg : "Google sign-in failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setFormError("Unable to connect to server. Please check your network connection.");
      } else if (err.response.status === 401 || err.response.data?.error === "Invalid credentials") {
        setFormError("Invalid email or password. Please check your credentials and try again.");
        setFieldErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      } else if (Array.isArray(err.response.data?.details)) {
        const errors = {};
        err.response.data.details.forEach((detail) => {
          if (detail.field) {
            errors[detail.field] = detail.message;
          }
        });
        setFieldErrors(errors);
        if (err.response.data.error && typeof err.response.data.error === "string") {
          setFormError(err.response.data.error);
        }
      } else {
        const errorMsg = err.response.data?.error;
        setFormError(typeof errorMsg === "string" ? errorMsg : "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-gray-800 p-6 sm:p-8 rounded-lg w-full max-w-sm space-y-4 shadow-lg border border-gray-700"
      >
        <h1 className="text-2xl font-bold mb-2">Log In</h1>
        {formError && (
          <div className="p-3 rounded bg-red-900/40 border border-red-500/50 text-red-300 text-sm">
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs text-gray-300 mb-1 font-medium">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
              if (formError) setFormError("");
            }}
            className={`w-full p-2.5 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
              fieldErrors.email
                ? "border border-red-500 focus:ring-red-500"
                : "border border-transparent focus:ring-blue-500"
            }`}
          />
          {fieldErrors.email && (
            <p className="text-red-400 text-xs mt-1 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs text-gray-300 mb-1 font-medium">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              if (formError) setFormError("");
            }}
            className={`w-full p-2.5 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
              fieldErrors.password
                ? "border border-red-500 focus:ring-red-500"
                : "border border-transparent focus:ring-blue-500"
            }`}
          />
          {fieldErrors.password && (
            <p className="text-red-400 text-xs mt-1 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 p-2.5 rounded font-semibold transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError("Google sign-in failed")}
          />
        </div>
      </form>
    </div>
  );
}

export default Login;