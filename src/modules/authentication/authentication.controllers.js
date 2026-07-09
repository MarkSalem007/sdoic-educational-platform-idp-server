import * as authenticationService from './authentication.services.js';
import { validateLogin } from '../../dto/authentication/login.dto.js';
import { asyncHandler, successResponse, toISOString } from '../../utils/index.js';

export const login = asyncHandler(async (req, res) => {
    const data = validateLogin(req.body);
    const result = await authenticationService.login({ data, context: req.context });

    return res.status(200).json(
        successResponse({
            message: 'Login successful.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});

export const me = asyncHandler(async (req, res) => {
    const data = await authenticationService.me({ authentication: req.authentication });

    res.json(
        successResponse({
            message: 'Authenticated User retrieved successfully',
            data,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    );
});
