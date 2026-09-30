const patientService = require('../services/patientService');
const { validatePatientId } = require('../validation/patientIdValidation');
const { validatePatientInput } = require('../validation/patientValidation');
const { validatePatientListQuery } = require('../validation/patientListValidation');
const { validatePatientUpdateInput } = require('../validation/patientUpdateValidation');

async function createPatient(req, res) {
  const patientInput = validatePatientInput(req.body);
  const patient = await patientService.createPatient(patientInput);

  res.status(201).json({ patient });
}

async function listPatients(req, res) {
  const query = validatePatientListQuery(req.query);
  const result = await patientService.listPatients(query);

  res.json(result);
}

async function getPatientById(req, res) {
  const patientId = validatePatientId(req.params.id);
  const patient = await patientService.findPatientById(patientId);

  if (!patient) {
    const error = new Error('Patient not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ patient });
}

async function updatePatient(req, res) {
  const patientId = validatePatientId(req.params.id);
  const patientInput = validatePatientUpdateInput(req.body);
  const patient = await patientService.updatePatient(patientId, patientInput);

  if (!patient) {
    const error = new Error('Patient not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ patient });
}

async function deletePatient(req, res) {
  const patientId = validatePatientId(req.params.id);
  const deletedPatient = await patientService.deletePatient(patientId);

  if (!deletedPatient) {
    const error = new Error('Patient not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(204).send();
}

module.exports = { createPatient, deletePatient, getPatientById, listPatients, updatePatient };
