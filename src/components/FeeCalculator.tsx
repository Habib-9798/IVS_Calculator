import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, GraduationCap, User, BookPlus } from 'lucide-react';
import { generateInvoicePDF } from './InvoiceGenerator';
import { format } from 'date-fns';
import { AppSettings } from '../types';

interface AdditionalProgram {
  id: string;
  programId: string;
  gradeId: string;
  feeType: 'regular' | 'discounted';
  customDiscount: number;
  quantity: number;
  exemptFromGlobalDiscounts: boolean;
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
  exemptFromGlobalDiscounts: boolean;
}

const REGISTRATION_FEE = 200;

type Props = {
  settings: AppSettings;

  siblingDiscount: number;
  setSiblingDiscount: (v: number) => void;

  multiProgramDiscount: number;
  setMultiProgramDiscount: (v: number) => void;

  fixedDiscount: number;
  setFixedDiscount: (v: number) => void;
};

export default function FeeCalculator({
  settings,
  siblingDiscount,
  setSiblingDiscount,
  multiProgramDiscount,
  setMultiProgramDiscount,
  fixedDiscount,
  setFixedDiscount
}: Props) {
  const currentRate = settings.exchangeRates[settings.selectedCurrency] || 1;
  const convert = (amount: number) => amount * currentRate;
  const formatV = (amount: number) => `${settings.selectedCurrency} ${convert(amount).toFixed(2)}`;

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
      registrationDiscount: 50,
      exemptFromGlobalDiscounts: false
    }
  ]);

  const [month, setMonth] = useState(format(new Date(), 'MMMM yyyy'));
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

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
            registrationDiscount: 50,
            exemptFromGlobalDiscounts: false
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

  useEffect(() => {
    const count = students.length;
    let pct = 0;
    if (count === 2) pct = 10;
    else if (count === 3) pct = 15;
    else if (count === 4) pct = 20;
    else if (count >= 5) pct = 25 + (count - 5) * 5;

    if (pct !== siblingDiscount) setSiblingDiscount(pct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.length]);

  useEffect(() => {
    const studentsWithAP = students.filter(s => s.additionalPrograms.length > 0).length;
    let pct = 0;
    if (studentsWithAP === 1) pct = 5;
    else if (studentsWithAP === 2) pct = 10;
    else if (studentsWithAP >= 3) pct = 15;

    if (pct !== multiProgramDiscount) setMultiProgramDiscount(pct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

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
        registrationDiscount: 50,
        exemptFromGlobalDiscounts: false
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
              exemptFromGlobalDiscounts: false,
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
    const program = settings.programs?.find(p => p.id === student.programId);
    const grade = program?.grades.find(g => g.id === student.gradeId);
    if (!grade) return 0;
    return grade.fee * (student.quantity || 1);
  };

  const getStudentActualFee = (student: Student) => {
    const program = settings.programs?.find(p => p.id === student.programId);
    const grade = program?.grades.find(g => g.id === student.gradeId);
    if (!grade) return 0;
    const baseFee = student.feeType === 'discounted' ? grade.discountedFee : grade.fee;
    return baseFee * (student.quantity || 1);
  };

  const getAPRegularFee = (ap: AdditionalProgram) => {
    const program = settings.programs?.find(p => p.id === ap.programId);
    const grade = program?.grades.find(g => g.id === ap.gradeId);
    if (!grade) return 0;
    return grade.fee * (ap.quantity || 1);
  };

  const getAPActualFee = (ap: AdditionalProgram) => {
    const program = settings.programs?.find(p => p.id === ap.programId);
    const grade = program?.grades.find(g => g.id === ap.gradeId);
    if (!grade) return 0;
    const baseFee = ap.feeType === 'discounted' ? grade.discountedFee : grade.fee;
    return baseFee * (ap.quantity || 1);
  };

  const allAPList = students.flatMap(s => s.additionalPrograms);
  const apRegularTotal = allAPList.reduce((sum, ap) => sum + getAPRegularFee(ap), 0);
  const apActualTotal = allAPList.reduce((sum, ap) => sum + getAPActualFee(ap), 0);
  const apCustomDiscountTotal = allAPList.reduce((sum, ap) => sum + (Number(ap.customDiscount) || 0), 0);

  const totalRegularFee = students.reduce((sum, s) => sum + getStudentRegularFee(s), 0) + apRegularTotal;
  const totalActualFee = students.reduce((sum, s) => sum + getStudentActualFee(s), 0) + apActualTotal;
  const programDiscountAmount = totalRegularFee - totalActualFee;

  const customDiscountAmount = students.reduce((sum, s) => sum + (Number(s.customDiscount) || 0), 0) + apCustomDiscountTotal;

  const totalRegistrationFee = students.reduce((sum, s) => {
    let studentReg = 0;
    if (s.includeRegistration && isRegularProgram(s.programId)) {
      studentReg += REGISTRATION_FEE - (REGISTRATION_FEE * (s.registrationDiscount / 100));
    }
    s.additionalPrograms.forEach(ap => {
      if (ap.includeRegistration && isRegularProgram(ap.programId)) {
        studentReg += REGISTRATION_FEE - (REGISTRATION_FEE * (ap.registrationDiscount / 100));
      }
    });
    return sum + studentReg;
  }, 0);

  const feeAfterStudentDiscounts = Math.max(0, totalRegularFee - programDiscountAmount - customDiscountAmount);

  const eligibleFee = (() => {
    let total = 0;
    students.forEach(s => {
      if (!s.exemptFromGlobalDiscounts) {
        const regFee = getStudentRegularFee(s);
        const actFee = getStudentActualFee(s);
        const cDisc = Number(s.customDiscount) || 0;
        total += Math.max(0, regFee - (regFee - actFee) - cDisc);
      }
      s.additionalPrograms.forEach(ap => {
        if (!ap.exemptFromGlobalDiscounts) {
          const apReg = getAPRegularFee(ap);
          const apAct = getAPActualFee(ap);
          const apCDisc = Number(ap.customDiscount) || 0;
          total += Math.max(0, apReg - (apReg - apAct) - apCDisc);
        }
      });
    });
    return total;
  })();

  const siblingDiscountAmount = eligibleFee * (siblingDiscount / 100);
  const multiProgramDiscountAmount = eligibleFee * (multiProgramDiscount / 100);
  const eligibleFixedDiscount = feeAfterStudentDiscounts > 0 ? (eligibleFee / feeAfterStudentDiscounts) * fixedDiscount : fixedDiscount;

  const totalDiscounts =
    programDiscountAmount +
    customDiscountAmount +
    siblingDiscountAmount +
    multiProgramDiscountAmount +
    eligibleFixedDiscount;

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

  const calcFinalFee = (actualFee: number, customDiscount: number, exempt: boolean) => {
    const netFee = Math.max(0, actualFee - (Number(customDiscount) || 0));
    const sibCut = exempt ? 0 : netFee * (siblingDiscount / 100);
    const multiCut = exempt ? 0 : netFee * (multiProgramDiscount / 100);
    const fixedShare = exempt ? 0 : (feeAfterStudentDiscounts > 0 ? (netFee / feeAfterStudentDiscounts) * fixedDiscount : 0);
    return Math.max(0, netFee - sibCut - multiCut - fixedShare);
  };

  const regNet = (include: boolean, discountPct: number, programId: string) => {
    if (!include) return 0;
    if (!isRegularProgram(programId)) return 0;
    return REGISTRATION_FEE - (REGISTRATION_FEE * (Number(discountPct) || 0) / 100);
  };

  const regFull = (include: boolean, programId: string) => {
    if (!include) return 0;
    if (!isRegularProgram(programId)) return 0;
    return REGISTRATION_FEE;
  };

  const handleGenerateInvoice = async () => {
    if (!parentName) {
      alert('Please enter Parent Name');
      return;
    }

    const invoiceData = {
      parentName,
      fCode,
      issuedOn: format(new Date(), 'dd MMM yyyy'),
      dueDate: format(new Date(dueDate), 'dd MMM yyyy'),
      students: [
        ...students.map(s => {
          const program = settings.programs?.find(p => p.id === s.programId);
          const grade = program?.grades.find(g => g.id === s.gradeId);
          const regularFee = getStudentRegularFee(s);
          const discountedFee = getStudentActualFee(s);
          const customDisc = Number(s.customDiscount) || 0;
          const netFee = Math.max(0, discountedFee - customDisc);
          const sibCut = s.exemptFromGlobalDiscounts ? 0 : netFee * (siblingDiscount / 100);
          const multiCut = s.exemptFromGlobalDiscounts ? 0 : netFee * (multiProgramDiscount / 100);
          const fixedShare = s.exemptFromGlobalDiscounts ? 0 : (feeAfterStudentDiscounts > 0 ? (netFee / feeAfterStudentDiscounts) * fixedDiscount : 0);
          const finalFee = Math.max(0, netFee - sibCut - multiCut - fixedShare);
          return {
            name: s.name || 'Student',
            grade: grade ? `${program?.name} - ${grade.name}` : '',
            month: month,
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
            const grade = program?.grades.find(g => g.id === ap.gradeId);
            const regularFee = getAPRegularFee(ap);
            const discountedFee = getAPActualFee(ap);
            const customDisc = Number(ap.customDiscount) || 0;
            const netFee = Math.max(0, discountedFee - customDisc);
            const sibCut = ap.exemptFromGlobalDiscounts ? 0 : netFee * (siblingDiscount / 100);
            const multiCut = ap.exemptFromGlobalDiscounts ? 0 : netFee * (multiProgramDiscount / 100);
            const fixedShare = ap.exemptFromGlobalDiscounts ? 0 : (feeAfterStudentDiscounts > 0 ? (netFee / feeAfterStudentDiscounts) * fixedDiscount : 0);
            const finalFee = Math.max(0, netFee - sibCut - multiCut - fixedShare);
            return {
              name: s.name || 'Student',
              grade: grade ? `${program?.name} - ${grade.name}` : '',
              month: month,
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
          entries.push({
            name: s.name || 'Student',
            fullFee: REGISTRATION_FEE,
            discount: s.registrationDiscount,
            netFee: REGISTRATION_FEE - (REGISTRATION_FEE * s.registrationDiscount / 100)
          });
        }
        s.additionalPrograms.forEach(ap => {
          if (ap.includeRegistration && isRegularProgram(ap.programId)) {
            const apProgram = settings.programs?.find(p => p.id === ap.programId);
            entries.push({
              name: `${s.name || 'Student'} (${apProgram?.name || 'Add-on'})`,
              fullFee: REGISTRATION_FEE,
              discount: ap.registrationDiscount,
              netFee: REGISTRATION_FEE - (REGISTRATION_FEE * ap.registrationDiscount / 100)
            });
          }
        });
        return entries;
      }),
      totalAmount: totalRegularFee + totalRegistrationFee,
      programDiscountAmount,
      customDiscountAmount,
      enrollmentDiscountAmount: siblingDiscountAmount + multiProgramDiscountAmount,
      fixedDiscountAmount: eligibleFixedDiscount,
      finalAmount: finalTotal,
      settings,
      currency: settings.selectedCurrency,
      exchangeRate: currentRate
    };

    await generateInvoicePDF(invoiceData as any);
  };

  const studentTotals = students.map((s, idx) => {
    const mainRegular = getStudentRegularFee(s);
    const apRegular = s.additionalPrograms.reduce((sum, ap) => sum + getAPRegularFee(ap), 0);

    const regFullTotal =
      regFull(s.includeRegistration, s.programId) +
      s.additionalPrograms.reduce((sum, ap) => sum + regFull(ap.includeRegistration, ap.programId), 0);

    const regularTotal = mainRegular + apRegular + regFullTotal;

    const mainPayable = calcFinalFee(getStudentActualFee(s), s.customDiscount, s.exemptFromGlobalDiscounts);
    const apPayable = s.additionalPrograms.reduce(
      (sum, ap) => sum + calcFinalFee(getAPActualFee(ap), ap.customDiscount, ap.exemptFromGlobalDiscounts),
      0
    );

    const regNetTotal =
      regNet(s.includeRegistration, s.registrationDiscount, s.programId) +
      s.additionalPrograms.reduce((sum, ap) => sum + regNet(ap.includeRegistration, ap.registrationDiscount, ap.programId), 0);

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
              <span className="ivs-subtle">Billing</span> <span className="font-semibold text-slate-900">{month}</span>
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
              placeholder="Enter parent name"
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
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Billing Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="ivs-input py-1.5 px-2"
            />
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

        <div className="px-1">
          <div
            className="grid gap-2 items-end text-[9px] font-semibold text-slate-500 uppercase tracking-wide"
            style={{
              gridTemplateColumns: showQtyColumn
                ? "1.1fr 1.2fr 1.1fr 0.7fr 0.85fr 0.8fr 0.8fr 1.15fr 0.45fr 56px"
                : "1.1fr 1.2fr 1.1fr 0.85fr 0.8fr 0.8fr 1.15fr 0.45fr 56px"
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
            <div>Exempt</div>
            <div></div>
          </div>
        </div>

        <div className="mt-1 space-y-1.5">
          {students.map((student, idx) => {
            const selectedProgram = settings.programs?.find(p => p.id === student.programId);
            const regAllowed = isRegularProgram(student.programId);

            const cols = showQtyColumn
              ? "1.1fr 1.2fr 1.1fr 0.7fr 0.85fr 0.8fr 0.8fr 1.15fr 0.45fr 56px"
              : "1.1fr 1.2fr 1.1fr 0.85fr 0.8fr 0.8fr 1.15fr 0.45fr 56px";

            const mainRegular = getStudentRegularFee(student);
            const mainPayable = calcFinalFee(getStudentActualFee(student), student.customDiscount, student.exemptFromGlobalDiscounts);
            const mainRegNet = regNet(student.includeRegistration, student.registrationDiscount, student.programId);

            return (
              <div key={student.id} className="border border-slate-200 rounded-xl bg-white">
                <div className="px-3 py-1 border-b border-slate-200 flex items-center justify-between">
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

                <div className="px-3 py-1.5 border-b border-slate-100">
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

                    <div className="font-semibold text-slate-900 text-sm">{formatV(mainRegular)}</div>
                    <div className="font-semibold text-[#7a1f2b] text-sm">{formatV(mainPayable)}</div>

                    <div>
                      {regAllowed ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={student.includeRegistration}
                              onChange={(e) => updateStudent(student.id, 'includeRegistration', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="relative w-8 h-4 bg-slate-300 rounded-full peer-focus:ring-2 peer-focus:ring-[#7a1f2b]/20 peer-checked:bg-[#7a1f2b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                          </label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={student.registrationDiscount || 0}
                            onChange={(e) => updateStudent(student.id, 'registrationDiscount', Number(e.target.value))}
                            className="ivs-input h-8 py-1 px-2 w-16"
                          />

                          <div className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                            {student.includeRegistration ? formatV(mainRegNet) : formatV(0)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">—</div>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={student.exemptFromGlobalDiscounts}
                          onChange={(e) => updateStudent(student.id, 'exemptFromGlobalDiscounts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-8 h-4 bg-slate-300 rounded-full peer-focus:ring-2 peer-focus:ring-[#7a1f2b]/20 peer-checked:bg-[#7a1f2b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-slate-500">MAIN</span>
                    </div>
                  </div>
                </div>

                {student.additionalPrograms.length > 0 && (
                  <div className="px-3 pb-2">
                    {student.additionalPrograms.map((ap) => {
                      const apProgram = settings.programs?.find(p => p.id === ap.programId);
                      const apRegAllowed = isRegularProgram(ap.programId);

                      const apRegular = getAPRegularFee(ap);
                      const apPayable = calcFinalFee(getAPActualFee(ap), ap.customDiscount, ap.exemptFromGlobalDiscounts);
                      const apRegNet = regNet(ap.includeRegistration, ap.registrationDiscount, ap.programId);

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

                            <div className="font-semibold text-slate-900 text-sm">{formatV(apRegular)}</div>
                            <div className="font-semibold text-[#7a1f2b] text-sm">{formatV(apPayable)}</div>

                            <div>
                              {apRegAllowed ? (
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={ap.includeRegistration}
                                      onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'includeRegistration', e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="relative w-8 h-4 bg-slate-300 rounded-full peer-focus:ring-2 peer-focus:ring-[#7a1f2b]/20 peer-checked:bg-[#7a1f2b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={ap.registrationDiscount || 0}
                                    onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'registrationDiscount', Number(e.target.value))}
                                    className="ivs-input h-8 py-1 px-2 w-16"
                                  />

                                  <div className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                                    {ap.includeRegistration ? formatV(apRegNet) : formatV(0)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400">—</div>
                              )}
                            </div>

                            <div className="flex items-center justify-center">
                              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={ap.exemptFromGlobalDiscounts}
                                  onChange={(e) => updateAdditionalProgram(student.id, ap.id, 'exemptFromGlobalDiscounts', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-8 h-4 bg-slate-300 rounded-full peer-focus:ring-2 peer-focus:ring-[#7a1f2b]/20 peer-checked:bg-[#7a1f2b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                              </label>
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
            <div className="text-[10px] ivs-subtle mt-0.5">Each student payable + overall totals</div>
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