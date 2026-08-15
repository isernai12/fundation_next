import { apiClient } from "./client";
import {
  MemberDto,
  MemberListResponse,
  MemberDetailResponse,
  MemberCreatePayload,
  MemberUpdatePayload,
  MemberRequestDto,
  MemberRequestListResponse,
  MemberRequestCreatePayload,
  MemberRequestApprovePayload,
  MemberRequestRejectPayload,
} from "./types";

export const membersApi = {
  /**
   * List members with pagination, group filter, and search
   */
  async list(params?: {
    query?: string;
    group_id?: string;
    status?: string;
    gender?: string;
    member_type?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<MemberListResponse> {
    return apiClient.get<MemberListResponse>("/api/v1/members", { params, token });
  },

  /**
   * Get single member by ID with linked documents
   */
  async get(id: string, token?: string): Promise<MemberDetailResponse> {
    return apiClient.get<MemberDetailResponse>(`/api/v1/members/${id}`, { token });
  },

  /**
   * Create a new member
   */
  async create(data: MemberCreatePayload, token?: string): Promise<MemberDetailResponse> {
    return apiClient.post<MemberDetailResponse>("/api/v1/members", data, { token });
  },

  /**
   * Update member profile
   */
  async update(id: string, data: MemberUpdatePayload, token?: string): Promise<MemberDetailResponse> {
    return apiClient.patch<MemberDetailResponse>(`/api/v1/members/${id}`, data, { token });
  },

  /**
   * Delete / archive a member
   */
  async delete(id: string, token?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/v1/members/${id}`, { token });
  },

  // =========================================================================
  // Member Requests (Public Applications)
  // =========================================================================

  /**
   * List member applications with status filter
   */
  async listRequests(params?: {
    query?: string;
    group_id?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<MemberRequestListResponse> {
    return apiClient.get<MemberRequestListResponse>("/api/v1/member-requests", { params, token });
  },

  /**
   * Get single member request application details
   */
  async getRequest(id: string, token?: string): Promise<MemberRequestDto> {
    return apiClient.get<MemberRequestDto>(`/api/v1/member-requests/${id}`, { token });
  },

  /**
   * Public submission of a new member registration application
   */
  async submitRequest(data: MemberRequestCreatePayload): Promise<MemberRequestDto> {
    return apiClient.post<MemberRequestDto>("/api/v1/member-requests", data);
  },

  /**
   * Approve a pending member application
   */
  async approveRequest(id: string, data: MemberRequestApprovePayload, token?: string): Promise<MemberDetailResponse> {
    return apiClient.post<MemberDetailResponse>(`/api/v1/member-requests/${id}/approve`, data, { token });
  },

  /**
   * Reject a pending member application with reason
   */
  async rejectRequest(id: string, data: MemberRequestRejectPayload, token?: string): Promise<MemberRequestDto> {
    return apiClient.post<MemberRequestDto>(`/api/v1/member-requests/${id}/reject`, data, { token });
  },

  /**
   * Get application status by application number or ID (public)
   */
  async getRequestStatus(identifier: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/member-requests/${identifier}/status`);
  },
};
