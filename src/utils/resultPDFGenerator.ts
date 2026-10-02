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
  static generateExamResultPDF(
    studentResults: StudentResultsDTO,
    examResult: ExamResult,
    schoolName: string = 'School Learning Management System'
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 10;

    // Header - School Name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Exam Title
    doc.setFontSize(12);
    doc.text(examResult.examName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Academic Result Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Academic Result', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Student Information
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const studentInfoLeft = 15;
    const studentInfoRight = pageWidth / 2 + 10;

    // Left column
    doc.text('Student Name:', studentInfoLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentResults.studentName, studentInfoLeft + 35, yPos);

    // Right column
    doc.setFont('helvetica', 'bold');
    doc.text('Class:', studentInfoRight, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${studentResults.className.split("-")[0]} - ${studentResults.className.split("-")[1]}`, studentInfoRight + 15, yPos);
    yPos += 6;
   

    // PEN Number row
    doc.setFont('helvetica', 'bold');
    doc.text('PEN Number:', studentInfoLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentResults.studentPanNumber, studentInfoLeft + 35, yPos);
    yPos += 10;

    // Another separator
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Subject-wise marks table
    const tableData = examResult.subjectScores.map((subject) => [
      subject.subjectName,
      subject.marks !== null && subject.marks !== undefined ? subject.marks.toString() : 'Not Added',
      subject.maxMarks.toString(),
      subject.marks !== null && subject.marks !== undefined 
        ? `${((subject.marks / subject.maxMarks) * 100).toFixed(2)}%` 
        : '-',
      subject.grade
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Subject', 'Marks Obtained', 'Maximum Marks', 'Percentage', 'Grade']],
      body: tableData as any,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 }
      },
      margin: { left: 15, right: 15 },
      foot: [[
        'Total',
        examResult.obtainedMarks.toString(),
        examResult.totalMarks.toString(),
        `${examResult.percentage.toFixed(2)}%`,
        examResult.overallGrade
      ]],
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Overall Result Summary Box
    const boxHeight = 38;
    const signatureGap = 5;
    const signatureBlockHeight = 26;
    const bottomMargin = 8;
    const summaryAndFooterHeight = boxHeight + signatureGap + signatureBlockHeight + bottomMargin;
    if (yPos > pageHeight - summaryAndFooterHeight) {
      doc.addPage();
      yPos = 20;
    }

    // Draw summary box
    const boxX = 15;
    const boxY = yPos;
    const boxWidth = pageWidth - 30;
    doc.setFillColor(247, 250, 250);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

    // Teal title band and border
    doc.setFillColor(31, 76, 83);
    doc.rect(boxX, boxY, boxWidth, 9, 'F');
    doc.setDrawColor(207, 218, 221);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('RESULT SUMMARY', boxX + 5, boxY + 6);

    const columnCenters = [boxX + boxWidth / 6, pageWidth / 2, boxX + (boxWidth * 5) / 6];
    const metricLabels = ['MARKS', 'PERCENTAGE', 'GRADE'];
    const metricValues = [
      `${examResult.obtainedMarks} / ${examResult.totalMarks}`,
      `${examResult.percentage.toFixed(2)}%`,
      examResult.overallGrade
    ];

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 112, 115);
    metricLabels.forEach((label, index) => {
      doc.text(label, columnCenters[index], boxY + 16, { align: 'center' });
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 76, 83);
    metricValues.forEach((value, index) => {
      doc.text(value, columnCenters[index], boxY + 25, { align: 'center' });
    });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 112, 115);
    doc.text(this.getGradeInterpretation(examResult.overallGrade), pageWidth / 2, boxY + 33, { align: 'center' });

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
    selectedSubjects: Array<{ subjectName: string; mainResult?: boolean; gradeSheet?: boolean }>,
    points : string[],
    studentResults: StudentResultsDTO,
    school:any,
    schoolName: string = 'School Learning Management System'
  ): Promise<void> 
  {
    //console.log("points : " , points);

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    const resolvedSchoolName = school?.schoolName || schoolName;
    const resolvedSchoolAddress = school?.schoolAddress || '';
    const resolvedAffiliationNo = school?.affiliationNo || 'XXXXXX';
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
    const includedSubjects = allSubjects.filter(subject => {
      const selection = selectedSubjects.find(item => item.subjectName === subject.subjectName);
      return selection?.mainResult === true || selection?.gradeSheet === true;
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
    doc.text(`AFFILIATION NO. ${resolvedAffiliationNo}`, pageWidth / 2, schoolHeaderY + (resolvedSchoolAddress ? 14 : 7), { align: 'center' });
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
    includedSubjects.forEach((subject) => {
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

    const notes = points;
    if (notes.length) {
      const pageHeight = doc.internal.pageSize.getHeight();
      const textWidth = pageWidth - 36;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Notes', 18, yPos);
      yPos += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      notes.forEach((point, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${point}`, textWidth) as string[];
        const lineHeight = 3.5;
        doc.text(lines, 18, yPos);
        yPos += lines.length * lineHeight + 0.5;
      });
    }

    // Grade Legend
    const pageHeight = doc.internal.pageSize.getHeight();
    const gradeScaleText = 'Grade Scale: A+ (90-100) | A (80-89) | B+ (70-79) | B (60-69) | C (50-59) | D (40-49) | F (<40)';
    const legendY = yPos + 4;
    const signatureBlockGap = 8;

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      gradeScaleText,
      pageWidth / 2,
      legendY,
      { align: 'center' }
    );

    // Footer with signature section just below the grade scale
    const finalSignatureY = legendY + signatureBlockGap;
    const signatureEndY = SignatureFooter.addToPDF(doc, pageWidth, finalSignatureY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      signatureEndY + 4,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `Marksheet_${studentResults.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}

export default ResultPDFGenerator;
