import express from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { Evidence } from '../types/index.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const evidenceDir = path.join(uploadPath, 'evidence');
    
    try {
      await fs.mkdir(evidenceDir, { recursive: true });
      cb(null, evidenceDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${uuidv4()}`;
    const extension = path.extname(file.originalname);
    cb(null, `evidence_${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    files: 5
  }
});

const evidenceSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  type: Joi.string().valid('document', 'video', 'audio', 'photo', 'testimony', 'physical').required(),
  description: Joi.string().required().min(1).max(2000),
  submittedBy: Joi.string().required(),
  caseId: Joi.string().required(),
  exhibit: Joi.string().optional(),
  admissible: Joi.boolean().optional().default(true),
  privileged: Joi.boolean().optional().default(false),
  chainOfCustody: Joi.array().items(Joi.string()).optional().default([])
});

const evidenceStore = new Map<string, Evidence>();

export default function createEvidenceRoutes() {
  router.get('/', async (req, res) => {
    try {
      const { caseId, type, submittedBy, limit = 50, offset = 0 } = req.query;
      
      let evidence = Array.from(evidenceStore.values());
      
      if (caseId) {
        evidence = evidence.filter(e => e.submittedBy === caseId || 
          req.query.caseId === 'all');
      }
      
      if (type) {
        evidence = evidence.filter(e => e.type === type);
      }
      
      if (submittedBy) {
        evidence = evidence.filter(e => e.submittedBy === submittedBy);
      }
      
      evidence.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      const paginatedEvidence = evidence.slice(
        parseInt(offset as string), 
        parseInt(offset as string) + parseInt(limit as string)
      );
      
      res.json({
        evidence: paginatedEvidence,
        total: evidence.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      
    } catch (error) {
      console.error('Error fetching evidence:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch evidence' 
      });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const evidence = evidenceStore.get(id);
      
      if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
      }
      
      res.json(evidence);
      
    } catch (error) {
      console.error('Error fetching evidence:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch evidence' 
      });
    }
  });

  router.post('/', upload.array('files', 5), async (req, res) => {
    try {
      const { error, value } = evidenceSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
      }

      const files = req.files as Express.Multer.File[];
      const evidenceItems: Evidence[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const evidence: Evidence = {
            id: uuidv4(),
            title: value.title + (files.length > 1 ? ` - ${file.originalname}` : ''),
            type: value.type,
            description: value.description,
            submittedBy: value.submittedBy,
            exhibit: value.exhibit,
            filePath: file.path,
            admissible: value.admissible,
            privileged: value.privileged,
            chainOfCustody: [
              ...value.chainOfCustody,
              `Uploaded: ${new Date().toISOString()} by ${value.submittedBy}`,
              `File: ${file.originalname} (${file.size} bytes)`
            ],
            createdAt: new Date()
          };
          
          evidenceStore.set(evidence.id, evidence);
          evidenceItems.push(evidence);
        }
      } else {
        const evidence: Evidence = {
          id: uuidv4(),
          title: value.title,
          type: value.type,
          description: value.description,
          submittedBy: value.submittedBy,
          exhibit: value.exhibit,
          admissible: value.admissible,
          privileged: value.privileged,
          chainOfCustody: [
            ...value.chainOfCustody,
            `Created: ${new Date().toISOString()} by ${value.submittedBy}`
          ],
          createdAt: new Date()
        };
        
        evidenceStore.set(evidence.id, evidence);
        evidenceItems.push(evidence);
      }

      res.status(201).json({
        message: `${evidenceItems.length} evidence item(s) created successfully`,
        evidence: evidenceItems.length === 1 ? evidenceItems[0] : evidenceItems
      });
      
    } catch (error) {
      console.error('Error creating evidence:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create evidence' 
      });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const evidence = evidenceStore.get(id);
      
      if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      const updateSchema = Joi.object({
        title: Joi.string().min(1).max(200).optional(),
        description: Joi.string().min(1).max(2000).optional(),
        exhibit: Joi.string().optional(),
        admissible: Joi.boolean().optional(),
        privileged: Joi.boolean().optional(),
        chainOfCustodyEntry: Joi.string().optional()
      });

      const { error, value } = updateSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
      }

      const updatedEvidence: Evidence = {
        ...evidence,
        ...value,
        chainOfCustody: value.chainOfCustodyEntry 
          ? [...evidence.chainOfCustody, value.chainOfCustodyEntry]
          : evidence.chainOfCustody
      };

      evidenceStore.set(id, updatedEvidence);
      res.json(updatedEvidence);
      
    } catch (error) {
      console.error('Error updating evidence:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update evidence' 
      });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const evidence = evidenceStore.get(id);
      
      if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      if (evidence.filePath) {
        try {
          await fs.unlink(evidence.filePath);
        } catch (fileError) {
          console.warn(`Could not delete file ${evidence.filePath}:`, fileError);
        }
      }

      evidenceStore.delete(id);
      res.status(204).send();
      
    } catch (error) {
      console.error('Error deleting evidence:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete evidence' 
      });
    }
  });

  router.get('/:id/file', async (req, res) => {
    try {
      const { id } = req.params;
      const evidence = evidenceStore.get(id);
      
      if (!evidence || !evidence.filePath) {
        return res.status(404).json({ error: 'Evidence file not found' });
      }

      try {
        await fs.access(evidence.filePath);
      } catch {
        return res.status(404).json({ error: 'Physical file not found' });
      }

      const filename = path.basename(evidence.filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${evidence.title || filename}"`);
      res.sendFile(path.resolve(evidence.filePath));
      
    } catch (error) {
      console.error('Error serving evidence file:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to serve evidence file' 
      });
    }
  });

  router.post('/:id/chain-of-custody', async (req, res) => {
    try {
      const { id } = req.params;
      const { entry, actor } = req.body;
      
      if (!entry || !actor) {
        return res.status(400).json({ error: 'Entry and actor are required' });
      }

      const evidence = evidenceStore.get(id);
      
      if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      const chainEntry = `${new Date().toISOString()}: ${entry} (by ${actor})`;
      evidence.chainOfCustody.push(chainEntry);
      
      evidenceStore.set(id, evidence);
      
      res.json({
        message: 'Chain of custody entry added',
        evidence
      });
      
    } catch (error) {
      console.error('Error adding chain of custody entry:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to add chain of custody entry' 
      });
    }
  });

  return router;
}