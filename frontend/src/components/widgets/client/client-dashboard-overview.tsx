import { DashboardMetricCard } from "../../dashboard-widgets";
import { Icon } from "../../icons";
import { Card } from "../../ui/card";

export function ClientWelcome() {
  return (
    <Card
      className="client-welcome relative flex min-h-[255px] justify-between overflow-hidden rounded-[18px] border-[#e6efe9] bg-gradient-to-br from-[#effaf4] via-[#f8fbf8] to-[#f2f7fa] px-[37px] py-[30px] max-[780px]:px-[22px] max-[560px]:min-h-[235px]"
      role="region"
      aria-label="Client dashboard introduction"
    >
      <div className="welcome-copy">
        <span className="welcome-kicker">
          <span className="live-dot" /> YOUR GROWTH DESK
        </span>
        <h2>
          Make your next move
          <br />a more informed one.
        </h2>
        <p>
          Get a clear view of your site’s search health, then focus on the
          improvements with the greatest potential impact.
        </p>
        <div className="welcome-points">
          <span>
            <Icon name="check" /> Actionable recommendations
          </span>
          <span>
            <Icon name="check" /> Local SEO signals
          </span>
        </div>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-glow" />
        <div className="art-card art-card-main">
          <span className="art-card-label">SEARCH VISIBILITY</span>
          <div className="art-chart">
            {Array.from({ length: 12 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="art-trend">
            <span>↗</span> Growing signal
          </div>
        </div>
        <div className="art-card art-card-float">
          <span className="art-mini-score">✓</span>
          <div>
            <strong>Ready to improve</strong>
            <small>One clear step at a time</small>
          </div>
        </div>
        <span className="art-star star-one">✦</span>
        <span className="art-star star-two">✧</span>
      </div>
    </Card>
  );
}

export function ClientMetrics({
  total,
  active,
  completed,
}: {
  total: number;
  active: number;
  completed: number;
}) {
  return (
    <div className="metric-grid client-metrics">
      <DashboardMetricCard
        icon="file"
        tone="lilac"
        label="YOUR AUDITS"
        value={total}
        description="Tracked in this browser"
      />
      <DashboardMetricCard
        icon="clock"
        tone="mint"
        label="IN PROGRESS"
        value={active}
        description="Background analysis jobs"
      />
      <DashboardMetricCard
        icon="check"
        tone="blue"
        label="REPORTS READY"
        value={completed}
        description="Completed audit reports"
      />
    </div>
  );
}
