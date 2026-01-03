'use client';

import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TitleBar } from '@/features/dashboard/TitleBar';
import {
  type AgentActivity,
  type AnalyticsOverview,
  FixmateAPI,
  type Issue,
  type IssueMessage,
} from '@/libs/FixmateAPI';

type DemoScenario = 'washing_machine' | 'emergency' | 'heating' | 'plumbing';

const scenarios: Array<{
  id: DemoScenario;
  title: string;
  description: string;
  icon: string;
  expectedOutcome: string;
  color: string;
}> = [
  {
    id: 'washing_machine',
    title: 'Washing Machine',
    description: 'Appliance won\'t start - common troubleshooting scenario',
    icon: '🧺',
    expectedOutcome: 'AI guides through troubleshooting → Resolution',
    color: 'bg-blue-500',
  },
  {
    id: 'emergency',
    title: 'Gas Emergency',
    description: 'Tenant smells gas - triggers immediate escalation',
    icon: '🚨',
    expectedOutcome: 'Instant URGENT escalation',
    color: 'bg-red-500',
  },
  {
    id: 'heating',
    title: 'Boiler Issue',
    description: 'No hot water with error code',
    icon: '🔥',
    expectedOutcome: 'Troubleshooting or escalation based on response',
    color: 'bg-orange-500',
  },
  {
    id: 'plumbing',
    title: 'Slow Drain',
    description: 'Kitchen sink draining slowly',
    icon: '🚿',
    expectedOutcome: 'Simple fix guidance',
    color: 'bg-cyan-500',
  },
];

const roleStyles: Record<string, { bg: string; label: string; align: string }> = {
  tenant: { bg: 'bg-muted', label: 'Tenant', align: 'justify-start' },
  agent: { bg: 'bg-primary text-primary-foreground', label: 'AI Agent', align: 'justify-end' },
  system: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100', label: 'System', align: 'justify-center' },
};

