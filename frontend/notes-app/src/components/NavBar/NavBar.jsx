import React, { useState } from "react";
import ProfileInfo from "../cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../searchbar/SearchBar";

function NavBar({ userInfo, islogin }) {
  const navigate = useNavigate();

  const [searchQuery, SetSearchQuery] = useState("");

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {};

  const onClearSearch = () => {
    SetSearchQuery("");
  };
  return (
    <div className="bg-white flex items-center border-b-2 justify-between px-6 py-2 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>

      <SearchBar
        value={searchQuery}
        onChange={({ target }) => {
          SetSearchQuery(target.value);
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      {islogin && (
        <ProfileInfo userInfo={userInfo} login={islogin} onLogout={onLogout} />
      )}
    </div>
  );
}

export default NavBar;
