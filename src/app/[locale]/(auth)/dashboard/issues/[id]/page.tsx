'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { type AgentActivity, FixmateAPI, type Issue, type IssueMessage } from '@/libs/FixmateAPI';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  triaging: 'bg-yellow-100 text-yellow-800',
  resolved_by_agent: 'bg-green-100 text-green-800',
  escalated: 'bg-orange-100 text-orange-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  awaiting_confirmation: 'bg-pink-100 text-pink-800',
  closed: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  triaging: 'Agent Helping',
  resolved_by_agent: 'Resolved by Agent',
  escalated: 'Escalated',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  awaiting_confirmation: 'Awaiting Confirmation',
  closed: 'Closed',
};

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = Number(params.id);

  const [issue, setIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<IssueMessage[]>([]);
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [issueData, messagesData, activityData] = await Promise.all([
        FixmateAPI.getIssue(issueId),
        FixmateAPI.getMessages(issueId),
        FixmateAPI.getIssueActivity(issueId),
      ]);
      setIssue(issueData);
      setMessages(messagesData);
      setActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) {
      return;
    }

    setSending(true);
    try {
      await FixmateAPI.sendMessage(issueId, newMessage);
      setNewMessage('');
      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="text-gray-500">Loading issue...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || 'Issue not found'}
      </div>
    );
  }

  const isResolved = ['resolved_by_agent', 'closed'].includes(issue.status);

  return (
    <>
      <TitleBar
        title={issue.title}
        description={`Issue #${issue.id} - ${issue.category || 'General'}`}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main chat area */}
        <div className="lg:col-span-2">
          <div className="flex h-[600px] flex-col rounded-lg bg-white shadow">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'tenant' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'tenant'
                        ? 'bg-blue-500 text-white'
                        : msg.role === 'agent'
                          ? 'bg-gray-100 text-gray-900'
                          : 'border border-yellow-200 bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    <div className="mb-1 text-xs opacity-75">
                      {msg.role === 'tenant' ? 'You' : msg.role === 'agent' ? 'FixMate Assistant' : 'System'}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="mt-1 text-xs opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {!isResolved
              ? (
                  <form onSubmit={handleSendMessage} className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your response..."
                        disabled={sending}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={sending || !newMessage.trim()}>
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </form>
                )
              : (
                  <div className="border-t bg-green-50 p-4 text-center text-green-700">
                    This issue has been resolved!
                  </div>
                )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status card */}
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-3 font-semibold">Issue Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge className={statusColors[issue.status]}>
                  {statusLabels[issue.status] || issue.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Priority:</span>
                <span className="capitalize">{issue.priority || 'Medium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="capitalize">{issue.category || 'General'}</span>
              </div>
              {issue.assigned_to && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned to:</span>
                  <span>{issue.assigned_to}</span>
                </div>
              )}
              {issue.resolved_by_agent && (
                <div className="mt-3 rounded border border-green-200 bg-green-50 p-2">
                  <span className="text-sm text-green-700">
                    <strong>Resolved:</strong>
                    {' '}
                    {issue.resolved_by_agent}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Activity */}
          <div className="rounded-lg bg-white p-4 shadow">
            <button
              type="button"
              onClick={() => setShowActivity(!showActivity)}
              className="flex w-full items-center justify-between font-semibold"
            >
              <span>Agent Activity</span>
              <span className="text-gray-400">{showActivity ? '▼' : '▶'}</span>
            </button>

            {showActivity && (
              <div className="mt-3 space-y-2 text-sm">
                {activity.length === 0
                  ? (
                      <p className="text-gray-500">No activity yet</p>
                    )
                  : (
                      activity.map(act => (
                        <div key={act.id} className="border-l-2 border-blue-200 py-1 pl-3">
                          <div className="font-medium text-gray-700">
                            {act.action.replace(/_/g, ' ')}
                          </div>
                          {act.would_notify && (
                            <div className="text-xs text-gray-500">
                              Would notify:
                              {' '}
                              {act.would_notify}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(act.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
