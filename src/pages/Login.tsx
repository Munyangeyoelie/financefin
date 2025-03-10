import { useState, FormEvent } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
      // Redirect based on role - this uses the isAdmin property we added to the context
      if (isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-teal-500 text-white p-8 flex flex-col justify-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-white rounded-full" />
        </div>
        <h1 className="text-4xl font-bold uppercase">
          Filbert
          <br /> Finance
        </h1>
        <p className="mt-4 text-lg">
          Access your Finance App and get more profit
        </p>
        <div className="mt-8">
          <div className="w-16 h-16 bg-white rounded-full" />
          <div className="w-12 h-24 bg-teal-300 mt-4" />
        </div>
      </div>

      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Login</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 mb-4 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 mb-4 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-3 rounded font-bold"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-gray-600 text-center">
            Don't have an account?{" "}
            <a href="/signup" className="text-teal-600">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
