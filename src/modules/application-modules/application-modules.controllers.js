import * as services from './application-modules.services.js';
import asyncHandler from '../../utils/async-handler.js';

export const getAll = asyncHandler(async (req, res) => {
    const data = await services.getAll();
    res.json({ data });
});

export const getById = asyncHandler(async (req, res) => {
    const data = await services.getById(req.params.id);
    res.json({ data });
});

export const create = asyncHandler(async (req, res) => {
    const data = await services.create(req.body);
    res.status(201).json({ message: 'Module created successfully', data });
});

export const update = asyncHandler(async (req, res) => {
    const data = await services.update(req.params.id, req.body);
    res.json({ message: 'Module updated successfully', data });
});

export const remove = asyncHandler(async (req, res) => {
    await services.remove(req.params.id);
    res.json({ message: 'Module deleted successfully' });
});
