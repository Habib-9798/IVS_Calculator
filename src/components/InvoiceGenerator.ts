import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AppSettings } from "../types";

interface InvoiceData {
  parentName: string;
  fCode: string;
  issuedOn: string;
  dueDate: string;
  students: Array<{
    name: string;
    grade: string;
    month: string;
    amount: number;
    regularFee: number;
    discountedFee: number;
    finalFee: number;
    quantity: number;
    pricingType: string;
  }>;
  registrationEntries?: Array<{
    name: string;
    fullFee: number;
    discount: number;
    netFee: number;
  }>;
  totalAmount: number;
  programDiscountAmount: number;
  customDiscountAmount: number;
  enrollmentDiscountAmount: number;
  fixedDiscountAmount: number;
  finalAmount: number;
  settings: AppSettings;
  currency: string;
  exchangeRate: number;
}

const HEADER_URL = "templates/Header.jpg";
const SCAN_URL = "templates/Scan%20to%20pay.jpg";
const STAMP_URL = "templates/Stamp%20and%20signature.jpg";

// Refined Color Palette for a Premium Look
const NAVY: [number, number, number] = [34, 50, 105];
const DARK_BLUE: [number, number, number] = [25, 40, 100];
const ACCENT_RED: [number, number, number] = [180, 0, 0];
const TEXT_GRAY: [number, number, number] = [100, 100, 100];

const FOOTER_H = 17;
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_BOTTOM_SAFE = FOOTER_H + 8;

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${url}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function detectImgFormat(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
}

async function getImageSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function addHeader(doc: jsPDF) {
  const headerImg = await urlToDataUrl(HEADER_URL);
  const { w, h } = await getImageSize(headerImg);

  // Calculate dimensions to fit within page width while maintaining aspect ratio
  const drawW = PAGE_W - (MARGIN * 2); // Use content width
  const drawH = drawW * (h / w);

  // Calculate centered X position
  const drawX = (PAGE_W - drawW) / 2;

  doc.addImage(headerImg, detectImgFormat(headerImg), drawX, MARGIN, drawW, drawH);
  return drawH + MARGIN; // Return total height including top margin
}

