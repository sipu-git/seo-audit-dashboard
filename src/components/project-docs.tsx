import Link from "next/link";
import {
  ArrowDown, ArrowRight, BookOpen, CheckCircle2,
  CircleHelp, Cloud, Code2, Database, FileText, Gauge, Layers3, ListChecks, Play,
  Server, ShieldCheck, Workflow
} from "lucide-react";
import { AppShell } from "./app-shell";
import { workflow } from "../docs-data/workflow";
import { areas } from "../docs-data/area";
import { components } from "../docs-data/components";
import { endpoints } from "../docs-data/endpoints";
import { environmentGroups } from "../docs-data/endpointsGroup";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="docs-section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function ProjectDocs() {
  return (
    <AppShell
      eyebrow="PROJECT GUIDE"
      title="How the audit workspace works"
      description="A practical guide to the dashboards, audit workflow, project modules, and local setup."
    >
      <section className="docs-intro">
        <div className="docs-intro-icon">
          <BookOpen aria-hidden="true" />
        </div>
        <div>
          <h2>Start here</h2>
          <p>
            This workspace accepts a business website, analyzes its on-page SEO
            signals in the background, and presents progress and a downloadable
            report. Use this guide to understand who does what and where each
            step happens.
          </p>
          <div className="docs-intro-links">
            <Link href="/">Open the client dashboard <ArrowRight aria-hidden="true" /></Link>
            <Link href="/admin">Open the admin portal <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <nav className="docs-toc" aria-label="On this page">
        <span>On this page</span>
        <a href="#workflow">Workflow</a>
        <a href="#dashboards">Dashboards</a>
        <a href="#modules">Project modules</a>
        <a href="#api">API reference</a>
        <a href="#setup">Run locally</a>
        <a href="#faq">FAQ</a>
      </nav>

      <section className="docs-section" id="workflow">
        <SectionHeading
          eyebrow="END-TO-END"
          title="From website URL to finished report"
          description="Audits run in a worker so the browser can stay responsive while the analysis is in progress."
        />
        <ol className="docs-workflow">
          {workflow.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <li className="docs-workflow-step" key={step.number}>
                <span className="docs-step-number">{step.number}</span>
                <div className="docs-step-icon">
                  <StepIcon aria-hidden="true" />
                </div>
                <div className="docs-step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <code>{step.detail}</code>
                </div>
                {index < workflow.length - 1 && (
                  <ArrowDown className="docs-step-arrow" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="docs-section" id="dashboards">
        <SectionHeading
          eyebrow="PRODUCT AREAS"
          title="Choose the view that fits your task"
          description="Both dashboards use the same audit queue, but their history and controls are intended for different users."
        />
        <div className="docs-area-grid">
          {areas.map((area) => {
            const AreaIcon = area.icon;
            return (
              <article className="docs-area-card" key={area.href}>
                <span className="docs-card-icon">
                  <AreaIcon aria-hidden="true" />
                </span>
                <span className="docs-card-audience">{area.audience}</span>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <Link href={area.href}>
                  Visit {area.title} <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
        <div className="docs-callout">
          <CircleHelp aria-hidden="true" />
          <p>
            <strong>Where is client history stored?</strong> The client dashboard
            keeps its list in local browser storage. The admin portal reads
            persisted records from PostgreSQL, so clearing browser data affects
            the client’s list but does not delete the server record.
          </p>
        </div>
      </section>

      <section className="docs-section" id="modules">
        <SectionHeading
          eyebrow="CODE MAP"
          title="What each project area is responsible for"
          description="Use this map to find the right part of the code when investigating a feature or issue."
        />
        <div className="docs-module-list">
          {components.map((component) => (
            <article className="docs-module-row" key={component.area}>
              <div>
                <h3>{component.area}</h3>
                <code>{component.paths}</code>
              </div>
              <p>{component.responsibility}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-section" id="api">
        <SectionHeading
          eyebrow="INTEGRATION POINTS"
          title="API endpoints"
          description="The browser calls these endpoints; the worker handles the longer-running part of an audit."
        />
        <div className="docs-endpoint-list">
          {endpoints.map((endpoint) => (
            <article className="docs-endpoint" key={`${endpoint.method}-${endpoint.path}`}>
              <span className={`docs-method docs-method-${endpoint.method.toLowerCase()}`}>
                {endpoint.method}
              </span>
              <code>{endpoint.path}</code>
              <p>{endpoint.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-section" id="setup">
        <SectionHeading
          eyebrow="DEVELOPMENT"
          title="Run the workspace locally"
          description="The web app and the audit worker are separate processes. Start both to process queued jobs."
        />
        <div className="docs-setup-grid">
          <article className="docs-setup-card">
            <div className="docs-setup-title">
              <Code2 aria-hidden="true" />
              <h3>1. Install and prepare</h3>
            </div>
            <pre><code>{`npm install\nnpx prisma generate\nnpx prisma migrate deploy`}</code></pre>
            <p>
              Configure the required environment variables before starting the
              services. Use your project’s migration workflow if developing a
              new schema change.
            </p>
          </article>
          <article className="docs-setup-card">
            <div className="docs-setup-title">
              <Server aria-hidden="true" />
              <h3>2. Start the web app</h3>
            </div>
            <pre><code>npm run dev</code></pre>
            <p>Open the local Next.js URL, then choose the client or admin view.</p>
          </article>
          <article className="docs-setup-card">
            <div className="docs-setup-title">
              <Workflow aria-hidden="true" />
              <h3>3. Start the worker</h3>
            </div>
            <pre><code>npm run worker</code></pre>
            <p>
              The worker consumes Redis jobs, runs the analysis, saves results,
              and generates the PDF.
            </p>
          </article>
        </div>

        <div className="docs-env">
          <div className="docs-env-heading">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h3>Environment variables</h3>
              <p>
                Set secrets in the server/worker environment (for local
                development, use an ignored .env.local file). Never put
                credentials in browser code or commit them.
              </p>
            </div>
          </div>
          {environmentGroups.map((group) => (
            <div className="docs-env-group" key={group.title}>
              <h4>{group.title}</h4>
              <dl>
                {group.values.map(([name, description]) => (
                  <div key={name}>
                    <dt><code>{name}</code></dt>
                    <dd>{description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-section" id="data-sources">
        <SectionHeading
          eyebrow="DATA TRANSPARENCY"
          title="Live crawl, sample provider signals"
          description="Each report labels its sources so the reader can tell what came from the submitted website and what is illustrative."
        />
        <div className="docs-source-grid">
          <article>
            <CheckCircle2 aria-hidden="true" />
            <h3>Live website crawl</h3>
            <p>
              The crawler fetches the submitted HTML and inspects metadata,
              headings, links, images without alt text, canonical URL, JSON-LD,
              robots rules, and sitemap references.
            </p>
          </article>
          <article>
            <Cloud aria-hidden="true" />
            <h3>Sample provider data</h3>
            <p>
              PageSpeed, Search Console, and keyword ranking integrations
              currently use sample data. They are not live customer-provider
              connections yet.
            </p>
          </article>
          <article>
            <FileText aria-hidden="true" />
            <h3>Analysis and PDF</h3>
            <p>
              The analysis uses the configured NVIDIA Nemotron API. The worker
              builds a PDF and stores it locally for development or in private
              S3 when configured.
            </p>
          </article>
        </div>
      </section>

      <section className="docs-section" id="faq">
        <SectionHeading
          eyebrow="QUICK HELP"
          title="Common questions"
          description="A few checks solve most development-time workflow questions."
        />
        <div className="docs-faq-list">
          <details>
            <summary>Why is an audit staying queued?</summary>
            <p>
              Confirm Redis is reachable and the worker process is running with
              <code> npm run worker</code>. The web app enqueues jobs; it does not
              execute them itself.
            </p>
          </details>
          <details>
            <summary>Why did an audit fail?</summary>
            <p>
              Open the job details for its error. Check that the submitted site
              responds with HTML, database and Redis connections are available,
              and the server-side NVIDIA key is configured.
            </p>
          </details>
          <details>
            <summary>Why is the PDF download unavailable?</summary>
            <p>
              Downloads are available after the worker finishes and stores the
              report. Verify the configured local/S3 storage and the worker
              logs.
            </p>
          </details>
          <details>
            <summary>Are audit checks continuously hitting the server?</summary>
            <p>
              TanStack Query polls only active work, reuses cached responses,
              and pauses interval polling in background tabs. Completed and
              failed jobs stop polling.
            </p>
          </details>
        </div>
      </section>

      <section className="docs-next-steps">
        <ListChecks aria-hidden="true" />
        <div>
          <h2>Ready to try the workflow?</h2>
          <p>Start with a client audit, then inspect its progress in the admin portal.</p>
        </div>
        <Link href="/">Start an audit <ArrowRight aria-hidden="true" /></Link>
      </section>
    </AppShell>
  );
}
