import { CheckCircle2, Cloud, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { DocsSectionHeading } from "./docs-section-heading";

export function DocsDataSourcesSection() {
  return (
    <section id="data-sources" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="DATA TRANSPARENCY"
        title="Live crawl, sample provider signals"
        description="Reports clearly demarcate actual extracted site signals from mock external provider data."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="border-slate-200/90 transition-all hover:border-emerald-300 hover:shadow-md">
          <CardHeader className="space-y-3 pb-3">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-emerald-50 text-[10px] font-bold text-emerald-800">
                LIVE DATA
              </Badge>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Live website crawl
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-600">
              The crawler fetches the submitted HTML to evaluate meta tags, headings, image alt
              text, canonical links, structured JSON-LD schema, and robots.txt.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 transition-all hover:border-sky-300 hover:shadow-md">
          <CardHeader className="space-y-3 pb-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-800">
              <Cloud className="size-5" />
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-sky-50 text-[10px] font-bold text-sky-800">
                SAMPLE INTEGRATIONS
              </Badge>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Sample provider data
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-600">
              PageSpeed Insights, Google Search Console, and SERP keyword ranks currently use
              calibrated mock data to demonstrate full report capability.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 transition-all hover:border-purple-300 hover:shadow-md">
          <CardHeader className="space-y-3 pb-3">
            <div className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-800">
              <FileText className="size-5" />
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-purple-50 text-[10px] font-bold text-purple-800">
                AI & COMPILED PDF
              </Badge>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Analysis and PDF
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-600">
              Synthesizes technical findings via NVIDIA Nemotron AI. The worker automatically
              compiles a PDF report ready for one-click client download.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

