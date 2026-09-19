// Skills grouped for the constellation. Each group gets its own colour so
// the 3D layout reads as clusters rather than a swarm.

export const SKILL_GROUPS = [
  {
    id: 'aws',
    label: 'AWS',
    color: '#f5c86a',
    items: [
      'Control Tower', 'Organizations', 'IAM Identity Center', 'IAM',
      'VPC', 'Transit Gateway', 'Network Firewall',
      'EC2', 'EC2 Image Builder', 'S3', 'RDS',
      'EKS', 'Lambda', 'Step Functions', 'Service Catalog',
    ],
  },
  {
    id: 'governance',
    label: 'Governance & Security',
    color: '#ff5e7e',
    items: [
      'SCPs', 'AWS Config', 'CloudTrail', 'GuardDuty',
      'Amazon Inspector', 'Macie', 'Security Hub', 'IAM Access Analyzer',
      'SonarQube', 'Trivy', 'OWASP ZAP', 'HashiCorp Vault',
    ],
  },
  {
    id: 'iac',
    label: 'IaC & CI/CD',
    color: '#4cc9f0',
    items: [
      'Terraform', 'AFT', 'Ansible', 'AWS CDK', 'CloudFormation',
      'GitHub Actions', 'GitLab CI', 'Jenkins',
      'AWS CodePipeline', 'CodeBuild', 'Argo CD',
    ],
  },
  {
    id: 'containers',
    label: 'Containers & Orchestration',
    color: '#9d7cff',
    items: ['Docker', 'Kubernetes (EKS)', 'Helm'],
  },
  {
    id: 'observability',
    label: 'Monitoring',
    color: '#7ee787',
    items: ['Prometheus', 'Grafana', 'CloudWatch'],
  },
  {
    id: 'langs',
    label: 'Languages',
    color: '#e0e6f5',
    items: ['Python', 'Bash / Shell', 'Go', 'Node.js', 'YAML / JSON'],
  },
  {
    id: 'data',
    label: 'Databases',
    color: '#c98a2d',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'RDS'],
  },
]
