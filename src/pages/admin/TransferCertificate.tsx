import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./TransferCertificate.css";
import html2pdf from "html2pdf.js";
import AdminService from "../../services/adminService";

interface TransferCertificateProps {
  onClose: () => void;
  student: any;
}

const TransferCertificate: React.FC<TransferCertificateProps> = ({
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
        margin: 5,
        filename: `${student?.name}-TC.pdf`,
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

  return (
    <div className="bulk-overlay">
      <div className="bulk-modal" style={{ maxWidth: "1100px" }}>
        <div className="bulk-header">
          <h2>Transfer Certificate</h2>

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
            <div className="tc-container">

              {/* Header */}
              <div className="tc-header">

                <div className="tc-logo">
                  <img
                    src={
                      school?.schoolLogo ||
                      "https://via.placeholder.com/80"
                    }
                    alt=""
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="tc-school">
                  <h1>{school?.schoolName}</h1>
                  <p>AFFILIATED ENGLISH MEDIUM</p>
                  <p>{school?.schoolAddress}</p>
                  <p>
                    AFFILIATION NO.{" "}
                    {school?.affiliationNo || "XXXXXX"}
                  </p>

                  <h2>TRANSFER CERTIFICATE</h2>
                </div>
              </div>

              <div className="tc-number">
                <span>TC Sl No.</span>
                <span>SR No. {student?.panNumber}</span>
              </div>

              {/* Table */}
              <table className="tc-table">
                <tbody>

                  <tr>
                    <td>1. UDISE No.</td>
                    <td>{school?.udiseNo}</td>
                  </tr>

                  <tr>
                    <td>2. PEN No.</td>
                    <td>{student?.penNumber}</td>
                  </tr>

                  <tr>
                    <td>3. Name of the Student</td>
                    <td>{student?.name}</td>
                  </tr>

                  <tr>
                    <td>4. Mother's Name</td>
                    <td>{student?.motherName}</td>
                  </tr>

                  <tr>
                    <td>5. Father / Guardian Name</td>
                    <td>{student?.parentName}</td>
                  </tr>

                  <tr>
                    <td>6. Date of Birth (in Figures)</td>
                    <td>{student?.dateOfBirth}</td>
                  </tr>

                  <tr>
                    <td>7. Date of Birth (in Words)</td>
                    <td>{student?.dobInWords}</td>
                  </tr>

                  <tr>
                    <td>8. Nationality</td>
                    <td>{student?.nationality}</td>
                  </tr>

                  <tr>
                    <td>9. Category</td>
                    <td>{student?.category}</td>
                  </tr>

                  <tr>
                    <td>10. Date of Admission</td>
                    <td>{student?.admissionDate}</td>
                  </tr>

                  <tr>
                    <td>11. Class Last Attended</td>
                    <td>{student?.className}</td>
                  </tr>

                  <tr>
                    <td>12. Promoted To Class</td>
                    <td>{student?.promotedClass}</td>
                  </tr>

                  <tr>
                    <td>13. General Conduct</td>
                    <td>{student?.conduct || "Good"}</td>
                  </tr>

                  <tr>
                    <td>14. Reason for Leaving School</td>
                    <td>{student?.leavingReason}</td>
                  </tr>

                  <tr>
                    <td>15. Any Other Remark</td>
                    <td>{student?.remark}</td>
                  </tr>

                  <tr>
                    <td>
                      16. Date of Application for Certificate
                    </td>
                    <td>{student?.applicationDate}</td>
                  </tr>

                  <tr>
                    <td>
                      17. Date of Issue of Certificate
                    </td>
                    <td>{student?.issueDate}</td>
                  </tr>

                </tbody>
              </table>

              {/* Footer */}
              <div className="tc-footer">
                <div>Class Teacher</div>
                <div>Office Clerk</div>
                <div>Principal</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCertificate;