import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";

import {AdminService} from '../../services/adminService';

interface BulkEntryProps {
  onClose: () => void;
}

const TodayCollection: React.FC<BulkEntryProps> = ({ onClose }) => 
{
  const [records,setRecords] = useState<any[]>([]);

  useEffect(()=>{
    const date = new Date().toISOString().split('T')[0];
    loadFees(date);
  },[]);

  const loadFees = async(date:any)=>{   
   const records = await AdminService.feesList(date);
   console.log(records);
    setRecords(records);
  }
  return (
    <div className="bulk-overlay">
      <div className="bulk-modal">
        {/* HEADER */}
        <div className="bulk-header">
          <h2 className="m-0">Fee Collection</h2>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="bulk-body">

           <input
              type="date"
              className="form-control"
              defaultValue={new Date().toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e)=>loadFees(e.target.value)}
            />
            <hr/>
            {records.length==0?<div className="flex flex-col items-center justify-center py-10">
                <h2 className="text-xl font-semibold text-gray-700 mt-4">
                    No Records Found
                </h2>

                <p className="text-gray-500 mt-2 text-center">
                    There are currently no records available to display.
                </p>

            </div>:<>
            <h3>Total Collection : {records.reduce((pv:number,ob:any)=>pv+ob.amount,0)}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Student Details</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                  {records.map((ob:any,index:number)=><tr>
                    <td>{index+1}</td>
                    <td>
                      <b>Receipt : {ob.receiptNumber}</b> <br/>
                      Student : {ob.name} &nbsp; ({ob.panNumber}) <br/>
                      Class / Section : {ob.classSection} , {ob.session} <br/>
                      Mobile : {ob.mobileNumber}
                    </td>
                    <td>{ob.amount}</td>
                  </tr>)}
              </tbody>
            </table></>}
            
        </div>
      </div>
    </div>
  );
};

export default TodayCollection;