function drawFooter(doc: jsPDF, settings: AppSettings) {
  const footerY = PAGE_H - FOOTER_H;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, footerY, PAGE_W, FOOTER_H, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${settings.phone || "+92 305 5245551"}`, MARGIN, footerY + 10);
  doc.text(`${settings.email || "acivs2021@gmail.com"}`, PAGE_W / 2, footerY + 10, { align: "center" });
  doc.text(`${settings.website || "iqravirtualschool.com"}`, PAGE_W - MARGIN, footerY + 10, { align: "right" });
}

function ensureSpace(doc: jsPDF, y: number, need: number) {
  if (y + need > PAGE_H - CONTENT_BOTTOM_SAFE) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { settings } = data;

  // ===== Page 1 Header =====
  let y = MARGIN;
  try {
    const headerH = await addHeader(doc);
    y = headerH + 10;
  } catch (e) {
    console.error("Header load failed", e);
    y = 25;
  }

  // ===== Title =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(DARK_BLUE[0], DARK_BLUE[1], DARK_BLUE[2]);
  doc.text("FEE INVOICE", PAGE_W / 2, y, { align: "center" });
  y += 12;

  const formatN = (num: number) => {
    const rate = data.exchangeRate || 1;
    return (num * rate).toFixed(2);
  };

  const formatC = (num: number) => {
    return `${data.currency} ${formatN(num)}`;
  };

  // ===== Info Fields (Perfectly Aligned Grid) =====
  const leftLabelX = MARGIN;
  const leftValueX = MARGIN + 32;
  const rightLabelX = 145;
  const rightValueX = PAGE_W - MARGIN;
  const rowSpacing = 5.5;

  // Row 1
  doc.setFontSize(10);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Parent's Name:", leftLabelX, y);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(String(data.parentName || ""), leftValueX, y);

  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Issued on:", rightLabelX, y);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(String(data.issuedOn || ""), rightValueX, y, { align: "right" });
  y += rowSpacing;

  // Row 2
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFont("helvetica", "normal");
  doc.text("F.Code:", leftLabelX, y);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(String(data.fCode || ""), leftValueX, y);

  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Due Date:", rightLabelX, y);

  doc.setTextColor(ACCENT_RED[0], ACCENT_RED[1], ACCENT_RED[2]);
  doc.setFont("helvetica", "bold");
  doc.text(String(data.dueDate || ""), rightValueX, y, { align: "right" });
  y += rowSpacing;

  // Row 3
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Currency:", leftLabelX, y);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.currency} (1 SAR = ${data.exchangeRate.toFixed(4)} ${data.currency})`, leftValueX, y);

  y += 10;

  // ===== Fee Table =====
  const tableHead = [
    [
      { content: "Reg No", styles: { halign: "left" as const } },
      { content: "Description", styles: { halign: "left" as const } },
      { content: "Grade", styles: { halign: "left" as const } },
      { content: `Regular Fee\n(${data.currency})`, styles: { halign: "right" as const } },
      { content: `After Disc.\n(${data.currency})`, styles: { halign: "right" as const } },
      { content: "Month", styles: { halign: "center" as const } },
      { content: `Amount\n(${data.currency})`, styles: { halign: "right" as const } },
    ],
  ];

  const rows: any[] = [];

  for (const s of data.students) {
    const qtyTxt = s.quantity > 1 ? ` (x${s.quantity})` : "";
    const normalFee = Number(s.regularFee || 0);
    const finalFee = Number(s.finalFee || 0);
    const pricingSuffix =
      s.pricingType === "subject"
        ? "\n(Fee per subject)"
        : s.pricingType === "days"
          ? "\n(Fee per day/plan)"
          : "";

    rows.push([
      "N/A",
      `Monthly Fee - ${s.name}${qtyTxt}${pricingSuffix}`,
      s.grade,
      formatN(normalFee),
      Math.abs(finalFee - normalFee) > 0.01 ? formatN(finalFee) : "-",
      s.month,
      formatN(finalFee),
    ]);
  }

  if (data.registrationEntries && data.registrationEntries.length > 0) {
    for (const reg of data.registrationEntries) {
      const discountTxt = reg.discount > 0 ? `\n(${reg.discount}% off)` : "";
      rows.push([
        "N/A",
        `Registration Fee - ${reg.name}${discountTxt}`,
        "",
        formatN(reg.fullFee),
        reg.discount > 0 ? formatN(reg.netFee) : "-",
        "",
        formatN(reg.netFee),
      ]);
    }
  }

  const normalTotal =
    data.students.reduce((sum, s) => sum + Number(s.regularFee || 0), 0) +
    (data.registrationEntries || []).reduce((sum, r) => sum + r.fullFee, 0);

  if (data.programDiscountAmount > 0) {
    const txt = `-${formatC(data.programDiscountAmount)}${data.currency !== 'SAR' ? `\n(-${data.programDiscountAmount.toFixed(2)} SAR)` : ''}`;
    rows.push(["", "Program Discount", "", "", "", "", txt]);
  }
  if (data.customDiscountAmount > 0) {
    const txt = `-${formatC(data.customDiscountAmount)}${data.currency !== 'SAR' ? `\n(-${data.customDiscountAmount.toFixed(2)} SAR)` : ''}`;
    rows.push(["", "Individual Discounts", "", "", "", "", txt]);
  }
  if (data.enrollmentDiscountAmount > 0) {
    const txt = `-${formatC(data.enrollmentDiscountAmount)}${data.currency !== 'SAR' ? `\n(-${data.enrollmentDiscountAmount.toFixed(2)} SAR)` : ''}`;
    rows.push(["", "Enrollment Discount\n(Sibling + Multi-Program)", "", "", "", "", txt]);
  }
  if (data.fixedDiscountAmount > 0) {
    const txt = `-${formatC(data.fixedDiscountAmount)}${data.currency !== 'SAR' ? `\n(-${data.fixedDiscountAmount.toFixed(2)} SAR)` : ''}`;
    rows.push(["", "Fixed Discount", "", "", "", "", txt]);
  }

  const totalSavings = normalTotal - data.finalAmount;
  const savingsPercent = normalTotal > 0 ? (totalSavings / normalTotal) * 100 : 0;
  const hasDiscount = totalSavings > 0.01;

  if (hasDiscount) {
    // Single linear string layout logic
    const savingsTxt = data.currency !== "SAR"
      ? `-${formatC(totalSavings)} (-${totalSavings.toFixed(2)} SAR)`
      : `-${formatC(totalSavings)}`;

    rows.push([
      {
        content: `Total Savings (${savingsPercent.toFixed(1)}% of regular fee)`,
        colSpan: 5, // Adjusted to push the text over, giving the amount column ample space
        styles: { fontStyle: "bold", textColor: [0, 150, 75], halign: "right" },
      },
      {
        content: savingsTxt,
        colSpan: 2, // Merged the last two columns so the linear text isn't cramped
        styles: { fontStyle: "bold", textColor: [0, 150, 75], halign: "right" },
      },
    ]);

    const normalTotalTxt = data.currency !== "SAR"
      ? `${formatC(normalTotal)} (${normalTotal.toFixed(2)} SAR)`
      : formatC(normalTotal);

    rows.push([
      {
        content: "Total (Without Discount)",
        colSpan: 5,
        styles: { fontStyle: "bold", halign: "right" },
      },
      {
        content: normalTotalTxt,
        colSpan: 2,
        styles: { fontStyle: "bold", halign: "right" }
      },
    ]);
  }

  // Pure single line string for the final payable amount
  const totalPayableTxt = data.currency !== "SAR"
    ? `${formatC(data.finalAmount)} (${data.finalAmount.toFixed(2)} SAR)`
    : formatC(data.finalAmount);

  rows.push([
    {
      content: hasDiscount ? "TOTAL PAYABLE (After Discount)" : "TOTAL PAYABLE",
      colSpan: 5,
      styles: { fontStyle: "bold", fontSize: 10, halign: "right" },
    },
    {
      content: totalPayableTxt,
      colSpan: 2, // Merged last two columns to freely adjust the linear text
      styles: { fontStyle: "bold", fontSize: 10, halign: "right" },
    },
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: CONTENT_BOTTOM_SAFE },
    theme: "plain",
    head: tableHead,
    body: rows,

    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      halign: "left",
      valign: "middle",
    },

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      lineWidth: 0,
      textColor: [30, 30, 30],
      valign: "middle",
      overflow: "linebreak",
    },

    columnStyles: {
      0: { cellWidth: 12, halign: "left" },
      1: { cellWidth: 48, halign: "left" },
      2: { cellWidth: 32, halign: "left" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 26, halign: "right" },
    },

    didParseCell: (hook) => {
      if (hook.section === "body") {
        hook.cell.styles.lineWidth = { bottom: 0.1 };
        hook.cell.styles.lineColor = [220, 220, 220];
      }

      // Smooth, thin line layout for Final Total Payable
      if (hook.section === "body" && hook.row.index === rows.length - 1) {
        hook.cell.styles.fillColor = [245, 248, 255];
        hook.cell.styles.lineWidth = { top: 0.2, bottom: 0.2 };
        hook.cell.styles.lineColor = NAVY;
        hook.cell.styles.textColor = NAVY;
        hook.cell.styles.cellPadding = { top: 2, bottom: 2, right: 3, left: 3 };
      }

      if (hook.section === "body") {
        const cellContent = typeof hook.cell.raw === "string" ? hook.cell.raw : "";
        if (cellContent.startsWith("-")) {
          hook.cell.styles.textColor = [0, 150, 75];
          hook.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  y = (doc as any).lastAutoTable?.finalY ?? (y + 50);
  y += 12;

  // ===== Payment Information =====
  y = ensureSpace(doc, y, 70);

  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAYMENT INFORMATION", PAGE_W / 2, y + 5.5, { align: "center" });
  y += 12;

  doc.setTextColor(30, 30, 30);

  const col1X = MARGIN + 2;
  const col2X = MARGIN + 65;
  const col3X = PAGE_W - MARGIN - 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("IQRA VIRTUALSOLUTIONS", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  const col1Lines = [
    "IBAN#: PK71MEZN0007810111367793",
    "(International Transfers)",
    "A/C #: 07810111367793 (Local)",
    "Branch Code: 0781",
    "Bank: Meezan Bank Peshawar",
    "(Khyber Bazar Branch)",
    "Contact: +92 335 524 5551",
  ];
  let lineY = y + 4;
  for (const line of col1Lines) {
    doc.text(line, col1X, lineY);
    lineY += 3.5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("IVSGLOBAL", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  const col2Lines = [
    "Bank Name: Mashreq Bank",
    "IBAN: AE620330000019101455931",
    "A/C Number: 019101455931",
    "Mobile: +971528838128",
    "Beneficiary Address:",
    "Ajman Industrial Area 2,",
    "Ajman, UAE",
  ];
  lineY = y + 4;
  for (const line of col2Lines) {
    doc.text(line, col2X, lineY);
    lineY += 3.5;
  }

  try {
    const scanImg = await urlToDataUrl(SCAN_URL);
    const { w, h } = await getImageSize(scanImg);
    const scanH = 28;
    const scanW = scanH * (w / h);
    doc.addImage(scanImg, detectImgFormat(scanImg), col3X - scanW, y - 2, scanW, scanH);
  } catch (e) {
    console.error("Scan image failed", e);
  }

  y += 35;

  // ===== Instructions + Stamp/Signature =====
  y = ensureSpace(doc, y, 80);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("Instructions:", MARGIN, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  const instrItems = [
    {
      tick: true,
      text: "This is a reminder from the Accounts Department of Iqra Virtual School. To ensure accurate verification of your fee payment, we kindly request you to fill out the fee receipt submission form:",
    },
    {
      tick: false,
      text: "   https://forms.gle/W4y3Q1VjyU8cRDvp7",
    },
    {
      tick: true,
      text: "Kindly fill out all the required information in the provided link accurately.",
    },
    {
      tick: true,
      text: "If you do not receive the paid slip from the school within 72 hours, kindly contact the Accounts Department.",
    },
    {
      tick: true,
      text: "Please note that if the fee payment was initially rejected by the bank and subsequently refunded, it will not be considered as paid.",
    },
    {
      tick: false,
      text: "For any queries, feel free to contact the Accounts Department.",
    },
  ];

  const instrStartY = y;
  const instrMaxW = 115;

  for (const item of instrItems) {
    if (item.tick) {
      doc.setTextColor(0, 150, 75);
      doc.setFont("helvetica", "bold");
      doc.text("✓", MARGIN + 2, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }

    const wrapped = doc.splitTextToSize(item.text, instrMaxW);
    doc.text(wrapped, MARGIN + 7, y);
    y += wrapped.length * 3.5 + 2;
  }

  try {
    const stampImg = await urlToDataUrl(STAMP_URL);
    const fmt = detectImgFormat(stampImg);
    const stampW = 45;
    const stampH = 48;
    const stampX = PAGE_W - MARGIN - stampW;
    const instrHeight = y - instrStartY;
    const stampY = instrStartY + Math.max(0, (instrHeight - stampH) / 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text("Authorized Signature", stampX + stampW / 2, stampY - 3, { align: "center" });
    doc.addImage(stampImg, fmt, stampX, stampY, stampW, stampH);
  } catch (e) {
    console.error("Stamp/signature failed", e);
  }

  // ===== Footer on EVERY page =====
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, settings);
  }

  doc.save(`Invoice_${String(data.parentName || "Parent").replace(/\s+/g, "_")}.pdf`);
};