export default function DemoPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<IssueMessage[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState<DemoScenario | null>(null);
  const [tenantResponse, setTenantResponse] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  // Fetch analytics on mount
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await FixmateAPI.getAnalyticsOverview();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    }
    fetchAnalytics();
  }, []);

  // Poll for updates when there's an active issue
  useEffect(() => {
    if (!activeIssue) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const [issue, msgs, acts] = await Promise.all([
          FixmateAPI.getIssue(activeIssue.id),
          FixmateAPI.getMessages(activeIssue.id),
          FixmateAPI.getIssueActivity(activeIssue.id),
        ]);
        setActiveIssue(issue);
        setMessages(msgs);
        setActivities(acts);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [activeIssue?.id]);

  const runScenario = useCallback(async (scenario: DemoScenario) => {
    setSimulating(scenario);
    setLoading(true);
    setMessages([]);
    setActivities([]);

    try {
      const result = await FixmateAPI.simulateIssue(scenario);
      const issue = await FixmateAPI.getIssue(result.issue_id);
      const msgs = await FixmateAPI.getMessages(result.issue_id);
      const acts = await FixmateAPI.getIssueActivity(result.issue_id);

      setActiveIssue(issue);
      setMessages(msgs);
      setActivities(acts);

      // Refresh analytics
      const analytics = await FixmateAPI.getAnalyticsOverview();
      setAnalytics(analytics);
    } catch (err) {
      console.error('Failed to run scenario:', err);
    } finally {
      setLoading(false);
      setSimulating(null);
    }
  }, []);

  const sendTenantMessage = async () => {
    if (!activeIssue || !tenantResponse.trim()) {
      return;
    }

    setSendingResponse(true);
    try {
      await FixmateAPI.sendMessage(activeIssue.id, tenantResponse);
      setTenantResponse('');

      // Wait a moment then refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      const [msgs, acts, issue] = await Promise.all([
        FixmateAPI.getMessages(activeIssue.id),
        FixmateAPI.getIssueActivity(activeIssue.id),
        FixmateAPI.getIssue(activeIssue.id),
      ]);
      setMessages(msgs);
      setActivities(acts);
      setActiveIssue(issue);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingResponse(false);
    }
  };

  return (
    <>
      <TitleBar
        title="AI Demo Scenarios"
        description="Test the AI agent with different maintenance scenarios"
      />

      {/* Analytics Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
              <svg className="size-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Resolution Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics?.highlights.ai_resolution_rate || '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics?.highlights.total_savings || '£0'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900">
              <svg className="size-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics?.highlights.avg_response_time || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg className="size-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issues Handled</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics?.highlights.issues_handled || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Choose a Scenario</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => runScenario(scenario.id)}
              disabled={loading}
              className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg disabled:opacity-50 ${
                simulating === scenario.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${scenario.color}`} />
              <div className="mb-3 text-4xl">{scenario.icon}</div>
              <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary">
                {scenario.title}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {scenario.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {scenario.expectedOutcome}
              </div>
              {simulating === scenario.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation */}
      {activeIssue && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversation Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h3 className="font-semibold text-foreground">{activeIssue.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Issue #
                    {activeIssue.id}
                  </p>
                </div>
                <Badge className={`
                  ${activeIssue.status === 'resolved_by_agent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : ''}
                  ${activeIssue.status === 'escalated' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : ''}
                  ${activeIssue.status === 'triaging' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : ''}
                `}
                >
                  {activeIssue.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Messages */}
              <div className="max-h-96 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const style = roleStyles[msg.role] ?? roleStyles.system!;
                    return (
                      <div key={msg.id} className={`flex ${style?.align ?? 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${style?.bg ?? 'bg-muted'}`}>
                          <div className="mb-1 text-xs font-medium opacity-70">{style?.label ?? 'Unknown'}</div>
                          <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tenant Response Input */}
              {activeIssue.status === 'triaging' && (
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tenantResponse}
                      onChange={e => setTenantResponse(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendTenantMessage()}
                      placeholder="Simulate tenant response..."
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={sendingResponse}
                    />
                    <Button
                      onClick={sendTenantMessage}
                      disabled={sendingResponse || !tenantResponse.trim()}
                    >
                      {sendingResponse
                        ? (
                            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          )
                        : (
                            'Send'
                          )}
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setTenantResponse('Yes, that worked! The machine is running now.')}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300"
                    >
                      It worked!
                    </button>
                    <button
                      onClick={() => setTenantResponse('I tried that but it still won\'t start.')}
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300"
                    >
                      Still not working
                    </button>
                    <button
                      onClick={() => setTenantResponse('I\'m not comfortable doing that myself.')}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                    >
                      Need professional
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4">
                <h3 className="font-semibold text-foreground">Agent Activity</h3>
                <p className="text-sm text-muted-foreground">Real-time decision log</p>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                <div className="space-y-3">
                  {activities.map(act => (
                    <div key={act.id} className="rounded-lg bg-muted/50 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {act.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(act.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {act.details && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {act.action === 'reasoning' && 'reasoning' in act.details && (
                            <p className="italic">
                              &quot;
                              {String(act.details.reasoning).slice(0, 150)}
                              ...&quot;
                            </p>
                          )}
                          {act.action === 'escalated' && (
                            <p>
                              Priority:
                              {' '}
                              <span className="font-medium">{String(('priority' in act.details ? act.details.priority : 'medium') || 'medium').toUpperCase()}</span>
                              {'estimated_cost_low' in act.details && (
                                <span className="ml-2">
                                  Est: £
                                  {String(act.details.estimated_cost_low)}
                                  -£
                                  {String('estimated_cost_high' in act.details ? act.details.estimated_cost_high : '?')}
                                </span>
                              )}
                            </p>
                          )}
                          {act.action === 'resolved_by_agent' && 'estimated_savings' in act.details && (
                            <p className="text-emerald-600 dark:text-emerald-400">
                              Saved: £
                              {String(act.details.estimated_savings)}
                            </p>
                          )}
                          {act.action === 'emergency_detected' && 'keywords' in act.details && (
                            <p className="text-red-600 dark:text-red-400">
                              Keywords:
                              {' '}
                              {Array.isArray(act.details.keywords) ? (act.details.keywords as string[]).join(', ') : String(act.details.keywords)}
                            </p>
                          )}
                          {act.action === 'sentiment_assessed' && 'sentiment' in act.details && (
                            <p>
                              Sentiment:
                              {' '}
                              <span className="font-medium">{String(act.details.sentiment)}</span>
                              {' '}
                              (score:
                              {'score' in act.details ? String(act.details.score) : 'N/A'}
                              )
                            </p>
                          )}
                        </div>
                      )}
                      {act.would_notify && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Would notify:
                          {' '}
                          {act.would_notify}
                        </div>
                      )}
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      No activity yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!activeIssue && !loading && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Select a Scenario</h3>
          <p className="mt-1 text-muted-foreground">
            Choose a demo scenario above to see the AI agent in action
          </p>
        </div>
      )}
    </>
  );
}
