import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./BonafideCertificate.css";
import html2pdf from "html2pdf.js";
import AdminService from "../../services/adminService";

interface BonafideCertificateProps {
  onClose: () => void;
  student: any;
}

const BonafideCertificate: React.FC<BonafideCertificateProps> = ({
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
        filename: `${student?.name}-bonafide-certificate.pdf`,
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
        <div className="bulk-header">
          <h2>Bonafide Certificate</h2>

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

        <div className="bulk-body">
          <div ref={certificateRef}>
            <div className="bonafide-certificate">

              {/* Header */}
              <div className="certificate-header">
                <div className="certificate-logo">
                  <img
                    src={
                      school?.schoolLogo ||
                      "https://via.placeholder.com/80"
                    }
                    alt="School Logo"
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="certificate-school">
                  <h1>{school?.schoolName}</h1>

                  <p>AFFILIATED ENGLISH MEDIUM</p>

                  <p>{school?.schoolAddress}</p>

                  {school?.affiliationNo && (
                    <p>
                      AFFILIATION NO. {school?.affiliationNo}
                    </p>
                  )}

                  <h2>BONAFIDE CERTIFICATE</h2>
                </div>
              </div>

              {/* Content */}
              <div className="certificate-content">
                <p>
                  It is certified that
                  <strong> {student?.name?.toUpperCase()}</strong>,
                  D/O or S/O
                  <strong> {student?.parentName?.toUpperCase()}</strong>
                  &nbsp;is/was a bonafide student of this institute
                  during the session
                  <strong> {student?.sessionName}</strong>.
                </p>

                <p>
                  His/Her date of birth is
                  <strong> {student?.dateOfBirth}</strong>.
                </p>

                <p>
                  He/She has appeared in/passed/failed in
                  <strong> Class {student?.className}</strong>
                  as a regular student of this institute.
                </p>

                <p>
                  He/She bears a good moral character.
                  We wish him/her all success in life.
                </p>
              </div>

              {/* Footer */}
              <div className="certificate-footer">
                <div>
                  <strong>Date : {issueDate}</strong>
                </div>

                <div className="principal-section">
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

export default BonafideCertificate;