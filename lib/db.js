const config = require('../config')
const mysql = require('mysql')
const sqlite3 = require('sqlite3').verbose()

const engines = {
  undefined: 'sqlite3',
  test: 'sqlite3',
  development: 'mysql',
  production: 'mysql'
}

const engine = {
  sqlite3: new sqlite3.Database(':memory:'),
  mysql: mysql.createConnection(config.mysql)
}[engines[process.env.NODE_ENV]]

const db = module.exports = engine

if (engines[process.env.NODE_ENV] === 'mysql') {
  db.connect(function (err) {
    if (err) throw err
    console.log('connected to the database')
  })
}

db.healthCheck = function (cb) {
  const now = Date.now().toString()
  const createQuery = 'CREATE TABLE IF NOT EXISTS healthCheck (value TEXT)'
  const insertQuery = 'INSERT INTO healthCheck VALUES (?)'

  return executeQuery(createQuery, [], function (err) {
    if (err) return cb(err)
    return executeQuery(insertQuery, [now], function (err) {
      if (err) return cb(err)
      cb(null, now)
    })
  })
}

function executeQuery (query, values, cb) {
  if (engines[process.env.NODE_ENV] === 'mysql') {
    return db.query(query, values, function (err, data) {
      if (err) return cb(err)
      cb(null, data)
    })
  }

  return db.serialize(function () {
    db.run(query, values, function (err, data) {
      if (err) return cb(err)
      cb(null, data)
    })
  })
}

async function getProjectByNameAndYear(name, year) {
  const [rows] = await executeQuery('SELECT * FROM projects WHERE projectName = ? AND year = ?', [name, year]);
  return rows[0];
}

async function getProjectById(id) {
  const [rows] = await executeQuery('SELECT * FROM projects WHERE projectId = ?', [id]);
  return rows[0];
}

async function addProject(project) {
  const { projectId, projectName, year, currency, initialBudgetLocal, budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, contingencyRate, escalationRate, finalBudgetUsd } = project;
  await executeQuery('INSERT INTO projects (projectId, projectName, year, currency, initialBudgetLocal, budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, contingencyRate, escalationRate, finalBudgetUsd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [projectId, projectName, year, currency, initialBudgetLocal, budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, contingencyRate, escalationRate, finalBudgetUsd]);
}

async function updateProject(id, project) {
  const { projectName, year, currency, initialBudgetLocal, budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, contingencyRate, escalationRate, finalBudgetUsd } = project;
  await executeQuery('UPDATE projects SET projectName = ?, year = ?, currency = ?, initialBudgetLocal = ?, budgetUsd = ?, initialScheduleEstimateMonths = ?, adjustedScheduleEstimateMonths = ?, contingencyRate = ?, escalationRate = ?, finalBudgetUsd = ? WHERE projectId = ?', [projectName, year, currency, initialBudgetLocal, budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, contingencyRate, escalationRate, finalBudgetUsd, id]);
}

async function deleteProject(id) {
  await executeQuery('DELETE FROM projects WHERE projectId = ?', [id]);
}

module.exports = {
  getProjectByNameAndYear,
  getProjectById,
  addProject,
  updateProject,
  deleteProject
};