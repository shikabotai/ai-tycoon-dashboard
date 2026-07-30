import { Suspense, lazy, useEffect, useMemo, useState, type CSSProperties } from 'react'
import './App.css'
import { useDashboardData } from './hooks/useDashboardData'
import {
  createFinanceLinkToken,
  deleteFinanceData,
  disconnectFinanceConnection,
  exchangeFinancePublicToken,
  loadFinanceStatus,
  removeManualFinanceEntry,
  saveManualFinanceEntry,
  saveMonthlyBudget,
  syncFinanceConnection,
  updateFinanceAccountSettings,
} from './data/financeApi'
import { loadProjectedSection, type PersonalProjectionKey } from './data/personalProjectionClient'
import { generatedProjectionSnapshot } from './generated/projectedSections'
import type { ConnectionPersonProjection, IdentityQualityProjection, ProjectedDashboard, ProjectedSection as LiveProjectedSection } from './data/projectedTypes'
import { sendBusinessCommand, sendCommandHandoff } from './data/businessCommandApi'
import { routeCommand } from './data/commandRouter'
import type { CommandHandoffResponse } from './server/commandHandoffApi'
import type { BusinessCommandResponse } from './server/commandRouteApi'
import type { FinanceStatus } from './server/financeRouteApi'

const AvatarModelScene = lazy(async () => {
  const mod = await import('./components/AvatarModelScene')
  return { default: mod.AvatarModelScene }
})

type AppMode = 'personal' | 'business'
type PersonalSection = 'home' | 'vessel' | 'identity' | 'career' | 'wealth' | 'ventures' | 'systems' | 'education' | 'relationships' | 'knowledge'
type PersonalAssistantPage = 'personal-assistant'
type PersonalAppPage = 'task-manager-app' | 'workout-log-app' | 'nutrition-log-app' | 'mindset-coach-app' | 'personal-finance-coach-app' | 'relationship-manager-app' | 'sleep-coach-app' | 'school-counselor-app'
type BusinessPanel = 'overview' | 'agents' | 'review'
type BusinessPage = 'business-command' | 'agents' | 'review-dock' | 'runtime-trail'
type AppPage = PersonalSection | PersonalAssistantPage | PersonalAppPage | BusinessPage
type LoginState = { username: string; password: string }
type PersonalSectionData = LiveProjectedSection
type ProjectionHighlightCard = { title: string; text: string }
type CommandHistoryEntry = { id: string; text: string; context: string; action?: BusinessCommandResponse['runtimeAction']; handoff?: CommandHandoffResponse }
type CommandSuggestion = { label: string; prompt: string }
type QuickAction = { label: string; detail: string; prompt?: string; page?: AppPage }
type EmptyStateProps = { label: string; title: string; body: string }
type ManualFinanceDraft = { type: 'asset' | 'liability'; name: string; category: string; value: string; notes: string }
type BudgetDraft = { category: string; plannedAmount: string; month: string; notes: string }
type PlaidLinkMetadata = { institution?: { institution_id?: string; name?: string } }
type SkillAnswerState = Partial<Record<PersonalAppPage, string[]>>
type PlaidCreateOptions = {
  token: string
  onSuccess: (publicToken: string, metadata: PlaidLinkMetadata) => void
  onExit?: (error: { error_message?: string } | null) => void
}
type CoreDashboardSection = Extract<PersonalSection, 'vessel' | 'identity' | 'systems'>
type GrowthDashboardSection = Extract<PersonalSection, 'ventures' | 'career' | 'wealth' | 'education' | 'knowledge' | 'relationships'>
type CoreDashboardDefinition = ProjectedDashboard

type HomeConstellationNode = {
  key: Exclude<PersonalSection, 'home'>
  label: string
  tier: 'core' | 'secondary'
  x: number
  y: number
  anchorX: number
  anchorY: number
  tone: 'body' | 'mind' | 'ops' | 'growth' | 'capital' | 'connection'
}
type NavItem = { page: AppPage; label: string; description: string }
type PageDirective = { outcome: string; system: string; usefulFor: string; cadence: string }
type PersonalAppBundle = {
  page: PersonalAppPage
  title: string
  icon: string
  accent: 'blue' | 'green' | 'amber' | 'indigo' | 'teal'
  tagline: string
  overview: string
  connectedSignals: string[]
  skillFlow?: {
    description: string[]
    onboardingQuestions: string[]
    workflowPreview: string[]
    permissionsAndTools: string[]
    enableSteps: string[]
  }
  template: {
    purpose: string
    setupInputs: string[]
    repoFiles: string[]
    telegramFlows: string[]
    dashboardModules: string[]
    automations: string[]
    permissions: string[]
    installChecklist: string[]
  }
}
type GrowthLoopDefinition = {
  target: string
  ritual: string
  blocker: string
  compound: string
  cadence: string
}
type CategoryDashboardKind = 'vessel-cockpit' | 'identity-compass' | 'systems-triage' | 'venture-radar' | 'career-ladder' | 'wealth-flow' | 'education-runway' | 'knowledge-forge' | 'relationship-orbit'
type CategorySignatureDashboard = {
  kind: CategoryDashboardKind
  eyebrow: string
  title: string
  readoutLabel: string
  readoutSourceIndex: number
  readoutUnit: string
  mapLabel: string
  mapItems: Array<{ label: string; sourceIndex: number }>
  lenses: Array<{ label: string; title: string; body: string; sourceIndex: number }>
}
type CrossDomainInsight = {
  label: string
  title: string
  body: string
  recommendation: string
  evidence: string
  pages: Exclude<PersonalSection, 'home'>[]
  tone: 'leverage' | 'tradeoff' | 'evidence'
}
type IdentityQuality = IdentityQualityProjection

const VALID_USERNAME = 'mthanath64'
const VALID_PASSWORD = 'Mitch2002'
const MAX_LOGIN_ATTEMPTS = 10
const LOCKOUT_MS = 10 * 60 * 1000
const SESSION_KEY = 'control-center-auth'
const LOGIN_STATE_KEY = 'control-center-login-state'
const COMMAND_HISTORY_KEY = 'control-center-command-history'
const IDENTITY_QUALITIES_KEY = 'control-center-identity-qualities'
const SKILL_ANSWERS_KEY = 'control-center-skill-answers'
const ENABLED_SKILLS_KEY = 'control-center-enabled-skills'
const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')
const AVATAR_MODEL_VERSION = 'model-7-20260712'
const AVATAR_MODEL_PATH = `${appAssetPath('avatar/control-center-avatar.glb')}?v=${AVATAR_MODEL_VERSION}`

declare global {
  interface Window {
    Plaid?: {
      create: (options: PlaidCreateOptions) => { open: () => void }
    }
  }
}

const DEFAULT_IDENTITY_QUALITIES: IdentityQuality[] = [
  { id: 'discipline', name: 'Discipline', score: 6.2, tenMeans: 'Keeps promises without needing drama or motivation.', nextAction: 'Choose the top task and finish it before drifting.', source: 'Fallback identity projection' },
  { id: 'presence', name: 'Presence', score: 5.4, tenMeans: 'Fully here with people, work, and rest.', nextAction: 'Put the phone away during the next real moment.', source: 'Fallback identity projection' },
  { id: 'physical-confidence', name: 'Physical confidence', score: 4.3, tenMeans: 'Feels strong, lean, energetic, and comfortable in a room.', nextAction: 'Protect the next lift or nutrition log.', source: 'Fallback identity projection' },
  { id: 'social-confidence', name: 'Social confidence', score: 4.8, tenMeans: 'Warm, playful, grounded, and easy to connect with.', nextAction: 'Create one small moment of connection today.', source: 'Fallback identity projection' },
  { id: 'reliability', name: 'Reliability', score: 7.1, tenMeans: 'Does what he says, especially when no one is watching.', nextAction: 'Close one open promise before starting another.', source: 'Fallback identity projection' },
]

const PERSONAL_ROUTES: Record<PersonalSection, string> = {
  home: '/',
  vessel: '/vessel',
  identity: '/identity',
  career: '/career',
  wealth: '/wealth',
  ventures: '/ventures',
  systems: '/systems',
  education: '/education',
  relationships: '/relationships',
  knowledge: '/knowledge',
}

const PERSONAL_APP_ROUTES: Record<PersonalAppPage, string> = {
  'task-manager-app': '/skills/task-manager',
  'workout-log-app': '/skills/workout-coach',
  'nutrition-log-app': '/skills/nutrition-coach',
  'mindset-coach-app': '/skills/mindset-coach',
  'personal-finance-coach-app': '/skills/personal-finance-coach',
  'relationship-manager-app': '/skills/relationship-manager',
  'sleep-coach-app': '/skills/sleep-coach',
  'school-counselor-app': '/skills/school-counselor',
}

const BUSINESS_ROUTES: Record<BusinessPage, string> = {
  'business-command': '/business-command',
  agents: '/agents',
  'review-dock': '/review-dock',
  'runtime-trail': '/runtime-trail',
}

const PERSONAL_ASSISTANT_ROUTES: Record<PersonalAssistantPage, string> = {
  'personal-assistant': '/personal-assistant',
}

const PAGE_ROUTES: Record<AppPage, string> = { ...PERSONAL_ROUTES, ...PERSONAL_ASSISTANT_ROUTES, ...PERSONAL_APP_ROUTES, ...BUSINESS_ROUTES }

function appAssetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

function loadPlaidLinkScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Plaid Link requires a browser'))
  if (window.Plaid) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Plaid Link script failed to load')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Plaid Link script failed to load'))
    document.head.appendChild(script)
  })
}

