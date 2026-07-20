/**
 * User-agent parsing by regex heuristic.
 *
 * Deliberately no dependency: a UA-parsing library is a large, frequently-updated
 * package that would ship a database of device names to solve a problem we only
 * need four buckets for.
 *
 * Bot detection matters more than precision here — bots inflate every traffic
 * metric, and `device = 'bot'` is excluded from all of them.
 */

export type Device = 'mobile' | 'tablet' | 'desktop' | 'bot';

export interface ParsedUA {
  device: Device;
  browser: string;
  os: string;
}

const BOT =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|headless|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptime|curl|wget|python-requests|axios|node-fetch|go-http-client|java\/|okhttp|scrapy|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|claude-web|perplexitybot|ccbot|anthropic|applebot|duckduckbot|yandex|baiduspider|sogou|exabot|ia_archiver/i;

const TABLET = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook|nexus (?:7|9|10)/i;
const MOBILE = /mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini|iemobile/i;

export function parseUA(uaRaw: string | undefined | null): ParsedUA {
  const ua = uaRaw || '';
  if (!ua) return { device: 'bot', browser: 'unknown', os: 'unknown' };
  // A request with no UA at all is far more likely to be automation than a real
  // browser, so it is treated as a bot rather than counted as a visitor.

  if (BOT.test(ua)) return { device: 'bot', browser: botName(ua), os: 'unknown' };

  const device: Device = TABLET.test(ua) ? 'tablet' : MOBILE.test(ua) ? 'mobile' : 'desktop';
  return { device, browser: browserName(ua), os: osName(ua) };
}

function botName(ua: string): string {
  const m = ua.match(
    /(googlebot|bingbot|gptbot|claudebot|claude-web|perplexitybot|ccbot|applebot|duckduckbot|yandexbot|baiduspider|semrushbot|ahrefsbot|facebookexternalhit|twitterbot|slackbot|lighthouse|curl|wget)/i,
  );
  return m ? m[1].toLowerCase() : 'bot';
}

function browserName(ua: string): string {
  // Order matters: Edge and Opera both claim to be Chrome, Chrome claims Safari.
  if (/edg[ea]?\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/ucbrowser/i.test(ua)) return 'UC Browser';
  if (/firefox\/|fxios/i.test(ua)) return 'Firefox';
  if (/chrome\/|crios/i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua)) return 'Safari';
  if (/msie|trident/i.test(ua)) return 'Internet Explorer';
  return 'Other';
}

function osName(ua: string): string {
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod|ios/i.test(ua)) return 'iOS';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}
