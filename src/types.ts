export interface GradeFee {
  id: string;
  name: string;
  fee: number;
  discountedFee: number;
  registrationFee: number;
  registrationDiscountedFee: number;
}

export interface Program {
  id: string;
  name: string;
  pricingType?: 'class' | 'subject' | 'days';
  grades: GradeFee[];
}

// OLD CSR user type — kept for settings compatibility
export interface CSRUser {
  id: string;
  name: string;
  password: string;
  createdAt: string;
}

// NEW: Supabase auth profile
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'csr';
  csr_name: string | null;
}

export interface AppSettings {
  schoolName: string;
  subtitle1: string;
  subtitle2: string;
  subtitle3: string;
  phone: string;
  email: string;
  website: string;
  logoBase64: string;
  programs: Program[];
  selectedCurrency: string;
  exchangeRates: Record<string, number>;
  availableCurrencies: { code: string; label: string }[];
  csrUsers?: CSRUser[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  schoolName: "IQRA VIRTUAL SCHOOL",
  subtitle1: "An online project of",
  subtitle2: "Al Furqan Children Academy",
  subtitle3: "School & College",
  phone: "+92 305 5245551",
  email: "acivs2021@gmail.com",
  website: "iqravirtualschool.com",
  logoBase64: "",
  csrUsers: [],
  programs: [
    {
      id: "prog-regular",
      name: "Regular Schooling",
      pricingType: "class",
      grades: [
        { id: "fs1", name: "FS1", fee: 245, discountedFee: 195, registrationFee: 300, registrationDiscountedFee: 0 },
        { id: "grade-1771934483570", name: "FS2", fee: 245, discountedFee: 195, registrationFee: 300, registrationDiscountedFee: 0 },
        { id: "grade-1771934526713", name: "FS3", fee: 245, discountedFee: 195, registrationFee: 300, registrationDiscountedFee: 0 },
        { id: "grade-1771934531330", name: "Grade 1", fee: 295, discountedFee: 235, registrationFee: 300, registrationDiscountedFee: 0 },
        { id: "grade-1771934542610", name: "Grade 2", fee: 295, discountedFee: 235, registrationFee: 300, registrationDiscountedFee: 0 },
        { id: "grade-1771934546266", name: "Grade 3", fee: 295, discountedFee: 235, registrationFee: 300, registrationDiscountedFee: 0 },
        { id: "grade-1771934550098", name: "Grade 4", fee: 345, discountedFee: 275, registrationFee: 400, registrationDiscountedFee: 0 },
        { id: "grade-1771934553338", name: "Grade 5", fee: 345, discountedFee: 275, registrationFee: 400, registrationDiscountedFee: 0 },
        { id: "grade-1771934559417", name: "Grade 6", fee: 345, discountedFee: 275, registrationFee: 400, registrationDiscountedFee: 0 },
        { id: "grade-1771934565306", name: "Grade 7", fee: 400, discountedFee: 335, registrationFee: 400, registrationDiscountedFee: 0 },
        { id: "grade-1771934570562", name: "Grade 8 (Fed)", fee: 400, discountedFee: 335, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934579057", name: "Grade 9 (Fed)", fee: 400, discountedFee: 335, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934588730", name: "Grade 10 (Fed)", fee: 400, discountedFee: 335, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934595393", name: "Grade 11 (Fed)", fee: 450, discountedFee: 375, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934649474", name: "Grade 12 (Fed)", fee: 450, discountedFee: 375, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934656361", name: "Grade 8 (IGCSE/O Level's)", fee: 450, discountedFee: 375, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934682698", name: "Grade 9 (IGCSE/O Level's)", fee: 450, discountedFee: 375, registrationFee: 500, registrationDiscountedFee: 0 },
        { id: "grade-1771934686985", name: "Grade 10 (IGCSE/O Level's)", fee: 500, discountedFee: 415, registrationFee: 500, registrationDiscountedFee: 0 }
      ]
    },
    {
      id: "prog-1on1",
      name: "1-on-1 Tuition",
      pricingType: "subject",
      grades: [
        { id: "1on1-fs1", name: "FS1", fee: 140, discountedFee: 120, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-fs2", name: "FS2", fee: 140, discountedFee: 120, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-fs3", name: "FS3", fee: 140, discountedFee: 120, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr1", name: "Grade 1", fee: 140, discountedFee: 120, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr2", name: "Grade 2", fee: 140, discountedFee: 120, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr3", name: "Grade 3", fee: 150, discountedFee: 130, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr4", name: "Grade 4", fee: 150, discountedFee: 130, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr5", name: "Grade 5", fee: 150, discountedFee: 130, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr6", name: "Grade 6", fee: 150, discountedFee: 130, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr7", name: "Grade 7", fee: 150, discountedFee: 130, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr8-fed", name: "Grade 8 Fed", fee: 160, discountedFee: 140, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr9-fed", name: "Grade 9 Fed", fee: 160, discountedFee: 140, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr10-fed", name: "Grade 10 Fed", fee: 170, discountedFee: 150, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr11-fed", name: "Grade 11 Fed", fee: 170, discountedFee: 150, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr12-fed", name: "Grade 12 Fed", fee: 170, discountedFee: 150, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr8-igcse", name: "Grade 8 IGCSE", fee: 200, discountedFee: 180, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr9-igcse", name: "Grade 9 IGCSE", fee: 280, discountedFee: 250, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr10-igcse", name: "Grade 10 IGCSE", fee: 280, discountedFee: 250, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr11-igcse", name: "Grade 11 IGCSE", fee: 280, discountedFee: 250, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "1on1-gr12-igcse", name: "Grade 12 IGCSE", fee: 280, discountedFee: 250, registrationFee: 0, registrationDiscountedFee: 0 }
      ]
    },
    {
      id: "prog-quran",
      name: "Quran Program",
      pricingType: "days",
      grades: [
        { id: "quran-basic", name: "Basic Qaida", fee: 22, discountedFee: 22, registrationFee: 0, registrationDiscountedFee: 0 },
        { id: "quran-hifz", name: "Hifz", fee: 22, discountedFee: 22, registrationFee: 0, registrationDiscountedFee: 0 }
      ]
    }
  ],
  selectedCurrency: "SAR",
  exchangeRates: {
    "SAR": 1, "AED": 0.979333, "USD": 0.266667, "EUR": 0.225802,
    "GBP": 0.197382, "PKR": 74.542958, "AUD": 0.376609
  },
  availableCurrencies: [
    { code: "SAR", label: "Saudi Riyal" },
    { code: "USD", label: "US Dollar" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "Pound Sterling" },
    { code: "PKR", label: "Pakistani Rupee" },
    { code: "AED", label: "UAE Dirham" },
    { code: "AUD", label: "Australian Dollar" }
  ]
};
