// Static app data: impact and urgency options, ticket categories with their first steps, board statuses and sample tickets.

// The value is what gets stored and looked up; the label is what people read
export const IMPACT_LEVELS = [
  { value: 'single', label: 'Single user' },
  { value: 'team', label: 'Team' },
  { value: 'office', label: 'Whole office' },
];

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Steps are ordered cheapest-first, so the user tries the quick fixes before calling IT
export const CATEGORIES = [
  {
    value: 'network',
    label: 'Network',
    color: 'navy',
    steps: [
      'Check the cable or Wi-Fi connection.',
      'Run ipconfig and look for a 169.254 address.',
      'Ping the gateway, then 8.8.8.8, then google.com.',
    ],
  },
  {
    value: 'hardware',
    label: 'Hardware',
    color: 'yellow',
    steps: [
      'Restart the device.',
      'Check cables, power and peripherals.',
      'Open Task Manager and check CPU, memory and disk.',
    ],
  },
  {
    value: 'microsoft-365',
    label: 'Microsoft 365',
    color: 'red',
    steps: [
      'Check Microsoft 365 service status.',
      'Try the web version (outlook.office.com).',
      'Sign out and back in, then restart the app.',
    ],
  },
  {
    value: 'account',
    label: 'Account / Login',
    color: 'navy',
    steps: [
      'Check Caps Lock and the keyboard language.',
      'Check if the account is locked or the password expired.',
      "Verify the user's identity before any reset.",
    ],
  },
  {
    value: 'printer',
    label: 'Printer',
    color: 'yellow',
    steps: [
      'Check paper, toner and error lights.',
      'Clear the print queue.',
      'Restart the Print Spooler service.',
    ],
  },
  {
    value: 'security',
    label: 'Security',
    color: 'red',
    steps: [
      'Do not click any more links.',
      'Disconnect from the network if malware is suspected.',
      'Report it to IT right away and reset the password.',
    ],
  },
];

// Board columns in workflow order; action is the label of the button that moves a ticket on
export const STATUSES = [
  { value: 'open', action: 'Start work' },
  { value: 'in-progress', action: 'Mark resolved' },
  { value: 'resolved', action: null },
];

// Ages are stored in minutes, so the demo always looks recent no matter when it is opened
export const SAMPLE_TICKETS = [
  {
    name: 'Maria Santos',
    category: 'network',
    description: 'The whole office lost internet after the router restarted.',
    impact: 'office',
    urgency: 'high',
    status: 'open',
    minutesAgo: 12,
  },
  {
    name: 'Paolo Reyes',
    category: 'microsoft-365',
    description: 'The Accounts team shared mailbox will not open in Outlook.',
    impact: 'team',
    urgency: 'medium',
    status: 'in-progress',
    minutesAgo: 47,
  },
  {
    name: 'Jen Cruz',
    category: 'account',
    description: 'Locked out after changing my password on my phone.',
    impact: 'single',
    urgency: 'high',
    status: 'resolved',
    minutesAgo: 190,
  },
];
