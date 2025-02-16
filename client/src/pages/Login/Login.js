import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      navigate("/"); // Redireciona para a página inicial
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.error || "An unexpected error occurred"));
    }
  };

  return (
    <div className="container my-5">
      <div className="mb-3">
        <div className="form-group mb-3">
          <label>E-mail</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
      </div>
      <div className="mb-3">
        <div className="form-group mb-3">
          <label>Senha</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>
      </div>
      <div className="mb-3">
        <div className="form-group mb-3">
          <button className="btn btn-md btn-primary w-100 fs-5" onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Login;