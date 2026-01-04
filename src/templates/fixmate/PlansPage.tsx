'use client';

import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  Lightbulb,
  Rocket,
  Target,
} from 'lucide-react';
import { useState } from 'react';

import { PublicPageLayout } from '@/components/public/PublicLayout';

interface Plan {
  slug: string;
  filename: string;
  title: string;
  status: string;
  created: string | null;
  content: string;
}

interface PlansContentProps {
  plans: Plan[];
}

const getStatusConfig = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes('complete') || lower.includes('done')) {
    return { color: 'bg-green-500/10 text-green-600', icon: CheckCircle2 };
  }
  if (lower.includes('progress') || lower.includes('active')) {
    return { color: 'bg-blue-500/10 text-blue-600', icon: Rocket };
  }
  if (lower.includes('pending') || lower.includes('review')) {
    return { color: 'bg-yellow-500/10 text-yellow-600', icon: Clock };
  }
  return { color: 'bg-gray-500/10 text-gray-600', icon: FileText };
};

const PlanCard = ({ plan }: { plan: Plan }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getStatusConfig(plan.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{plan.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className="size-3" />
                {plan.status}
              </span>
              {plan.created && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {plan.created}
                </span>
              )}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="size-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownContent content={plan.content} />
          </div>
        </div>
      )}
    </div>
  );
};

// Simple markdown parser for display
const MarkdownContent = ({ content }: { content: string }) => {
  // Split by lines and process
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let listItems: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 space-y-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const dataRows = tableRows.slice(2); // Skip header separator
      elements.push(
        <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers?.map((cell, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold">{cell.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
            <code>{codeContent}</code>
          </pre>,
        );
        codeContent = '';
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeContent += `${line}\n`;
      return;
    }

    // Tables
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushList();
      inTable = true;
      const cells = line.split('|').filter(Boolean);
      if (!line.match(/^\|[\s-|]+\|$/)) { // Skip separator rows
        tableRows.push(cells);
      } else {
        tableRows.push([]); // Placeholder for separator
      }
      return;
    }

    if (inTable && !line.includes('|')) {
      flushTable();
    }

    // Headings
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h1Match) {
      flushList();
      flushTable();
      elements.push(<h1 key={`h1-${index}`} className="mb-4 mt-8 text-2xl font-bold first:mt-0">{h1Match[1]}</h1>);
      return;
    }
    if (h2Match) {
      flushList();
      flushTable();
      elements.push(<h2 key={`h2-${index}`} className="mb-3 mt-6 text-xl font-bold">{h2Match[1]}</h2>);
      return;
    }
    if (h3Match) {
      flushList();
      flushTable();
      elements.push(<h3 key={`h3-${index}`} className="mb-2 mt-4 text-lg font-semibold">{h3Match[1]}</h3>);
      return;
    }

    // Lists
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch?.[1]) {
      flushTable();
      listItems.push(listMatch[1]);
      return;
    }

    // Numbered lists
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch?.[1]) {
      flushTable();
      listItems.push(numberedMatch[1]);
      return;
    }

    // Flush pending list if we hit a non-list line
    if (listItems.length > 0 && line.trim() !== '') {
      flushList();
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      flushList();
      flushTable();
      elements.push(<hr key={`hr-${index}`} className="my-6 border-border" />);
      return;
    }

    // Bold/status lines
    if (line.match(/^\*\*[^*]+\*\*:/)) {
      flushList();
      flushTable();
      const formatted = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p key={`meta-${index}`} className="my-2 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatted }} />,
      );
      return;
    }

    // Regular paragraphs
    if (line.trim()) {
      flushList();
      flushTable();
      // Handle inline formatting
      const formatted = line
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-sm">$1</code>');
      elements.push(
        <p key={`p-${index}`} className="my-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />,
      );
    }
  });

  // Flush any remaining content
  flushList();
  flushTable();

  return <>{elements}</>;
};

const PlansHero = () => (
  <section className="bg-gradient-to-b from-primary/5 to-transparent py-20">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
        <Target className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">Development Plans</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        Active Development Plans
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Proposals and technical plans for upcoming FixMate features. See what we're building and how we're building it.
      </p>
    </div>
  </section>
);

const NoPlansFallback = () => (
  <section className="py-16">
    <div className="mx-auto max-w-2xl px-6 text-center">
      <div className="mb-6 flex size-16 mx-auto items-center justify-center rounded-2xl bg-muted">
        <Code2 className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold">No Active Plans</h2>
      <p className="mt-2 text-muted-foreground">
        There are no development plans to display at the moment. Check back soon!
      </p>
    </div>
  </section>
);

export const PlansContent = ({ plans }: PlansContentProps) => (
  <PublicPageLayout>
    <PlansHero />

    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        {plans.length === 0 ? (
          <NoPlansFallback />
        ) : (
          <div className="space-y-6">
            {plans.map(plan => (
              <PlanCard key={plan.slug} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  </PublicPageLayout>
);
