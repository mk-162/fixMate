/**
 * FixMate API Client
 * Connects the Next.js frontend to the Python backend
 */

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_FIXMATE_API_URL || 'http://localhost:8000';
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  // Remove trailing headers if present
  return url.replace(/\/$/, '');
};

const API_BASE = getApiBase();

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
  pm_notes: string | null;
  agent_muted: boolean;
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
  skip_agent?: boolean;
  priority?: string;
  assigned_to?: string;
};

// Property types
type Property = {
  id: number;
  org_id: number;
  name: string;
  address: string | null;
  tenant_count: number;
  active_issue_count: number;
  created_at: string;
  updated_at: string;
};

type CreatePropertyRequest = {
  name: string;
  address?: string;
};

// Tenant types
type Tenant = {
  id: number;
  org_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  property_id: number | null;
  property_name: string | null;
  property_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CreateTenantRequest = {
  name: string;
  property_id?: number;
  email?: string;
  phone?: string;
};

// API request helper with optional org header
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  orgId?: string,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (orgId) {
    headers['X-Clerk-Org-Id'] = orgId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
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

  async sendMessage(
    issueId: number,
    message: string,
    role: 'tenant' | 'team' = 'team',
  ): Promise<{ status: string; message: string }> {
    return apiRequest(`/api/issues/${issueId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, role }),
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

  async updateIssueStatus(issueId: number, status: string): Promise<{ status: string }> {
    return apiRequest(`/api/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async updateIssueNotes(issueId: number, notes: string): Promise<{ status: string; pm_notes: string }> {
    return apiRequest(`/api/issues/${issueId}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },

  async updateIssuePriority(issueId: number, priority: string): Promise<{ status: string; priority: string }> {
    return apiRequest(`/api/issues/${issueId}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority }),
    });
  },

  async assignIssue(issueId: number, assignedTo: string): Promise<{ status: string; assigned_to: string }> {
    return apiRequest(`/api/issues/${issueId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
  },

  async muteAgent(issueId: number, muted: boolean): Promise<{ status: string; agent_muted: boolean }> {
    return apiRequest(`/api/issues/${issueId}/mute-agent`, {
      method: 'PUT',
      body: JSON.stringify({ muted }),
    });
  },

  async getAgentStatus(issueId: number): Promise<{ issue_id: number; agent_muted: boolean }> {
    return apiRequest(`/api/issues/${issueId}/agent-status`);
  },

  // ==========================================
  // Properties API
  // ==========================================
  async listProperties(orgId: string): Promise<Property[]> {
    return apiRequest('/api/properties', {}, orgId);
  },

  async createProperty(data: CreatePropertyRequest, orgId: string): Promise<Property> {
    return apiRequest('/api/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }, orgId);
  },

  async updateProperty(propertyId: number, data: CreatePropertyRequest, orgId: string): Promise<Property> {
    return apiRequest(`/api/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, orgId);
  },

  async deleteProperty(propertyId: number, orgId: string): Promise<void> {
    return apiRequest(`/api/properties/${propertyId}`, {
      method: 'DELETE',
    }, orgId);
  },

  // ==========================================
  // Tenants API
  // ==========================================
  async listTenants(orgId: string, includeInactive = false): Promise<Tenant[]> {
    const query = includeInactive ? '?include_inactive=true' : '';
    return apiRequest(`/api/tenants${query}`, {}, orgId);
  },

  async createTenant(data: CreateTenantRequest, orgId: string): Promise<Tenant> {
    return apiRequest('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    }, orgId);
  },

  async updateTenant(tenantId: number, data: Partial<CreateTenantRequest>, orgId: string): Promise<Tenant> {
    return apiRequest(`/api/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, orgId);
  },

  async deleteTenant(tenantId: number, orgId: string): Promise<void> {
    return apiRequest(`/api/tenants/${tenantId}`, {
      method: 'DELETE',
    }, orgId);
  },

  // ==========================================
  // Demo & Analytics API (for investor demos)
  // ==========================================

  // Demo scenarios
  async simulateIssue(scenario: DemoScenario): Promise<DemoIssueResponse> {
    return apiRequest(`/api/demo/simulate-issue?scenario=${scenario}`);
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return apiRequest('/api/analytics/overview');
  },

  async getResolutionStats(): Promise<AnalyticsOverview['resolution']> {
    return apiRequest('/api/analytics/resolution');
  },

  async getCategoryBreakdown(): Promise<AnalyticsOverview['categories']> {
    return apiRequest('/api/analytics/categories');
  },

  async getResponseTimeStats(): Promise<AnalyticsOverview['response_times']> {
    return apiRequest('/api/analytics/response-times');
  },
};

// ==========================================
// Types for Demo & Analytics
// ==========================================

type DemoScenario = 'washing_machine' | 'emergency' | 'heating' | 'plumbing';

type DemoIssueResponse = {
  issue_id: number;
  scenario: string;
  status: string;
  message: string;
  next_steps: string[];
};

type AnalyticsOverview = {
  resolution: {
    total_issues: number;
    resolved_by_agent: number;
    escalated: number;
    resolution_rate: number;
    estimated_savings: number;
    avg_callout_cost: number;
  };
  categories: Array<{
    category: string;
    total: number;
    resolved: number;
    escalated: number;
  }>;
  response_times: {
    avg_response_seconds: number;
    avg_response_formatted: string;
  };
  highlights: {
    ai_resolution_rate: string;
    total_savings: string;
    avg_response_time: string;
    issues_handled: number;
  };
};

export type {
  AgentActivity,
  AnalyticsOverview,
  CreateIssueRequest,
  CreatePropertyRequest,
  CreateTenantRequest,
  DemoIssueResponse,
  DemoScenario,
  Issue,
  IssueMessage,
  Property,
  Tenant,
};
