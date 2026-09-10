// Hand-written to mirror supabase/migrations/*.sql exactly.
//
// In a normal workflow this file is generated with:
//   supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
// That command needs a reachable Supabase project, which this sandbox does
// not have network access to. Keep this file in sync by hand whenever a
// migration changes the schema — the shape (Tables.<name>.Row/Insert/Update)
// matches what the CLI would produce, so swapping in a generated file later
// is a drop-in replacement.

export type PackageType = "a" | "b" | "c";
export type OrganizationRole = "owner" | "admin" | "member";
export type ProfileStatus = "lead" | "prospect" | "sponsor" | "inactive";
export type TaskStatus = "open" | "in_progress" | "done";
export type ProfileEventRole = "lead" | "sponsor";
export type ScoreType = "relationship" | "city" | "sponsor";
export type ScoreCriteriaPackageType = "b" | "c";

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
          package_type: PackageType;
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
          email: string | null;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: [];
      };
      lead_sources: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          quality_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          quality_score?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_sources"]["Insert"]>;
        Relationships: [];
      };
      archetypes: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["archetypes"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          archetype_id: string | null;
          status: ProfileStatus;
          organization_name: string;
          contact_name: string | null;
          street: string | null;
          house_number: string | null;
          postal_code: string | null;
          city: string | null;
          phone: string | null;
          email: string | null;
          custom_fields: Record<string, unknown>;
          archived_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          archetype_id?: string | null;
          status?: ProfileStatus;
          organization_name: string;
          contact_name?: string | null;
          street?: string | null;
          house_number?: string | null;
          postal_code?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          custom_fields?: Record<string, unknown>;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      profile_lead_source: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          lead_source_id: string;
          note: string | null;
          recorded_by: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          profile_id: string;
          lead_source_id: string;
          note?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_lead_source"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          status: TaskStatus;
          due_date: string | null;
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          profile_id: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          status?: TaskStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          profile_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
        Relationships: [];
      };
      relationship_scores: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          score_type: ScoreType;
          score: number;
          note: string | null;
          recorded_by: string | null;
          recorded_at: string;
          run_id: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          profile_id: string;
          score_type?: ScoreType;
          score: number;
          note?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
          run_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["relationship_scores"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          location: string | null;
          start_date: string | null;
          end_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          location?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      profile_event_links: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          event_id: string;
          role: ProfileEventRole;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          profile_id: string;
          event_id: string;
          role: ProfileEventRole;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_event_links"]["Insert"]>;
        Relationships: [];
      };
      score_criteria: {
        Row: {
          id: string;
          organization_id: string;
          package_type: ScoreCriteriaPackageType;
          key: string;
          label: string;
          weight: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          package_type: ScoreCriteriaPackageType;
          key: string;
          label: string;
          weight?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["score_criteria"]["Insert"]>;
        Relationships: [];
      };
      score_components: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          criterion_key: string;
          run_id: string;
          value: number;
          weight_applied: number;
          explanation: string;
          computed_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          profile_id: string;
          criterion_key: string;
          run_id: string;
          value: number;
          weight_applied: number;
          explanation: string;
          computed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["score_components"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_organization_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_role: {
        Args: Record<string, never>;
        Returns: OrganizationRole;
      };
      is_admin_or_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
