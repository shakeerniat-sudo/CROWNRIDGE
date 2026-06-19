const express = require('express');
const prisma = require('../utils/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Auto-seed helper
const seedDefaultTemplates = async () => {
  const count = await prisma.template.count();
  if (count === 0) {
    await prisma.template.createMany({
      data: [
        {
          title: "Monsoon Season Heavy Rains",
          weather: "Heavy rainfall (150mm/day), severe waterlogging, high winds.",
          labour: "Sufficient labour crew available (90%).",
          material: "Sufficient raw material stockpiled.",
          equipment: "Pumping equipment functional; structural cranes halted due to wind.",
          approval: "No government permits pending."
        },
        {
          title: "Harvest Season Labour Deficit",
          weather: "Clear skies, mild temperature (30°C).",
          labour: "Critical worker shortage (40% workforce missing due to seasonal harvest).",
          material: "Sufficient material available.",
          equipment: "All site vehicles fully operational.",
          approval: "Safety inspections completed."
        },
        {
          title: "Sewer Line Permit Delay",
          weather: "Standard sunny weather.",
          labour: "Full labor workforce active.",
          material: "Cement and piping delivery backlog.",
          equipment: "Excavators standing idle.",
          approval: "Municipal sewer discharge permit delayed at environmental desk."
        }
      ]
    });
    console.log("Seeded 3 default delay templates successfully.");
  }
};

// GET all templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    await seedDefaultTemplates();
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Fetch Templates Error:', error);
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
});

// POST new template (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, weather, labour, material, equipment, approval } = req.body;

  if (!title || !weather || !labour || !material || !equipment || !approval) {
    return res.status(400).json({ error: 'All fields are required to create a template.' });
  }

  try {
    const newTemplate = await prisma.template.create({
      data: {
        title,
        weather,
        labour,
        material,
        equipment,
        approval
      }
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Create Template Error:', error);
    res.status(500).json({ error: 'Failed to create template.' });
  }
});

module.exports = router;
