import { Router } from 'express';
import { getDb } from '../db/connect.js';
import { ObjectId } from 'mongodb';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required: [firstName, lastName, email, favoriteColor, birthday]
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         favoriteColor:
 *           type: string
 *         birthday:
 *           type: string
 *           format: date
 */

/**
 * @openapi
 * /contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: List of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *   post:
 *     summary: Create a contact
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Created contact
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 */

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     summary: Get a contact by id
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A contact
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       404: { description: Not found }
 *   put:
 *     summary: Replace a contact by id
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       204: { description: Updated (no content) }
 *       404: { description: Not found }
 *   delete:
 *     summary: Delete a contact by id
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */

// --- validation helper ---
const validateContact = (body) => {
  const { firstName, lastName, email, favoriteColor, birthday } = body || {};
  if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
    const err = new Error('All fields are required: firstName, lastName, email, favoriteColor, birthday');
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }
};

// GET all
router.get('/', async (req, res, next) => {
  try {
    const contacts = await getDb().collection('contacts').find({}).toArray();
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
});

// GET one by id
router.get('/:id', async (req, res, next) => {
  try {
    const _id = new ObjectId(req.params.id);
    const contact = await getDb().collection('contacts').findOne({ _id });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(contact);
  } catch (err) {
    if (err.name === 'BSONError') {
      return res.status(400).json({ message: 'Invalid id format' });
    }
    next(err);
  }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    validateContact(req.body);
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    const result = await getDb().collection('contacts').insertOne({
      firstName, lastName, email, favoriteColor, birthday
    });

    const created = await getDb().collection('contacts').findOne({ _id: result.insertedId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT replace
router.put('/:id', async (req, res, next) => {
  try {
    validateContact(req.body);
    const _id = new ObjectId(req.params.id);
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    const result = await getDb().collection('contacts').replaceOne(
      { _id },
      { firstName, lastName, email, favoriteColor, birthday }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(204).send();
  } catch (err) {
    if (err.name === 'BSONError') return res.status(400).json({ message: 'Invalid id format' });
    next(err);
  }
});

// DELETE remove
router.delete('/:id', async (req, res, next) => {
  try {
    const _id = new ObjectId(req.params.id);
    const result = await getDb().collection('contacts').deleteOne({ _id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(204).send();
  } catch (err) {
    if (err.name === 'BSONError') return res.status(400).json({ message: 'Invalid id format' });
    next(err);
  }
});

export default router;
