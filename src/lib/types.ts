export type ContactType = "telefoon" | "email" | "persoonlijk" | "teams" | "anders";
export type TaskPriority = "laag" | "normaal" | "hoog";
export type LeadWarmth = "koud" | "lauw" | "warm" | "heet";
export type OrganizationSize = "1-10" | "11-50" | "50-250" | "250-1000" | "1000+";
export type SponsorshipStatus = "concept" | "contracted" | "active" | "completed" | "at-risk" | "cancelled";
export type DeliverableStatus = "not-started" | "in-progress" | "delivered" | "overdue";
export type ActivityType = "call" | "email" | "meeting" | "note" | "contract" | "payment" | "assessment";
export type PaymentStatus = "scheduled" | "due" | "paid" | "overdue";
export type PipelineStageType = "open" | "won" | "lost";
export type HandleCategory = "archetype" | "individual" | "both";
export type FinancialEntryType = "income" | "expense";
export type FinancialEntryCategory = "direct" | "indirect" | "goodwill";
export type ArchetypeId =
  | "calculerende-rationalist"
  | "lokale-held"
  | "netwerker-relatiebeheerder"
  | "stadstrots-aanjager"
  | "talentenjager"
  | "vinkjes-zetter";
export type ReturnType = "ROI" | "ROO" | "ROE" | "ROA" | "ROCI" | "ROKI" | "ROK";

export const INDUSTRIES = [
  "Tech",
  "Finance",
  "Retail",
  "Food & Beverage",
  "Automotive",
  "Energy",
  "Media",
  "Sport",
  "Health",
  "Education",
  "Bouw & Installatie",
  "HR & Personeel",
  "Architectuur & Ingenieurs",
  "Juridische Dienstverlening",
  "Groothandel & E-commerce",
  "Horeca & Catering",
  "Vastgoed & Projectontwikkeling",
  "Cultuur, Sport & Recreatie",
  "Industrie & Voeding",
  "Industrie & Productie",
  "Gezondheidszorg & Farmacie",
  "Uitvaart & Maatschappelijk",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const ORGANIZATION_SIZES: OrganizationSize[] = ["1-10", "11-50", "50-250", "250-1000", "1000+"];

export interface PipelineStage {
  id: string;
  label: string;
  color: string;
  type: PipelineStageType;
  sortOrder: number;
}

export interface Owner {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Event {
  id: string;
  name: string;
}

export interface EventPackage {
  id: string;
  eventId: string;
  name: string;
  color: string;
  value: number;
  sortOrder: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
}

export interface PhoneNumber {
  id: string;
  name: string;
  number: string;
}

export interface ConversationLog {
  id: string;
  prospectId: string;
  date: string;
  contactType: ContactType;
  summary: string;
  content: string | null;
  authorId: string | null;
}

export interface Task {
  id: string;
  prospectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Prospect {
  id: string;
  company: string;
  industry: string;
  website: string | null;
  logoColor: string;
  stageId: string;
  estValue: number;
  probability: number;
  ownerId: string | null;
  notes: string | null;
  nextStep: string | null;
  nextStepDue: string | null;
  tags: string[];
  source: string | null;
  archetypeId: ArchetypeId | null;
  companyType: string | null;
  leadWarmth: LeadWarmth;
  successRatio: number;
  organizationSize: OrganizationSize | null;
  sizeBasedChance: number;
  city: string | null;
  dmuName: string | null;
  dmuPhone: string | null;
  createdAt: string;
  updatedAt: string;
  contacts: Contact[];
  phoneNumbers: PhoneNumber[];
}

export interface Deliverable {
  id: string;
  sponsorshipId: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  dueDate: string | null;
  completedAt: string | null;
  value: number | null;
}

export interface Activity {
  id: string;
  sponsorshipId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  date: string;
  authorId: string | null;
}

export interface Payment {
  id: string;
  sponsorshipId: string;
  invoiceNo: string | null;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
}

export interface AssessmentScore {
  id: string;
  sponsorshipId: string;
  handleId: string;
  score: number;
  note: string | null;
  updatedAt: string;
}

export interface Sponsorship {
  id: string;
  prospectId: string | null;
  renewedFromId: string | null;
  company: string;
  industry: string;
  website: string | null;
  logoColor: string;
  eventPackageId: string;
  status: SponsorshipStatus;
  value: number;
  startDate: string;
  endDate: string;
  ownerId: string | null;
  notes: string | null;
  tags: string[];
  archetypeId: ArchetypeId | null;
  returnFocus: ReturnType | null;
  createdAt: string;
  updatedAt: string;
  contacts: Contact[];
}

export interface Handle {
  id: string;
  name: string;
  category: HandleCategory;
  description: string | null;
  weight: number;
}

export interface YearTargets {
  sponsorCount: number;
  sponsorAmount: number;
  renewalRate: number;
}

export const DEFAULT_YEAR_TARGETS: YearTargets = {
  sponsorCount: 25,
  sponsorAmount: 500000,
  renewalRate: 70,
};

export const STATUS_META: Record<SponsorshipStatus, { label: string; color: string }> = {
  concept: { label: "Concept", color: "271 14% 60%" },
  contracted: { label: "Gecontracteerd", color: "271 60% 48%" },
  active: { label: "Actief", color: "152 56% 42%" },
  completed: { label: "Afgerond", color: "271 40% 55%" },
  "at-risk": { label: "Risico", color: "25 95% 53%" },
  cancelled: { label: "Geannuleerd", color: "0 72% 51%" },
};

export const DELIVERABLE_META: Record<DeliverableStatus, { label: string; color: string }> = {
  "not-started": { label: "Niet gestart", color: "271 14% 60%" },
  "in-progress": { label: "Bezig", color: "25 95% 53%" },
  delivered: { label: "Geleverd", color: "152 56% 42%" },
  overdue: { label: "Te laat", color: "0 72% 51%" },
};

export const WARMTH_META: Record<LeadWarmth, { label: string; color: string }> = {
  koud: { label: "Koud", color: "271 30% 80%" },
  lauw: { label: "Lauw", color: "271 50% 55%" },
  warm: { label: "Warm", color: "25 95% 53%" },
  heet: { label: "Heet", color: "0 72% 51%" },
};

export const RETURN_LABELS: Record<ReturnType, string> = {
  ROI: "Return on Investment",
  ROO: "Return on Objectives",
  ROE: "Return on Engagement",
  ROA: "Return on Awareness",
  ROCI: "Return on Community Investment",
  ROKI: "Return on Key Intangibles",
  ROK: "Return on Karma",
};

export const FINANCIAL_CATEGORY_LABELS: Record<FinancialEntryCategory, string> = {
  direct: "Direct",
  indirect: "Indirect",
  goodwill: "Goodwill",
};
