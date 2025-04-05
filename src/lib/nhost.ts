import { NhostClient } from '@nhost/nhost-js';

const NHOST_SUBDOMAIN = import.meta.env.VITE_NHOST_SUBDOMAIN || 'vyuokrnxjmxjimvhmskq';
const NHOST_REGION = import.meta.env.VITE_NHOST_REGION || 'ap-south-1';

// Make sure we have values even if env variables aren't loaded
const subdomain = NHOST_SUBDOMAIN === 'YOUR_NHOST_SUBDOMAIN' ? 'vyuokrnxjmxjimvhmskq' : NHOST_SUBDOMAIN;
const region = NHOST_REGION === 'YOUR_NHOST_REGION' ? 'ap-south-1' : NHOST_REGION;

export const nhost = new NhostClient({
  subdomain,
  region,
});