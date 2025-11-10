import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],    // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],       // Error rate must be below 10%
    errors: ['rate<0.1'],                // Custom error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  // Test 1: Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Create project
  const payload = JSON.stringify({
    brief: 'Load test: Create e-commerce platform with Stripe payments',
    userId: `load-test-user-${__VU}-${Date.now()}`,
    options: {
      stack: 'NEXTJS',
      budget: 45
    }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  res = http.post(`${BASE_URL}/api/projects`, payload, params);

  const createProjectChecks = check(res, {
    'create project status is 201': (r) => r.status === 201,
    'project id is returned': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch {
        return false;
      }
    },
    'create project response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (!createProjectChecks) {
    errorRate.add(1);
  }

  let projectId;
  try {
    projectId = JSON.parse(res.body).id;
  } catch (e) {
    console.error('Failed to parse project response');
    return;
  }

  sleep(2);

  // Test 3: Get project status
  res = http.get(`${BASE_URL}/api/projects/${projectId}`);

  check(res, {
    'get project status is 200': (r) => r.status === 200,
    'project has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status !== undefined;
      } catch {
        return false;
      }
    },
    'get project response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: List user projects
  const userId = `load-test-user-${__VU}`;
  res = http.get(`${BASE_URL}/api/users/${userId}/projects`);

  check(res, {
    'list projects status is 200': (r) => r.status === 200,
    'projects list is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
    'list projects response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test 5: WebSocket connection simulation (HTTP upgrade)
  res = http.get(`${BASE_URL}/api/ws/project/${projectId}`, {
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
    },
  });

  check(res, {
    'websocket upgrade status is 101 or 200': (r) => r.status === 101 || r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors;

  let summary = `\n${indent}Load Test Summary:\n`;
  summary += `${indent}================\n\n`;
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += `${indent}Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)']}ms\n`;
  summary += `${indent}Error Rate: ${(data.metrics.errors?.values.rate || 0) * 100}%\n`;

  return summary;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>K6 Load Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
    .success { color: green; }
    .warning { color: orange; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Load Test Results</h1>
  <div class="metric">
    <strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}
  </div>
  <div class="metric">
    <strong>Request Duration (p95):</strong> ${data.metrics.http_req_duration.values['p(95)']}ms
  </div>
  <div class="metric">
    <strong>Error Rate:</strong> ${((data.metrics.errors?.values.rate || 0) * 100).toFixed(2)}%
  </div>
</body>
</html>
  `;
}
