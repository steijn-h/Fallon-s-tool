import Link from "next/link";
import type { ComponentType } from "react";

import { SectionTitle } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsLinkCard({
  href,
  icon: Icon,
  title,
  description,
  trailing,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  trailing?: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-primary/50 hover:bg-accent/40">
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-secondary p-2 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <SectionTitle>{title}</SectionTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {trailing ? <span className="shrink-0 text-xs text-muted-foreground">{trailing} →</span> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
