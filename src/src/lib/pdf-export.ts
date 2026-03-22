
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Visitor } from './types';
import { format } from 'date-fns';

export const exportVisitorsToPDF = (visitors: Visitor[]) => {
  const doc = jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(59, 113, 242); // Primary Blue #3B71F2
  doc.text('NEU Library Visitor Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125); // Grey
  doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 28);
  
  const tableData = visitors.map((v) => [
    v.name,
    v.program,
    v.reason,
    format(v.timestamp, 'MMM dd, yyyy HH:mm'),
    v.device
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Name', 'Program', 'Reason', 'Time', 'Device']],
    body: tableData,
    headStyles: { fillColor: [59, 113, 242] },
    alternateRowStyles: { fillColor: [247, 248, 252] },
  });

  doc.save(`NEU_Library_Visitors_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
