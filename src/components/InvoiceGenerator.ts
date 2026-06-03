import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AppSettings } from "../types";

interface InvoiceData {
  parentName: string;
  fCode: string;
  issuedOn: string;
  dueDate: string;
  monthCount?: number;
  selectedMonths?: string[];
  billingMonths?: string[];
  students: Array<{
    name: string;
    grade: string;
    month: string;
    months?: string[];
    monthCount?: number;
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

const HEADER_URL = "templates/Header.png";
const SCAN_URL = "templates/Scan%20to%20pay.jpg";
const STAMP_URL = "templates/Stamp%20and%20signature.jpg";

// Refined Color Palette for a Premium Look
const NAVY: [number, number, number] = [34, 50, 105];
const DARK_BLUE: [number, number, number] = [25, 40, 100];
const ACCENT_RED: [number, number, number] = [180, 0, 0];
const TEXT_GRAY: [number, number, number] = [100, 100, 100];

const LIGHT_BG: [number, number, number] = [247, 249, 253];
const CARD_BG: [number, number, number] = [248, 250, 255];
const BORDER: [number, number, number] = [215, 221, 234];
const GREEN: [number, number, number] = [0, 150, 75];

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

  const drawW = PAGE_W - MARGIN * 2;
  const drawH = drawW * (h / w);
  const drawX = (PAGE_W - drawW) / 2;

  doc.addImage(headerImg, detectImgFormat(headerImg), drawX, MARGIN, drawW, drawH);
  return drawH + MARGIN;
}

function drawFooter(doc: jsPDF, settings: AppSettings) {
  const footerY = PAGE_H - FOOTER_H;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, footerY, PAGE_W, FOOTER_H, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
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

function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number, fill: [number, number, number] = CARD_BG) {
  doc.setFillColor(fill[0], fill[1], fill[2]);
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, 1.8, 1.8, "FD");
}

function drawCardTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(title, x, y);
}

function drawKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  valueX: number,
  valueAlign: "left" | "right" = "right",
  valueColor: [number, number, number] = [25, 25, 25]
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
  doc.text(value, valueX, y, { align: valueAlign });
}

function drawPageTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(DARK_BLUE[0], DARK_BLUE[1], DARK_BLUE[2]);
  doc.text(title, PAGE_W / 2, y, { align: "center" });
}

