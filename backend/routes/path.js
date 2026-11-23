const express = require('express');
const db = require('../db');
const router = express.Router();
// Get all available learning goals
router.get('/goals', async (req, res) => {
  try {
    const [goals] = await db.execute(
      'SELECT id, name, description FROM goals ORDER BY id'
    );

    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
});
router.post('/generate', async (req, res) => {
  try {
    const userId = Number(req.body.userId);
    const goalId = Number(req.body.goalId);

    if (!Number.isInteger(userId) || userId <= 0 ||
        !Number.isInteger(goalId) || goalId <= 0) {
      return res.status(400).json({
        error: 'Valid user ID and goal ID are required'
      });
    }

    // Confirm the user exists
    const [users] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get modules belonging to the selected goal
    const [modules] = await db.execute(
      `SELECT m.id
       FROM modules m
       INNER JOIN skills s ON m.skill_id = s.id
       WHERE s.goal_id = ?
       ORDER BY m.id`,
      [goalId]
    );

    if (modules.length === 0) {
      return res.status(404).json({
        error: 'No modules found for selected goal'
      });
    }

    // Create the learning path
    const [pathResult] = await db.execute(
      'INSERT INTO learning_paths (user_id, goal_id) VALUES (?, ?)',
      [userId, goalId]
    );

    const learningPathId = pathResult.insertId;

    // Add modules to the path
    for (let i = 0; i < modules.length; i++) {
      await db.execute(
        `INSERT INTO path_steps
         (learning_path_id, module_id, is_completed, order_num)
         VALUES (?, ?, 0, ?)`,
        [learningPathId, modules[i].id, i + 1]
      );
    }

    await db.execute(
      'UPDATE users SET has_selected_goal = TRUE WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'Path generated successfully',
      learningPathId,
      moduleCount: modules.length
    });

  } catch (err) {
    console.error('Error generating path:', err);
    res.status(500).json({
      error: 'Failed to generate path'
    });
  }
});

// Toggle module completion
router.post('/toggle', async (req, res) => {
  try {
    const userId = Number(req.body.userId);
    const moduleId = Number(req.body.moduleId);

    if (!Number.isInteger(userId) || userId <= 0 ||
        !Number.isInteger(moduleId) || moduleId <= 0) {
      return res.status(400).json({
        error: 'Valid user ID and module ID are required'
      });
    }

    const [paths] = await db.execute(
      `SELECT id
       FROM learning_paths
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [userId]
    );

    if (paths.length === 0) {
      return res.status(404).json({
        error: 'No learning path found'
      });
    }

    const learningPathId = paths[0].id;

    const [steps] = await db.execute(
      `SELECT id, is_completed
       FROM path_steps
       WHERE learning_path_id = ? AND module_id = ?`,
      [learningPathId, moduleId]
    );

    if (steps.length === 0) {
      return res.status(404).json({
        error: 'Module not found in this learning path'
      });
    }

    const newValue = steps[0].is_completed ? 0 : 1;

    await db.execute(
      `UPDATE path_steps
       SET is_completed = ?
       WHERE id = ?`,
      [newValue, steps[0].id]
    );

    res.json({
      message: 'Status updated',
      is_completed: Boolean(newValue)
    });

  } catch (err) {
    console.error('Error toggling module:', err);
    res.status(500).json({
      error: 'Could not update module status'
    });
  }
});

// Get the latest learning path for a user
router.get('/path/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [paths] = await db.execute(
      `SELECT id
       FROM learning_paths
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [userId]
    );

    if (paths.length === 0) {
      return res.status(404).json({
        error: 'No learning path found for user'
      });
    }

    const [steps] = await db.execute(
      `SELECT
         ps.id,
         m.id AS module_id,
         m.name AS title,
         m.content AS content_link,
         ps.is_completed
       FROM path_steps ps
       INNER JOIN modules m ON ps.module_id = m.id
       WHERE ps.learning_path_id = ?
       ORDER BY ps.order_num`,
      [paths[0].id]
    );

    res.json(steps);

  } catch (err) {
    console.error('Error loading learning path:', err);
    res.status(500).json({
      error: 'Could not load learning path'
    });
  }
});

module.exports = router;