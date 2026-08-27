"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import type { Tokens } from "@/theme/tokens";

export function AntShell({ t, children }: { t: Tokens; children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: t.accent,
          colorText: t.textPrimary,
          colorTextSecondary: t.textSecondary,
          colorBorder: t.border,
          colorBgBase: t.bgPrimary,
          colorBgContainer: t.bgElevated,
          colorLink: t.accent,
          borderRadius: 8,
          fontFamily: "var(--travis-font)",
        },
        components: {
          Tag: {
            defaultBg: t.bgElevated,
            defaultColor: t.textSecondary,
            borderRadiusSM: 999,
          },
          Button: {
            colorLink: t.accent,
            paddingInline: 8,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
