import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── Users ────────────────────────────────────────────────
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
  console.log("Admin user:", admin.email);

  const contribHash = await bcrypt.hash("demo123", 10);

  const contributor1 = await prisma.user.upsert({
    where: { email: "sarah@demo.sparkdeal.app" },
    update: {},
    create: {
      email: "sarah@demo.sparkdeal.app",
      name: "Sarah M. (Sample Contributor)",
      passwordHash: contribHash,
      role: "contributor",
    },
  });

  const contributor2 = await prisma.user.upsert({
    where: { email: "james@demo.sparkdeal.app" },
    update: {},
    create: {
      email: "james@demo.sparkdeal.app",
      name: "James K. (Sample Contributor)",
      passwordHash: contribHash,
      role: "contributor",
    },
  });

  const contributor3 = await prisma.user.upsert({
    where: { email: "maria@demo.sparkdeal.app" },
    update: {},
    create: {
      email: "maria@demo.sparkdeal.app",
      name: "Maria L. (Sample Contributor)",
      passwordHash: contribHash,
      role: "contributor",
    },
  });

  console.log("Sample contributors created");

  const companyHash = await bcrypt.hash("demo123", 10);
  const company = await prisma.user.upsert({
    where: { email: "company@demo.sparkdeal.app" },
    update: {},
    create: {
      email: "company@demo.sparkdeal.app",
      name: "Acme Corp",
      passwordHash: companyHash,
      role: "company",
      companyName: "Acme Corp",
    },
  });
  console.log("Demo company:", company.email);

  // ─── Sample Opportunities ─────────────────────────────────
  // Each one is marked [SAMPLE] so companies know these are examples

  const opps = [
    // ── TECHNOLOGY ──────────────────────────────────────────
    {
      contributorId: contributor1.id,
      title: "[SAMPLE] Reduce AWS Costs by 40% with Reserved Instances and Savings Plans",
      brief:
        "Most mid-size companies run production workloads on on-demand EC2 pricing, overpaying by 30-50%. This strategy walks you through analysing your usage patterns, selecting the right mix of Reserved Instances and Savings Plans, and right-sizing instances — typically delivering €15K-50K/year in savings for a 50-server footprint.",
      company: "SaaS Companies",
      category: "technology",
      stage1Price: 250,
      validationChecklist:
        "- Monthly AWS bill exceeds €5,000\n- Running at least 10 persistent EC2 instances\n- No existing Reserved Instance or Savings Plan commitments\n- Workloads have been stable for 3+ months\n- Team has access to AWS Cost Explorer and Billing Console",
      requirements:
        "1. AWS account with Cost Explorer enabled (free to activate)\n2. Read access to EC2 and billing dashboards\n3. Ability to modify instance types during a maintenance window\n4. Budget authority to approve 1-year RI commitments\n5. ~4 hours of engineering time for implementation",
      highLevelApproach:
        "1. Export 90 days of EC2 usage data from Cost Explorer\n2. Identify instances running >70% of the time (candidates for RIs)\n3. Right-size over-provisioned instances using CloudWatch CPU/memory metrics\n4. Calculate ROI for 1-year No Upfront RIs vs Savings Plans\n5. Implement in phases: non-production first, then production\n6. Set up monthly review dashboards to prevent drift",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nThis is a demonstration opportunity. In a real listing, this section would contain:\n\n- Detailed step-by-step implementation guide\n- Exact AWS CLI commands for right-sizing analysis\n- Spreadsheet formulas for ROI calculations\n- Common pitfalls and how to avoid them\n- Real-world case studies with anonymised figures\n- 90-day implementation timeline\n- Rollback procedures if savings targets aren't met",
      templates:
        "[SAMPLE CONTENT]\n\n- AWS Cost Audit Spreadsheet (Excel)\n- Reserved Instance vs Savings Plan Decision Matrix\n- Implementation Checklist (Notion template)\n- Monthly Savings Tracking Dashboard (CloudWatch setup)\n- Executive Summary Template for budget approval",
      stage2Price: 1500,
      savingsEstimateLow: 15000,
      savingsEstimateHigh: 50000,
      confidenceScore: 88,
    },
    {
      contributorId: contributor2.id,
      title: "[SAMPLE] Eliminate Redundant SaaS Licences — Save 20-35% on Your Software Stack",
      brief:
        "The average company has 3-4 overlapping tools doing the same job, plus 15-25% of licences assigned to inactive users. This audit framework identifies waste, consolidates tools, and renegotiates contracts at renewal — saving €20K-80K/year for companies spending €100K+ on SaaS.",
      company: "Mid-Size Companies",
      category: "procurement",
      stage1Price: 500,
      validationChecklist:
        "- Annual SaaS spend exceeds €80,000\n- More than 15 active SaaS subscriptions\n- No SaaS management tool currently in use\n- At least 3 contracts renewing in the next 6 months\n- IT or finance team available to support the audit",
      requirements:
        "1. Access to company credit card and finance records\n2. SSO/IdP admin access to pull user activity logs\n3. Authority to cancel or consolidate subscriptions\n4. Procurement team involvement for vendor negotiations\n5. ~2 weeks for full audit cycle",
      highLevelApproach:
        "1. Build complete SaaS inventory from finance records, SSO logs, and expense reports\n2. Map tools by function to identify overlaps (e.g., 3 project management tools)\n3. Pull last-login data to flag inactive licences (no login in 60+ days)\n4. Score each tool on replaceability, user satisfaction, and contract flexibility\n5. Negotiate renewals 90 days before expiry with competitive quotes in hand",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nIn a real listing, this section would contain the complete SaaS audit methodology including:\n\n- Data collection scripts for major SSO providers (Okta, Azure AD, Google Workspace)\n- Vendor negotiation email templates that have achieved 15-30% discounts\n- Consolidation decision framework\n- Change management plan for tool migrations\n- Contract clause red flags to watch for",
      templates:
        "[SAMPLE CONTENT]\n\n- SaaS Inventory Master Spreadsheet\n- Vendor Negotiation Playbook (12 proven tactics)\n- Licence Usage Audit Template\n- Tool Consolidation Decision Matrix\n- Renewal Calendar with Alert Setup Guide",
      stage2Price: 2500,
      savingsEstimateLow: 20000,
      savingsEstimateHigh: 80000,
      confidenceScore: 85,
    },

    // ── ENERGY ──────────────────────────────────────────────
    {
      contributorId: contributor3.id,
      title: "[SAMPLE] Cut Office Energy Bills by 30% with Smart HVAC Scheduling",
      brief:
        "Most offices heat and cool spaces 24/7, including nights and weekends when nobody is there. Implementing occupancy-based HVAC scheduling with smart thermostats costs €2-5K upfront but saves €8-20K/year on energy bills for a typical 500 sqm office.",
      company: "Office-Based Companies",
      category: "energy",
      stage1Price: 250,
      validationChecklist:
        "- Office space of 200+ sqm with central HVAC\n- Monthly energy bill exceeds €1,500\n- Building allows thermostat modifications\n- HVAC system is less than 15 years old\n- Occupancy varies significantly (nights, weekends, holidays)",
      requirements:
        "1. Access to 12 months of energy bills for baseline\n2. Building floor plan with HVAC zone layout\n3. Landlord permission for smart thermostat installation\n4. Budget of €2,000-5,000 for hardware\n5. Facilities team or building manager involvement",
      highLevelApproach:
        "1. Baseline current energy consumption (12-month trend analysis)\n2. Map HVAC zones against actual occupancy patterns\n3. Install smart thermostats with occupancy sensors in each zone\n4. Programme schedules: pre-cool/heat 30 min before arrival, setback 1 hour after last occupant\n5. Monitor for 3 months, fine-tune setpoints based on comfort feedback",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing here would include:\n\n- Specific thermostat model recommendations by HVAC type\n- Zone-by-zone configuration templates\n- Energy monitoring setup guide\n- ROI calculation worksheet with payback period\n- Employee comfort survey template\n- Seasonal adjustment guidelines",
      templates:
        "[SAMPLE CONTENT]\n\n- Energy Baseline Analysis Spreadsheet\n- HVAC Zone Mapping Template\n- Smart Thermostat Configuration Guide\n- Monthly Energy Savings Tracker\n- Comfort Feedback Survey (Google Forms)",
      stage2Price: 800,
      savingsEstimateLow: 8000,
      savingsEstimateHigh: 20000,
      confidenceScore: 78,
    },

    // ── LOGISTICS ───────────────────────────────────────────
    {
      contributorId: contributor1.id,
      title: "[SAMPLE] Reduce Shipping Costs by 25% by Consolidating Carriers and Renegotiating Rates",
      brief:
        "Companies shipping 500+ parcels/month often use a single carrier by default, missing volume discounts and regional rate advantages. This strategy shows how to split shipments across 2-3 carriers based on destination, weight, and speed — reducing shipping spend by 20-30%.",
      company: "E-commerce Companies",
      category: "logistics",
      stage1Price: 500,
      validationChecklist:
        "- Shipping 500+ parcels per month\n- Annual shipping spend exceeds €50,000\n- Currently using 1-2 carriers\n- Mix of domestic and international shipments\n- Shipping data available in structured format (CSV/Excel)",
      requirements:
        "1. Last 6 months of shipping data (origin, destination, weight, cost, carrier)\n2. Current carrier contracts and rate cards\n3. Authority to trial new carriers\n4. ~1 week to run rate comparison analysis\n5. Warehouse team cooperation for split-carrier implementation",
      highLevelApproach:
        "1. Export shipment history and categorise by destination zone, weight bracket, and speed\n2. Request rate quotes from 4-5 carriers for your actual volume profile\n3. Build a routing matrix: assign each lane to the cheapest carrier meeting SLA\n4. Implement multi-carrier shipping via your OMS or a shipping aggregator\n5. Review rates quarterly — carriers frequently adjust zone pricing",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would include:\n\n- Carrier rate comparison methodology\n- Negotiation scripts that leverage competitive quotes\n- Multi-carrier routing setup guide for major platforms (Shopify, WooCommerce)\n- Dimensional weight optimisation tactics\n- Returns logistics cost reduction strategies",
      templates:
        "[SAMPLE CONTENT]\n\n- Shipping Data Analysis Spreadsheet\n- Carrier Rate Comparison Matrix\n- Multi-Carrier Routing Decision Table\n- Quarterly Rate Review Checklist\n- Carrier Negotiation Email Templates",
      stage2Price: 2000,
      savingsEstimateLow: 12000,
      savingsEstimateHigh: 45000,
      confidenceScore: 82,
    },

    // ── OPERATIONS ──────────────────────────────────────────
    {
      contributorId: contributor2.id,
      title: "[SAMPLE] Save 200+ Hours/Year by Automating Invoice Processing with OCR",
      brief:
        "Finance teams processing 300+ invoices/month manually spend 15-20 hours/week on data entry, matching, and approvals. OCR-based automation with tools like Rossum or Klippa can cut processing time by 80% and reduce errors to near-zero.",
      company: "Companies with High Invoice Volume",
      category: "operations",
      stage1Price: 250,
      validationChecklist:
        "- Processing 300+ invoices per month\n- At least 1 FTE dedicated to invoice processing\n- Invoices arrive in mixed formats (PDF, email, paper)\n- Using an ERP or accounting system (SAP, Xero, QuickBooks, etc.)\n- Error rate on manual entry exceeds 2%",
      requirements:
        "1. Sample of 50 invoices in various formats for OCR testing\n2. Access to current accounting/ERP system API documentation\n3. IT support for integration setup (~8 hours)\n4. Budget for OCR tool subscription (€200-500/month depending on volume)\n5. Finance team availability for 2-week parallel run",
      highLevelApproach:
        "1. Audit current invoice workflow: receipt, data entry, matching, approval, payment\n2. Classify invoices by source and format to estimate OCR accuracy\n3. Select OCR tool based on your ERP, volume, and invoice complexity\n4. Configure extraction templates for your top 20 vendors (covers ~80% of volume)\n5. Run in parallel for 2 weeks, validate accuracy, then switch over",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would contain:\n\n- Detailed vendor comparison (Rossum vs Klippa vs Nanonets vs custom)\n- ERP integration guides for SAP, Xero, and QuickBooks\n- OCR template configuration walkthrough\n- Exception handling workflow design\n- ROI model with FTE savings calculation",
      templates:
        "[SAMPLE CONTENT]\n\n- Invoice Processing Time Study Template\n- OCR Tool Evaluation Scorecard\n- Integration Requirements Document\n- Go-Live Checklist\n- Monthly Accuracy & Savings Report Template",
      stage2Price: 1200,
      savingsEstimateLow: 10000,
      savingsEstimateHigh: 35000,
      confidenceScore: 75,
    },

    // ── FINANCE ─────────────────────────────────────────────
    {
      contributorId: contributor3.id,
      title: "[SAMPLE] Recover €10-50K in Overpaid VAT Through Systematic Reclaim Audit",
      brief:
        "Companies operating across multiple EU countries often overpay VAT due to incorrect categorisation, missed deductions, and unclaimed input VAT on travel, entertainment, and cross-border purchases. A structured audit typically recovers 2-5% of total VAT paid.",
      company: "EU Multi-Country Companies",
      category: "finance",
      stage1Price: 500,
      validationChecklist:
        "- Operating in 2+ EU countries\n- Annual VAT payments exceed €200,000\n- No VAT recovery audit in the last 3 years\n- Mix of domestic and cross-border transactions\n- Travel and entertainment expenses exceed €50K/year",
      requirements:
        "1. Access to VAT returns for the last 3 years\n2. Export of purchase ledger with VAT codes\n3. Employee expense reports with receipts\n4. Cross-border transaction records\n5. Tax advisor or CFO involvement for filing amended returns",
      highLevelApproach:
        "1. Extract and categorise all VAT transactions from the last 36 months\n2. Identify common error patterns: wrong VAT rates, missed reverse-charge, unclaimed input VAT\n3. Focus on high-value categories: travel, professional services, cross-border supplies\n4. Calculate total recoverable amount per country and per period\n5. Prepare amended VAT returns or voluntary disclosure filings",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would include:\n\n- Country-by-country VAT reclaim rules and deadlines\n- Common misclassification patterns with correction guides\n- Cross-border VAT recovery (13th Directive) walkthrough\n- Amended return filing templates for major EU jurisdictions\n- Ongoing compliance checklist to prevent future overpayment",
      templates:
        "[SAMPLE CONTENT]\n\n- VAT Transaction Analysis Spreadsheet\n- Error Pattern Classification Guide\n- Recovery Calculation Workbook\n- Amended Return Filing Checklist\n- Ongoing VAT Compliance Calendar",
      stage2Price: 3000,
      savingsEstimateLow: 10000,
      savingsEstimateHigh: 50000,
      confidenceScore: 80,
    },

    // ── HR ──────────────────────────────────────────────────
    {
      contributorId: contributor1.id,
      title: "[SAMPLE] Reduce Employee Turnover Costs by 40% with Structured Onboarding",
      brief:
        "Replacing an employee costs 50-200% of their annual salary. Companies with no structured onboarding lose 20% of new hires within 45 days. This programme reduces early attrition by 40% through a 90-day structured onboarding framework that costs almost nothing to implement.",
      company: "Growing Companies (50-500 employees)",
      category: "hr",
      stage1Price: 250,
      validationChecklist:
        "- 50+ employees\n- Hiring 10+ people per year\n- Early turnover rate (within 6 months) exceeds 15%\n- No formalised onboarding programme beyond day-1 orientation\n- HR team or people ops function exists",
      requirements:
        "1. Access to turnover data (dates, reasons, tenure at exit)\n2. Current onboarding materials (if any)\n3. Cooperation from 3-4 department heads for role-specific content\n4. HR team capacity to manage the rollout (~20 hours)\n5. Internal communication channel (Slack, Teams) for onboarding cohorts",
      highLevelApproach:
        "1. Analyse exit interview data and early turnover patterns by department\n2. Design a 90-day onboarding timeline: Week 1 (orientation), Weeks 2-4 (role ramp-up), Months 2-3 (integration)\n3. Create role-specific checklists with clear 30/60/90-day milestones\n4. Assign onboarding buddies and schedule structured check-ins\n5. Track completion rates and correlate with retention data after 6 months",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would contain:\n\n- Complete 90-day onboarding programme template\n- Role-specific onboarding checklist examples (engineering, sales, ops)\n- Buddy programme guidelines and training materials\n- Check-in meeting agenda templates (week 1, 2, 4, 8, 12)\n- Metrics dashboard for tracking onboarding effectiveness\n- Change management plan for getting manager buy-in",
      templates:
        "[SAMPLE CONTENT]\n\n- 90-Day Onboarding Timeline (Notion/Confluence)\n- New Hire Checklist by Role\n- Buddy Programme Guide\n- Check-In Meeting Templates\n- Onboarding Satisfaction Survey\n- Retention Impact Tracking Spreadsheet",
      stage2Price: 1000,
      savingsEstimateLow: 15000,
      savingsEstimateHigh: 60000,
      confidenceScore: 72,
    },

    // ── MARKETING ───────────────────────────────────────────
    {
      contributorId: contributor2.id,
      title: "[SAMPLE] Cut Google Ads Spend by 30% Without Losing Conversions",
      brief:
        "Most Google Ads accounts waste 25-40% of budget on broad match keywords, poor negative keyword lists, and unoptimised bidding. This audit framework identifies exactly where budget is being wasted and provides a step-by-step optimisation plan — typically saving €1-5K/month for accounts spending €5K+/month.",
      company: "B2B SaaS Companies",
      category: "marketing",
      stage1Price: 250,
      validationChecklist:
        "- Monthly Google Ads spend exceeds €5,000\n- Account has been running for 6+ months\n- No professional audit in the last 12 months\n- Conversion tracking is set up and working\n- Campaign structure has not been overhauled recently",
      requirements:
        "1. Google Ads account access (read-only is sufficient for audit)\n2. Google Analytics linked to Ads account\n3. Last 6 months of search term reports\n4. Current CPA/ROAS targets\n5. ~3 hours from marketing team for context on business priorities",
      highLevelApproach:
        "1. Pull search term reports and identify wasted spend on irrelevant queries\n2. Audit match types: move high-performing broad match to phrase/exact\n3. Build comprehensive negative keyword lists by campaign theme\n4. Review bidding strategy: manual CPC vs Target CPA vs Maximise Conversions\n5. Restructure ad groups to improve Quality Score (aim for 7+ on all keywords)\n6. Set up automated rules to pause underperforming keywords",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would include:\n\n- Complete Google Ads audit checklist (87 points)\n- Negative keyword master list by industry\n- Bidding strategy selection decision tree\n- Quality Score improvement tactics\n- Ad copy A/B testing framework\n- Automated rules setup guide",
      templates:
        "[SAMPLE CONTENT]\n\n- Google Ads Audit Spreadsheet (87-point checklist)\n- Negative Keyword List by Industry\n- Campaign Restructure Plan Template\n- Monthly Optimisation Routine Checklist\n- Reporting Dashboard (Data Studio Template)",
      stage2Price: 1500,
      savingsEstimateLow: 12000,
      savingsEstimateHigh: 60000,
      confidenceScore: 83,
    },

    // ── COMPLIANCE ──────────────────────────────────────────
    {
      contributorId: contributor3.id,
      title: "[SAMPLE] Avoid €50K+ GDPR Fines — Compliance Gap Assessment and Fix Plan",
      brief:
        "60% of SMEs have critical GDPR gaps they don't know about: missing DPAs with processors, incomplete records of processing, no data retention policy. This assessment identifies your gaps and provides a prioritised remediation plan — far cheaper than hiring a €500/hour consultant.",
      company: "EU-Based Companies",
      category: "compliance",
      stage1Price: 500,
      validationChecklist:
        "- Processing personal data of EU residents\n- No Data Protection Officer appointed (or DPO is part-time)\n- Last GDPR audit was 12+ months ago (or never done)\n- Using 10+ third-party tools that process customer data\n- Handling sensitive categories (health, financial, children's data)",
      requirements:
        "1. List of all tools/services processing personal data\n2. Current privacy policy and cookie consent setup\n3. Any existing data processing agreements (DPAs)\n4. Access to data storage and backup documentation\n5. ~10 hours from IT and legal teams over 2-3 weeks",
      highLevelApproach:
        "1. Map all personal data flows: collection, processing, storage, sharing, deletion\n2. Audit third-party processors: verify DPAs are signed and up to date\n3. Review records of processing activities (ROPA) against Article 30 requirements\n4. Assess data subject rights processes: access, deletion, portability\n5. Identify gaps, prioritise by risk (fine exposure), and create remediation timeline",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would include:\n\n- Complete GDPR gap assessment questionnaire (120+ points)\n- Data flow mapping methodology and templates\n- DPA review checklist and template agreements\n- ROPA template pre-filled with common processing activities\n- Cookie consent audit tool and remediation guide\n- Data retention policy generator by data category",
      templates:
        "[SAMPLE CONTENT]\n\n- GDPR Gap Assessment Questionnaire\n- Data Flow Mapping Template (Visio/Miro)\n- Records of Processing Activities (ROPA) Template\n- DPA Review Checklist\n- Data Retention Policy Template\n- DSAR Response Process Flowchart\n- Remediation Priority Matrix",
      stage2Price: 2500,
      savingsEstimateLow: 5000,
      savingsEstimateHigh: 50000,
      confidenceScore: 77,
    },

    // ── TECHNOLOGY (another one for variety) ────────────────
    {
      contributorId: contributor1.id,
      title: "[SAMPLE] Save €30-80K/Year by Migrating from Salesforce to HubSpot CRM",
      brief:
        "Companies paying €50K+/year for Salesforce often use less than 30% of its features. For teams under 200 users, HubSpot CRM offers equivalent functionality at 40-60% lower cost. This guide covers the full migration — data, automations, integrations, and change management.",
      company: "Companies using Salesforce",
      category: "technology",
      stage1Price: 500,
      validationChecklist:
        "- Current Salesforce spend exceeds €50,000/year\n- Fewer than 200 CRM users\n- Not heavily using Salesforce CPQ, Field Service, or industry-specific clouds\n- Sales team open to tool change\n- Contract renewal within 12 months",
      requirements:
        "1. Current Salesforce licence breakdown and costs\n2. List of active automations, workflows, and custom objects\n3. Integration inventory (email, marketing, support tools)\n4. Data export from Salesforce (contacts, accounts, opportunities, activities)\n5. 4-8 weeks for parallel run before full cutover",
      highLevelApproach:
        "1. Audit current Salesforce usage: features used, custom objects, automations\n2. Map each capability to HubSpot equivalent (most map 1:1 or better)\n3. Plan data migration: clean, deduplicate, test import\n4. Rebuild critical automations in HubSpot workflows\n5. Run both systems in parallel for 4 weeks\n6. Train team and cut over, decommission Salesforce",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would contain:\n\n- Feature-by-feature Salesforce vs HubSpot comparison\n- Data migration playbook with field mapping templates\n- Automation rebuild guide (Salesforce Flow → HubSpot Workflow)\n- Integration migration checklist\n- Change management and training programme\n- Rollback plan if migration doesn't meet targets",
      templates:
        "[SAMPLE CONTENT]\n\n- Salesforce Feature Audit Spreadsheet\n- Field Mapping Template (Salesforce → HubSpot)\n- Automation Migration Tracker\n- Training Programme Outline\n- Parallel Run Testing Checklist\n- Cost Comparison Calculator",
      stage2Price: 3000,
      savingsEstimateLow: 30000,
      savingsEstimateHigh: 80000,
      confidenceScore: 74,
    },

    // ── PROCUREMENT ─────────────────────────────────────────
    {
      contributorId: contributor3.id,
      title: "[SAMPLE] Save 15-25% on Office Supplies by Switching to Group Purchasing",
      brief:
        "Individual companies pay catalogue prices for office supplies, cleaning products, and consumables. Joining a group purchasing organisation (GPO) or cooperating with nearby businesses gives you volume-level pricing — saving 15-25% on a spend most companies consider non-negotiable.",
      company: "SMEs (20-200 employees)",
      category: "procurement",
      stage1Price: 250,
      validationChecklist:
        "- Annual office supplies spend exceeds €10,000\n- Purchasing from 3+ different suppliers\n- Not currently part of a group purchasing organisation\n- Office manager or facilities person handles procurement\n- Open to changing suppliers for non-critical items",
      requirements:
        "1. Last 12 months of purchase orders / invoices for office supplies\n2. Current supplier contracts (if any)\n3. Office manager time for supplier evaluation (~5 hours)\n4. Willingness to consolidate to 1-2 main suppliers\n5. Storage space for slightly larger order quantities",
      highLevelApproach:
        "1. Categorise last year's purchases by type, supplier, and unit cost\n2. Identify top 20 items by spend (usually covers 80% of total)\n3. Research GPOs available in your country/region\n4. Request quotes from GPOs for your top 20 items — compare to current prices\n5. Negotiate direct contracts for remaining items using GPO quotes as leverage",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would include:\n\n- GPO directory by European country\n- Spend analysis methodology\n- Supplier negotiation tactics using competitive quotes\n- Consolidated procurement workflow design\n- Contract template for group purchasing agreements",
      templates:
        "[SAMPLE CONTENT]\n\n- Spend Analysis Spreadsheet\n- Supplier Comparison Matrix\n- GPO Evaluation Checklist\n- Purchase Order Consolidation Guide\n- Savings Tracking Dashboard",
      stage2Price: 800,
      savingsEstimateLow: 3000,
      savingsEstimateHigh: 15000,
      confidenceScore: 70,
    },

    // ── GENERAL ─────────────────────────────────────────────
    {
      contributorId: contributor2.id,
      title: "[SAMPLE] Renegotiate Your Office Lease — Save €20-100K Over the Remaining Term",
      brief:
        "Post-COVID, office vacancy rates are at 15-20% in most European cities. Landlords are willing to renegotiate: lower rent, free months, or fit-out contributions. If your lease renews in the next 18 months or you haven't renegotiated since 2020, you're likely overpaying by 10-25%.",
      company: "Companies with Office Leases",
      category: "general",
      stage1Price: 500,
      validationChecklist:
        "- Current office lease cost exceeds €3,000/month\n- Lease expires or renews within 18 months\n- Haven't renegotiated lease terms since 2020\n- Office is in a market with vacancy rate above 10%\n- Open to relocating if a better deal is available nearby",
      requirements:
        "1. Current lease agreement (full document)\n2. Last rent review or renewal letter\n3. Understanding of your actual space utilisation (% of desks used daily)\n4. Budget for commercial property advisor if needed (typically 1 month's rent)\n5. CEO or COO involvement in final negotiation",
      highLevelApproach:
        "1. Benchmark your rent per sqm against current market rates in your area\n2. Calculate your actual space utilisation — most companies use 50-70% post-COVID\n3. Research comparable available spaces within 2km (this is your BATNA)\n4. Approach landlord with data: market rates, your alternatives, and a specific ask\n5. Negotiate: rent reduction, rent-free period, break clause, or fit-out contribution",
      fullPlaybook:
        "[SAMPLE CONTENT]\n\nA real listing would include:\n\n- Market rent benchmarking methodology by European city\n- Space utilisation audit framework\n- Landlord negotiation strategy and scripts\n- Lease clause analysis checklist (break clauses, indexation, service charges)\n- Timeline and escalation plan for negotiations",
      templates:
        "[SAMPLE CONTENT]\n\n- Rent Benchmarking Spreadsheet\n- Space Utilisation Audit Template\n- Negotiation Strategy Planner\n- Lease Clause Review Checklist\n- Landlord Communication Templates (3 scenarios)\n- Decision Matrix: Renegotiate vs Relocate",
      stage2Price: 2500,
      savingsEstimateLow: 20000,
      savingsEstimateHigh: 100000,
      confidenceScore: 79,
    },
  ];

  // Clear old sample opportunities (avoid duplicates on re-seed)
  const sampleContributorIds = [contributor1.id, contributor2.id, contributor3.id];
  await prisma.opportunity.deleteMany({
    where: { contributorId: { in: sampleContributorIds } },
  });

  for (const opp of opps) {
    await prisma.opportunity.create({
      data: {
        ...opp,
        status: "published",
      },
    });
  }
  console.log(`Created ${opps.length} sample opportunities across all categories`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
