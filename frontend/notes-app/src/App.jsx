import React from "react";
import Home from "./pages/Home/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/SignUp/Signup";
import Login from "./pages/Login/login";

const routes = (
  <Router>
    <Routes>
      <Route path="/dashboard" exact element={<Home />} />
      <Route path="/Login" exact element={<Login />} />
      <Route path="/Signup" exact element={<Signup />} />
    </Routes>
  </Router>
);

const App = () => {
  return <div>{routes}</div>;
};

export default App;
