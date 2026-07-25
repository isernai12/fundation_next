import { FinancialService } from './src/services/finance';
import { prisma } from './src/lib/prisma';

async function main() {
  const groups = await prisma.group.findMany();
  for (const group of groups) {
    const summary = await FinancialService.getGroupFundSummary(group.id);
    if (summary && summary.totalFund > 0) {
      console.log(`Group: ${group.name} (${group.id})`);
      console.log(summary);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
