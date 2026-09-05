import "dotenv/config";
import { getProfitAndLoss, getBalanceSheet, getBudgetPerformanceReport } from "../src/services/reportService.js";

async function testReports() {
  console.log("-----------------------------------------");
  console.log("PROFIT AND LOSS REPORT");
  console.log("-----------------------------------------");
  const pl = await getProfitAndLoss();
  console.log(JSON.stringify(pl, null, 2));

  console.log("\n-----------------------------------------");
  console.log("BALANCE SHEET REPORT");
  console.log("-----------------------------------------");
  const bs = await getBalanceSheet();
  console.log(JSON.stringify(bs, null, 2));

  console.log("\n-----------------------------------------");
  console.log("BUDGET PERFORMANCE REPORT");
  console.log("-----------------------------------------");
  const budget = await getBudgetPerformanceReport();
  console.log(JSON.stringify(budget, null, 2));
}

testReports().catch(console.error);
