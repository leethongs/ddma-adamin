export type IncidentStatus = "pending" | "under_review" | "approved" | "rejected";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type ResourceType = "medical" | "food" | "shelter" | "rescue_team" | "vehicle" | "equipment" | "other";
export type ResourceStatus = "available" | "deployed" | "exhausted";

export interface Incident {
  id: string;
  created_at: string;
  updated_at: string;
  victim_name: string;
  contact_number: string;
  aadhaar_number?: string;
  address?: string;
  damage_type: string;
  damage_details?: string;
  photo_url?: string;
  video_url?: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  status: IncidentStatus;
  rejection_reason?: string;
  compensation_amount?: number;
  compensation_form_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface Alert {
  id: string;
  created_at: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  affected_area?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  is_active: boolean;
  created_by?: string;
}

export interface Resource {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  type: ResourceType;
  quantity: number;
  unit: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: ResourceStatus;
  notes?: string;
}

export interface Notification {
  id: string;
  created_at: string;
  incident_id?: string;
  recipient_contact: string;
  message: string;
  type: string;
  sent_at?: string;
}
