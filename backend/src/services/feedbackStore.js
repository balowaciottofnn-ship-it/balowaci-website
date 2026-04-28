const fs = require('fs/promises');
const path = require('path');
const pool = require('../db/connection');

const dataDir = path.join(__dirname, '..', '..', 'data');
const feedbackFile = path.join(dataDir, 'feedback.json');

const columns = [
  'id',
  'visitor_name',
  'visitor_email',
  'visitor_phone',
  'first_impression',
  'unique_experience',
  'interest',
  'journey_thoughts',
  'target_customer',
  'problem_solved',
  'willingness_to_pay',
  'watch_value_estimate',
  'adoption_barriers',
  'must_have_features',
  'pilot_interest',
  'created_at'
];

async function ensureFileStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(feedbackFile);
  } catch (error) {
    await fs.writeFile(feedbackFile, '[]\n', 'utf8');
  }
}

async function readFileFeedback() {
  await ensureFileStore();
  const raw = await fs.readFile(feedbackFile, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeFileFeedback(items) {
  await ensureFileStore();
  await fs.writeFile(feedbackFile, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

function toRow(feedback, id) {
  return {
    id,
    visitor_name: feedback.visitorName,
    visitor_email: feedback.visitorEmail,
    visitor_phone: feedback.visitorPhone || '',
    first_impression: feedback.firstImpression,
    unique_experience: feedback.isUnique,
    interest: feedback.interests,
    journey_thoughts: feedback.journeyThoughts || '',
    target_customer: feedback.targetCustomer,
    problem_solved: feedback.problemSolved,
    willingness_to_pay: feedback.willingnessToPay,
    watch_value_estimate: feedback.watchValueEstimate,
    adoption_barriers: feedback.adoptionBarriers,
    must_have_features: feedback.mustHaveFeatures,
    pilot_interest: feedback.pilotInterest,
    created_at: new Date().toISOString()
  };
}

async function insertFeedback(feedback) {
  try {
    const query = `
      INSERT INTO feedback (
        visitor_name,
        visitor_email,
        visitor_phone,
        first_impression,
        unique_experience,
        interest,
        journey_thoughts,
        target_customer,
        problem_solved,
        willingness_to_pay,
        watch_value_estimate,
        adoption_barriers,
        must_have_features,
        pilot_interest
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [
      feedback.visitorName,
      feedback.visitorEmail,
      feedback.visitorPhone || '',
      feedback.firstImpression,
      feedback.isUnique,
      feedback.interests,
      feedback.journeyThoughts || '',
      feedback.targetCustomer,
      feedback.problemSolved,
      feedback.willingnessToPay,
      feedback.watchValueEstimate,
      feedback.adoptionBarriers,
      feedback.mustHaveFeatures,
      feedback.pilotInterest
    ]);

    return {
      storage: 'postgres',
      row: result.rows[0]
    };
  } catch (error) {
    const items = await readFileFeedback();
    const nextId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const row = toRow(feedback, nextId);
    items.unshift(row);
    await writeFileFeedback(items);

    return {
      storage: 'file',
      row: {
        id: row.id,
        created_at: row.created_at
      }
    };
  }
}

async function getAllFeedback(limit = 100) {
  try {
    const query = `
      SELECT ${columns.join(', ')}
      FROM feedback
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return {
      storage: 'postgres',
      rows: result.rows
    };
  } catch (error) {
    const items = await readFileFeedback();
    return {
      storage: 'file',
      rows: items.slice(0, limit)
    };
  }
}

function countSignals(rows, key, terms) {
  return rows.filter((row) => {
    const value = String(row[key] || '').toLowerCase();
    return terms.some((term) => value.includes(term));
  }).length;
}

async function getFeedbackStats() {
  const { storage, rows } = await getAllFeedback(10000);
  const lastSubmission = rows[0] ? rows[0].created_at : null;
  const investorReadyFeedback = rows.filter((row) => (
    row.visitor_name &&
    row.visitor_email &&
    row.target_customer &&
    row.problem_solved &&
    row.willingness_to_pay &&
    row.watch_value_estimate &&
    row.adoption_barriers &&
    row.must_have_features &&
    row.pilot_interest
  )).length;

  return {
    storage,
    stats: {
      total_feedback: rows.length,
      last_submission: lastSubmission,
      investor_ready_feedback: investorReadyFeedback,
      payment_signal_count: countSignals(rows, 'willingness_to_pay', ['yes', 'pay']),
      partnership_signal_count: countSignals(rows, 'pilot_interest', ['yes', 'recommend', 'partner', 'investor'])
    }
  };
}

module.exports = {
  columns,
  insertFeedback,
  getAllFeedback,
  getFeedbackStats
};
