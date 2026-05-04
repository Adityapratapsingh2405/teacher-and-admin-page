import { useEffect, useRef, useState } from "react";
import {AdminService, TransDataType} from '../../services/adminService';
import './TransportManagement.css';

const TransportManagement = () => 
{
  const titleRef = useRef<HTMLInputElement>(null);
  const locRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  const [records,setRecords] = useState<any[]>([]);

  const [updateRec,setUpdateRec] = useState<any>(null);

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
    if(updateRec==null)
    {
      let res = await AdminService.transSave(ob);
      e.target.reset();
    }else{
      let res = await AdminService.transUpdate(ob,updateRec.id);
      setUpdateRec(null);
       e.target.reset();
    }
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

  const editRoute = async(route:any)=>
  {
    setUpdateRec(route);
  }
  const delRoute = async(route:any)=>{
    const res = await AdminService.transDelete(route.id);
    fetchData();
  }

  return (
    <div className="transport-page">
      <section className="transport-card">
        <h3>Add New Record</h3>
        <p className="section-note">Add or update transport route details and schedule for student pick-up and drop-off.</p>
        <form onSubmit={save} className="transport-form">
          <div className="transport-form-row">
            <div className="form-group">
              <label htmlFor="route-title">Route</label>
              <input id="route-title" type="text" className="form-control" ref={titleRef} 
              defaultValue={updateRec?.routeTitle} placeholder="Route Title" required />
            </div>
            <div className="form-group">
              <label htmlFor="pickup-location">PickUp Location</label>
              <input id="pickup-location" type="text" className="form-control" ref={locRef} defaultValue={updateRec?.pickUpLocation} placeholder="PickUp Location" required />
            </div>
            <div className="form-group">
              <label htmlFor="pickup-time">PickUp Time</label>
              <input id="pickup-time" type="time" 
              defaultValue={updateRec?.pickUpTime}className="form-control" ref={timeRef} required />
            </div>
          </div>

          <div className="transport-form-row wide">
            <div className="form-group">
              <label htmlFor="drop-time">Drop Time</label>
              <input id="drop-time" type="time" 
              defaultValue={updateRec?.dropTime}className="form-control" ref={dropRef} required />
            </div>
            <div className="form-group">
              <label htmlFor="note">Note</label>
              <input id="note" type="text" className="form-control" ref={noteRef} defaultValue={updateRec?.note} placeholder="Note" required />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={()=>setUpdateRec(null)} className="btn btn-primary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Entry</button>
          </div>
        </form>
      </section>

      <section className="transport-card">
        <h3>Transport Records</h3>
        <div className="transport-table-container">
          <table className="transport-table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Route</th>
                <th>PickUp Location</th>
                <th>PickUp Time</th>
                <th>Drop Time</th>
                <th>Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r:any, index:number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{r.routeTitle}</td>
                  <td>{r.pickUpLocation}</td>
                  <td>{r.pickUpTime}</td>
                  <td>{r.dropTime}</td>
                  <td>{r.note}</td>
                  <td>
                    <button className="btn-sm btn-warning" onClick={()=>editRoute(r)}>Edit</button>
                    &nbsp;
                    <button className="btn-sm btn-danger" onClick={()=>delRoute(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default TransportManagement;
