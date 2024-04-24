import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar/NavBar";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import { isValidEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!password) {
      setError("Please enter the password ");
      return;
    }

    setError("");

    //Login API Call
    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });
      //handle response of successfull
      console.log(response);
      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        setIsLogin(true);
        console.log(islogin);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occured .please try again");
      }
    }
  };
  return (
    <>
      <NavBar islogin={false} />

      <div className="flex items-center justify-center mt-28">
        <div className="w-98 border rounded bg-white px-7 py-10">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl mb-7">Login</h4>
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Login
            </button>
            <p className="text-sm text-center mt-4">
              Not registered yet?{" "}
              <Link to="/signup" className="font-medium text-primary underline">
                Create an Account{" "}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default login;
