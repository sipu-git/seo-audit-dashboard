import { Icon } from "./icons";
import { Download } from "lucide-react";
import { Button } from "./ui/button";
import type { AuditAnalysis, AuditIssue, AuditResult } from "./audit-types";

const breakdownLabels: Record<string, string> = {
  technical: "Technical SEO",
  on_page: "On-page SEO",
  content: "Content quality",
  core_web_vitals: "Core Web Vitals",
  schema: "Structured data",
};

function ScoreRing({ score, size = "large" }: { score: number; size?: "large" | "small" }) {
  const value = Math.max(0, Math.min(100, score));
  return <div className={`score-ring score-ring-${size}`} style={{ "--score": `${value * 3.6}deg` } as React.CSSProperties}><div><strong>{value}</strong><span>/100</span></div></div>;
}

function IssueCard({ issue, index }: { issue: AuditIssue; index: number }) {
  return <article className="issue-card">
    <div className="issue-top"><span className="issue-number">{String(index + 1).padStart(2, "0")}</span><span className={`priority-badge priority-${(issue.priority || "medium").toLowerCase()}`}>{issue.priority || issue.estimated_impact || "INSIGHT"}</span>{issue.category && <span className="category-label">{issue.category}</span>}</div>
    <h4>{issue.finding || issue.issue || "SEO opportunity identified"}</h4>
    {issue.fix && <p>{issue.fix}</p>}
    {(issue.estimated_impact || issue.effort) && <div className="issue-meta">{issue.estimated_impact && <span>Impact: <strong>{issue.estimated_impact}</strong></span>}{issue.effort && <span>Effort: <strong>{issue.effort}</strong></span>}</div>}
    {issue.falsifiability_check && <div className="verify-note"><Icon name="check" /><span>Measure: {issue.falsifiability_check}</span></div>}
  </article>;
}

function IssueSection({ title, subtitle, items, tone }: { title: string; subtitle: string; items?: AuditIssue[]; tone: string }) {
  if (!items?.length) return null;
  return <section className="report-section">
    <div className="section-heading"><div><span className={`section-marker ${tone}`} /><div><h3>{title}</h3><p>{subtitle}</p></div></div><span className="count-pill">{items.length}</span></div>
    <div className="issue-list">{items.map((item, index) => <IssueCard key={`${title}-${index}`} issue={item} index={index} />)}</div>
  </section>;
}

export function AuditReport({ result, compact = false, reportJobId }: { result: AuditResult; compact?: boolean; reportJobId?: string }) {
  const analysis = result.analysis as AuditAnalysis | undefined;
  if (!analysis) return null;
  const sources = result.dataSources ?? {};
  const signals = result.signals ?? {};
  const rows = Object.entries(analysis.score_breakdown ?? {});

  return <div className={`audit-report ${compact ? "audit-report-compact" : ""}`}>
    <div className="report-summary-card">
      <div className="report-score"><ScoreRing score={analysis.overall_score ?? 0} /><div><span className="success-label"><span className="live-dot" /> AUDIT COMPLETE</span><h2>SEO health overview</h2><p>{analysis.executive_summary || "Your audit is ready. Explore the findings and prioritized next steps below."}</p></div></div>
      {rows.length > 0 && <div className="score-breakdown">{rows.map(([key, value]) => <div className="score-row" key={key}><div className="score-row-label"><span>{breakdownLabels[key] || key.replaceAll("_", " ")}</span><strong>{value}</strong></div><div className="score-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>)}</div>}
    </div>

    <div className="report-source-line"><div className="source-chip source-live"><span className="live-dot" /> Live crawl</div><div className="source-chip source-mock"><span /> Sample provider signals</div><span className="source-detail">{signals.crawl?.finalUrl || result.business?.url || "Website audit"}</span>{reportJobId && <Button asChild variant="outline" size="sm" className="report-download"><a href={`/api/audits/${encodeURIComponent(reportJobId)}/report`}><Download aria-hidden="true" /> Download PDF</a></Button>}</div>

    <div className="report-columns">
      <div className="report-main-column">
        <IssueSection title="Critical issues" subtitle="Address these first to protect visibility" items={analysis.critical_issues} tone="tone-red" />
        <IssueSection title="Important findings" subtitle="High-value improvements for your next sprint" items={analysis.important_issues} tone="tone-amber" />
        <IssueSection title="Recommended actions" subtitle="Prioritized steps based on the signals we analyzed" items={analysis.recommendations} tone="tone-green" />
      </div>
      <aside className="report-side-column">
        <IssueSection title="Quick wins" subtitle="Small changes with near-term value" items={analysis.quick_wins} tone="tone-blue" />
        <div className="signal-card"><div className="signal-card-heading"><span className="signal-icon"><Icon name="chart" /></span><div><h3>Signals in this report</h3><p>Know what informed your analysis</p></div></div>{Object.entries(sources).map(([name, source]) => <div className="signal-row" key={name}><span>{name.replaceAll(/([A-Z])/g, " $1").replaceAll("-", " ")}</span><span className={`signal-tag ${source === "live" ? "tag-live" : "tag-mock"}`}>{source}</span></div>)}{result.note && <p className="report-note">{result.note}</p>}</div>
        <div className="report-tip"><Icon name="spark" /><div><strong>Make progress, not guesses</strong><p>Each action includes a way to verify whether the change worked.</p></div></div>
      </aside>
    </div>
  </div>;
}

export { ScoreRing };
