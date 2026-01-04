'use client';

import { Bot, ChevronDown, Home, Send, Settings2, User, Zap } from 'lucide-react';
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
import {
  type AgentActivity,
  FixmateAPI,
  type Issue,
  type IssueMessage,
} from '@/libs/FixmateAPI';

// Demo context that investors can configure
type DemoContext = {
  tenantName: string;
  propertyType: string;
  tenantSince: string;
  previousIssues: string;
  specialNotes: string;
};

const defaultContext: DemoContext = {
  tenantName: 'Sarah Johnson',
  propertyType: 'HMO - 5 bed student house',
  tenantSince: '6 months ago',
  previousIssues: 'Boiler serviced last month, new washing machine installed 2 weeks ago',
  specialNotes: 'Final year student, works part-time evenings',
};

// Quick scenario starters
const quickStarts = [
  { label: '🧺 Washing machine issue', message: 'My washing machine won\'t start. I pressed the power button but nothing happens.' },
  { label: '🔥 No hot water', message: 'There\'s no hot water this morning. The boiler display shows an error code E119.' },
  { label: '🚨 Smell gas', message: 'I can smell gas in the kitchen near the cooker. Should I be worried?' },
  { label: '🚿 Slow drain', message: 'The kitchen sink is draining really slowly. Takes about 5 minutes for water to go down.' },
  { label: '💡 Light not working', message: 'The light in my bedroom stopped working. I tried a new bulb but it still doesn\'t turn on.' },
];

