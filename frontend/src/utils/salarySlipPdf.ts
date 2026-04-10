import { PayrollRecord } from '@/types';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export async function downloadSalarySlipPdf(record: PayrollRecord, employeeName: string, employeeCode: string, department: string) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const month = MONTHS[(record.payroll_month ?? 1) - 1];
  const year  = record.payroll_year ?? new Date().getFullYear();

  const gross      = Number(record.salary_amount ?? 0);
  const deductions = Number(record.deductions ?? 0);
  const net        = Number(record.net_salary ?? 0);

  // Indian breakdown — use stored fields, fall back to 0 (not estimated)
  const basic           = Number(record.basic          ?? 0);
  const hra             = Number(record.hra            ?? 0);
  const da              = Number(record.da             ?? 0);
  const specialAllow    = Number(record.special_allowance ?? 0);
  const otherAllow      = Number(record.other_allowance   ?? 0);
  const pfEmployee      = Number(record.pf_employee    ?? 0);
  const esiEmployee     = Number(record.esi_employee   ?? 0);
  const professionalTax = Number(record.professional_tax ?? 0);
  const tds             = Number(record.tds            ?? 0);

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(8, 145, 178);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MyHR', 14, 12);

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
  doc.setFillColor(15, 118, 110);
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
    ['Name',          employeeName],
    ['Employee Code', employeeCode],
    ['Department',    department || '—'],
    ['Pay Period',    `${month} ${year}`],
    ['Working Days',  String(record.total_working_days ?? '—')],
    ['Present Days',  String(record.present_days       ?? '—')],
    ['Paid Leave',    String(record.paid_leave_days     ?? 0)],
    ['Unpaid Leave',  String(record.unpaid_leave_days   ?? 0)],
    ['Absent Days',   String(record.absent_days         ?? 0)],
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

  // Build earnings rows — only include rows with non-zero values
  const earningRows: [string, string, string][] = [
    ['Basic Salary',       'Earning', fmt(basic)],
    ['HRA',                'Earning', fmt(hra)],
    ['DA (Dearness Allow.)', 'Earning', fmt(da)],
    ['Special Allowance',  'Earning', fmt(specialAllow)],
    ...(otherAllow > 0 ? [['Other Allowances', 'Earning', fmt(otherAllow)] as [string, string, string]] : []),
    ['Gross Salary',       'Earning', fmt(gross)],
  ];

  const deductionRows: [string, string, string][] = [
    ...(pfEmployee      > 0 ? [['PF (Employee)',      'Deduction', fmt(pfEmployee)]      as [string, string, string]] : []),
    ...(esiEmployee     > 0 ? [['ESI (Employee)',     'Deduction', fmt(esiEmployee)]     as [string, string, string]] : []),
    ...(professionalTax > 0 ? [['Professional Tax',  'Deduction', fmt(professionalTax)] as [string, string, string]] : []),
    ...(tds             > 0 ? [['TDS',               'Deduction', fmt(tds)]             as [string, string, string]] : []),
    ['Total Deductions', 'Deduction', fmt(deductions)],
  ];

  const allRows = [...earningRows, ...deductionRows];
  const grossRowIndex      = earningRows.length - 1;
  const totalDeductionIndex = allRows.length - 1;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Component', 'Type', 'Amount']],
    body: allRows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [8, 145, 178], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 253, 255] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto', halign: 'right' },
    },
    willDrawCell: (data: import('jspdf-autotable').CellHookData) => {
      if (data.section === 'body' && (data.row.index === grossRowIndex || data.row.index === totalDeductionIndex)) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [224, 247, 250];
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterTable: number = (doc as any).lastAutoTable.finalY + 6;

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
  doc.save(`SalarySlip_${employeeCode}_${month}_${year}.pdf`);
}
