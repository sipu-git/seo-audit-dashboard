import { ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { workflow } from "@/src/docs-data/workflow";
import { DocsSectionHeading } from "./docs-section-heading";

export function DocsWorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="END-TO-END WORKFLOW"
        title="From website URL to finished report"
        description="Audits run asynchronously through BullMQ and Redis so user interfaces remain fast and responsive."
      />

      <div className="space-y-3">
        {workflow.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={step.number} className="relative">
              <Card className="border-slate-200/90 transition-all hover:border-emerald-300 hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                    <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 font-mono text-xs font-bold text-emerald-800">
                      {step.number}
                    </span>
                    <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                      <StepIcon className="size-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  </div>

                  <p className="flex-1 text-xs leading-relaxed text-slate-600">
                    {step.description}
                  </p>

                  <div className="sm:text-right">
                    <code className="inline-block rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                      {step.detail}
                    </code>
                  </div>
                </CardContent>
              </Card>

              {index < workflow.length - 1 && (
                <div className="my-1 flex justify-center text-slate-300">
                  <ArrowDown className="size-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

