// Jedno źródło prawdy dla kolorów, czcionek i zaokrągleń.
export const colors = {
  ink: '#14231F',
  muted: '#4F5F59',
  bg: '#E6EBE8', // tło ekranu (chłodna szarość – karty wyraźnie się odcinają)
  card: '#FFFFFF',
  line: '#C9D2CE',
  field: '#6F8079', // ramka pól formularza (kontrast ≥3:1)
  primary: '#0B5D4E',
  primarySoft: '#CFEBE3',
  accent: '#F2B134',
  warnBg: '#FFE1A8',
  warnLine: '#D9971A',
  warnInk: '#5E3600',
  chip: {
    teal: { bg: '#CFEBE3', fg: '#0B5D4E' },
    amber: { bg: '#FFD998', fg: '#6B3D00' },
    green: { bg: '#D6EBC3', fg: '#2B5410' },
    indigo: { bg: '#D5DCF8', fg: '#25348A' },
  },
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
} as const;

export const radius = { sm: 12, md: 14, lg: 18, xl: 28 } as const;

export const cardShadow = { boxShadow: '0 1px 2px rgba(20,35,31,0.08)' } as const;
