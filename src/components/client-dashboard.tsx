"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "./app-shell";
import { AuditForm } from "./audit-form";
import type { AuditInput, AuditJobStatus, LocalAudit } from "./audit-types";
import { ClientAuditHistory } from "./widgets/client/client-audit-history";
import {
  ClientMetrics,
  ClientWelcome,
} from "./widgets/client/client-dashboard-overview";
import { ClientSelectedAudit } from "./widgets/client/client-selected-audit";
import { auditJobQueryKey, fetchAuditJob } from "@/src/lib/audit-queries";

const HISTORY_KEY = "signal-seo-audit-history";

function readHistory(): LocalAudit[] {
  try {
    const saved = window.localStorage.getItem(HISTORY_KEY);
    return saved ? (JSON.parse(saved) as LocalAudit[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(rows: LocalAudit[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(rows.slice(0, 30)));
  } catch {
    // Private browsing may disable storage.
  }
}

export function ClientDashboard() {
  const queryClient = useQueryClient();
  const [audits, setAudits] = useState<LocalAudit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pendingAudits = useMemo(
    () =>
      audits.filter(
        (audit) => !["completed", "failed"].includes(audit.state),
      ),
    [audits],
  );
  const jobQueries = useQueries({
    queries: pendingAudits.map((audit) => ({
      queryKey: auditJobQueryKey(audit.jobId),
      queryFn: ({ signal }) => fetchAuditJob(audit.jobId, signal),
      enabled: hydrated,
      refetchInterval: 10_000,
      refetchIntervalInBackground: false,
    })),
  });
  const queryUpdateToken = pendingAudits
    .map(
      (audit, index) =>
        `${audit.jobId}:${jobQueries[index]?.dataUpdatedAt ?? 0}`,
    )
    .join("|");

  useEffect(() => {
    const history = readHistory();
    setAudits(history);
    setSelectedId(history[0]?.jobId ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !queryUpdateToken) return;

    const updatedByJobId = new Map(
      pendingAudits.flatMap((audit) => {
        const status = queryClient.getQueryData<AuditJobStatus>(
          auditJobQueryKey(audit.jobId),
        );
        if (!status) return [];

        const progress =
          typeof status.progress === "number"
            ? status.progress
            : status.progress?.percent ?? audit.progress;

        return [
          [
            audit.jobId,
            {
              ...audit,
              state: status.state,
              progress,
              result: status.result,
              error: status.error,
            },
          ] as const,
        ];
      }),
    );
    if (updatedByJobId.size === 0) return;

    const currentHistory = readHistory();
    const merged = currentHistory.map(
      (audit) => updatedByJobId.get(audit.jobId) ?? audit,
    );
    if (JSON.stringify(currentHistory) === JSON.stringify(merged)) return;

    saveHistory(merged);
    setAudits(merged);
  }, [hydrated, pendingAudits, queryClient, queryUpdateToken]);

  function queued(jobId: string, input: AuditInput) {
    const next: LocalAudit = {
      jobId,
      input,
      state: "waiting",
      progress: 0,
      submittedAt: new Date().toISOString(),
      result: null,
      error: null,
    };
    const history = [next, ...readHistory()].slice(0, 30);
    saveHistory(history);
    setAudits(history);
    setSelectedId(jobId);
  }

  const selected = audits.find((audit) => audit.jobId === selectedId) ?? audits[0];
  const activeCount = audits.filter((audit) =>
    ["waiting", "active", "processing"].includes(audit.state),
  ).length;
  const completedCount = audits.filter(
    (audit) => audit.state === "completed",
  ).length;

  return (
    <AppShell
      eyebrow="CLIENT WORKSPACE"
      title="Your SEO, in focus."
      description="Run a website audit and turn search signals into a clear plan for growth."
    >
      <ClientWelcome />
      <ClientMetrics
        total={audits.length}
        active={activeCount}
        completed={completedCount}
      />
      <div className="client-grid">
        <AuditForm onQueued={queued} />
        <ClientAuditHistory
          audits={audits}
          hydrated={hydrated}
          selectedJobId={selected?.jobId ?? null}
          onSelect={setSelectedId}
        />
      </div>
      {selected && <ClientSelectedAudit audit={selected} />}
    </AppShell>
  );
}
