/**
 * Typed API Client Interfaces for FastAPI Backend Communication
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorDetail {
  code?: string;
  message: string;
  field?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==========================================
// Member DTOs
// ==========================================

export interface MemberDto {
  id: string;
  member_id: string;
  group_id: string;
  group_name?: string | null;
  group_code?: string | null;
  full_name: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  national_id?: string | null;
  id_document_type?: string | null;
  occupation?: string | null;
  monthly_income?: number | null;
  blood_group?: string | null;
  mobile: string;
  alt_mobile?: string | null;
  email?: string | null;
  phone?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_mobile?: string | null;
  emergency_contact_relation?: string | null;
  join_date?: string | null;
  status: string;
  remarks?: string | null;
  marital_status?: string | null;
  education?: string | null;
  workplace?: string | null;
  designation?: string | null;
  skills?: string | null;
  reference?: string | null;
  reason_for_joining?: string | null;
  participation?: string | null;
  declaration_accepted: boolean;
  member_type: string;
  position?: string | null;
  paid_until_month?: number | null;
  paid_until_year?: number | null;
  created_at: string;
  updated_at: string;
}

export type MemberListResponse = PaginatedResult<MemberDto>;

export interface MemberDetailResponse extends MemberDto {
  documents?: DocumentDto[];
  status_history?: any[];
}

export interface DocumentDto {
  id: string;
  title: string;
  document_type?: string | null;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  cloudinary_public_id?: string | null;
  created_at: string;
}

export interface MemberCreatePayload {
  group_id: string;
  full_name: string;
  mobile: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  national_id?: string | null;
  id_document_type?: string | null;
  occupation?: string | null;
  monthly_income?: number | null;
  blood_group?: string | null;
  alt_mobile?: string | null;
  email?: string | null;
  phone?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_mobile?: string | null;
  emergency_contact_relation?: string | null;
  join_date?: string | null;
  marital_status?: string | null;
  education?: string | null;
  workplace?: string | null;
  designation?: string | null;
  skills?: string | null;
  reference?: string | null;
  reason_for_joining?: string | null;
  participation?: string | null;
  declaration_accepted?: boolean;
  member_type?: string;
  position?: string | null;
  documents?: {
    title: string;
    document_type?: string | null;
    file_url: string;
    file_type?: string | null;
    file_size?: number | null;
    cloudinary_public_id?: string | null;
  }[];
}

export interface MemberUpdatePayload extends Partial<MemberCreatePayload> {
  status?: string;
  remarks?: string;
}

// ==========================================
// Member Request DTOs
// ==========================================

export interface MemberRequestDto {
  id: string;
  application_number: string;
  group_id: string;
  group_name?: string | null;
  full_name: string;
  mobile: string;
  email?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  national_id?: string | null;
  id_document_type?: string | null;
  occupation?: string | null;
  education?: string | null;
  blood_group?: string | null;
  marital_status?: string | null;
  alt_mobile?: string | null;
  phone?: string | null;
  present_address?: string | null;
  permanent_address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_mobile?: string | null;
  emergency_contact_relation?: string | null;
  reference?: string | null;
  reason_for_joining?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  rejection_reason?: string | null;
  admin_message?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  created_member_id?: string | null;
  created_at: string;
  updated_at: string;
  documents?: DocumentDto[];
}

export type MemberRequestListResponse = PaginatedResult<MemberRequestDto>;

export type MemberRequestCreatePayload = MemberCreatePayload;

export interface MemberRequestApprovePayload {
  remarks?: string | null;
  position?: string | null;
  member_type?: string;
}

export interface MemberRequestRejectPayload {
  rejection_reason: string;
  remarks?: string | null;
}

// ==========================================
// Media Upload DTOs
// ==========================================

export interface MediaUploadResponse {
  success: boolean;
  secure_url: string;
  public_id: string;
  format?: string | null;
  bytes?: number | null;
  resource_type?: string | null;
  original_filename?: string | null;
}

export interface MediaDeleteResponse {
  success: boolean;
  message: string;
  result?: string | null;
}

// ==========================================
// Authentication DTOs
// ==========================================

export interface UserProfileDto {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  mobile?: string | null;
  role: string;
  status: string;
  photo?: string | null;
  preferences?: string | null;
  permissions: string[];
}

export interface AuthLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfileDto;
}

export interface DeviceSessionDto {
  id: string;
  jti: string;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  ip_address?: string | null;
  last_active: string;
  expires_at: string;
}

export interface DeviceSessionListResponse {
  sessions: DeviceSessionDto[];
  current_jti?: string | null;
}
