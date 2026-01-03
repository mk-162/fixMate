/**
 * FixMate API Client
 * Connects the Next.js frontend to the Python backend
 */

const API_BASE = process.env.NEXT_PUBLIC_FIXMATE_API_URL || 'http://localhost:8000';

type Issue = {
  id: number;
  tenant_id: number;
  property_id: number;
  title: string;
  description: string;
  category: string | null;
  status: string;
  priority: string | null;
  resolved_by_agent: string | null;
  assigned_to: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
};

type IssueMessage = {
  id: number;
  issue_id: number;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type AgentActivity = {
  id: number;
  issue_id: number | null;
  action: string;
  details: Record<string, unknown> | null;
  would_notify: string | null;
  created_at: string;
};

type CreateIssueRequest = {
  tenant_id: number;
  property_id: number;
  title: string;
  description: string;
  category?: string;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const FixmateAPI = {
  // Issues
  async createIssue(data: CreateIssueRequest): Promise<{ id: number; status: string; message: string }> {
    return apiRequest('/api/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getIssue(issueId: number): Promise<Issue> {
    return apiRequest(`/api/issues/${issueId}`);
  },

  async listIssues(params?: { property_id?: number; tenant_id?: number; status?: string }): Promise<Issue[]> {
    const searchParams = new URLSearchParams();
    if (params?.property_id) {
      searchParams.set('property_id', params.property_id.toString());
    }
    if (params?.tenant_id) {
      searchParams.set('tenant_id', params.tenant_id.toString());
    }
    if (params?.status) {
      searchParams.set('status', params.status);
    }

    const query = searchParams.toString();
    return apiRequest(`/api/issues${query ? `?${query}` : ''}`);
  },

  // Messages
  async getMessages(issueId: number): Promise<IssueMessage[]> {
    return apiRequest(`/api/issues/${issueId}/messages`);
  },

  async sendMessage(issueId: number, message: string): Promise<{ status: string; message: string }> {
    return apiRequest(`/api/issues/${issueId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Activity
  async getIssueActivity(issueId: number): Promise<AgentActivity[]> {
    return apiRequest(`/api/issues/${issueId}/activity`);
  },

  async getAllActivity(limit = 50): Promise<AgentActivity[]> {
    return apiRequest(`/api/activity?limit=${limit}`);
  },

  // Property Manager actions
  async assignTradesperson(issueId: number, assignedTo: string): Promise<{ status: string; assigned_to: string }> {
    return apiRequest(`/api/issues/${issueId}/assign?assigned_to=${encodeURIComponent(assignedTo)}`, {
      method: 'POST',
    });
  },

  async closeIssue(issueId: number): Promise<{ status: string }> {
    return apiRequest(`/api/issues/${issueId}/close`, {
      method: 'POST',
    });
  },
};

export type { AgentActivity, CreateIssueRequest, Issue, IssueMessage };
