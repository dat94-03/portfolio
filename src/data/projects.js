// Career projects — the three pillars in the Experience scene.
// Distilled from the resume into story-shaped bullets, not verbatim.

export const COMPANY = {
  name: 'FPT Software',
  location: 'FPT Tower, Hanoi, Vietnam',
  role: 'DevOps / Cloud Engineer',
  period: 'Mar 2025 — Present',
  years: '6+ years of cloud/DevOps practice, formalised at FPT Software from March 2025',
}

export const PROJECTS = [
  {
    id: 'germany',
    codename: 'Project A',
    customerRegion: 'Germany',
    flag: '🇩🇪',
    accent: '#4cc9f0',
    headline: 'Enterprise AWS Landing Zone · 1,000+ accounts',
    scale: '1,000+ accounts',
    partition: 'AWS Global + AWS China',
    // Bullets rewritten in active voice, story-shaped.
    highlights: [
      'Ran a thousand-plus-account Control Tower estate across multiple regions and both the Global and China partitions — one governance model, two very different worlds.',
      'Automated account provisioning end-to-end with AFT (global baselines → per-account Terraform → Step Functions hooks). Onboarding dropped from days to under an hour; ServiceNow/CMDB registration is part of the pipeline.',
      'Owned org-wide governance as delegated admin: SCPs, Config, CloudTrail, GuardDuty, Inspector, Macie, Access Analyzer, Security Hub — plus mandatory tagging for cost allocation and audit trails.',
      'Built the GitHub Actions CI/CD spine for Landing Zone and IaC — multi-region matrix runs, OIDC cross-account role assumption, Checkov gates on every plan.',
      'Ran a hub-and-spoke network across networking / inspection / egress accounts with Transit Gateway, plus a centralised inspection VPC (Network Firewall + Gateway Load Balancer).',
      'Stood up an AMI Factory on EC2 Image Builder — CIS-hardened, Inspector-validated golden images pre-baked with CrowdStrike, Splunk, and CloudWatch agents. An SCP guardrail enforces ami:approved=true from the Factory account only.',
    ],
    tags: ['Control Tower', 'AFT', 'SCPs', 'Transit Gateway', 'EC2 Image Builder', 'GitHub Actions'],
  },
  {
    id: 'france',
    codename: 'Project B',
    customerRegion: 'France',
    flag: '🇫🇷',
    accent: '#9d7cff',
    headline: 'Enterprise AWS Landing Zone · 100+ accounts',
    scale: '100+ accounts',
    partition: 'AWS Global · Dev / QA / Prod',
    highlights: [
      'Architected a 100+ account Control Tower estate with OU-aligned structure and clean Dev/QA/Prod separation.',
      'Wired governance and automated remediation — SCPs, Config, CloudTrail, GuardDuty, Security Hub, then EventBridge + Lambda closing the loop. MTTR on non-compliant resources dropped meaningfully.',
      'AFT + GitHub Actions + AWS CodePipeline for account provisioning and IaC, with linting and Checkov scanning built in.',
      'Hub-and-spoke network via Transit Gateway with dedicated networking/egress accounts, and AWS IPAM as the single source of truth for CIDRs.',
      'Ran the EC2 Image Builder AMI Factory (CIS-validated, cross-account distribution). Integrated IAM Identity Center SSO with least-privilege permission sets. Set service-quota monitoring with 75% alerting.',
    ],
    tags: ['Control Tower', 'AFT', 'EventBridge', 'IPAM', 'IAM Identity Center', 'CodePipeline'],
  },
  {
    id: 'singapore',
    codename: 'Project C',
    customerRegion: 'Singapore',
    flag: '🇸🇬',
    accent: '#f5c86a',
    headline: 'CI/CD Governance & DevSecOps Standardization',
    scale: 'Platform-wide',
    partition: 'AWS + Amazon EKS',
    highlights: [
      'Wrote Jenkins Shared Libraries that standardise build → scan → test → deploy stages across every pipeline in the org.',
      'Consolidated all Jenkinsfiles into one governed repo and let Jenkins seed jobs auto-create/manage jobs. Manual clicks in the Jenkins UI became a thing of the past.',
      'Ran CI/CD stages inside isolated Kubernetes pods with reproducible podTemplates and golden images.',
      'Wired BlackDuck, Coverity, and SonarQube into gates; containerised builds with Docker; kept artifacts in Nexus Repository Manager.',
      'Worked across GitLab teams to tighten branching strategy and CI governance on AWS + EKS.',
    ],
    tags: ['Jenkins', 'Kubernetes', 'SonarQube', 'BlackDuck', 'Coverity', 'GitLab CI'],
  },
]
