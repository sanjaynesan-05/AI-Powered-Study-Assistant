import jsPDF from 'jspdf';
import { ResumeData } from '../types';

export interface ResumeCustomizationOptions {
  // Typography options
  fontFamily: string;
  primaryColor: [number, number, number]; // RGB format
  secondaryColor: [number, number, number]; // RGB format
  headerFontSize: number;
  bodyFontSize: number;
  subHeaderFontSize: number;
  sectionTitleFontSize: number;
  nameFontSize: number;
  
  // Spacing options
  lineSpacing: number; // Multiplier for line spacing
  sectionSpacing: number; // Space between sections
  paragraphSpacing: number; // Space between paragraphs
  
  // Layout options
  margins: { top: number; left: number; right: number; bottom: number };
  columnLayout: boolean; // True for two-column layout, false for one-column
  includePhoto: boolean;
  
  // Content options
  template: 'modern' | 'professional' | 'minimalist' | 'creative';
  
  // ATS options
  enableHyperlinks: boolean;
  hyperlinkColor: [number, number, number]; // RGB format
}

const defaultOptions: ResumeCustomizationOptions = {
  // Typography defaults
  fontFamily: 'times', // 'helvetica', 'times', or 'courier'
  primaryColor: [0, 83, 155], // Professional blue
  secondaryColor: [80, 80, 80], // Dark gray
  headerFontSize: 16,
  bodyFontSize: 10,
  subHeaderFontSize: 12,
  sectionTitleFontSize: 14,
  nameFontSize: 18,
  
  // Spacing defaults
  lineSpacing: 1.15,
  sectionSpacing: 8,
  paragraphSpacing: 6,
  
  // Layout defaults
  margins: { top: 15, left: 20, right: 20, bottom: 20 },
  columnLayout: false,
  includePhoto: false,
  
  // Content defaults
  template: 'professional',
  
  // ATS options
  enableHyperlinks: true,
  hyperlinkColor: [0, 0, 238]  // Standard hyperlink blue
};

export interface PDFGenerationResult {
  url: string;
  download: () => void;
  filename: string;
  blob: Blob;
}

