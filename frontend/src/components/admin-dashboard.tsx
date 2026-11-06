"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "./app-shell";
import { AdminAuditDetails } from "./widgets/admin/admin-audit-details";
import { AuditForm } from "./audit-form";
import type { AuditInput, AuditRow } from "./audit-types";
import { Button } from "./ui/button";
import { Icon } from "./icons";
import { Card } from "./ui/card";
import {
  AdminAuditTable,
  ADMIN_AUDIT_PAGE_SIZE,
} from "./widgets/admin/admin-audit-table";
import { AdminMetrics, AdminQueueStatus } from "./widgets/admin/admin-dashboard-overview";
import { auditListQueryKey, fetchAudits } from "@/src/lib/audit-queries";

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pendingJobIds, setPendingJobIds] = useState<string[]>([]);
  const auditsQuery = useQuery({
    queryKey: auditListQueryKey,
    queryFn: ({ signal }) => fetchAudits(signal),
    refetchInterval: (query) =>
      pendingJobIds.length > 0 ||
      query.state.data?.some((audit) =>
        ["QUEUED", "PROCESSING"].includes(audit.status),
      )
        ? 10_000
        : false,
    refetchIntervalInBackground: false,
  });
  const audits = auditsQuery.data ?? [];
  const selected =
    audits.find((audit) => audit.jobId === selectedJobId) ?? null;
  const error = auditsQuery.error instanceof Error ? auditsQuery.error.message : "";
  const lastUpdated = auditsQuery.dataUpdatedAt
    ? new Date(auditsQuery.dataUpdatedAt)
    : null;

  useEffect(() => {
    if (pendingJobIds.length === 0 || !auditsQuery.data) return;

    const finishedJobIds = pendingJobIds.filter((jobId) => {
      const audit = auditsQuery.data.find((row) => row.jobId === jobId);
      return audit && ["COMPLETED", "FAILED"].includes(audit.status);
    });
    if (finishedJobIds.length > 0) {
      setPendingJobIds((current) =>
        current.filter((jobId) => !finishedJobIds.includes(jobId)),
      );
    }
  }, [auditsQuery.data, pendingJobIds]);

  const filtered = useMemo(
    () =>
      audits.filter((audit) => {
        const matchesFilter = filter === "ALL" || audit.status === filter;
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          [audit.url, audit.city, audit.businessType, audit.jobId].some(
            (value) => value.toLowerCase().includes(term),
          );
        return matchesFilter && matchesSearch;
      }),
    [audits, filter, search],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ADMIN_AUDIT_PAGE_SIZE),
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => {
    const scoredAudits = audits.filter((row) => row.overallScore !== null);
    return {
      total: audits.length,
      active: audits.filter((row) =>
        ["QUEUED", "PROCESSING"].includes(row.status),
      ).length,
      completed: audits.filter((row) => row.status === "COMPLETED").length,
      failed: audits.filter((row) => row.status === "FAILED").length,
      average: scoredAudits.length
        ? Math.round(
            scoredAudits.reduce(
              (sum, row) => sum + (row.overallScore ?? 0),
              0,
            ) / scoredAudits.length,
          )
        : null,
    };
  }, [audits]);

  function queued(jobId: string, input: AuditInput) {
    setShowForm(false);
    setPendingJobIds((current) =>
      current.includes(jobId) ? current : [...current, jobId],
    );
    void queryClient.invalidateQueries({ queryKey: auditListQueryKey });
    window.localStorage.setItem(
      "signal-seo-last-admin-job",
      JSON.stringify({ jobId, input, submittedAt: new Date().toISOString() }),
    );
  }

  return (
    <AppShell
      eyebrow="INTERNAL OPERATIONS"
      title="Audit command center"
      description="Monitor queued jobs, review completed reports, and initiate manual audits."
      action={
        <Button
          className="h-10 rounded-[9px] px-[15px] text-xs font-bold shadow-[0_5px_12px_#118d681f] transition-transform hover:-translate-y-px"
          onClick={() => setShowForm((value) => !value)}
        >
          <Icon className="size-4" name={showForm ? "close" : "plus"} />
          {showForm ? "Close form" : "New audit"}
        </Button>
      }
    >
      {showForm && (
        <Card
          className="admin-form-panel grid grid-cols-[minmax(200px,.75fr)_minmax(0,1.25fr)] items-start gap-6 rounded-[14px] border-[#e7ede9] bg-[#fcfefd] px-6 py-[22px] shadow-[0_4px_15px_#293e3209] max-[780px]:grid-cols-1"
        >
          <div>
            <p className="eyebrow">MANUAL TRIGGER</p>
            <h2>Queue a website audit</h2>
            <p>Start a BullMQ job and follow its progress in this portal.</p>
          </div>
          <AuditForm compact onQueued={queued} />
        </Card>
      )}

      <AdminQueueStatus
        error={error}
        refreshing={auditsQuery.isFetching}
        lastUpdated={lastUpdated}
        onRefresh={() => void auditsQuery.refetch()}
      />
      <AdminMetrics
        total={stats.total}
        active={stats.active}
        completed={stats.completed}
        average={stats.average}
      />
      <AdminAuditTable
        audits={filtered}
        allAuditCount={audits.length}
        loading={auditsQuery.isPending}
        error={error}
        search={search}
        filter={filter}
        page={page}
        failedCount={stats.failed}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilterChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onRetry={() => void auditsQuery.refetch()}
        onSelect={(audit) => setSelectedJobId(audit.jobId)}
      />
      <AdminAuditDetails
        audit={selected}
        onClose={() => setSelectedJobId(null)}
      />
    </AppShell>
  );
}
