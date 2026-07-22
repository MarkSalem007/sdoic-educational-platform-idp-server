import * as profileService from './profile.services.js';
import {
    asyncHandler,
    successResponse,
    toISOString,
    withTransaction
} from '../../utils/index.js';
import { validateUpdateProfile } from '../../dto/profile/update-profile.dto.js';

export const getProfile = asyncHandler(async (req, res) => {

    const profile =
        await profileService.getProfile({

            authentication: req.authentication

        });

    return res.status(200).json(

        successResponse({

            message: 'Profile retrieved successfully.',

            data: profile,

            requestId: req.requestId,

            timestamp: toISOString()

        })

    );

});

export const updateProfile = asyncHandler(async (req, res) => {

    const data =
        validateUpdateProfile(req.body);

    const profile =
        await withTransaction(async (tx) =>

            profileService.updateProfile({

                tx,

                authentication: req.authentication,

                data

            })

        );

    return res.status(200).json(

        successResponse({

            message: 'Profile updated successfully.',

            data: profile,

            requestId: req.requestId,

            timestamp: toISOString()

        })

    );

});

export const uploadAvatar = asyncHandler(async(req, res) => {
    const profile = await profileService.uploadAvatar({
        authentication: req.authentication,
        file: req.file
    })

    return res.status(200).json(
        successResponse({
            message: 'Avatar uploaded successfully',
            data: profile,
            requestId: req.requestId,
            timestamp: toISOString()
        })
    )
});