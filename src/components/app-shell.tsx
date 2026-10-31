"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icons";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger, useSidebar,
} from "./ui/sidebar";
import Image from "next/image";

const links = [
  { href: "/admin", label: "Admin portal", icon: "grid" as const },
  { href: "/", label: "Client dashboard", icon: "globe" as const },
  { href: "/docs", label: "Project guide", icon: "file" as const },
];

function AppNavigation({ pathname }: { pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setOpenMobile(false);
    }
  }, [pathname, setOpenMobile]);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname.startsWith("/admin")
                  : link.href === "/docs"
                    ? pathname.startsWith("/docs")
                    : pathname === "/";

              return (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={{
                      children: link.label,
                      className: "bg-slate-900 text-white",
                    }}
                    className="hover:bg-emerald-50 hover:text-emerald-800 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-800"
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon name={link.icon} />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export function AppShell({
  children,
  eyebrow,
  title,
  description,
  action,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider className="min-h-screen bg-[var(--paper)]">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            className="flex h-10 items-center gap-3 overflow-hidden rounded-md px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            href="/"
            aria-label="Crawlix home"
          >
            {/* <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 group-data-[collapsible=icon]:hidden">
              <Icon name="chart" />
            </span> */}
            <Image
              src="/favicon.ico"
              alt="Crawlix"
              width={120}
              height={40}
              className="h-10 w-[120px] shrink-0 object-contain object-left group-data-[collapsible=icon]:hidden"
            />
          </Link>
        </SidebarHeader>

        <AppNavigation pathname={pathname} />

        <SidebarFooter className="gap-0 px-3">
          <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-white p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
            <span className="live-dot" />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <strong className="block text-xs font-semibold text-slate-800">
                Audit workflow
              </strong>
              <small className="mt-1 block text-[10px] text-slate-500">
                BullMQ · Redis
              </small>
            </div>
          </div>
          <SidebarSeparator className="my-3 mx-0 w-full" />
          <div className="flex min-w-0 items-center gap-2 px-1 py-1">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800">
              S
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <strong className="block truncate text-xs font-semibold text-slate-800">
                Crawlix workspace
              </strong>
              <small className="mt-1 block text-[10px] text-slate-500">
                Assessment demo
              </small>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-screen bg-[var(--paper)]">
        <header className="topbar">
          <div className="topbar-left">
            <SidebarTrigger
              className="text-[#015c21]"
              title="Toggle sidebar"
            />
            <div className="breadcrumbs">
              <span>Workspace</span>
              <span className="crumb-slash">/</span>
              <strong>
                {pathname.startsWith("/admin")
                  ? "Admin portal"
                  : pathname.startsWith("/docs")
                    ? "Project guide"
                    : "Client dashboard"}
              </strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="environment-pill">
              <span className="live-dot" /> AUDIT WORKSPACE
            </span>
            <div className="top-avatar" aria-label="Crawlix workspace">
              C
            </div>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="page-description">{description}</p>
            </div>
            {action && <div className="page-heading-action">{action}</div>}
          </div>
          {children}
          <footer className="page-footer">
            <span>Crawlix</span>
            <span>SEO intelligence for growing local businesses</span>
            <span>Data sources are labeled live or sample</span>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
