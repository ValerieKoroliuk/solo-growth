import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSignUpSuccess(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground">Solo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your personal growth companion</p>
        </div>

        {signUpSuccess ? (
          <div className="solo-card text-center space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
            </p>
            <button
              onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="solo-card space-y-4">
            <h2 className="text-center font-display text-xl text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="font-medium text-primary hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
