import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, GraduationCap, User, BookPlus, ChevronDown, Check } from 'lucide-react';
import { generateInvoicePDF } from './InvoiceGenerator';
import { saveCalculatorEntry } from '../utils/tracking';
import { format } from 'date-fns';
import { AppSettings } from '../types';

interface AdditionalProgram {
  id: string;
  programId: string;
  gradeId: string;
  feeType: 'regular' | 'discounted';
  customDiscount: number;
  quantity: number;
  includeRegistration: boolean;
  registrationDiscount: number;
}

interface Student {
  id: string;
  name: string;
  programId: string;
  gradeId: string;
  feeType: 'regular' | 'discounted';
  customDiscount: number;
  quantity: number;
  additionalPrograms: AdditionalProgram[];
  includeRegistration: boolean;
  registrationDiscount: number;
}

type Props = {
  settings: AppSettings;
  csrName: string;
};

export default function FeeCalculator({ settings, csrName }: Props) {
  const currentRate = settings.exchangeRates[settings.selectedCurrency] || 1;
  const convert = (amount: number) => amount * currentRate;
  const formatV = (amount: number) => `${settings.selectedCurrency} ${convert(amount).toFixed(2)}`;

  const currentYear = new Date().getFullYear();
  const monthOptions = Array.from({ length: 12 }, (_, i) => format(new Date(currentYear, i, 1), 'MMMM yyyy'));

  const [parentName, setParentName] = useState('');
  const [fCode, setFCode] = useState('');

  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: '',
      programId: '',
      gradeId: '',
      feeType: 'regular',
      customDiscount: 0,
      quantity: 1,
      additionalPrograms: [],
      includeRegistration: false,
      registrationDiscount: 50
    }
  ]);

  const [selectedMonths, setSelectedMonths] = useState<string[]>([format(new Date(), 'MMMM yyyy')]);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

  const monthMultiplier = Math.max(1, selectedMonths.length);
  const billingMonthLabel = selectedMonths.length > 0 ? selectedMonths.join(', ') : format(new Date(), 'MMMM yyyy');
  const billingMonthShortLabel =
    selectedMonths.length === 1
      ? selectedMonths[0]
      : `${selectedMonths.length} month(s) selected`;

  const [studentCount, setStudentCount] = useState<number>(students.length);

  useEffect(() => {
    const target = Math.min(10, Math.max(1, Number(studentCount) || 1));

    setStudents(prev => {
      if (target === prev.length) return prev;

      const next = [...prev];

      if (target > next.length) {
        const addN = target - next.length;
        for (let i = 0; i < addN; i++) {
          next.push({
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            programId: '',
            gradeId: '',
            feeType: 'regular',
            customDiscount: 0,
            quantity: 1,
            additionalPrograms: [],
            includeRegistration: false,
            registrationDiscount: 50
          });
        }
        return next;
      }

      return next.slice(0, target);
    });
  }, [studentCount]);

  useEffect(() => {
    if (studentCount !== students.length) setStudentCount(students.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.length]);

  const cleanPercentage = (value: number) => {
    return Math.min(100, Math.max(0, Number(value) || 0));
  };

  const toggleMonth = (monthName: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthName)) {
        const next = prev.filter(m => m !== monthName);
        return next.length > 0 ? next : [monthName];
      }
      return [...prev, monthName];
    });
  };

  const selectFullYear = () => {
    setSelectedMonths(monthOptions);
  };

  const selectCurrentMonthOnly = () => {
    setSelectedMonths([format(new Date(), 'MMMM yyyy')]);
  };

  const addStudent = () => {
    setStudents([
      ...students,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        programId: '',
        gradeId: '',
        feeType: 'regular',
        customDiscount: 0,
        quantity: 1,
        additionalPrograms: [],
        includeRegistration: false,
        registrationDiscount: 50
      }
    ]);
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const isRegularProgram = (programId: string) => {
    const prog = settings.programs?.find(p => p.id === programId);
    return prog?.name?.toLowerCase().includes('regular');
  };

  const getGrade = (programId: string, gradeId: string) => {
    const program = settings.programs?.find(p => p.id === programId);
    return program?.grades.find(g => g.id === gradeId);
  };

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'programId') {
          updated.gradeId = '';
          updated.quantity = 1;
          updated.feeType = 'regular';

          if (!isRegularProgram(value)) {
            updated.includeRegistration = false;
            updated.registrationDiscount = 50;
          }
        }
        return updated;
      }
      return s;
    }));
  };

  const addAdditionalProgram = (studentId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          additionalPrograms: [
            ...s.additionalPrograms,
            {
              id: Math.random().toString(36).substr(2, 9),
              programId: '',
              gradeId: '',
              feeType: 'regular',
              customDiscount: 0,
              quantity: 1,
              includeRegistration: false,
              registrationDiscount: 50
            }
          ]
        };
      }
      return s;
    }));
  };

  const removeAdditionalProgram = (studentId: string, apId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        return { ...s, additionalPrograms: s.additionalPrograms.filter(ap => ap.id !== apId) };
      }
      return s;
    }));
  };

  const updateAdditionalProgram = (studentId: string, apId: string, field: keyof AdditionalProgram, value: any) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          additionalPrograms: s.additionalPrograms.map(ap => {
            if (ap.id === apId) {
              const updated = { ...ap, [field]: value };
              if (field === 'programId') {
                updated.gradeId = '';
                updated.quantity = 1;
                updated.feeType = 'regular';

                if (!isRegularProgram(value)) {
                  updated.includeRegistration = false;
                  updated.registrationDiscount = 50;
                }
              }
              return updated;
            }
            return ap;
          })
        };
      }
      return s;
    }));
  };

  const getStudentRegularFee = (student: Student) => {
    const grade = getGrade(student.programId, student.gradeId);
    if (!grade) return 0;
    return grade.fee * (student.quantity || 1);
  };

  const getStudentActualFee = (student: Student) => {
    const grade = getGrade(student.programId, student.gradeId);
    if (!grade) return 0;
    const baseFee = student.feeType === 'discounted' ? grade.discountedFee : grade.fee;
    return baseFee * (student.quantity || 1);
  };

  const getAPRegularFee = (ap: AdditionalProgram) => {
    const grade = getGrade(ap.programId, ap.gradeId);
    if (!grade) return 0;
    return grade.fee * (ap.quantity || 1);
  };

  const getAPActualFee = (ap: AdditionalProgram) => {
    const grade = getGrade(ap.programId, ap.gradeId);
    if (!grade) return 0;
    const baseFee = ap.feeType === 'discounted' ? grade.discountedFee : grade.fee;
    return baseFee * (ap.quantity || 1);
  };

  const getRegistrationFullFee = (programId: string, gradeId: string) => {
    if (!isRegularProgram(programId)) return 0;
    const grade = getGrade(programId, gradeId);
    return Number((grade as any)?.registrationFee) || 0;
  };

  const getRegistrationNetFee = (programId: string, gradeId: string, discountPct: number) => {
    if (!isRegularProgram(programId)) return 0;
    const fullFee = getRegistrationFullFee(programId, gradeId);
    const safeDiscount = cleanPercentage(discountPct);
    return Math.max(0, fullFee - (fullFee * safeDiscount / 100));
  };

  const hasDiscountedFee = (programId: string, gradeId: string) => {
    const grade = getGrade(programId, gradeId);
    if (!grade) return false;

    const regularFee = Number(grade.fee) || 0;
    const discountedFee = Number(grade.discountedFee) || 0;

    return regularFee > 0 && discountedFee > 0 && discountedFee < regularFee;
  };

  const getDiscountedFeeDisplay = (programId: string, gradeId: string, quantity: number) => {
    const grade = getGrade(programId, gradeId);
    if (!grade) return 0;
    return (Number(grade.discountedFee) || 0) * (quantity || 1);
  };

  const allAPList = students.flatMap(s => s.additionalPrograms);

  const monthlyAPRegularTotal = allAPList.reduce((sum, ap) => sum + getAPRegularFee(ap), 0);
  const monthlyAPActualTotal = allAPList.reduce((sum, ap) => sum + getAPActualFee(ap), 0);
  const monthlyAPCustomDiscountTotal = allAPList.reduce((sum, ap) => sum + (Number(ap.customDiscount) || 0), 0);

  const monthlyRegularFee = students.reduce((sum, s) => sum + getStudentRegularFee(s), 0) + monthlyAPRegularTotal;
  const monthlyActualFee = students.reduce((sum, s) => sum + getStudentActualFee(s), 0) + monthlyAPActualTotal;
  const monthlyProgramDiscountAmount = monthlyRegularFee - monthlyActualFee;
  const monthlyCustomDiscountAmount = students.reduce((sum, s) => sum + (Number(s.customDiscount) || 0), 0) + monthlyAPCustomDiscountTotal;

  const totalRegularFee = monthlyRegularFee * monthMultiplier;
  const programDiscountAmount = monthlyProgramDiscountAmount * monthMultiplier;
  const customDiscountAmount = monthlyCustomDiscountAmount * monthMultiplier;

  const totalRegistrationFee = students.reduce((sum, s) => {
    let studentReg = 0;

    if (s.includeRegistration && isRegularProgram(s.programId)) {
      studentReg += getRegistrationNetFee(s.programId, s.gradeId, s.registrationDiscount);
    }

    s.additionalPrograms.forEach(ap => {
      if (ap.includeRegistration && isRegularProgram(ap.programId)) {
        studentReg += getRegistrationNetFee(ap.programId, ap.gradeId, ap.registrationDiscount);
      }
    });

    return sum + studentReg;
  }, 0);

  const totalDiscounts =
    programDiscountAmount +
    customDiscountAmount;

  const finalTotal = Math.max(0, totalRegularFee - totalDiscounts) + totalRegistrationFee;

  const getPricingType = (programId: string) => {
    const prog = settings.programs?.find(p => p.id === programId);
    return String(prog?.pricingType || 'class').toLowerCase();
  };

  const needsQty = (programId: string) => {
    const pt = getPricingType(programId);
    return pt === 'subject' || pt === 'days';
  };

  const anySubject =
    students.some(s => getPricingType(s.programId) === 'subject') ||
    students.some(s => s.additionalPrograms.some(ap => getPricingType(ap.programId) === 'subject'));

  const anyDays =
    students.some(s => getPricingType(s.programId) === 'days') ||
    students.some(s => s.additionalPrograms.some(ap => getPricingType(ap.programId) === 'days'));

  const showQtyColumn =
    students.some(s => needsQty(s.programId)) ||
    students.some(s => s.additionalPrograms.some(ap => needsQty(ap.programId)));

  const qtyHeaderLabel = anySubject && anyDays
    ? 'No. of Subjects / Days'
    : anySubject
      ? 'No. of Subjects'
      : anyDays
        ? 'No. of Days'
        : '';

  const studentGridColumns = showQtyColumn
    ? "1.05fr 1.15fr 1.05fr 0.65fr 0.75fr 0.95fr 0.75fr 2.05fr 56px"
    : "1.05fr 1.15fr 1.05fr 0.75fr 0.95fr 0.75fr 2.05fr 56px";

  const calcFinalFee = (actualFee: number, customDiscount: number) => {
    return Math.max(0, actualFee - (Number(customDiscount) || 0));
  };

  const regNet = (include: boolean, programId: string, gradeId: string, discountPct: number) => {
    if (!include) return 0;
    return getRegistrationNetFee(programId, gradeId, discountPct);
  };

  const regFull = (include: boolean, programId: string, gradeId: string) => {
    if (!include) return 0;
    return getRegistrationFullFee(programId, gradeId);
  };

  const renderFeeTypeCheckbox = (
    allowed: boolean,
    checked: boolean,
    regularAmount: number,
    discountedAmount: number,
    onToggle: (value: boolean) => void
  ) => {
    return (
      <div className="flex items-start gap-2 min-w-[155px]">
        <input
          type="checkbox"
          checked={checked}
          disabled={!allowed}
          onChange={(e) => onToggle(e.target.checked)}
          className={`mt-[3px] h-4 w-4 rounded border-slate-300 accent-[#7a1f2b] ${
            allowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
          title={allowed ? 'Use discounted fee' : 'Discounted fee is not available for this grade'}
        />

        <div className="leading-tight">
          <div className="font-semibold text-slate-900 text-sm whitespace-nowrap">
            {formatV(regularAmount)}
          </div>

          <div
            className={`text-[10px] font-bold whitespace-nowrap ${
              allowed ? 'text-[#7a1f2b]' : 'text-slate-400'
            }`}
          >
            Disc {formatV(allowed ? discountedAmount : 0)}
          </div>
        </div>
      </div>
    );
  };

  const renderRegistrationBox = (
    allowed: boolean,
    checked: boolean,
    discountValue: number,
    payableAmount: number,
    onToggle: (value: boolean) => void,
    onDiscountChange: (value: number) => void
  ) => {
    const safeDiscount = cleanPercentage(discountValue ?? 50);

    return (
      <div className="w-full min-w-[260px] flex items-center gap-2">
        <label
          className={`relative inline-flex items-center shrink-0 ${
            allowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
          title={allowed ? 'Include registration fee' : 'Registration is only available for regular programs'}
        >
          <input
            type="checkbox"
            checked={checked}
            disabled={!allowed}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-8 h-4 bg-slate-300 rounded-full peer-focus:ring-2 peer-focus:ring-[#7a1f2b]/20 peer-checked:bg-[#7a1f2b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
        </label>

        <div className={`flex items-center gap-1 shrink-0 ${allowed ? '' : 'opacity-50'}`}>
          <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
            Disc
          </span>

          <div className="relative w-[72px] shrink-0">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={safeDiscount}
              disabled={!allowed}
              onChange={(e) => onDiscountChange(cleanPercentage(Number(e.target.value)))}
              className="ivs-input h-8 py-1 pl-2 pr-6 w-full text-[12px] font-bold bg-white text-slate-900 border-slate-300"
              title="Registration fee discount percentage"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 pointer-events-none">
              %
            </span>
          </div>
        </div>

        <div className="min-w-[88px] text-[11px] font-bold text-[#7a1f2b] whitespace-nowrap">
          {checked && allowed ? formatV(payableAmount) : formatV(0)}
        </div>
      </div>
    );
  };

  const handleGenerateInvoice = async () => {
    const invoiceData = {
      parentName: parentName || 'Parent',
      fCode,
      issuedOn: format(new Date(), 'dd MMM yyyy'),
      dueDate: format(new Date(dueDate), 'dd MMM yyyy'),
      monthCount: monthMultiplier,
      selectedMonths,
      billingMonths: selectedMonths,
      students: [
        ...students.map(s => {
          const program = settings.programs?.find(p => p.id === s.programId);
          const grade = getGrade(s.programId, s.gradeId);
          const regularFee = getStudentRegularFee(s) * monthMultiplier;
          const discountedFee = getStudentActualFee(s) * monthMultiplier;
          const customDisc = (Number(s.customDiscount) || 0) * monthMultiplier;
          const finalFee = Math.max(0, discountedFee - customDisc);

          return {
            name: s.name || 'Student',
            grade: grade ? `${program?.name} - ${grade.name}` : '',
            month: billingMonthLabel,
            months: selectedMonths,
            monthCount: monthMultiplier,
            amount: regularFee,
            regularFee: regularFee,
            discountedFee: discountedFee,
            finalFee: finalFee,
            quantity: s.quantity || 1,
            pricingType: program?.pricingType || 'class'
          };
        }),
        ...students.flatMap(s =>
          s.additionalPrograms.map(ap => {
            const program = settings.programs?.find(p => p.id === ap.programId);
            const grade = getGrade(ap.programId, ap.gradeId);
            const regularFee = getAPRegularFee(ap) * monthMultiplier;
            const discountedFee = getAPActualFee(ap) * monthMultiplier;
            const customDisc = (Number(ap.customDiscount) || 0) * monthMultiplier;
            const finalFee = Math.max(0, discountedFee - customDisc);

            return {
              name: s.name || 'Student',
              grade: grade ? `${program?.name} - ${grade.name}` : '',
              month: billingMonthLabel,
              months: selectedMonths,
              monthCount: monthMultiplier,
              amount: regularFee,
              regularFee: regularFee,
              discountedFee: discountedFee,
              finalFee: finalFee,
              quantity: ap.quantity || 1,
              pricingType: program?.pricingType || 'class'
            };
          })
        )
      ].filter(s => s.regularFee > 0),
      registrationEntries: students.flatMap(s => {
        const entries: any[] = [];

        if (s.includeRegistration && isRegularProgram(s.programId)) {
          const fullFee = getRegistrationFullFee(s.programId, s.gradeId);
          const netFee = getRegistrationNetFee(s.programId, s.gradeId, s.registrationDiscount);

          entries.push({
            name: s.name || 'Student',
            fullFee,
            discount: Math.max(0, fullFee - netFee),
            discountPercent: cleanPercentage(s.registrationDiscount),
            netFee
          });
        }

        s.additionalPrograms.forEach(ap => {
          if (ap.includeRegistration && isRegularProgram(ap.programId)) {
            const apProgram = settings.programs?.find(p => p.id === ap.programId);
            const fullFee = getRegistrationFullFee(ap.programId, ap.gradeId);
            const netFee = getRegistrationNetFee(ap.programId, ap.gradeId, ap.registrationDiscount);

            entries.push({
              name: `${s.name || 'Student'} (${apProgram?.name || 'Add-on'})`,
              fullFee,
              discount: Math.max(0, fullFee - netFee),
              discountPercent: cleanPercentage(ap.registrationDiscount),
              netFee
            });
          }
        });

        return entries;
      }),
      totalAmount: totalRegularFee + totalRegistrationFee,
      programDiscountAmount,
      customDiscountAmount,
      enrollmentDiscountAmount: 0,
      fixedDiscountAmount: 0,
      finalAmount: finalTotal,
      settings,
      currency: settings.selectedCurrency,
      exchangeRate: currentRate
    };

    const trackingEntry = {
  parentName: invoiceData.parentName,
  fCode: invoiceData.fCode,
  issuedOn: invoiceData.issuedOn,
  dueDate: invoiceData.dueDate,
  monthCount: invoiceData.monthCount,
  selectedMonths: invoiceData.selectedMonths,
  billingMonths: invoiceData.billingMonths,
  students: invoiceData.students,
  registrationEntries: invoiceData.registrationEntries,
  totalAmount: invoiceData.totalAmount,
  programDiscountAmount: invoiceData.programDiscountAmount,
  customDiscountAmount: invoiceData.customDiscountAmount,
  enrollmentDiscountAmount: invoiceData.enrollmentDiscountAmount,
  fixedDiscountAmount: invoiceData.fixedDiscountAmount,
  finalAmount: invoiceData.finalAmount,
  currency: invoiceData.currency,
  exchangeRate: invoiceData.exchangeRate
};

try {
  await saveCalculatorEntry({
    csrName,
    entry: trackingEntry
  });
} catch (error) {
  console.error("Failed to save calculator entry:", error);
  alert("The invoice data could not be saved. The PDF was not generated. Please check the internet connection and try again.");
  return;
}

await generateInvoicePDF(invoiceData as any);
  };

  const studentTotals = students.map((s, idx) => {
    const mainRegular = getStudentRegularFee(s) * monthMultiplier;
    const apRegular = s.additionalPrograms.reduce((sum, ap) => sum + (getAPRegularFee(ap) * monthMultiplier), 0);

    const regFullTotal =
      regFull(s.includeRegistration, s.programId, s.gradeId) +
      s.additionalPrograms.reduce((sum, ap) => sum + regFull(ap.includeRegistration, ap.programId, ap.gradeId), 0);

    const regularTotal = mainRegular + apRegular + regFullTotal;

    const mainPayable = calcFinalFee(getStudentActualFee(s), s.customDiscount) * monthMultiplier;
    const apPayable = s.additionalPrograms.reduce(
      (sum, ap) => sum + (calcFinalFee(getAPActualFee(ap), ap.customDiscount) * monthMultiplier),
      0
    );

    const regNetTotal =
      regNet(s.includeRegistration, s.programId, s.gradeId, s.registrationDiscount) +
      s.additionalPrograms.reduce((sum, ap) => sum + regNet(ap.includeRegistration, ap.programId, ap.gradeId, ap.registrationDiscount), 0);

    const payableTotal = mainPayable + apPayable + regNetTotal;

    const discountTotal = Math.max(0, regularTotal - payableTotal);

    return {
      key: s.id,
      label: s.name?.trim() ? s.name.trim() : `Student ${idx + 1}`,
      regularTotal,
      discountTotal,
      payableTotal
    };
  });

  const overallRegularTotal = studentTotals.reduce((sum, x) => sum + x.regularTotal, 0);
  const overallDiscountTotal = studentTotals.reduce((sum, x) => sum + x.discountTotal, 0);
  const overallPayableTotal = studentTotals.reduce((sum, x) => sum + x.payableTotal, 0);

  return (
    <div className="w-full space-y-2">
      <div className="ivs-card p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-[#7a1f2b]" />
            <h2 className="text-sm font-semibold text-slate-900">Parent & Billing</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="ivs-pill py-0.5">
              <span className="ivs-subtle">Billing</span> <span className="font-semibold text-slate-900">{selectedMonths.length} month(s)</span>
            </span>
            <span className="ivs-pill py-0.5">
              <span className="ivs-subtle">Due</span> <span className="font-semibold text-slate-900">{dueDate}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Parent Name</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="ivs-input py-1.5 px-2"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Family Code (F.Code)</label>
            <input
              type="text"
              value={fCode}
              onChange={(e) => setFCode(e.target.value)}
              className="ivs-input py-1.5 px-2"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">No. of Students</label>
            <select
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="ivs-select py-1.5 px-2"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Billing Month</label>
            <button
              type="button"
              onClick={() => setIsMonthDropdownOpen(prev => !prev)}
              className="ivs-input py-1.5 px-2 w-full flex items-center justify-between text-left"
            >
              <span className="truncate">{billingMonthShortLabel}</span>
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute z-30 mt-1 w-[360px] right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Select Billing Months</div>
                    <div className="text-[10px] text-slate-500">{selectedMonths.length} month(s) selected</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={selectCurrentMonthOnly}
                      className="ivs-btn ivs-btn-ghost px-2 py-1 text-[11px]"
                    >
                      Current
                    </button>
                    <button
                      type="button"
                      onClick={selectFullYear}
                      className="ivs-btn ivs-btn-primary px-2 py-1 text-[11px]"
                    >
                      Full Year
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {monthOptions.map(monthName => {
                    const checked = selectedMonths.includes(monthName);

                    return (
                      <label
                        key={monthName}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border text-[12px] font-semibold cursor-pointer ${
                          checked
                            ? 'bg-[#7a1f2b] border-[#7a1f2b] text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{monthName.replace(` ${currentYear}`, '')}</span>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          checked ? 'border-white bg-white text-[#7a1f2b]' : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMonth(monthName)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsMonthDropdownOpen(false)}
                    className="ivs-btn ivs-btn-ghost px-3 py-1 text-[12px]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="ivs-input py-1.5 px-2"
            />
          </div>
        </div>
      </div>

      <div className="ivs-card p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4.5 h-4.5 text-[#7a1f2b]" />
            <h2 className="text-sm font-semibold text-slate-900">Students</h2>
          </div>

          <button type="button" onClick={addStudent} className="ivs-btn ivs-btn-primary px-3 py-1.5 text-[13px]">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        <div className="px-1 overflow-x-auto">
          <div
            className="grid gap-2 items-end text-[9px] font-semibold text-slate-500 uppercase tracking-wide min-w-[1280px]"
            style={{
              gridTemplateColumns: studentGridColumns
            }}
          >
            <div>Student</div>
            <div>Program</div>
            <div>Grade/Level</div>
            {showQtyColumn && <div>{qtyHeaderLabel}</div>}
            <div>Ind. Discount</div>
            <div>Regular</div>
            <div>Payable</div>
            <div>Registration</div>
            <div></div>
          </div>
        </div>

        <div className="mt-1 space-y-1.5">
          {students.map((student, idx) => {
            const selectedProgram = settings.programs?.find(p => p.id === student.programId);
            const regAllowed = isRegularProgram(student.programId);

            const cols = studentGridColumns;

            const mainRegularMonthly = getStudentRegularFee(student);
            const mainActualMonthly = getStudentActualFee(student);
            const mainRegular = mainRegularMonthly * monthMultiplier;
            const mainActual = mainActualMonthly * monthMultiplier;
            const mainPayable = calcFinalFee(mainActualMonthly, student.customDiscount) * monthMultiplier;
            const mainRegNet = regNet(student.includeRegistration, student.programId, student.gradeId, student.registrationDiscount);
            const mainDiscountAllowed = Boolean(hasDiscountedFee(student.programId, student.gradeId));
            const mainDiscountedDisplay = getDiscountedFeeDisplay(student.programId, student.gradeId, student.quantity) * monthMultiplier;

            return (
              <div key={student.id} className="border border-slate-200 rounded-xl bg-white overflow-x-auto">
                <div className="px-3 py-1 border-b border-slate-200 flex items-center justify-between min-w-[1280px]">
                  <div className="flex items-center gap-2">
                    <span className="ivs-pill px-2 py-0.5">Student {idx + 1}</span>
                    <span className="text-sm font-semibold text-slate-900">{student.name?.trim() ? student.name.trim() : '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addAdditionalProgram(student.id)}
                      className="ivs-btn ivs-btn-ghost px-3 py-1.5 text-[13px]"
                    >
                      <BookPlus className="w-4 h-4" />
                      Add Row
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStudent(student.id)}
                      className="ivs-btn ivs-btn-ghost px-3 py-1.5 text-[13px]"
                      title="Remove student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-3 py-1.5 border-b border-slate-100 min-w-[1280px]">
                  <div className="grid gap-2 items-center" style={{ gridTemplateColumns: cols }}>
                    <div>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                        className="ivs-input py-1.5 px-2"
                        placeholder={`Student ${idx + 1} name`}
                      />
                    </div>

                    <div>
                      <select
                        value={student.programId}
                        onChange={(e) => updateStudent(student.id, 'programId', e.target.value)}
                        className="ivs-select py-1.5 px-2"
                      >
                        <option value="">Select Program</option>
                        {(settings.programs || []).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={student.gradeId}
                        onChange={(e) => updateStudent(student.id, 'gradeId', e.target.value)}
                        className="ivs-select py-1.5 px-2"
                        disabled={!student.programId}
                      >
                        <option value="">Select Grade</option>
                        {selectedProgram?.grades.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>

                    {showQtyColumn && (
                      <div>
                        {needsQty(student.programId) ? (
                          <input
                            type="number"
                            min="1"
                            value={student.quantity || 1}
                            onChange={(e) => updateStudent(student.id, 'quantity', Number(e.target.value))}
                            className="ivs-input py-1.5 px-2"
                          />
                        ) : (
                          <input className="ivs-input py-1.5 px-2 bg-slate-50" disabled value="—" />
                        )}
                      </div>
                    )}

                    <div>
                      <input
                        type="number"
                        min="0"
                        value={student.customDiscount || 0}
                        onChange={(e) => updateStudent(student.id, 'customDiscount', Number(e.target.value))}
                        className="ivs-input py-1.5 px-2"
                      />
                    </div>

                    <div>
                      {renderFeeTypeCheckbox(
                        mainDiscountAllowed,
                        student.feeType === 'discounted',
                        mainRegular,
                        mainDiscountedDisplay,
                        (value) => updateStudent(student.id, 'feeType', value ? 'discounted' : 'regular')
                      )}
                    </div>

                    <div className="font-semibold text-[#7a1f2b] text-sm">{formatV(mainPayable)}</div>

                    <div className="overflow-visible">
                      {renderRegistrationBox(
                        regAllowed,
                        student.includeRegistration,
                        student.registrationDiscount,
                        mainRegNet,
                        (value) => updateStudent(student.id, 'includeRegistration', value),
                        (value) => updateStudent(student.id, 'registrationDiscount', value)
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-slate-500">MAIN</span>
                    </div>
                  </div>
                </div>

                {student.additionalPrograms.length > 0 && (
                  <div className="px-3 pb-2 min-w-[1280px]">
                    {student.additionalPrograms.map((ap) => {
                      const apProgram = settings.programs?.find(p => p.id === ap.programId);
                      const apRegAllowed = isRegularProgram(ap.programId);

                      const apRegularMonthly = getAPRegularFee(ap);
                      const apActualMonthly = getAPActualFee(ap);
                      const apRegular = apRegularMonthly * monthMultiplier;
                      const apPayable = calcFinalFee(apActualMonthly, ap.customDiscount) * monthMultiplier;
                      const apRegNet = regNet(ap.includeRegistration, ap.programId, ap.gradeId, ap.registrationDiscount);
                      const apDiscountAllowed = Boolean(hasDiscountedFee(ap.programId, ap.gradeId));
                      const apDiscountedDisplay = getDiscountedFeeDisplay(ap.programId, ap.gradeId, ap.quantity) * monthMultiplier;

                      return (
                        <div key={ap.id} className="pt-1.5">
                          <div className="grid gap-2 items-center" style={{ gridTemplateColumns: cols }}>
                            <div>
                              <input type="text" value={student.name} disabled className="ivs-input py-1.5 px-2 bg-slate-50" />
                            </div>

                            <div>
                              <select
                                value={ap.programId}
                                onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'programId', e.target.value)}
                                className="ivs-select py-1.5 px-2"
                              >
                                <option value="">Select Program</option>
                                {(settings.programs || []).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <select
                                value={ap.gradeId}
                                onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'gradeId', e.target.value)}
                                className="ivs-select py-1.5 px-2"
                                disabled={!ap.programId}
                              >
                                <option value="">Select Grade</option>
                                {apProgram?.grades.map(g => (
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                            </div>

                            {showQtyColumn && (
                              <div>
                                {needsQty(ap.programId) ? (
                                  <input
                                    type="number"
                                    min="1"
                                    value={ap.quantity || 1}
                                    onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'quantity', Number(e.target.value))}
                                    className="ivs-input py-1.5 px-2"
                                  />
                                ) : (
                                  <input className="ivs-input py-1.5 px-2 bg-slate-50" disabled value="—" />
                                )}
                              </div>
                            )}

                            <div>
                              <input
                                type="number"
                                min="0"
                                value={ap.customDiscount || 0}
                                onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'customDiscount', Number(e.target.value))}
                                className="ivs-input py-1.5 px-2"
                              />
                            </div>

                            <div>
                              {renderFeeTypeCheckbox(
                                apDiscountAllowed,
                                ap.feeType === 'discounted',
                                apRegular,
                                apDiscountedDisplay,
                                (value) => updateAdditionalProgram(student.id, ap.id, 'feeType', value ? 'discounted' : 'regular')
                              )}
                            </div>

                            <div className="font-semibold text-[#7a1f2b] text-sm">{formatV(apPayable)}</div>

                            <div className="overflow-visible">
                              {renderRegistrationBox(
                                apRegAllowed,
                                ap.includeRegistration,
                                ap.registrationDiscount,
                                apRegNet,
                                (value) => updateAdditionalProgram(student.id, ap.id, 'includeRegistration', value),
                                (value) => updateAdditionalProgram(student.id, ap.id, 'registrationDiscount', value)
                              )}
                            </div>

                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeAdditionalProgram(student.id, ap.id)}
                                className="ivs-btn ivs-btn-ghost px-3 py-1.5 text-[13px]"
                                title="Remove program row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ivs-card p-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Final Summary</h2>
            <div className="text-[10px] ivs-subtle mt-0.5">
              Each student payable + overall totals for {selectedMonths.length} month(s)
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={finalTotal === 0}
            className="bg-[#7a1f2b] hover:bg-[#651a23] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-[13px]"
          >
            <FileText className="w-5 h-5" />
            Generate Invoice PDF
          </button>
        </div>

        <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 bg-slate-50 px-3 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-6">Student</div>
            <div className="col-span-2 text-right">Regular</div>
            <div className="col-span-2 text-right">Discount</div>
            <div className="col-span-2 text-right">Payable</div>
          </div>

          {studentTotals.map((s) => (
            <div key={s.key} className="grid grid-cols-12 gap-2 px-3 py-1.5 border-t border-slate-200">
              <div className="col-span-6 font-semibold text-slate-900">{s.label}</div>
              <div className="col-span-2 text-right font-semibold text-slate-900">{formatV(s.regularTotal)}</div>
              <div className="col-span-2 text-right font-semibold text-slate-900">-{formatV(s.discountTotal)}</div>
              <div className="col-span-2 text-right font-bold text-[#7a1f2b]">{formatV(s.payableTotal)}</div>
            </div>
          ))}

          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 border-t border-slate-200 bg-white">
            <div className="col-span-6 font-bold text-slate-900">Overall Total</div>
            <div className="col-span-2 text-right font-bold text-slate-900">{formatV(overallRegularTotal)}</div>
            <div className="col-span-2 text-right font-bold text-slate-900">-{formatV(overallDiscountTotal)}</div>
            <div className="col-span-2 text-right font-extrabold text-[#7a1f2b]">{formatV(overallPayableTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}