function browserPathForRoute(route: string) {
  if (APP_BASE_PATH) return route === '/' ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}/#${route}`
  if (!APP_BASE_PATH) return route
  return route === '/' ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}${route}`
}

function appPathFromBrowserPath(pathname: string) {
  if (!APP_BASE_PATH) return pathname
  if (pathname === APP_BASE_PATH) return '/'
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) return pathname.slice(APP_BASE_PATH.length) || '/'
  return pathname
}

const PERSONAL_NAV_ITEMS: NavItem[] = [
  { page: 'home', label: 'Home', description: 'Operating overview' },
  { page: 'vessel', label: 'Vessel', description: 'Body and performance' },
  { page: 'identity', label: 'Identity', description: 'Mission and self alignment' },
  { page: 'systems', label: 'Systems', description: 'Current tasks and stale items' },
  { page: 'ventures', label: 'Ventures', description: 'Personal venture strategy' },
  { page: 'career', label: 'Career', description: 'Trajectory and portfolio' },
  { page: 'wealth', label: 'Wealth', description: 'Capital and priorities' },
  { page: 'education', label: 'Education', description: 'Courses and deadlines' },
  { page: 'knowledge', label: 'Knowledge', description: 'Models and references' },
  { page: 'relationships', label: 'Connections', description: 'Life lanes and care' },
]

const BUSINESS_NAV_ITEMS: NavItem[] = [
  { page: 'business-command', label: 'Business Command', description: 'Operations overview' },
  { page: 'agents', label: 'Agents', description: 'Workload and chambers' },
  { page: 'review-dock', label: 'Review Dock', description: 'Approval decisions' },
  { page: 'runtime-trail', label: 'Runtime Trail', description: 'Command provenance' },
]

const PERSONAL_APP_BUNDLES: PersonalAppBundle[] = [
  {
    page: 'task-manager-app',
    title: 'Task Manager',
    icon: 'TM',
    accent: 'blue',
    tagline: 'A reusable Skill that turns PunkRecords-style tasks, goals, lanes, stale items, priorities, and next actions into a daily operating workflow.',
    overview: 'Task Manager packages Mitchell\'s active commitments into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for task capture, lane review, stale-task cleanup, and daily summary focus.',
    connectedSignals: ['Systems dashboard', 'PunkRecords tasks', 'Goals', 'Projects', 'Stale tasks', 'Daily summary', 'Weekly review cadence'],
    skillFlow: {
      description: [
        'Turns loose task notes, project commitments, goals, lanes, stale items, priorities, blockers, and next actions into a repeatable task-management routine.',
        'The Skill gives OpenClaw enough structure to capture tasks, sort them into lanes, detect stale work, choose the next action, and keep review cadence aligned with Mitchell\'s real operating system instead of acting like a calendar scheduler.',
      ],
      onboardingQuestions: [
        'What task lanes should the manager use: personal, business, PunkRecords, school, health, admin, relationships, creative, or custom lanes?',
        'What active goals and projects should tasks roll up into, and which ones matter most right now?',
        'How should priorities be assigned: urgency, leverage, deadline, energy required, dependency, promise made, or Mitchell-selected rank?',
        'When is a task considered stale, blocked, waiting, or no longer worth doing?',
        'What does a good next action look like: smallest physical step, message to send, file to open, decision to make, or focused work block?',
        'What review cadence should run: morning triage, midday reset, evening closeout, weekly cleanup, or project-by-project review?',
        'How should completed tasks, abandoned tasks, deferred tasks, and recurring responsibilities be recorded?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in task lanes, project mappings, goal links, stale-task thresholds, priority rules, next-action format, review cadence, and approval boundaries.',
        'The workflow starts with task intake, normalizes each item into lane, project, goal, priority, status, next action, created date, last touched date, and review date, then returns the smallest useful move.',
        'Daily triage checks active tasks, stale tasks, blocked items, waiting items, and high-priority project commitments before proposing today\'s focus.',
        'Stale-task review asks whether each old item should be revived, reduced to a next action, delegated, deferred, archived, or converted into a project note.',
        'Generated templates cover task capture, lane review, project review, stale-task cleanup, daily focus selection, weekly review, and daily summary handoff.',
      ],
      permissionsAndTools: [
        'Read and write Task Manager Skill files, task logs, lane definitions, goal maps, project notes, and review templates in the user hub repo',
        'Read Systems dashboard context, PunkRecords task exports or notes, active goals, project files, daily memory, and prior daily summaries',
        'Use Telegram capture for quick task intake, task completion, priority updates, blockers, and next-action requests',
        'Use dashboard modules for lane counts, stale-task pressure, today\'s focus, project load, and review cadence status',
        'Ask before messaging anyone else, deleting task history, changing external project systems, or committing Mitchell to a deadline',
      ],
      enableSteps: [
        'Create the Task Manager Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed lanes, active goals, project mappings, priority rules, and stale-task thresholds',
        'Review file permissions, Telegram capture, dashboard modules, and daily summary handoff',
        'Enable the Skill for task capture, stale-task review, next-action selection, lane triage, and weekly cleanup',
        'Pin Task Manager to the Systems dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Manage Mitchell\'s real task system with PunkRecords-style lanes, goals, projects, priorities, stale-task review, and concrete next actions so daily focus stays honest.',
      setupInputs: [
        'Task lanes and the rules for what belongs in each lane',
        'Active goals, projects, commitments, and current priority order',
        'Task fields: title, lane, project, goal, priority, status, next action, created date, last touched date, review date, and notes',
        'Stale-task thresholds, blocked/waiting definitions, completion rules, and archive rules',
        'Review cadence for daily triage, stale-task cleanup, project review, and weekly reset',
      ],
      repoFiles: [
        'skills/task-manager/SKILL.md',
        'skills/task-manager/context.md',
        'skills/task-manager/data/tasks.md',
        'skills/task-manager/data/projects.md',
        'skills/task-manager/data/goals.md',
        'skills/task-manager/templates/task-capture.md',
        'skills/task-manager/templates/daily-triage.md',
        'skills/task-manager/templates/stale-task-review.md',
        'skills/task-manager/templates/weekly-review.md',
        'skills/task-manager/dashboard.json',
      ],
      telegramFlows: [
        'Capture a task by plain text and normalize it into lane, project, goal, priority, status, and next action',
        'Mark a task done, blocked, waiting, deferred, revived, archived, or converted into a project note',
        'Ask what to do next based on priorities, stale tasks, project pressure, energy, and open loops',
        'Request lane review, project review, stale-task cleanup, or daily focus selection',
      ],
      dashboardModules: [
        'Today focus panel',
        'Lane load overview',
        'Stale tasks queue',
        'Priority next actions',
        'Project pressure map',
        'Review cadence status',
      ],
      automations: [
        'Daily summary integration with top focus, stale-task warning, blocked items, and recommended next action',
        'Midday reset when high-priority tasks remain untouched',
        'Evening closeout for completed, carried, blocked, and abandoned tasks',
        'Weekly stale-task cleanup and project-lane review',
      ],
      permissions: [
        'Read and write Task Manager files in the user hub repo',
        'Read Systems dashboard context, PunkRecords task context, goals, projects, daily memory, and prior summaries',
        'Ask before messaging anyone else, deleting task history, changing external systems, or assigning deadlines on Mitchell\'s behalf',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run task manager onboarding',
        'Seed lanes, goals, projects, priority rules, and stale-task thresholds',
        'Import or reference PunkRecords task context',
        'Enable Telegram task capture',
        'Add Systems dashboard task widgets',
        'Add Task Manager section to daily summary generation',
      ],
    },
  },
  {
    page: 'workout-log-app',
    title: 'Workout Coach',
    icon: 'WC',
    accent: 'green',
    tagline: 'A reusable Skill that asks the right training questions, generates a coaching workflow, and helps OpenClaw guide the next session.',
    overview: 'Workout Coach packages training context into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for daily coaching and workout capture.',
    connectedSignals: ['Vessel readiness', 'Identity discipline score', 'Task planning', 'Morning summary', 'Weekly progress review'],
    skillFlow: {
      description: [
        'Turns workout notes, program context, soreness, equipment, and schedule constraints into a repeatable coaching routine.',
        'The Skill gives OpenClaw enough structure to log sessions, recommend the next lift, review progression, and keep training decisions aligned with Vessel goals.',
      ],
      onboardingQuestions: [
        'What is the current training goal: strength, hypertrophy, recomposition, conditioning, sport, or general health?',
        'What days and times are realistic for training each week?',
        'What program, split, exercises, working weights, and progression rules should the coach understand?',
        'What equipment, injuries, soreness patterns, sleep constraints, and recovery signals should shape recommendations?',
        'How should workouts be logged: quick text, detailed sets, post-session recap, or dashboard-first entry?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in the training goal, schedule, program, constraints, logging style, triggers, and approval rules.',
        'The workflow starts with intake, stores a normalized session entry, checks recent training and recovery, then returns the next practical training move.',
        'Generated templates cover session logs, weekly recaps, missed-workout recovery, and next-session recommendations.',
      ],
      permissionsAndTools: [
        'Read and write workout Skill files and training logs in the user hub repo',
        'Read Vessel goals, schedule context, prior workout entries, and user-provided recovery notes',
        'Use Telegram capture for quick logs and dashboard modules for coach summaries',
        'Ask before messaging anyone else, changing calendar events, or sharing health information',
      ],
      enableSteps: [
        'Create the Workout Coach Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed the first program context',
        'Review file permissions, Telegram capture, and dashboard modules',
        'Enable the Skill for workout logging, next-session planning, and weekly review',
        'Pin Workout Coach to the Vessel dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Capture strength training, cardio, mobility, soreness, recovery, and consistency so the main OS can reason about physical momentum.',
      setupInputs: [
        'Primary training goal and current program',
        'Weekly training schedule and preferred workout times',
        'Exercise list, target muscles, and current working weights',
        'Recovery constraints such as sleep, soreness, injuries, and equipment',
      ],
      repoFiles: [
        'skills/workout-coach/SKILL.md',
        'skills/workout-coach/context.md',
        'skills/workout-coach/data/workouts.md',
        'skills/workout-coach/templates/session-log.md',
        'skills/workout-coach/dashboard.json',
      ],
      telegramFlows: [
        'Log workout with exercises, sets, reps, weight, RPE, and notes',
        'Ask what to train next based on schedule, soreness, and missed sessions',
        'Request weekly training recap with consistency and progression signals',
      ],
      dashboardModules: [
        'Latest workout card',
        'Weekly consistency meter',
        'Muscle group balance map',
        'Next recommended session panel',
      ],
      automations: [
        'Evening prompt when a planned workout has no log',
        'Weekly progression summary',
        'Daily Summary integration for training priority',
      ],
      permissions: [
        'Read and write workout files in the user hub repo',
        'Read body goals and schedule context',
        'Ask before messaging anyone else or changing calendar events',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run onboarding questions',
        'Seed first program and exercise list',
        'Enable Telegram commands',
        'Add dashboard module to the user home screen',
      ],
    },
  },
  {
    page: 'nutrition-log-app',
    title: 'Nutrition Coach',
    icon: 'NC',
    accent: 'amber',
    tagline: 'A reusable Skill that asks the right nutrition questions, generates a coaching workflow, and helps OpenClaw guide daily food decisions.',
    overview: 'Nutrition Coach packages food goals, meal preferences, macro targets, budget, constraints, and logging style into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for daily nutrition coaching.',
    connectedSignals: ['Vessel goals', 'Workout recovery', 'Daily reminders', 'Grocery planning', 'Identity consistency'],
    skillFlow: {
      description: [
        'Turns meal logs, nutrition goals, dietary preferences, budget, schedule, and training context into a repeatable coaching routine.',
        'The Skill gives OpenClaw enough structure to capture food, estimate calories and protein, suggest the next useful meal choice, and connect nutrition decisions to Vessel goals.',
      ],
      onboardingQuestions: [
        'What is the current nutrition goal: cut, bulk, maintain, recomp, performance, or health baseline?',
        'What calorie target, protein target, meal schedule, and weigh-in rhythm should the coach use?',
        'What foods should be encouraged, limited, avoided, or treated as easy default meals?',
        'What allergies, dietary rules, budget constraints, cooking ability, grocery access, and restaurant habits should shape suggestions?',
        'How should nutrition be logged: quick text, detailed macros, meal photos, grocery receipts, or end-of-day recap?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in the nutrition goal, targets, preferences, constraints, logging style, triggers, and approval rules.',
        'The workflow starts with intake, stores normalized meal entries, checks remaining daily targets and workout context, then returns the next practical food decision.',
        'Generated templates cover daily logs, grocery defaults, meal recaps, missed-log recovery, and next-meal recommendations.',
      ],
      permissionsAndTools: [
        'Read and write nutrition Skill files and meal logs in the user hub repo',
        'Read Vessel goals, workout context, schedule constraints, body metrics, and user-provided food preferences',
        'Use Telegram capture for quick meal logs and dashboard modules for nutrition summaries',
        'Ask before ordering food, purchasing groceries, messaging anyone else, or sharing health information',
      ],
      enableSteps: [
        'Create the Nutrition Coach Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed targets, preferences, and default meals',
        'Review file permissions, Telegram capture, and dashboard modules',
        'Enable the Skill for meal logging, next-meal suggestions, and nightly review',
        'Pin Nutrition Coach to the Vessel dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Track meals and nutrition decisions with enough structure for useful coaching without making logging feel heavy.',
      setupInputs: [
        'Current nutrition goal: cut, bulk, maintain, recomp, or health baseline',
        'Target calories, protein, meal schedule, and dietary preferences',
        'Foods to encourage, foods to limit, allergies, and budget constraints',
        'Preferred logging style: quick text, detailed macros, photos, or end-of-day recap',
      ],
      repoFiles: [
        'skills/nutrition-coach/SKILL.md',
        'skills/nutrition-coach/context.md',
        'skills/nutrition-coach/data/meals.md',
        'skills/nutrition-coach/templates/daily-log.md',
        'skills/nutrition-coach/dashboard.json',
      ],
      telegramFlows: [
        'Log meal by plain text and normalize into calories, protein, and notes',
        'Ask what to eat next based on remaining targets and schedule',
        'Request daily nutrition recap with wins, gaps, and tomorrow adjustment',
      ],
      dashboardModules: [
        'Today calories and protein estimate',
        'Meal streak and missed-log signal',
        'Goal alignment panel',
        'Food decision prompt',
      ],
      automations: [
        'Meal logging reminders at user-selected times',
        'End-of-day nutrition recap',
        'Daily Summary integration for food priority and grocery needs',
      ],
      permissions: [
        'Read and write nutrition files in the user hub repo',
        'Read workout and body-goal context',
        'Ask before ordering food, groceries, or sharing health information',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run nutrition onboarding',
        'Set targets and logging preference',
        'Enable Telegram meal capture',
        'Add dashboard nutrition widgets',
      ],
    },
  },
  {
    page: 'mindset-coach-app',
    title: 'Mindset Coach',
    icon: 'MC',
    accent: 'indigo',
    tagline: 'A reusable Skill that helps OpenClaw guide motivation, affirmations, meditation, identity alignment, and daily emotional check-ins.',
    overview: 'Mindset Coach packages identity goals, motivation patterns, affirmation style, meditation preferences, emotional state, and support boundaries into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for daily mindset coaching.',
    connectedSignals: ['Identity alignment', 'Daily check-ins', 'Emotional state', 'Morning summary', 'Weekly reflection'],
    skillFlow: {
      description: [
        'Turns mood notes, motivation dips, identity statements, affirmations, meditation habits, and daily reflections into a repeatable coaching routine.',
        'The Skill gives OpenClaw enough structure to check in, reinforce chosen identity, suggest grounding practices, track emotional patterns, and keep support inside clear permission boundaries.',
      ],
      onboardingQuestions: [
        'What identity, values, or self-concept should the coach help reinforce?',
        'What motivates you best: direct challenge, calm encouragement, reflective prompts, affirmations, or practical next steps?',
        'What emotional states, stress patterns, confidence dips, or avoidance loops should the coach watch for?',
        'What meditation, breathing, journaling, visualization, or grounding practices do you prefer?',
        'What boundaries should the coach follow around mental health, crisis language, reminders, privacy, and escalation?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in identity anchors, motivation style, affirmation tone, check-in cadence, emotional-state tags, grounding practices, and permission rules.',
        'The workflow starts with a lightweight mood or intention intake, stores a normalized check-in, compares it with recent patterns, then returns a grounded next action.',
        'Generated templates cover morning intention, affirmation set, meditation prompt, emotional reset, nightly reflection, and weekly identity review.',
      ],
      permissionsAndTools: [
        'Read and write mindset Skill files, check-ins, affirmations, and reflection logs in the user hub repo',
        'Read Identity goals, schedule context, daily summaries, user-provided mood notes, and recent habit signals',
        'Use Telegram capture for quick check-ins and dashboard modules for mindset summaries',
        'Ask before contacting anyone, sharing emotional or health information, creating persistent reminders, or treating support as medical or crisis care',
      ],
      enableSteps: [
        'Create the Mindset Coach Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed identity anchors, affirmations, and preferred reset practices',
        'Review file permissions, Telegram capture, dashboard modules, and emotional-support boundaries',
        'Enable the Skill for daily check-ins, motivation prompts, meditation guidance, and weekly reflection',
        'Pin Mindset Coach to the Identity dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Support motivation, identity alignment, affirmations, meditation, and emotional awareness with lightweight daily structure and clear permission boundaries.',
      setupInputs: [
        'Core identity statement, values, and current growth focus',
        'Preferred coaching tone: direct, gentle, reflective, practical, or affirmation-led',
        'Meditation, breathing, journaling, visualization, and grounding preferences',
        'Emotional-state labels, check-in cadence, privacy rules, and escalation boundaries',
      ],
      repoFiles: [
        'skills/mindset-coach/SKILL.md',
        'skills/mindset-coach/context.md',
        'skills/mindset-coach/data/check-ins.md',
        'skills/mindset-coach/templates/daily-reflection.md',
        'skills/mindset-coach/dashboard.json',
      ],
      telegramFlows: [
        'Log mood, energy, stress, confidence, and intention by quick text',
        'Request an affirmation, meditation prompt, or emotional reset',
        'Ask for a daily or weekly mindset recap with patterns and next identity-aligned action',
      ],
      dashboardModules: [
        'Today mindset check-in',
        'Emotional state trend',
        'Identity alignment panel',
        'Affirmation and reset prompt',
      ],
      automations: [
        'Morning intention prompt at user-selected times',
        'Evening reflection recap',
        'Daily Summary integration for mindset priority and emotional-state signal',
      ],
      permissions: [
        'Read and write mindset files in the user hub repo',
        'Read identity goals, daily check-ins, and user-provided emotional-state notes',
        'Ask before contacting anyone, sharing private reflections, setting reminders, or making health-related claims',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run mindset onboarding',
        'Seed identity anchors, affirmations, and reset practices',
        'Enable Telegram check-in capture',
        'Add dashboard mindset widgets',
      ],
    },
  },
  {
    page: 'personal-finance-coach-app',
    title: 'Personal Finance Coach',
    icon: 'PF',
    accent: 'teal',
    tagline: 'A reusable Skill that turns read-only finance signals into cashflow coaching, budget reviews, net worth awareness, and goal-aligned money decisions.',
    overview: 'Personal Finance Coach packages Plaid-linked account data, manual finance entries, income, spending, budgets, liabilities, assets, and goals into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for monthly planning and daily money awareness.',
    connectedSignals: ['Wealth dashboard', 'Read-only Plaid Link', 'Net worth', 'Monthly budget', 'Income and spending', 'Manual assets and liabilities', 'Goal tracking'],
    skillFlow: {
      description: [
        'Turns read-only account balances, transactions, income patterns, spending categories, manual entries, monthly budgets, and financial goals into a repeatable coaching routine.',
        'The Skill gives OpenClaw enough structure to explain cashflow, flag budget drift, update net worth context, review progress toward goals, and recommend practical next steps without collecting bank credentials or moving money.',
      ],
      onboardingQuestions: [
        'What are the current financial priorities: emergency fund, debt payoff, investing, runway, savings goals, business cashflow, or spending control?',
        'Which accounts, assets, liabilities, manual entries, and Plaid-linked balances should count toward net worth, budgeting, or both?',
        'What monthly income, fixed expenses, category budgets, savings targets, and bill timing should the coach understand?',
        'What goals, deadlines, minimum balances, debt payoff rules, and risk boundaries should shape recommendations?',
        'How should finance check-ins work: daily spending pulse, weekly budget review, monthly net worth review, goal progress recap, or Telegram-first alerts?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in finance goals, account scope, budget rules, manual entry conventions, review cadence, provider abstraction, and approval rules.',
        'The workflow starts with read-only finance intake, checks Plaid/provider status and manual entries, summarizes income, spending, assets, liabilities, budget remaining, and goal progress, then returns the next practical money decision.',
        'Generated templates cover monthly budget reviews, net worth snapshots, transaction recaps, goal check-ins, manual asset/liability updates, and spending anomaly notes.',
      ],
      permissionsAndTools: [
        'Read and write Personal Finance Coach Skill files, budget notes, goal notes, and manual finance context in the user hub repo',
        'Read Wealth dashboard finance status, read-only Plaid/provider data, accounts, transactions, balances, manual entries, monthly budgets, assets, liabilities, income, spending, and goals',
        'Use Telegram capture for manual entries, budget notes, and finance questions, plus dashboard modules for summaries and review panels',
        'Never collect bank credentials; use Plaid Link or provider abstractions only for read-only account linking',
        'Ask before purchases, moving money, changing subscriptions, messaging anyone else, or sharing financial information',
      ],
      enableSteps: [
        'Create the Personal Finance Coach Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed goals, account scope, budget categories, and review cadence',
        'Review read-only Plaid/provider permissions, manual entry rules, Telegram capture, and dashboard modules',
        'Enable the Skill for budget review, net worth snapshots, spending recaps, and goal tracking',
        'Pin Personal Finance Coach to the Wealth dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Track money decisions, cashflow, net worth, budgets, goals, accounts, and transactions with enough structure for useful coaching while keeping bank access read-only.',
      setupInputs: [
        'Primary financial goals, deadlines, target amounts, and priority order',
        'Monthly income, fixed expenses, budget categories, savings targets, and bill timing',
        'Plaid-linked account scope plus manual assets, liabilities, and account inclusion rules',
        'Preferred review cadence: daily pulse, weekly budget review, monthly net worth snapshot, or goal recap',
      ],
      repoFiles: [
        'skills/personal-finance-coach/SKILL.md',
        'skills/personal-finance-coach/context.md',
        'skills/personal-finance-coach/data/goals.md',
        'skills/personal-finance-coach/templates/monthly-review.md',
        'skills/personal-finance-coach/dashboard.json',
      ],
      telegramFlows: [
        'Log manual asset, liability, budget note, goal update, or unusual transaction context',
        'Ask for budget status based on month-to-date spending, income, and remaining category targets',
        'Request net worth, cashflow, spending, debt, or goal progress recap',
      ],
      dashboardModules: [
        'Net worth snapshot',
        'Monthly budget remaining panel',
        'Recent transaction review',
        'Goal progress tracker',
      ],
      automations: [
        'Weekly budget drift summary',
        'Monthly net worth and goal progress review',
        'Daily Summary integration for bill timing, budget risk, and money priorities',
      ],
      permissions: [
        'Read and write finance Skill files in the user hub repo',
        'Read Wealth dashboard finance status, Plaid/provider metadata, accounts, transactions, budgets, manual entries, assets, liabilities, income, spending, and goals',
        'Never collect bank credentials; ask before purchases, moving money, changing subscriptions, or sharing financial information',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run finance onboarding',
        'Set goals, budget categories, account scope, and manual entry rules',
        'Confirm read-only Plaid/provider connection policy',
        'Enable Telegram finance capture',
        'Add dashboard finance widgets',
      ],
    },
  },
  {
    page: 'relationship-manager-app',
    title: 'Relationship Manager',
    icon: 'RM',
    accent: 'teal',
    tagline: 'A reusable Skill that helps the assistant track relationship context, thoughtful follow-ups, touchpoints, drafts, and personal CRM notes.',
    overview: 'Relationship Manager packages people, open loops, important dates, conversation context, gift ideas, introductions, and care actions into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for relationship follow-through and daily summary prompts.',
    connectedSignals: ['Connections dashboard', 'Daily memory', 'Open loops', 'Important dates', 'Telegram drafts', 'Weekly touchpoint review'],
    skillFlow: {
      description: [
        'Turns contact notes, follow-ups, birthdays, gift ideas, introductions, apologies, thank-yous, and conversation prep into a repeatable relationship-management routine.',
        'The Skill helps OpenClaw keep relationships actionable while respecting privacy, approval boundaries, and the difference between facts, inferences, and drafts.',
      ],
      onboardingQuestions: [
        'Which relationship lanes should this Skill track: family, close friends, dating, networking, mentors, coworkers, clients, local community, or custom lanes?',
        'What details are okay to remember for each person: preferences, dates, last interaction, promises, sensitivities, gift ideas, or nothing unless explicitly captured?',
        'What follow-up cadence should the assistant use for different lanes and people?',
        'What kinds of drafts should it prepare: check-ins, thank-yous, apologies, introductions, birthday notes, plans, or conversation prep?',
        'What privacy and approval boundaries should it follow before saving notes, messaging anyone, or surfacing sensitive context?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in relationship lanes, allowed memory fields, touchpoint cadence, draft types, review rhythm, and approval boundaries.',
        'The workflow starts by identifying the relationship objective, gathers approved context, finds open loops and next touchpoints, then returns the smallest useful action.',
        'Generated templates cover contact notes, follow-up review, message drafts, conversation prep, birthday/gift planning, and weekly relationship-health review.',
      ],
      permissionsAndTools: [
        'Read and write Relationship Manager Skill files, safe contact notes, follow-up lists, templates, and relationship review logs in the user hub repo',
        'Read Connections dashboard context, daily memory, user-approved relationship notes, and prior drafts when relevant',
        'Use Telegram for quick capture, message drafting, touchpoint review, and follow-up requests',
        'Ask before sending messages, saving sensitive details, contacting anyone, sharing private information, or treating guesses as facts',
      ],
      enableSteps: [
        'Create the Relationship Manager Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed lanes, allowed fields, touchpoint cadence, and privacy boundaries',
        'Review Telegram capture, dashboard modules, memory policy, and external-send approval rules',
        'Enable the Skill for contact prep, follow-up review, thoughtful drafts, and weekly touchpoint planning',
        'Pin Relationship Manager to the Connections dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Manage relationship context, follow-ups, thoughtful touchpoints, message drafts, and personal CRM notes without over-collecting sensitive information.',
      setupInputs: [
        'Relationship lanes and contact categories',
        'Allowed memory fields, sensitive boundaries, and approval rules',
        'Follow-up cadence, important dates, open-loop rules, and review rhythm',
        'Preferred draft styles for check-ins, thank-yous, apologies, introductions, and planning messages',
      ],
      repoFiles: [
        'skills/relationship-manager/SKILL.md',
        'skills/relationship-manager/context.md',
        'skills/relationship-manager/data/people.md',
        'skills/relationship-manager/data/follow-ups.md',
        'skills/relationship-manager/templates/message-draft.md',
        'skills/relationship-manager/templates/touchpoint-review.md',
        'skills/relationship-manager/dashboard.json',
      ],
      telegramFlows: [
        'Capture a relationship note or follow-up by plain text',
        'Prepare a message draft for a specific person and wait for approval before sending',
        'Ask who needs a touchpoint, what open loops exist, or how to prepare for a conversation',
      ],
      dashboardModules: [
        'Next touchpoints queue',
        'Open relationship loops',
        'Important dates panel',
        'Drafts waiting for approval',
        'Weekly connections review',
      ],
      automations: [
        'Daily Summary integration for important touchpoints and owed replies',
        'Weekly relationship review by lane',
        'Reminder prompts for user-approved important dates and follow-ups',
      ],
      permissions: [
        'Read and write relationship Skill files in the user hub repo',
        'Read Connections dashboard context and user-approved relationship notes',
        'Ask before sending messages, saving sensitive details, or sharing private information',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run relationship onboarding',
        'Seed lanes, allowed memory fields, cadence, and privacy boundaries',
        'Enable Telegram note capture and draft requests',
        'Add Connections dashboard modules',
        'Add Relationship Manager section to daily summary generation',
      ],
    },
  },
  {
    page: 'sleep-coach-app',
    title: 'Sleep Coach',
    icon: 'SL',
    accent: 'indigo',
    tagline: 'A reusable Skill that helps the assistant coach sleep, recovery, circadian habits, and morning readiness with optional Oura Ring tracking.',
    overview: 'Sleep Coach packages bedtime routines, wake targets, recovery signals, Oura Ring sleep data, manual sleep logs, caffeine/alcohol notes, naps, and daily readiness into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for automatic or manual sleep tracking.',
    connectedSignals: ['Vessel recovery', 'Oura Ring sleep', 'Manual sleep logs', 'Daily readiness', 'Evening routines', 'Morning summary'],
    skillFlow: {
      description: [
        'Turns sleep windows, bedtime habits, wake consistency, recovery signals, Oura Ring summaries, and manual logs into a practical sleep-coaching routine.',
        'The Skill supports two setup paths: connect Oura with read-only OAuth access for automatic sleep tracking, or use manual sleep entries when no ring is available.',
      ],
      onboardingQuestions: [
        'What sleep goal should this Skill optimize for: consistent wake time, longer sleep, better recovery, fewer late nights, energy, training readiness, or school/work performance?',
        'Do you want automatic Oura Ring tracking, manual sleep logging, or both as a backup?',
        'For Oura setup, what redirect URL, client/app ownership, scope boundaries, token storage location, and refresh-token handling should be used?',
        'For manual tracking, what fields should be logged: bedtime, wake time, estimated sleep duration, sleep quality, awakenings, naps, caffeine, alcohol, stress, screens, workout, and notes?',
        'What coaching cadence should run: bedtime wind-down, morning readiness summary, missed-log recovery, weekly sleep review, or training-day recovery check?',
        'What health boundaries should the assistant follow before interpreting sleep problems, medical symptoms, supplements, medications, or clinical sleep advice?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in sleep goals, tracking mode, Oura OAuth setup, manual log schema, coaching cadence, dashboard modules, and health-boundary rules.',
        'Automatic path: create an Oura developer app, use OAuth2 with least-privilege scopes such as daily sleep/readiness access, store tokens securely on the server side, refresh tokens safely, and pull sleep summaries into the Sleep Coach data files or API layer.',
        'Manual path: capture sleep entries by Telegram or dashboard form, normalize them into bedtime, wake time, duration, subjective quality, disruptions, naps, and context tags, then use those entries for coaching.',
        'Hybrid path: prefer Oura when fresh, fall back to manual entries for missing nights, travel, ring-off nights, or subjective context Oura cannot infer.',
        'Generated templates cover Oura setup, manual sleep log capture, morning readiness review, bedtime reset, weekly trend review, and missed-sleep recovery.',
      ],
      permissionsAndTools: [
        'Read and write Sleep Coach Skill files, Oura setup notes, manual sleep logs, weekly reviews, and dashboard modules in the user hub repo',
        'Read Vessel dashboard context, workout context, daily memory, calendar pressure, user-provided sleep notes, and Oura sleep/readiness summaries when connected',
        'Use Oura OAuth2 or an approved backend token flow for read-only sleep tracking; never ask Mitchell to paste raw long-lived tokens into chat',
        'Use Telegram and dashboard capture for manual bedtime, wake time, quality, naps, caffeine, alcohol, stress, and note entries',
        'Ask before sharing health information, changing calendars, contacting anyone, buying supplements, or presenting guidance as medical advice',
      ],
      enableSteps: [
        'Create the Sleep Coach Skill folder and generated SKILL.md preview',
        'Choose Oura automatic tracking, manual logging, or hybrid tracking',
        'If using Oura, create the Oura app, configure redirect URL, request the minimal sleep/readiness scopes, and store tokens server-side',
        'If using manual tracking, seed the sleep log fields, preferred capture flow, and reminder cadence',
        'Review health boundaries, Telegram capture, dashboard modules, and daily summary handoff',
        'Enable the Skill for sleep capture, morning readiness, bedtime planning, and weekly review',
        'Pin Sleep Coach to the Vessel dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Coach sleep and recovery using optional Oura Ring data plus manual sleep logs, with clear health boundaries and practical next actions.',
      setupInputs: [
        'Primary sleep goal, target bedtime, target wake time, and weekday/weekend constraints',
        'Tracking mode: Oura automatic tracking, manual logging, or hybrid fallback',
        'Oura app credentials ownership, redirect URL, OAuth scopes, server-side token storage, and refresh policy',
        'Manual log fields for bedtime, wake time, duration, quality, awakenings, naps, caffeine, alcohol, stress, screens, workout, and notes',
        'Coaching cadence for bedtime wind-down, morning readiness, missed-log recovery, and weekly trend review',
      ],
      repoFiles: [
        'skills/sleep-coach/SKILL.md',
        'skills/sleep-coach/context.md',
        'skills/sleep-coach/data/sleep-log.md',
        'skills/sleep-coach/data/oura-connection.md',
        'skills/sleep-coach/templates/manual-sleep-log.md',
        'skills/sleep-coach/templates/oura-setup.md',
        'skills/sleep-coach/templates/weekly-review.md',
        'skills/sleep-coach/dashboard.json',
      ],
      telegramFlows: [
        'Log sleep manually with bedtime, wake time, duration, quality, disruptions, naps, and notes',
        'Ask for morning readiness based on Oura data when connected or manual logs when not connected',
        'Request a bedtime plan, missed-sleep recovery plan, or weekly sleep trend review',
      ],
      dashboardModules: [
        'Oura connection status',
        'Last sleep summary',
        'Manual sleep log form',
        'Readiness and recovery panel',
        'Bedtime consistency trend',
        'Weekly sleep review',
      ],
      automations: [
        'Morning Daily Summary integration with sleep, readiness, recovery, and first adjustment',
        'Evening wind-down prompt at user-selected times',
        'Fallback manual-log prompt when Oura data is missing or stale',
        'Weekly sleep consistency and recovery review',
      ],
      permissions: [
        'Read and write Sleep Coach files in the user hub repo',
        'Read Vessel dashboard context, workout context, daily memory, and user-provided sleep notes',
        'Read Oura sleep/readiness data only after explicit OAuth setup with minimal necessary scopes',
        'Never request raw long-lived tokens in chat; store credentials and refresh tokens server-side',
        'Ask before sharing health information or treating sleep guidance as medical advice',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run sleep onboarding',
        'Choose Oura, manual, or hybrid tracking',
        'Configure Oura OAuth app and redirect URL if automatic tracking is enabled',
        'Seed manual sleep log schema and reminder cadence',
        'Enable Telegram sleep capture',
        'Add Vessel dashboard sleep modules',
        'Add Sleep Coach section to daily summary generation',
      ],
    },
  },
  {
    page: 'school-counselor-app',
    title: 'School Counselor',
    icon: 'SC',
    accent: 'blue',
    tagline: 'A reusable Skill that helps the assistant handle academic planning, deadlines, course decisions, applications, and student support navigation.',
    overview: 'School Counselor packages school context, program requirements, courses, deadlines, advisor questions, applications, scholarships, study routines, and support-office navigation into a Skill flow: collect onboarding answers, preview the generated SKILL.md/workflow, define the tools it can use, then enable it for education planning and daily summary reminders.',
    connectedSignals: ['Education dashboard', 'Calendar deadlines', 'Course plans', 'Advisor questions', 'Applications', 'Daily summary'],
    skillFlow: {
      description: [
        'Turns academic requirements, course planning, applications, scholarships, study routines, and advisor questions into a practical school-support workflow.',
        'The Skill helps OpenClaw separate confirmed requirements from assumptions and verify school-specific dates or policies when stakes are high.',
      ],
      onboardingQuestions: [
        'What school, program, degree, term, and academic standing should this Skill understand?',
        'What current courses, requirements, prerequisites, credits, deadlines, and graduation targets should it track?',
        'What school workflows matter most: course planning, assignments, applications, scholarships, financial aid, accommodations, study routines, or advisor emails?',
        'Which official sources should be treated as primary for requirements, calendars, forms, and policies?',
        'What boundaries should it follow around official advice, financial aid, disability, immigration, medical, or mental-health topics?',
      ],
      workflowPreview: [
        'Complete SKILL.md uses onboarding answers to fill in school context, tracked requirements, deadline sources, planning cadence, output formats, and professional-boundary rules.',
        'The workflow starts by identifying the school decision or deadline, gathers local context, verifies official requirements when needed, then produces the next forms, emails, questions, and dates.',
        'Generated templates cover course planning, advisor email drafts, deadline reviews, application checklists, scholarship planning, study routines, and support-office navigation.',
      ],
      permissionsAndTools: [
        'Read and write School Counselor Skill files, course plans, deadline lists, advisor questions, and academic templates in the user hub repo',
        'Read Education dashboard context, calendar/deadline notes, user-provided school documents, and official school pages when current rules matter',
        'Use Telegram for academic questions, quick deadline capture, study planning, and email draft review',
        'Ask before sending emails, submitting forms, changing calendars, sharing student information, or presenting advice as official school guidance',
      ],
      enableSteps: [
        'Create the School Counselor Skill folder and generated SKILL.md preview',
        'Answer onboarding questions and seed school, program, tracked workflows, official sources, and boundaries',
        'Review file permissions, official-source verification rules, Telegram flows, and dashboard modules',
        'Enable the Skill for course planning, deadline review, advisor drafts, and academic support navigation',
        'Pin School Counselor to the Education dashboard and daily summary',
      ],
    },
    template: {
      purpose: 'Support academic planning, school decisions, deadlines, advisor questions, applications, scholarships, and student support navigation.',
      setupInputs: [
        'Institution, program, term, current standing, degree path, and graduation target',
        'Current courses, prerequisites, credits, assignments, applications, and deadlines',
        'Official source URLs for calendars, requirements, forms, and policies',
        'Boundaries for official, legal, financial aid, disability, immigration, medical, and mental-health topics',
      ],
      repoFiles: [
        'skills/school-counselor/SKILL.md',
        'skills/school-counselor/context.md',
        'skills/school-counselor/data/deadlines.md',
        'skills/school-counselor/data/course-plan.md',
        'skills/school-counselor/templates/advisor-email.md',
        'skills/school-counselor/templates/deadline-review.md',
        'skills/school-counselor/dashboard.json',
      ],
      telegramFlows: [
        'Capture an academic deadline, course question, assignment risk, or advisor follow-up',
        'Draft advisor, professor, registrar, financial aid, or support-office emails for approval',
        'Ask for course plan review, application checklist, scholarship timeline, or study routine',
      ],
      dashboardModules: [
        'Upcoming academic deadlines',
        'Course and credit plan',
        'Advisor questions queue',
        'Application checklist',
        'Study focus panel',
      ],
      automations: [
        'Daily Summary integration for school deadlines and next academic action',
        'Weekly course/deadline review',
        'Reminder prompts for user-approved academic dates',
      ],
      permissions: [
        'Read and write school Skill files in the user hub repo',
        'Read Education dashboard context and user-provided academic notes',
        'Browse official school sources when current requirements, dates, forms, or policies matter',
        'Ask before sending emails, submitting forms, changing calendars, or sharing student information',
      ],
      installChecklist: [
        'Create Skill folder in the hub repo',
        'Run school onboarding',
        'Seed school context, program requirements, deadlines, and official sources',
        'Enable Telegram academic capture and draft requests',
        'Add Education dashboard modules',
        'Add School Counselor section to daily summary generation',
      ],
    },
  },
]

const PERSONAL_APP_NAV_ITEMS: NavItem[] = PERSONAL_APP_BUNDLES.map((bundle) => ({
  page: bundle.page,
  label: bundle.title,
  description: bundle.tagline,
}))

const PAGE_DIRECTIVES: Record<AppPage, PageDirective> = {
  home: {
    outcome: 'Know the day in under a minute',
    system: 'Identity, body, work, money, learning, and relationships compressed into one operating view.',
    usefulFor: 'Choosing what deserves attention before the day gets noisy.',
    cadence: 'Daily scan',
  },
  vessel: {
    outcome: 'Protect energy and physique momentum',
    system: 'Training, nutrition, recovery, and discipline signals translated into next actions.',
    usefulFor: 'Keeping the body system aligned with confidence, health, and consistency.',
    cadence: 'Daily check',
  },
  identity: {
    outcome: 'Act like the person you are building',
    system: 'Identity statement, score gaps, focus, and blockers kept in one decision frame.',
    usefulFor: 'Making choices from identity instead of mood or pressure.',
    cadence: 'Morning and reset moments',
  },
  systems: {
    outcome: 'Keep the task list honest',
    system: 'Current focus, old dated items, waiting items, and upcoming tasks from PunkRecords.',
    usefulFor: 'Seeing what needs a real decision without fake priority math.',
    cadence: 'Daily scan',
  },
  ventures: {
    outcome: 'Aim effort at the highest-upside line',
    system: 'Portfolio pressure, venture priority, blockers, and ROI logic kept separate from live ops.',
    usefulFor: 'Preventing idea sprawl and choosing the best next bet.',
    cadence: 'Weekly strategy',
  },
  career: {
    outcome: 'Convert work into leverage',
    system: 'Role trajectory, compensation moves, portfolio proof, and skill compounding in one board.',
    usefulFor: 'Making shipped work count toward opportunity, income, and reputation.',
    cadence: 'Weekly review',
  },
  wealth: {
    outcome: 'Build capital around leverage',
    system: 'Income engines, cashflow stance, priority gaps, and finance visibility separated cleanly.',
    usefulFor: 'Focusing money decisions on career, venture, and life ROI.',
    cadence: 'Weekly money review',
  },
  education: {
    outcome: 'Learn what compounds',
    system: 'Program, deadlines, tradeoffs, and career value tied into one execution lane.',
    usefulFor: 'Keeping school useful without letting it swallow the rest of the system.',
    cadence: 'Study planning',
  },
  knowledge: {
    outcome: 'Turn information into better decisions',
    system: 'Mental models, references, learning domains, and knowledge gaps converted into tools.',
    usefulFor: 'Using what you learn to improve choices, not just collect notes.',
    cadence: 'Weekly extraction',
  },
  relationships: {
    outcome: 'Maintain real connection with respect',
    system: 'Life lanes, people profiles, family, friends, local ties, care actions, and privacy boundaries summarized safely.',
    usefulFor: 'Keeping relationships actionable inside the Connections category.',
    cadence: 'Weekly touchpoint',
  },
  'workout-log-app': {
    outcome: 'Make training visible and repeatable',
    system: 'A modular Skill for logging workouts, tracking progression, and feeding body signals back into the main OS.',
    usefulFor: 'Turning workouts into connected context for planning, identity, energy, and weekly reviews.',
    cadence: 'Per workout and weekly recap',
  },
  'nutrition-log-app': {
    outcome: 'Make food decisions part of the OS',
    system: 'A modular Skill for capturing meals, goals, macros, and nutrition decisions without making the user manage a complex system.',
    usefulFor: 'Connecting nutrition to workouts, energy, reminders, and body goals.',
    cadence: 'Daily log and nightly recap',
  },
  'task-manager-app': {
    outcome: 'Keep tasks honest',
    system: 'A modular Skill for PunkRecords-style tasks, goals, lanes, stale items, priorities, projects, and next actions.',
    usefulFor: 'Letting the assistant do Shika-style task triage without turning it into a calendar scheduler.',
    cadence: 'Daily triage and weekly cleanup',
  },
  'mindset-coach-app': {
    outcome: 'Keep motivation grounded and repeatable',
    system: 'A modular Skill for motivation, affirmations, meditation prompts, emotional check-ins, and identity-aligned resets.',
    usefulFor: 'Turning mindset work into daily structure instead of waiting for mood or motivation to cooperate.',
    cadence: 'Morning, reset moments, and weekly reflection',
  },
  'personal-finance-coach-app': {
    outcome: 'Make money decisions visible',
    system: 'A modular Skill for read-only Plaid finance context, net worth, cashflow, spending, budgets, goals, and review rhythms.',
    usefulFor: 'Connecting the Wealth dashboard to practical budget reviews, goal progress, and safer money decisions.',
    cadence: 'Daily pulse, weekly review, and monthly net worth snapshot',
  },
  'relationship-manager-app': {
    outcome: 'Keep relationships actionable',
    system: 'A modular Skill for relationship context, follow-ups, thoughtful touchpoints, message drafts, and personal CRM notes.',
    usefulFor: 'Connecting the Connections dashboard to real follow-through without over-collecting private context.',
    cadence: 'Weekly review and important touchpoints',
  },
  'sleep-coach-app': {
    outcome: 'Make sleep and recovery coachable',
    system: 'A modular Skill for Oura-backed sleep tracking, manual sleep logs, readiness summaries, bedtime routines, and weekly recovery review.',
    usefulFor: 'Connecting Vessel recovery to practical sleep habits without requiring an Oura Ring for users who prefer manual tracking.',
    cadence: 'Morning readiness, bedtime planning, and weekly review',
  },
  'school-counselor-app': {
    outcome: 'Keep school decisions on track',
    system: 'A modular Skill for academic planning, deadlines, course decisions, applications, advisor questions, and student support navigation.',
    usefulFor: 'Connecting the Education dashboard to requirements, deadlines, official sources, and next academic actions.',
    cadence: 'Deadline review and term planning',
  },
  'personal-assistant': {
    outcome: 'Run the day from one assistant',
    system: 'A Shika-like personal assistant layer that turns enabled Skills into daily capabilities, summary sections, prompts, and follow-through.',
    usefulFor: 'Keeping the homepage focused while giving Skills a home inside the assistant that uses them.',
    cadence: 'Daily operating loop',
  },
  'business-command': {
    outcome: 'Move the business with fewer clicks',
    system: 'Queue pressure, revenue signals, reviews, and runtime actions in one command surface.',
    usefulFor: 'Knowing what business work should move, approve, or escalate first.',
    cadence: 'Live ops',
  },
  agents: {
    outcome: 'See who is carrying what',
    system: 'Agent chambers, assignments, costs, active tasks, and alert pressure grouped together.',
    usefulFor: 'Balancing automated work without losing sight of ownership.',
    cadence: 'Live ops',
  },
  'review-dock': {
    outcome: 'Approve only with context',
    system: 'Artifacts, decision notes, event evidence, and explicit approve or deny controls.',
    usefulFor: 'Keeping quality high while work continues moving.',
    cadence: 'As needed',
  },
  'runtime-trail': {
    outcome: 'Trust the system because it leaves evidence',
    system: 'Commands, handoffs, safety notes, audit ids, and provenance stored as a ledger.',
    usefulFor: 'Understanding what happened and why before delegating more.',
    cadence: 'Audit review',
  },
}

const HOME_CONSTELLATION_NODES: HomeConstellationNode[] = [
  { key: 'identity', label: 'Identity', tier: 'core', x: 50, y: 5, anchorX: 50, anchorY: 30, tone: 'mind' },
  { key: 'vessel', label: 'Vessel', tier: 'core', x: 82, y: 28, anchorX: 57, anchorY: 43, tone: 'body' },
  { key: 'systems', label: 'Systems', tier: 'core', x: 84, y: 56, anchorX: 61, anchorY: 54, tone: 'ops' },
  { key: 'ventures', label: 'Ventures', tier: 'core', x: 69, y: 62, anchorX: 57, anchorY: 57, tone: 'growth' },
  { key: 'career', label: 'Career', tier: 'core', x: 31, y: 62, anchorX: 43, anchorY: 57, tone: 'growth' },
  { key: 'wealth', label: 'Wealth', tier: 'core', x: 16, y: 56, anchorX: 39, anchorY: 57, tone: 'capital' },
  { key: 'relationships', label: 'Connections', tier: 'secondary', x: 18, y: 31, anchorX: 40, anchorY: 34, tone: 'connection' },
  { key: 'education', label: 'Education', tier: 'secondary', x: 34, y: 18, anchorX: 45, anchorY: 34, tone: 'mind' },
  { key: 'knowledge', label: 'Knowledge', tier: 'secondary', x: 66, y: 18, anchorX: 55, anchorY: 34, tone: 'mind' },
]

function pageFromPath(pathname: string): AppPage {
  const normalized = appPathFromBrowserPath(pathname).replace(/\/+$/, '') || '/'
  if (normalized === '/connections') return 'relationships'
  const match = (Object.entries(PAGE_ROUTES) as Array<[AppPage, string]>).find(([, path]) => path === normalized)
  return match?.[0] ?? 'home'
}

function pageFromBrowserLocation() {
  if (typeof window === 'undefined') return 'home'
  if (window.location.hash.startsWith('#/')) return pageFromPath(window.location.hash.slice(1))
  return pageFromPath(window.location.pathname)
}

function isBusinessPage(page: AppPage): page is BusinessPage {
  return page === 'business-command' || page === 'agents' || page === 'review-dock' || page === 'runtime-trail'
}

function isPersonalAssistantPage(page: AppPage): page is PersonalAssistantPage {
  return page === 'personal-assistant'
}

function isPersonalAppPage(page: AppPage): page is PersonalAppPage {
  return page === 'task-manager-app' || page === 'workout-log-app' || page === 'nutrition-log-app' || page === 'mindset-coach-app' || page === 'personal-finance-coach-app' || page === 'relationship-manager-app' || page === 'sleep-coach-app' || page === 'school-counselor-app'
}

function businessPanelFromPage(page: BusinessPage): BusinessPanel {
  if (page === 'agents') return 'agents'
  if (page === 'review-dock') return 'review'
  return 'overview'
}

function pageLabel(page: AppPage) {
  if (page === 'personal-assistant') return 'Personal Assistant'
  return [...PERSONAL_NAV_ITEMS, ...PERSONAL_APP_NAV_ITEMS, ...BUSINESS_NAV_ITEMS].find((item) => item.page === page)?.label ?? 'Home'
}

function sourceConfidence(section?: LiveProjectedSection) {
  if (!section) return 'Assembling'
  if (section.freshness?.stale) return 'Needs refresh'
  if ((section.missingData?.length ?? 0) > 0) return 'Partial'
  return 'Grounded'
}

const COMMAND_SUGGESTIONS: Record<AppMode, CommandSuggestion[]> = {
  personal: [
    { label: 'Focus reset', prompt: 'Summarize my highest-priority personal focus right now.' },
    { label: 'Identity check', prompt: 'Show the strongest identity signal on this screen.' },
    { label: 'Systems pulse', prompt: 'What system needs attention first?' },
  ],
  business: [
    { label: 'Review pressure', prompt: 'Show the most urgent review item and why it matters.' },
    { label: 'Agent load', prompt: 'Which agent has the highest current workload?' },
    { label: 'Publishing pulse', prompt: 'Summarize recent output and what should ship next.' },
  ],
}

const PERSONAL_SECTION_CONTENT: Record<Exclude<PersonalSection, 'home'>, { eyebrow: string; title: string; summaryCards: string[]; highlights: string[] }> = {
  vessel: { eyebrow: 'Body and performance', title: 'Vessel', summaryCards: ['Body metrics', 'Workout log source', 'Nutrition log source', 'Meditation log source'], highlights: ['Recent workouts and body trends', 'Cut / recomp progress', 'Source-backed health signals'] },
  identity: { eyebrow: 'Internal command', title: 'Identity', summaryCards: ['Identity statement', 'Ideal self alignment', 'Current mission', 'Top active goals'], highlights: ['Ideal Self and Annual Goals', 'Decision Engine and blockers', 'Alignment-first momentum view'] },
  career: { eyebrow: 'Trajectory and leverage', title: 'Career', summaryCards: ['Career trajectory', 'Portfolio readiness', 'Job search status', 'Next milestone'], highlights: ['Career strategy overviews', 'Portfolio readiness', 'Real repo opportunities'] },
  wealth: { eyebrow: 'Capital and strategy', title: 'Wealth', summaryCards: ['Net worth', 'Cash / liquidity', 'Income snapshot', 'Financial priorities'], highlights: ['Budget and cashflow strategy', 'Current priorities surfaced fast', 'Balanced present and future view'] },
  ventures: { eyebrow: 'Personal venture strategy', title: 'Ventures', summaryCards: ['Priority venture', 'Portfolio snapshot', 'Biggest blocker', 'Next key decision'], highlights: ['Personal venture worldview', 'Priority logic and blockers', 'Separate from Business Command'] },
  systems: { eyebrow: 'Life operations layer', title: 'Systems', summaryCards: ['Current focus', 'Old dated items', 'Waiting items', 'Upcoming tasks'], highlights: ['PunkRecords source rows', 'Stale dates without fake urgency', 'Simple task triage'] },
  education: { eyebrow: 'Learning and school', title: 'Education', summaryCards: ['Program', 'Courses', 'Upcoming deadlines', 'Learning focus'], highlights: ['Program context', 'Course clarity', 'Visible without taking over the system'] },
  relationships: { eyebrow: 'Family and connection', title: 'Connections', summaryCards: ['Life lanes', 'People profiles', 'Family', 'Local ties'], highlights: ['Friends and family in priority order', 'Profile popups when opened', 'Sensitive content kept minimal'] },
  knowledge: { eyebrow: 'Mental models and references', title: 'Knowledge', summaryCards: ['Learning domains', 'Mental models', 'Recent knowledge', 'Knowledge gaps'], highlights: ['Business, finance, health, psychology', 'Knowledge browser from PunkRecords', 'Built for action'] },
}

const CATEGORY_SIGNATURE_DASHBOARDS: Record<Exclude<PersonalSection, 'home'>, CategorySignatureDashboard> = {
  vessel: {
    kind: 'vessel-cockpit',
    eyebrow: 'Body cockpit',
    title: 'Readiness, training, food, and recovery in one control surface.',
    readoutLabel: 'Primary body signal',
    readoutSourceIndex: 0,
    readoutUnit: 'target',
    mapLabel: 'Body lanes',
    mapItems: [
      { label: 'Lift', sourceIndex: 1 },
      { label: 'Fuel', sourceIndex: 2 },
      { label: 'Recover', sourceIndex: 3 },
      { label: 'Physique', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Train', title: 'Next session lock', body: 'Use the workout recency signal to decide whether training leads the day.', sourceIndex: 1 },
      { label: 'Fuel', title: 'Nutrition compliance', body: 'Pair the body target with the latest food-log evidence before judging progress.', sourceIndex: 2 },
      { label: 'Recover', title: 'Recovery blind spot', body: 'Keep sleep and energy marked as an explicit source gap until a real feed exists.', sourceIndex: 3 },
    ],
  },
  identity: {
    kind: 'identity-compass',
    eyebrow: 'Identity compass',
    title: 'Mission, ideal-self gap, and blockers arranged like a decision instrument.',
    readoutLabel: 'Alignment anchor',
    readoutSourceIndex: 2,
    readoutUnit: 'theme',
    mapLabel: 'Compass points',
    mapItems: [
      { label: 'Self', sourceIndex: 0 },
      { label: 'Gap', sourceIndex: 1 },
      { label: 'Mission', sourceIndex: 3 },
      { label: 'Friction', sourceIndex: 4 },
    ],
    lenses: [
      { label: 'Focus', title: 'Defend the top goal', body: 'Let the lead active goal outrank reactive lower-priority pulls.', sourceIndex: 3 },
      { label: 'Gap', title: 'Close one alignment gap', body: 'Pick the move that makes current behavior more like the ideal-self record.', sourceIndex: 1 },
      { label: 'Blocker', title: 'Name the pressure', body: 'Translate environment or consistency friction into a concrete constraint.', sourceIndex: 4 },
    ],
  },
  systems: {
    kind: 'systems-triage',
    eyebrow: 'Operations triage',
    title: 'Open loops move through clarify, delegate, close, and automate lanes.',
    readoutLabel: 'Open-loop pressure',
    readoutSourceIndex: 0,
    readoutUnit: 'loops',
    mapLabel: 'Triage lanes',
    mapItems: [
      { label: 'Capture', sourceIndex: 0 },
      { label: 'Close', sourceIndex: 1 },
      { label: 'Compress', sourceIndex: 2 },
      { label: 'Automate', sourceIndex: 3 },
    ],
    lenses: [
      { label: 'Clarify', title: 'Clarify one open loop', body: 'Convert ambiguity into a decision, action, owner, or deletion.', sourceIndex: 0 },
      { label: 'Compress', title: 'Reduce surface area', body: 'Use project sprawl as the signal to shrink the day’s active set.', sourceIndex: 2 },
      { label: 'Automate', title: 'Upgrade the rollup', body: 'Make AI support remove loops while keeping approval boundaries visible.', sourceIndex: 3 },
    ],
  },
  ventures: {
    kind: 'venture-radar',
    eyebrow: 'Portfolio radar',
    title: 'A strategy radar that compresses many ideas into one highest-upside move.',
    readoutLabel: 'Portfolio surface',
    readoutSourceIndex: 0,
    readoutUnit: 'lines',
    mapLabel: 'Radar vectors',
    mapItems: [
      { label: 'Inventory', sourceIndex: 0 },
      { label: 'Priority', sourceIndex: 1 },
      { label: 'Goals', sourceIndex: 2 },
      { label: 'Blocker', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Rank', title: 'Name the priority venture', body: 'Favor momentum, upside, urgency, and cost instead of a long inventory.', sourceIndex: 4 },
      { label: 'Ship', title: 'Execution over ideation', body: 'Push the selected line toward traction before adding another bet.', sourceIndex: 1 },
      { label: 'Route', title: 'Send live work to Business Command', body: 'Keep this page strategic once a decision becomes operational execution.', sourceIndex: 5 },
    ],
  },
  career: {
    kind: 'career-ladder',
    eyebrow: 'Proof engine',
    title: 'Package the strongest work, then convert it into outreach, interviews, and offers.',
    readoutLabel: 'Lead proof asset',
    readoutSourceIndex: 2,
    readoutUnit: 'proof',
    mapLabel: 'Career engine',
    mapItems: [
      { label: 'Proof', sourceIndex: 2 },
      { label: 'Package', sourceIndex: 3 },
      { label: 'Pipeline', sourceIndex: 4 },
      { label: 'Ready', sourceIndex: 6 },
    ],
    lenses: [
      { label: 'Proof', title: 'Lead with LifeArc', body: 'Turn the HIPAA AI platform into the first resume, portfolio, LinkedIn, and interview proof block.', sourceIndex: 2 },
      { label: 'Package', title: 'Close one asset gap', body: 'Ship one public-safe artifact: resume bullet, STAR story, architecture diagram, case study, GitHub polish, or LinkedIn feature.', sourceIndex: 3 },
      { label: 'Pipeline', title: 'Move one target forward', body: 'Convert packaged proof into a researched target, warm outreach, tailored application, follow-up, screen, or offer step.', sourceIndex: 4 },
      { label: 'Ready', title: 'Keep interviews trainable', body: 'Treat DSA, system design, and behavioral stories as one readiness stack tied to the target role profile.', sourceIndex: 6 },
    ],
  },
  wealth: {
    kind: 'wealth-flow',
    eyebrow: 'Capital flow',
    title: 'Money decisions routed through income engines, runway, visibility, and leverage.',
    readoutLabel: 'Capital priority',
    readoutSourceIndex: 0,
    readoutUnit: 'priority',
    mapLabel: 'Allocation channels',
    mapItems: [
      { label: 'Earn', sourceIndex: 1 },
      { label: 'Engines', sourceIndex: 3 },
      { label: 'Runway', sourceIndex: 4 },
      { label: 'Strategy', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Earn', title: 'Prioritize leverage', body: 'Favor earning power, durable upside, or recurring surplus.', sourceIndex: 0 },
      { label: 'See', title: 'Fix the visibility gap', body: 'The page should stay honest until balance, cashflow, and obligations exist.', sourceIndex: 4 },
      { label: 'Route', title: 'Tie spend to strategy', body: 'Show whether the next spend supports career, health, or venture leverage.', sourceIndex: 5 },
    ],
  },
  education: {
    kind: 'education-runway',
    eyebrow: 'Study runway',
    title: 'Program context, checkpoint gaps, overload watch, and career value sequenced in order.',
    readoutLabel: 'Program anchor',
    readoutSourceIndex: 0,
    readoutUnit: 'program',
    mapLabel: 'Runway checkpoints',
    mapItems: [
      { label: 'Program', sourceIndex: 0 },
      { label: 'Value', sourceIndex: 1 },
      { label: 'Balance', sourceIndex: 2 },
      { label: 'Deadline', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Checkpoint', title: 'Protect the study lane', body: 'Make the next academic checkpoint explicit before it becomes vague pressure.', sourceIndex: 5 },
      { label: 'Value', title: 'Connect school to leverage', body: 'Attach coursework to a real career or technical skill gain.', sourceIndex: 1 },
      { label: 'Load', title: 'Watch overload', body: 'Balance study depth against shipping, health, and business execution.', sourceIndex: 4 },
    ],
  },
  knowledge: {
    kind: 'knowledge-forge',
    eyebrow: 'Model forge',
    title: 'References enter as raw material and leave as decision tools.',
    readoutLabel: 'Learning domain',
    readoutSourceIndex: 0,
    readoutUnit: 'domain',
    mapLabel: 'Forge stations',
    mapItems: [
      { label: 'Input', sourceIndex: 2 },
      { label: 'Model', sourceIndex: 1 },
      { label: 'Reference', sourceIndex: 3 },
      { label: 'Decision', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Extract', title: 'Extract one usable model', body: 'Turn the strongest note into a reusable decision rule.', sourceIndex: 1 },
      { label: 'Refresh', title: 'Connect recency', body: 'Separate live learning from stale reference material.', sourceIndex: 2 },
      { label: 'Apply', title: 'Tie reading to action', body: 'Keep books and references useful by attaching them to a decision.', sourceIndex: 4 },
    ],
  },
  relationships: {
    kind: 'relationship-orbit',
    eyebrow: 'Life lanes',
    title: 'Connections keeps people, family, and care in one place.',
    readoutLabel: 'Mapped people',
    readoutSourceIndex: 0,
    readoutUnit: 'people',
    mapLabel: 'Relationship lanes',
    mapItems: [
      { label: 'Friends', sourceIndex: 0 },
      { label: 'Family', sourceIndex: 1 },
      { label: 'Local', sourceIndex: 3 },
      { label: 'Profiles', sourceIndex: 5 },
    ],
    lenses: [
      { label: 'Lane', title: 'Check relationship lanes', body: 'Look at friends, family, local ties, and work-adjacent people without making a separate page.', sourceIndex: 0 },
      { label: 'Care', title: 'Choose one care action', body: 'Make connection concrete without exposing unnecessary private detail.', sourceIndex: 1 },
      { label: 'Depth', title: 'Only add useful profiles', body: 'Create individual notes for people who actually need recurring context.', sourceIndex: 5 },
    ],
  },
}

const GROWTH_LOOP_DEFINITIONS: Record<Exclude<PersonalSection, 'home'>, GrowthLoopDefinition> = {
  vessel: {
    target: 'Body system that raises confidence, energy, and visible discipline.',
    ritual: 'Check training, food, and recovery before choosing the day’s hardest work.',
    blocker: 'Stale body inputs can hide whether effort is actually compounding.',
    compound: 'Better readiness makes business output, learning depth, and social confidence easier.',
    cadence: 'Daily body check',
  },
  identity: {
    target: 'Choices that match the person Mitchell is deliberately becoming.',
    ritual: 'Name the identity-aligned move before reacting to pressure or mood.',
    blocker: 'Too many pulls can make the top mission feel optional.',
    compound: 'Identity clarity turns goals into defaults instead of repeated negotiations.',
    cadence: 'Morning and reset',
  },
  systems: {
    target: 'Fewer open loops and cleaner execution across life and work.',
    ritual: 'Clarify, delegate, delete, or execute one ambiguous obligation.',
    blocker: 'Untriaged surface area makes the day feel productive without real closure.',
    compound: 'Cleaner systems free attention for health, business, learning, and relationships.',
    cadence: 'Daily command pass',
  },
  ventures: {
    target: 'A venture portfolio that concentrates effort on the highest-upside line.',
    ritual: 'Pick the one venture decision that creates the most leverage this week.',
    blocker: 'Idea sprawl can disguise itself as ambition.',
    compound: 'Focused venture work creates proof, income options, and career leverage.',
    cadence: 'Weekly strategy',
  },
  career: {
    target: 'Shipped work converted into compensation, reputation, and role leverage.',
    ritual: 'Turn one concrete artifact into portfolio, resume, or negotiation proof.',
    blocker: 'Good work loses value when it stays private or unframed.',
    compound: 'Career leverage funds freedom, wealth, education, and bigger business bets.',
    cadence: 'Twice-weekly proof pass',
  },
  wealth: {
    target: 'Capital decisions that support freedom and bigger upside.',
    ritual: 'Check whether the next spend or work block improves earning power or resilience.',
    blocker: 'Without live money signals, small optimizations can crowd out larger leverage.',
    compound: 'Better capital posture gives every other life domain more room to breathe.',
    cadence: 'Weekly money review',
  },
  education: {
    target: 'Learning that compounds career leverage instead of becoming background pressure.',
    ritual: 'Identify the next course checkpoint and connect it to a practical skill.',
    blocker: 'School can become a vague stressor when deadlines are not visible.',
    compound: 'Structured learning strengthens technical judgment and long-term opportunity.',
    cadence: 'Course checkpoint review',
  },
  knowledge: {
    target: 'Knowledge converted into decisions, models, and repeatable operating rules.',
    ritual: 'Extract one usable model from the highest-value note or reference.',
    blocker: 'A large archive can feel smart while staying inert.',
    compound: 'Decision-ready knowledge improves business, health, money, and relationships.',
    cadence: 'Weekly model extraction',
  },
  relationships: {
    target: 'Friends, family, and meaningful ties handled with care, privacy, and concrete follow-through.',
    ritual: 'Open the relevant lane and choose one respectful action or profile update.',
    blocker: 'Good intentions decay when they never become a timed action.',
    compound: 'Stronger relationships make ambition feel supported instead of isolated.',
    cadence: 'Weekly connection check',
  },
}

const CROSS_DOMAIN_INSIGHTS: CrossDomainInsight[] = [
  {
    label: 'Leverage chain',
    title: 'Body readiness multiplies execution',
    body: 'Training, food, and recovery are not separate from work. They decide how much focus is available for career proof, business output, and social confidence.',
    recommendation: 'Protect the body check before choosing the hardest work block.',
    evidence: 'Vessel readiness changes Career, Ventures, and Relationships capacity.',
    pages: ['vessel', 'career', 'ventures', 'relationships'],
    tone: 'leverage',
  },
  {
    label: 'Tradeoff watch',
    title: 'Open loops tax every growth lane',
    body: 'If Systems is noisy, education, wealth, relationships, and venture decisions all become harder to execute cleanly.',
    recommendation: 'Clear one ambiguous obligation before adding more ambition.',
    evidence: 'Systems pressure touches Education, Wealth, and Venture execution.',
    pages: ['systems', 'education', 'wealth', 'ventures'],
    tone: 'tradeoff',
  },
  {
    label: 'Compounding move',
    title: 'Shipped proof should serve multiple goals',
    body: 'The best work should count at least twice: useful business output now, career proof later, and wealth leverage over time.',
    recommendation: 'Package the next shipped artifact so it can become proof.',
    evidence: 'Career, Ventures, Wealth, and Knowledge all improve from reusable output.',
    pages: ['career', 'ventures', 'wealth', 'knowledge'],
    tone: 'leverage',
  },
  {
    label: 'Decision support',
    title: 'Knowledge only matters when it changes a choice',
    body: 'Learning should feed concrete decisions in career, ventures, health, and money instead of becoming a passive archive.',
    recommendation: 'Extract one model and attach it to a real decision.',
    evidence: 'Knowledge is strongest when it changes Career, Venture, or Wealth behavior.',
    pages: ['knowledge', 'career', 'ventures', 'wealth'],
    tone: 'evidence',
  },
  {
    label: 'Human layer',
    title: 'Ambition needs protected connection',
    body: 'Relationships and identity keep the operating system human: useful progress should create more steadiness, not just more output.',
    recommendation: 'Choose one relationship action that supports the mission without overexposure.',
    evidence: 'Relationships and Identity stabilize the pressure created by Systems and Vessel work.',
    pages: ['relationships', 'identity', 'vessel', 'systems'],
    tone: 'tradeoff',
  },
  {
    label: 'Long arc',
    title: 'Education compounds when attached to real artifacts',
    body: 'School is most useful when each checkpoint strengthens career leverage, technical judgment, and the quality of shipped work.',
    recommendation: 'Connect the next course checkpoint to a portfolio-quality artifact.',
    evidence: 'Education compounds through Career, Knowledge, and Venture proof.',
    pages: ['education', 'career', 'knowledge', 'ventures'],
    tone: 'evidence',
  },
]

const CORE_DASHBOARD_DEFINITIONS: Record<CoreDashboardSection, CoreDashboardDefinition> = {
  vessel: {
    headline: 'Train, fuel, mind, looks',
    metrics: [
      { label: 'Workout recency', sourceCardIndex: 1, priority: 'good' },
      { label: 'Nutrition signal', sourceCardIndex: 2, priority: 'good' },
      { label: 'Mental reset', sourceCardIndex: 3, priority: 'watch' },
      { label: 'Looks routine', sourceCardIndex: 4, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Workout rhythm', body: 'Make the next lift obvious from the latest workout log.', sourceCardIndex: 1 },
      { title: 'Food log', body: 'Show protein and calories without turning the page into a spreadsheet.', sourceCardIndex: 2 },
      { title: 'Attention reset', body: 'Give focus, meditation, and phone-friction the same importance as body metrics.', sourceCardIndex: 3 },
      { title: 'Presentation system', body: 'Keep grooming, skin, hair, and style visible as compounding Vessel work.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Workout Logs', body: 'Shows current execution and the next recommended session.', sourceCardIndex: 1 },
      { title: 'Nutrition Daily Logs', body: 'Shows the current cut / recomp food signal.', sourceCardIndex: 2 },
      { title: 'Mental Overview', body: 'Anchors focus, attention span, meditation, and shutdown practices.', sourceCardIndex: 3 },
      { title: 'Looksmaxxing Routine', body: 'Anchors the daily appearance system and event-readiness layer.', sourceCardIndex: 4 },
    ],
    actionRows: [
      { title: 'Lock the next lift', body: 'Use the latest session note to pick the next workout instead of debating it.', sourceCardIndex: 1 },
      { title: 'Keep protein visible', body: 'Make the food log answer one question fast: is the cut protected today?', sourceCardIndex: 2 },
      { title: 'Run one mental rep', body: 'Brain dump, breathe, or meditate before attention gets eaten by the phone loop.', sourceCardIndex: 3 },
      { title: 'Do the simple polish', body: 'Run the daily grooming / skincare routine so looksmaxxing compounds quietly.', sourceCardIndex: 4 },
    ],
  },
  identity: {
    headline: 'Mission and alignment board',
    metrics: [
      { label: 'Identity statement', sourceCardIndex: 0, priority: 'good' },
      { label: 'Alignment gap', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Current focus', sourceCardIndex: 2, priority: 'good' },
      { label: 'Top active goal', sourceCardIndex: 3, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Execution-era self', body: 'Identity is framed as daily execution and emotional steadiness, not a motivational poster.', sourceCardIndex: 0 },
      { title: 'Focus priority', body: 'The lead goal should stay visible before lower-priority personal work.', sourceCardIndex: 2 },
      { title: 'Ideal-self gap', body: 'The ideal self is useful because it shows gaps to close, not because it pretends the gap is gone.', sourceCardIndex: 1 },
      { title: 'Decision pressure', body: 'Environment, consistency, and energy gaps belong on this page when they influence choices.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ideal Self', body: 'Standards for character, habits, physical presence, and social confidence.', sourceCardIndex: 0 },
      { title: 'Goals Overview', body: 'Shows what should be proved next.', sourceCardIndex: 3 },
      { title: 'Annual Goals', body: 'Keeps the larger focus and long-arc priorities visible.', sourceCardIndex: 2 },
    ],
    actionRows: [
      { title: 'Choose from alignment', body: 'Favor actions that reduce the gap between current self and ideal-self evidence.', sourceCardIndex: 1 },
      { title: 'Defend the top mission', body: 'If the dashboard shows too many pulls, protect the top active goal first.', sourceCardIndex: 3 },
      { title: 'Name the blocker', body: 'Turn environment or consistency friction into a concrete next move instead of leaving it vague.', sourceCardIndex: 4 },
    ],
  },
  systems: {
    headline: 'Systems task view',
    metrics: [
      { label: 'Current focus', sourceCardIndex: 0, priority: 'watch' },
      { label: 'Old dated item', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Waiting item', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Small task', sourceCardIndex: 3, priority: 'good' },
    ],
    operatingRows: [
      { title: 'Current work', body: 'Show the active task that needs attention first.', sourceCardIndex: 0 },
      { title: 'Old dated item', body: 'Surface stale dates so they can be rescheduled, closed, or removed.', sourceCardIndex: 1 },
      { title: 'Waiting item', body: 'Keep dependencies visible without turning them into fake urgency.', sourceCardIndex: 2 },
      { title: 'Small task', body: 'Show one short task when there is an obvious low-friction cleanup move.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Operations Task Board', body: 'Primary source for task rows.', sourceCardIndex: 0 },
      { title: 'Ventures MOC', body: 'Source context for project-related tasks.', sourceCardIndex: 2 },
      { title: 'Business Command boundary', body: 'Business execution stays separate from personal tasks.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Clarify one open loop', body: 'Turn the most ambiguous open item into a decision, next action, or deletion.', sourceCardIndex: 0 },
      { title: 'Compress surface area', body: 'Use the venture inventory as a warning when too many lines are competing for attention.', sourceCardIndex: 2 },
      { title: 'Upgrade live rollups', body: 'The systems need is explicit: better rollups are the next data-model improvement.', sourceCardIndex: 5 },
    ],
  },
}

const GROWTH_DASHBOARD_DEFINITIONS: Record<GrowthDashboardSection, CoreDashboardDefinition> = {
  ventures: {
    headline: 'Portfolio strategy board',
    metrics: [
      { label: 'Portfolio inventory', sourceCardIndex: 0, priority: 'watch' },
      { label: 'Priority posture', sourceCardIndex: 1, priority: 'good' },
      { label: 'Active venture goals', sourceCardIndex: 2, priority: 'good' },
      { label: 'Blocker visibility', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Strategy, not live ops', body: 'This page decides which venture lines deserve attention; Business Command remains the place for live execution.', sourceCardIndex: 0 },
      { title: 'Execution posture', body: 'The current stance favors shipping and traction over new idea sprawl.', sourceCardIndex: 1 },
      { title: 'Goal pressure', body: 'Annual venture goals become the active pressure signal until richer operating data lands.', sourceCardIndex: 2 },
      { title: 'Priority compression', body: 'The dashboard should reduce the portfolio into the next meaningful decision, not celebrate a long inventory.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Ventures MOC', body: 'Primary source for personal venture inventory and strategic surface area.', sourceCardIndex: 0 },
      { title: 'Annual goals', body: 'Provides the in-progress venture pressure and shipping posture.', sourceCardIndex: 2 },
      { title: 'Business boundary', body: 'Live blockers stay separate so this page can stay focused on personal strategy.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Name the priority venture', body: 'Compress the portfolio to the line with the best combination of momentum, upside, and urgency.', sourceCardIndex: 4 },
      { title: 'Route live work to Business Command', body: 'When the decision becomes execution, move it to the operations surface instead of crowding this page.', sourceCardIndex: 5 },
      { title: 'Add ROI ranking', body: 'Next data-model work should rank venture moves by leverage, cost, and expected return.', sourceCardIndex: 3 },
    ],
  },
  career: {
    headline: 'Trajectory and leverage board',
    metrics: [
      { label: 'Trajectory', sourceCardIndex: 0, priority: 'good' },
      { label: 'Primary goal', sourceCardIndex: 1, priority: 'good' },
      { label: 'Credential path', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Next milestone', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Income leverage lane', body: 'Career is currently about stronger role leverage and compensation, not passive resume storage.', sourceCardIndex: 1 },
      { title: 'Portfolio readiness', body: 'The next milestone should translate shipped work into a profile that can support interviews or negotiation.', sourceCardIndex: 5 },
      { title: 'Long-arc ML position', body: 'The MSML path is useful because it compounds technical leverage over time.', sourceCardIndex: 2 },
      { title: 'Opportunity filter', body: 'Current opportunities should be judged by leverage, learning, compensation, and fit with the wider operating system.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Annual goals', body: 'Supplies the current raise / SWE role objective.', sourceCardIndex: 1 },
      { title: 'Five-year direction', body: 'Keeps the MSML and machine-learning arc visible without letting it overwhelm the present.', sourceCardIndex: 2 },
      { title: 'Portfolio gap', body: 'The page needs direct resume, repo, and interview-cadence evidence in the next data-model pass.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Package shipped proof', body: 'Convert live software work into a career asset: portfolio entry, resume bullet, and interview story.', sourceCardIndex: 5 },
      { title: 'Protect the comp move', body: 'Keep the higher-paying SWE role / raise objective visible when choosing where to spend effort.', sourceCardIndex: 1 },
      { title: 'Track interview readiness', body: 'Add a direct readiness score once resume, projects, and outreach sources are connected.', sourceCardIndex: 5 },
    ],
  },
  wealth: {
    headline: 'Capital strategy board',
    metrics: [
      { label: 'Financial priority', sourceCardIndex: 0, priority: 'good' },
      { label: 'Cashflow stance', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Wealth engines', sourceCardIndex: 3, priority: 'good' },
      { label: 'Data blind spot', sourceCardIndex: 4, priority: 'stale' },
    ],
    operatingRows: [
      { title: 'Earn-more-first strategy', body: 'The current system treats income growth and venture upside as the main capital levers.', sourceCardIndex: 1 },
      { title: 'Engine pairing', body: 'Career and ventures are the lead wealth engines, so capital decisions should support those paths.', sourceCardIndex: 3 },
      { title: 'Selective accumulation', body: 'Avoid over-optimizing small decisions when the larger leverage paths are still being built.', sourceCardIndex: 2 },
      { title: 'Visibility gap', body: 'This page should be honest when live net-worth, cash, or spending data is not connected.', sourceCardIndex: 4 },
    ],
    evidenceRows: [
      { title: 'Planning docs', body: 'Current financial direction comes from goals and strategic notes, not direct account integrations.', sourceCardIndex: 0 },
      { title: 'Career and venture signals', body: 'The clearest financial multipliers are compensation growth and business traction.', sourceCardIndex: 3 },
      { title: 'Missing finance feed', body: 'A direct financial source remains required before this can become a precise scoreboard.', sourceCardIndex: 4 },
    ],
    actionRows: [
      { title: 'Prioritize leverage', body: 'Favor actions that increase earning power, durable upside, or recurring surplus.', sourceCardIndex: 0 },
      { title: 'Add live scoreboard source', body: 'Connect explicit balance, cashflow, and obligation sources before making this page more numerical.', sourceCardIndex: 4 },
      { title: 'Tie spend to strategy', body: 'Future decisions should show whether spending supports career, health, or venture leverage.', sourceCardIndex: 5 },
    ],
  },
  education: {
    headline: 'Program and learning execution board',
    metrics: [
      { label: 'Program', sourceCardIndex: 0, priority: 'good' },
      { label: 'Strategic value', sourceCardIndex: 1, priority: 'good' },
      { label: 'Tradeoff', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Risk', sourceCardIndex: 4, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Credential as leverage', body: 'Education supports the long-term ML path and career leverage rather than existing as an isolated school panel.', sourceCardIndex: 1 },
      { title: 'Execution balance', body: 'The page should keep study depth visible without letting it crowd shipping, career, and health priorities.', sourceCardIndex: 2 },
      { title: 'Overload watch', body: 'Education risk rises when too many active fronts compete for sustained attention.', sourceCardIndex: 4 },
      { title: 'Milestone gap', body: 'Concrete courses, deadlines, and checkpoints need to become structured source data in the next pass.', sourceCardIndex: 5 },
    ],
    evidenceRows: [
      { title: 'Georgia Tech MSML', body: 'Primary academic anchor for the current education lane.', sourceCardIndex: 0 },
      { title: 'Career linkage', body: 'Education is tied directly to future career leverage and ML positioning.', sourceCardIndex: 1 },
      { title: 'Missing deadline feed', body: 'The page needs direct course/deadline evidence before it can behave like a school dashboard.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Protect the study lane', body: 'Keep the next academic checkpoint visible without letting it become vague background pressure.', sourceCardIndex: 5 },
      { title: 'Balance depth and shipping', body: 'Choose study moves that support career leverage while preserving execution momentum.', sourceCardIndex: 2 },
      { title: 'Add course checkpoints', body: 'Next data-model work should expose courses, deliverables, due dates, and completion status.', sourceCardIndex: 5 },
    ],
  },
  knowledge: {
    headline: 'Decision-support knowledge board',
    metrics: [
      { label: 'Learning domains', sourceCardIndex: 0, priority: 'good' },
      { label: 'Mental models', sourceCardIndex: 1, priority: 'watch' },
      { label: 'Recent knowledge', sourceCardIndex: 2, priority: 'stale' },
      { label: 'Gap to close', sourceCardIndex: 5, priority: 'stale' },
    ],
    operatingRows: [
      { title: 'Knowledge for action', body: 'The section should improve decisions in career, ventures, health, and identity rather than become an archive.', sourceCardIndex: 0 },
      { title: 'Model extraction', body: 'Mental models need to be surfaced as reusable decision tools, not buried in prose.', sourceCardIndex: 1 },
      { title: 'Reference hierarchy', body: 'Goals and identity notes currently act as the strongest high-value references.', sourceCardIndex: 3 },
      { title: 'Recency gap', body: 'Recent additions are not yet projected, so the page must mark that data gap plainly.', sourceCardIndex: 2 },
    ],
    evidenceRows: [
      { title: 'Strategic notes', body: 'Current source strength is in goals, identity, and practical planning documents.', sourceCardIndex: 3 },
      { title: 'Reading goal', body: 'The active reading goal supplies one explicit learning target.', sourceCardIndex: 4 },
      { title: 'Knowledge rollup gap', body: 'The next projection pass needs deeper traversal of knowledge-side sources.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Extract one usable model', body: 'Turn the highest-value note into a decision rule or checklist that can improve execution.', sourceCardIndex: 1 },
      { title: 'Connect recency', body: 'Add latest-note and latest-reference timestamps so the page can distinguish live learning from old material.', sourceCardIndex: 2 },
      { title: 'Tie reading to action', body: 'Use the reading goal only when it produces a clearer choice or stronger operating principle.', sourceCardIndex: 4 },
    ],
  },
  relationships: {
    headline: 'Connection and care board',
    metrics: [
      { label: 'Relationship posture', sourceCardIndex: 0, priority: 'good' },
      { label: 'Care focus', sourceCardIndex: 1, priority: 'good' },
      { label: 'Growth edge', sourceCardIndex: 2, priority: 'watch' },
      { label: 'Privacy boundary', sourceCardIndex: 5, priority: 'watch' },
    ],
    operatingRows: [
      { title: 'Care without oversharing', body: 'This page should keep relationship direction useful while avoiding intimate or unnecessary detail.', sourceCardIndex: 0 },
      { title: 'Family and future partner path', body: 'The useful operating signal is who and what needs attention, not a full private diary.', sourceCardIndex: 1 },
      { title: 'Social positioning', body: 'Confidence, environment, and consistent exposure are the current growth levers.', sourceCardIndex: 2 },
      { title: 'Context fit', body: 'The blocker is treated as a practical environment and exposure problem, not a judgment-heavy personal label.', sourceCardIndex: 3 },
    ],
    evidenceRows: [
      { title: 'Planning layer', body: 'Current evidence is directional and strategy-heavy; direct relationship logs should stay minimal.', sourceCardIndex: 0 },
      { title: 'Identity connection', body: 'Social confidence and environment are linked back to the Identity page.', sourceCardIndex: 2 },
      { title: 'Privacy rule', body: 'Sensitive details should be summarized into safe operating signals before rendering.', sourceCardIndex: 5 },
    ],
    actionRows: [
      { title: 'Choose one care action', body: 'Make the next relationship move concrete and respectful without exposing private context.', sourceCardIndex: 1 },
      { title: 'Improve environment fit', body: 'Prioritize contexts that make good connection more likely instead of relying on intention alone.', sourceCardIndex: 3 },
      { title: 'Keep the page minimal', body: 'Future source integrations should summarize patterns and reminders, not display raw sensitive notes.', sourceCardIndex: 5 },
    ],
  },
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatActionTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'timestamp unavailable'
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatEducationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date pending'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
}

function BusinessEmptyState({ label, title, body }: EmptyStateProps) {
  return (
    <div className="business-empty-state">
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}

function RuntimeTrailPanel({ items }: { items: CommandHistoryEntry[] }) {
  return (
    <article className="glass-panel runtime-trail-panel">
      <div className="revamp-kicker">Runtime Trail</div>
      {items.length > 0 ? (
        <div className="runtime-trail-list">
          {items.map((item) => (
            <div key={item.id} className="runtime-trail-item">
              <span>{item.action?.status.replace(/_/g, ' ') ?? 'recorded'} · {item.action ? formatActionTime(item.action.executedAt) : 'timestamp unavailable'}</span>
              <strong>{item.action?.label ?? item.text}</strong>
              <p>{item.handoff ? `${item.handoff.status.replace(/_/g, ' ')} · ${item.handoff.auditId}` : item.action?.effect}</p>
            </div>
          ))}
        </div>
      ) : (
        <BusinessEmptyState
          label="Runtime trail"
          title="No actions recorded yet"
          body="Commands, assistant handoffs, and review decisions will collect here as the cockpit moves work."
        />
      )}
    </article>
  )
}

function loadStoredLoginState() {
  if (typeof window === 'undefined') return { attempts: 0, lockoutUntil: 0 }
  try {
    const raw = window.localStorage.getItem(LOGIN_STATE_KEY)
    if (!raw) return { attempts: 0, lockoutUntil: 0 }
    const parsed = JSON.parse(raw) as { attempts?: number; lockoutUntil?: number }
    return {
      attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
      lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : 0,
    }
  } catch {
    return { attempts: 0, lockoutUntil: 0 }
  }
}

function loadStoredSession() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SESSION_KEY) === 'true'
}

function storeLoginState(state: { attempts: number; lockoutUntil: number }) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(state))
}

function isRuntimeAction(value: unknown): value is BusinessCommandResponse['runtimeAction'] {
  if (!value || typeof value !== 'object') return false
  const action = value as Partial<BusinessCommandResponse['runtimeAction']>
  return typeof action.id === 'string' &&
    typeof action.label === 'string' &&
    typeof action.status === 'string' &&
    typeof action.effect === 'string'
}

function isCommandHandoff(value: unknown): value is CommandHandoffResponse {
  if (!value || typeof value !== 'object') return false
  const handoff = value as Partial<CommandHandoffResponse>
  return typeof handoff.auditId === 'string' &&
    typeof handoff.status === 'string' &&
    typeof handoff.message === 'string' &&
    typeof handoff.recordedAt === 'string'
}

function loadStoredCommandHistory(): CommandHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(COMMAND_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<CommandHistoryEntry>[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => typeof item.id === 'string' && typeof item.text === 'string' && typeof item.context === 'string')
      .map((item) => ({
        id: item.id as string,
        text: item.text as string,
        context: item.context as string,
        action: isRuntimeAction(item.action) ? item.action : undefined,
        handoff: isCommandHandoff(item.handoff) ? item.handoff : undefined,
      }))
      .slice(0, 6)
  } catch {
    return []
  }
}

function storeCommandHistory(history: CommandHistoryEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(history.slice(0, 6)))
}

function normalizeIdentityQuality(item: Partial<IdentityQuality>, fallback: IdentityQuality): IdentityQuality {
  return {
    id: typeof item.id === 'string' ? item.id : fallback.id,
    name: typeof item.name === 'string' ? item.name : fallback.name,
    score: typeof item.score === 'number' ? Math.min(10, Math.max(1, item.score)) : fallback.score,
    tenMeans: typeof item.tenMeans === 'string' ? item.tenMeans : fallback.tenMeans,
    nextAction: typeof item.nextAction === 'string' ? item.nextAction : fallback.nextAction,
    source: typeof item.source === 'string' ? item.source : fallback.source,
  }
}

function loadStoredIdentityQualities(sourceQualities: IdentityQuality[] = DEFAULT_IDENTITY_QUALITIES): IdentityQuality[] {
  if (typeof window === 'undefined') return sourceQualities
  try {
    const raw = window.localStorage.getItem(IDENTITY_QUALITIES_KEY)
    if (!raw) return sourceQualities
    const parsed = JSON.parse(raw) as Partial<IdentityQuality>[]
    if (!Array.isArray(parsed)) return sourceQualities

    if (!sourceQualities.length) {
      return parsed
        .filter((item) => typeof item.id === 'string' && typeof item.name === 'string')
        .map((item, index) => normalizeIdentityQuality(item, DEFAULT_IDENTITY_QUALITIES[index] ?? {
          id: item.id as string,
          name: item.name as string,
          score: 5,
          tenMeans: 'The ideal version of this quality is clear and lived daily.',
          nextAction: 'Pick one small behavior that proves this today.',
          source: 'Manual identity edit',
        }))
    }

    const storedById = new Map(parsed.filter((item) => typeof item.id === 'string').map((item) => [item.id as string, item]))
    return sourceQualities.map((sourceQuality) => normalizeIdentityQuality(storedById.get(sourceQuality.id) ?? {}, sourceQuality))
  } catch {
    return sourceQualities
  }
}

function storeIdentityQualities(qualities: IdentityQuality[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(IDENTITY_QUALITIES_KEY, JSON.stringify(qualities))
}

function loadStoredSkillAnswers(): SkillAnswerState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(SKILL_ANSWERS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SkillAnswerState
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function storeSkillAnswers(answers: SkillAnswerState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SKILL_ANSWERS_KEY, JSON.stringify(answers))
}

function loadStoredEnabledSkills(): PersonalAppPage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ENABLED_SKILLS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PersonalAppPage[]
    return Array.isArray(parsed) ? parsed.filter(isPersonalAppPage) : []
  } catch {
    return []
  }
}

function storeEnabledSkills(skills: PersonalAppPage[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ENABLED_SKILLS_KEY, JSON.stringify(skills))
}

function skillFolderName(bundle: PersonalAppBundle) {
  return bundle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function skillMarkdownPreview(bundle: PersonalAppBundle, answers: string[]) {
  const folder = skillFolderName(bundle)
  const answerLines = bundle.skillFlow?.onboardingQuestions.map((question, index) => {
    const answer = answers[index]?.trim() || '[user answer]'
    return `- ${question}\n  Answer: ${answer}`
  }) ?? []
  const workflowLines = bundle.skillFlow?.workflowPreview.map((item) => `- ${item}`) ?? []
  const permissionLines = bundle.skillFlow?.permissionsAndTools.map((item) => `- ${item}`) ?? []

  return `# ${bundle.title}\n\n## Purpose\n${bundle.template.purpose}\n\n## User Onboarding Answers\n${answerLines.join('\n')}\n\n## Setup Workflow\n- Create skills/${folder}/SKILL.md from this completed setup.\n${workflowLines.join('\n')}\n\n## Daily Summary Section\nWhen this Skill is enabled, add a ${bundle.title} section to the user's daily summary with the latest signal, useful prompt, and next action.\n\n## Permissions And Tools\n${permissionLines.join('\n')}\n\n## Enablement\nWhen enabled, register ${bundle.title} with the Personal Assistant, make it available from Telegram capture, and include it in daily summaries.`
}

