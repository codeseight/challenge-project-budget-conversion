process.env.NODE_ENV = 'test'

const http = require('http')
const test = require('tape')
const servertest = require('servertest')
const app = require('../lib/app')

const server = http.createServer(app)

test('GET /health should return 200', function (t) {
  servertest(server, '/health', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.end()
  })
})

test('GET /api/ok should return 200', function (t) {
  servertest(server, '/api/ok', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.ok, 'Should return a body')
    t.end()
  })
})

test('GET /nonexistent should return 404', function (t) {
  servertest(server, '/nonexistent', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})


// Test for POST /api/project/budget/currency
test('POST /api/project/budget/currency', function (t) {

  const requestData = JSON.stringify({
      year: 2024,
      projectName: 'Humitas Hewlett Packard',
      currency: 'TTD'
  });

  servertest(server, '/api/project/budget/currency', { encoding: 'json' }, function (err, res) {
    console.log(err, 'res');
      t.error(err, 'No error');
      t.equal(res.statusCode, 200, 'Correct status code');
      let body = '';
      res.on('data', function (chunk) { body += chunk.toString(); });
      res.on('end', function () {
          const parsedBody = JSON.parse(body);
          t.equal(parsedBody.success, true, 'Response success is true');
          t.end();
      });
  }).end(requestData);
});

// Test for GET /api/project/budget/:id
test('GET /api/project/budget/:id', function (t) {
  // const opts = { method: 'GET', url: '/api/project/budget/1' };

  servertest(server, '/api/project/budget/1', { encoding: 'json' }, function (err, res) {
      t.error(err, 'No error');
      t.equal(res.statusCode, 200, 'Correct status code');
      let body = '';
      res.on('data', function (chunk) { body += chunk.toString(); });
      res.on('end', function () {
          const parsedBody = JSON.parse(body);
          t.equal(parsedBody.projectId, 1, 'Correct project ID');
          t.end();
      });
  });
});

// Test for POST /api/project/budget
test('POST /api/project/budget', function (t) {
  const opts = {
      method: 'POST',
      url: '/api/project/budget',
      headers: { 'Content-Type': 'application/json' }
  };
  const requestData = JSON.stringify({
      projectId: 10001,
      projectName: 'New Project',
      year: 2025,
      currency: 'USD',
      initialBudgetLocal: 500000,
      budgetUsd: 500000,
      initialScheduleEstimateMonths: 12,
      adjustedScheduleEstimateMonths: 11,
      contingencyRate: 1.5,
      escalationRate: 2.5,
      finalBudgetUsd: 525000
  });

  servertest(server, '/api/project/budget', { encoding: 'json' }, function (err, res) {
      t.error(err, 'No error');
      t.equal(res.statusCode, 201, 'Correct status code');
      let body = '';
      res.on('data', function (chunk) { body += chunk.toString(); });
      res.on('end', function () {
          const parsedBody = JSON.parse(body);
          t.equal(parsedBody.message, 'Project added successfully', 'Project added');
          t.end();
      });
  }).end(requestData);
});

// Test for PUT /api/project/budget/:id
test('PUT /api/project/budget/:id', function (t) {
  const opts = {
      method: 'PUT',
      url: '/api/project/budget/10001',
      headers: { 'Content-Type': 'application/json' }
  };
  const requestData = JSON.stringify({
      projectName: 'Updated Project',
      year: 2026,
      currency: 'EUR',
      initialBudgetLocal: 600000,
      budgetUsd: 600000,
      initialScheduleEstimateMonths: 14,
      adjustedScheduleEstimateMonths: 13,
      contingencyRate: 1.8,
      escalationRate: 2.8,
      finalBudgetUsd: 630000
  });

  servertest(server, '/api/project/budget/10001', { encoding: 'json' }, function (err, res) {
      t.error(err, 'No error');
      t.equal(res.statusCode, 200, 'Correct status code');
      let body = '';
      res.on('data', function (chunk) { body += chunk.toString(); });
      res.on('end', function () {
          const parsedBody = JSON.parse(body);
          t.equal(parsedBody.message, 'Project updated successfully', 'Project updated');
          t.end();
      });
  }).end(requestData);
});

// Test for DELETE /api/project/budget/:id
test('DELETE /api/project/budget/:id', function (t) {
  const opts = { method: 'DELETE', url: '/api/project/budget/10001' };

  servertest(server, '/api/project/budget/10001', { encoding: 'json' }, function (err, res) {
      t.error(err, 'No error');
      t.equal(res.statusCode, 200, 'Correct status code');
      let body = '';
      res.on('data', function (chunk) { body += chunk.toString(); });
      res.on('end', function () {
          const parsedBody = JSON.parse(body);
          t.equal(parsedBody.message, 'Project deleted successfully', 'Project deleted');
          t.end();
      });
  });
});