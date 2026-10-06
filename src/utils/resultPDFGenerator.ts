import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentResultsDTO, ExamResult } from '../services/resultService';

interface CertificateSettings {
  subjects: Array<string | {
    subjectName: string;
    mainResult?: boolean;
    gradeSheet?: boolean;
  }>;
  points: string[] | Record<string, string[]>;
}

class SignatureFooter {
  static addToPDF(doc: jsPDF, pageWidth: number, startY: number): number {
    const leftMargin = 25;
    const rightMargin = 25;
    const totalWidth = pageWidth - leftMargin - rightMargin;
    const itemWidth = totalWidth / 3;
    const lineLength = itemWidth - 18;

    const labels = ['Class Teacher', 'Principal', 'Parent'];

    labels.forEach((label, index) => {
      const x = leftMargin + (index * itemWidth) + 10;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.35);
      doc.line(x, startY, x + lineLength, startY);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(label, x + (lineLength / 2), startY + 8, { align: 'center' });
    });

    return startY + 16;
  }
}

export class ResultPDFGenerator {
  /**
   * Generate PDF for a single exam result
   */
  static async generateExamResultPDF(
     student:any,
    selectedSubjects: Array<{ subjectName: string; mainResult?: boolean; gradeSheet?: boolean }>,
    points : string[],
    studentResults: StudentResultsDTO,
    examResult: ExamResult,
    schoolName: string = 'School Learning Management System',
    school?: any
  ): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoDataUrl = await this.loadImageDataUrl(school?.schoolLogo || student?.schoolLogo);
    let yPos = 10;

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', 8, 10, 20, 20);
      } catch (error) {
        console.warn('School logo could not be added to PDF:', error);
      }
    }

    doc.setFillColor(31, 76, 83);
    doc.rect(8, 8, pageWidth - 16, 2, 'F');
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 76, 83);
    doc.text(schoolName, pageWidth / 2, 19, { align: 'center' });
    yPos = 27;

    doc.setFontSize(12);
    doc.setTextColor(39, 54, 59);
    doc.text(examResult.examName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 104, 111);
    doc.text('ACADEMIC RESULT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    doc.setDrawColor(207, 218, 221);
    doc.setLineWidth(0.4);
    doc.line(8, yPos, pageWidth - 8, yPos);
    yPos += 4;

    const detailsX = 8;
    const detailsWidth = pageWidth - 16;
    doc.setFontSize(8);
    const addressLines = doc.splitTextToSize(String(student?.address || '-'), detailsWidth - 35) as string[];
    const detailsHeight = 36 + addressLines.length * 4;
    const detailsColumnWidth = detailsWidth / 3;
    doc.setFillColor(239, 245, 246);
    doc.roundedRect(detailsX, yPos, detailsWidth, detailsHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(207, 218, 221);
    doc.roundedRect(detailsX, yPos, detailsWidth, detailsHeight, 1.5, 1.5, 'S');

    const studentDetails = [
      ['STUDENT', studentResults.studentName],
      ['CLASS', studentResults.className.split('-').map(part => part.trim()).join(' - ')],
      ['PEN NUMBER', studentResults.studentPanNumber]
    ];
    studentDetails.forEach(([label, value], index) => {
      const columnX = detailsX + index * detailsColumnWidth;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(43, 104, 111);
      doc.text(label, columnX + 4, yPos + 5);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(39, 54, 59);
      doc.text(value, columnX + 4, yPos + 11, { maxWidth: detailsColumnWidth - 8 });
    });
    const familyDetails = [
      ['FATHER', student?.father || '-'],
      ['MOTHER', student?.mother || '-'],
      ['DATE OF BIRTH', student?.dob || '-']
    ];
    familyDetails.forEach(([label, value], index) => {
      const columnX = detailsX + index * detailsColumnWidth;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(43, 104, 111);
      doc.text(label, columnX + 4, yPos + 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(39, 54, 59);
      doc.text(String(value), columnX + 4, yPos + 27, { maxWidth: detailsColumnWidth - 8 });
    });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 104, 111);
    doc.text('ADDRESS', detailsX + 4, yPos + 35);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(39, 54, 59);
    doc.text(addressLines, detailsX + 28, yPos + 35);
    yPos += detailsHeight + 5;

    const selectedSubjectNames = new Map(selectedSubjects.map(subject => [subject.subjectName, subject]));
    const mainResultSubjects = examResult.subjectScores.filter(subject =>
      selectedSubjectNames.get(subject.subjectName)?.mainResult === true
    );
    const gradeSheetSubjects = examResult.subjectScores.filter(subject =>
      selectedSubjectNames.get(subject.subjectName)?.gradeSheet === true
    );
    const totalObtained = mainResultSubjects.reduce((total, subject) => total + (subject.marks ?? 0), 0);
    const totalMaximum = mainResultSubjects.reduce((total, subject) => total + subject.maxMarks, 0);
    const percentage = totalMaximum > 0 ? (totalObtained / totalMaximum) * 100 : 0;
    const overallGrade = this.calculateOverallGrade(percentage);
    const gradeFromPercentage = (value: number): string => this.calculateOverallGrade(value);

    // Subject-wise marks table
    const tableData = mainResultSubjects.map((subject) => [
      subject.subjectName,
      subject.marks !== null && subject.marks !== undefined ? subject.marks.toString() : 'Not Added',
      subject.maxMarks.toString(),
      subject.marks !== null && subject.marks !== undefined 
        ? `${(subject.maxMarks > 0 ? (subject.marks / subject.maxMarks) * 100 : 0).toFixed(2)}%`
        : '-',
      subject.grade
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Subject', 'Marks Obtained', 'Maximum Marks', 'Percentage', 'Grade']],
      body: tableData as any,
      theme: 'grid',
      tableWidth: pageWidth - 16,
      headStyles: {
        fillColor: [31, 76, 83],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5,
        halign: 'center',
        valign: 'middle',
        textColor: [39, 54, 59]
      },
      alternateRowStyles: { fillColor: [247, 250, 250] },
      columnStyles: {
        0: { halign: 'left', cellWidth: (pageWidth - 16) * 0.35 },
        1: { cellWidth: (pageWidth - 16) * 0.17 },
        2: { cellWidth: (pageWidth - 16) * 0.2 },
        3: { cellWidth: (pageWidth - 16) * 0.15 },
        4: { cellWidth: (pageWidth - 16) * 0.13 }
      },
      margin: { left: 8, right: 8, top: 5, bottom: 5 },
      foot: [[
        'Total',
        totalObtained.toString(),
        totalMaximum.toString(),
        `${percentage.toFixed(2)}%`,
        overallGrade
      ]],
      footStyles: {
        fillColor: [216, 235, 222],
        textColor: [31, 59, 64],
        fontStyle: 'bold',
        halign: 'center'
      },
      didParseCell: data => {
        if (data.section === 'body' && data.column.index === 0) {
          data.cell.styles.fillColor = data.row.index % 2 === 0 ? [239, 245, 246] : [232, 241, 242];
          data.cell.styles.textColor = [31, 69, 74];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 4;

    const gradeSheetData = gradeSheetSubjects.map(subject => [
      subject.subjectName,
      subject.maxMarks > 0 ? gradeFromPercentage((subject.marks / subject.maxMarks) * 100) : '-'
    ]);
    const gradeSheetPercentage = gradeSheetSubjects.reduce((total, subject) => total + subject.marks, 0) /
      (gradeSheetSubjects.reduce((total, subject) => total + subject.maxMarks, 0) || 1) * 100;

    autoTable(doc, {
      startY: yPos,
      head: [['GRADE SHEET SUBJECTS', 'Grade']],
      body: gradeSheetData,
      foot: [['CLASS GRADE', gradeSheetSubjects.length ? gradeFromPercentage(gradeSheetPercentage) : '-']],
      tableWidth: pageWidth - 16,
      theme: 'grid',
      headStyles: {
        fillColor: [31, 76, 83],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        halign: 'center',
        valign: 'middle',
        textColor: [39, 54, 59],
        lineColor: [207, 218, 221],
        lineWidth: 0.15
      },
      alternateRowStyles: { fillColor: [247, 250, 250] },
      columnStyles: {
        0: { halign: 'left', cellWidth: (pageWidth - 16) * 0.8 },
        1: { cellWidth: (pageWidth - 16) * 0.2 }
      },
      margin: { left: 8, right: 8, top: 5, bottom: 5 },
      footStyles: {
        fillColor: [216, 235, 222],
        textColor: [31, 59, 64],
        fontStyle: 'bold',
        halign: 'center'
      },
      didParseCell: data => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.fillColor = [237, 246, 240];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [31, 76, 83];
        }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 4;

    // Overall Result Summary Box
    const boxHeight = 34;
    const signatureGap = 4;
    const signatureBlockHeight = 26;
    const bottomMargin = 6;
    const summaryAndFooterHeight = boxHeight + signatureGap + signatureBlockHeight + bottomMargin;
    if (yPos > pageHeight - summaryAndFooterHeight) {
      doc.addPage();
      yPos = 20;
    }

    // Draw summary box
    const boxX = 8;
    const boxY = yPos;
    const boxWidth = pageWidth - 16;
    doc.setFillColor(247, 250, 250);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

    // Teal title band and border
    doc.setFillColor(31, 76, 83);
    doc.rect(boxX, boxY, boxWidth, 8, 'F');
    doc.setDrawColor(207, 218, 221);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('RESULT SUMMARY', boxX + 5, boxY + 5.5);

    const columnCenters = [boxX + boxWidth / 6, pageWidth / 2, boxX + (boxWidth * 5) / 6];
    const metricLabels = ['MARKS', 'PERCENTAGE', 'GRADE'];
    const metricValues = [
      `${totalObtained} / ${totalMaximum}`,
      `${percentage.toFixed(2)}%`,
      overallGrade
    ];

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 112, 115);
    metricLabels.forEach((label, index) => {
      doc.text(label, columnCenters[index], boxY + 14, { align: 'center' });
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 76, 83);
    metricValues.forEach((value, index) => {
      doc.text(value, columnCenters[index], boxY + 22, { align: 'center' });
    });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 112, 115);
    doc.text(this.getGradeInterpretation(overallGrade), pageWidth / 2, boxY + 29, { align: 'center' });

    // Footer with signature section, positioned after the result summary.
    let signatureStartY = boxY + boxHeight + signatureGap;
    if (signatureStartY + signatureBlockHeight > pageHeight - bottomMargin) {
      doc.addPage();
      signatureStartY = 30;
    }
    const signatureEndY = SignatureFooter.addToPDF(doc, pageWidth, signatureStartY);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, signatureEndY + 6, { align: 'center' });
    doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, signatureEndY + 10, { align: 'center' });

    doc.addPage();
    yPos = 20;
    yPos = this.addPersonalDevelopmentTable(doc, yPos);
    yPos = this.addPhysicalDevelopmentTable(doc, yPos);
    if (points.length) {
      const textWidth = pageWidth - 24;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 76, 83);
      doc.text('Important Notes', 12, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(39, 54, 59);

      points.forEach((point, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${point}`, textWidth) as string[];
        const noteHeight = lines.length * 3 + 0.5;
        if (yPos + noteHeight > pageHeight - 12) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(lines, 12, yPos);
        yPos += noteHeight;
      });
    }

    // Save PDF
    const fileName = `${studentResults.studentName.replace(/\s+/g, '_')}_${examResult.examName.replace(/\s+/g, '_')}_Result.pdf`;
    doc.save(fileName);
  }

  /**
   * Generate comprehensive PDF for all exam results
   */
  static generateCompleteResultPDF(
    studentResults: StudentResultsDTO,
    schoolName: string = 'School Learning Management System'
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header - School Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Complete Academic Report
    doc.setFontSize(14);
    doc.text('Complete Academic Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Student Information Section
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 15, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${studentResults.studentName}`, 15, yPos);
    yPos += 5;
    doc.text(`Class: ${studentResults.className}`, 15, yPos);
    yPos += 5;
    doc.text(`PEN Number: ${studentResults.studentPanNumber}`, 15, yPos);
    yPos += 10;

    // Exam-wise results
    for (let i = 0; i < studentResults.examResults.length; i++) {
      const examResult = studentResults.examResults[i];

      // Check if we need a new page
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }

      // Exam header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(102, 126, 234);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
      doc.text(`${i + 1}. ${examResult.examName}`, 17, yPos + 1);
      yPos += 10;

      doc.setTextColor(0, 0, 0);

      // Subject table for this exam
      const tableData = examResult.subjectScores.map((subject) => [
        subject.subjectName,
        subject.marks !== null && subject.marks !== undefined ? subject.marks.toString() : 'Not Added',
        subject.maxMarks.toString(),
        subject.marks !== null && subject.marks !== undefined 
          ? `${((subject.marks / subject.maxMarks) * 100).toFixed(1)}%` 
          : '-',
        subject.grade
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Subject', 'Marks', 'Max Marks', '%', 'Grade']],
        body: tableData as any,
        theme: 'striped',
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 20 }
        },
        margin: { left: 15, right: 15 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Overall performance for this exam
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Overall: ${examResult.obtainedMarks}/${examResult.totalMarks} | ` +
               `${examResult.percentage.toFixed(2)}% | Grade: ${examResult.overallGrade}`, 
               15, yPos);
      yPos += 10;
    }

    // Overall Summary Section
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    doc.setLineWidth(0.8);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Calculate overall statistics
    const totalExams = studentResults.examResults.length;
    const avgPercentage = studentResults.examResults.reduce((sum, exam) => sum + exam.percentage, 0) / totalExams;
    const highestPercentage = Math.max(...studentResults.examResults.map(e => e.percentage));
    const lowestPercentage = Math.min(...studentResults.examResults.map(e => e.percentage));

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Exams Completed: ${totalExams}`, 15, yPos);
    yPos += 6;
    doc.text(`Average Percentage: ${avgPercentage.toFixed(2)}%`, 15, yPos);
    yPos += 6;
    doc.text(`Highest Percentage: ${highestPercentage.toFixed(2)}%`, 15, yPos);
    yPos += 6;
    doc.text(`Lowest Percentage: ${lowestPercentage.toFixed(2)}%`, 15, yPos);
    yPos += 6;
    doc.text(`Overall Grade: ${this.calculateOverallGrade(avgPercentage)}`, 15, yPos);

    // Footer with signature section
    const signatureStartY = pageHeight - 62;
    const signatureEndY = SignatureFooter.addToPDF(doc, pageWidth, signatureStartY);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, signatureEndY + 6, { align: 'center' });
    doc.text('This is a computer-generated document.', pageWidth / 2, signatureEndY + 10, { align: 'center' });

    // Save PDF
    const fileName = `${studentResults.studentName.replace(/\s+/g, '_')}_Complete_Academic_Report.pdf`;
    doc.save(fileName);
  }

  /**
   * Get grade interpretation text
   */
  private static getGradeInterpretation(grade: string): string {
    const interpretations: { [key: string]: string } = {
      'A+': 'Outstanding Performance!',
      'A': 'Excellent Work!',
      'B+': 'Very Good!',
      'B': 'Good Performance',
      'C': 'Satisfactory',
      'D': 'Needs Improvement',
      'F': 'Further Effort Required'
    };
    return interpretations[grade] || 'Keep Working Hard!';
  }

  /**
   * Calculate overall grade based on average percentage
   */
  private static calculateOverallGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  /**
   * Load a school logo as a data URL so it can be embedded into the PDF.
   */
  private static addPersonalDevelopmentTable(doc: jsPDF, startY: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - 24;
    const criteria = [
      ['Personal Neatness', 'A'],
      ['Punctuality', 'A+'],
      ['Interaction with Children', 'A'],
      ['Interaction with Teacher', 'A+'],
      ['Shares with Friends', 'A'],
      ['Discipline', 'A+'],
      ['Participation in Class Activity', 'A']
    ];

    autoTable(doc, {
      startY,
      head: [['PERSONAL DEVELOPMENT', 'GRADE']],
      body: criteria,
      tableWidth,
      margin: { left: 12, right: 12 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [39, 54, 59],
        lineColor: [207, 218, 221],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [31, 76, 83],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { minCellHeight: 8 },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.78 },
        1: { cellWidth: tableWidth * 0.22, halign: 'center' }
      }
    });

    return (doc as any).lastAutoTable.finalY + 8;
  }

  private static addPhysicalDevelopmentTable(doc: jsPDF, startY: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - 24;

    autoTable(doc, {
      startY,
      head: [[{ content: 'PHYSICAL DEVELOPMENT', colSpan: 4 }]],
      body: [['Height (cm)', '', 'Weight (kg)', '']],
      tableWidth,
      margin: { left: 12, right: 12 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        minCellHeight: 10,
        textColor: [39, 54, 59],
        lineColor: [207, 218, 221],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [31, 76, 83],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.22, fontStyle: 'bold' },
        1: { cellWidth: tableWidth * 0.28 },
        2: { cellWidth: tableWidth * 0.22, fontStyle: 'bold' },
        3: { cellWidth: tableWidth * 0.28 }
      }
    });

    return (doc as any).lastAutoTable.finalY + 8;
  }

  /**
   * Load a school logo as a data URL so it can be embedded into the PDF.
   */
  private static async loadImageDataUrl(imageUrl?: string): Promise<string | null> {
    if (!imageUrl) return null;

    try {
      if (imageUrl.startsWith('data:')) return imageUrl;

      const response = await fetch(imageUrl);
      if (!response.ok) return null;

      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Unable to load school logo for PDF:', error);
      return null;
    }
  }
  /**
   * Generate comprehensive marksheet PDF with subjects as rows and exams as columns
   */
  static async generateMarksheetPDF(
    student:any,
    selectedSubjects: Array<{ subjectName: string; mainResult?: boolean; gradeSheet?: boolean }>,
    points : string[],
    studentResults: StudentResultsDTO,
    school:any,
    schoolName: string = 'School Learning Management System'
  ): Promise<void> 
  {
    //console.log("points : " , points);
  //console.log("student : " , student)
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    const resolvedSchoolName = school?.schoolName || schoolName;
    const resolvedSchoolAddress = school?.schoolAddress || '';
    const logoDataUrl = await this.loadImageDataUrl(school?.schoolLogo);

    // Transform exam-centric data to subject-centric data
    const subjectMap = new Map<string, {
      subjectName: string;
      examMarks: { [examName: string]: { marks: number; maxMarks: number } };
      totalObtained: number;
      totalMax: number;
      percentage: number;
    }>();

    const exams = studentResults.examResults || [];

    // Build subject-wise data
    exams.forEach((exam) => {
      exam.subjectScores?.forEach((score) => {
        if (!subjectMap.has(score.subjectName)) {
          subjectMap.set(score.subjectName, {
            subjectName: score.subjectName,
            examMarks: {},
            totalObtained: 0,
            totalMax: 0,
            percentage: 0
          });
        }

        const subject = subjectMap.get(score.subjectName)!;
        subject.examMarks[exam.examName] = {
          marks: score.marks,
          maxMarks: score.maxMarks
        };
        subject.totalObtained += score.marks || 0;
        subject.totalMax += score.maxMarks || 0;
      });
    });

    // Calculate percentages
    subjectMap.forEach((subject) => {
      if (subject.totalMax > 0) {
        subject.percentage = (subject.totalObtained / subject.totalMax) * 100;
      }
    });

    const allSubjects = Array.from(subjectMap.values());
    const mainResultSubjects = allSubjects.filter(subject => {
      const selection = selectedSubjects.find(item => item.subjectName === subject.subjectName);
      return selection?.mainResult === true;
    });
    const gradeSheetSubjects = allSubjects.filter(subject => {
      const selection = selectedSubjects.find(item => item.subjectName === subject.subjectName);
      return selection?.gradeSheet === true;
    });
    const examNames = exams.map(e => e.examName);
    const gradeFromPercentage = (percentage: number): string => {
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C';
      if (percentage >= 40) return 'D';
      return 'F';
    };

    // Header - School Name and details
    const schoolHeaderY = yPos;
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', 18, schoolHeaderY - 8, 22, 22);
      } catch (error) {
        console.warn('School logo could not be added to PDF:', error);
      }
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(resolvedSchoolName, pageWidth / 2, schoolHeaderY, { align: 'center' });

    if (resolvedSchoolAddress) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(resolvedSchoolAddress, pageWidth / 2, schoolHeaderY + 7, { align: 'center' });
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    //doc.text(`AFFILIATION NO. ${resolvedAffiliationNo}`, pageWidth / 2, schoolHeaderY + (resolvedSchoolAddress ? 14 : 7), { align: 'center' });
    yPos += 18;

    // Marksheet Title
    doc.setFontSize(14);
    doc.text('COMPREHENSIVE MARKSHEET', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 4;

    // Student Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const studentInfoLeft = 15;
    const studentInfoMiddle = pageWidth / 3 + 10;
    const studentInfoRight = (pageWidth * 2) / 3 + 10;

    // Name
    doc.text('Student Name:', studentInfoLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentResults.studentName, studentInfoLeft + 35, yPos);

    // Class
    doc.setFont('helvetica', 'bold');
    doc.text('Class:', studentInfoMiddle, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentResults.className, studentInfoMiddle + 15, yPos);

    // PEN
    doc.setFont('helvetica', 'bold');
    doc.text('PEN:', studentInfoRight, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentResults.studentPanNumber, studentInfoRight + 15, yPos);
    yPos += 6;

    const studentFamilyDetails = [
      ['Father:', student?.father || '-'],
      ['Mother:', student?.mother || '-'],
      ['DOB:', student?.dob || '-']
    ];
    studentFamilyDetails.forEach(([label, value], index) => {
      const columnX = [studentInfoLeft, studentInfoMiddle, studentInfoRight][index];
      doc.setFont('helvetica', 'bold');
      doc.text(label, columnX, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), columnX + 18, yPos, { maxWidth: pageWidth / 3 - 40 });
    });
    yPos += 6;

    const addressLines = doc.splitTextToSize(String(student?.address || '-'), pageWidth - 50) as string[];
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', studentInfoLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(addressLines, studentInfoLeft + 18, yPos);
    yPos += Math.max(6, addressLines.length * 4);

    // Another separator
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 4;

    // Match the screen table: exam and total headers span two columns, while
    // Subject and percentage span both header rows.
    const firstHeaderRow = [
      { content: 'Subject', rowSpan: 2 },
      ...examNames.map(examName => ({ content: examName, colSpan: 2 })),
      { content: 'Total', colSpan: 2 },
      { content: '%', rowSpan: 2 }
    ];
    const secondHeaderRow = [
      ...examNames.flatMap(() => [
        { content: 'Obt.' },
        { content: 'Max' }
      ]),
      { content: 'Obt.' },
      { content: 'Max' }
    ];

    const buildTableData = (subjectRows: typeof allSubjects, showGrades = false): string[][] => subjectRows.map(subject => {
      const row: string[] = [subject.subjectName];

      examNames.forEach(examName => {
        const examMarks = subject.examMarks[examName];
        if (showGrades) {
          row.push(examMarks && examMarks.maxMarks > 0 && examMarks.marks !== null && examMarks.marks !== undefined
            ? gradeFromPercentage((examMarks.marks / examMarks.maxMarks) * 100)
            : '-');
          return;
        }
        row.push(examMarks ? (examMarks.marks !== null && examMarks.marks !== undefined ? examMarks.marks.toString() : '-') : '-');
        row.push(examMarks ? examMarks.maxMarks.toString() : '-');
      });

      if (showGrades) {
        row.push(subject.totalMax > 0 ? gradeFromPercentage(subject.percentage) : '-');
        return row;
      }
      row.push(subject.totalObtained.toString());
      row.push(subject.totalMax.toString());
      row.push(subject.percentage.toFixed(1) + '%');
      return row;
    });

    const gradeSheetHeader = [
      { content: 'GRADE SHEET SUBJECTS' },
      ...examNames.map(examName => ({ content: examName })),
      { content: 'Overall Grade' }
    ];

    const gradeSheetTotalRow: string[] = ['CLASS GRADE'];
    examNames.forEach(examName => {
      const examTotal = gradeSheetSubjects.reduce((total, subject) => {
        const marks = subject.examMarks[examName];
        total.obtained += marks?.marks || 0;
        total.max += marks?.maxMarks || 0;
        return total;
      }, { obtained: 0, max: 0 });
      gradeSheetTotalRow.push(examTotal.max > 0
        ? gradeFromPercentage((examTotal.obtained / examTotal.max) * 100)
        : '-');
    });
    const gradeSheetOverall = gradeSheetSubjects.reduce((total, subject) => {
      total.obtained += subject.totalObtained;
      total.max += subject.totalMax;
      return total;
    }, { obtained: 0, max: 0 });
    gradeSheetTotalRow.push(gradeSheetOverall.max > 0
      ? gradeFromPercentage((gradeSheetOverall.obtained / gradeSheetOverall.max) * 100)
      : '-');

    // Calculate overall totals row
    const overallTotals: { [examName: string]: { obtained: number; max: number } } = {};
    mainResultSubjects.forEach((subject) => {
      Object.entries(subject.examMarks).forEach(([examName, marks]) => {
        if (!overallTotals[examName]) {
          overallTotals[examName] = { obtained: 0, max: 0 };
        }
        overallTotals[examName].obtained += marks.marks || 0;
        overallTotals[examName].max += marks.maxMarks || 0;
      });
    });

    let grandTotalObtained = 0;
    let grandTotalMax = 0;
    Object.values(overallTotals).forEach((total) => {
      grandTotalObtained += total.obtained;
      grandTotalMax += total.max;
    });
    const grandPercentage = grandTotalMax > 0 ? (grandTotalObtained / grandTotalMax) * 100 : 0;

    const totalRow: string[] = ['OVERALL TOTAL'];
    examNames.forEach(examName => {
      const total = overallTotals[examName];
      totalRow.push(total ? total.obtained.toString() : '0');
      totalRow.push(total ? total.max.toString() : '0');
    });
    totalRow.push(grandTotalObtained.toString());
    totalRow.push(grandTotalMax.toString());
    totalRow.push(grandPercentage.toFixed(1) + '%');

    const renderTable = (title: string, tableData: string[][], includeOverallTotal: boolean, showGrades = false) => {
      const tableHeaderRow = showGrades
        ? gradeSheetHeader
        : firstHeaderRow.map((cell, index) =>
          index === 0 ? { ...cell, content: title + ' Subjects' } : cell
        );
      const tableFootRow = showGrades ? gradeSheetTotalRow : totalRow;

      autoTable(doc, {
        head: showGrades ? [tableHeaderRow] : [tableHeaderRow, secondHeaderRow],
        body: tableData,
        foot: includeOverallTotal ? [tableFootRow] : [],
        startY: yPos,
        margin: { left: 15, right: 15 },
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          halign: 'center',
          valign: 'middle',
          textColor: [39, 54, 59],
          lineColor: [207, 218, 221],
          lineWidth: 0.15
        },
        headStyles: {
          fillColor: [43, 104, 111],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 }
        },
        footStyles: {
          fillColor: [231, 238, 239],
          textColor: [31, 59, 64],
          fontStyle: 'bold'
        },
        didParseCell: function(data) {
          if (data.section === 'head') {
            data.cell.styles.fillColor = data.row.index === 0
              ? [31, 76, 83]
              : [54, 116, 123];
          }
          if (data.section === 'body') {
            data.cell.styles.fillColor = data.row.index % 2 === 0
              ? [255, 255, 255]
              : [246, 249, 249];

            if (data.column.index === 0) {
              data.cell.styles.fillColor = data.row.index % 2 === 0
                ? [239, 245, 246]
                : [232, 241, 242];
              data.cell.styles.textColor = [31, 69, 74];
              data.cell.styles.fontStyle = 'bold';
            }

            if (showGrades && data.column.index === tableFootRow.length - 1) {
              data.cell.styles.fillColor = [237, 246, 240];
            } else if (!showGrades && data.column.index >= tableFootRow.length - 3) {
              data.cell.styles.fillColor = data.column.index === totalRow.length - 1
                ? [218, 239, 226]
                : [237, 246, 240];
            }
          }
          if (data.section === 'foot' && showGrades && data.column.index > 0) {
            data.cell.styles.fillColor = [216, 235, 222];
          } else if (data.section === 'foot' && !showGrades && data.column.index >= tableFootRow.length - 3) {
            data.cell.styles.fillColor = data.column.index === tableFootRow.length - 1
              ? [194, 226, 208]
              : [216, 235, 222];
          }
        }
      });
      yPos = (doc as any).lastAutoTable.finalY + 3;
    };

    renderTable('MAIN RESULT', buildTableData(mainResultSubjects), true);
    renderTable('GRADE SHEET', buildTableData(gradeSheetSubjects, true), true, true);

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setPage(1);
    const signatureEndY = SignatureFooter.addToPDF(doc, pageWidth, pageHeight - 32);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      signatureEndY + 4,
      { align: 'center' }
    );

    doc.addPage();
    yPos = 20;
    yPos = this.addPersonalDevelopmentTable(doc, yPos);
    yPos = this.addPhysicalDevelopmentTable(doc, yPos);

    const notes = points;
    if (notes.length) {
      const textWidth = pageWidth - 36;
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Notes', 18, yPos);
      yPos += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);

      notes.forEach((point, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${point}`, textWidth) as string[];
        const lineHeight = 3.5;
        doc.text(lines, 18, yPos);
        yPos += lines.length * lineHeight + 0.5;
      });
    }

    // Grade Legend
    const gradeScaleText = 'Grade Scale: A+ (90-100) | A (80-89) | B+ (70-79) | B (60-69) | C (50-59) | D (40-49) | F (<40)';
    const legendY = yPos + 4;

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      gradeScaleText,
      pageWidth / 2,
      legendY,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `Marksheet_${studentResults.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}

export default ResultPDFGenerator;
