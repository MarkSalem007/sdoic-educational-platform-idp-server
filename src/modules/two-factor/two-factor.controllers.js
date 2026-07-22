import * as twoFactorService from './two-factor.services.js';
import {
    asyncHandler,
    successResponse,
    toISOString
} from '../../utils/index.js';
import { validateVerifySetup } from '../../dto/two-factor/verify-setup.dto.js';
import { validateDisable } from '../../dto/two-factor/disable-two-factor.dto.js';

export const setup = asyncHandler(async (req, res) => {
    const result = await twoFactorService.setup({
        authentication: req.authentication
    });

    return res.status(200).json(
        successResponse({
            message: 'Authenticator Setup Created.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString(new Date())
        })
    );
});

export const verifySetup = asyncHandler(async (req, res) => {
    const data = validateVerifySetup(req.body);

    const result = await twoFactorService.verifySetUp({
        authentication: req.authentication,
        token: data.token
    });

    return res.status(200).json(
        successResponse({
            message: 'Two-Factor Authentication enabled successfully.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString(new Date())
        })
    );
});

export const disable = asyncHandler(async (req, res) => {

    const data = validateDisable(req.body);

    console.log({
        data,
        reqBody: req.body,
        reqAuthentication: req.authentication
    });
    const result = await twoFactorService.disable({
        authentication: req.authentication,
        token: data.token,
        password: data.password,
        context: req.context
    });

    return res.status(200).json(
        successResponse({
            message: 'Two-Factor Authentication disabled successfully.',
            data: result,
            requestId: req.requestId,
            timestamp: toISOString(new Date())
        })
    );
});