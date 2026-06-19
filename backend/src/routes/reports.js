const express = require('express');
const prisma = require('../utils/db');
const { generateDelayAnalysis } = require('../utils/ai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate and Save Report
router.post('/generate', authenticateToken, async (req, res) => {
  const {
    projectName,
    projectId,
    location,
    weather,
    labour,
    material,
    equipment,
    approval,
    delayDuration,
    severity,
    notes
  } = req.body;

  // Basic validation
  if (!projectName || !projectId || !location || !weather || !labour || !material || !equipment || !approval || !delayDuration || !severity) {
    return res.status(400).json({ error: 'All fields except additional notes are required.' });
  }

  try {
    // Generate report using AI service
    const aiReport = await generateDelayAnalysis({
      projectName,
      projectId,
      location,
      weather,
      labour,
      material,
      equipment,
      approval,
      delayDuration,
      severity,
      notes
    });

    // Save to database
    const savedReport = await prisma.report.create({
      data: {
        userId: req.user.id,
        projectName,
        projectId,
        location,
        weather,
        labour,
        material,
        equipment,
        approval,
        delayDuration,
        severity,
        notes: notes || '',
        aiResponse: JSON.stringify(aiReport)
      }
    });

    res.status(201).json({
      id: savedReport.id,
      projectName: savedReport.projectName,
      projectId: savedReport.projectId,
      location: savedReport.location,
      weather: savedReport.weather,
      labour: savedReport.labour,
      material: savedReport.material,
      equipment: savedReport.equipment,
      approval: savedReport.approval,
      delayDuration: savedReport.delayDuration,
      severity: savedReport.severity,
      notes: savedReport.notes,
      aiResponse: aiReport,
      createdAt: savedReport.createdAt
    });
  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate delay analysis report.' });
  }
});

// List Reports (User gets their own, Admin gets all)
// Supports search (project name, ID, or location) and filtering by date (startDate, endDate)
router.get('/', authenticateToken, async (req, res) => {
  const { search, startDate, endDate } = req.query;

  try {
    let whereClause = {};

    // Standard users can only view their own reports
    if (req.user.role !== 'Administrator') {
      whereClause.userId = req.user.id;
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { projectName: { contains: search } },
        { projectId: { contains: search } },
        { location: { contains: search } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Adjust to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        feedback: {
          select: {
            rating: true,
            like: true,
            comment: true
          }
        }
      }
    });

    // Parse AI response JSON back to object
    const parsedReports = reports.map(r => ({
      ...r,
      aiResponse: JSON.parse(r.aiResponse)
    }));

    res.json(parsedReports);
  } catch (error) {
    console.error('Fetch Reports Error:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// Get Single Report details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.id }, // Wait, req.params.id is standard! Let's check below.
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        feedback: true
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Access control: User can only see their own reports, unless Administrator
    if (req.user.role !== 'Administrator' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this report.' });
    }

    res.json({
      ...report,
      aiResponse: JSON.parse(report.aiResponse)
    });
  } catch (error) {
    console.error('Fetch Report Detail Error:', error);
    res.status(500).json({ error: 'Failed to fetch report details.' });
  }
});

// Delete Report
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Access control: User can only delete their own, Admin can delete any
    if (req.user.role !== 'Administrator' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this report.' });
    }

    await prisma.report.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({ error: 'Failed to delete report.' });
  }
});

module.exports = router;
