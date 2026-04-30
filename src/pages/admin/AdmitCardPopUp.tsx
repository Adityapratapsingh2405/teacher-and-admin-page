import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./AdmitCard.css";
import html2pdf from "html2pdf.js";
import AdminService from "../../services/adminService";

interface AdmitCardProps {
  onClose: () => void;
  student:any;
}

const AdmitCard: React.FC<AdmitCardProps> = ({ onClose,student }) => 
{
  //console.log(student)
  const cardRef = useRef<HTMLDivElement>(null);
  const [school,setSchool] = useState<any>([]);

  const handleDownload = () => {
    if (!cardRef.current) return;

    const opt:any = {
      margin: 10,
      filename: `${student?.name || "admit-card"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 }, // better quality
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set({
          margin: 10,
          filename: `${student?.name || "admit-card"}.pdf`,
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,   // ✅ IMPORTANT
            allowTaint: false
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        }).from(cardRef.current).save();
  };

  useEffect(()=>{
    fetchSchool();
  },[])

    const fetchSchool = async()=>{
        const id:any = localStorage.getItem('schoolId');
        const res = await AdminService.school(id);
        console.log(res);
        setSchool(res)
      }
  
  return (
    <div className="bulk-overlay">
      <div className="bulk-modal" style={{ maxWidth: "800px" }}>
        
        {/* Header */}
        <div className="bulk-header">
          <h2>Admit Card</h2>
           <button onClick={handleDownload} className="btn-sm btn-primary">
              Download PDF
            </button>
          <button onClick={onClose} className="btn-sm btn-danger">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="bulk-body">
           <div ref={cardRef}>
          <div className="card">
            
            {/* Header */}
            <div className="header">
              <div className="logo">
                <img src={school?.schoolLogo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-8IRdKonj2lw5KF7osJq3GRJSOrjKiKck0g&s'} alt="School logo" crossOrigin="anonymous"/>
              </div>
              <div className="title">
                <h2>{school?.schoolName}</h2>
                <p>AFFILIATED ENGLISH MEDIUM</p>
                <p>{school?.schoolAddress}</p>
                {/* <p className="affiliation">AFFILIATION NO. 16856/14</p> */}
                <h3>ADMIT CARD {student?.sessionName}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="body">
              <div className="left">
                <div className="row">
                  <span>SR NO</span>
                  <span>{student?.panNumber}</span>
                </div>
                <div className="row">
                  <span>NAME</span>
                  <span>{student?.name}</span>
                </div>
                <div className="row">
                  <span>CLASS</span>
                  <span>{student?.className}</span>
                </div>
                <div className="row">
                  <span>DATE OF BIRTH</span>
                  <span>{student?.dateOfBirth}</span>
                </div>
                <div className="row">
                  <span>FATHER NAME</span>
                  <span>{student?.parentName}</span>
                </div>
                <div className="row">
                  <span>ADDRESS</span>
                  <span>{student?.address}</span>
                </div>
                <div className="row">
                  <span>PHONE</span>
                  <span>{student?.mobileNumber}</span>
                </div>
              </div>

              {/* Photo */}
              <div className="photo-box">
                Photo
              </div>
            </div>
            <br/>
            {/* Footer */}
            <div className="footer">
              <span><b>Class Teacher Sign</b></span>
              <span><b>PRINCIPAL</b></span>
            </div>

          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdmitCard;