// Hand-written to mirror supabase/migrations/*.sql exactly (see the note in
// the fase-1 migrations for why this is hand-written rather than CLI-
// generated in this environment). Keep in sync by hand whenever a migration
// changes the schema.
//
// Every tenant-scoped table carries an `organization_id` column with a
// database default of `current_organization_id()` (resolved from the
// caller's JWT) — so it's typed as optional on Insert, same as `id`, even
// though the column itself is NOT NULL.

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
  TaskPriority,
} from "@/lib/types";

export type PackageType = "a" | "b" | "c";
export type OrganizationRole = "owner" | "admin" | "member";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          package_type: PackageType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          package_type?: PackageType;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: [];
      };
      platform_admins: {
        Row: { user_id: string; note: string | null; created_at: string };
        Insert: { user_id: string; note?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["platform_admins"]["Insert"]>;
        Relationships: [];
      };
      owners: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          initials: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name: string;
          initials: string;
          color: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["owners"]["Insert"]>;
        Relationships: [];
      };
      pipeline_stages: {
        Row: {
          id: string;
          organization_id: string;
          label: string;
          color: string;
          type: PipelineStageType;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string;
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
          organization_id: string;
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
          organization_id?: string;
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
          organization_id: string;
          prospect_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string;
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
        Row: { id: string; organization_id: string; prospect_id: string; name: string; number: string };
        Insert: {
          id?: string;
          organization_id?: string;
          prospect_id: string;
          name: string;
          number: string;
        };
        Update: Partial<Database["public"]["Tables"]["prospect_phone_numbers"]["Insert"]>;
        Relationships: [];
      };
      conversation_logs: {
        Row: {
          id: string;
          organization_id: string;
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
          organization_id?: string;
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
          organization_id: string;
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
          organization_id?: string;
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
      events: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      event_packages: {
        Row: {
          id: string;
          organization_id: string;
          event_id: string;
          name: string;
          color: string;
          value: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          event_id: string;
          name: string;
          color?: string;
          value?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_packages"]["Insert"]>;
        Relationships: [];
      };
      sponsorships: {
        Row: {
          id: string;
          organization_id: string;
          prospect_id: string | null;
          renewed_from_id: string | null;
          company: string;
          industry: string;
          website: string | null;
          logo_color: string;
          event_package_id: string;
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
          organization_id?: string;
          prospect_id?: string | null;
          renewed_from_id?: string | null;
          company: string;
          industry: string;
          website?: string | null;
          logo_color?: string;
          event_package_id: string;
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
          organization_id: string;
          sponsorship_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string;
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
          organization_id: string;
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
          organization_id?: string;
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
          organization_id: string;
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
          organization_id?: string;
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
          organization_id: string;
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
          organization_id?: string;
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
          organization_id: string;
          name: string;
          category: HandleCategory;
          description: string | null;
          weight: number;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string;
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
          organization_id: string;
          sponsorship_id: string;
          handle_id: string;
          score: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
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
          organization_id: string;
          sponsor_count: number;
          sponsor_amount: number;
          renewal_rate: number;
          updated_at: string;
        };
        Insert: {
          organization_id?: string;
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
    Functions: {
      is_platform_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      lookup_user_id_by_email: {
        Args: { lookup_email: string };
        Returns: string | null;
      };
      lookup_user_email: {
        Args: { lookup_user_id: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
  };
}
