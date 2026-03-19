#!/usr/bin/env node
/**
 * Backfill traffic_source and funnel_type on historical PostHog form_submitted events.
 *
 * Problem: ~40 form_submitted events in PostHog lack traffic_source / funnel_type
 * because the enrichment code wasn't deployed yet. The lead data IS in Firestore
 * (quiz_leads collection) with source info including utm_source, utm_medium, etc.
 *
 * This script:
 *   1. Reads ALL leads from Firestore quiz_leads collection
 *   2. For each lead with an email, sends a PostHog $identify event with $set
 *   3. Also sends a form_submitted event with attribution properties + original timestamp
 *
 * Usage: node scripts/backfill-posthog-attribution.js
 *        node scripts/backfill-posthog-attribution.js --dry-run
 */

const admin = require('firebase-admin');

// ---------- Config ----------
const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY || 'phc_mULGdOq6RenSrAyLPMgBQLbP4os7c9l0K7Xq1AKwUBx';
const POSTHOG_HOST = 'https://eu.i.posthog.com';
const DRY_RUN = process.argv.includes('--dry-run');

// ---------- Firebase Admin init ----------
function initFirestore() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    console.error('[Firebase] FIREBASE_SERVICE_ACCOUNT env var not set.');
    console.error('  Export it first: export FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account",...}\'');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.firestore();
}

// ---------- Traffic source classification (mirrors events.js) ----------
function classifyTrafficSource(source = {}) {
  // Check click IDs first
  if (source.fbclid) return 'meta';
  if (source.gclid) return 'google_ads';

  const utmSource = (source.utm_source || '').toLowerCase();
  const utmMedium = (source.utm_medium || '').toLowerCase();

  // Meta (Facebook / Instagram)
  if (['facebook', 'fb', 'instagram', 'ig', 'meta'].includes(utmSource)) return 'meta';

  // Google Ads
  if (utmSource === 'google' && ['cpc', 'ppc', 'paid'].includes(utmMedium)) return 'google_ads';

  // SEO (Google organic)
  if (utmSource === 'google' && ['organic', ''].includes(utmMedium)) return 'seo';
  if (utmMedium === 'organic') return 'seo';

  // TikTok
  if (['tiktok', 'tt'].includes(utmSource)) return 'tiktok';

  // Direct (no UTMs)
  if (!utmSource && !utmMedium) return 'direct';

  return 'other';
}

// ---------- PostHog batch sender ----------
async function sendToPostHog(events) {
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

// ---------- Main ----------
async function main() {
  if (DRY_RUN) {
    console.log('=== DRY RUN — no events will be sent to PostHog ===\n');
  }

  const db = initFirestore();

  console.log('Reading all leads from Firestore quiz_leads...');
  const snapshot = await db.collection('quiz_leads').get();
  console.log(`Found ${snapshot.size} leads\n`);

  const events = [];
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const lead = doc.data();
    const email = lead.email;

    if (!email) {
      skipped++;
      continue;
    }

    const source = lead.source || {};
    const trafficSource = source.traffic_source || classifyTrafficSource(source);
    const funnelType = source.funnel_type || 'quiz_largo';
    const nicho = source.nicho || 'general';

    // Resolve timestamp
    let timestamp;
    if (lead.createdAt && typeof lead.createdAt.toDate === 'function') {
      // Firestore Timestamp object
      timestamp = lead.createdAt.toDate().toISOString();
    } else if (lead.createdAt) {
      timestamp = new Date(lead.createdAt).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }

    const name = lead.name || lead.nombre || '';
    const phone = lead.phone || lead.telefono || '';

    // 1) $identify event — sets person properties in PostHog
    events.push({
      event: '$identify',
      properties: {
        distinct_id: email,
        $set: {
          email,
          name,
          phone,
          traffic_source: trafficSource,
          funnel_type: funnelType,
          nicho,
        },
      },
      timestamp,
    });

    // 2) form_submitted event — backfills the missing event with attribution
    events.push({
      event: 'form_submitted',
      properties: {
        distinct_id: email,
        $lib: 'backfill-script',
        email,
        name,
        phone,
        traffic_source: trafficSource,
        funnel_type: funnelType,
        nicho,
        utm_source: source.utm_source || '',
        utm_medium: source.utm_medium || '',
        utm_campaign: source.utm_campaign || '',
        utm_content: source.utm_content || '',
        utm_term: source.utm_term || '',
        lead_score: lead.leadScore || lead.lead_score || 0,
        backfilled: true,
      },
      timestamp,
    });

    if (DRY_RUN) {
      console.log(`  [DRY] ${email} → traffic_source=${trafficSource}, funnel_type=${funnelType}, nicho=${nicho}`);
    }
  }

  console.log(`Prepared ${events.length} events (${events.length / 2} leads, ${skipped} skipped without email)\n`);

  if (DRY_RUN) {
    console.log('Dry run complete. Re-run without --dry-run to send events.');
    return;
  }

  // Send in batches of 50
  let sent = 0;
  for (let i = 0; i < events.length; i += 50) {
    const batch = events.slice(i, i + 50);
    const ok = await sendToPostHog(batch);
    const batchNum = Math.floor(i / 50) + 1;
    console.log(`  Batch ${batchNum}: ${batch.length} events → ${ok ? 'OK' : 'FAILED'}`);
    if (ok) sent += batch.length;
  }

  // Summary
  const summary = {};
  for (const e of events) {
    summary[e.event] = (summary[e.event] || 0) + 1;
  }
  console.log(`\nSent ${sent}/${events.length} events:`);
  for (const [event, count] of Object.entries(summary)) {
    console.log(`  ${event}: ${count}`);
  }
  console.log('\nDone! Refresh your PostHog dashboard.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
