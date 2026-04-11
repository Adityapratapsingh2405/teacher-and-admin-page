import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import "./BulkEntry.css";

interface BulkEntryProps {
  onClose: () => void;
}

const studentColumns = [
  "PEN / SR No",
  "Name",
  "Gender",
  "Class",
  "Session",
  "Father Name",
  "Mobile",
];
const teacherColumns = ["Name", "Email", "Mobile"];

const BulkEntry: React.FC<BulkEntryProps> = ({ onClose }) => {
  const [uploadType, setUploadType] = useState<string>("");
  const [uploadData, setUploadData] = useState<any>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = (type: string) => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      // Read workbook
      const workbook = XLSX.read(data, { type: "array" });

      // First sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
    let jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: undefined
    });
    jsonData = jsonData.map((row: any) => {
        const newObj: any = {};
        const columns = uploadType=="Student"?studentColumns:teacherColumns;
        columns.forEach((col) => {
          newObj[col] = row[col] !== undefined ? row[col] : undefined;
        });

        return newObj;
      });

      console.log("Excel JSON:", jsonData);

      const checkingColumn =
        uploadType == "Student" ? studentColumns : teacherColumns;
      if (jsonData.length > 0) {
        const ob: any = jsonData[0];
        const colExist = checkingColumn.every((col) => col in ob);
        if (colExist) {
          const data = jsonData.map((ob: any) => {
            const hasMissing = Object.values(ob).some(
              (val) => val === undefined || val === null || val === "",
            );

            return {
              ...ob,
              Missing: hasMissing, // true if any value is missing
              'Server Response': "",
            };
          });
          setUploadData(data);
        } else {
          alert("Column Mismatch !");
          setUploadType("");
        }
      } else {
        alert("Empty File Uploaded !");
        setUploadType("");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const upload = async ()=>{
    for(let ob of uploadData){
      if(!ob.Missing){
        console.log("Upload : " , ob);
      }
    }
  }

  return (
    <div className="bulk-overlay">
      <div className="bulk-modal">
        {/* HEADER */}
        <div className="bulk-header">
          <h2 className="m-0">Bulk Entry</h2>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="bulk-body">
          {/* DOWNLOAD SECTION */}
          <h6 className="section-title">Download Template</h6>

          <div className="button-row">
            <a
              href="/StudentTemp.xlsx"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary flex-btn"
            >
              ⬇ Student Template
            </a>

            <a
              href="/TeacherTemp.xlsx"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary flex-btn"
            >
              ⬇ Teacher Template
            </a>
          </div>
          <br />
          <hr className="my-4" />
          <br />
          {/* UPLOAD SECTION */}
          <h6 className="section-title mt-3">Upload Sheet</h6>

          <div className="button-row">
            <button
              className="btn btn-primary flex-btn"
              onClick={() => openFileDialog("Student")}
            >
              ⬆ Upload Students
            </button>

            <button
              className="btn btn-primary flex-btn"
              onClick={() => openFileDialog("Teacher")}
            >
              ⬆ Upload Teachers
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
          <br />
          <hr />
          {uploadData.length > 0 ? (
            <>
              <br />
              <h2>Upload {uploadType} Records</h2>
              <button className="btn btn-primary" onClick={upload}>Save Records</button>
              <div className="table-responsive mt-3">
                <table className="table table-border">
                  <thead>
                    <tr>
                      {Object.keys(uploadData[0]).map((k) => (
                        <th>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadData.map((ob: any) => (
                      <tr style={{border:ob.Missing?'solid red 0.5px':""}}>
                        {Object.values(ob).map((v: any) => (
                          <td>
                            {typeof(v)=='boolean'? v?"Missing Values": "Good" : v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <br />
              <h5 className="text-center">No Upload Data Till Now.</h5>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkEntry;