function App() {
  const [authed, setAuthed] = useState(() => loadStoredSession())
  const [currentPage, setCurrentPage] = useState<AppPage>(() => pageFromBrowserLocation())
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandValue, setCommandValue] = useState('')
  const [login, setLogin] = useState<LoginState>({ username: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(() => loadStoredLoginState().attempts)
  const [lockoutUntil, setLockoutUntil] = useState(() => loadStoredLoginState().lockoutUntil)
  const [now, setNow] = useState(() => Date.now())
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>(() => loadStoredCommandHistory())
  const [commandResponse, setCommandResponse] = useState('Control center live. Projection layers active, Business Command ready, and the next move can route from here.')
  const [reviewNoteDrafts, setReviewNoteDrafts] = useState<Record<string, string>>({})
  const [selectedReviewTaskId, setSelectedReviewTaskId] = useState<string | null>(null)
  const [projectedSections, setProjectedSections] = useState<Partial<Record<PersonalProjectionKey, LiveProjectedSection>>>({})
  const [categoryLensIndex, setCategoryLensIndex] = useState<Partial<Record<Exclude<PersonalSection, 'home'>, number>>>({})
  const [skillAnswers, setSkillAnswers] = useState<SkillAnswerState>(() => loadStoredSkillAnswers())
  const [enabledSkills, setEnabledSkills] = useState<PersonalAppPage[]>(() => loadStoredEnabledSkills())
  const [identityQualityEdits, setIdentityQualityEdits] = useState<IdentityQuality[]>(() => loadStoredIdentityQualities([]))
  const [identityScoresEditable, setIdentityScoresEditable] = useState(false)
  const [educationAlternativesOpen, setEducationAlternativesOpen] = useState(false)
  const [expandedCareerCategories, setExpandedCareerCategories] = useState<Record<string, boolean>>({
    'current-job': true,
    'job-search': false,
    portfolio: false,
  })
  const [expandedCareerSections, setExpandedCareerSections] = useState<Record<string, boolean>>({})
  const [expandedWealthPanels, setExpandedWealthPanels] = useState<Record<string, boolean>>({
    'net-worth': true,
    'real-hourly-value': false,
    cashflow: false,
    budgeting: false,
  })
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [selectedVentureId, setSelectedVentureId] = useState<string | null>(null)
  const [financeStatus, setFinanceStatus] = useState<FinanceStatus | null>(null)
  const [financeBusy, setFinanceBusy] = useState(false)
  const [financeMessage, setFinanceMessage] = useState('Finance integration is waiting on provider credentials.')
  const [manualFinanceDraft, setManualFinanceDraft] = useState<ManualFinanceDraft>({
    type: 'asset',
    name: '',
    category: '',
    value: '',
    notes: '',
  })
  const [budgetDraft, setBudgetDraft] = useState<BudgetDraft>({
    category: '',
    plannedAmount: '',
    month: new Date().toISOString().slice(0, 7),
    notes: '',
  })
  const dashboardData = useDashboardData()
  const appMode: AppMode = isBusinessPage(currentPage) ? 'business' : 'personal'
  const personalSection: PersonalSection = isBusinessPage(currentPage) || isPersonalAssistantPage(currentPage) || isPersonalAppPage(currentPage) ? 'home' : currentPage
  const activePersonalApp = isPersonalAppPage(currentPage) ? PERSONAL_APP_BUNDLES.find((bundle) => bundle.page === currentPage) ?? null : null
  const isPersonalHome = currentPage === 'home'
  const businessPanel: BusinessPanel = isBusinessPage(currentPage) ? businessPanelFromPage(currentPage) : 'overview'
  const currentPath = PAGE_ROUTES[currentPage]

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleRouteChange = () => setCurrentPage(pageFromBrowserLocation())
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleRouteChange)
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || currentPage !== 'relationships') return
    const appPath = appPathFromBrowserPath(window.location.pathname).replace(/\/+$/, '') || '/'
    if (window.location.hash === '#/connections' || appPath === '/connections') {
      window.history.replaceState({}, '', browserPathForRoute(PERSONAL_ROUTES.relationships))
    }
  }, [currentPage])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    storeCommandHistory(commandHistory)
  }, [commandHistory])

  useEffect(() => {
    storeIdentityQualities(identityQualityEdits)
  }, [identityQualityEdits])

  useEffect(() => {
    if (currentPage === 'wealth') void refreshFinanceStatus()
  }, [currentPage])

  useEffect(() => {
    let cancelled = false

    async function primeProjections() {
      const keys: PersonalProjectionKey[] = ['vessel', 'identity', 'systems', 'ventures', 'career', 'knowledge', 'wealth', 'education', 'relationships', 'connections']
      const entries = await Promise.all(keys.map(async (key) => {
        try {
          const section = await loadProjectedSection(key)
          return section ? ([key, section] as const) : null
        } catch {
          return null
        }
      }))

      if (cancelled) return
      setProjectedSections(Object.fromEntries(entries.filter(Boolean) as Array<readonly [PersonalProjectionKey, LiveProjectedSection]>))
    }

    void primeProjections()
    return () => {
      cancelled = true
    }
  }, [])

  async function refreshFinanceStatus() {
    try {
      const status = await loadFinanceStatus()
      setFinanceStatus(status)
      setFinanceMessage(status.configured ? 'Finance backend is configured for read-only bank linking.' : `Missing ${status.missing.length} finance credential${status.missing.length === 1 ? '' : 's'}.`)
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Finance status check failed.')
    }
  }

  async function handleConnectFinancialAccounts() {
    setFinanceBusy(true)
    setFinanceMessage('Preparing secure bank-link session...')

    try {
      const tokenResponse = await createFinanceLinkToken()
      if (tokenResponse.status === 'needs_credentials') {
        setFinanceMessage(`Still missing: ${tokenResponse.missing.join(', ')}`)
        await refreshFinanceStatus()
        return
      }

      await loadPlaidLinkScript()
      if (!window.Plaid) throw new Error('Plaid Link did not initialize.')

      const handler = window.Plaid.create({
        token: tokenResponse.link_token,
        onSuccess: (publicToken, metadata) => {
          setFinanceBusy(true)
          setFinanceMessage('Link complete. Exchanging token on the backend...')
          void exchangeFinancePublicToken(publicToken, metadata)
            .then(async (result) => {
              if (result.status === 'linked') {
                setFinanceMessage('Institution linked. Use Sync now to pull balances and transactions.')
              } else if (result.status === 'needs_credentials') {
                setFinanceMessage(`Token exchange needs: ${result.missing.join(', ')}`)
              } else {
                setFinanceMessage(result.message)
              }
              await refreshFinanceStatus()
            })
            .catch((error) => {
              setFinanceMessage(error instanceof Error ? error.message : 'Token exchange failed.')
            })
            .finally(() => setFinanceBusy(false))
        },
        onExit: (error) => {
          setFinanceBusy(false)
          setFinanceMessage(error?.error_message ? `Plaid Link exited: ${error.error_message}` : 'Plaid Link closed.')
        },
      })

      handler.open()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Could not start account linking.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleSyncFinance() {
    const connectionId = financeStatus?.connections.items.find((item) => item.status === 'active')?.id
    if (!connectionId) {
      setFinanceMessage('No active connection is ready to sync.')
      return
    }

    setFinanceBusy(true)
    setFinanceMessage('Syncing linked accounts and transactions...')
    try {
      const result = await syncFinanceConnection(connectionId)
      if (result.status === 'synced') {
        setFinanceMessage(`Synced ${result.accounts ?? 0} account${result.accounts === 1 ? '' : 's'} and ${result.transactions ?? 0} transaction${result.transactions === 1 ? '' : 's'}.`)
      } else if (result.status === 'needs_credentials') {
        setFinanceMessage(`Sync needs: ${result.missing.join(', ')}`)
      } else if (result.status === 'invalid_request' || result.status === 'not_found') {
        setFinanceMessage(result.message ?? `Sync returned ${result.status}.`)
      } else {
        setFinanceMessage(`Sync returned ${result.status}.`)
      }
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Finance sync failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleDisconnectFinance() {
    const connectionId = financeStatus?.connections.items.find((item) => item.status === 'active' || item.status === 'paused' || item.status === 'relink_required')?.id
    if (!connectionId) {
      setFinanceMessage('No connection is available to disconnect.')
      return
    }

    setFinanceBusy(true)
    setFinanceMessage('Disconnecting institution and removing the stored provider token...')
    try {
      const result = await disconnectFinanceConnection(connectionId)
      if (result.status === 'disconnected') {
        setFinanceMessage('Institution disconnected and stored token removed.')
      } else if (result.status === 'needs_credentials') {
        setFinanceMessage(`Disconnect needs: ${result.missing.join(', ')}`)
      } else if (result.status === 'invalid_request' || result.status === 'not_found') {
        setFinanceMessage(result.message ?? `Disconnect returned ${result.status}.`)
      } else {
        setFinanceMessage(`Disconnect returned ${result.status}.`)
      }
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Finance disconnect failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleSaveManualFinanceEntry() {
    const value = Number(manualFinanceDraft.value)
    if (!manualFinanceDraft.name.trim() || !manualFinanceDraft.category.trim() || !Number.isFinite(value)) {
      setFinanceMessage('Manual entry needs a name, category, and numeric value.')
      return
    }

    setFinanceBusy(true)
    setFinanceMessage('Saving manual finance entry...')
    try {
      const result = await saveManualFinanceEntry({
        type: manualFinanceDraft.type,
        name: manualFinanceDraft.name,
        category: manualFinanceDraft.category,
        value,
        notes: manualFinanceDraft.notes,
      })
      if (result.status === 'saved') {
        setFinanceMessage('Manual entry saved.')
        setManualFinanceDraft({ type: 'asset', name: '', category: '', value: '', notes: '' })
      } else if (result.status === 'needs_credentials') {
        setFinanceMessage(`Manual entries need: ${result.missing.join(', ')}`)
      } else if (result.status === 'invalid_request' || result.status === 'not_found') {
        setFinanceMessage(result.message ?? `Manual entry returned ${result.status}.`)
      } else {
        setFinanceMessage(`Manual entry returned ${result.status}.`)
      }
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Manual entry save failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleRemoveManualFinanceEntry(id: string) {
    setFinanceBusy(true)
    setFinanceMessage('Removing manual finance entry...')
    try {
      const result = await removeManualFinanceEntry(id)
      setFinanceMessage(result.status === 'deleted' ? 'Manual entry removed.' : `Manual entry delete returned ${result.status}.`)
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Manual entry deletion failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleSaveMonthlyBudget() {
    const plannedAmount = Number(budgetDraft.plannedAmount)
    if (!budgetDraft.category.trim() || !Number.isFinite(plannedAmount) || plannedAmount < 0) {
      setFinanceMessage('Budget needs a category and non-negative planned amount.')
      return
    }

    setFinanceBusy(true)
    setFinanceMessage('Saving monthly budget target...')
    try {
      const result = await saveMonthlyBudget({
        category: budgetDraft.category,
        plannedAmount,
        month: budgetDraft.month,
        notes: budgetDraft.notes,
      })
      if (result.status === 'saved') {
        setFinanceMessage('Budget target saved.')
        setBudgetDraft((current) => ({ ...current, category: '', plannedAmount: '', notes: '' }))
      } else if (result.status === 'needs_credentials') {
        setFinanceMessage(`Budgeting needs: ${result.missing.join(', ')}`)
      } else if (result.status === 'invalid_request' || result.status === 'not_found') {
        setFinanceMessage(result.message ?? `Budget save returned ${result.status}.`)
      } else {
        setFinanceMessage(`Budget save returned ${result.status}.`)
      }
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Budget save failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleToggleFinanceAccount(accountId: string, field: 'includeInBudget' | 'includeInNetWorth', value: boolean) {
    setFinanceBusy(true)
    setFinanceMessage('Updating account settings...')
    try {
      const result = await updateFinanceAccountSettings({ accountId, [field]: value })
      setFinanceMessage(result.status === 'saved' ? 'Account settings updated.' : `Account settings returned ${result.status}.`)
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Account settings update failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  async function handleDeleteFinanceData() {
    if (!window.confirm('Delete all stored finance rows for this dashboard? This cannot be undone.')) return

    setFinanceBusy(true)
    setFinanceMessage('Deleting stored finance data...')
    try {
      const result = await deleteFinanceData()
      setFinanceMessage(result.status === 'deleted' ? 'Stored finance data deleted.' : `Delete data returned ${result.status}.`)
      await refreshFinanceStatus()
    } catch (error) {
      setFinanceMessage(error instanceof Error ? error.message : 'Finance data deletion failed.')
    } finally {
      setFinanceBusy(false)
    }
  }

  const lockedOut = lockoutUntil > now
  const commandSuggestions = COMMAND_SUGGESTIONS[appMode]
  const lockoutSeconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000))
  const businessSummary = dashboardData.summary
  const queueHealth = dashboardData.queueHealth
  const topPendingReview = dashboardData.artifactReviewItems[0]
  const selectedReviewTaskIdSafe = selectedReviewTaskId ?? topPendingReview?.taskId ?? null
  const selectedReviewItem = dashboardData.artifactReviewItems.find((item) => item.taskId === selectedReviewTaskIdSafe) ?? topPendingReview
  const selectedReviewDetail = selectedReviewItem ? dashboardData.getTaskDetail(selectedReviewItem.taskId) : undefined
  const businessAgents = dashboardData.agentChambers.slice(0, 6)
  const recentActivity = dashboardData.activityFeed.slice(0, 5)
  const commandPreview = useMemo(() => {
    const draft = commandValue.trim()
    if (!draft) return null
    return routeCommand(draft, { appMode, personalSection, businessPanel })
  }, [appMode, businessPanel, commandValue, personalSection])
  const runtimeTrailItems = useMemo(() => commandHistory.filter((item) => item.action || item.handoff), [commandHistory])
  const actionTrail = useMemo(() => runtimeTrailItems.slice(0, 3), [runtimeTrailItems])
  const pipelineRows = dashboardData.pipeline.slice(0, 8)
  const watchdogRows = dashboardData.watchdog.slice(0, 6)
  const reviewQueue = dashboardData.artifactReviewItems.slice(0, 6)
  const recentRuntimeActivity = dashboardData.activityFeed.slice(0, 6)
  const businessPageCopy = useMemo(() => {
    if (!isBusinessPage(currentPage)) {
      return {
        kicker: 'Business Command',
        title: 'Live operations command',
        body: 'Queue pressure, approvals, agent load, and publishing signals stay close enough for a fast decision.',
      }
    }
    const copy: Record<BusinessPage, { kicker: string; title: string; body: string }> = {
      'business-command': {
        kicker: 'Business Command',
        title: 'Live operations command',
        body: 'Queue pressure, approvals, agent load, and publishing signals stay close enough for a fast decision.',
      },
      agents: {
        kicker: 'Agents',
        title: 'Agent workload dashboard',
        body: 'Chambers, current assignments, runnable pressure, and blocked work are grouped as a first-class operations page.',
      },
      'review-dock': {
        kicker: 'Review Dock',
        title: 'Approval command lane',
        body: 'Pending artifacts, decision notes, latest events, and approval actions are the primary surface here.',
      },
      'runtime-trail': {
        kicker: 'Runtime Trail',
        title: 'Command provenance ledger',
        body: 'Commands, handoffs, review decisions, safety notes, and audit ids become the main operational record on this page.',
      },
    }
    return copy[currentPage]
  }, [currentPage])

  const currentPersonalContent = personalSection === 'home' ? null : PERSONAL_SECTION_CONTENT[personalSection]
  const currentPersonalData = useMemo<PersonalSectionData | null>(() => {
    if (personalSection === 'home' || !currentPersonalContent) return null
    const projected = projectedSections[personalSection as PersonalProjectionKey]
    if (projected) return projected
    return {
      heroSummary: `${currentPersonalContent.title} is drawing from PunkRecords so this chamber can present a focused operating view for Mitchell’s private control center.`,
      summaryCards: currentPersonalContent.summaryCards.map((card) => ({ label: card, value: 'Resolving', note: 'Source records are being organized into a usable operating signal.' })),
      highlights: currentPersonalContent.highlights,
    }
  }, [currentPersonalContent, personalSection, projectedSections])
  const sourceIdentityProjection = personalSection === 'identity' ? currentPersonalData?.identity : undefined
  const sourceIdentityQualities = useMemo(
    () => sourceIdentityProjection?.qualities?.length ? sourceIdentityProjection.qualities : DEFAULT_IDENTITY_QUALITIES,
    [sourceIdentityProjection],
  )
  const identityQualities = useMemo(() => {
    const storedById = new Map(identityQualityEdits.map((item) => [item.id, item]))
    return sourceIdentityQualities.map((sourceQuality) => normalizeIdentityQuality(storedById.get(sourceQuality.id) ?? {}, sourceQuality))
  }, [identityQualityEdits, sourceIdentityQualities])
  const sourceIdentityStatement = sourceIdentityProjection?.statement
    ?? currentPersonalData?.summaryCards.find((card) => card.label.toLowerCase().includes('identity statement'))?.note
    ?? 'Calm, disciplined, focused, and happy every day.'
  const identityStatement = sourceIdentityStatement
  const identityScoreHistory = sourceIdentityProjection?.scoreHistory?.length
    ? sourceIdentityProjection.scoreHistory
    : [{ label: 'Today', score: identityQualities.length ? Number((identityQualities.reduce((total, item) => total + item.score, 0) / identityQualities.length).toFixed(1)) : 0 }]
  const identityNightlyChanges = sourceIdentityProjection?.nightlyChanges?.length
    ? sourceIdentityProjection.nightlyChanges
    : [{ qualityId: identityQualities[0]?.id ?? 'identity', delta: 0, reason: 'Source projection is ready for the next nightly refresh.' }]
  const identityLastUpdatedLabel = sourceIdentityProjection?.lastUpdatedLabel ?? 'Latest source projection'

  const currentCoreDashboard = personalSection === 'vessel' || personalSection === 'identity' || personalSection === 'systems'
    ? CORE_DASHBOARD_DEFINITIONS[personalSection]
    : null
  const currentGrowthDashboard = personalSection === 'ventures' || personalSection === 'career' || personalSection === 'wealth' || personalSection === 'education' || personalSection === 'knowledge' || personalSection === 'relationships'
    ? GROWTH_DASHBOARD_DEFINITIONS[personalSection]
    : null
  const currentSectionDashboard = currentPersonalData?.dashboard ?? currentCoreDashboard ?? currentGrowthDashboard
  const currentGrowthLoop = useMemo(() => {
    if (personalSection === 'home' || !currentPersonalData || !currentSectionDashboard) return null
    const definition = GROWTH_LOOP_DEFINITIONS[personalSection]
    const primaryMetric = currentSectionDashboard.metrics[0]
    const primaryCard = primaryMetric ? currentPersonalData.summaryCards[primaryMetric.sourceCardIndex] : undefined
    const action = currentSectionDashboard.actionRows[0]
    const blocker = currentPersonalData.blockers?.[0] ?? currentPersonalData.missingData?.[0]
    return {
      definition,
      progressLabel: primaryCard?.label ?? primaryMetric?.label ?? 'Current signal',
      progressValue: primaryCard?.value ?? 'No signal yet',
      progressNote: primaryCard?.note ?? 'This loop is waiting for stronger source coverage.',
      nextAction: action?.title ?? 'Choose the next clean move',
      nextActionBody: action?.body ?? 'Pick the smallest action that makes the loop easier to repeat tomorrow.',
      blockerLabel: blocker ? `${blocker.label}: ${blocker.value}` : 'No critical blocker surfaced',
      blockerBody: blocker?.detail ?? definition.blocker,
    }
  }, [currentPersonalData, currentSectionDashboard, personalSection])
  const currentSignatureDashboard = personalSection === 'home' ? null : CATEGORY_SIGNATURE_DASHBOARDS[personalSection]
  const currentSignatureLensIndex = personalSection === 'home' ? 0 : categoryLensIndex[personalSection] ?? 0
  const currentDirective = PAGE_DIRECTIVES[currentPage]
  const primaryNextMove = currentSectionDashboard?.actionRows[0]?.title ??
    (isBusinessPage(currentPage)
      ? (topPendingReview ? `Review ${topPendingReview.taskTitle}` : 'Keep the operations lane clear')
      : 'Start with the strongest signal')
  const currentEvidenceLabel = currentPersonalData?.freshness?.label ??
    (isBusinessPage(currentPage) ? 'Live business runtime' : 'Projected personal records')
  const currentSignalQuality = currentPersonalData?.freshness?.stale ? 'Needs refresh' : appMode === 'business' ? 'Live feed' : 'Usable signal'
  const topActionClassName = `revamp-top-actions ${isPersonalHome ? 'home-actions' : 'detail-actions'}`
  const currentCrossDomainInsights = useMemo(() => {
    if (personalSection === 'home') return CROSS_DOMAIN_INSIGHTS.slice(0, 4)
    return CROSS_DOMAIN_INSIGHTS.filter((item) => item.pages.includes(personalSection)).slice(0, 3)
  }, [personalSection])
  const quickNavItems = useMemo(() => {
    const query = commandValue.trim().toLowerCase()
    const items = [...PERSONAL_NAV_ITEMS, ...PERSONAL_APP_NAV_ITEMS, ...BUSINESS_NAV_ITEMS]
    if (!query) return items
    return items.filter((item) => `${item.label} ${item.description} ${PAGE_ROUTES[item.page]}`.toLowerCase().includes(query)).slice(0, 6)
  }, [commandValue])
  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      {
        label: 'Open best next move',
        detail: primaryNextMove,
        prompt: `Turn this next move into a clear plan: ${primaryNextMove}`,
      },
      {
        label: 'Explain why this matters',
        detail: currentDirective.outcome,
        prompt: `Explain why ${pageLabel(currentPage)} matters for my growth today.`,
      },
    ]

    if (appMode === 'personal') {
      actions.push({
        label: 'Show linked leverage',
        detail: currentCrossDomainInsights[0]?.title ?? 'Cross-domain intelligence',
        page: currentCrossDomainInsights[0]?.pages[0] ?? 'systems',
      })
    } else {
      actions.push({
        label: 'Jump to review pressure',
        detail: topPendingReview ? topPendingReview.taskTitle : 'Review dock is clear',
        page: topPendingReview ? 'review-dock' : 'runtime-trail',
      })
    }

    return actions
  }, [appMode, currentCrossDomainInsights, currentDirective.outcome, currentPage, primaryNextMove, topPendingReview])
  const crossDomainSummary = useMemo(() => {
    const personalPages: Exclude<PersonalSection, 'home'>[] = ['vessel', 'identity', 'systems', 'ventures', 'career', 'wealth', 'education', 'knowledge', 'relationships']
    const staleCount = personalPages.filter((page) => projectedSections[page]?.freshness?.stale).length
    const missingCount = personalPages.reduce((total, page) => total + (projectedSections[page]?.missingData?.length ?? 0), 0)
    const groundedCount = personalPages.filter((page) => sourceConfidence(projectedSections[page]) === 'Grounded').length
    return { staleCount, missingCount, groundedCount }
  }, [projectedSections])
  const commandHorizonStats = useMemo(() => {
    const reviewPressure = businessSummary.approvalsPending + (queueHealth?.flagged_count ?? 0)
    const runtimeLoad = (queueHealth?.runnable_count ?? 0) + actionTrail.length
    const sourceScore = Math.max(0, crossDomainSummary.groundedCount - crossDomainSummary.staleCount)
    const horizonHealth = sourceScore >= 6 && reviewPressure === 0 ? 'Clear' : reviewPressure > 0 ? 'Pressure' : 'Building'
    return [
      {
        label: 'Growth signal',
        value: appMode === 'personal' ? `${crossDomainSummary.groundedCount}/9 grounded` : `${businessSummary.publishedToday} shipped`,
        detail: appMode === 'personal' ? `${crossDomainSummary.missingCount} data gaps tracked` : `${runtimeLoad} runtime traces loaded`,
      },
      {
        label: 'Pressure',
        value: reviewPressure > 0 ? `${reviewPressure} to resolve` : 'Clear lane',
        detail: reviewPressure > 0 ? 'Review and flagged work need attention' : 'No flagged review pressure surfaced',
      },
      {
        label: 'Operating mode',
        value: horizonHealth,
        detail: `${currentDirective.cadence} cadence`,
      },
    ]
  }, [actionTrail.length, appMode, businessSummary.approvalsPending, businessSummary.publishedToday, crossDomainSummary.groundedCount, crossDomainSummary.missingCount, crossDomainSummary.staleCount, currentDirective.cadence, queueHealth?.flagged_count, queueHealth?.runnable_count])

  const highlightCards = useMemo<ProjectionHighlightCard[]>(() => {
    if (!currentPersonalData) return []
    return currentPersonalData.highlights.slice(0, 3).map((item, index) => ({
      title: currentPersonalData.summaryCards[index]?.label ?? `Highlight ${index + 1}`,
      text: item,
    }))
  }, [currentPersonalData])

  function navigateToPage(page: AppPage) {
    setCurrentPage(page)
    setCommandOpen(false)
    if (typeof window === 'undefined') return
    const nextPath = browserPathForRoute(PAGE_ROUTES[page])
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
  }

  function updateIdentityQuality(id: string, updates: Partial<IdentityQuality>) {
    setIdentityQualityEdits(identityQualities.map((item) => (
      item.id === id
        ? { ...item, ...updates, score: updates.score === undefined ? item.score : Math.min(10, Math.max(1, updates.score)) }
        : item
    )))
  }

  useEffect(() => {
    if (!authed || typeof window === 'undefined') return
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        return
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [authed])

  async function handleLoginSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (lockedOut) {
      setLoginError(`Too many attempts. Try again in ${lockoutSeconds}s.`)
      return
    }
    if (login.username === VALID_USERNAME && login.password === VALID_PASSWORD) {
      setAuthed(true)
      setLoginError(null)
      setAttempts(0)
      setLockoutUntil(0)
      storeLoginState({ attempts: 0, lockoutUntil: 0 })
      window.localStorage.setItem(SESSION_KEY, 'true')
      return
    }
    const nextAttempts = attempts + 1
    const nextLockout = nextAttempts >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
    setAttempts(nextAttempts)
    setLockoutUntil(nextLockout)
    storeLoginState({ attempts: nextAttempts, lockoutUntil: nextLockout })
    setLoginError(nextLockout ? 'Too many failed attempts. Temporary lockout enabled.' : `Incorrect login. ${Math.max(0, MAX_LOGIN_ATTEMPTS - nextAttempts)} tries left.`)
  }

  function logout() {
    setAuthed(false)
    window.localStorage.removeItem(SESSION_KEY)
  }

  async function decideReview(taskId: string, status: 'approved' | 'rejected') {
    try {
      if (status === 'rejected' && !(reviewNoteDrafts[taskId] || '').trim()) {
        setCommandResponse('Review hold: a denial needs notes so the next pass has clear direction.')
        return
      }
      const reviewTitle = selectedReviewItem?.taskTitle ?? taskId
      const reviewProject = selectedReviewItem?.projectTitle
      const notes = reviewNoteDrafts[taskId] || undefined
      await dashboardData.decideTaskApproval(taskId, status, notes)
      const action: BusinessCommandResponse['runtimeAction'] = {
        id: `review-${status}-${taskId}`,
        label: status === 'approved' ? 'Approve review item' : 'Reject review item',
        target: 'dashboard-runtime',
        status: 'executed',
        effect: status === 'approved'
          ? `Approval sent for ${reviewTitle}; the review lane can advance from this decision.`
          : `Denial sent for ${reviewTitle}; the next pass now has explicit review feedback.`,
        safety: status === 'approved'
          ? 'Approval used the explicit review button; no assistant or external message was dispatched by the command trail.'
          : 'Denial used the explicit review button and required notes before the live review update was sent.',
        provenance: [
          `task:${taskId}`,
          `decision:${status}`,
          reviewProject ? `project:${reviewProject}` : 'project:unknown',
          notes ? 'notes:present' : 'notes:none',
        ],
        executedAt: new Date().toISOString(),
      }
      setCommandHistory((prev) => [{ id: `${Date.now()}`, text: `${status === 'approved' ? 'Approved' : 'Rejected'} review: ${reviewTitle}`, context: 'business · review', action }, ...prev].slice(0, 6))
      setCommandResponse(status === 'approved' ? 'Approval sent. Business Command cleared this item and saved the review action trace.' : 'Denial sent with notes. The review lane now has feedback and a saved action trace.')
      setSelectedReviewTaskId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Approval action failed.'
      setCommandResponse(message)
    }
  }

  async function submitCommand() {
    if (!commandValue.trim()) return
    const trimmed = commandValue.trim()
    const commandContextLabel = `${appMode} · ${appMode === 'personal' ? personalSection : businessPanel}`
    try {
      const response = await sendBusinessCommand(trimmed, { appMode, personalSection, businessPanel }, businessSummary)
      const handoff = response.runtimeAction.target === 'assistant-runtime'
        ? await sendCommandHandoff(trimmed, commandContextLabel, response.runtimeAction)
        : undefined
      if (appMode === 'business' && response.suggestedPanel) {
        navigateToPage(response.suggestedPanel === 'agents' ? 'agents' : response.suggestedPanel === 'review' ? 'review-dock' : 'business-command')
      }
      setCommandHistory((prev) => [{ id: `${Date.now()}`, text: trimmed, context: commandContextLabel, action: response.runtimeAction, handoff }, ...prev].slice(0, 6))
      setCommandResponse(`Command routed to ${response.route}. ${response.message} Runtime action: ${response.runtimeAction.effect}${handoff ? ` Handoff: ${handoff.message}` : ''} Next move: ${response.nextAction}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command routing failed.'
      setCommandHistory((prev) => [{ id: `${Date.now()}`, text: trimmed, context: commandContextLabel }, ...prev].slice(0, 6))
      setCommandResponse(message)
    }
    setCommandValue('')
  }

  function updateSkillAnswer(page: PersonalAppPage, index: number, value: string) {
    setSkillAnswers((prev) => {
      const nextAnswers = [...(prev[page] ?? [])]
      nextAnswers[index] = value
      const next = { ...prev, [page]: nextAnswers }
      storeSkillAnswers(next)
      return next
    })
  }

  function enableSkill(page: PersonalAppPage) {
    setEnabledSkills((prev) => {
      const next = prev.includes(page) ? prev : [...prev, page]
      storeEnabledSkills(next)
      return next
    })
  }

  function renderPersonalAssistantPage() {
    const enabledCount = enabledSkills.length
    const dailySummarySections = PERSONAL_APP_BUNDLES.filter((bundle) => enabledSkills.includes(bundle.page))

    return (
      <main className="revamp-detail-page personal-assistant-page">
        <section className="personal-assistant-skills docked" aria-label="Assistant capabilities">
          <div className="personal-assistant-section-head">
            <div>
              <div className="revamp-kicker">Assistant Capabilities</div>
              <h3>Skills are what the assistant can do.</h3>
            </div>
            <span>{enabledCount}/{PERSONAL_APP_BUNDLES.length} enabled</span>
          </div>
          <div className="assistant-skill-dock">
            {PERSONAL_APP_BUNDLES.map((bundle) => (
              <button
                key={bundle.page}
                type="button"
                role="listitem"
                className={`home-app-icon assistant-skill-icon ${bundle.accent} ${enabledSkills.includes(bundle.page) ? 'enabled' : ''}`}
                aria-label={`Open ${bundle.title}. ${enabledSkills.includes(bundle.page) ? 'Enabled' : 'Available'}.`}
                onClick={() => navigateToPage(bundle.page)}
              >
                <span aria-hidden="true">{bundle.icon}</span>
                <strong>{bundle.title}</strong>
                <small>{enabledSkills.includes(bundle.page) ? 'Enabled' : 'Available'}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="personal-assistant-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="personal-assistant-mark" aria-hidden="true">PA</div>
          <div>
            <div className="revamp-kicker">MyAIgent Core</div>
            <h2>Personal Assistant</h2>
            <p>One Shika-like assistant layer that turns enabled Skills into daily capabilities, summaries, prompts, and follow-through.</p>
          </div>
          <aside className="section-utility-card">
            <span>{enabledCount} enabled</span>
            <strong>Daily operating loop</strong>
            <p>Enabled Skills become sections in the daily summary and actions the assistant can actually perform.</p>
          </aside>
        </section>

        <section className="personal-assistant-summary" aria-label="Daily summary sections">
          <div>
            <div className="revamp-kicker">Active Daily Summary Sections</div>
            <h3>{dailySummarySections.length ? 'Enabled Skills feeding the assistant.' : 'No Skills enabled yet.'}</h3>
          </div>
          <div className="assistant-summary-pills">
            {dailySummarySections.length ? dailySummarySections.map((bundle) => (
              <span key={bundle.page}>{bundle.title}</span>
            )) : <span>Open a Skill, answer onboarding, then enable it.</span>}
          </div>
        </section>

        <section className="personal-assistant-operating-lines" aria-label="Personal Assistant operating model">
          <div>
            <span>Assistant Role</span>
            <strong>Context-aware support without ceremony.</strong>
            <p>A direct personal assistant for Mitchell that keeps the day honest by turning scattered signals into next actions, check-ins, reminders, and summary sections.</p>
          </div>
          <div>
            <span>Daily Summary</span>
            <strong>Skills become summary blocks.</strong>
            <p>When a Skill is enabled, it earns a section in the daily summary. Disabled Skills stay available for setup, but they do not add prompts or review blocks.</p>
          </div>
          <div>
            <span>Boundaries</span>
            <strong>Helpful by default, careful by design.</strong>
            <p>The assistant asks before sharing private information, messaging others, spending money, changing calendars, or treating health or finance guidance as professional advice.</p>
          </div>
        </section>
      </main>
    )
  }

  function renderPersonalAppPage(bundle: PersonalAppBundle) {
    const answers = skillAnswers[bundle.page] ?? []
    const skillEnabled = enabledSkills.includes(bundle.page)
    const generatedSkillMarkdown = skillMarkdownPreview(bundle, answers)
    const templateSections: Array<{ title: string; items: string[] }> = bundle.skillFlow
      ? [
          { title: 'Brief Description', items: bundle.skillFlow.description },
          { title: 'Complete SKILL.md Setup Workflow', items: bundle.skillFlow.workflowPreview },
          { title: 'Permissions / Tools', items: bundle.skillFlow.permissionsAndTools },
          { title: 'Enable Steps', items: bundle.skillFlow.enableSteps },
        ]
      : [
          { title: 'Setup Inputs', items: bundle.template.setupInputs },
          { title: 'Repo Files', items: bundle.template.repoFiles },
          { title: 'Telegram Flows', items: bundle.template.telegramFlows },
          { title: 'Dashboard Modules', items: bundle.template.dashboardModules },
          { title: 'Automations', items: bundle.template.automations },
          { title: 'Permissions', items: bundle.template.permissions },
          { title: 'Install Checklist', items: bundle.template.installChecklist },
        ]

    return (
      <main className="revamp-detail-page personal-app-page">
        <section className={`personal-app-hero ${bundle.accent}`}>
          <button className="back-button" onClick={() => navigateToPage('personal-assistant')}>Assistant</button>
          <div className="personal-app-hero-icon" aria-hidden="true">{bundle.icon}</div>
          <div className="personal-app-hero-copy">
            <div className="revamp-kicker">MyAIgent Skill Package</div>
            <h2>{bundle.title}</h2>
            <p>{bundle.tagline}</p>
          </div>
        </section>

        <section className="personal-app-overview" aria-label={`${bundle.title} overview`}>
          <article className="glass-panel personal-app-overview-prime">
            <div className="revamp-kicker">Overview</div>
            <h3>Connected workflow, packaged as a Skill.</h3>
            <p>{bundle.overview}</p>
          </article>
          <article className="glass-panel personal-app-purpose">
            <div className="revamp-kicker">Skill Purpose</div>
            <p>{bundle.template.purpose}</p>
          </article>
          <article className="glass-panel personal-app-signals">
            <div className="revamp-kicker">Connected To</div>
            <div>
              {bundle.connectedSignals.map((signal) => <span key={signal}>{signal}</span>)}
            </div>
          </article>
        </section>

        {bundle.skillFlow ? (
          <section className="skill-builder-grid" aria-label={`${bundle.title} onboarding builder`}>
            <article className="glass-panel skill-question-panel">
              <div className="revamp-kicker">User Onboarding Questions</div>
              <h3>Answers that fill in the generated Skill.</h3>
              <div className="skill-question-list">
                {bundle.skillFlow.onboardingQuestions.map((question, index) => (
                  <label key={question} className="skill-question-field">
                    <span>{question}</span>
                    <textarea
                      value={answers[index] ?? ''}
                      onChange={(event) => updateSkillAnswer(bundle.page, index, event.target.value)}
                      placeholder="User answer goes here"
                      rows={3}
                    />
                  </label>
                ))}
              </div>
            </article>
            <article className="glass-panel skill-generated-panel">
              <div className="skill-generated-head">
                <div>
                  <div className="revamp-kicker">Generated Skill.md</div>
                  <h3>OpenClaw setup preview</h3>
                </div>
                <button
                  className={skillEnabled ? 'revamp-command-btn solid' : 'revamp-command-btn'}
                  onClick={() => enableSkill(bundle.page)}
                >
                  {skillEnabled ? 'Skill enabled' : 'Enable Skill'}
                </button>
              </div>
              <pre>{generatedSkillMarkdown}</pre>
            </article>
          </section>
        ) : null}

        <section className="personal-app-template" aria-label={`${bundle.title} template details`}>
          <div className="personal-app-template-head">
            <div>
              <div className="revamp-kicker">{bundle.skillFlow ? 'Skill Flow' : 'Reusable Template'}</div>
              <h3>{bundle.skillFlow ? 'Everything needed to review and enable this coaching Skill.' : 'Everything another OpenClaw needs to install this Skill cleanly.'}</h3>
            </div>
            <span>{PAGE_ROUTES[bundle.page]}</span>
          </div>
          <div className="personal-app-template-grid">
            {templateSections.map((section) => (
              <article key={section.title} className="personal-app-template-card">
                <span>{section.title}</span>
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
    )
  }

  function renderBusinessHero() {
    return (
      <article className="glass-panel hero-business-panel business-page-hero">
        <div>
          <div className="revamp-kicker">{businessPageCopy.kicker}</div>
          <h2>{businessPageCopy.title}</h2>
          <p>{businessPageCopy.body}</p>
        </div>
        <div className="business-panel-switches">
          {BUSINESS_NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              className={currentPage === item.page ? 'revamp-toggle active' : 'revamp-toggle'}
              onClick={() => navigateToPage(item.page as BusinessPage)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="business-hero-strip">
          <article className="business-signal-card">
            <span>Approval pressure</span>
            <strong>{businessSummary.approvalsPending}</strong>
            <p>{topPendingReview ? `Top queue item: ${topPendingReview.taskTitle}` : 'Review lane clear. New approval pressure will surface here with the next artifact.'}</p>
          </article>
          <article className="business-signal-card">
            <span>Runtime load</span>
            <strong>{queueHealth?.runnable_count ?? 0} runnable</strong>
            <p>{queueHealth?.flagged_count ?? 0} flagged tasks need attention.</p>
          </article>
          <article className="business-signal-card">
            <span>Output today</span>
            <strong>{businessSummary.publishedToday}</strong>
            <p>{recentActivity[0] ? `${recentActivity[0].taskTitle} · ${recentActivity[0].eventType}` : 'Output lane quiet. The next publication event will become the lead signal.'}</p>
          </article>
        </div>
      </article>
    )
  }

  function renderBusinessMetricGrid() {
    return (
      <section className="revamp-card-grid business-metric-grid">
        <article className="glass-panel business-metric-card"><span>Ventures</span><strong>{dashboardData.projects.length}</strong><p>Tracked projects visible in Supabase.</p></article>
        <article className="glass-panel business-metric-card"><span>Revenue / Margin</span><strong>{formatUsd(businessSummary.revenueUsd)} / {formatUsd(businessSummary.marginUsd)}</strong><p>Latest live business snapshot.</p></article>
        <article className="glass-panel business-metric-card"><span>Approval Pressure</span><strong>{businessSummary.approvalsPending}</strong><p>Items waiting in review.</p></article>
        <article className="glass-panel business-metric-card"><span>Recent Output</span><strong>{businessSummary.publishedToday} today</strong><p>{recentActivity[0] ? `${recentActivity[0].taskTitle} · ${recentActivity[0].eventType}` : 'Output lane quiet. The command deck is ready for the next release cycle.'}</p></article>
      </section>
    )
  }

  function renderReviewDockPanel(mode: 'full' | 'compact') {
    return (
      <article className={`glass-panel review-dock-panel ${mode === 'full' ? 'review-dock-full' : ''}`}>
        <div className="revamp-kicker">Review Dock</div>
        {selectedReviewItem ? (
          <>
            <h3>{selectedReviewItem.taskTitle}</h3>
            <p>{selectedReviewItem.projectTitle ?? 'Unassigned project'} · {selectedReviewItem.artifactType}</p>
            <div className="review-dock-meta">
              <div>
                <span>Status</span>
                <strong>{selectedReviewItem.approvalStatus}</strong>
              </div>
              <div>
                <span>Artifacts</span>
                <strong>{selectedReviewDetail ? selectedReviewDetail.artifacts.length : 0}</strong>
              </div>
              <div>
                <span>Approvals</span>
                <strong>{selectedReviewDetail ? selectedReviewDetail.approvals.length : 0}</strong>
              </div>
            </div>
            {selectedReviewDetail ? (
              <div className="review-detail-stack">
                <div className="review-detail-card">
                  <span>Latest event</span>
                  <strong>{selectedReviewDetail.events[0]?.event_type ?? 'No event yet'}</strong>
                  <p>{(() => {
                    const payload = selectedReviewDetail.events[0]?.payload
                    if (payload && typeof payload === 'object') {
                      const reason = payload.reason
                      const comment = payload.comment
                      const decision = payload.decision
                      if (typeof reason === 'string' && reason.trim()) return reason
                      if (typeof comment === 'string' && comment.trim()) return comment
                      if (typeof decision === 'string' && decision.trim()) return decision
                    }
                    return 'This review item has not emitted a detailed event note yet.'
                  })()}</p>
                </div>
                <div className="review-detail-card">
                  <span>Latest artifact</span>
                  <strong>{selectedReviewDetail.artifacts[0]?.filename ?? selectedReviewDetail.artifacts[0]?.artifact_type ?? 'No artifact yet'}</strong>
                  <p>{selectedReviewDetail.artifacts[0]?.mime_type ?? 'Artifact metadata will appear here when available.'}</p>
                </div>
              </div>
            ) : null}
            <textarea className="review-note-input" placeholder="Add approval notes, or enter the required reason for a denial" value={reviewNoteDrafts[selectedReviewItem.taskId] || ''} onChange={(e) => setReviewNoteDrafts((prev) => ({ ...prev, [selectedReviewItem.taskId]: e.target.value }))} />
            <div className="review-actions">
              <button className="revamp-command-btn solid" onClick={() => void decideReview(selectedReviewItem.taskId, 'approved')}>Approve</button>
              <button className="revamp-lock-btn" onClick={() => void decideReview(selectedReviewItem.taskId, 'rejected')}>Deny</button>
            </div>
          </>
        ) : (
          <BusinessEmptyState
            label="Review dock"
            title="Approval lane clear"
            body="The next artifact requiring a decision will pin here with status, provenance, and action controls."
          />
        )}
      </article>
    )
  }

  function renderReviewQueue() {
    return (
      <article className="glass-panel business-list-panel">
        <div className="revamp-kicker">Review Queue</div>
        <div className="business-row-list">
          {reviewQueue.length > 0 ? reviewQueue.map((item) => (
            <button
              key={item.artifactId}
              className={selectedReviewItem?.taskId === item.taskId ? 'business-row-button active' : 'business-row-button'}
              onClick={() => setSelectedReviewTaskId(item.taskId)}
            >
              <span>{item.approvalStatus} · {item.artifactType}</span>
              <strong>{item.taskTitle}</strong>
              <p>{item.projectTitle ?? 'Unassigned project'}</p>
            </button>
          )) : (
            <BusinessEmptyState
              label="Review queue"
              title="No artifacts waiting"
              body="Pending drafts, delivery notes, and packages will appear here when they need an explicit decision."
            />
          )}
        </div>
      </article>
    )
  }

  function renderAgentDashboard() {
    return (
      <main className="business-page-layout agents-page-layout">
        {renderBusinessHero()}
        {renderBusinessMetricGrid()}
        <section className="business-two-column">
          <article className="glass-panel business-main-panel">
            <div className="revamp-kicker">Agent Workload</div>
            <div className="agent-card-grid agent-workload-grid">
              {businessAgents.length > 0 ? businessAgents.map((agent) => (
                <div key={agent.id} className="agent-card-shell neon-agent-card">
                  <span>{agent.chamberLabel} · {agent.status}</span>
                  <strong>{agent.displayName}</strong>
                  <p>{agent.role} · {agent.taskCount} active task{agent.taskCount === 1 ? '' : 's'}</p>
                  <p>{agent.tasks[0] ? `Current: ${agent.tasks[0].title}` : 'Standing by for the next assigned task.'}</p>
                  <div className="agent-card-meta">
                    <code>{agent.runCount} runs</code>
                    <code>{formatUsd(agent.totalCostUsd)}</code>
                  </div>
                </div>
              )) : (
                <BusinessEmptyState
                  label="Agent hierarchy"
                  title="No active chambers reporting"
                  body="The hierarchy stays ready for the next runtime sync with a clear, intentional quiet state."
                />
              )}
            </div>
          </article>
          <aside className="business-side-stack">
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Watchdog</div>
              <div className="business-row-list">
                {watchdogRows.length > 0 ? watchdogRows.map((item) => (
                  <div key={item.id} className="business-row-card">
                    <span>Severity {item.severity} · {item.status}</span>
                    <strong>{item.task_title}</strong>
                    <p>{item.project} · {item.watchdog_reason}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Watchdog"
                    title="No active alerts"
                    body="Flagged, stale, and retry-loop work will surface here with owner and task context."
                  />
                )}
              </div>
            </article>
            <RuntimeTrailPanel items={actionTrail} />
          </aside>
        </section>
      </main>
    )
  }

  function renderBusinessCommandDashboard() {
    return (
      <main className="business-page-layout">
        {renderBusinessHero()}
        {renderBusinessMetricGrid()}
        <section className="business-two-column">
          <article className="glass-panel business-main-panel">
            <div className="revamp-kicker">Pipeline Now</div>
            <div className="business-row-list">
              {pipelineRows.length > 0 ? pipelineRows.map((item) => (
                <div key={`${item.project}-${item.status}`} className="business-row-card">
                  <span>{item.status}</span>
                  <strong>{item.project}</strong>
                  <p>{item.count} task{item.count === 1 ? '' : 's'} in this lane.</p>
                </div>
              )) : (
                <BusinessEmptyState
                  label="Pipeline"
                  title="No live pipeline rows"
                  body="Business Command will show project lanes, task counts, and pressure when the runtime reports them."
                />
              )}
            </div>
          </article>
          <aside className="business-side-stack">
            {renderReviewDockPanel('compact')}
            <RuntimeTrailPanel items={actionTrail} />
          </aside>
        </section>
      </main>
    )
  }

  function renderReviewDockDashboard() {
    return (
      <main className="business-page-layout review-page-layout">
        {renderBusinessHero()}
        <section className="business-two-column review-command-grid">
          {renderReviewDockPanel('full')}
          <aside className="business-side-stack">
            {renderReviewQueue()}
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Recent Review Events</div>
              <div className="business-row-list">
                {recentRuntimeActivity.length > 0 ? recentRuntimeActivity.map((item) => (
                  <div key={item.id} className="business-row-card">
                    <span>{item.eventType}</span>
                    <strong>{item.taskTitle}</strong>
                    <p>{item.detail ?? item.projectTitle ?? 'Event detail unavailable.'}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Review events"
                    title="No recent events"
                    body="Review approvals, denials, and artifact updates will appear here after the runtime emits them."
                  />
                )}
              </div>
            </article>
          </aside>
        </section>
      </main>
    )
  }

  function renderRuntimeTrailDashboard() {
    return (
      <main className="business-page-layout runtime-page-layout">
        {renderBusinessHero()}
        <section className="business-two-column runtime-command-grid">
          <RuntimeTrailPanel items={runtimeTrailItems} />
          <aside className="business-side-stack">
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Safety Boundary</div>
              <div className="business-row-list">
                {runtimeTrailItems.length > 0 ? runtimeTrailItems.map((item) => (
                  <div key={item.id} className="business-row-card">
                    <span>{item.context}</span>
                    <strong>{item.action?.label ?? item.text}</strong>
                    <p>{item.handoff?.safety ?? item.action?.safety ?? 'Recorded without dispatching external work.'}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Safety"
                    title="No runtime actions yet"
                    body="Commands and review decisions will list their safety notes, audit ids, and provenance here."
                  />
                )}
              </div>
            </article>
            <article className="glass-panel business-list-panel">
              <div className="revamp-kicker">Handoff Status</div>
              <div className="business-row-list">
                {runtimeTrailItems.filter((item) => item.handoff).length > 0 ? runtimeTrailItems.filter((item) => item.handoff).map((item) => (
                  <div key={`${item.id}-handoff`} className="business-row-card">
                    <span>{item.handoff?.status.replace(/_/g, ' ')}</span>
                    <strong>{item.handoff?.auditId}</strong>
                    <p>{item.handoff?.message}</p>
                  </div>
                )) : (
                  <BusinessEmptyState
                    label="Handoffs"
                    title="No assistant handoffs recorded"
                    body="Same-origin handoff attempts will be listed here with audit ids and requires-approval status."
                  />
                )}
              </div>
            </article>
          </aside>
        </section>
      </main>
    )
  }

  function renderPersonalDashboardLead() {
    if (personalSection === 'home' || !currentPersonalData || !currentSectionDashboard || !currentPersonalContent) return null

    const sourceRows = currentSectionDashboard.evidenceRows.slice(0, 3)
    const actionRows = currentSectionDashboard.actionRows.slice(0, 3)

    return (
      <section className={`category-dashboard-lead ${personalSection}`} aria-label={`${currentPersonalContent.title} dashboard`}>
        <article className="category-dashboard-header">
          <div>
            <div className="revamp-kicker">{currentPersonalContent.title} Dashboard</div>
            <h3>{currentSectionDashboard.headline}</h3>
            <p>{currentDirective.system}</p>
          </div>
          <div className="category-dashboard-status">
            <span>Signal quality</span>
            <strong>{sourceConfidence(currentPersonalData)}</strong>
            <small>{currentPersonalData.freshness?.label ?? 'Projected records'}</small>
            <small>{generatedProjectionSnapshot.updateMode}: {generatedProjectionSnapshot.generatedAtLabel}</small>
          </div>
        </article>

        <div className="category-dashboard-metrics">
          {currentSectionDashboard.metrics.map((metric) => {
            const card = currentPersonalData.summaryCards[metric.sourceCardIndex]
            return (
              <article key={metric.label} className={`category-dashboard-metric ${metric.priority}${card?.stale ? ' stale' : ''}`}>
                <span>{metric.label}</span>
                <strong>{card?.value ?? 'No signal yet'}</strong>
                <p>{card?.note ?? 'This metric is waiting on source coverage.'}</p>
              </article>
            )
          })}
        </div>

        <div className="category-dashboard-lanes">
          <article className="category-dashboard-lane primary">
            <div className="revamp-kicker">Action Lane</div>
            {actionRows.map((item) => {
              const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData.summaryCards[item.sourceCardIndex] : undefined
              return (
                <div key={item.title} className={`category-dashboard-row${card?.stale ? ' stale' : ''}`}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  {card ? <small>{card.label}: {card.value}</small> : null}
                </div>
              )
            })}
          </article>
          <article className="category-dashboard-lane">
            <div className="revamp-kicker">Evidence Lane</div>
            {sourceRows.map((item) => {
              const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData.summaryCards[item.sourceCardIndex] : undefined
              return (
                <div key={item.title} className={`category-dashboard-row${card?.stale ? ' stale' : ''}`}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  {card ? <small>{card.label}: {card.note}</small> : null}
                </div>
              )
            })}
          </article>
        </div>
      </section>
    )
  }

  function renderIdentityScorecardPage() {
    const lowestQuality = identityQualities.length
      ? identityQualities.reduce((lowest, item) => item.score < lowest.score ? item : lowest)
      : null
    const averageScore = identityQualities.length
      ? identityQualities.reduce((total, item) => total + item.score, 0) / identityQualities.length
      : 0
    const chartMin = 1
    const chartMax = 10
    const chartWidth = 260
    const chartHeight = 96
    const chartPoints = identityScoreHistory.map((point, index) => {
      const x = identityScoreHistory.length === 1 ? chartWidth / 2 : (index / (identityScoreHistory.length - 1)) * chartWidth
      const y = chartHeight - ((point.score - chartMin) / (chartMax - chartMin)) * chartHeight
      return { ...point, x, y }
    })
    const chartPath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
    const firstHistoryPoint = identityScoreHistory[0]
    const latestHistoryPoint = identityScoreHistory[identityScoreHistory.length - 1]

    return (
      <section className="identity-simple-page" aria-label="Ideal self scorecard">
        <article className="identity-statement-panel">
          <div className="identity-statement-head">
            <div>
              <span>Identity statement</span>
              <small>{sourceIdentityProjection?.statementSource ?? 'Source projection'}</small>
            </div>
          </div>
          <textarea
            value={identityStatement}
            readOnly
            aria-label="Identity statement"
          />
        </article>

        <article className="identity-scorecard-panel">
          <div className="identity-scorecard-head">
            <div>
              <div className="revamp-kicker">Ideal Self Scorecard</div>
              <h3>Track the person your daily evidence says you are becoming.</h3>
            </div>
            <button
              className={`revamp-command-btn identity-edit-toggle${identityScoresEditable ? ' active' : ''}`}
              type="button"
              onClick={() => setIdentityScoresEditable((editable) => !editable)}
            >
              {identityScoresEditable ? 'Done' : 'Edit scores'}
            </button>
            <div className="identity-average">
              <span>Average</span>
              <strong>{averageScore.toFixed(1)}</strong>
            </div>
          </div>

          <div className="identity-quality-list">
            {identityQualities.map((quality) => (
              <article key={quality.id} className="identity-quality-row">
                <div className="identity-quality-copy">
                  <input
                    className="identity-quality-name"
                    value={quality.name}
                    onChange={(event) => updateIdentityQuality(quality.id, { name: event.target.value })}
                    aria-label={`${quality.name} name`}
                  />
                  <textarea
                    className="identity-quality-meaning"
                    value={quality.tenMeans}
                    onChange={(event) => updateIdentityQuality(quality.id, { tenMeans: event.target.value })}
                    aria-label={`${quality.name} meaning`}
                  />
                  <textarea
                    className="identity-quality-action"
                    value={quality.nextAction}
                    onChange={(event) => updateIdentityQuality(quality.id, { nextAction: event.target.value })}
                    aria-label={`${quality.name} next action`}
                  />
                </div>
                <div className="identity-score-control">
                  <strong>{quality.score.toFixed(1)}</strong>
                  {identityScoresEditable ? (
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={quality.score}
                      onChange={(event) => updateIdentityQuality(quality.id, { score: Number(event.target.value) })}
                      aria-label={`${quality.name} score`}
                    />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </article>

        <section className="identity-support-strip" aria-label="Identity support">
          <article className="identity-support-card">
            <span>Biggest gap</span>
            <strong>{lowestQuality?.name ?? 'No quality yet'}</strong>
            <p>{lowestQuality?.nextAction ?? 'Add one quality to start.'}</p>
          </article>
          <article className="identity-support-card">
            <span>Last nightly update</span>
            <strong>{identityLastUpdatedLabel}</strong>
            <div className="identity-change-list">
              {identityNightlyChanges.map((change) => {
                const quality = identityQualities.find((item) => item.id === change.qualityId)
                return (
                  <p key={change.qualityId}>
                    <b>{change.delta > 0 ? '+' : ''}{change.delta.toFixed(1)} {quality?.name ?? change.qualityId}</b>
                    {' '}
                    {change.reason}
                  </p>
                )
              })}
            </div>
          </article>
          <article className="identity-support-card identity-history-card">
            <span>Score history</span>
            <strong>{firstHistoryPoint?.score.toFixed(1)} to {latestHistoryPoint?.score.toFixed(1)}</strong>
            <svg className="identity-score-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Seven day identity score trend">
              <path d={`M 0 ${chartHeight - 12} H ${chartWidth}`} />
              <path className="trend" d={chartPath} />
              {chartPoints.map((point) => (
                <circle key={point.label} cx={point.x} cy={point.y} r="3.5" />
              ))}
            </svg>
            <div className="identity-chart-labels">
              <span>{firstHistoryPoint?.label}</span>
              <span>{latestHistoryPoint?.label}</span>
            </div>
          </article>
        </section>
      </section>
    )
  }

  function renderVenturesPage() {
    if (!currentPersonalData) return null

    const ventureData = currentPersonalData.ventures
    const ventures = ventureData?.ventures ?? []
    const selectedVenture = ventures.find((venture) => venture.id === selectedVentureId)
      ?? ventures.find((venture) => venture.id === ventureData?.primaryVentureId)
      ?? ventures[0]
    const leadVenture = ventures[0]
    const activeVentures = ventures.filter((venture) => venture.priorityBand !== 'later' && venture.priorityBand !== 'shelved')
    const sourceAge = currentPersonalData.freshness?.ageDays
    const sourceAgeLabel = sourceAge == null ? 'source age unknown' : sourceAge === 0 ? 'updated today' : `updated ${sourceAge}d ago`

    return (
      <section className="ventures-page" aria-label="Ventures dashboard">
        <section className="ventures-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="ventures-hero-copy">
            <h2>Ventures</h2>
            <p>{leadVenture ? `${leadVenture.name} first. ${leadVenture.blocker}` : currentPersonalData.heroSummary}</p>
          </div>
          <aside className="ventures-source-card">
            <span>Source</span>
            <strong>{sourceAgeLabel}</strong>
            <p>{currentPersonalData.freshness?.label ?? 'Ventures MOC'} / snapshot {generatedProjectionSnapshot.generatedAtLabel}</p>
          </aside>
        </section>

        <section className="ventures-layout" aria-label="Ranked venture portfolio">
          <article className="ventures-list-panel">
            <div className="ventures-panel-head">
              <div>
                <span>Priority order</span>
                <h3>{activeVentures.length} active lines</h3>
              </div>
              <b>{ventures.length} total</b>
            </div>
            <div className="venture-list">
              {ventures.map((venture) => (
                <button
                  key={venture.id}
                  className={`venture-row ${venture.priorityBand}${selectedVenture?.id === venture.id ? ' is-selected' : ''}`}
                  onClick={() => setSelectedVentureId(venture.id)}
                >
                  <div className="venture-rank">{venture.priorityRank}</div>
                  <div className="venture-row-main">
                    <span>{venture.priorityLabel || venture.priorityBand}</span>
                    <strong>{venture.name}</strong>
                    <p>{venture.stage}</p>
                  </div>
                  <div className="venture-row-score">
                    <span>Score</span>
                    <strong>{venture.score || '--'}</strong>
                  </div>
                </button>
              ))}
              {ventures.length === 0 ? <p className="ventures-empty-copy">No venture portfolio table loaded.</p> : null}
            </div>
          </article>

          <article className="venture-detail-panel">
            {selectedVenture ? (
              <>
                <div className="ventures-panel-head">
                  <div>
                    <span>{selectedVenture.priorityLabel || 'Selected venture'}</span>
                    <h3>{selectedVenture.name}</h3>
                  </div>
                  <b>{selectedVenture.score || 'No score'}</b>
                </div>
                <p className="venture-detail-summary">{selectedVenture.detail}</p>
                <div className="venture-detail-grid">
                  <div>
                    <span>Type</span>
                    <strong>{selectedVenture.type}</strong>
                  </div>
                  <div>
                    <span>Stage</span>
                    <strong>{selectedVenture.stage}</strong>
                  </div>
                  <div>
                    <span>People</span>
                    <strong>{selectedVenture.cofounders}</strong>
                  </div>
                  <div>
                    <span>Blocker</span>
                    <strong>{selectedVenture.blocker}</strong>
                  </div>
                  <div className="wide">
                    <span>Next useful move</span>
                    <strong>{selectedVenture.nextAction}</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className="ventures-empty-copy">Select a venture to inspect details.</p>
            )}
          </article>
        </section>

        <section className="ventures-rules-strip" aria-label="Venture strategy guardrails">
          <article>
            <span>Rule</span>
            <strong>{ventureData?.operatingRule ?? currentPersonalData.highlights[0]}</strong>
          </article>
          <article>
            <span>Bandwidth</span>
            <strong>{ventureData?.bandwidth ?? '3-4 hrs/day available for ventures'}</strong>
          </article>
          <article>
            <span>Capital</span>
            <strong>{ventureData?.capitalRule ?? 'Protect the capital base until ROI is clear.'}</strong>
          </article>
        </section>
      </section>
    )
  }

  function renderSystemsPage() {
    if (!currentPersonalData) return null

    const systems = currentPersonalData.systems
    const topFocus = systems?.topFocus ?? []
    const quickWins = systems?.quickWins ?? []
    const staleItems = systems?.staleItems ?? []
    const nextQueue = systems?.nextQueue ?? []
    const waitingOrBlocked = systems?.waitingOrBlocked ?? []
    const quickMove = quickWins.find((task) => !task.stale) ?? quickWins[0]
    const visibleTopFocus = topFocus.slice(0, 4)
    const cleanupItems = staleItems.slice(0, 3)
    const secondaryQueue = [...waitingOrBlocked, ...nextQueue]
      .filter((task, index, all) => all.findIndex((candidate) => candidate.id === task.id) === index)
      .slice(0, 5)
    const laterCount = nextQueue.length + (systems?.domainCounts ?? []).reduce((sum, domain) => sum + domain.backlog, 0)
    const sourceAge = currentPersonalData.freshness?.ageDays
    const sourceAgeLabel = sourceAge == null ? 'source age unknown' : sourceAge === 0 ? 'updated today' : `updated ${sourceAge}d ago`

    return (
      <section className="systems-page" aria-label="Systems dashboard">
        <section className="systems-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="systems-hero-copy">
            <h2>Systems</h2>
            <p>{visibleTopFocus.length} current / {staleItems.length} cleanup / {waitingOrBlocked.length} waiting / {laterCount} later</p>
          </div>
          <aside className="systems-source-card">
            <span>Source</span>
            <strong>{sourceAgeLabel}</strong>
            <p>{currentPersonalData.freshness?.label ?? 'Operations board'} / snapshot {generatedProjectionSnapshot.generatedAtLabel}</p>
          </aside>
        </section>

        <section className="systems-main-grid" aria-label="Systems task triage">
          <article className="systems-current-panel">
            <div className="systems-panel-head">
              <div>
                <span>Now</span>
                <h3>Current work</h3>
              </div>
              <b>{visibleTopFocus.length}</b>
            </div>
            <div className="systems-task-list">
              {visibleTopFocus.length > 0 ? visibleTopFocus.map((task, index) => (
                <article key={task.id} className={`systems-task-row priority-${index + 1}${task.stale ? ' stale' : ''}`}>
                  <div className="systems-task-rank">{index + 1}</div>
                  <div>
                    <span>{task.id} / {task.domain} / {task.dueReview}</span>
                    <strong>{task.title}</strong>
                    {task.notes ? <p>{task.notes}</p> : null}
                  </div>
                </article>
              )) : (
                <div className="systems-empty-copy">No current focus loaded.</div>
              )}
            </div>
          </article>

          <aside className="systems-side-stack">
            <article className="systems-side-panel systems-next-move">
              <span>Quick move</span>
              <strong>{quickMove ? quickMove.title : 'No quick move loaded'}</strong>
              <p>{quickMove ? `${quickMove.id} / ${quickMove.domain} / ${quickMove.dueReview}` : 'Quick admin tasks will surface here when the board has one.'}</p>
            </article>

            <article className="systems-side-panel">
              <div className="systems-panel-head">
                <div>
                  <span>Cleanup</span>
                  <h3>Old dates</h3>
                </div>
                <b>{staleItems.length}</b>
              </div>
              <div className="systems-mini-list compact">
                {cleanupItems.map((task) => (
                  <div key={task.id} className="stale">
                    <span>{task.id} / {task.domain}</span>
                    <strong>{task.title}</strong>
                    <p>{task.dueReview}</p>
                  </div>
                ))}
                {cleanupItems.length === 0 ? <p className="systems-empty-copy">None</p> : null}
              </div>
            </article>
          </aside>
        </section>

        <section className="systems-queue-panel" aria-label="Systems queued work">
          <div className="systems-panel-head">
            <div>
              <span>Keep visible</span>
              <h3>Waiting and next queue</h3>
            </div>
            <b>{secondaryQueue.length}</b>
          </div>
          <div className="systems-queue-list">
            {secondaryQueue.length > 0 ? secondaryQueue.map((task) => (
              <div key={task.id}>
                <span>{task.id} / {task.domain} / {task.lane.toUpperCase()}</span>
                <strong>{task.title}</strong>
                <p>{task.status}{task.dueReview !== 'Not set' ? ` / ${task.dueReview}` : ''}</p>
              </div>
            )) : (
              <p className="systems-empty-copy">No waiting or queued work loaded.</p>
            )}
          </div>
        </section>
      </section>
    )
  }

  function renderVesselPage() {
    if (!currentPersonalData) return null

    const findCard = (matcher: string) => currentPersonalData.summaryCards.find((card) => card.label.toLowerCase().includes(matcher))
    const readNumber = (value?: string) => {
      const match = value?.match(/([\d,.]+)/)
      if (!match) return null
      const parsed = Number(match[1].replace(/,/g, ''))
      return Number.isFinite(parsed) ? parsed : null
    }
    const nutrition = findCard('nutrition') ?? currentPersonalData.summaryCards[2]
    const proteinTarget = 150
    const cutCalorieMax = 2400
    const proteinLogged = readNumber(nutrition?.value)
    const caloriesLogged = readNumber(nutrition?.note?.match(/([\d,]+)\s*kcal/i)?.[0])
    const proteinProgress = proteinLogged === null ? null : Math.min(100, Math.round((proteinLogged / proteinTarget) * 100))
    const isCutting = currentPersonalData.highlights.some((highlight) => /cut|recomp/i.test(highlight))
    const calorieStatus = caloriesLogged === null
      ? 'Calories not logged'
      : caloriesLogged <= cutCalorieMax
        ? 'Under cut max'
        : 'Over cut max'
    const meditationPlan = currentPersonalData.vessel?.meditation
    const looksPlan = currentPersonalData.vessel?.looks
    const meditationLastLabel = meditationPlan?.latestSessionDate ? `Last logged ${meditationPlan.latestSessionDate}` : 'No meditation log yet'
    const meditationAction = meditationPlan?.nextRep ?? '5 min focused breathing after the morning brain dump'
    const meditationFallback = meditationPlan?.fallbackRep ?? 'Walking meditation or box breathing on unfocused days'
    const meditationReminderLabel = meditationPlan?.reminderWindows.length ? meditationPlan.reminderWindows.join(' / ') : '10:00 AM / 7:30 PM ET'
    const muscleGroups = currentPersonalData.vessel?.muscleGroups ?? []
    const laggingMuscleGroups = muscleGroups
      .filter((group) => group.heat === 'missing' || group.heat === 'stale' || group.heat === 'touched')
      .slice(0, 3)
    const muscleFocusList = laggingMuscleGroups.length ? laggingMuscleGroups : [...muscleGroups].sort((a, b) => a.recentSets - b.recentSets).slice(0, 3)
    const vesselStats = [
      { label: 'Protein today', value: proteinLogged === null ? '--' : `${proteinLogged}g`, note: proteinProgress === null ? `Target ${proteinTarget}g` : `${proteinProgress}% of ${proteinTarget}g target` },
      ...(isCutting ? [{ label: 'Calories today', value: caloriesLogged === null ? '--' : `${caloriesLogged} kcal`, note: caloriesLogged === null ? `Cut max ${cutCalorieMax} kcal` : `${calorieStatus}: ${cutCalorieMax} kcal` }] : []),
    ]

    return (
      <section className="vessel-page" aria-label="Vessel dashboard">
        <section className="vessel-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="vessel-hero-vitals" aria-label="Vessel quick readouts">
            {vesselStats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.note}</small>
              </div>
            ))}
          </div>
          <aside className="vessel-readiness">
            <div
              className="vessel-readiness-ring"
              style={{ '--vessel-readiness': `${proteinProgress ?? 0}%` } as CSSProperties}
              aria-label={proteinProgress === null ? 'Protein target pending' : `Protein target ${proteinProgress}%`}
            >
              <div>
                <span>Protein</span>
                <strong>{proteinProgress ?? '--'}%</strong>
              </div>
            </div>
            <div className="vessel-ring-actions" aria-label="Nutrition targets">
              <div className="active good">
                <span>Protein</span>
                <strong>{proteinLogged === null ? `Target ${proteinTarget}g` : `${proteinLogged} / ${proteinTarget}g`}</strong>
              </div>
              {isCutting ? (
                <div className={caloriesLogged !== null && caloriesLogged > cutCalorieMax ? 'watch active' : 'good'}>
                  <span>Calories</span>
                  <strong>{caloriesLogged === null ? `Max ${cutCalorieMax}` : `${caloriesLogged} / ${cutCalorieMax}`}</strong>
                </div>
              ) : (
                <div>
                  <span>Calories</span>
                  <strong>Not tracked</strong>
                </div>
              )}
            </div>
          </aside>
        </section>

        {muscleGroups.length ? (
          <section className="vessel-muscle-map" aria-label="Workout muscle heat map">
            <div className="vessel-muscle-map-head">
              <div>
                <span>Workout heat map</span>
                <strong>Muscle groups from logs</strong>
                <p>{currentPersonalData.vessel?.muscleWindowLabel}</p>
              </div>
              <div className="vessel-muscle-focus">
                <span>Needs balance</span>
                <strong>{muscleFocusList.map((group) => group.label).join(' / ')}</strong>
              </div>
            </div>
            <div className="vessel-muscle-grid">
              {muscleGroups.map((group) => (
                <article className={`vessel-muscle-card ${group.heat}`} key={group.id}>
                  <div className="vessel-muscle-row">
                    <i aria-hidden="true" />
                    <strong>{group.label}</strong>
                    <em>{group.recentSets} sets</em>
                  </div>
                  <span>{group.priority}</span>
                  <p>{group.lastHitLabel}. {group.recommendation}</p>
                </article>
              ))}
            </div>
            <p className="vessel-muscle-note">{currentPersonalData.vessel?.musclePriorityNote}</p>
          </section>
        ) : null}

        <section className="vessel-support-grid" aria-label="Vessel support systems">
          <article className="vessel-meditation-card">
            <div>
              <span>Meditation consistency</span>
              <strong>{meditationLastLabel}</strong>
              <p>{meditationPlan?.sessionCount ? `${meditationPlan.sessionCount} logged sessions in Punk Records.` : 'The log exists, but consistency has not shown up in the data yet.'}</p>
            </div>
            <dl>
              <div>
                <dt>Baseline</dt>
                <dd>{meditationPlan?.baseline ?? '5-minute sessions'}</dd>
              </div>
              <div>
                <dt>Next rep</dt>
                <dd>{meditationAction}</dd>
              </div>
              <div>
                <dt>Fallback</dt>
                <dd>{meditationFallback}</dd>
              </div>
              <div>
                <dt>Reminder windows</dt>
                <dd>{meditationReminderLabel}</dd>
              </div>
            </dl>
          </article>
          <article className="vessel-looks-card">
            <div>
              <span>Looks support</span>
              <strong>Routine checklist</strong>
              <p>Only concrete items from the looksmaxxing routine.</p>
            </div>
            <div className="vessel-check-columns">
              <div>
                <b>Daily</b>
                {(looksPlan?.daily.length ? looksPlan.daily : ['Face wash', 'Moisturizer', 'SPF', 'Lip balm']).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <div>
                <b>Going out</b>
                {(looksPlan?.goingOut.length ? looksPlan.goingOut : ['Hair', 'Beard', 'Lips', 'Outfit intentional']).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </article>
        </section>
      </section>
    )
  }

  function renderEducationPage() {
    if (!currentPersonalData) return null

    const education = currentPersonalData.education
    const urgentDeadlines = education?.urgentDeadlines ?? []
    const coursePlan = education?.coursePlan ?? []
    const alternatives = education?.alternatives ?? []
    const activeCourse = coursePlan.find((course) => course.status === 'active')

    return (
      <section className="education-page" aria-label="Education dashboard">
        <section className="education-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div className="education-hero-copy">
            <span>{education?.activeProgram ?? 'Georgia Tech OMSCS / MSML'}</span>
            <strong>{activeCourse ? `${activeCourse.code} · ${activeCourse.name}` : currentPersonalData.summaryCards[1]?.value ?? 'Current course pending'}</strong>
          </div>
        </section>

        <section className="education-deadline-panel" aria-label="Most urgent education deadlines">
          <div className="education-panel-head">
            <div>
              <span>Course radar</span>
              <strong>Most urgent deadlines</strong>
            </div>
            <small>{education?.activeTerm ?? 'Summer 2026'}</small>
          </div>
          <div className="education-deadline-list">
            {urgentDeadlines.length ? urgentDeadlines.map((deadline, index) => (
              <article className={`education-deadline-card ${deadline.status}`} key={deadline.id}>
                <div className="education-deadline-rank">{index + 1}</div>
                <div>
                  <span>{deadline.courseCode} · {deadline.kind.replace('-', ' ')}</span>
                  <strong>{deadline.title}</strong>
                  <p>Due {formatEducationDate(deadline.dueAt)}</p>
                  {deadline.internalTarget !== deadline.dueAt ? <small>Internal target: {formatEducationDate(deadline.internalTarget)}</small> : null}
                </div>
              </article>
            )) : (
              <article className="education-deadline-card later">
                <div className="education-deadline-rank">0</div>
                <div>
                  <span>Course radar</span>
                  <strong>No upcoming deadline found</strong>
                  <p>Check Canvas and add the next current-class deadline to Punk Records.</p>
                </div>
              </article>
            )}
          </div>
        </section>

        <section className="education-course-map" aria-label="OMSCS ten course map">
          <div className="education-panel-head">
            <div>
              <span>Masters map</span>
              <strong>10-course OMSCS / MSML schedule</strong>
            </div>
            <button className="education-alt-toggle" onClick={() => setEducationAlternativesOpen((open) => !open)}>
              {educationAlternativesOpen ? 'Hide alternatives' : 'See alternatives'}
            </button>
          </div>
          <div className="education-course-grid">
            {coursePlan.map((course, index) => (
              <article className={`education-course-card ${course.status}`} key={`${course.code}-${course.term}`}>
                <div className="education-course-topline">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <em>{course.term}</em>
                </div>
                <strong>{course.code}</strong>
                <p>{course.name}</p>
                <div className="education-course-meta">
                  <span>{course.status}</span>
                  <span>{course.role.replace('-', ' ')}</span>
                  <span>{course.difficulty}/10</span>
                </div>
                <small>{course.why}</small>
              </article>
            ))}
          </div>
          <p className="education-plan-note">{education?.planNote}</p>
          {educationAlternativesOpen ? (
            <div className="education-alternatives" aria-label="Potential OMSCS course alternatives">
              {alternatives.map((course) => (
                <article key={course.code}>
                  <span>{course.code} · {course.difficulty}/10</span>
                  <strong>{course.name}</strong>
                  <p>{course.bestFor}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    )
  }

  function renderCareerPage() {
    if (!currentPersonalData) return null

    const career = currentPersonalData.career
    const categories = career?.categories ?? []
    const prompts = career?.prompts ?? currentPersonalData.missingData ?? []
    const starStoryBank = career?.starStories ?? []
    const statusLabel = (status: string) => status.replace('-', ' ')
    const toggleCareerCategory = (categoryId: string) => {
      setExpandedCareerCategories((current) => ({
        ...current,
        [categoryId]: !(current[categoryId] ?? false),
      }))
    }
    const toggleCareerSection = (sectionId: string) => {
      setExpandedCareerSections((current) => ({
        ...current,
        [sectionId]: !(current[sectionId] ?? false),
      }))
    }

    return (
      <section className="career-page" aria-label="Career dashboard">
        <section className="career-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <h2>Career</h2>
        </section>

        <section className="career-category-stack" aria-label="Career categories">
          {categories.map((category) => {
            const categoryOpen = expandedCareerCategories[category.id] ?? false

            return (
              <article key={category.id} className={`career-category-panel ${category.id}`}>
                <button
                  className="career-category-toggle"
                  type="button"
                  aria-expanded={categoryOpen}
                  onClick={() => toggleCareerCategory(category.id)}
                >
                  <span>{categoryOpen ? '-' : '+'}</span>
                  <strong>{category.title}</strong>
                  <small>{category.sections.length} sections</small>
                </button>

                {categoryOpen ? (
                  <div className="career-section-grid">
                    {category.sections.map((section) => {
                      const sectionOpen = expandedCareerSections[section.id] ?? false

                      return (
                        <article key={section.id} className={`career-section-card ${section.status} ${sectionOpen ? 'open' : ''}`}>
                          <button
                            className="career-section-toggle"
                            type="button"
                            aria-expanded={sectionOpen}
                            onClick={() => toggleCareerSection(section.id)}
                          >
                            <div className="career-section-topline">
                              <span>{section.label}</span>
                              <em>{statusLabel(section.status)}</em>
                            </div>
                            <strong>{section.value}</strong>
                          </button>
                          {sectionOpen ? (
                            <div className="career-section-body">
                              <p>{section.detail}</p>
                              <div className="career-next-action">
                                <span>Next</span>
                                <p>{section.nextAction}</p>
                              </div>
                              {section.id === 'star-stories' && starStoryBank.length ? (
                                <div className="career-story-bank" aria-label="STAR story bank">
                                  {starStoryBank.map((story) => (
                                    <details key={story.id} className="career-story-item">
                                      <summary>
                                        <strong>{story.title}</strong>
                                        <span>{story.bestFor[0] ?? 'Behavioral story'}</span>
                                      </summary>
                                      {story.tags.length ? (
                                        <div className="career-story-tags">
                                          {story.tags.slice(0, 5).map((tag) => (
                                            <span key={`${story.id}-${tag}`}>{tag}</span>
                                          ))}
                                        </div>
                                      ) : null}
                                      <dl>
                                        <div>
                                          <dt>S</dt>
                                          <dd>{story.situation || 'Needs details in Punk Records.'}</dd>
                                        </div>
                                        <div>
                                          <dt>T</dt>
                                          <dd>{story.task || 'Needs details in Punk Records.'}</dd>
                                        </div>
                                        <div>
                                          <dt>A</dt>
                                          <dd>{story.action || 'Needs details in Punk Records.'}</dd>
                                        </div>
                                        <div>
                                          <dt>R</dt>
                                          <dd>{story.result || 'Needs details in Punk Records.'}</dd>
                                        </div>
                                      </dl>
                                    </details>
                                  ))}
                                </div>
                              ) : null}
                              <small>{section.source}</small>
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>

        <section className="career-prompt-panel" aria-label="Career data prompts">
          <div className="career-panel-head">
            <div>
              <span>Prompt Mitchell</span>
              <strong>Missing from Punk Records</strong>
            </div>
            <small>{currentPersonalData.freshness?.label ?? 'Career planning docs'}</small>
          </div>
          <div className="career-prompt-grid">
            {prompts.slice(0, 4).map((prompt) => (
              <article key={`${prompt.label}-${prompt.value}`} className={`career-prompt-card ${prompt.severity ?? 'watch'}`}>
                <span>{prompt.label}</span>
                <strong>{prompt.value}</strong>
                <p>{prompt.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    )
  }

  function renderWealthPage() {
    if (!currentPersonalData) return null

    const wealth = currentPersonalData.wealth
    const panels = wealth?.panels ?? []
    const prompts = wealth?.prompts ?? currentPersonalData.missingData ?? []
    const toggleWealthPanel = (panelId: string) => {
      setExpandedWealthPanels((current) => ({
        ...current,
        [panelId]: !(current[panelId] ?? false),
      }))
    }

    return (
      <section className="wealth-page" aria-label="Wealth dashboard">
        <section className="wealth-hero">
          <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
          <div>
            <span>Wealth</span>
            <h2>{wealth?.headline ?? 'Wealth Command Center'}</h2>
          </div>
          <small>{wealth?.asOf ?? currentPersonalData.freshness?.label ?? 'Current estimate'}</small>
        </section>

        <section className="wealth-scoreboard" aria-label="Wealth scoreboard">
          {(wealth?.accounts ?? currentPersonalData.summaryCards.slice(0, 4)).map((item) => (
            <article key={item.label} className="wealth-score-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </section>

        {wealth?.connectionPlan ? (
          <section className="wealth-connection-panel" aria-label="Secure account connection plan">
            <div className="wealth-panel-head">
              <div>
                <span>Secure account linking</span>
                <strong>{financeStatus?.configured ? 'Backend ready for Plaid Link' : wealth.connectionPlan.status}</strong>
              </div>
              <small>{financeStatus ? `${financeStatus.provider} ${financeStatus.environment}` : wealth.connectionPlan.provider}</small>
            </div>
            <p>{wealth.connectionPlan.safetyPosition}</p>
            <div className="wealth-finance-status" aria-live="polite">
              <div>
                <span>Connection status</span>
                <strong>{financeStatus ? `${financeStatus.connections.active} active / ${financeStatus.connections.connected} total` : 'Checking backend'}</strong>
                <p>{financeMessage}</p>
                {financeStatus ? (
                  <small>
                    {financeStatus.accounts.linked} accounts · {financeStatus.transactions.synced} transactions · {financeStatus.lastSuccessfulSyncAt ? `last sync ${new Date(financeStatus.lastSuccessfulSyncAt).toLocaleString()}` : 'not synced yet'}
                  </small>
                ) : null}
              </div>
              <div className="wealth-finance-actions">
                <button className="wealth-action-button primary" type="button" disabled={financeBusy} onClick={() => void handleConnectFinancialAccounts()}>
                  {financeBusy ? 'Working...' : 'Connect accounts'}
                </button>
                <button className="wealth-action-button" type="button" disabled={financeBusy || !financeStatus?.connections.active} onClick={() => void handleSyncFinance()}>
                  Sync now
                </button>
                <button className="wealth-action-button danger" type="button" disabled={financeBusy || !financeStatus?.connections.connected} onClick={() => void handleDisconnectFinance()}>
                  Disconnect
                </button>
                <button className="wealth-action-button" type="button" disabled={financeBusy} onClick={() => void refreshFinanceStatus()}>
                  Refresh
                </button>
              </div>
            </div>
            {financeStatus?.connections.items.length ? (
              <div className="wealth-linked-list" aria-label="Linked institutions">
                {financeStatus.connections.items.map((item) => (
                  <article key={item.id}>
                    <span>{item.institutionName || 'Linked institution'}</span>
                    <strong>{item.status}</strong>
                  </article>
                ))}
              </div>
            ) : null}
            {financeStatus && !financeStatus.configured ? (
              <div className="wealth-missing-env" aria-label="Missing finance credentials">
                {financeStatus.missing.map((item) => (
                  <code key={item}>{item}</code>
                ))}
              </div>
            ) : null}
            <div className="wealth-connection-steps">
              {wealth.connectionPlan.steps.map((step) => (
                <article key={step.label} className={`wealth-connection-step ${step.status}`}>
                  <span>{step.label}</span>
                  <p>{step.detail}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="wealth-live-grid" aria-label="Live finance data">
          <article className="wealth-live-panel">
            <div className="wealth-panel-head">
              <div>
                <span>Live net worth</span>
                <strong>{financeStatus ? formatUsd(financeStatus.netWorth.total) : 'Waiting'}</strong>
              </div>
              <small>read-only</small>
            </div>
            <div className="wealth-mini-ledger">
              <div><span>Assets</span><strong>{formatUsd(financeStatus?.netWorth.assets ?? 0)}</strong></div>
              <div><span>Liabilities</span><strong>{formatUsd(financeStatus?.netWorth.liabilities ?? 0)}</strong></div>
              <div><span>Manual assets</span><strong>{formatUsd(financeStatus?.netWorth.manualAssets ?? 0)}</strong></div>
              <div><span>Manual liabilities</span><strong>{formatUsd(financeStatus?.netWorth.manualLiabilities ?? 0)}</strong></div>
            </div>
          </article>

          <article className="wealth-live-panel">
            <div className="wealth-panel-head">
              <div>
                <span>{financeStatus?.budget.month ?? 'This month'} budget</span>
                <strong>{formatUsd(financeStatus?.budget.remaining ?? 0)} left</strong>
              </div>
              <small>{formatUsd(financeStatus?.budget.spent ?? 0)} spent</small>
            </div>
            <div className="wealth-budget-list">
              {(financeStatus?.budget.categories ?? []).slice(0, 5).map((category) => (
                <div key={category.id}>
                  <span>{category.name}</span>
                  <strong>{formatUsd(category.spent)} / {formatUsd(category.planned)}</strong>
                </div>
              ))}
              {!financeStatus?.budget.categories.length ? <p>No budget targets saved yet.</p> : null}
            </div>
          </article>
        </section>

        <section className="wealth-live-panel" aria-label="Linked accounts">
          <div className="wealth-panel-head">
            <div>
              <span>Accounts</span>
              <strong>{financeStatus?.accounts.items.length ?? 0} tracked</strong>
            </div>
            <small>exclude noisy accounts anytime</small>
          </div>
          <div className="wealth-account-table">
            {(financeStatus?.accounts.items ?? []).map((account) => (
              <article key={account.id}>
                <div>
                  <strong>{account.name}</strong>
                  <span>{account.subtype || account.type}{account.mask ? ` • ${account.mask}` : ''}</span>
                </div>
                <b>{formatUsd(account.currentBalance)}</b>
                <label>
                  <input
                    type="checkbox"
                    checked={account.includeInBudget}
                    disabled={financeBusy}
                    onChange={(event) => void handleToggleFinanceAccount(account.id, 'includeInBudget', event.currentTarget.checked)}
                  />
                  Budget
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={account.includeInNetWorth}
                    disabled={financeBusy}
                    onChange={(event) => void handleToggleFinanceAccount(account.id, 'includeInNetWorth', event.currentTarget.checked)}
                  />
                  Net worth
                </label>
              </article>
            ))}
            {!financeStatus?.accounts.items.length ? <p>No linked accounts yet.</p> : null}
          </div>
        </section>

        <section className="wealth-live-grid" aria-label="Manual entries and budgets">
          <article className="wealth-live-panel">
            <div className="wealth-panel-head">
              <div>
                <span>Manual asset / liability</span>
                <strong>Add what banks cannot see</strong>
              </div>
              <small>{financeStatus?.manualEntries.items.length ?? 0} saved</small>
            </div>
            <div className="wealth-form-grid">
              <select value={manualFinanceDraft.type} disabled={financeBusy} onChange={(event) => setManualFinanceDraft((current) => ({ ...current, type: event.target.value as ManualFinanceDraft['type'] }))}>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
              </select>
              <input value={manualFinanceDraft.name} disabled={financeBusy} placeholder="Name" onChange={(event) => setManualFinanceDraft((current) => ({ ...current, name: event.target.value }))} />
              <input value={manualFinanceDraft.category} disabled={financeBusy} placeholder="Category" onChange={(event) => setManualFinanceDraft((current) => ({ ...current, category: event.target.value }))} />
              <input value={manualFinanceDraft.value} disabled={financeBusy} inputMode="decimal" placeholder="Value" onChange={(event) => setManualFinanceDraft((current) => ({ ...current, value: event.target.value }))} />
              <input value={manualFinanceDraft.notes} disabled={financeBusy} placeholder="Notes" onChange={(event) => setManualFinanceDraft((current) => ({ ...current, notes: event.target.value }))} />
              <button className="wealth-action-button primary" type="button" disabled={financeBusy} onClick={() => void handleSaveManualFinanceEntry()}>Save entry</button>
            </div>
            <div className="wealth-saved-list">
              {(financeStatus?.manualEntries.items ?? []).slice(0, 6).map((entry) => (
                <article key={entry.id}>
                  <span>{entry.name}</span>
                  <strong>{entry.type === 'liability' ? '-' : ''}{formatUsd(entry.value)}</strong>
                  <button type="button" disabled={financeBusy} onClick={() => void handleRemoveManualFinanceEntry(entry.id)}>Remove</button>
                </article>
              ))}
            </div>
          </article>

          <article className="wealth-live-panel">
            <div className="wealth-panel-head">
              <div>
                <span>Budget target</span>
                <strong>Plan by category</strong>
              </div>
              <small>monthly</small>
            </div>
            <div className="wealth-form-grid budget">
              <input value={budgetDraft.month} disabled={financeBusy} type="month" onChange={(event) => setBudgetDraft((current) => ({ ...current, month: event.target.value }))} />
              <input value={budgetDraft.category} disabled={financeBusy} placeholder="Category" onChange={(event) => setBudgetDraft((current) => ({ ...current, category: event.target.value }))} />
              <input value={budgetDraft.plannedAmount} disabled={financeBusy} inputMode="decimal" placeholder="Planned amount" onChange={(event) => setBudgetDraft((current) => ({ ...current, plannedAmount: event.target.value }))} />
              <input value={budgetDraft.notes} disabled={financeBusy} placeholder="Notes" onChange={(event) => setBudgetDraft((current) => ({ ...current, notes: event.target.value }))} />
              <button className="wealth-action-button primary" type="button" disabled={financeBusy} onClick={() => void handleSaveMonthlyBudget()}>Save budget</button>
            </div>
          </article>
        </section>

        <section className="wealth-live-panel" aria-label="Recent transactions">
          <div className="wealth-panel-head">
            <div>
              <span>Recent transactions</span>
              <strong>{financeStatus?.transactions.synced ?? 0} synced</strong>
            </div>
            <small>no account numbers stored</small>
          </div>
          <div className="wealth-transaction-list">
            {(financeStatus?.transactions.recent ?? []).map((transaction) => (
              <article key={transaction.id}>
                <time>{transaction.date}</time>
                <div>
                  <strong>{transaction.name}</strong>
                  <span>{transaction.accountName} • {transaction.category}{transaction.pending ? ' • pending' : ''}</span>
                </div>
                <b>{formatUsd(transaction.amount)}</b>
              </article>
            ))}
            {!financeStatus?.transactions.recent.length ? <p>No transactions synced yet.</p> : null}
          </div>
        </section>

        <section className="wealth-privacy-panel" aria-label="Finance privacy controls">
          <div>
            <span>Privacy controls</span>
            <strong>Disconnect first, delete local data anytime</strong>
          </div>
          <button className="wealth-action-button danger" type="button" disabled={financeBusy || !financeStatus?.configured} onClick={() => void handleDeleteFinanceData()}>
            Delete finance data
          </button>
        </section>

        <section className="wealth-hourly-panel" aria-label="Real hourly value">
          <div className="wealth-panel-head">
            <div>
              <span>Money per hour</span>
              <strong>{wealth?.hourly.status ?? 'Waiting on weekly hours'}</strong>
            </div>
            <small>{wealth?.hourly.threshold ?? '$35/hr'} threshold</small>
          </div>
          <div className="wealth-hourly-grid">
            <div>
              <span>Net income</span>
              <strong>{wealth?.hourly.monthlyNetIncome ?? '$5,226'}</strong>
            </div>
            <div>
              <span>Expenses</span>
              <strong>{wealth?.hourly.monthlyExpenses ?? '$2,750'}</strong>
            </div>
            <div>
              <span>Monthly saved</span>
              <strong>{wealth?.hourly.monthlySurplus ?? '$2,476'}</strong>
            </div>
            <div>
              <span>Job hours</span>
              <strong>{wealth?.hourly.jobHours ?? 'Need weekly average'}</strong>
            </div>
            <div>
              <span>Freelance hours</span>
              <strong>{wealth?.hourly.freelanceHours ?? 'Need weekly average'}</strong>
            </div>
          </div>
          <p>{wealth?.hourly.formula ?? 'Monthly saved / ((job hours + freelance hours) * 4.33)'}</p>
        </section>

        <section className="wealth-panel-stack" aria-label="Wealth panels">
          {panels.map((panel) => {
            const panelOpen = expandedWealthPanels[panel.id] ?? false

            return (
              <article key={panel.id} className={`wealth-detail-panel ${panel.id} ${panelOpen ? 'open' : ''}`}>
                <button
                  className="wealth-panel-toggle"
                  type="button"
                  aria-expanded={panelOpen}
                  onClick={() => toggleWealthPanel(panel.id)}
                >
                  <span>{panelOpen ? '-' : '+'}</span>
                  <div>
                    <small>{panel.kicker}</small>
                    <strong>{panel.title}</strong>
                  </div>
                </button>

                {panelOpen ? (
                  <div className="wealth-panel-body">
                    <p>{panel.summary}</p>
                    <div className="wealth-panel-metrics">
                      {panel.metrics.map((metric) => (
                        <div key={`${panel.id}-${metric.label}`}>
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                          <p>{metric.note}</p>
                        </div>
                      ))}
                    </div>
                    <div className="wealth-next-action">
                      <span>Next</span>
                      <p>{panel.nextAction}</p>
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>

        <section className="wealth-prompt-panel" aria-label="Wealth data prompts">
          <div className="wealth-panel-head">
            <div>
              <span>Missing inputs</span>
              <strong>Needed for a real tracker</strong>
            </div>
            <small>{currentPersonalData.freshness?.label ?? 'Wealth inputs'}</small>
          </div>
          <div className="wealth-prompt-grid">
            {prompts.slice(0, 4).map((prompt) => (
              <article key={`${prompt.label}-${prompt.value}`} className={`wealth-prompt-card ${prompt.severity ?? 'watch'}`}>
                <span>{prompt.label}</span>
                <strong>{prompt.value}</strong>
                <p>{prompt.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    )
  }

  function renderConnectionsPage() {
    if (!currentPersonalData) return null

    const connections = projectedSections.connections?.connections ?? currentPersonalData.connections
    const lanes = connections?.lanes ?? []
    const allLanePeople = lanes.flatMap((lane) => lane.people ?? [])
    const selectedConnection = allLanePeople.find((person) => person.id === selectedConnectionId) ?? null
    const priorityLabel = (person: ConnectionPersonProjection) => person.priority === 'active' ? 'Active' : `${person.priority.charAt(0).toUpperCase()}${person.priority.slice(1)} priority`

    return (
      <section className="connections-page" aria-label="Connections directory">
        <section className="connections-board" aria-label="Life lanes directory">
          <article className="connections-lane-panel">
            <div className="connections-panel-head">
              <div>
                <span>Map</span>
                <h3>Life lanes</h3>
              </div>
            </div>
            <div className="connections-lane-list">
              {lanes.map((lane) => (
                <details key={lane.id} className="connections-lane-directory">
                  <summary className="connections-lane-top">
                    <strong>{lane.title}</strong>
                  </summary>
                  <div className="connections-person-list">
                    {(lane.people ?? []).map((person) => (
                      <button
                        key={person.id}
                        className={`connections-person-row priority-${person.priority} ${selectedConnection?.id === person.id ? 'is-selected' : ''}`}
                        type="button"
                        onClick={() => setSelectedConnectionId(person.id)}
                      >
                        <strong>{person.person}</strong>
                        <span>{priorityLabel(person)}</span>
                        <small>{person.location} / Last: {person.lastContact}</small>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </article>
        </section>

        {selectedConnection ? (
          <section className="connections-profile-modal" role="dialog" aria-modal="true" aria-labelledby="connections-profile-title">
            <button className="connections-profile-backdrop" type="button" aria-label="Close profile" onClick={() => setSelectedConnectionId(null)} />
            <article className="connections-profile-dialog">
              <div className="connections-profile-head">
                <div>
                  <span>Person profile</span>
                  <h3 id="connections-profile-title">{selectedConnection.person}</h3>
                </div>
                <button className="connections-profile-close" type="button" onClick={() => setSelectedConnectionId(null)}>Close</button>
              </div>
              <div className="connections-profile-fields">
                <div>
                  <span>Lane</span>
                  <strong>{selectedConnection.lane}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{selectedConnection.category}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{selectedConnection.location}</strong>
                </div>
                <div>
                  <span>Closeness</span>
                  <strong>{selectedConnection.closeness}</strong>
                </div>
                <div>
                  <span>Last contact</span>
                  <strong>{selectedConnection.lastContact}</strong>
                </div>
                <div className="wide">
                  <span>Next touch</span>
                  <strong>{selectedConnection.nextAction}</strong>
                </div>
                <div className="wide">
                  <span>Profile</span>
                  <strong>{selectedConnection.profileSummary}</strong>
                </div>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    )
  }

  function renderCategorySignatureDashboard() {
    if (personalSection === 'home' || !currentSignatureDashboard || !currentPersonalData) return null

    const readoutCard = currentPersonalData.summaryCards[currentSignatureDashboard.readoutSourceIndex]
    const selectedLens = currentSignatureDashboard.lenses[currentSignatureLensIndex] ?? currentSignatureDashboard.lenses[0]
    const selectedLensCard = currentPersonalData.summaryCards[selectedLens.sourceIndex]
    const action = currentSectionDashboard?.actionRows[0]

    return (
      <section className={`category-signature-dashboard ${currentSignatureDashboard.kind}`} aria-label={`${currentPersonalContent?.title} signature dashboard`}>
        <article className="signature-prime">
          <div className="signature-prime-copy">
            <div className="revamp-kicker">{currentSignatureDashboard.eyebrow}</div>
            <h3>{currentSignatureDashboard.title}</h3>
            <p>{action?.body ?? currentDirective.usefulFor}</p>
          </div>
          <div className="signature-readout" aria-label={currentSignatureDashboard.readoutLabel}>
            <span>{currentSignatureDashboard.readoutLabel}</span>
            <strong>{readoutCard?.value ?? 'Resolving'}</strong>
            <small>{currentSignatureDashboard.readoutUnit}</small>
          </div>
        </article>

        <article className="signature-visual">
          <div className="signature-map-label">{currentSignatureDashboard.mapLabel}</div>
          <div className="signature-map">
            {currentSignatureDashboard.mapItems.map((item, index) => {
              const card = currentPersonalData.summaryCards[item.sourceIndex]
              return (
                <button
                  key={item.label}
                  className={`signature-map-node node-${index + 1}${card?.stale ? ' stale' : ''}`}
                  onClick={() => setCategoryLensIndex((prev) => ({ ...prev, [personalSection]: index % currentSignatureDashboard.lenses.length }))}
                >
                  <span>{item.label}</span>
                  <strong>{card?.value ?? 'No signal'}</strong>
                </button>
              )
            })}
          </div>
        </article>

        <article className="signature-lens-panel">
          <div className="signature-lens-tabs" role="tablist" aria-label={`${currentPersonalContent?.title} dashboard lens`}>
            {currentSignatureDashboard.lenses.map((lens, index) => (
              <button
                key={lens.label}
                className={index === currentSignatureLensIndex ? 'active' : ''}
                onClick={() => setCategoryLensIndex((prev) => ({ ...prev, [personalSection]: index }))}
              >
                {lens.label}
              </button>
            ))}
          </div>
          <div className="signature-lens-body">
            <span>{selectedLensCard?.label ?? 'Selected signal'}</span>
            <strong>{selectedLens.title}</strong>
            <p>{selectedLens.body}</p>
            <small>{selectedLensCard ? `${selectedLensCard.value}: ${selectedLensCard.note}` : 'This lens is waiting for stronger projection data.'}</small>
          </div>
        </article>
      </section>
    )
  }

  if (!authed) {
    return (
      <div className="revamp-login-shell">
        <div className="revamp-login-grid" />
        <form className="revamp-login-card" onSubmit={handleLoginSubmit}>
          <div className="revamp-kicker">Private Control Center</div>
          <h1>Dark Tech Access</h1>
          <p>Private access into the live dark-tech control center.</p>
          <label><span>Username</span><input value={login.username} onChange={(e) => setLogin((prev) => ({ ...prev, username: e.target.value }))} autoComplete="username" /></label>
          <label><span>Password</span><input type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} autoComplete="current-password" /></label>
          <button type="submit" disabled={lockedOut}>{lockedOut ? `Locked · ${lockoutSeconds}s` : 'Enter Control Center'}</button>
          <div className="revamp-login-meta">{loginError ?? `Attempts used: ${attempts}/${MAX_LOGIN_ATTEMPTS}`}</div>
        </form>
      </div>
    )
  }

  return (
    <div className={isPersonalHome ? 'revamp-shell home-shell' : 'revamp-shell'}>
      <div className="revamp-shell-bg" />
      <header className={isPersonalHome ? 'revamp-topbar home-topbar' : 'revamp-topbar'}>
        <div>
          <div className="revamp-kicker">Mitchell Control Center</div>
          <h1>{isPersonalHome ? 'Home' : pageLabel(currentPage)}</h1>
          {isPersonalHome ? null : <p>{currentDirective.outcome}. {currentDirective.system}</p>}
        </div>
        <div className={topActionClassName}>
          {isPersonalHome ? null : (
            <button className="revamp-toggle home-action" onClick={() => navigateToPage('home')}>Home</button>
          )}
          {appMode === 'business' ? null : (
            <button className="revamp-toggle desktop-nav-action" onClick={() => navigateToPage('business-command')}>Ops</button>
          )}
          <button className="revamp-command-btn desktop-nav-action" onClick={() => setCommandOpen(true)}>Command</button>
          <button className="revamp-lock-btn desktop-nav-action" onClick={logout}>Lock</button>
        </div>
      </header>

      {isPersonalHome ? null : (
        <>
          {appMode === 'business' ? (
            <>
              <section className="command-horizon" aria-label="Growth OS command horizon">
                <div className="command-horizon-lead">
                  <span className="revamp-kicker">Growth OS Horizon</span>
                  <strong>{primaryNextMove}</strong>
                  <p>{currentDirective.usefulFor}</p>
                </div>
                <div className="command-horizon-cells">
                  {commandHorizonStats.map((item) => (
                    <article key={item.label} className="command-horizon-cell">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
                <button className="command-horizon-action" onClick={() => setCommandOpen(true)}>
                  <span>Command</span>
                  <strong>Ctrl K</strong>
                </button>
              </section>

              <section className="daily-command-strip" aria-label="Current command summary">
                <article className="daily-command-primary">
                  <span>Best next move</span>
                  <strong>{primaryNextMove}</strong>
                  <p>{currentDirective.usefulFor}</p>
                </article>
                <article>
                  <span>Signal quality</span>
                  <strong>{currentSignalQuality}</strong>
                  <p>{currentEvidenceLabel}</p>
                </article>
                <article>
                  <span>Cadence</span>
                  <strong>{currentDirective.cadence}</strong>
                  <p>Designed for fast scanning, then deeper action only when needed.</p>
                </article>
                <article className="daily-command-action">
                  <span>Command lane</span>
                  <strong>Ask, route, decide</strong>
                  <button className="revamp-command-btn solid" onClick={() => setCommandOpen(true)}>Open command</button>
                </article>
              </section>

              <section className="revamp-status-ribbon">
                <div><span>Current route</span><strong>{currentPath}</strong></div>
                <div><span>Section</span><strong>{pageLabel(currentPage)}</strong></div>
                <div><span>Mode</span><strong>Business operations</strong></div>
                <div><span>Navigation</span><strong>Direct pages active</strong></div>
              </section>
            </>
          ) : null}
        </>
      )}

      {appMode === 'personal' ? (
        isPersonalAssistantPage(currentPage) ? (
          renderPersonalAssistantPage()
        ) : activePersonalApp ? (
          renderPersonalAppPage(activePersonalApp)
        ) : personalSection === 'home' ? (
          <main className="home-constellation-screen" aria-label="Home control map">
            <section className="home-avatar-constellation" aria-label="Avatar section map">
              <svg className="home-constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {HOME_CONSTELLATION_NODES.map((node) => (
                  <g key={node.key}>
                    <line
                      className={`constellation-line ${node.tone}`}
                      x1={node.x}
                      y1={node.y}
                      x2={node.anchorX}
                      y2={node.anchorY}
                    />
                    <circle className={`constellation-anchor ${node.tone}`} cx={node.anchorX} cy={node.anchorY} r="0.72" />
                  </g>
                ))}
              </svg>
              <div className="home-avatar-core">
                <div className="avatar-stage-visual premium-stage-frame">
                  <Suspense
                    fallback={null}
                  >
                    <AvatarModelScene modelPath={AVATAR_MODEL_PATH} />
                  </Suspense>
                </div>
                <div className="home-core-label">
                  <span>Mitchell Thanath</span>
                </div>
              </div>
              {HOME_CONSTELLATION_NODES.map((node) => {
                return (
                  <button
                    key={node.key}
                    className={`home-orbit-node node-${node.key} ${node.tier} ${node.tone}`}
                    style={{ '--node-x': `${node.x}%`, '--node-y': `${node.y}%` } as CSSProperties}
                    onClick={() => navigateToPage(node.key)}
                  >
                    <strong>{node.label}</strong>
                  </button>
                )
              })}
            </section>
            <div className="home-app-dock assistant-only" aria-label="MyAIgent assistant">
              <button
                type="button"
                className="home-assistant-button"
                aria-label="Open Personal Assistant"
                onClick={() => navigateToPage('personal-assistant')}
              >
                <span className="home-assistant-glyph" aria-hidden="true">PA</span>
                <span className="home-assistant-copy">
                  <strong>Personal Assistant</strong>
                  <small>Shika skills, summaries, follow-through</small>
                </span>
                <span className="home-assistant-open" aria-hidden="true">Open</span>
              </button>
            </div>
          </main>
        ) : (
          <main className="revamp-detail-page">
            {personalSection === 'identity' || personalSection === 'vessel' || personalSection === 'ventures' || personalSection === 'systems' || personalSection === 'career' || personalSection === 'wealth' || personalSection === 'education' ? null : (
              <section className="revamp-detail-hero">
                <button className="back-button" onClick={() => navigateToPage('home')}>Home</button>
                <div>
                  <div className="revamp-kicker">{currentPersonalContent?.eyebrow}</div>
                  <h2>{currentPersonalContent?.title}</h2>
                  <p>{currentPersonalData?.heroSummary}</p>
                </div>
                <aside className="section-utility-card">
                  <span>{currentDirective.cadence}</span>
                  <strong>{currentDirective.outcome}</strong>
                  <p>{currentDirective.usefulFor}</p>
                </aside>
              </section>
            )}
            {personalSection === 'identity' ? renderIdentityScorecardPage() : personalSection === 'vessel' ? renderVesselPage() : personalSection === 'ventures' ? renderVenturesPage() : personalSection === 'systems' ? renderSystemsPage() : personalSection === 'career' ? renderCareerPage() : personalSection === 'wealth' ? renderWealthPage() : personalSection === 'education' ? renderEducationPage() : personalSection === 'relationships' ? renderConnectionsPage() : (
              <>
                {renderCategorySignatureDashboard()}
                {renderPersonalDashboardLead()}
                <section className="revamp-card-grid">
                  {currentPersonalData?.summaryCards.map((card) => (
                    <article key={card.label} className={`glass-panel detail-signal-card${card.stale ? ' stale' : ''}`}>
                      <span>{card.label}</span>
                      <strong>{card.value}</strong>
                      <p>{card.note}</p>
                    </article>
                  ))}
                </section>
                {currentGrowthLoop ? (
                  <section className="personal-growth-loop" aria-label={`${currentPersonalContent?.title} growth loop`}>
                    <article className="glass-panel growth-loop-prime">
                      <div className="revamp-kicker">{currentGrowthLoop.definition.cadence}</div>
                      <h3>{currentGrowthLoop.definition.target}</h3>
                      <p>{currentGrowthLoop.definition.compound}</p>
                    </article>
                    <article className="growth-loop-step">
                      <span>Current signal</span>
                      <strong>{currentGrowthLoop.progressValue}</strong>
                      <p>{currentGrowthLoop.progressLabel}: {currentGrowthLoop.progressNote}</p>
                    </article>
                    <article className="growth-loop-step">
                      <span>Ritual</span>
                      <strong>{currentGrowthLoop.definition.ritual}</strong>
                      <p>Repeatable, small, and designed to keep this domain moving without making the app feel heavy.</p>
                    </article>
                    <article className="growth-loop-step warning">
                      <span>Blocker</span>
                      <strong>{currentGrowthLoop.blockerLabel}</strong>
                      <p>{currentGrowthLoop.blockerBody}</p>
                    </article>
                    <article className="growth-loop-step action">
                      <span>Next logical move</span>
                      <strong>{currentGrowthLoop.nextAction}</strong>
                      <p>{currentGrowthLoop.nextActionBody}</p>
                    </article>
                  </section>
                ) : null}
                <section className="cross-domain-board detail-cross-domain" aria-label={`${currentPersonalContent?.title} cross-domain intelligence`}>
                  <article className="glass-panel cross-domain-prime">
                    <div className="revamp-kicker">Why This Matters</div>
                    <h3>{currentCrossDomainInsights[0]?.title ?? 'This domain affects the rest of the system.'}</h3>
                    <p>{currentCrossDomainInsights[0]?.body ?? 'The page stays useful by showing what this signal changes across the wider Growth OS.'}</p>
                    {currentCrossDomainInsights[0] ? (
                      <div className="cross-domain-prime-proof">
                        <strong>{currentCrossDomainInsights[0].recommendation}</strong>
                        <small>{currentCrossDomainInsights[0].evidence}</small>
                      </div>
                    ) : null}
                    <div className="confidence-row">
                      <span>{sourceConfidence(currentPersonalData ?? undefined)}</span>
                      <span>{currentPersonalData?.freshness?.label ?? 'Projected records'}</span>
                      <span>{currentPersonalData?.missingData?.length ?? 0} gaps</span>
                    </div>
                  </article>
                  {currentCrossDomainInsights.slice(1).map((item) => (
                    <button key={item.title} className={`cross-domain-card ${item.tone}`} onClick={() => navigateToPage(item.pages.find((page) => page !== personalSection) ?? item.pages[0])}>
                      <span>{item.label}</span>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                      <div className="cross-domain-card-proof">
                        <small>Next: {item.recommendation}</small>
                        <small>Evidence: {item.evidence}</small>
                      </div>
                      <div className="cross-domain-route-row">
                        {item.pages.map((page) => (
                          <em key={page}>{pageLabel(page)}</em>
                        ))}
                      </div>
                    </button>
                  ))}
                </section>
                <section className="section-dashboard-grid">
              {currentSectionDashboard ? (
                <>
                  <article className={`glass-panel section-main-panel core-dashboard-panel${currentGrowthDashboard ? ' growth-dashboard-panel' : ''}`}>
                    <div className="revamp-kicker">Operating Dashboard</div>
                    <h3>{currentSectionDashboard.headline}</h3>
                    <div className="core-meter-grid">
                      {currentSectionDashboard.metrics.map((metric) => {
                        const card = currentPersonalData?.summaryCards[metric.sourceCardIndex]
                        return (
                          <div key={metric.label} className={`core-meter ${metric.priority}`}>
                            <span>{metric.label}</span>
                            <strong>{card?.value ?? 'No signal yet'}</strong>
                            <p>{card?.note ?? 'This signal is waiting on source coverage.'}</p>
                          </div>
                        )
                      })}
                    </div>
                    <div className="section-signal-list core-operating-list">
                      {currentSectionDashboard.operatingRows.map((item) => {
                        const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData?.summaryCards[item.sourceCardIndex] : undefined
                        return (
                          <div key={item.title} className={`section-signal-row${card?.stale ? ' stale' : ''}`}>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {card ? <small>{card.label}: {card.value}</small> : null}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                  <article className={`glass-panel section-evidence-panel${currentPersonalData?.freshness?.stale ? ' stale' : ''}`}>
                    <div className="revamp-kicker">Source And Evidence</div>
                    <h3>{currentPersonalData?.freshness?.label ?? 'Projection source status'}</h3>
                    <p>{currentPersonalData?.freshness ? (currentPersonalData.freshness.ageDays == null ? 'Source recency has not been established yet.' : `${currentPersonalData.freshness.ageDays} day${currentPersonalData.freshness.ageDays === 1 ? '' : 's'} since latest source update.`) : 'This page is using the current generated projection layer until the richer source model lands.'}</p>
                    <p>Dashboard snapshot: {generatedProjectionSnapshot.generatedAtLabel} from {generatedProjectionSnapshot.source}.</p>
                    <div className="core-source-list">
                      {currentSectionDashboard.evidenceRows.map((item) => {
                        const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData?.summaryCards[item.sourceCardIndex] : undefined
                        return (
                          <div key={item.title}>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {card ? <span>{card.value}</span> : null}
                          </div>
                        )
                      })}
                    </div>
                    <div className="projection-context-grid">
                      {(currentPersonalData?.blockers ?? []).length > 0 ? (
                        <div className="projection-context-group">
                          <span>Blockers</span>
                          {(currentPersonalData?.blockers ?? []).slice(0, 2).map((item) => (
                            <div key={`${item.label}-${item.value}`} className={`projection-context-item ${item.severity ?? 'watch'}`}>
                              <strong>{item.label}: {item.value}</strong>
                              <p>{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {(currentPersonalData?.missingData ?? []).length > 0 ? (
                        <div className="projection-context-group">
                          <span>Missing Data</span>
                          {(currentPersonalData?.missingData ?? []).slice(0, 2).map((item) => (
                            <div key={`${item.label}-${item.value}`} className={`projection-context-item ${item.severity ?? 'watch'}`}>
                              <strong>{item.label}: {item.value}</strong>
                              <p>{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {(currentPersonalData?.timeline ?? []).length > 0 ? (
                        <div className="projection-context-group">
                          <span>Recency</span>
                          {(currentPersonalData?.timeline ?? []).slice(0, 2).map((item) => (
                            <div key={`${item.label}-${item.recency}`} className={`projection-context-item ${item.severity ?? 'watch'}`}>
                              <strong>{item.label}: {item.recency}</strong>
                              <p>{item.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                  <article className="glass-panel section-action-panel">
                    <div className="revamp-kicker">Action Lane</div>
                    <h3>Next moves</h3>
                    <div className="section-action-list">
                      {currentSectionDashboard.actionRows.map((item) => {
                        const card = typeof item.sourceCardIndex === 'number' ? currentPersonalData?.summaryCards[item.sourceCardIndex] : undefined
                        return (
                          <div key={item.title} className={`section-action-item${card?.stale ? ' stale' : ''}`}>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {card ? <small>{card.label}: {card.note}</small> : null}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                </>
              ) : (
                <>
                  <article className="glass-panel section-main-panel">
                    <div className="revamp-kicker">Operating Dashboard</div>
                    <h3>{currentPersonalContent?.title} command view</h3>
                    <div className="section-signal-list">
                      {highlightCards.map((item) => (
                        <div key={item.title} className="section-signal-row">
                          <strong>{item.title}</strong>
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article className="glass-panel section-evidence-panel">
                    <div className="revamp-kicker">Source And Evidence</div>
                    <h3>{currentPersonalData?.freshness?.label ?? 'Projection source status'}</h3>
                    <p>{currentPersonalData?.freshness ? (currentPersonalData.freshness.ageDays == null ? 'Source recency has not been established yet.' : `${currentPersonalData.freshness.ageDays} day${currentPersonalData.freshness.ageDays === 1 ? '' : 's'} since latest source update.`) : 'This page is using the current generated projection layer until the richer source model lands.'}</p>
                    <div className="evidence-chip-row">
                      {(currentPersonalContent?.highlights ?? []).slice(0, 4).map((item) => <span key={item}>{item}</span>)}
                    </div>
                  </article>
                  <article className="glass-panel section-action-panel">
                    <div className="revamp-kicker">Action Lane</div>
                    <h3>Next moves</h3>
                    <div className="section-action-list">
                      {(currentPersonalData?.summaryCards ?? []).slice(0, 3).map((card) => (
                        <div key={card.label} className="section-action-item">
                          <strong>{card.label}</strong>
                          <p>{card.note}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </>
              )}
                </section>
              </>
            )}
          </main>
        )
      ) : dashboardData.loading ? (
        <main className="revamp-business-grid">
          <section className="revamp-business-main">
            <article className="glass-panel hero-business-panel state-panel">
              <div className="revamp-kicker">Business Command</div>
              <h2>Syncing live operations</h2>
              <p>The control center is pulling the latest queue, review, and publishing signals from the runtime.</p>
            </article>
          </section>
          <aside className="revamp-business-side">
            <article className="glass-panel review-dock-panel state-panel">
              <div className="revamp-kicker">Review Dock</div>
              <p>Preparing the next approval lane.</p>
            </article>
          </aside>
        </main>
      ) : dashboardData.error ? (
        <main className="revamp-business-grid">
          <section className="revamp-business-main">
            <article className="glass-panel hero-business-panel state-panel error">
              <div className="revamp-kicker">Business Command</div>
              <h2>Runtime signal interrupted</h2>
              <p>{dashboardData.error}</p>
            </article>
          </section>
          <aside className="revamp-business-side">
            <article className="glass-panel review-dock-panel state-panel error">
              <div className="revamp-kicker">Review Dock</div>
              <p>Live review data will return here once the runtime connection stabilizes.</p>
            </article>
          </aside>
        </main>
      ) : currentPage === 'agents' ? renderAgentDashboard()
        : currentPage === 'review-dock' ? renderReviewDockDashboard()
          : currentPage === 'runtime-trail' ? renderRuntimeTrailDashboard()
            : renderBusinessCommandDashboard()}

      {commandOpen ? (
        <div className="command-overlay">
          <div className="command-modal revamp-command-modal">
            <div className="command-modal-top">
              <div>
                <div className="revamp-kicker">Spotlight Command</div>
                <div className="shell-submark">Natural-language control across personal and business operations</div>
              </div>
              <button className="revamp-lock-btn" onClick={() => setCommandOpen(false)}>Close</button>
            </div>
            <div className="command-context">Context: {appMode} · {appMode === 'personal' ? personalSection : businessPanel}</div>
            <div className="command-input-wrap">
              <input autoFocus placeholder="Tell the control center what you want to do..." value={commandValue} onChange={(e) => setCommandValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void submitCommand() }} />
              <button className="revamp-command-btn solid" onClick={() => void submitCommand()}>Send</button>
            </div>
            <div className="command-launcher-grid">
              <section className="command-route-panel" aria-label="Fast navigation">
                <span>Fast navigation</span>
                <div className="command-route-list">
                  {quickNavItems.map((item) => (
                    <button key={item.page} className={item.page === currentPage ? 'command-route-item active' : 'command-route-item'} onClick={() => navigateToPage(item.page)}>
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                      <small>{PAGE_ROUTES[item.page]}</small>
                    </button>
                  ))}
                </div>
              </section>
              <section className="command-route-panel" aria-label="Context actions">
                <span>Context actions</span>
                <div className="command-action-grid">
                  {quickActions.map((item) => (
                    <button
                      key={item.label}
                      className="command-action-button"
                      onClick={() => item.page ? navigateToPage(item.page) : item.prompt ? setCommandValue(item.prompt) : undefined}
                    >
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                    </button>
                  ))}
                </div>
                <div className="command-suggestion-row compact">
                  {commandSuggestions.map((item) => (
                    <button key={item.label} className="command-suggestion-chip" onClick={() => setCommandValue(item.prompt)}>{item.label}</button>
                  ))}
                </div>
              </section>
            </div>
            <div className="command-intelligence-grid">
              <div className="command-preview-panel">
                <span>Routing preview</span>
                {commandPreview ? (
                  <>
                    <strong>{commandPreview.route} · {commandPreview.intent.replace(/_/g, ' ')}</strong>
                    <p>{commandPreview.summary}</p>
                    <p className="command-preview-next">Next: {commandPreview.nextAction}</p>
                  </>
                ) : (
                  <>
                    <strong>Awaiting command</strong>
                    <p>Search a page, pick an action, or type a request to see the route before it moves through the command lane.</p>
                  </>
                )}
              </div>
              <div className="command-response-box">
                <span>Latest response</span>
                <strong>Command status</strong>
                <p>{commandResponse}</p>
              </div>
            </div>
            <div className="command-history">
              <h3>Recent commands</h3>
              {commandHistory.length === 0 ? <p>The command lane is open and ready for the first move in this session.</p> : (
                <div className="command-history-list">
                  {commandHistory.map((item) => (
                    <div key={item.id} className="history-chip command-history-card">
                      <span>{item.context}</span>
                      <strong>{item.text}</strong>
                      {item.action ? (
                        <div className="command-action-trace">
                          <p><b>{item.action.label}</b> · {item.action.status.replace(/_/g, ' ')}</p>
                          <p>{item.action.effect}</p>
                          <p className="command-action-safety">{item.action.safety}</p>
                          <div className="command-action-meta">
                            <span>{formatActionTime(item.action.executedAt)}</span>
                            {item.action.provenance.map((entry) => <code key={entry}>{entry}</code>)}
                          </div>
                          {item.handoff ? (
                            <div className="command-handoff-trace">
                              <p><b>{item.handoff.status.replace(/_/g, ' ')}</b> · {item.handoff.message}</p>
                              <p>{item.handoff.safety}</p>
                              <div className="command-action-meta">
                                <span>{item.handoff.auditId}</span>
                                <span>{formatActionTime(item.handoff.recordedAt)}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
