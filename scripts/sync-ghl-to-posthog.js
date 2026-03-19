#!/usr/bin/env node
/**
 * Sync GHL pipeline data → PostHog events.
 * Reads all opportunities from GHL and sends stage-based events to PostHog.
 *
 * Usage: node scripts/sync-ghl-to-posthog.js
 *
 * Events sent:
 *   - appointment_booked   (stage: Booked, Reminder sent, Attended, Won)
 *   - appointment_attended  (stage: Attended, Won)
 *   - appointment_no_show   (stage: No-show)
 *   - patient_converted     (stage: Won)
 *   - patient_lost          (stage: Lost/Cancelled)
 */

const GHL_KEY = process.env.VITE_GHL_API_KEY || 'pit-5d2367d0-3776-40e2-b55f-597b3d06f9e4';
const GHL_LOCATION = process.env.VITE_GHL_LOCATION_ID || 'U4SBRYIlQtGBDHLFwEUf';
const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY || 'phc_mULGdOq6RenSrAyLPMgBQLbP4os7c9l0K7Xq1AKwUBx';
const POSTHOG_HOST = 'https://eu.i.posthog.com';
const GHL_BASE = 'https://services.leadconnectorhq.com';
const PIPELINE_ID = 'xXCgpUIEizlqdrmGrJkg';

// Stage IDs → names
const STAGES = {
  'fbed92b1-5e91-4b86-820f-44b9f66f8b73': 'new_lead',
  'f0b2e24c-ce25-4c54-bb2f-6ba3571308c7': 'contacted',
  'f9e5c1cf-7701-4883-ac96-f16b3d78c0d5': 'booked',
  '24956338-65d9-4a16-97e5-ba01b64f390f': 'reminder_sent',
  '71a5cc36-584e-47dc-9cce-215803e3140d': 'attended',
  '1cd97c60-fb19-4699-9293-2b32fd48b54a': 'won',
  '437d0663-bd17-4d84-a939-11aed1b4b384': 'no_show',
  'c961b576-b14d-43a6-ac75-a26695886d58': 'lost',
};

// Which stages imply which PostHog events
const STAGE_EVENTS = {
  booked:        ['appointment_booked'],
  reminder_sent: ['appointment_booked'],
  attended:      ['appointment_booked', 'appointment_attended'],
  won:           ['appointment_booked', 'appointment_attended', 'patient_converted'],
  no_show:       ['appointment_booked', 'appointment_no_show'],
  lost:          ['patient_lost'],
};

async function fetchAllOpportunities() {
  const ghlHeaders = {
    'Authorization': `Bearer ${GHL_KEY}`,
    'Version': '2021-07-28',
  };

  let all = [];
  let startAfterId = '';
  let hasMore = true;

  while (hasMore) {
    const url = `${GHL_BASE}/opportunities/search?location_id=${GHL_LOCATION}&pipeline_id=${PIPELINE_ID}&limit=20${startAfterId ? `&startAfterId=${startAfterId}` : ''}`;
    const res = await fetch(url, { headers: ghlHeaders });
    const data = await res.json();
    const opps = data.opportunities || [];
    all = all.concat(opps);

    if (opps.length < 20) {
      hasMore = false;
    } else {
      startAfterId = opps[opps.length - 1].id;
    }
  }

  return all;
}

async function sendToPostHog(events) {
  // PostHog batch API
  const payload = {
    api_key: POSTHOG_KEY,
    batch: events,
  };

  const res = await fetch(`${POSTHOG_HOST}/batch/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

function classifyTrafficSource(tags = []) {
  const tagStr = tags.join(' ').toLowerCase();
  if (tagStr.includes('facebook') || tagStr.includes('instagram') || tagStr.includes('meta')) return 'meta';
  if (tagStr.includes('google') && tagStr.includes('ads')) return 'google_ads';
  if (tagStr.includes('seo') || tagStr.includes('organic')) return 'seo';
  if (tagStr.includes('tiktok')) return 'tiktok';
  return 'direct';
}

async function main() {
  console.log('Fetching opportunities from GHL...');
  const opps = await fetchAllOpportunities();
  console.log(`Found ${opps.length} opportunities`);

  const events = [];

  for (const opp of opps) {
    const stageName = STAGES[opp.pipelineStageId] || 'unknown';
    const eventsToSend = STAGE_EVENTS[stageName] || [];
    const contact = opp.contact || {};
    const email = contact.email || '';
    const distinctId = email || opp.id;
    const tags = contact.tags || [];
    const trafficSource = classifyTrafficSource(tags);

    if (eventsToSend.length === 0) continue;

    const baseProps = {
      distinct_id: distinctId,
      $lib: 'ghl-sync',
      contact_name: contact.name || opp.name || '',
      contact_email: email,
      contact_phone: contact.phone || '',
      opportunity_id: opp.id,
      pipeline_stage: stageName,
      monetary_value: opp.monetaryValue || 0,
      traffic_source: trafficSource,
      ghl_tags: tags.join(', '),
    };

    // Send $identify so PostHog merges with frontend anonymous user
    if (email) {
      events.push({
        event: '$identify',
        properties: {
          distinct_id: email,
          $set: {
            email,
            name: contact.name || opp.name || '',
            phone: contact.phone || '',
            pipeline_stage: stageName,
            traffic_source: trafficSource,
          },
        },
        timestamp: opp.createdAt || new Date().toISOString(),
      });
    }

    for (const eventName of eventsToSend) {
      events.push({
        event: eventName,
        properties: { ...baseProps },
        timestamp: opp.createdAt || new Date().toISOString(),
      });
    }
  }

  console.log(`Sending ${events.length} events to PostHog...`);

  // Send in batches of 50
  for (let i = 0; i < events.length; i += 50) {
    const batch = events.slice(i, i + 50);
    const ok = await sendToPostHog(batch);
    console.log(`  Batch ${Math.floor(i / 50) + 1}: ${batch.length} events → ${ok ? 'OK' : 'FAILED'}`);
  }

  // Summary
  const summary = {};
  for (const e of events) {
    summary[e.event] = (summary[e.event] || 0) + 1;
  }
  console.log('\nSummary:');
  for (const [event, count] of Object.entries(summary)) {
    console.log(`  ${event}: ${count}`);
  }
  console.log('\nDone! Refresh your PostHog dashboard.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
