import React, { useEffect, useRef, useState } from "react";
import "./SchoolList.css";

import {AdminService} from '../services/adminService';

interface BulkEntryProps {
  onClose: () => void;
}

const SchoolList: React.FC<BulkEntryProps> = ({ onClose }) => 
{ 
  useEffect(()=>{
    fetchSchool();
  },[]);

  const [schools, setSchools] = useState<any[]>([]);

  const fetchSchool = async()=>{
    const res = await AdminService.schoolsList();
    console.log(res);
    setSchools(res)
  }
  return (
    <div className="bulk-overlay">
      <div className="bulk-modal">
        {/* HEADER */}
        <div className="bulk-header">
          <h2 className="m-0">School Records</h2>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="bulk-body">
          {/* DOWNLOAD SECTION */}  
          <table className="table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>School Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>WebSite</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((ob:any,index:number)=><tr key={index}>
                <td>{index+1}</td>
                <td> 
                    <b>{ob.schoolName} </b> <br/>
                    {ob.schoolAddress}
                </td>
                <td>{ob.schoolEmail}</td>
                <td>{ob.schoolContactNumber}</td>
                <td>
                  <a href={ob.schoolWebsite} target="_blank">{ob.schoolWebsite}</a>
                </td>
              </tr>)}
            </tbody>
          </table>      
        </div>
      </div>
    </div>
  );
};

export default SchoolList;
