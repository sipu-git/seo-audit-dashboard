import { Fragment } from "react";
import type { AuditRow } from "../../audit-types";
import { AuditStatusBadge } from "../../dashboard-widgets";
import { Icon } from "../../icons";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import {Pagination,PaginationContent,PaginationEllipsis,PaginationItem,PaginationLink,PaginationNext,PaginationPrevious} from "../../ui/pagination";
import { Progress } from "../../ui/progress";
import {Select,SelectContent,SelectItem,SelectTrigger, SelectValue} from "../../ui/select";

export const ADMIN_AUDIT_PAGE_SIZE = 5;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AuditTableToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: {
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}) {
  return (
    <div className="table-toolbar">
      <div className="table-search">
        <Icon name="search" />
        <Input
          className="h-auto min-w-0 border-0 bg-transparent px-0 py-0 text-xs font-medium text-[#22302a] shadow-none hover:border-0 focus-visible:ring-0 placeholder:text-[#98a79f]"
          aria-label="Search audit jobs"
          placeholder="Search website, client or job ID"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger
          className="admin-status-select h-[38px] w-[140px] min-w-[140px] rounded-[9px] border-[1.5px] border-[#cbd5cf] bg-white text-xs font-medium text-[#2b3934] shadow-sm hover:border-[#92a79c] focus-visible:border-[#0e9f75] focus-visible:ring-2 focus-visible:ring-[#0e9f75]/15"
          aria-label="Filter audit state"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="QUEUED">Queued</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function AuditTableRow({
  audit,
  onSelect,
}: {
  audit: AuditRow;
  onSelect: (audit: AuditRow) => void;
}) {
  const siteName = audit.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const isActive = ["QUEUED", "PROCESSING"].includes(audit.status);

  return (
    <tr>
      <td>
        <div className="site-cell">
          <span className="site-avatar">{siteName.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{siteName}</strong>
            <small>
              {audit.businessType} · Job {audit.jobId}
            </small>
          </div>
        </div>
      </td>
      <td>
        <span className="location-cell">
          {audit.city}, {audit.state}
        </span>
      </td>
      <td>
        <AuditStatusBadge state={audit.status} showIndicator />
        {isActive && (
          <div className="table-progress">
            <Progress value={audit.progress ?? 0} />
            <small>{audit.progress ?? 0}%</small>
          </div>
        )}
      </td>
      <td>
        {audit.overallScore === null ? (
          <span className="muted-dash">—</span>
        ) : (
          <span className="score-cell">
            <b>{audit.overallScore}</b>
            <small>/100</small>
          </span>
        )}
      </td>
      <td>
        <span className="date-cell">{dateLabel(audit.createdAt)}</span>
      </td>
      <td>
        <Button
          variant="ghost"
          size="icon-sm"
          className="row-action"
          aria-label={`View audit ${audit.jobId}`}
          onClick={() => onSelect(audit)}
        >
          <Icon name="arrow" />
        </Button>
      </td>
    </tr>
  );
}

function AuditTableBody({
  audits,
  allAuditCount,
  loading,
  onSelect,
}: {
  audits: AuditRow[];
  allAuditCount: number;
  loading: boolean;
  onSelect: (audit: AuditRow) => void;
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="table-empty">
            <span className="spinner spinner-dark" />
            Loading audits...
          </div>
        </td>
      </tr>
    );
  }

  if (audits.length === 0) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="table-empty">
            <span className="empty-icon">
              <Icon name="search" />
            </span>
            <strong>
              {allAuditCount ? "No matching audits" : "No audit jobs yet"}
            </strong>
            <span>
              {allAuditCount
                ? "Try changing your search or filter."
                : "Use New audit to queue the first job."}
            </span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {audits.map((audit) => (
        <AuditTableRow key={audit.jobId} audit={audit} onSelect={onSelect} />
      ))}
    </>
  );
}

function AuditTablePagination({
  total,
  page,
  onPageChange,
}: {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_AUDIT_PAGE_SIZE));
  const firstVisible =
    total === 0 ? 0 : (page - 1) * ADMIN_AUDIT_PAGE_SIZE + 1;
  const lastVisible = Math.min(page * ADMIN_AUDIT_PAGE_SIZE, total);
  const visiblePages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages]),
  )
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((left, right) => left - right);

  if (total === 0) return null;

  return (
    <div className="table-pagination">
      <span>
        Showing {firstVisible}–{lastVisible} of {total} jobs
      </span>
      <Pagination className="table-pagination-controls">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#audit-jobs"
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={(event) => {
                event.preventDefault();
                onPageChange(Math.max(1, page - 1));
              }}
            />
          </PaginationItem>
          {visiblePages.map((pageNumber, index) => (
            <Fragment key={pageNumber}>
              {index > 0 && pageNumber - visiblePages[index - 1] > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#audit-jobs"
                  isActive={pageNumber === page}
                  aria-label={`Go to page ${pageNumber}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            </Fragment>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#audit-jobs"
              aria-disabled={page === totalPages}
              tabIndex={page === totalPages ? -1 : undefined}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
              onClick={(event) => {
                event.preventDefault();
                onPageChange(Math.min(totalPages, page + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function AdminAuditTable({
  audits,
  allAuditCount,
  loading,
  error,
  search,
  filter,
  page,
  failedCount,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onRetry,
  onSelect,
}: {
  audits: AuditRow[];
  allAuditCount: number;
  loading: boolean;
  error: string;
  search: string;
  filter: string;
  page: number;
  failedCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSelect: (audit: AuditRow) => void;
}) {
  const paginatedAudits = audits.slice(
    (page - 1) * ADMIN_AUDIT_PAGE_SIZE,
    page * ADMIN_AUDIT_PAGE_SIZE,
  );

  return (
    <Card
      className="admin-table-card m-0 rounded-[14px] border-[#e7ede9] bg-white px-6 pb-4 pt-[22px] shadow-[0_4px_15px_#293e3209] max-[560px]:px-3 max-[560px]:pb-3 max-[560px]:pt-4"
      id="audit-jobs"
      role="region"
      aria-label="Audit jobs"
    >
      <div className="table-card-heading">
        <div>
          <p className="eyebrow">PIPELINE ACTIVITY</p>
          <h2>Audit jobs</h2>
          <p>Review the latest work across your client portfolio.</p>
        </div>
        <span className="table-total">
          {audits.length} {audits.length === 1 ? "job" : "jobs"}
        </span>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          <Icon name="alert" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-[7px] px-2 py-[7px] text-[11px] font-bold text-[#36876b]"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      )}
      <AuditTableToolbar
        search={search}
        filter={filter}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />
      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>WEBSITE / BUSINESS</th>
              <th>LOCATION</th>
              <th>STATUS / PROGRESS</th>
              <th>SEO SCORE</th>
              <th>SUBMITTED</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <AuditTableBody
              audits={paginatedAudits}
              allAuditCount={allAuditCount}
              loading={loading}
              onSelect={onSelect}
            />
          </tbody>
        </table>
      </div>
      {!loading && (
        <AuditTablePagination
          total={audits.length}
          page={page}
          onPageChange={onPageChange}
        />
      )}
      <div className="table-footnote">
        <span>
          <span className="live-dot" /> Supabase data
        </span>
        <span>Queue state is refreshed automatically</span>
        {failedCount > 0 && (
          <span className="failed-count">
            <Icon name="alert" />
            {failedCount} failed job{failedCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </Card>
  );
}