export const enhancedGenerateResumePDF = (
  resumeData: ResumeData,
  customOptions: Partial<ResumeCustomizationOptions> = {}
): PDFGenerationResult => {
  // Merge default options with custom options
  const options = { ...defaultOptions, ...customOptions };
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Add font options (jsPDF supports 'helvetica', 'times', and 'courier' by default)
  let fontName = options.fontFamily;
  if (!['helvetica', 'times', 'courier'].includes(fontName.toLowerCase())) {
    fontName = 'helvetica'; // Fallback to helvetica if unsupported font
  }
  
  // Variables to track position and layout
  let y = options.margins.top + 10;
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const contentWidth = pageWidth - options.margins.left - options.margins.right;
  
  // Define section rendering functions
  const renderHeader = () => {
    // Header Section with name and title - centered, bold, larger font
    doc.setFontSize(options.nameFontSize);
    doc.setFont(fontName, 'bold');
    doc.setTextColor(options.primaryColor[0], options.primaryColor[1], options.primaryColor[2]);
    
    // Center the name
    doc.text(resumeData.personalDetails.name, pageWidth / 2, y, { align: 'center' });
    y += options.lineSpacing * 8;
    
    // Contact Information - centered, clean formatting
    doc.setFontSize(options.bodyFontSize);
    doc.setFont(fontName, 'normal');
    doc.setTextColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
    
    // Format contact info elements separately for better control
    const contactElements = [];
    if (resumeData.personalDetails.address) {
      contactElements.push(resumeData.personalDetails.address);
    }
    
    if (resumeData.personalDetails.phone) {
      contactElements.push(resumeData.personalDetails.phone);
    }
    
    if (resumeData.personalDetails.email) {
      contactElements.push(resumeData.personalDetails.email);
    }
    
    const contactInfo = contactElements.join(' | ');
    doc.text(contactInfo, pageWidth / 2, y, { align: 'center' });
    y += options.lineSpacing * 6;
    
    // Links as clickable hyperlinks
    if (resumeData.personalDetails.linkedin || resumeData.personalDetails.github) {
      const links = [];
      
      if (resumeData.personalDetails.linkedin) {
        links.push(`LinkedIn: ${resumeData.personalDetails.linkedin}`);
        
        if (options.enableHyperlinks) {
          const linkedinText = 'LinkedIn: ' + resumeData.personalDetails.linkedin;
          const textWidth = doc.getTextWidth(linkedinText);
          const linkX = (pageWidth - textWidth) / 2;
          const linkWidth = doc.getTextWidth(resumeData.personalDetails.linkedin);
          const linkStartX = linkX + doc.getTextWidth('LinkedIn: ');
          
          // Add clickable link area (x, y, width, height, URL)
          doc.link(
            linkStartX, 
            y - 3, 
            linkWidth, 
            5, 
            { url: `https://www.linkedin.com/in/${resumeData.personalDetails.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}` }
          );
        }
      }
      
      if (resumeData.personalDetails.github) {
        links.push(`GitHub: ${resumeData.personalDetails.github}`);
        
        if (options.enableHyperlinks) {
          const githubText = 'GitHub: ' + resumeData.personalDetails.github;
          const textWidth = doc.getTextWidth(githubText);
          const linkX = (pageWidth - textWidth) / 2;
          const linkWidth = doc.getTextWidth(resumeData.personalDetails.github);
          const linkStartX = linkX + doc.getTextWidth('GitHub: ');
          
          // Add clickable link area
          doc.link(
            linkStartX, 
            y - 3, 
            linkWidth, 
            5, 
            { url: `https://github.com/${resumeData.personalDetails.github.replace(/https?:\/\/(www\.)?github\.com\//i, '')}` }
          );
        }
      }
      
      if (links.length > 0) {
        const linksText = links.join(' | ');
        
        if (options.enableHyperlinks) {
          // Use hyperlink color for the links
          doc.setTextColor(options.hyperlinkColor[0], options.hyperlinkColor[1], options.hyperlinkColor[2]);
        }
        
        doc.text(linksText, pageWidth / 2, y, { align: 'center' });
        
        // Reset text color
        doc.setTextColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
        y += options.lineSpacing * 7;
      }
    }
    
    // Add a professional thin line separator
    doc.setDrawColor(options.primaryColor[0], options.primaryColor[1], options.primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(options.margins.left, y, pageWidth - options.margins.right, y);
    y += options.sectionSpacing;
  };
  
  const renderSection = (title: string, yPos: number): number => {
    let position = yPos;
    
    // Section headers: bold uppercase title with consistent formatting
    doc.setFontSize(options.sectionTitleFontSize);
    doc.setFont(fontName, 'bold');
    doc.setTextColor(options.primaryColor[0], options.primaryColor[1], options.primaryColor[2]);
    
    // Make sure title is uppercase
    const uppercaseTitle = title.toUpperCase();
    
    // Render the section title
    doc.text(uppercaseTitle, options.margins.left, position);
    position += options.lineSpacing * (options.sectionTitleFontSize / 2);
    
    // Add a thin horizontal divider line under each section heading
    doc.setDrawColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
    doc.setLineWidth(0.2);
    doc.line(
      options.margins.left, 
      position - 1, 
      pageWidth - options.margins.right, 
      position - 1
    );
    
    position += options.paragraphSpacing;
    return position;
  };
  
  const renderEducation = () => {
    if (resumeData.education.length === 0) return;
    
    y = renderSection('EDUCATION', y);
    
    resumeData.education.forEach((edu, index) => {
      // Check if we need a page break
      if (y > pageHeight - options.margins.bottom - 30) {
        doc.addPage();
        y = options.margins.top;
      }
      
      // Education section with institute name in bold, right-aligned duration
      
      // Institution name in bold
      doc.setFontSize(options.bodyFontSize + 1);
      doc.setFont(fontName, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(edu.institution, options.margins.left, y);
      
      // Duration right-aligned
      doc.setFont(fontName, 'normal');
      doc.setTextColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
      doc.text(
        edu.year, 
        pageWidth - options.margins.right, 
        y, 
        { align: 'right' }
      );
      y += options.lineSpacing * 5;
      
      // Degree and grade info
      doc.setTextColor(0, 0, 0);
      doc.setFont(fontName, 'italic');
      const degreeText = `${edu.degree}${edu.grade ? ` - CGPA: ${edu.grade}` : ''}`;
      doc.text(degreeText, options.margins.left, y);
      y += options.lineSpacing * 8;
      
      // Add space between education entries
      if (index < resumeData.education.length - 1) {
        y += options.paragraphSpacing;
      }
    });
    
    y += options.sectionSpacing;
  };
  
  const renderSkills = () => {
    if (resumeData.skills.length === 0) return;
    
    y = renderSection('SKILLS', y);
    
    // Check if we need a page break
    if (y > pageHeight - options.margins.bottom - 20) {
      doc.addPage();
      y = options.margins.top;
    }
    
    // Try to group skills by category if possible
    // The following code attempts to identify and group skills by categories
    const skillCategories: Record<string, string[]> = {
      'Frontend': [],
      'Backend': [],
      'Databases': [],
      'Other Skills': []
    };
    
    // Function to categorize a skill
    const categorizeSkill = (skill: string) => {
      const lowerSkill = skill.toLowerCase();
      
      // Frontend technologies
      if (/html|css|scss|bootstrap|react|vue|angular|jsx|javascript|typescript|responsive|ui|ux|sass|less|jquery|dom|design/i.test(lowerSkill)) {
        return 'Frontend';
      }
      
      // Backend technologies
      else if (/node|express|flask|django|spring|rest|api|server|java|python|php|ruby|go|microservice|.net|c#|aspnet|aws|azure|cloud|lambda|serverless/i.test(lowerSkill)) {
        return 'Backend';
      }
      
      // Database technologies
      else if (/sql|mongo|database|data|nosql|postgres|oracle|mysql|redis|cache|firebase|aws|dynamodb|neo4j|graphdb|storage/i.test(lowerSkill)) {
        return 'Databases';
      }
      
      // Default category for everything else
      else {
        return 'Other Skills';
      }
    };
    
    // Categorize skills
    resumeData.skills.forEach(skill => {
      const category = categorizeSkill(skill);
      skillCategories[category].push(skill);
    });
    
    // Render skills by category
    doc.setFontSize(options.bodyFontSize);
    
    Object.entries(skillCategories).forEach(([category, skills]) => {
      if (skills.length > 0) {
        // Skip rendering empty categories
        
        // Render category label in bold
        doc.setFont(fontName, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${category}:`, options.margins.left, y);
        
        // Render skills with comma separation
        doc.setFont(fontName, 'normal');
        doc.setTextColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
        
        const skillsText = skills.join(', ');
        const categoryLabelWidth = doc.getTextWidth(`${category}: `);
        const availableWidth = contentWidth - categoryLabelWidth;
        
        const skillLines = doc.splitTextToSize(skillsText, availableWidth);
        
        // First line right after category label
        if (skillLines.length > 0) {
          doc.text(skillLines[0], options.margins.left + categoryLabelWidth, y);
        }
        
        // Additional lines with proper indentation
        if (skillLines.length > 1) {
          for (let i = 1; i < skillLines.length; i++) {
            y += options.lineSpacing * 5;
            doc.text(skillLines[i], options.margins.left + categoryLabelWidth, y);
          }
        }
        
        y += options.lineSpacing * 7;
      }
    });
    
    y += options.paragraphSpacing;
  };
  
  const renderProjects = () => {
    if (resumeData.projects.length === 0) return;
    
    y = renderSection('PROJECTS', y);
    
    resumeData.projects.forEach((project) => {
      // Check if we need a page break
      if (y > pageHeight - options.margins.bottom - 40) {
        doc.addPage();
        y = options.margins.top;
      }
      
      // Project title in bold
      doc.setFontSize(options.bodyFontSize + 1);
      doc.setFont(fontName, 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Render project title (with link if available)
      if (project.link && options.enableHyperlinks) {
        doc.text(project.title, options.margins.left, y);
        
        // Add clickable project link in blue
        const titleWidth = doc.getTextWidth(project.title);
        doc.setTextColor(options.hyperlinkColor[0], options.hyperlinkColor[1], options.hyperlinkColor[2]);
        doc.setFont(fontName, 'normal');
        
        // Create clickable link
        doc.link(
          options.margins.left, 
          y - 3, 
          titleWidth, 
          5, 
          { url: project.link.startsWith('http') ? project.link : `https://${project.link}` }
        );
      } else {
        doc.text(project.title, options.margins.left, y);
      }
      y += options.lineSpacing * 5;
      
      // Project description - short and concise (1-2 lines)
      doc.setFontSize(options.bodyFontSize);
      doc.setFont(fontName, 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Process description as bullet points if it contains bullets or line breaks
      if (project.description.includes('•') || project.description.includes('\n')) {
        const bulletPoints = project.description
          .split(/[\n•]/)
          .map(point => point.trim())
          .filter(point => point.length > 0);
          
        bulletPoints.forEach(point => {
          if (point) {
            const bulletPointText = `• ${point}`;
            const bulletLines = doc.splitTextToSize(bulletPointText, contentWidth - 5);
            
            // Handle multi-line bullet points with proper indentation
            doc.text(bulletLines[0], options.margins.left, y);
            
            if (bulletLines.length > 1) {
              const indentSize = doc.getTextWidth('• ');
              for (let i = 1; i < bulletLines.length; i++) {
                y += options.lineSpacing * 5;
                doc.text(bulletLines[i], options.margins.left + indentSize, y);
              }
            }
            
            y += options.lineSpacing * 5;
          }
        });
      } else {
        // Regular description
        const descLines = doc.splitTextToSize(project.description, contentWidth);
        doc.text(descLines, options.margins.left, y);
        y += descLines.length * options.lineSpacing * 5;
      }
      
      // Technologies used (in bold/italic at the bottom of project)
      if (project.technologies) {
        doc.setFont(fontName, 'italic');
        doc.setTextColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
        
        // Start with "Technologies used: " in bold
        doc.setFont(fontName, 'bold');
        const techLabelWidth = doc.getTextWidth('Technologies used: ');
        doc.text('Technologies used:', options.margins.left, y);
        
        // Then list technologies in italic
        doc.setFont(fontName, 'italic');
        const techLines = doc.splitTextToSize(project.technologies, contentWidth - techLabelWidth);
        doc.text(techLines[0], options.margins.left + techLabelWidth, y);
        
        // Handle multi-line tech stack with proper indentation
        if (techLines.length > 1) {
          for (let i = 1; i < techLines.length; i++) {
            y += options.lineSpacing * 5;
            doc.text(techLines[i], options.margins.left + techLabelWidth, y);
          }
        }
        
        y += options.lineSpacing * 7;
      } else {
        y += options.lineSpacing * 2;
      }
      
      y += options.paragraphSpacing;
    });
    
    y += options.sectionSpacing;
  };
  
  const renderExperience = () => {
    if (!resumeData.experience || resumeData.experience.length === 0) return;
    
    y = renderSection('EXPERIENCE', y);
    
    resumeData.experience.forEach((exp) => {
      // Check if we need a page break
      if (y > pageHeight - options.margins.bottom - 40) {
        doc.addPage();
        y = options.margins.top;
      }
      
      // Job title in bold
      doc.setFontSize(options.bodyFontSize + 1);
      doc.setFont(fontName, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(exp.title, options.margins.left, y);
      
      // Company name with duration right-aligned
      doc.setFont(fontName, 'normal');
      doc.setTextColor(options.secondaryColor[0], options.secondaryColor[1], options.secondaryColor[2]);
      
      // Right-align duration
      doc.text(
        exp.duration,
        pageWidth - options.margins.right,
        y,
        { align: 'right' }
      );
      y += options.lineSpacing * 5;
      
      // Company name
      doc.setFont(fontName, 'italic');
      doc.text(exp.company, options.margins.left, y);
      y += options.lineSpacing * 5;
      
      // Format description with bullet points if it contains bullets or line breaks
      doc.setFontSize(options.bodyFontSize);
      doc.setFont(fontName, 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (exp.description.includes('•') || exp.description.includes('\n')) {
        const bulletPoints = exp.description
          .split(/[\n•]/)
          .map(point => point.trim())
          .filter(point => point.length > 0);
          
        bulletPoints.forEach(point => {
          if (point) {
            const bulletPointText = `• ${point}`;
            const bulletLines = doc.splitTextToSize(bulletPointText, contentWidth - 5);
            
            // Handle multi-line bullet points with proper indentation
            doc.text(bulletLines[0], options.margins.left, y);
            
            if (bulletLines.length > 1) {
              const indentSize = doc.getTextWidth('• ');
              for (let i = 1; i < bulletLines.length; i++) {
                y += options.lineSpacing * 5;
                doc.text(bulletLines[i], options.margins.left + indentSize, y);
              }
            }
            
            y += options.lineSpacing * 5;
          }
        });
      } else {
        // Regular description text
        const expLines = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(expLines, options.margins.left, y);
        y += expLines.length * options.lineSpacing * 5;
      }
      
      y += options.paragraphSpacing;
    });
    
    y += options.sectionSpacing;
  };
  
  // Add ATS optimization metadata to help with parsing by resume scanners
  const addMetadata = () => {
    // Extract all relevant keywords for PDF metadata
    const skillKeywords = resumeData.skills || [];
    const projectTechKeywords = resumeData.projects
      .map(p => p.technologies?.split(/[,|]/g).map(t => t.trim()) || [])
      .flat()
      .filter(t => t.length > 0);
    
    const roleKeywords = resumeData.experience?.map(exp => {
      // Extract key terms from job titles that might be valuable keywords
      const titleWords = exp.title.split(/\s+/).filter(word => 
        word.length > 3 && 
        !['and', 'the', 'for', 'with'].includes(word.toLowerCase())
      );
      return titleWords;
    }).flat() || [];
    
    const educationKeywords = resumeData.education
      .map(edu => {
        const degreeWords = edu.degree.split(/\s+/).filter(word => 
          word.length > 3 && 
          !['and', 'the', 'for', 'with', 'of'].includes(word.toLowerCase())
        );
        return [...degreeWords, edu.institution];
      })
      .flat();
    
    // Combine all keywords for comprehensive metadata
    const allKeywords = [
      ...skillKeywords,
      ...projectTechKeywords,
      ...roleKeywords,
      ...educationKeywords
    ].filter(Boolean);
    
    // Remove duplicates
    const uniqueKeywords = [...new Set(allKeywords.map(k => k.trim()))];
    
    doc.setProperties({
      title: `${resumeData.personalDetails.name} - Professional Resume`,
      subject: `Resume for ${resumeData.personalDetails.name} - ${resumeData.skills.slice(0, 5).join(', ')}`,
      author: resumeData.personalDetails.name,
      keywords: uniqueKeywords.join(', '),
      creator: 'AI Mentor Professional Resume Builder'
    });
  };
  
  // Function to render the footer with ATS-friendly tags
  const renderFooter = () => {
    const footerY = pageHeight - options.margins.bottom;
    doc.setFontSize(6); // Small text for footer (almost invisible to human readers but ATS can parse it)
    doc.setFont(fontName, 'normal');
    doc.setTextColor(200, 200, 200); // Very light gray text (nearly invisible)
    
    // Collect all relevant keywords for ATS optimization
    const atsKeywords = [
      ...resumeData.skills,
      ...(resumeData.projects.map(p => p.technologies?.split(/[,|]/g).map(t => t.trim()) || []).flat()),
      ...(resumeData.experience?.map(e => e.title.split(/\s+/)) || []).flat(),
      ...(resumeData.education.map(e => e.degree.split(/\s+/)) || []).flat()
    ].filter(Boolean)
     .map(kw => kw.trim())
     .filter(kw => kw.length > 2); // Filter out very short keywords
    
    // Remove duplicates, case-insensitive comparison
    const uniqueKeywords = [];
    const seen = new Set();
    
    for (const keyword of atsKeywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (!seen.has(lowerKeyword)) {
        seen.add(lowerKeyword);
        uniqueKeywords.push(keyword);
      }
    }
    
    // Limit keywords and format them for ATS
    const limitedKeywords = uniqueKeywords.slice(0, 30);
    
    // Use structured ATS-friendly format
    const footerText = `ATS-KEYWORDS: ${limitedKeywords.join(' | ')}`;
    
    // Position text at the very bottom of page, make it small enough to not be distracting
    doc.text(footerText, options.margins.left, footerY, {
      maxWidth: contentWidth
    });
  };
  
  // Render the resume based on selected template
  renderHeader();
  
  // For column layout, split sections between columns
  if (options.columnLayout) {
    const leftColumnWidth = contentWidth * 0.35;
    const rightColumnStart = options.margins.left + leftColumnWidth + 5;
    
    // Store original margin and y position
    const originalMarginLeft = options.margins.left;
    const originalY = y;
    
    // Left column content (Education and Skills)
    renderEducation();
    renderSkills();
    
    // Draw a vertical separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(
      originalMarginLeft + leftColumnWidth + 2.5, 
      originalY, 
      originalMarginLeft + leftColumnWidth + 2.5, 
      Math.max(y, pageHeight - options.margins.bottom * 2)
    );
    
    // Reset Y for right column and adjust left margin
    y = originalY;
    options.margins.left = rightColumnStart;
    
    // Right column content (Experience and Projects)
    renderExperience();
    renderProjects();
    
    // Reset margins
    options.margins.left = originalMarginLeft;
  } else {
    // Standard layout - sections in sequence
    renderEducation();
    renderSkills();
    renderExperience();
    renderProjects();
  }
  
  addMetadata();
  renderFooter();
  
  // Generate blob
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  // Create a sanitized filename from user's name
  const sanitizedName = resumeData.personalDetails.name
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with a single one
    .toLowerCase();
    
  const filename = `${sanitizedName}_resume_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Return object with URL and download function
  return {
    url: blobUrl,
    filename: filename,
    blob: pdfBlob,
    download: () => {
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      
      // Add to DOM, trigger click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
};
