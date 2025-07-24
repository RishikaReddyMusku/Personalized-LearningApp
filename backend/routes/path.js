const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { userId, goalId } = req.body;
    console.log('📥 Received:', { userId, goalId });

    const [pathResult] = await db.execute(
      'INSERT INTO learning_paths (user_id, goal_id) VALUES (?, ?)',
      [userId, goalId]
    );
    const learningPathId = pathResult.insertId;
    console.log('🛤️ Created learning_path ID:', learningPathId);

    const [modules] = await db.execute(
      `SELECT m.id FROM modules m
       JOIN skills s ON m.skill_id = s.id
       WHERE s.goal_id = ?`,
      [goalId]
    );
    console.log('📦 Modules:', modules);

    if (modules.length === 0) {
      return res.status(404).json({ error: 'No modules found for selected goal' });
    }

    for (let i = 0; i < modules.length; i++) {
      await db.execute(
        'INSERT INTO path_steps (learning_path_id, module_id, is_completed, order_num) VALUES (?, ?, false, ?)',
        [learningPathId, modules[i].id, i + 1]
      );
    }

    res.json({ message: 'Path generated successfully' });
  } catch (err) {
    console.error('❌ Error generating path:', err);
    res.status(500).json({ error: 'Failed to generate path' });
  }
});

router.post('/toggle', async (req, res) => {
  const { userId, moduleId } = req.body;
  try {
    // Find latest learning path
    const [[latestPath]] = await db.execute(
      `SELECT id FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (!latestPath) return res.status(404).json({ error: 'No learning path found' });

    const learningPathId = latestPath.id;

    const [[current]] = await db.execute(
      `SELECT is_completed FROM path_steps 
       WHERE learning_path_id = ? AND module_id = ?`,
      [learningPathId, moduleId]
    );

    const newValue = !current.is_completed;

    await db.execute(
      `UPDATE path_steps 
       SET is_completed = ? 
       WHERE learning_path_id = ? AND module_id = ?`,
      [newValue, learningPathId, moduleId]
    );

    res.status(200).json({ message: 'Status toggled' });
  } catch (err) {
    console.error('❌ Error toggling status:', err);
    res.status(500).json({ error: 'Could not update' });
  }
});
router.get('/path/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [[path]] = await db.execute(
      `SELECT id FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (!path) return res.status(404).json({ error: 'No path found for user' });

    const [steps] = await db.execute(
      `SELECT ps.id, m.name AS title, m.content AS content_link, ps.is_completed 
       FROM path_steps ps 
       JOIN modules m ON ps.module_id = m.id 
       WHERE ps.learning_path_id = ? 
       ORDER BY ps.order_num`,
      [path.id]
    );

    res.json(steps);
  } catch (err) {
    console.error('❌ Error in /path/:userId:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
