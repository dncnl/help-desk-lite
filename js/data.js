// Static app data: impact and urgency options, and ticket categories with their first troubleshooting steps.

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
