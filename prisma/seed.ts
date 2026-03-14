import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sparkdeal.app" },
    update: {},
    create: {
      email: "admin@sparkdeal.app",
      name: "Admin",
      passwordHash: adminHash,
      role: "admin",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create a demo contributor
  const contribHash = await bcrypt.hash("demo123", 10);
  const contributor = await prisma.user.upsert({
    where: { email: "contributor@demo.com" },
    update: {},
    create: {
      email: "contributor@demo.com",
      name: "Alice (Demo Contributor)",
      passwordHash: contribHash,
      role: "contributor",
    },
  });
  console.log("Demo contributor created:", contributor.email);

  // Create a demo company
  const companyHash = await bcrypt.hash("demo123", 10);
  const company = await prisma.user.upsert({
    where: { email: "company@demo.com" },
    update: {},
    create: {
      email: "company@demo.com",
      name: "Acme Corp",
      passwordHash: companyHash,
      role: "company",
    },
  });
  console.log("Demo company created:", company.email);

  // Create sample opportunities
  const opps = [
    {
      title: "Reduce cloud hosting costs by 40% with reserved instances",
      brief:
        "Most companies overspend on cloud by using on-demand pricing. A simple switch to reserved instances and right-sizing can save 30–50% annually.",
      category: "technology",
      stage1Price: 250,
      validationChecklist:
        "- Monthly cloud spend exceeds €5,000\n- Using AWS, Azure, or GCP\n- Have at least 5 persistent workloads\n- No existing reserved instance commitments",
      requirements:
        "Access to cloud billing dashboard. Ability to modify instance types. Approval for 1-year commitment.",
      highLevelApproach:
        "1. Audit current usage patterns\n2. Identify right-sizing opportunities\n3. Calculate reserved instance savings\n4. Implement in stages, starting with most predictable workloads",
      fullPlaybook:
        "Step 1: Export the last 90 days of usage data from your cloud provider...\nStep 2: Use the AWS Cost Explorer / Azure Advisor to identify underutilized instances...\nStep 3: For each instance family, calculate the break-even point for reserved pricing...\n[Full detailed playbook continues...]",
      templates: "- Cloud audit spreadsheet template\n- ROI calculator\n- Implementation checklist",
      stage2Price: 1500,
      savingsEstimateLow: 15000,
      savingsEstimateHigh: 50000,
      confidenceScore: 80,
    },
    {
      title: "Cut procurement costs by renegotiating SaaS contracts",
      brief:
        "Most businesses accept SaaS renewal quotes without negotiation. Systematic renegotiation across your SaaS stack can yield 15–30% savings.",
      category: "procurement",
      stage1Price: 500,
      validationChecklist:
        "- Annual SaaS spend exceeds €50,000\n- More than 10 active SaaS subscriptions\n- At least 3 contracts renewing within 6 months",
      requirements:
        "List of current SaaS vendors and contract values. Authority to negotiate or access to procurement team.",
      highLevelApproach:
        "1. Inventory all SaaS contracts with renewal dates and spend\n2. Benchmark prices against market rates\n3. Prepare negotiation strategies per vendor\n4. Execute negotiations 60–90 days before renewal",
      fullPlaybook:
        "Step 1: Create a complete SaaS inventory using finance records and SSO logs...\nStep 2: Score each vendor on replaceability, usage, and contract flexibility...\n[Full detailed playbook continues...]",
      templates: "- SaaS inventory template\n- Negotiation playbook\n- Vendor comparison matrix",
      stage2Price: 2500,
      savingsEstimateLow: 25000,
      savingsEstimateHigh: 100000,
      confidenceScore: 85,
    },
    {
      title: "Energy cost reduction through smart building controls",
      brief:
        "Installing smart thermostats and automated lighting in office spaces typically reduces energy bills by 20–35%.",
      category: "energy",
      stage1Price: 250,
      validationChecklist:
        "- Office space larger than 200 sqm\n- Monthly energy bill exceeds €1,000\n- Building has central HVAC system",
      requirements:
        "Building access for sensor installation. Budget for smart thermostat hardware (€2,000–€5,000).",
      highLevelApproach:
        "1. Baseline current energy consumption\n2. Identify quick wins (scheduling, setpoints)\n3. Install smart controls\n4. Monitor and optimize over 3 months",
      fullPlaybook: "",
      templates: "",
      stage2Price: 0,
      savingsEstimateLow: 5000,
      savingsEstimateHigh: 15000,
      confidenceScore: 70,
    },
  ];

  for (const opp of opps) {
    await prisma.opportunity.create({
      data: {
        ...opp,
        contributorId: contributor.id,
        status: "published",
      },
    });
  }
  console.log(`Created ${opps.length} sample opportunities`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