function drawSectionHeading(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(title, x, y);
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { settings } = data;

  const monthCount = data.monthCount || data.selectedMonths?.length || data.billingMonths?.length || 1;
  const selectedMonthList = data.billingMonths || data.selectedMonths || [];
  const billingMonthText =
    selectedMonthList.length > 0
      ? selectedMonthList.join(", ")
      : data.students?.[0]?.month || "";

  const formatN = (num: number) => {
    const rate = data.exchangeRate || 1;
    return (num * rate).toFixed(2);
  };

  const formatC = (num: number) => {
    return `${data.currency} ${formatN(num)}`;
  };

  const normalTotal =
    data.students.reduce((sum, s) => sum + Number(s.regularFee || 0), 0) +
    (data.registrationEntries || []).reduce((sum, r) => sum + r.fullFee, 0);

  const totalSavings = normalTotal - data.finalAmount;
  const savingsPercent = normalTotal > 0 ? (totalSavings / normalTotal) * 100 : 0;
  const hasDiscount = totalSavings > 0.01;

  const totalPayableTxt = data.currency !== "SAR"
    ? `${formatC(data.finalAmount)} (${data.finalAmount.toFixed(2)} SAR)`
    : formatC(data.finalAmount);

  // ===== Page 1 Header =====
  let y = MARGIN;
  try {
    const headerH = await addHeader(doc);
    y = headerH + 7;
  } catch (e) {
    console.error("Header load failed", e);
    y = 25;
  }

  // ===== Title =====
  drawPageTitle(doc, "FEE INVOICE", y);
  y += 11;

  // ===== Info Cards =====
  const cardGap = 10;
  const cardW = (CONTENT_W - cardGap) / 2;
  const cardH = 37;
  const leftCardX = MARGIN;
  const rightCardX = MARGIN + cardW + cardGap;

  drawCard(doc, leftCardX, y, cardW, cardH);
  drawCard(doc, rightCardX, y, cardW, cardH);

  drawCardTitle(doc, "BILL TO", leftCardX + 5, y + 8);
  drawKeyValue(doc, "Parent's Name:", String(data.parentName || ""), leftCardX + 5, y + 17, leftCardX + cardW - 5);
  drawKeyValue(doc, "F.Code:", String(data.fCode || ""), leftCardX + 5, y + 24, leftCardX + cardW - 5);
  drawKeyValue(doc, "Currency:", `${data.currency} (1 SAR = ${data.exchangeRate.toFixed(4)} ${data.currency})`, leftCardX + 5, y + 31, leftCardX + cardW - 5);

  drawCardTitle(doc, "INVOICE DETAILS", rightCardX + 5, y + 8);
  drawKeyValue(doc, "Issued on:", String(data.issuedOn || ""), rightCardX + 5, y + 17, rightCardX + cardW - 5);
  drawKeyValue(doc, "Due Date:", String(data.dueDate || ""), rightCardX + 5, y + 24, rightCardX + cardW - 5, "right", ACCENT_RED);

  const billingCardText = `${monthCount} month(s) - ${billingMonthText}`;
  const billingLines = doc.splitTextToSize(billingCardText, cardW - 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text("Billing Months:", rightCardX + 5, y + 31);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 25, 25);
  doc.text(billingLines, rightCardX + cardW - 5, y + 31, { align: "right" });

  y += cardH + 9;

  // ===== Fee Table =====
  drawSectionHeading(doc, "Fee Breakdown", MARGIN, y);
  y += 6;

  const tableHead = [
    [
      { content: "Reg No", styles: { halign: "left" as const } },
      { content: "Description", styles: { halign: "left" as const } },
      { content: "Grade", styles: { halign: "left" as const } },
      { content: `Regular Fee\n(${data.currency})`, styles: { halign: "right" as const } },
      { content: `After Disc.\n(${data.currency})`, styles: { halign: "right" as const } },
      { content: "Month(s)", styles: { halign: "center" as const } },
      { content: `Amount\n(${data.currency})`, styles: { halign: "right" as const } },
    ],
  ];

  const rows: any[] = [];

  for (const s of data.students) {
    const qtyTxt = s.quantity > 1 ? ` (x${s.quantity})` : "";
    const normalFee = Number(s.regularFee || 0);
    const finalFee = Number(s.finalFee || 0);
    const rowMonthCount = s.monthCount || monthCount;
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
      `${rowMonthCount}`,
      formatN(finalFee),
    ]);
  }

  if (data.registrationEntries && data.registrationEntries.length > 0) {
    for (const reg of data.registrationEntries) {
      const discountTxt = reg.discount > 0 ? `\n(Saved ${formatC(reg.discount)})` : "";
      rows.push([
        "N/A",
        `Registration Fee - ${reg.name}${discountTxt}`,
        "",
        formatN(reg.fullFee),
        reg.discount > 0 ? formatN(reg.netFee) : "-",
        "One-time",
        formatN(reg.netFee),
      ]);
    }
  }

  if (data.programDiscountAmount > 0) {
    const txt = `-${formatC(data.programDiscountAmount)}${data.currency !== "SAR" ? `\n(-${data.programDiscountAmount.toFixed(2)} SAR)` : ""}`;
    rows.push(["", "Program Discount", "", "", "", "", txt]);
  }
  if (data.customDiscountAmount > 0) {
    const txt = `-${formatC(data.customDiscountAmount)}${data.currency !== "SAR" ? `\n(-${data.customDiscountAmount.toFixed(2)} SAR)` : ""}`;
    rows.push(["", "Individual Discounts", "", "", "", "", txt]);
  }
  if (data.enrollmentDiscountAmount > 0) {
    const txt = `-${formatC(data.enrollmentDiscountAmount)}${data.currency !== "SAR" ? `\n(-${data.enrollmentDiscountAmount.toFixed(2)} SAR)` : ""}`;
    rows.push(["", "Enrollment Discount\n(Sibling + Multi-Program)", "", "", "", "", txt]);
  }
  if (data.fixedDiscountAmount > 0) {
    const txt = `-${formatC(data.fixedDiscountAmount)}${data.currency !== "SAR" ? `\n(-${data.fixedDiscountAmount.toFixed(2)} SAR)` : ""}`;
    rows.push(["", "Fixed Discount", "", "", "", "", txt]);
  }

  if (hasDiscount) {
    const savingsTxt = data.currency !== "SAR"
      ? `-${formatC(totalSavings)} (-${totalSavings.toFixed(2)} SAR)`
      : `-${formatC(totalSavings)}`;

    rows.push([
      {
        content: `Total Savings (${savingsPercent.toFixed(1)}% of regular fee)`,
        colSpan: 5,
        styles: { fontStyle: "bold", textColor: GREEN, halign: "right" },
      },
      {
        content: savingsTxt,
        colSpan: 2,
        styles: { fontStyle: "bold", textColor: GREEN, halign: "right" },
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
        styles: { fontStyle: "bold", halign: "right" },
      },
    ]);
  }

  rows.push([
    {
      content: hasDiscount ? "TOTAL PAYABLE (After Discount)" : "TOTAL PAYABLE",
      colSpan: 5,
      styles: { fontStyle: "bold", fontSize: 10, halign: "right" },
    },
    {
      content: totalPayableTxt,
      colSpan: 2,
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
      fontSize: 7.2,
      cellPadding: { top: 3.4, right: 2.5, bottom: 3.4, left: 2.5 },
      halign: "left",
      valign: "middle",
    },

    styles: {
      font: "helvetica",
      fontSize: 7.4,
      cellPadding: { top: 3.2, right: 2.5, bottom: 3.2, left: 2.5 },
      lineWidth: 0,
      textColor: [30, 30, 30],
      valign: "middle",
      overflow: "linebreak",
    },

    alternateRowStyles: {
      fillColor: [250, 251, 254],
    },

    columnStyles: {
      0: { cellWidth: 14, halign: "left" },
      1: { cellWidth: 48, halign: "left" },
      2: { cellWidth: 34, halign: "left" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 22, halign: "right" },
    },

    didParseCell: (hook) => {
      if (hook.section === "body") {
        hook.cell.styles.lineWidth = { bottom: 0.1 };
        hook.cell.styles.lineColor = [224, 228, 236];
      }

      if (hook.section === "body" && hook.row.index === rows.length - 1) {
        hook.cell.styles.fillColor = [242, 246, 255];
        hook.cell.styles.lineWidth = { top: 0.25, bottom: 0.25 };
        hook.cell.styles.lineColor = NAVY;
        hook.cell.styles.textColor = NAVY;
        hook.cell.styles.cellPadding = { top: 3, bottom: 3, right: 3, left: 3 };
      }

      if (hook.section === "body") {
        const cellContent = typeof hook.cell.raw === "string" ? hook.cell.raw : "";
        if (cellContent.startsWith("-")) {
          hook.cell.styles.textColor = GREEN;
          hook.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  y = (doc as any).lastAutoTable?.finalY ?? (y + 50);
  y += 10;

  // ===== Page 1 Bottom Cards =====
  y = ensureSpace(doc, y, 48);

  const noteW = 95;
  const summaryW = 75;
  const noteX = MARGIN;
  const summaryX = PAGE_W - MARGIN - summaryW;
  const bottomCardH = 42;

  drawCard(doc, noteX, y, noteW, bottomCardH, [239, 252, 247]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text("Payment receipt submission form:", noteX + 5, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(45, 60, 75);
  const noteLines = doc.splitTextToSize(
    "This is a reminder from the Accounts Department of Iqra Virtual School. To ensure accurate verification of your fee payment, we kindly request you to fill out the fee receipt submission form.",
    noteW - 10
  );
  doc.text(noteLines, noteX + 5, y + 17);

  drawCard(doc, summaryX, y, summaryW, bottomCardH);
  drawCardTitle(doc, "Invoice Summary", summaryX + 5, y + 8);

  let sy = y + 16;
  const summaryValueX = summaryX + summaryW - 5;

  const normalTotalTxt = data.currency !== "SAR"
    ? `${formatC(normalTotal)} (${normalTotal.toFixed(2)} SAR)`
    : formatC(normalTotal);

  drawKeyValue(doc, "Total (Without Discount)", normalTotalTxt, summaryX + 5, sy, summaryValueX);
  sy += 6;

  if (data.programDiscountAmount > 0) {
    const txt = data.currency !== "SAR"
      ? `-${formatC(data.programDiscountAmount)} (-${data.programDiscountAmount.toFixed(2)} SAR)`
      : `-${formatC(data.programDiscountAmount)}`;
    drawKeyValue(doc, "Program Discount", txt, summaryX + 5, sy, summaryValueX, "right", GREEN);
    sy += 6;
  }

  if (data.customDiscountAmount > 0) {
    const txt = data.currency !== "SAR"
      ? `-${formatC(data.customDiscountAmount)} (-${data.customDiscountAmount.toFixed(2)} SAR)`
      : `-${formatC(data.customDiscountAmount)}`;
    drawKeyValue(doc, "Individual Discounts", txt, summaryX + 5, sy, summaryValueX, "right", GREEN);
    sy += 6;
  }

  if (data.enrollmentDiscountAmount > 0) {
    const txt = data.currency !== "SAR"
      ? `-${formatC(data.enrollmentDiscountAmount)} (-${data.enrollmentDiscountAmount.toFixed(2)} SAR)`
      : `-${formatC(data.enrollmentDiscountAmount)}`;
    drawKeyValue(doc, "Enrollment Discount", txt, summaryX + 5, sy, summaryValueX, "right", GREEN);
    sy += 6;
  }

  if (data.fixedDiscountAmount > 0) {
    const txt = data.currency !== "SAR"
      ? `-${formatC(data.fixedDiscountAmount)} (-${data.fixedDiscountAmount.toFixed(2)} SAR)`
      : `-${formatC(data.fixedDiscountAmount)}`;
    drawKeyValue(doc, "Fixed Discount", txt, summaryX + 5, sy, summaryValueX, "right", GREEN);
    sy += 6;
  }

  if (hasDiscount) {
    const savingsTxt = data.currency !== "SAR"
      ? `-${formatC(totalSavings)} (-${totalSavings.toFixed(2)} SAR)`
      : `-${formatC(totalSavings)}`;
    drawKeyValue(doc, `Total Savings (${savingsPercent.toFixed(1)}%)`, savingsTxt, summaryX + 5, sy, summaryValueX, "right", GREEN);
  }

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(summaryX + 5, y + bottomCardH - 12, summaryW - 10, 9, 1.2, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);

  doc.text(
    "TOTAL PAYABLE",
    summaryX + 8,
    y + bottomCardH - 6.2
  );

  doc.text(
    totalPayableTxt,
    summaryX + summaryW - 8,
    y + bottomCardH - 6.2,
    { align: "right" }
  );

  // ===== Page 2 Payment Information =====
  doc.addPage();
  y = 22;

  drawPageTitle(doc, "PAYMENT INFORMATION", y);
  y += 16;

  const paymentCardW = (CONTENT_W - 12) / 2;
  const paymentCardH = 63;
  const paymentLeftX = MARGIN;
  const paymentRightX = MARGIN + paymentCardW + 12;

  const drawPaymentCardHeader = (x: number, cardY: number, w: number, title: string) => {
    drawCard(doc, x, cardY, w, paymentCardH, [255, 255, 255]);
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.roundedRect(x, cardY, w, 12, 1.8, 1.8, "F");
    doc.rect(x, cardY + 7, w, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title, x + 5, cardY + 7.8);
  };

  drawPaymentCardHeader(paymentLeftX, y, paymentCardW, "IQRA VIRTUALSOLUTIONS");
  drawPaymentCardHeader(paymentRightX, y, paymentCardW, "IVSGLOBAL");

  const drawPaymentLine = (label: string, value: string, x: number, lineY: number, cardW2: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(label, x + 5, lineY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(35, 35, 35);
    const wrappedValue = doc.splitTextToSize(value, cardW2 - 43);
    doc.text(wrappedValue, x + 38, lineY);
    return Math.max(5, wrappedValue.length * 3.5 + 1.5);
  };

  let py = y + 22;
  py += drawPaymentLine("IBAN#:", "PK71MEZN0007810111367793", paymentLeftX, py, paymentCardW);
  py += drawPaymentLine("", "(International Transfers)", paymentLeftX, py, paymentCardW);
  py += drawPaymentLine("A/C #:", "07810111367793 (Local)", paymentLeftX, py, paymentCardW);
  py += drawPaymentLine("Branch Code:", "0781", paymentLeftX, py, paymentCardW);
  py += drawPaymentLine("Bank:", "Meezan Bank Peshawar", paymentLeftX, py, paymentCardW);
  py += drawPaymentLine("", "(Khyber Bazar Branch)", paymentLeftX, py, paymentCardW);
  py += drawPaymentLine("Contact:", "+92 335 524 5551", paymentLeftX, py, paymentCardW);

  py = y + 22;
  py += drawPaymentLine("Bank Name:", "Mashreq Bank", paymentRightX, py, paymentCardW);
  py += drawPaymentLine("IBAN:", "AE620330000019101455931", paymentRightX, py, paymentCardW);
  py += drawPaymentLine("A/C Number:", "019101455931", paymentRightX, py, paymentCardW);
  py += drawPaymentLine("Mobile:", "+971528838128", paymentRightX, py, paymentCardW);
  py += drawPaymentLine("Beneficiary Address:", "Ajman Industrial Area 2,", paymentRightX, py, paymentCardW);
  py += drawPaymentLine("", "Ajman, UAE", paymentRightX, py, paymentCardW);

  y += paymentCardH + 16;

  // ===== QR / Scan Section =====
  const qrBoxH = 47;
  drawCard(doc, MARGIN, y, CONTENT_W, qrBoxH, LIGHT_BG);

  try {
    const scanImg = await urlToDataUrl(SCAN_URL);
    const { w, h } = await getImageSize(scanImg);
    const scanH = 31;
    const scanW = scanH * (w / h);
    doc.addImage(scanImg, detectImgFormat(scanImg), MARGIN + 8, y + 8, scanW, scanH);
  } catch (e) {
    console.error("Scan image failed", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("Payment receipt submission form:", MARGIN + 48, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text("Scan the QR code or use the form link after making payment.", MARGIN + 48, y + 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text("https://forms.gle/W4y3Q1VjyU8cRDvp7", MARGIN + 48, y + 34);

  y += qrBoxH + 16;

  // ===== Instructions =====
  drawSectionHeading(doc, "Instructions:", MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
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
  const instrMaxW = 128;

  for (const item of instrItems) {
    if (item.tick) {
      doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.circle(MARGIN + 2, y - 1.2, 1.1, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    doc.setTextColor(45, 45, 45);

    const wrapped = doc.splitTextToSize(item.text, instrMaxW);
    doc.text(wrapped, MARGIN + 7, y);
    y += wrapped.length * 3.8 + 3;
  }

  // ===== Stamp / Signature =====
  try {
    const stampImg = await urlToDataUrl(STAMP_URL);
    const fmt = detectImgFormat(stampImg);
    const stampW = 45;
    const stampH = 42;
    const stampX = PAGE_W - MARGIN - stampW;
    const stampY = Math.max(instrStartY + 8, PAGE_H - FOOTER_H - stampH - 20);

    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.setLineWidth(0.2);
    doc.line(stampX, stampY + stampH + 3, stampX + stampW, stampY + stampH + 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text("Authorized Signature", stampX + stampW / 2, stampY + stampH + 8, { align: "center" });

    doc.addImage(stampImg, fmt, stampX, stampY, stampW, stampH);
  } catch (e) {
    console.error("Stamp/signature failed", e);

    const stampW = 45;
    const stampX = PAGE_W - MARGIN - stampW;
    const stampY = PAGE_H - FOOTER_H - 35;

    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.setLineWidth(0.2);
    doc.line(stampX, stampY, stampX + stampW, stampY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text("Authorized Signature", stampX + stampW / 2, stampY + 6, { align: "center" });
  }

  // ===== Footer on EVERY page =====
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, settings);
  }

  doc.save(`Invoice_${String(data.parentName || "Parent").replace(/\s+/g, "_")}.pdf`);
};
