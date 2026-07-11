import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export const dashboardRange = z.enum(["7d", "30d", "90d"]);
export type DashboardRange = z.infer<typeof dashboardRange>;

export const dashboardSummarySchema = z.object({
  revenue: z.object({
    total: z.number(),
    last30Days: z.number(),
    previous30Days: z.number(),
    trendPercent: z.number().nullable(),
  }),
  inventory: z.object({
    lowStockCount: z.number(),
    topProducts: z.array(
      z.object({ resourceId: z.string(), name: z.string(), unitsSold: z.number() }),
    ),
  }),
  recentInvoices: z.array(
    z.object({
      invoiceId: z.string(),
      invoiceNumber: z.string(),
      customerName: z.string().nullable(),
      totalAmount: z.number(),
      status: z.string(),
      createdAt: z.string(),
    }),
  ),
  dailyRevenue: z.array(z.object({ date: z.string(), amount: z.number() })),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export async function getDashboardSummary(range: DashboardRange): Promise<DashboardSummary> {
  return dashboardSummarySchema.parse(
    await apiFetch("/dashboard/summary", { query: { range } }),
  );
}
