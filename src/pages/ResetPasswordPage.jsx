import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const { resetPassword, isResettingPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert("Passwords do not match");
    const success = await resetPassword(token, form.password);
    if (success) navigate("/login");
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors"
              >
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Set a New Password</h1>
              <p className="text-base-content/60">Choose a password at least 6 characters long.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New password</span>
              </label>
              <input
                type="password"
                className={`input input-bordered w-full`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm password</span>
              </label>
              <input
                type="password"
                className={`input input-bordered w-full`}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isResettingPassword}>
              {isResettingPassword ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Back to <Link to="/login" className="link link-primary">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title={"Reset password"}
        subtitle={"Enter a secure password and get back to chatting."}
      />
    </div>
  );
};
export default ResetPasswordPage;
