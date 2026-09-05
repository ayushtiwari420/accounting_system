import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../services/authService.js";
import Button from "../components/Button.jsx";
import ParticleBackground from "../components/ParticleBackground.jsx";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email Input, 2: Email OTP & New Password Input
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailMeta, setEmailMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await authService.requestOtp({ email });
      const msg = response.message || response.data?.message || `Security verification OTP sent to ${email}.`;
      
      setSuccessMessage(msg);
      setStep(2);
    } catch (error) {
      console.error("Request OTP error:", error);
      const apiMsg =
        error.response?.data?.message ||
        (error.message && !error.message.includes("status code") ? error.message : null);
      setErrorMessage(
        apiMsg || "No registered user account found matching this email address."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Email OTP & Update Password in Database
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match. Please verify and try again.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword,
      });

      const msg = response.message || response.data?.message || "Password updated successfully in database! Redirecting to sign in...";

      setSuccessMessage(msg);

      setTimeout(() => {
        navigate("/login");
      }, 1600);
    } catch (error) {
      console.error("Reset Password error:", error);
      const apiMsg =
        error.response?.data?.message ||
        (error.message && !error.message.includes("status code") ? error.message : null);
      setErrorMessage(
        apiMsg || "Invalid OTP code. Please check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Animated Interactive Particle Background */}
      <ParticleBackground />

      {/* Ambient Glowing Aura Blurs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Glassmorphism Auth Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/50 ring-1 ring-black/5">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-800/40 mb-4 mx-auto transition-all duration-300 hover:scale-110">
            <i className="fa-solid fa-envelope-open-text text-2xl opacity-95"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 1 ? "Forgot Password?" : "Email Verification"}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1">
            {step === 1
              ? "Enter your email to receive security OTP"
              : `OTP Sent to ${email}`}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium flex items-center">
            <i className="fa-solid fa-circle-exclamation text-rose-500 mr-2.5 text-base shrink-0"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium flex items-center">
            <i className="fa-solid fa-circle-check text-emerald-500 mr-2.5 text-base shrink-0"></i>
            <span>{successMessage}</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: EMAIL ADDRESS ENTRY */
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@urbanfurniture.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base shadow-md shadow-blue-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
                  Sending Email Code...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-paper-plane mr-2 text-xs"></i>
                  Send Verification Email
                </span>
              )}
            </Button>
          </form>
        ) : (
          /* STEP 2: ENTER EMAIL OTP & NEW PASSWORD */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Enter Email OTP Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-shield-halved"></i>
                </span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-normal placeholder:tracking-normal"
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-check-double"></i>
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base shadow-md shadow-blue-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
                  Updating Password...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-arrows-rotate mr-2 text-xs"></i>
                  Verify OTP & Update Password
                </span>
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700 pt-2 transition-all"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Change Email Address
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link
            to="/login"
            className="text-sm font-bold text-[#1E3A8A] hover:text-blue-800 flex items-center justify-center"
          >
            <i className="fa-solid fa-arrow-left-long mr-2"></i> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
