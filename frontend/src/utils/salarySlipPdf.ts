import { PayrollRecord } from '@/types';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export async function downloadSalarySlipPdf(record: PayrollRecord, employeeName: string, employeeCode: string, department: string) {
  // Dynamic import so jspdf is never bundled server-side
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;
  await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const month = MONTHS[(record.payroll_month ?? 1) - 1];
  const year  = record.payroll_year ?? new Date().getFullYear();

  const gross      = Number(record.salary_amount ?? 0);
  const deductions = Number(record.deductions ?? 0);
  const net        = Number(record.net_salary ?? 0);

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(8, 145, 178);   // cyan-600
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('HarshHR', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Human Resource Management System', 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SALARY SLIP', pageW - 14, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${month} ${year}`, pageW - 14, 18, { align: 'right' });

  // ── Teal accent line ────────────────────────────────────────────────────────
  doc.setFillColor(15, 118, 110);  // teal-700
  doc.rect(0, 28, pageW, 2, 'F');

  // ── Employee details block ──────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Employee Details', 14, 40);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, 42, pageW - 14, 42);

  const details: [string, string][] = [
    ['Name',            employeeName],
    ['Employee Code',   employeeCode],
    ['Department',      department || '—'],
    ['Pay Period',      `${month} ${year}`],
    ['Working Days',    String(record.total_working_days ?? '—')],
    ['Present Days',    String(record.present_days ?? '—')],
    ['Paid Leave',      String(record.paid_leave_days ?? 0)],
    ['Unpaid Leave',    String(record.unpaid_leave_days ?? 0)],
    ['Absent Days',     String(record.absent_days ?? 0)],
  ];

  let y = 48;
  doc.setFontSize(9);
  details.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? 14 : pageW / 2 + 4;
    if (i % 2 === 0 && i > 0) y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', col, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, col + 32, y);
  });
  y += 12;

  // ── Earnings & Deductions table ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Earnings & Deductions', 14, y);
  y += 2;

  // @ts-expect-error jspdf-autotable attaches to prototype
  doc.autoTable({
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Component', 'Type', 'Amount']],
    body: [
      ['Basic Salary',      'Earning',   fmt(gross * 0.50)],
      ['HRA',               'Earning',   fmt(gross * 0.20)],
      ['Special Allowance', 'Earning',   fmt(gross * 0.20)],
      ['Other Allowances',  'Earning',   fmt(gross * 0.10)],
      ['Gross Salary',      'Earning',   fmt(gross)],
      ['PF Deduction',      'Deduction', fmt(deductions * 0.60)],
      ['Professional Tax',  'Deduction', fmt(deductions * 0.15)],
      ['TDS',               'Deduction', fmt(deductions * 0.15)],
      ['Other Deductions',  'Deduction', fmt(deductions * 0.10)],
      ['Total Deductions',  'Deduction', fmt(deductions)],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [8, 145, 178], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 253, 255] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto', halign: 'right' },
    },
    willDrawCell: (data: { section: string; row: { index: number }; cell: { styles: { fontStyle: string; fillColor: number[] } } }) => {
      if (data.section === 'body' && (data.row.index === 4 || data.row.index === 9)) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [224, 247, 250];
      }
    },
  });

  // @ts-expect-error autoTable adds finalY
  const afterTable: number = doc.lastAutoTable.finalY + 6;

  // ── Net Pay box ─────────────────────────────────────────────────────────────
  doc.setFillColor(8, 145, 178);
  doc.roundedRect(14, afterTable, pageW - 28, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET PAY', 20, afterTable + 9);
  doc.setFontSize(13);
  doc.text(fmt(net), pageW - 20, afterTable + 9, { align: 'right' });

  // ── Footer ──────────────────────────────────────────────────────────────────
  const footerY = afterTable + 26;
  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('This is a system-generated salary slip and does not require a signature.', pageW / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW / 2, footerY + 5, { align: 'center' });

  doc.setDrawColor(8, 145, 178);
  doc.setLineWidth(0.5);
  doc.line(14, footerY - 3, pageW - 14, footerY - 3);

  // ── Save ────────────────────────────────────────────────────────────────────
  const filename = `SalarySlip_${employeeCode}_${month}_${year}.pdf`;
  doc.save(filename);
}
