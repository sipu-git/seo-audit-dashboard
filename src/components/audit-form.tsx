"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "./icons";
import type { AuditInput } from "./audit-types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

export function AuditForm({ onQueued, compact = false }: {
  onQueued: (jobId: string, input: AuditInput) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<AuditInput>({
    defaultValues: { url: "", businessType: "Dental clinic", city: "Pune", state: "Maharashtra" },
  });

  async function submit(values: AuditInput) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "We could not queue this audit.");
      onQueued(String(payload.jobId), values);
      form.setValue("url", "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Form {...form}>
      <form className={`audit-form ${compact ? "audit-form-compact" : ""}`} onSubmit={form.handleSubmit(submit)}>
        <Card
          className={`audit-form-card flex h-full flex-col justify-between rounded-[14px] border-[#e7ede9] bg-white p-6 shadow-[0_4px_15px_#293e3209] ${
            compact
              ? "h-auto border-0 bg-transparent p-0 shadow-none"
              : "max-[560px]:p-4"
          }`}
        >
          <div className="form-intro"><span className="form-icon"><Icon name="globe" /></span><div><h3>{compact ? "Queue a new audit" : "Start with a website"}</h3><p>{compact ? "Add a site to the analysis queue." : "We’ll crawl the site, analyze its SEO signals, and prepare a prioritized report."}</p></div></div>
          <FormField control={form.control} name="url" rules={{ required: "Enter a website URL.", pattern: { value: /^https?:\/\/.+\..+/, message: "Enter a full URL, including https://." } }} render={({ field }) => (
            <FormItem className="form-field"><FormLabel className="field-label">Website URL</FormLabel><div className="url-input-wrap"><Icon name="globe" /><FormControl><Input className="h-11 pl-10 pr-3.5 text-[13px] font-medium placeholder:text-[13px] placeholder:text-[#98a79f]" type="url" placeholder="https://yourwebsite.com" {...field} /></FormControl></div><FormMessage /></FormItem>
          )} />
          <div className="form-grid">
            <FormField control={form.control} name="businessType" rules={{ required: "Enter the business type." }} render={({ field }) => <FormItem className="form-field"><FormLabel className="field-label">Business type</FormLabel><FormControl><Input className="text-[12.5px] font-medium placeholder:text-xs placeholder:text-[#98a79f]" placeholder="e.g. Dental clinic" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="city" rules={{ required: "Enter the city." }} render={({ field }) => <FormItem className="form-field"><FormLabel className="field-label">City</FormLabel><FormControl><Input className="text-[12.5px] font-medium placeholder:text-xs placeholder:text-[#98a79f]" placeholder="e.g. Pune" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="state" rules={{ required: "Enter the state." }} render={({ field }) => <FormItem className="form-field"><FormLabel className="field-label">State</FormLabel><FormControl><Input className="text-[12.5px] font-medium placeholder:text-xs placeholder:text-[#98a79f]" placeholder="e.g. Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>} />
          </div>
          {error && <div className="form-error" role="alert"><Icon name="alert" />{error}</div>}
          <Button className="form-submit mt-[15px] h-10 w-full rounded-[9px] px-[15px] text-xs font-bold shadow-[0_5px_12px_#118d681f] transition-transform hover:-translate-y-px" type="submit" disabled={busy}>
            {busy ? <><span className="spinner" /> Adding to queue…</> : <><Icon name="spark" /> Run SEO audit <Icon name="arrow" /> </>}
          </Button>
          {!compact && <p className="form-footnote"><Icon name="clock" /> Audits run in the background. You can keep working while we prepare your report.</p>}
        </Card>
      </form>
    </Form>
  );
}
