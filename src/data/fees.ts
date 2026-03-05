export interface FeeStructure {
  id: string;
  grade: string;
  singleKidFee: number;
}

export const REGULAR_FEES: FeeStructure[] = [
  { id: 'fs1-fs3', grade: 'FS1 to FS3', singleKidFee: 215 },
  { id: 'grade-1-3', grade: 'Grade 1-3', singleKidFee: 275 },
  { id: 'grade-4-6', grade: 'Grade 4-6', singleKidFee: 325 },
  { id: 'grade-7', grade: 'Grade 7', singleKidFee: 375 },
  { id: 'grade-8-10-fed', grade: 'Grade 8-10 (Fed)', singleKidFee: 375 },
  { id: 'grade-11-12-fed', grade: 'Grade 11-12 (Fed)', singleKidFee: 430 },
  { id: 'grade-8-9', grade: 'Grade 8-9', singleKidFee: 430 },
  { id: 'grade-10', grade: 'Grade 10', singleKidFee: 480 },
];

export const ONE_ON_ONE_FEES: FeeStructure[] = [
  { id: '1on1-kg1-gr2', grade: 'Kg 1 - Grade 2 (1-on-1)', singleKidFee: 120 },
  { id: '1on1-gr3-gr7', grade: 'Grade 3 - Grade 7 (1-on-1)', singleKidFee: 130 },
  { id: '1on1-gr8-gr9-fed', grade: 'Grade 8 & 9 Fed (1-on-1)', singleKidFee: 140 },
  { id: '1on1-gr10-gr12-fed', grade: 'Grade 10 & 12 Fed (1-on-1)', singleKidFee: 150 },
  { id: '1on1-gr8-igcse', grade: 'Grade 8 IGCSE (1-on-1)', singleKidFee: 180 },
  { id: '1on1-gr9-gr12-igcse', grade: 'Grade 9 - 12 IGCSE (1-on-1)', singleKidFee: 250 },
];

export const calculateDiscount = (studentCount: number, totalFee: number) => {
  let percentage = 0;
  if (studentCount === 2) percentage = 0.10;
  else if (studentCount === 3) percentage = 0.15;
  else if (studentCount === 4) percentage = 0.20;
  else if (studentCount === 5) percentage = 0.25;
  else if (studentCount > 5) {
    percentage = 0.25 + ((studentCount - 5) * 0.05);
  }
  
  return {
    percentage,
    amount: totalFee * percentage
  };
};
