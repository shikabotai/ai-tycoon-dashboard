export type AgentIdentity = {
  id: string
  name: string
  subtitle: string
  roomTheme: string
  mood: string
  palette: {
    primary: string
    secondary: string
    glow: string
    accent: string
  }
  avatarClass: string
}

export const agentIdentities: Record<string, AgentIdentity> = {
  manager: {
    id: 'manager',
    name: 'Senku',
    subtitle: 'Chief strategist',
    roomTheme: 'science-lab',
    mood: 'focused',
    palette: { primary: '#7dd3fc', secondary: '#22d3ee', glow: 'rgba(34, 211, 238, 0.35)', accent: '#a3e635' },
    avatarClass: 'avatar-senku',
  },
  researcher: {
    id: 'researcher',
    name: 'Nico Robin',
    subtitle: 'Knowledge architect',
    roomTheme: 'archive-lab',
    mood: 'calm',
    palette: { primary: '#c4b5fd', secondary: '#818cf8', glow: 'rgba(129, 140, 248, 0.32)', accent: '#f5d0fe' },
    avatarClass: 'avatar-robin',
  },
  gateway: {
    id: 'gateway',
    name: 'Gateway',
    subtitle: 'Inbound relay',
    roomTheme: 'dock-bay',
    mood: 'alert',
    palette: { primary: '#67e8f9', secondary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.26)', accent: '#e0f2fe' },
    avatarClass: 'avatar-gateway',
  },
  content: {
    id: 'content',
    name: 'Content',
    subtitle: 'Story fabricator',
    roomTheme: 'studio-bay',
    mood: 'playful',
    palette: { primary: '#f9a8d4', secondary: '#fb7185', glow: 'rgba(251, 113, 133, 0.28)', accent: '#fde68a' },
    avatarClass: 'avatar-content',
  },
  'worker-1': {
    id: 'worker-1',
    name: 'Worker One',
    subtitle: 'Execution specialist',
    roomTheme: 'forge-bay',
    mood: 'steady',
    palette: { primary: '#fdba74', secondary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.28)', accent: '#fff7ed' },
    avatarClass: 'avatar-worker-1',
  },
  'worker-2': {
    id: 'worker-2',
    name: 'Worker Two',
    subtitle: 'Execution specialist',
    roomTheme: 'forge-bay',
    mood: 'steady',
    palette: { primary: '#86efac', secondary: '#22c55e', glow: 'rgba(34, 197, 94, 0.28)', accent: '#dcfce7' },
    avatarClass: 'avatar-worker-2',
  },
  reviewer: {
    id: 'reviewer',
    name: 'Reviewer',
    subtitle: 'Quality sentinel',
    roomTheme: 'control-room',
    mood: 'stern',
    palette: { primary: '#fca5a5', secondary: '#f87171', glow: 'rgba(248, 113, 113, 0.3)', accent: '#fee2e2' },
    avatarClass: 'avatar-reviewer',
  },
}
