import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields ❌");
      return;
    }

    try {
      const res = await fetch("https://shubhsah-production.up.railway.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.token) {
        toast.error("Invalid credentials ❌");
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success("Login successful ✅");
      navigate("/dashboard");

    } catch (err) {
      toast.error("Server error ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-blue-400 to-purple-500">

      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Login 🚀
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          className="w-full border p-2 mb-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm text-blue-500 mb-3"
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </button>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;