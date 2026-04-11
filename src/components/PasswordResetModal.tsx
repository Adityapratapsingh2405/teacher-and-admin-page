import { useState } from "react";
import "./PasswordResetModal.css";
import {UserManagementService} from '../services/userManagementService';

interface BulkEntryProps {
  onClose: () => void;
}

const PasswordResetModal: React.FC<BulkEntryProps> = ({ onClose }) => {
  const [password, setPassword] = useState("");
   const [oldpassword, setOldPassword] = useState("");
  const [show, setShow] = useState(false);
  const [oldshow, setOldShow] = useState(false);

  const [msg,setMsg] = useState("");

    const handleReset = async ()=>{
       const email = localStorage.getItem("userEmail");
       const panNumber = localStorage.getItem("panNumber");
       const userType = localStorage.getItem("userType");

       const res = await UserManagementService.changeUserPassword({email,panNumber,userType,password,oldpassword});
       if(res=='success'){
        setMsg("Password Changed.");
        setPassword(""); setOldPassword("");
        }else{
            setMsg(res);
        }
    }

  return (
    <div className="reset-overlay">
      <div className="reset-modal">

        {/* HEADER */}
        <div className="reset-header">
          <h2 className="m-0">🔐 Change Password</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="reset-body">

          {/* PASSWORD FIELD */}
          <div className="form-group">
            <label className="form-label">New Password</label>

            <div className="input-wrapper">

              <input
                type={oldshow ? "text" : "password"}
                className="form-input"
                placeholder="Enter old password"
                value={oldpassword}
                onChange={(e) => setOldPassword(e.target.value)}
              /><button
                className="toggle-btn"
                onClick={() => setOldShow(!oldshow)}
              >
                {oldshow ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="input-wrapper">
                 <input
                type={show ? "text" : "password"}
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              /><button
                className="toggle-btn"
                onClick={() => setShow(!show)}
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <b className="text-danger">{msg}</b>
          </div>

          {/* BUTTONS */}
          <div className="button-row">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleReset}>
              Reset Password
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;