import { useState, FormEvent } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || !fullName) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await signup(email, password, fullName);
      setSuccess("Account created successfully. You can now log in.");

      // Wait 2 seconds before redirecting to give the user time to read the success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 p-3 mb-4 rounded"
              required
            />
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
              Create Account
            </button>
          </form>

          <p className="mt-4 text-gray-600 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-teal-600">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
