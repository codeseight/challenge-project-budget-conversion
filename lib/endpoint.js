const express = require('express')

const endpoints = express.Router();

const db = require('./db');
const axios = require('axios');

endpoints.get('/ok', (req, res) => {
  res.status(200).json({ ok: true })
})

// Helper function to convert currency
async function convertCurrency(amount, fromCurrency, toCurrency) {
  const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
  const rate = response.data.rates[toCurrency];
  return amount * rate;
}

// Find budget details and convert currency
endpoints.post('/project/budget/currency', async (req, res) => {
  const { year, projectName, currency } = req.body;
  const project = await db.getProjectByNameAndYear(projectName, year);
  if (project) {
      const finalBudgetTtd = await convertCurrency(project.finalBudgetUsd, 'USD', currency);
      project.finalBudgetTtd = finalBudgetTtd;
      res.json({ success: true, data: project });
  } else {
      res.status(404).json({ success: false, message: 'Project not found' });
  }
});

// Get budget data by ID
endpoints.get('/project/budget/:id', async (req, res) => {
  const project = await db.getProjectById(req.params.id);
  if (project) {
      res.json(project);
  } else {
      res.status(404).json({ message: 'Project not found' });
  }
});

// Add new budget data
endpoints.post('/project/budget', async (req, res) => {
  const newProject = req.body;
  await db.addProject(newProject);
  res.status(201).json({ message: 'Project added successfully' });
});

// Update existing budget data
endpoints.put('/project/budget/:id', async (req, res) => {
  const updatedProject = req.body;
  await db.updateProject(req.params.id, updatedProject);
  res.json({ message: 'Project updated successfully' });
});

// Delete budget data
endpoints.delete('/project/budget/:id', async (req, res) => {
  await db.deleteProject(req.params.id);
  res.json({ message: 'Project deleted successfully' });
});


module.exports = endpoints
