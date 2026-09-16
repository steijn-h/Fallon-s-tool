// Hand-written to mirror supabase/migrations/*.sql exactly (see the note in
// the fase-1 migrations for why this is hand-written rather than CLI-
// generated in this environment). Keep in sync by hand whenever a migration
// changes the schema.

import type {
  ActivityType,
  ContactType,
  DeliverableStatus,
  HandleCategory,
  LeadWarmth,
  OrganizationSize,
  PaymentStatus,
  PipelineStageType,
  SponsorshipStatus,
  SponsorshipTier,
  TaskPriority,
} from "@/lib/types";

export interface Database {
  public: {
    Tables: {
      owners: {
        Row: { id: string; name: string; initials: string; color: string; created_at: string };
        Insert: { id?: string; name: string; initials: string; color: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["owners"]["Insert"]>;
        Relationships: [];
      };
      pipeline_stages: {
        Row: {
          id: string;
          label: string;
          color: string;
          type: PipelineStageType;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          label: string;
          color: string;
          type: PipelineStageType;
          sort_order: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pipeline_stages"]["Insert"]>;
        Relationships: [];
      };
      prospects: {
        Row: {
          id: string;
          company: string;
          industry: string;
          website: string | null;
          logo_color: string;
          stage_id: string;
          est_value: number;
          probability: number;
          owner_id: string | null;
          notes: string | null;
          next_step: string | null;
          next_step_due: string | null;
          tags: string[];
          source: string | null;
          archetype_id: string | null;
          company_type: string | null;
          lead_warmth: LeadWarmth;
          success_ratio: number;
          organization_size: OrganizationSize | null;
          size_based_chance: number;
          city: string | null;
          dmu_name: string | null;
          dmu_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company: string;
          industry: string;
          website?: string | null;
          logo_color?: string;
          stage_id: string;
          est_value?: number;
          probability?: number;
          owner_id?: string | null;
          notes?: string | null;
          next_step?: string | null;
          next_step_due?: string | null;
          tags?: string[];
          source?: string | null;
          archetype_id?: string | null;
          company_type?: string | null;
          lead_warmth?: LeadWarmth;
          success_ratio?: number;
          organization_size?: OrganizationSize | null;
          size_based_chance?: number;
          city?: string | null;
          dmu_name?: string | null;
          dmu_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prospects"]["Insert"]>;
        Relationships: [];
      };
      prospect_contacts: {
        Row: {
          id: string;
          prospect_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
        };
        Insert: {
          id?: string;
          prospect_id: string;
          name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["prospect_contacts"]["Insert"]>;
        Relationships: [];
      };
      prospect_phone_numbers: {
        Row: { id: string; prospect_id: string; name: string; number: string };
        Insert: { id?: string; prospect_id: string; name: string; number: string };
        Update: Partial<Database["public"]["Tables"]["prospect_phone_numbers"]["Insert"]>;
        Relationships: [];
      };
      conversation_logs: {
        Row: {
          id: string;
          prospect_id: string;
          log_date: string;
          contact_type: ContactType;
          summary: string;
          content: string | null;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospect_id: string;
          log_date?: string;
          contact_type: ContactType;
          summary: string;
          content?: string | null;
          author_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversation_logs"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          prospect_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: TaskPriority;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospect_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: TaskPriority;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      sponsorships: {
        Row: {
          id: string;
          prospect_id: string | null;
          renewed_from_id: string | null;
          company: string;
          industry: string;
          website: string | null;
          logo_color: string;
          tier: SponsorshipTier;
          status: SponsorshipStatus;
          value: number;
          start_date: string;
          end_date: string;
          owner_id: string | null;
          notes: string | null;
          tags: string[];
          archetype_id: string | null;
          return_focus: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prospect_id?: string | null;
          renewed_from_id?: string | null;
          company: string;
          industry: string;
          website?: string | null;
          logo_color?: string;
          tier: SponsorshipTier;
          status?: SponsorshipStatus;
          value?: number;
          start_date: string;
          end_date: string;
          owner_id?: string | null;
          notes?: string | null;
          tags?: string[];
          archetype_id?: string | null;
          return_focus?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sponsorships"]["Insert"]>;
        Relationships: [];
      };
      sponsorship_contacts: {
        Row: {
          id: string;
          sponsorship_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
        };
        Insert: {
          id?: string;
          sponsorship_id: string;
          name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["sponsorship_contacts"]["Insert"]>;
        Relationships: [];
      };
      deliverables: {
        Row: {
          id: string;
          sponsorship_id: string;
          title: string;
          description: string | null;
          status: DeliverableStatus;
          due_date: string | null;
          completed_at: string | null;
          value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sponsorship_id: string;
          title: string;
          description?: string | null;
          status?: DeliverableStatus;
          due_date?: string | null;
          completed_at?: string | null;
          value?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deliverables"]["Insert"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          sponsorship_id: string;
          type: ActivityType;
          title: string;
          description: string | null;
          occurred_at: string;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sponsorship_id: string;
          type: ActivityType;
          title: string;
          description?: string | null;
          occurred_at?: string;
          author_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          sponsorship_id: string;
          invoice_no: string | null;
          amount: number;
          due_date: string;
          paid_at: string | null;
          status: PaymentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          sponsorship_id: string;
          invoice_no?: string | null;
          amount: number;
          due_date: string;
          paid_at?: string | null;
          status?: PaymentStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      handles: {
        Row: {
          id: string;
          name: string;
          category: HandleCategory;
          description: string | null;
          weight: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          category: HandleCategory;
          description?: string | null;
          weight?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["handles"]["Insert"]>;
        Relationships: [];
      };
      assessment_scores: {
        Row: {
          id: string;
          sponsorship_id: string;
          handle_id: string;
          score: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sponsorship_id: string;
          handle_id: string;
          score: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assessment_scores"]["Insert"]>;
        Relationships: [];
      };
      year_targets: {
        Row: {
          id: number;
          sponsor_count: number;
          sponsor_amount: number;
          renewal_rate: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          sponsor_count?: number;
          sponsor_amount?: number;
          renewal_rate?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["year_targets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
