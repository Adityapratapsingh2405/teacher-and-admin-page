import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./IdentityCard.css";
import html2pdf from "html2pdf.js";
import AdminService from "../../services/adminService";

interface IdentityCardProps {
  onClose: () => void;
  student: any;
}

const IdentityCard: React.FC<IdentityCardProps> = ({
  onClose,
  student,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
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
    if (!cardRef.current) return;

    html2pdf()
      .set({
        margin: 5,
        filename: `${student?.name}-identity-card.pdf`,
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
      .from(cardRef.current)
      .save();
  };

  return (
    <div className="bulk-overlay">
      <div className="bulk-modal" style={{ maxWidth: "900px" }}>
        <div className="bulk-header">
          <h2>Identity Card</h2>

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
          <div ref={cardRef}>
            <div className="identity-card">

              {/* School Header */}
              <div className="id-header">

                <div className="id-logo">
                  <img
                    src={
                      school?.schoolLogo ||
                      "https://via.placeholder.com/80"
                    }
                    alt=""
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="id-school">
                  <h1>{school?.schoolName}</h1>
                  <h3>AFFILIATED ENGLISH MEDIUM</h3>
                  <p>{school?.schoolAddress}</p>
                </div>

              </div>

              <div className="id-affiliation">
                AFFILIATION NO. {school?.affiliationNo || "XXXXXX"}
              </div>

              <div className="id-title">
                IDENTITY CARD {student?.sessionName}
              </div>

              {/* Details Table */}
              <table className="id-table">
                <tbody>
                  <tr>
                    <td className="label">SR NO</td>
                    <td>{student?.panNumber}</td>

                    <td
                      rowSpan={5}
                      className="photo-cell"
                    >
                      {student?.photo ? (
                        <img
                          src={student?.photo}
                          alt=""
                        />
                      ) : (
                        <div className="photo-placeholder">
                          PHOTO
                        </div>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="label">NAME</td>
                    <td>{student?.name}</td>
                  </tr>

                  <tr>
                    <td className="label">CLASS</td>
                    <td>{student?.className}</td>
                  </tr>

                  <tr>
                    <td className="label">
                      DATE OF BIRTH
                    </td>
                    <td>{student?.dateOfBirth}</td>
                  </tr>

                  <tr>
                    <td className="label">
                      FATHER NAME
                    </td>
                    <td>{student?.parentName}</td>
                  </tr>

                  <tr>
                    <td className="label">ADDRESS</td>
                    <td colSpan={2}>
                      {student?.address}
                    </td>
                  </tr>

                  <tr>
                    <td className="label">PHONE</td>
                    <td colSpan={2}>
                      {student?.mobileNumber}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer */}
              <div className="id-footer">
                <span>Class Teacher Sign</span>
                <span>PRINCIPAL</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCard;