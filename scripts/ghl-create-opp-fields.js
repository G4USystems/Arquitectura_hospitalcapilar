#!/usr/bin/env node
/**
 * Creates opportunity-level custom fields in GHL for booking data.
 * Run once: node scripts/ghl-create-opp-fields.js
 * Then copy the IDs into koibox-proxy.js OPP_CF_BOOKING constants.
 */

import { readFileSync } from 'fs';
try {
  const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch { /* .env not found */ }

const GHL_BASE = 'https://services.leadconnectorhq.com';
const API_KEY = process.env.VITE_GHL_API_KEY;
const LOCATION_ID = process.env.VITE_GHL_LOCATION_ID || 'U4SBRYIlQtGBDHLFwEUf';

if (!API_KEY) {
  console.error('VITE_GHL_API_KEY not set');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Version': '2021-07-28',
};

// Opportunity-level custom fields for booking sync
const FIELDS_TO_CREATE = [
  { name: 'koibox_id', dataType: 'TEXT', placeholder: '12345', model: 'opportunity' },
  { name: 'fecha_cita_opp', dataType: 'DATE', placeholder: '2026-03-20', model: 'opportunity' },
  { name: 'hora_cita_opp', dataType: 'TEXT', placeholder: '10:00', model: 'opportunity' },
  { name: 'link_agendados', dataType: 'TEXT', placeholder: 'https://diagnostico.hospitalcapilar.com/agendar?...', model: 'opportunity' },
];

async function main() {
  console.log('Fetching existing custom fields...');
  const listRes = await fetch(`${GHL_BASE}/locations/${LOCATION_ID}/customFields`, { headers });
  const listData = await listRes.json();
  const existing = listData.customFields || [];

  console.log(`Found ${existing.length} existing fields\n`);

  const results = {};

  for (const field of FIELDS_TO_CREATE) {
    const found = existing.find(f =>
      f.name?.toLowerCase() === field.name.toLowerCase() ||
      f.fieldKey?.includes(field.name)
    );

    if (found) {
      console.log(`✅ "${field.name}" already exists → ID: ${found.id}`);
      results[field.name] = found.id;
      continue;
    }

    console.log(`Creating "${field.name}" (${field.dataType}, model: ${field.model})...`);
    const createRes = await fetch(`${GHL_BASE}/locations/${LOCATION_ID}/customFields`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: field.name,
        dataType: field.dataType,
        placeholder: field.placeholder,
        model: field.model,
      }),
    });

    const createData = await createRes.json();

    if (createRes.ok) {
      const id = createData.customField?.id || createData.id || 'unknown';
      console.log(`✅ Created "${field.name}" → ID: ${id}`);
      results[field.name] = id;
    } else {
      console.log(`❌ Failed to create "${field.name}":`, createRes.status, JSON.stringify(createData));
    }
  }

  console.log('\n--- Copy these IDs into koibox-proxy.js OPP_CF_BOOKING ---');
  console.log(`  koibox_id:    '${results.koibox_id || 'FAILED'}'`);
  console.log(`  fecha_cita:   '${results.fecha_cita_opp || 'FAILED'}'`);
  console.log(`  hora_cita:    '${results.hora_cita_opp || 'FAILED'}'`);
  console.log(`  link_agendados: '${results.link_agendados || 'FAILED'}'`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
