import { useEffect, useRef, useState } from "react";
import {AdminService, TransDataType} from '../../services/adminService';
const TransportManagement = () => 
{
  const titleRef = useRef<HTMLInputElement>(null);
  const locRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  const [records,setRecords] = useState<any[]>([]);

  useEffect(()=>{
    fetchData();
  },[])

  const fetchData = async()=>{
    const rec = await AdminService.transList();
    console.log(rec);
    setRecords(rec);
  }

  const save = async(e:any)=>{
    e.preventDefault();
    const ob: TransDataType = {
      routeTitle: titleRef.current?.value ?? null,
      pickUpLocation: locRef.current?.value ?? null,
      pickUpTime: convertTo12Hour(timeRef.current?.value ?? "") ?? null,
      dropTime: convertTo12Hour(dropRef.current?.value ?? "") ?? null,
      note: noteRef.current?.value ?? null,
    };
    console.log(ob);
    const res = await AdminService.transSave(ob);
    fetchData();
  }

  function convertTo12Hour(time: any) {
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12; // 0 -> 12

    return `${h}:${minute} ${ampm}`;
  }

  return (
      <div>
        <h3>Add New Record</h3>
        <form onSubmit={save}>
          <div className="row mt-3">
            <div className="col-xl-4 col-lg-4">
              <label>Route</label>
              <input type="text" className="form-control" ref={titleRef} placeholder="Route Title" required/>
            </div>
             <div className="col-xl-4 col-lg-4">
              <label>PickUp Location</label>
              <input type="text" className="form-control" ref={locRef} placeholder="PickUp Location" required/>
            </div>
             <div className="col-xl-4 col-lg-4">
              <label>PickUp Time</label>
              <input type="time" className="form-control" ref={timeRef} placeholder="PickUp Time" required/>
            </div>
          </div>
           <div className="row mt-3">
            <div className="col-xl-4 col-lg-4">
              <label>Drop Time</label>
              <input type="time" className="form-control" ref={dropRef} placeholder="Drop Time" required/>
            </div>
             <div className="col-xl-8 col-lg-8">
              <label>Note</label>
              <input type="text" className="form-control" ref={noteRef} placeholder="Note" required/>
            </div>            
          </div>
           <div className="row mt-3">
            <div className="col-xl-4 col-lg-4">
              <button className="btn btn-primary">Save Entry</button>
            </div>
           </div> 
        </form>
        <hr/>
        <h3>Transport Records</h3>
        <table className="table mt-3">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Route</th>
              <th>PickUp Location</th>
              <th>PickUp Time</th>
              <th>Drop Time</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
              {records.map((r:any,index:number)=><tr>
                <td>{index+1}</td>
                <td>{r.routeTitle}</td>
                <td>{r.pickUpLocation}</td>
                <td>{r.pickUpTime}</td>
                <td>{r.dropTime}</td>
                <td>{r.note}</td>
              </tr>)}
          </tbody>
        </table>
    </div>
  );
};

export default TransportManagement;