export default function DemoPage() {
  // Context state
  const [context, setContext] = useState<DemoContext>(defaultContext);
  const [showContext, setShowContext] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<IssueMessage[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

        // Check if we got a new agent message
        if (msgs.length > messages.length) {
          setIsTyping(false);
        }

        setMessages(msgs);
        setActivities(acts);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [activeIssue?.id, messages.length]);

  // Start a new conversation with context
  const startConversation = useCallback(async (_initialMessage: string) => {
    setSending(true);
    setIsTyping(true);
    setMessages([]);
    setActivities([]);

    try {
      // Start demo scenario (context is shown in sidebar for investor reference)
      const result = await FixmateAPI.simulateIssue('washing_machine');

      // Override with custom message by sending tenant message
      const issue = await FixmateAPI.getIssue(result.issue_id);
      setActiveIssue(issue);

      // Wait for initial agent response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const msgs = await FixmateAPI.getMessages(result.issue_id);
      const acts = await FixmateAPI.getIssueActivity(result.issue_id);

      setMessages(msgs);
      setActivities(acts);
      setIsTyping(false);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  }, []);

  // Send a message in ongoing conversation
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim()) {
      return;
    }

    const message = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setIsTyping(true);

    try {
      if (!activeIssue) {
        // Start new conversation
        await startConversation(message);
      } else {
        // Continue existing conversation
        await FixmateAPI.sendMessage(activeIssue.id, message);

        // Wait for agent response
        await new Promise(resolve => setTimeout(resolve, 2000));

        const [msgs, acts, issue] = await Promise.all([
          FixmateAPI.getMessages(activeIssue.id),
          FixmateAPI.getIssueActivity(activeIssue.id),
          FixmateAPI.getIssue(activeIssue.id),
        ]);

        setMessages(msgs);
        setActivities(acts);
        setActiveIssue(issue);
        setIsTyping(false);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  }, [inputMessage, activeIssue, startConversation]);

  // Reset conversation
  const resetConversation = () => {
    setActiveIssue(null);
    setMessages([]);
    setActivities([]);
    setInputMessage('');
  };

  const isResolved = activeIssue && ['resolved_by_agent', 'closed'].includes(activeIssue.status);

  return (
    <>
      <TitleBar
        title="Interactive AI Demo"
        description="Experience the AI agent with customizable tenant context"
      />

      <div className="flex h-[calc(100vh-200px)] min-h-[600px] gap-4">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">FixMate AI</h3>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? 'typing...' : 'Property maintenance assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeIssue && (
                <Badge className={`
                  ${activeIssue.status === 'resolved_by_agent' ? 'bg-emerald-100 text-emerald-700' : ''}
                  ${activeIssue.status === 'escalated' ? 'bg-orange-100 text-orange-700' : ''}
                  ${activeIssue.status === 'triaging' ? 'bg-blue-100 text-blue-700' : ''}
                `}
                >
                  {activeIssue.status === 'resolved_by_agent' ? '✓ Resolved' :
                   activeIssue.status === 'escalated' ? '⚠ Escalated' : 'In Progress'}
                </Badge>
              )}
              {activeIssue && (
                <Button variant="outline" size="sm" onClick={resetConversation}>
                  New Chat
                </Button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !isTyping ? (
              /* Welcome Screen */
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="size-10 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Try the AI Agent
                </h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                  Type a maintenance issue below, or use a quick start to see how the AI handles real tenant problems.
                </p>

                {/* Quick Start Buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickStarts.map((qs, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputMessage(qs.message);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      {qs.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'tenant' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'tenant'
                          ? 'bg-primary text-primary-foreground'
                          : msg.role === 'agent'
                            ? 'bg-muted'
                            : 'border border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Bot className="size-3" />
                          FixMate AI
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="size-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                        <div className="size-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                        <div className="size-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {!isResolved ? (
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Describe your maintenance issue..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={sending || !inputMessage.trim()}>
                  <Send className="size-4" />
                </Button>
              </div>

              {/* Quick Responses for ongoing chat */}
              {activeIssue && activeIssue.status === 'triaging' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputMessage('Yes, that worked! The problem is fixed now.')}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200"
                  >
                    ✓ That worked!
                  </button>
                  <button
                    onClick={() => setInputMessage('I tried that but it\'s still not working.')}
                    className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 hover:bg-orange-200"
                  >
                    Still not working
                  </button>
                  <button
                    onClick={() => setInputMessage('I\'m not comfortable trying that myself.')}
                    className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                  >
                    Need a professional
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t border-border bg-emerald-50 p-4 text-center text-emerald-700">
              <p className="font-medium">Issue Resolved!</p>
              <p className="text-sm">The AI helped resolve this without a callout.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={resetConversation}>
                Start New Demo
              </Button>
            </div>
          )}
        </div>

        {/* Context Panel */}
        <div className={`w-80 overflow-y-auto rounded-xl border border-border bg-card shadow-sm transition-all ${showContext ? '' : 'w-12'}`}>
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex w-full items-center justify-between border-b border-border p-3"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-muted-foreground" />
              {showContext && <span className="font-medium">Tenant Context</span>}
            </div>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showContext ? '' : '-rotate-90'}`} />
          </button>

          {showContext && (
            <div className="space-y-4 p-4">
              <p className="text-xs text-muted-foreground">
                Configure tenant context to see how the AI uses prior knowledge.
              </p>

              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                  <User className="size-3" /> Tenant Name
                </label>
                <Input
                  value={context.tenantName}
                  onChange={(e) => setContext({ ...context, tenantName: e.target.value })}
                  placeholder="Tenant name"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                  <Home className="size-3" /> Property Type
                </label>
                <Select
                  value={context.propertyType}
                  onValueChange={(v) => setContext({ ...context, propertyType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HMO - 5 bed student house">HMO - 5 bed student house</SelectItem>
                    <SelectItem value="Single let - 2 bed flat">Single let - 2 bed flat</SelectItem>
                    <SelectItem value="Studio apartment">Studio apartment</SelectItem>
                    <SelectItem value="3 bed family home">3 bed family home</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 text-sm font-medium">Tenant Since</label>
                <Select
                  value={context.tenantSince}
                  onValueChange={(v) => setContext({ ...context, tenantSince: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week ago">1 week ago (new tenant)</SelectItem>
                    <SelectItem value="3 months ago">3 months ago</SelectItem>
                    <SelectItem value="6 months ago">6 months ago</SelectItem>
                    <SelectItem value="Over 1 year">Over 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 text-sm font-medium">Previous Issues</label>
                <Textarea
                  value={context.previousIssues}
                  onChange={(e) => setContext({ ...context, previousIssues: e.target.value })}
                  placeholder="Any prior maintenance history..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="mb-1 text-sm font-medium">Special Notes</label>
                <Textarea
                  value={context.specialNotes}
                  onChange={(e) => setContext({ ...context, specialNotes: e.target.value })}
                  placeholder="Anything the agent should know..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setContext(defaultContext)}
              >
                Reset to Default
              </Button>
            </div>
          )}

          {/* Activity Feed (below context) */}
          {showContext && activities.length > 0 && (
            <div className="border-t border-border">
              <div className="p-3">
                <h4 className="text-sm font-medium text-muted-foreground">Agent Reasoning</h4>
              </div>
              <div className="max-h-48 overflow-y-auto px-3 pb-3">
                <div className="space-y-2">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="rounded-lg bg-muted/50 p-2 text-xs">
                      <Badge variant="outline" className="mb-1 text-[10px]">
                        {act.action.replace(/_/g, ' ')}
                      </Badge>
                      {act.details && 'reasoning' in act.details && (
                        <p className="mt-1 italic text-muted-foreground">
                          "{String(act.details.reasoning).slice(0, 80)}..."
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
