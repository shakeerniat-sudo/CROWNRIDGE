const express = require('express');
const prisma = require('../utils/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Submit or Update Feedback for a Report
router.post('/', authenticateToken, async (req, res) => {
  const { reportId, rating, like, comment } = req.body;

  if (!reportId || rating === undefined) {
    return res.status(400).json({ error: 'Report ID and rating are required.' });
  }

  const numericRating = parseInt(rating, 10);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    // Verify report exists and belongs to user (unless Admin)
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (req.user.role !== 'Administrator' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to rate this report.' });
    }

    // Upsert feedback
    const feedback = await prisma.feedback.upsert({
      where: { reportId },
      update: {
        rating: numericRating,
        like: like !== undefined ? Boolean(like) : true,
        comment: comment || ''
      },
      create: {
        reportId,
        rating: numericRating,
        like: like !== undefined ? Boolean(like) : true,
        comment: comment || ''
      }
    });

    res.status(200).json({
      message: 'Feedback submitted successfully.',
      feedback
    });
  } catch (error) {
    console.error('Feedback Submit Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// View all user feedback (Admin Only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedbackList = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        report: {
          select: {
            projectName: true,
            projectId: true,
            severity: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(feedbackList);
  } catch (error) {
    console.error('Fetch Feedback Error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback logs.' });
  }
});

module.exports = router;
