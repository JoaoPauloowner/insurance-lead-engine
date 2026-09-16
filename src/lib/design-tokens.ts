
export const tokens = {
  colors: {
    bg: '#08080A',
    surface: '#121214',
    surface2: '#1A1A1E',
    surface3: '#1E1E20',
    border: '#232326',
    borderHover: '#2A2A2E',
    text: '#FAFAFA',
    textMute: '#8A8AA0',
    purple: '#8B5CF6',
    orange: '#FF7A45',
    yellow: '#F2E94E',
    success: '#0AFF92',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #FF7A45 100%)',
  },
  sidebarW: '280px',
  headerH: '56px',
  radius: { sm: '8px', md: '12px', lg: '16px', pill: '999px' }
} as const

export const cssVars = {
  '--bg': tokens.colors.bg,
  '--surface': tokens.colors.surface,
  '--surface-2': tokens.colors.surface2,
  '--border': tokens.colors.border,
  '--text': tokens.colors.text,
  '--text-mute': tokens.colors.textMute,
} as const
