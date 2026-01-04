'use client';

import { AlertTriangle, Bot, BotOff, CheckCircle, Clock, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const activityIcons: Record<string, React.ReactNode> = {
  sent_message: <Bot className="size-4 text-blue-500" />,
  escalated: <AlertTriangle className="size-4 text-orange-500" />,
  resolved_by_agent: <CheckCircle className="size-4 text-green-500" />,
  status_updated: <Clock className="size-4 text-purple-500" />,
  agent_muted: <BotOff className="size-4 text-red-500" />,
  agent_unmuted: <Bot className="size-4 text-green-500" />,
  issue_assigned: <User className="size-4 text-purple-500" />,
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
  const [pmNotes, setPmNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesChanged, setNotesChanged] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [updating, setUpdating] = useState(false);

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
      if (!notesChanged) {
        setPmNotes(issueData.pm_notes || '');
      }
      setAssignee(issueData.assigned_to || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  }, [issueId, notesChanged]);

  useEffect(() => {
    fetchData();
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
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleSaveNotes() {
    if (savingNotes) {
      return;
    }
    setSavingNotes(true);
    try {
      await FixmateAPI.updateIssueNotes(issueId, pmNotes);
      setNotesChanged(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    try {
      await FixmateAPI.updateIssueStatus(issueId, newStatus);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handlePriorityChange(newPriority: string) {
    setUpdating(true);
    try {
      await FixmateAPI.updateIssuePriority(issueId, newPriority);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority');
    } finally {
      setUpdating(false);
    }
  }

  async function handleAssign() {
    if (!assignee.trim()) {
      return;
    }
    setUpdating(true);
    try {
      await FixmateAPI.assignIssue(issueId, assignee);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign issue');
    } finally {
      setUpdating(false);
    }
  }

  async function handleToggleMute() {
    if (!issue) {
      return;
    }
    setUpdating(true);
    try {
      await FixmateAPI.muteAgent(issueId, !issue.agent_muted);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle agent');
    } finally {
      setUpdating(false);
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
          {/* Agent Muted Banner */}
          {issue.agent_muted && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <BotOff className="size-5" />
              <span className="font-medium">AI Agent is muted for this issue</span>
              <span className="text-sm">- Tenant messages won&apos;t receive automatic responses</span>
            </div>
          )}

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
                    <div className="mb-1 flex items-center gap-1 text-xs opacity-75">
                      {msg.role === 'agent' && <Bot className="size-3" />}
                      {msg.role === 'tenant' ? 'Tenant' : msg.role === 'agent' ? 'FixMate AI' : 'System'}
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

            {/* Input area - Staff can always respond */}
            {!isResolved && (
              <form onSubmit={handleSendMessage} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={issue.agent_muted ? 'Type your response (AI muted)...' : 'Type your response...'}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </form>
            )}
            {isResolved && (
              <div className="border-t bg-green-50 p-4 text-center text-green-700">
                This issue has been resolved!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Management Controls */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-3 font-semibold">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={issue.agent_muted ? 'default' : 'outline'}
                onClick={handleToggleMute}
                disabled={updating}
                className="gap-1"
              >
                {issue.agent_muted ? <Bot className="size-4" /> : <BotOff className="size-4" />}
                {issue.agent_muted ? 'Unmute AI' : 'Mute AI'}
              </Button>
              {!isResolved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('closed')}
                  disabled={updating}
                >
                  Close Issue
                </Button>
              )}
            </div>
          </div>

          {/* Status & Priority */}
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-3 font-semibold">Issue Management</h3>
            <div className="space-y-3">
              {/* Status */}
              <div>
                <label className="mb-1 block text-sm text-gray-500">Status</label>
                <Select
                  value={issue.status}
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <Badge className={statusColors[issue.status]}>
                        {statusLabels[issue.status] || issue.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <Badge className={statusColors[value]}>{label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-sm text-gray-500">Priority</label>
                <Select
                  value={issue.priority || 'medium'}
                  onValueChange={handlePriorityChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <Badge className={priorityColors[issue.priority || 'medium']}>
                        {(issue.priority || 'medium').charAt(0).toUpperCase() + (issue.priority || 'medium').slice(1)}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <Badge className={priorityColors.low}>Low</Badge>
                    </SelectItem>
                    <SelectItem value="medium">
                      <Badge className={priorityColors.medium}>Medium</Badge>
                    </SelectItem>
                    <SelectItem value="high">
                      <Badge className={priorityColors.high}>High</Badge>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <Badge className={priorityColors.urgent}>Urgent</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignment */}
              <div>
                <label className="mb-1 block text-sm text-gray-500">Assigned To</label>
                <div className="flex gap-2">
                  <Input
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                    placeholder="Team member name..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAssign} disabled={updating || !assignee.trim()}>
                    Assign
                  </Button>
                </div>
              </div>

              {/* Category & Created */}
              <div className="space-y-1 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="capitalize">{issue.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {issue.resolved_by_agent && (
                <div className="rounded border border-green-200 bg-green-50 p-2">
                  <span className="text-sm text-green-700">
                    <strong>Resolved:</strong>
                    {' '}
                    {issue.resolved_by_agent}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PM Notes */}
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-3 font-semibold">Internal Notes</h3>
            <Textarea
              value={pmNotes}
              onChange={e => {
                setPmNotes(e.target.value);
                setNotesChanged(true);
              }}
              placeholder="Add private notes (only visible to staff)..."
              rows={4}
              className="mb-2 text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {notesChanged ? 'Unsaved changes' : 'Saved'}
              </span>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes || !notesChanged}
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-3 font-semibold">Activity Timeline</h3>
            <div className="max-h-64 space-y-3 overflow-y-auto text-sm">
              {activity.length === 0
                ? (
                    <p className="text-gray-500">No activity yet</p>
                  )
                : (
                    activity.map(act => (
                      <div key={act.id} className="flex gap-2">
                        <div className="mt-0.5">
                          {activityIcons[act.action] || <Clock className="size-4 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-700">
                            {act.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          {act.would_notify && (
                            <div className="text-xs text-gray-500">
                              Would notify: {act.would_notify}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(act.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
