import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

type LoginStatus = "checking" | "login" | "authorized";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LoginStatus>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Check for an existing authorized session.
  useEffect(() => {
    let active = true;

    async function checkSession() {
      const client = supabase;

      if (!client) {
        if (active) {
          setError("Supabase is not configured.");
          setStatus("login");
        }
        return;
      }

      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError || !userData.user) {
        if (active) setStatus("login");
        return;
      }

      const { data: isAdmin, error: roleError } = await client.rpc(
        "is_current_journal_admin",
      );

      if (!active) return;

      if (roleError) {
        setError("Unable to verify administrator access.");
        setStatus("login");
        return;
      }

      if (isAdmin === true) {
        navigate("/admin", { replace: true });
      } else {
        await client.auth.signOut();
        if (active) setStatus("login");
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      setError("Supabase is not configured.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const { error: loginError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw new Error("Invalid email or password.");
      }

      // Verify administrator permission.
      const { data: isAdmin, error: roleError } = await client.rpc(
        "is_current_journal_admin",
      );

      if (roleError) {
        await client.auth.signOut();
        throw new Error("Unable to verify administrator access.");
      }

      if (isAdmin !== true) {
        await client.auth.signOut();
        throw new Error("This account is not authorized.");
      }

      setPassword("");
      setShowPassword(false);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const client = supabase;
    if (!client) return;

    setBusy(true);
    const { error: logoutError } = await client.auth.signOut();
    setBusy(false);

    if (logoutError) {
      setError("Unable to sign out. Please try again.");
      return;
    }

    setStatus("login");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
  }

  if (status === "checking") {
    return (
      <div className="py-24 text-center text-muted" role="status">
        Checking administrator access...
      </div>
    );
  }

  if (status === "authorized") {
    return (
      <section className="mx-auto max-w-lg rounded-2xl bg-surface p-8 text-center sm:p-12">
        <div className="mb-5 text-5xl text-accent">✓</div>

        <h1 className="font-display text-4xl text-text">
          Admin Access Verified
        </h1>

        <p className="mt-5 text-muted">
          You have successfully signed in to the University Journal CMS.
        </p>

        <p className="mt-3 text-sm text-muted">
          Choose a Journal or Software Projects workspace from the admin hub.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            to="/admin"
            className="rounded-lg bg-accent px-6 py-3 font-bold text-[#131313]"
          >
            Open Admin Hub
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={busy}
            className="rounded-lg bg-accent px-6 py-3 font-bold text-[#131313] disabled:opacity-50"
          >
            {busy ? "Signing out..." : "Sign Out"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg rounded-2xl bg-surface p-8 sm:p-12">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">
          Portfolio Administration
        </p>

        <h1 className="font-display text-5xl text-text">Admin Login</h1>

        <p className="mt-4 text-sm text-muted">Administrator access only</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="admin-email" className="mb-2 block text-sm text-text">
            Email Address
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-[#131313] px-4 py-3 text-text outline-none focus:border-accent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm text-text"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-[#131313] py-3 pl-4 pr-20 text-text outline-none focus:border-accent"
              placeholder="Enter your password"
            />
            <button
              type="button"
              aria-controls="admin-password"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-1 right-1 rounded-md px-3 text-sm font-bold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !supabase}
          className="w-full rounded-lg bg-accent px-6 py-3 font-bold text-[#131313] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
