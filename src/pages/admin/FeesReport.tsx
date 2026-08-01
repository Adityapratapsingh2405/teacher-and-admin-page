import React, { useEffect, useRef, useState } from "react";
import "./BulkEntry.css";
import "./FeesReport.css";
import html2pdf from "html2pdf.js";
import AdminService, { StudentResponse } from "../../services/adminService";
import { FeeCatalog } from "../../types";

interface FeesReportProps {
    onClose: () => void;
    student: StudentResponse | null;
    fees : any | null;
}

const FeesReport: React.FC<FeesReportProps> = ({
    onClose,
    student, fees
}) => {

    const reportRef = useRef<HTMLDivElement>(null);
    const [school, setSchool] = useState<any>({});

    useEffect(() => {
        fetchSchool();
    }, []);

    const fetchSchool = async () => {
        const id = localStorage.getItem("schoolId");
        const res = await AdminService.school(id);
        setSchool(res);
    };
    console.log(student);
    const totalFees =
        Number(student?.transportFees || 0)*12 +
        Number(student?.tuitionFees || 0)*12 +
        Number(student?.computerFees|| 0)*12 +
        Number(student?.examAmount || 0) +
        Number(student?.otherFees || 0)*12;

    const paidAmount = fees.reduce((sum:number, item:any) => 
            item.receiptNumber ? sum + Number(item.amount || 0) : sum,0);

    const remaining = totalFees - paidAmount;

    const handleDownload = () => {
        if (!reportRef.current) return;

        html2pdf()
            .set({
                margin: 10,
                filename: `${student?.name}-FeesReport.pdf`,
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
            .from(reportRef.current)
            .save();
    };

    return (
        <div className="bulk-overlay">
            <div className="bulk-modal" style={{ maxWidth: "900px" }}>
                <div className="bulk-header">
                    <h2>Fees Report</h2>

                    <button
                        className="btn-sm btn-primary"
                        onClick={handleDownload}
                    >
                        Download PDF
                    </button>

                    <button
                        className="btn-sm btn-danger"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="bulk-body">

                    <div ref={reportRef} className="fees-report">

                        {/* Header */}

                        <div className="report-header">

                            <img
                                src={school?.schoolLogo}
                                alt=""
                                className="school-logo"
                                crossOrigin="anonymous"
                            />

                            <div>
                                <h2>{school?.schoolName}</h2>
                                <p>{school?.schoolAddress}</p>
                                <h3>Student Fees Report</h3>
                            </div>

                        </div>

                        <hr />

                        {/* Student */}

                        <table className="student-table">

                            <tbody>

                                <tr>
                                    <td><b>Name</b></td>
                                    <td>{student?.name}</td>

                                    <td><b>Admission No.</b></td>
                                    <td>{student?.panNumber}</td>
                                </tr>

                                <tr>
                                    <td><b>Class</b></td>
                                    <td>{student?.className}</td>

                                    <td><b>Session</b></td>
                                    <td>{student?.sessionName}</td>
                                </tr>

                                <tr>
                                    <td><b>Father</b></td>
                                    <td>{student?.parentName}</td>

                                    <td><b>Phone</b></td>
                                    <td>{student?.mobileNumber}</td>
                                </tr>

                            </tbody>

                        </table>

                        <br />

                        {/* Fee Structure */}

                        <h3>Fee Structure</h3>

                        <table className="fees-table">

                            <thead>
                                <tr>
                                    <th>Particular</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>

                            <tbody>

                                <tr>
                                    <td>Transport Fee</td>
                                    <td>₹ {(student?.transportFees || 0)*12}</td>
                                </tr>

                                <tr>
                                    <td>Tuition Fee</td>
                                    <td>₹ {(student?.tuitionFees || 0)*12}</td>
                                </tr>

                                <tr>
                                    <td>Computer Fee</td>
                                    <td>₹ {(student?.computerFees || 0)*12}</td>
                                </tr>

                                <tr>
                                    <td>Exam Fee</td>
                                    <td>₹ {student?.examAmount || 0}</td>
                                </tr>

                                <tr>
                                    <td>Other Fee</td>
                                    <td>₹ {(student?.otherFees || 0)*12}</td>
                                </tr>

                                <tr className="total-row">
                                    <td><b>Total Fees</b></td>
                                    <td><b>₹ {totalFees}</b></td>
                                </tr>

                            </tbody>

                        </table>

                        <br />

                        {/* Payment */}

                        <h3>Payment Details</h3>

                        <table className="fees-table">

                            <thead>

                                <tr>
                                    <th>Month</th>
                                    <th>Amount Paid</th>
                                </tr>

                            </thead>

                            <tbody>

                                {fees.filter((item:any)=>item.receiptNumber)
                                .map((item:any, index:number) => (

                                    <tr key={index}>
                                        <td>{item.month}</td>
                                        <td>₹ {item.amount}</td>
                                    </tr>

                                ))}

                                <tr className="paid-row">
                                    <td><b>Total Paid</b></td>
                                    <td><b>₹ {paidAmount}</b></td>
                                </tr>

                                <tr className="remaining-row">
                                    <td><b>Remaining Amount</b></td>
                                    <td><b>₹ {remaining}</b></td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeesReport;