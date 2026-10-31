import { AppShell } from "./app-shell";
import {
  DocsHero,
  DocsToc,
  DocsWorkflowSection,
  DocsDashboardsSection,
  DocsModulesSection,
  DocsApiSection,
  DocsSetupSection,
  DocsDataSourcesSection,
  DocsFaqSection,
} from "./widgets/docs";

export function ProjectDocs() {
  return (
    <AppShell
      eyebrow="PROJECT GUIDE"
      title="How the audit workspace works"
      description="A practical guide to the dashboards, audit workflow, project modules, and local setup."
    >
      <div className="flex flex-col gap-10">
        <DocsHero />
        <DocsToc />
        <DocsWorkflowSection />
        <DocsDashboardsSection />
        <DocsModulesSection />
        <DocsApiSection />
        <DocsSetupSection />
        <DocsDataSourcesSection />
        <DocsFaqSection />
      </div>
    </AppShell>
  );
}
