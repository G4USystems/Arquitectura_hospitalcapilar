exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Forward any request to PostHog EU
  const path = event.queryStringParameters?.path || '/e/';
  const posthogUrl = `https://eu.i.posthog.com${path}`;

  try {
    const response = await fetch(posthogUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': event.headers['content-type'] || 'application/json',
      },
      body: event.body,
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
