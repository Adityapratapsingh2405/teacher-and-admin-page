import { useEffect, useState } from "react";
import resultService, { StudentResultsDTO } from "../../services/resultService";
import MarksheetTable from "../../components/MarksheetTable";
import ResultPDFGenerator from "../../utils/resultPDFGenerator";
import SubjectService from "../../services/subjectService";
import AdminService, { ClassInfoResponse, NonTeachingStaffResponse, StudentResponse, TeacherResponse } from "../../services/adminService";
import { useSelector } from "react-redux";

const SectionHeader: React.FC<{ icon: string; title: string; }> = ({ icon, title }) => (
    <h2><span className="section-icon">{icon}</span>{title}</h2>
);
interface SubjectSetting {
    classId: number;
    sessionId: number;
    subjectName: string;
    mainResult: boolean;
    gradeSheet: boolean;
}
const StudentResult: React.FC = () => {
    const [studentResults, setStudentResults] = useState<StudentResultsDTO | null>(null);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [resultsError, setResultsError] = useState<string | null>(null);
    const [showMarksheetView, setShowMarksheetView] = useState(false);
    const [student, setStudent] = useState<any>(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectSetting[]>([]);
    const [points, setPoints] = useState<string[]>([]);
    const [school, setSchool] = useState<any>({});

    const { students, classes , 
            teachers,nonTeachingStaff,load_done } = useSelector(
        (store: any): { students: StudentResponse[]; 
                        classes: ClassInfoResponse[];
                        teachers:TeacherResponse[];
                        nonTeachingStaff : NonTeachingStaffResponse[],
                        load_done : boolean   } =>
          store.data.value
      );

    useEffect(() => {
        fetchSchool();
    }, []);
    const fetchSchool = async () => {
        const id = localStorage.getItem("schoolId");
        const res = await AdminService.school(id);
        setSchool(res);
    };

    const fetchSelectSubjects = async () => {
        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) throw new Error('School ID is missing.');

        const schoolSettingsResponse = await SubjectService.listSelectedSubjects();
        const classSelectedData = schoolSettingsResponse.filter((ob: any) => ob.classId == student.classId);
        setSelectedSubjects(classSelectedData);

        let noteResponse = await SubjectService.getNotes();
        console.log("noteResponse : ", noteResponse)
        console.log(student)
        if (noteResponse != 'no')
            setPoints(noteResponse[student.classId]);
    }

    useEffect(() => {
        if (student)
            fetchSelectSubjects()
    }, [student]);

    const filteredStudents = students.filter((record) =>
        record.panNumber.toLowerCase().includes(studentSearch.trim().toLowerCase())
    );

    const handleStudentSelect = async (selectedStudent: StudentResponse) => {
        setStudent({...selectedStudent , 
            father : selectedStudent.parentName,
            mother : selectedStudent.motherName,
            dob : selectedStudent.dateOfBirth,
            session : selectedStudent.sessionId,
            classTeacherName: classes.find(classInfo => classInfo.id === selectedStudent.classId)?.classTeacherName
        });
        setStudentResults(null);
        setResultsError(null);
        setResultsLoading(true);
        setShowMarksheetView(false);

        try {
            const results = await resultService.getStudentAllResults(selectedStudent.panNumber);
            setStudentResults(results);
        } catch (err: any) {
            setResultsError(err.message || 'Failed to load results. Please try again.');
        } finally {
            setResultsLoading(false);
        }
    };


    return <section className="results-section">

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <aside style={{ flex: '0 0 280px', maxWidth: '100%', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                <label htmlFor="student-pan-search" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1f2937' }}>
                    Find student by PAN
                </label>
                <input
                    id="student-pan-search"
                    type="search"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Enter PAN number"
                    style={{ boxSizing: 'border-box', width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                <div style={{ marginTop: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
                    {!load_done ? (
                        <p style={{ color: '#6b7280' }}>Loading students...</p>
                    ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((record) => (
                            <button
                                key={record.panNumber}
                                type="button"
                                onClick={() => handleStudentSelect(record)}
                                aria-pressed={student?.panNumber === record.panNumber}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    marginTop: '0.35rem',
                                    textAlign: 'left',
                                    border: student?.panNumber === record.panNumber ? '1px solid #2563eb' : '1px solid transparent',
                                    borderRadius: '6px',
                                    background: student?.panNumber === record.panNumber ? '#eff6ff' : '#f9fafb',
                                    color: '#1f2937',
                                    cursor: 'pointer'
                                }}
                            >
                                <strong style={{ display: 'block' }}>{record.name}</strong>
                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{record.panNumber}</span>
                            </button>
                        ))
                    ) : (
                        <p style={{ color: '#6b7280' }}>{studentSearch.trim() ? 'No students match that PAN number.' : 'No students available.'}</p>
                    )}
                </div>
            </aside>

            <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                {!student && !resultsLoading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                        Search for a PAN number and select a student to view their academic results.
                    </div>
                )}


                {/* Loading State */}
                {resultsLoading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        <p>Loading results...</p>
                    </div>
                )}

                {/* Error State */}
                {resultsError && !resultsLoading && (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fee', borderRadius: '12px', border: '1px solid #fcc' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <p style={{ color: '#dc3545', marginBottom: '1.5rem' }}>{resultsError}</p>
                        <button
                            className="download-btn"
                            onClick={() => student && handleStudentSelect(student)}
                            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Results Display */}
                {studentResults && !resultsLoading && (
                    <div>
                        {/* Student Info Summary */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{studentResults.studentName}</h3>
                                    <p style={{ margin: '0', opacity: 0.9 }}>Current Class: {studentResults.className}</p>
                                </div>
                                <button
                                    onClick={() => setShowMarksheetView(!showMarksheetView)}
                                    style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '2px solid white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667eea'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = 'white'; }}
                                >
                                    {showMarksheetView ? 'Show Exam View' : 'Show Marksheet Table'}
                                </button>
                            </div>
                        </div>

                        {showMarksheetView ? (
                            <MarksheetTable
                                studentResults={studentResults}
                                onDownload={() => ResultPDFGenerator.generateMarksheetPDF(student, selectedSubjects, points, studentResults, school, 'School Learning Management System')}
                            />
                        ) : (
                            <>
                                {studentResults.examResults && studentResults.examResults.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {studentResults.examResults.map((examResult, index) => (
                                            <div key={index} className="result-card" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #f3f4f6' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 0.25rem 0', color: '#1f2937' }}>{examResult.examName}</h3>
                                                        {examResult.examDate && <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{new Date(examResult.examDate).toLocaleDateString()}</p>}
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '2rem', fontWeight: '700', color: examResult.percentage >= 90 ? '#10b981' : examResult.percentage >= 75 ? '#3b82f6' : examResult.percentage >= 60 ? '#f59e0b' : '#ef4444' }}>{examResult.percentage.toFixed(1)}%</div>
                                                        <div style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', backgroundColor: examResult.overallGrade === 'A+' || examResult.overallGrade === 'A' ? '#d1fae5' : examResult.overallGrade === 'B+' || examResult.overallGrade === 'B' ? '#dbeafe' : examResult.overallGrade === 'C' ? '#fef3c7' : '#fee2e2', color: examResult.overallGrade === 'A+' || examResult.overallGrade === 'A' ? '#065f46' : examResult.overallGrade === 'B+' || examResult.overallGrade === 'B' ? '#1e40af' : examResult.overallGrade === 'C' ? '#92400e' : '#991b1b', fontSize: '0.9rem', fontWeight: '600', marginTop: '0.5rem' }}>Grade: {examResult.overallGrade}</div>
                                                    </div>
                                                </div>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="results-table" style={{ borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                                                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Subject</th>
                                                                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Marks Obtained</th>
                                                                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Total Marks</th>
                                                                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Percentage</th>
                                                                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e5e7eb' }}>Grade</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {examResult.subjectScores?.map((subjectScore, subIndex) => (
                                                                <tr key={subIndex} style={{ backgroundColor: subIndex % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                                                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{subjectScore.subjectName}</td>
                                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{subjectScore.marks ?? '-'}</td>
                                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{subjectScore.maxMarks}</td>
                                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{subjectScore.marks != null ? `${((subjectScore.marks / subjectScore.maxMarks) * 100).toFixed(1)}%` : '-'}</td>
                                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                                        {subjectScore.marks != null ? (
                                                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: subjectScore.grade === 'A+' || subjectScore.grade === 'A' ? '#d1fae5' : subjectScore.grade === 'B+' || subjectScore.grade === 'B' ? '#dbeafe' : subjectScore.grade === 'C' ? '#fef3c7' : '#fee2e2', color: subjectScore.grade === 'A+' || subjectScore.grade === 'A' ? '#065f46' : subjectScore.grade === 'B+' || subjectScore.grade === 'B' ? '#1e40af' : subjectScore.grade === 'C' ? '#92400e' : '#991b1b', fontWeight: '600', fontSize: '0.85rem' }}>{subjectScore.grade}</span>
                                                                        ) : (
                                                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: '#f3f4f6', color: '#6b7280', fontWeight: '500', fontSize: '0.85rem' }}>Not Added</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                                    <div><div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Total Obtained</div><div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>{examResult.obtainedMarks}</div></div>
                                                    <div><div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Total Marks</div><div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>{examResult.totalMarks}</div></div>
                                                    <div><div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Percentage</div><div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>{examResult.percentage.toFixed(2)}%</div></div>
                                                </div>
                                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                                    <button className="download-btn" onClick={async () => {
                                                        try {
                                                            await ResultPDFGenerator.generateExamResultPDF(student, selectedSubjects, points, studentResults, examResult, student?.schoolName || 'School Learning Management System', school);
                                                        } catch (error) {
                                                            console.error('Error generating PDF:', error);
                                                            alert('Failed to generate PDF. Please try again.');
                                                        }
                                                    }} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                                                        Download PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ border: '2px solid #3b82f6', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#eff6ff' }}>
                                            <h4 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>Overall Performance Summary</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                <div><div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Exams</div><div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{studentResults.examResults.length}</div></div>
                                                <div><div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Average Percentage</div><div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{(studentResults.examResults.reduce((sum, exam) => sum + exam.percentage, 0) / studentResults.examResults.length).toFixed(2)}%</div></div>
                                                <div><div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Best Performance</div><div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{Math.max(...studentResults.examResults.map((exam) => exam.percentage)).toFixed(1)}%</div></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                        <p style={{ color: '#6b7280', margin: 0 }}>No exam results available yet. Results will appear here once published by your teachers.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    </section>
}


export default StudentResult;