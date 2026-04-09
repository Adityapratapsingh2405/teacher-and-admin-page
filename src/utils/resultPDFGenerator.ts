import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentResultsDTO, ExamResult } from '../services/resultService';

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
    let yPos = 20;

    // Header - School Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Exam Title
    doc.setFontSize(14);
    doc.text(examResult.examName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Academic Result Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Academic Result', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Student Information
    doc.setFontSize(10);
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

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Overall Result Summary Box
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Draw summary box
    const boxX = 15;
    const boxY = yPos;
    const boxWidth = pageWidth - 30;
    const boxHeight = 35;

    // Background color based on grade
    const gradeColors: { [key: string]: [number, number, number] } = {
      'A+': [200, 246, 213],
      'A': [154, 230, 180],
      'B+': [104, 211, 145],
      'B': [72, 187, 120],
      'C': [254, 215, 170],
      'D': [251, 211, 141],
      'F': [252, 129, 129]
    };

    const bgColor = gradeColors[examResult.overallGrade] || [240, 240, 240];
    doc.setFillColor(...bgColor);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

    // Border
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');

    // Summary text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Result Summary', pageWidth / 2, boxY + 8, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryY = boxY + 16;
    const col1X = boxX + 20;
    const col2X = pageWidth / 2 - 20;
    const col3X = pageWidth / 2 + 20;

    doc.text(`Total Marks: ${examResult.obtainedMarks}/${examResult.totalMarks}`, col1X, summaryY);
    doc.text(`Percentage: ${examResult.percentage.toFixed(2)}%`, col2X, summaryY);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Grade: ${examResult.overallGrade}`, col3X, summaryY);

    // Grade interpretation
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(this.getGradeInterpretation(examResult.overallGrade), pageWidth / 2, summaryY + 10, { align: 'center' });

    // Footer
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, yPos + 4, { align: 'center' });

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

    // Footer
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    doc.text('This is a computer-generated document.', pageWidth / 2, yPos + 4, { align: 'center' });

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
   * Generate comprehensive marksheet PDF with subjects as rows and exams as columns
   */
  static generateMarksheetPDF(
    studentResults: StudentResultsDTO,
    schoolName: string = 'School Learning Management System'
  ): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

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

    const subjects = Array.from(subjectMap.values());
    const examNames = exams.map(e => e.examName);

    // Header - School Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Marksheet Title
    doc.setFontSize(14);
    doc.text('COMPREHENSIVE MARKSHEET', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

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
    doc.text(`${studentResults.className.split("-")[0]} - Section : ${studentResults.className.split("-")[1]}`, studentInfoMiddle + 15, yPos);

    // PEN
    doc.setFont('helvetica', 'bold');
    doc.text('PEN:', studentInfoRight, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentResults.studentPanNumber, studentInfoRight + 15, yPos);
    yPos += 10;

    // Another separator
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Build table headers
    // We'll create a proper 2-row header structure
    // First row: Subject | Exam1 | Exam2 | ... | Total | %
    // Second row: empty | Obt. Max | Obt. Max | ... | Obt. Max | empty
    
    const firstHeaderRow: string[] = ['Subject'];
    const secondHeaderRow: string[] = [''];

    examNames.forEach(examName => {
      firstHeaderRow.push(examName);
      secondHeaderRow.push('Obt.');
      secondHeaderRow.push('Max');
    });

    firstHeaderRow.push('Total');
    secondHeaderRow.push('Obt.');
    secondHeaderRow.push('Max');

    firstHeaderRow.push('%');
    secondHeaderRow.push('');

    // Build table body
    const tableData: string[][] = [];

    subjects.forEach(subject => {
      const row: string[] = [subject.subjectName];

      examNames.forEach(examName => {
        const examMarks = subject.examMarks[examName];
        row.push(examMarks ? (examMarks.marks !== null && examMarks.marks !== undefined ? examMarks.marks.toString() : '-') : '-');
        row.push(examMarks ? examMarks.maxMarks.toString() : '-');
      });

      row.push(subject.totalObtained.toString());
      row.push(subject.totalMax.toString());
      row.push(subject.percentage.toFixed(1) + '%');

      tableData.push(row);
    });

    // Calculate overall totals row
    const overallTotals: { [examName: string]: { obtained: number; max: number } } = {};
    subjects.forEach((subject) => {
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

    tableData.push(totalRow);

    // Generate table with autoTable
    autoTable(doc, {
      head: [firstHeaderRow, secondHeaderRow],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } // Subject column
      },
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      didParseCell: function(data) {
        // Highlight the last row (Overall Total)
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [230, 230, 230];
          data.cell.styles.fontStyle = 'bold';
        }
        // Highlight Total and Percentage columns
        if (data.column.index >= firstHeaderRow.length - 3) {
          data.cell.styles.fillColor = data.row.index === tableData.length - 1 
            ? [200, 230, 201] 
            : [232, 245, 233];
        }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      finalY,
      { align: 'center' }
    );

    // Grade Legend
    const legendY = finalY + 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Grade Scale: A+ (90-100) | A (80-89) | B+ (70-79) | B (60-69) | C (50-59) | D (40-49) | F (<40)',
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
