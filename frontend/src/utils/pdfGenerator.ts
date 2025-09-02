import jsPDF from 'jspdf';
import { ResumeData } from '../types';

export const generateResumePDF = (resumeData: ResumeData): string => {
  const doc = new jsPDF();
  let y = 30;

  // Set up fonts and colors
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [107, 114, 128]; // Gray

  // Header Section
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(resumeData.personalDetails.name, 20, y);
  y += 15;

  // Contact Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  
  const contactInfo = [
    resumeData.personalDetails.email,
    resumeData.personalDetails.phone,
    resumeData.personalDetails.address
  ].filter(info => info).join(' | ');
  
  doc.text(contactInfo, 20, y);
  y += 10;

  // Links
  if (resumeData.personalDetails.linkedin || resumeData.personalDetails.github) {
    const links = [
      resumeData.personalDetails.linkedin && `LinkedIn: ${resumeData.personalDetails.linkedin}`,
      resumeData.personalDetails.github && `GitHub: ${resumeData.personalDetails.github}`
    ].filter(link => link).join(' | ');
    
    doc.text(links, 20, y);
    y += 15;
  }

  // Add a line separator
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 15;

  // Education Section
  if (resumeData.education.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('EDUCATION', 20, y);
    y += 10;

    resumeData.education.forEach(edu => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(edu.degree, 20, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${edu.institution}`, 20, y + 5);
      doc.text(`${edu.year}${edu.grade ? ` | Grade: ${edu.grade}` : ''}`, 20, y + 10);
      y += 20;
    });
  }

  // Skills Section
  if (resumeData.skills.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('SKILLS', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const skillsText = resumeData.skills.join(' • ');
    const lines = doc.splitTextToSize(skillsText, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 10;
  }

  // Projects Section
  if (resumeData.projects.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PROJECTS', 20, y);
    y += 10;

    resumeData.projects.forEach(project => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(project.title, 20, y);
      y += 5;

      if (project.technologies) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Technologies: ${project.technologies}`, 20, y);
        y += 5;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const descLines = doc.splitTextToSize(project.description, 170);
      doc.text(descLines, 20, y);
      y += descLines.length * 4 + 10;

      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
    });
  }

  // Experience Section
  if (resumeData.experience && resumeData.experience.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('EXPERIENCE', 20, y);
    y += 10;

    resumeData.experience.forEach(exp => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(exp.title, 20, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${exp.company} | ${exp.duration}`, 20, y + 5);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const expLines = doc.splitTextToSize(exp.description, 170);
      doc.text(expLines, 20, y + 10);
      y += expLines.length * 4 + 15;
    });
  }

  // Generate blob URL
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
};