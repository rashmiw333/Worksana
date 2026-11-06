import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();

    setMessage("");
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(
        "https://workasana-backend-xi.vercel.app/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed.");
      }

      setMessage("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(true);
      setMessage(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="card shadow border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center mb-2">Create Account</h2>

              <p className="text-center text-muted mb-4">
                Join Workasana and manage your tasks.
              </p>

              {message && (
                <div
                  className={`alert ${
                    error ? "alert-danger" : "alert-success"
                  }`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSignup}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              <p className="text-center mt-4 mb-0">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
