import express from 'express';
import Joi from 'joi';
import { CaseService } from '../services/CaseService.js';
import { Case, Participant, SimulationSettings } from '../types/index.js';

const router = express.Router();

const caseSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  type: Joi.string().valid('civil', 'criminal').required(),
  summary: Joi.string().required().min(1).max(2000),
  participants: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    role: Joi.string().required(),
    description: Joi.string().optional(),
    aiControlled: Joi.boolean().required(),
    llmConfig: Joi.object().optional()
  })).min(1),
  settings: Joi.object({
    realtimeSpeed: Joi.number().min(0.1).max(5).optional(),
    autoProgress: Joi.boolean().optional(),
    jurySize: Joi.number().min(0).max(12).optional(),
    enableObjections: Joi.boolean().optional(),
    complexityLevel: Joi.string().valid('simple', 'intermediate', 'advanced').optional()
  }).optional()
});

const updateCaseSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  type: Joi.string().valid('civil', 'criminal').optional(),
  summary: Joi.string().min(1).max(2000).optional(),
  participants: Joi.array().items(Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    role: Joi.string().required(),
    description: Joi.string().optional(),
    aiControlled: Joi.boolean().required(),
    llmConfig: Joi.object().optional()
  })).optional(),
  settings: Joi.object({
    realtimeSpeed: Joi.number().min(0.1).max(5).optional(),
    autoProgress: Joi.boolean().optional(),
    jurySize: Joi.number().min(0).max(12).optional(),
    enableObjections: Joi.boolean().optional(),
    complexityLevel: Joi.string().valid('simple', 'intermediate', 'advanced').optional()
  }).optional()
});

export default function createCaseRoutes(caseService: CaseService) {
  router.get('/', async (req, res) => {
    try {
      const { userId, limit = 50, offset = 0 } = req.query;
      const cases = await caseService.getAllCases(
        userId as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(cases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch cases' 
      });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const case_ = await caseService.getCaseById(id);
      
      if (!case_) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.json(case_);
    } catch (error) {
      console.error('Error fetching case:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch case' 
      });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { error, value } = caseSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
      }

      const newCase = await caseService.createCase(value);
      res.status(201).json(newCase);
    } catch (error) {
      console.error('Error creating case:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create case' 
      });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = updateCaseSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
      }

      const updatedCase = await caseService.updateCase(id, value);
      
      if (!updatedCase) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error('Error updating case:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update case' 
      });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await caseService.deleteCase(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting case:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete case' 
      });
    }
  });

  router.post('/:id/participants', async (req, res) => {
    try {
      const { id } = req.params;
      const participant = req.body;
      
      const updatedCase = await caseService.addParticipant(id, participant);
      
      if (!updatedCase) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error('Error adding participant:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to add participant' 
      });
    }
  });

  router.put('/:id/participants/:participantId', async (req, res) => {
    try {
      const { id, participantId } = req.params;
      const updates = req.body;
      
      const updatedCase = await caseService.updateParticipant(id, participantId, updates);
      
      if (!updatedCase) {
        return res.status(404).json({ error: 'Case or participant not found' });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error('Error updating participant:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update participant' 
      });
    }
  });

  router.delete('/:id/participants/:participantId', async (req, res) => {
    try {
      const { id, participantId } = req.params;
      
      const updatedCase = await caseService.removeParticipant(id, participantId);
      
      if (!updatedCase) {
        return res.status(404).json({ error: 'Case or participant not found' });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error('Error removing participant:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to remove participant' 
      });
    }
  });

  router.get('/:id/transcript', async (req, res) => {
    try {
      const { id } = req.params;
      const transcript = await caseService.getTranscript(id);
      
      if (!transcript) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.json(transcript);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch transcript' 
      });
    }
  });

  router.post('/:id/transcript', async (req, res) => {
    try {
      const { id } = req.params;
      const entry = req.body;
      
      const updatedCase = await caseService.addTranscriptEntry(id, entry);
      
      if (!updatedCase) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error('Error adding transcript entry:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to add transcript entry' 
      });
    }
  });

  router.put('/:id/phase', async (req, res) => {
    try {
      const { id } = req.params;
      const { phase } = req.body;
      
      if (!phase) {
        return res.status(400).json({ error: 'Phase is required' });
      }
      
      const updatedCase = await caseService.updatePhase(id, phase);
      
      if (!updatedCase) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      res.json(updatedCase);
    } catch (error) {
      console.error('Error updating phase:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update phase' 
      });
    }
  });

  return router;
}