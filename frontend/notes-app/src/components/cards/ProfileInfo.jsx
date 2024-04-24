import React from "react";
import { getInitials } from "../../utils/helper";

function ProfileInfo({ userInfo, onLogout, islogin }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-900 font-medium bg-slate-100 ">
        {getInitials(userInfo?.fullName)}
      </div>

      <div>
        <p className="text-sm font-medium">{userInfo?.fullName}</p>
        <button className="text-sm text-slate-700 underline" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileInfo;
