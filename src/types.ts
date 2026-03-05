export interface GradeFee {
  id: string;
  name: string;
  fee: number;
  discountedFee: number;
}

export interface Program {
  id: string;
  name: string;
  pricingType?: 'class' | 'subject' | 'days';
  grades: GradeFee[];
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
}

export const DEFAULT_SETTINGS: AppSettings = {
  "schoolName": "IQRA VIRTUAL SCHOOL",
  "subtitle1": "An online project of",
  "subtitle2": "Al Furqan Children Academy",
  "subtitle3": "School & College",
  "phone": "+92 305 5245551",
  "email": "acivs2021@gmail.com",
  "website": "iqravirtualschool.com",
  "logoBase64": "",
  "programs": [
    {
      "id": "prog-regular",
      "name": "Regular Schooling",
      "pricingType": "class",
      "grades": [
        {
          "id": "fs1",
          "name": "FS1 ",
          "fee": 245,
          "discountedFee": 195
        },
        {
          "id": "grade - 1771934483570 ",
          "name": "FS2",
          "fee": 245,
          "discountedFee": 195
        },
        {
          "id": "grade - 1771934526713 ",
          "name": "FS3",
          "fee": 245,
          "discountedFee": 195
        },
        {
          "id": "grade - 1771934531330 ",
          "name": "Grade 1",
          "fee": 295,
          "discountedFee": 235
        },
        {
          "id": "grade - 1771934542610 ",
          "name": "Grade 2",
          "fee": 295,
          "discountedFee": 235
        },
        {
          "id": "grade - 1771934546266 ",
          "name": "Grade 3",
          "fee": 295,
          "discountedFee": 235
        },
        {
          "id": "grade - 1771934550098 ",
          "name": "Grade 4",
          "fee": 345,
          "discountedFee": 275
        },
        {
          "id": "grade - 1771934553338 ",
          "name": "Grade 5",
          "fee": 345,
          "discountedFee": 275
        },
        {
          "id": "grade - 1771934559417 ",
          "name": "Grade 6",
          "fee": 345,
          "discountedFee": 275
        },
        {
          "id": "grade - 1771934565306 ",
          "name": "Grade 7",
          "fee": 400,
          "discountedFee": 335
        },
        {
          "id": "grade - 1771934570562 ",
          "name": "Grade 8 (Fed)",
          "fee": 400,
          "discountedFee": 335
        },
        {
          "id": "grade - 1771934579057 ",
          "name": "Grade 9 (Fed)",
          "fee": 400,
          "discountedFee": 335
        },
        {
          "id": "grade - 1771934588730 ",
          "name": "Grade 10 (Fed)",
          "fee": 400,
          "discountedFee": 335
        },
        {
          "id": "grade - 1771934595393 ",
          "name": "Grade 11 (Fed)",
          "fee": 450,
          "discountedFee": 375
        },
        {
          "id": "grade - 1771934649474 ",
          "name": "Grade 12 (Fed)",
          "fee": 450,
          "discountedFee": 375
        },
        {
          "id": "grade - 1771934656361 ",
          "name": "Grade 8 (IGCSE/O Level's)",
          "fee": 450,
          "discountedFee": 375
        },
        {
          "id": "grade - 1771934682698 ",
          "name": "Grade 9 (IGCSE/O Level's)",
          "fee": 450,
          "discountedFee": 375
        },
        {
          "id": "grade - 1771934686985 ",
          "name": "Grade 10 (IGCSE/O Level's)",
          "fee": 500,
          "discountedFee": 415
        }
      ]
    },
    {
      "id": "prog-1on1",
      "name": "1-on-1 Tuition",
      "pricingType": "subject",
      "grades": [
        {
          "id": "1on1-fs1",
          "name": "FS1",
          "fee": 140,
          "discountedFee": 120
        },
        {
          "id": "1on1-fs2",
          "name": "FS2",
          "fee": 140,
          "discountedFee": 120
        },
        {
          "id": "1on1-fs3",
          "name": "FS3",
          "fee": 140,
          "discountedFee": 120
        },
        {
          "id": "1on1-gr1",
          "name": "Grade 1",
          "fee": 140,
          "discountedFee": 120
        },
        {
          "id": "1on1-gr2",
          "name": "Grade 2",
          "fee": 140,
          "discountedFee": 120
        },
        {
          "id": "1on1-gr3",
          "name": "Grade 3",
          "fee": 150,
          "discountedFee": 130
        },
        {
          "id": "1on1-gr4",
          "name": "Grade 4",
          "fee": 150,
          "discountedFee": 130
        },
        {
          "id": "1on1-gr5",
          "name": "Grade 5",
          "fee": 150,
          "discountedFee": 130
        },
        {
          "id": "1on1-gr6",
          "name": "Grade 6",
          "fee": 150,
          "discountedFee": 130
        },
        {
          "id": "1on1-gr7",
          "name": "Grade 7",
          "fee": 150,
          "discountedFee": 130
        },
        {
          "id": "1on1-gr8-fed",
          "name": "Grade 8 Fed",
          "fee": 160,
          "discountedFee": 140
        },
        {
          "id": "1on1-gr9-fed",
          "name": "Grade 9 Fed",
          "fee": 160,
          "discountedFee": 140
        },
        {
          "id": "1on1-gr10-fed",
          "name": "Grade 10 Fed",
          "fee": 170,
          "discountedFee": 150
        },
        {
          "id": "1on1-gr11-fed",
          "name": "Grade 11 Fed",
          "fee": 170,
          "discountedFee": 150
        },
        {
          "id": "1on1-gr12-fed",
          "name": "Grade 12 Fed",
          "fee": 170,
          "discountedFee": 150
        },
        {
          "id": "1on1-gr8-igcse",
          "name": "Grade 8 IGCSE",
          "fee": 200,
          "discountedFee": 180
        },
        {
          "id": "1on1-gr9-igcse",
          "name": "Grade 9 IGCSE",
          "fee": 280,
          "discountedFee": 250
        },
        {
          "id": "1on1-gr10-igcse",
          "name": "Grade 10 IGCSE",
          "fee": 280,
          "discountedFee": 250
        },
        {
          "id": "1on1-gr11-igcse",
          "name": "Grade 11 IGCSE",
          "fee": 280,
          "discountedFee": 250
        },
        {
          "id": "1on1-gr12-igcse",
          "name": "Grade 12 IGCSE",
          "fee": 280,
          "discountedFee": 250
        }
      ]
    },
    {
      "id": "prog-quran",
      "name": "Quran Program",
      "pricingType": "days",
      "grades": [
        {
          "id": "quran-basic",
          "name": "Basic Qaida",
          "fee": 22,
          "discountedFee": 22
        },
        {
          "id": "quran-hifz",
          "name": "Hifz",
          "fee": 22,
          "discountedFee": 22
        }
      ]
    }
  ],
  "selectedCurrency": "SAR",
  "exchangeRates": {
    "SAR": 1,
    "AED": 0.979333,
    "AFN": 16.805616,
    "ALL": 21.817726,
    "AMD": 100.45324,
    "ANG": 0.477333,
    "AOA": 245.450433,
    "ARS": 387.266667,
    "AUD": 0.376609,
    "AWG": 0.477333,
    "AZN": 0.453352,
    "BAM": 0.441628,
    "BBD": 0.533333,
    "BDT": 32.603427,
    "BGN": 0.441628,
    "BHD": 0.100267,
    "BIF": 791.270846,
    "BMD": 0.266667,
    "BND": 0.337671,
    "BOB": 1.84684,
    "BRL": 1.387365,
    "BSD": 0.266667,
    "BTN": 24.230696,
    "BWP": 3.528755,
    "BYN": 0.761598,
    "BZD": 0.533333,
    "CAD": 0.364327,
    "CDF": 614.583925,
    "CHF": 0.206262,
    "CLF": 0.005843,
    "CLP": 230.934163,
    "CNH": 1.8384,
    "CNY": 1.842992,
    "COP": 987.631541,
    "CRC": 127.851102,
    "CUP": 6.4,
    "CVE": 24.897951,
    "CZK": 5.474172,
    "DJF": 47.392267,
    "DKK": 1.684562,
    "DOP": 16.398994,
    "DZD": 34.702145,
    "EGP": 12.718485,
    "ERN": 4,
    "ETB": 41.393241,
    "EUR": 0.225802,
    "FJD": 0.589583,
    "FKP": 0.197382,
    "FOK": 1.686113,
    "GBP": 0.197382,
    "GEL": 0.713386,
    "GGP": 0.197382,
    "GHS": 2.932028,
    "GIP": 0.197382,
    "GMD": 19.765461,
    "GNF": 2329.924203,
    "GTQ": 2.047229,
    "GYD": 55.791011,
    "HKD": 2.083708,
    "HNL": 7.058153,
    "HRK": 1.701298,
    "HTG": 34.996472,
    "HUF": 85.905552,
    "IDR": 4498.974344,
    "ILS": 0.832807,
    "IMP": 0.197382,
    "INR": 24.230731,
    "IQD": 349.575383,
    "IRR": 342517.53106,
    "ISK": 32.837702,
    "JEP": 0.197382,
    "JMD": 41.624919,
    "JOD": 0.189067,
    "JPY": 41.23772,
    "KES": 34.415349,
    "KGS": 23.323935,
    "KHR": 1071.713915,
    "KID": 0.376605,
    "KMF": 111.086826,
    "KRW": 385.885734,
    "KWD": 0.081706,
    "KYD": 0.222222,
    "KZT": 132.546956,
    "LAK": 5760.337805,
    "LBP": 23866.666667,
    "LKR": 82.438908,
    "LRD": 49.426449,
    "LSL": 4.274502,
    "LYD": 1.686414,
    "MAD": 2.448218,
    "MDL": 4.567965,
    "MGA": 1148.226025,
    "MKD": 13.968308,
    "MMK": 560.680446,
    "MNT": 942.198488,
    "MOP": 2.146219,
    "MRU": 10.664985,
    "MUR": 12.369331,
    "MVR": 4.116163,
    "MWK": 463.384073,
    "MXN": 4.56641,
    "MYR": 1.040815,
    "MZN": 16.958026,
    "NAD": 4.274502,
    "NGN": 358.893101,
    "NIO": 9.81891,
    "NOK": 2.537362,
    "NPR": 38.769113,
    "NZD": 0.445725,
    "OMR": 0.102533,
    "PAB": 0.266667,
    "PEN": 0.895872,
    "PGK": 1.155344,
    "PHP": 15.48322,
    "PKR": 74.542958,
    "PLN": 0.953823,
    "PYG": 1733.847369,
    "QAR": 0.970667,
    "RON": 1.15523,
    "RSD": 26.597889,
    "RUB": 20.470512,
    "RWF": 388.462024,
    "SBD": 2.135933,
    "SCR": 3.787702,
    "SDG": 122.352724,
    "SEK": 2.409168,
    "SGD": 0.337671,
    "SHP": 0.197382,
    "SLE": 6.521433,
    "SLL": 6521.432538,
    "SOS": 152.243496,
    "SRD": 10.011342,
    "SSP": 1220.970921,
    "STN": 5.532125,
    "SYP": 29.976227,
    "SZL": 4.274502,
    "THB": 8.292819,
    "TJS": 2.504955,
    "TMT": 0.933326,
    "TND": 0.765754,
    "TOP": 0.630871,
    "TRY": 11.680973,
    "TTD": 1.805585,
    "TVD": 0.376605,
    "TWD": 8.407894,
    "TZS": 689.36143,
    "UAH": 11.541132,
    "UGX": 955.833154,
    "USD": 0.266667,
    "UYU": 10.307984,
    "UZS": 3256.66381,
    "VES": 108.093813,
    "VND": 6908.915503,
    "VUV": 31.532058,
    "WST": 0.716532,
    "XAF": 148.115768,
    "XCD": 0.72,
    "XCG": 0.477333,
    "XDR": 0.193965,
    "XOF": 148.115768,
    "XPF": 26.945289,
    "YER": 63.592964,
    "ZAR": 4.274517,
    "ZMW": 5.03812,
    "ZWG": 6.81024,
    "ZWL": 6.81024
  },
  "availableCurrencies": [
    {
      "code": "SAR",
      "label": "Saudi Riyal"
    },
    {
      "code": "USD",
      "label": "US Dollar"
    },
    {
      "code": "EUR",
      "label": "Euro"
    },
    {
      "code": "GBP",
      "label": "Pound Sterling"
    },
    {
      "code": "PKR",
      "label": "Pakistani Rupee"
    },
    {
      "code": "AUD",
      "label": "Australian Dollar"
    }
  ]
};
