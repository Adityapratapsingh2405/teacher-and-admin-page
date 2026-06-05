import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./Activity.css";
import html2pdf from "html2pdf.js";
import AdminService from "../../services/adminService";

interface ActivityUndertakingProps {
  onClose: () => void;
  student: any;
}

const ActivityUndertaking: React.FC<ActivityUndertakingProps> = ({
  onClose,
  student,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [school, setSchool] = useState<any>({});

  const [activity,setActivity] = useState<string | null>(null);

  useEffect(() => {
    fetchSchool();
    const activity = prompt("Enter Activity");
    setActivity(activity);
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
        filename: `${student?.name}-activity-undertaking.pdf`,
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
          <h2>Activity Undertaking</h2>

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
            <div className="undertaking-container">

              {/* Header */}
              <div className="undertaking-header">
                <div className="undertaking-logo">
                  <img
                    src={
                      school?.schoolLogo ||
                      "https://via.placeholder.com/80"
                    }
                    alt=""
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="undertaking-school">
                  <h1>{school?.schoolName}</h1>
                  <p>AFFILIATED ENGLISH MEDIUM</p>
                  <p>{school?.schoolAddress}</p>
                  <p>
                    AFFILIATION NO.{" "}
                    {school?.affiliationNo || "XXXXXX"}
                  </p>

                  <h2>ACTIVITY UNDERTAKING</h2>
                </div>
              </div>

              {/* Content */}
              <div className="undertaking-content">

                <p>
                  I shall be happy if my ward
                  <strong> {student?.name?.toUpperCase()}</strong>
                  &nbsp;admission no.
                  <strong> {student?.admissionNumber}</strong>
                  &nbsp;studying in Class
                  <strong> {student?.className}</strong>
                  &nbsp;as per his/her desire & selection to
                  participate in the <b>"{activity?activity:""}"</b> conducted by the
                  school.
                </p>

                <p>
                  This may be treated as my formal consent for
                  the above courses / activities. I agree to abide
                  by the directions of the course in-charge and the
                  authorities of <strong>{school?.schoolName}</strong>
                  &nbsp;at all times during the course of training
                  of my ward.
                </p>

                <p>
                  In case of any mishap, accident or injury,
                  I shall not hold the school or any member of its
                  staff wholly or partially responsible for it.
                </p>

              </div>

              {/* Footer */}
              <div className="undertaking-footer">

                <div className="left-sign">
                  <div>Date: {issueDate}</div>

                  <div className="parent-sign">
                    <strong>
                      {student?.parentName?.toUpperCase()}
                    </strong>
                    <br />
                    Signature of Parent/Guardian
                  </div>
                </div>

                <div className="right-sign">
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

export default ActivityUndertaking;