import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./DOBCertificate.css";
import html2pdf from "html2pdf.js";
import AdminService from "../../services/adminService";

interface DOBCertificateProps {
  onClose: () => void;
  student: any;
}

const DOBCertificate: React.FC<DOBCertificateProps> = ({
  onClose,
  student,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [school, setSchool] = useState<any>({});

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    const id = localStorage.getItem("schoolId");
    const res = await AdminService.school(id);
    setSchool(res);
  };

  const handleDownload = () => {
    if (!certificateRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `${student?.name}-dob-certificate.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(certificateRef.current)
      .save();
  };

  const issueDate = new Date().toLocaleDateString("en-GB");

  return (
    <div className="bulk-overlay">
      <div className="bulk-modal" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div className="bulk-header">
          <h2>DOB Certificate</h2>

          <button
            onClick={handleDownload}
            className="btn-sm btn-primary"
          >
            Download PDF
          </button>

          <button
            onClick={onClose}
            className="btn-sm btn-danger"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="bulk-body">
          <div ref={certificateRef}>
            <div className="dob-certificate">

              {/* School Header */}
              <div className="dob-header">
                <div className="dob-logo">
                  <img
                    src={
                      school?.schoolLogo ||
                      "https://via.placeholder.com/80"
                    }
                    alt="School Logo"
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="dob-school-details">
                  <h1>{school?.schoolName}</h1>

                  <p>AFFILIATED ENGLISH MEDIUM</p>

                  <p>{school?.schoolAddress}</p>

                  {school?.affiliationNo && (
                    <p>
                      AFFILIATION NO. {school?.affiliationNo}
                    </p>
                  )}

                  <h2>DOB CERTIFICATE</h2>
                </div>
              </div>

              {/* Content */}
              <div className="dob-content">
                <p>
                  This is to certify that{" "}
                  <strong>{student?.name}</strong>,
                  daughter/son of{" "}
                  <strong>{student?.parentName}</strong>,
                  is a bonafide student of this school studying in
                  <strong> Class {student?.className}</strong>.
                </p>

                <p>
                  As per admission record No.
                  <strong> {student?.admissionNumber}</strong>,
                  the Date of Birth of the student is:
                </p>

                <div className="dob-date-box">
                  {student?.dateOfBirth}
                </div>

                <p>
                  This certificate is issued on the basis of school
                  admission records.
                </p>
              </div>

              {/* Footer */}
              <div className="dob-footer">
                <div>
                  <strong>
                    Issue Date : {issueDate}
                  </strong>
                </div>

                <div className="principal-sign">
                  <strong>Principal</strong>
                  <br />
                  {school?.schoolName}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOBCertificate;