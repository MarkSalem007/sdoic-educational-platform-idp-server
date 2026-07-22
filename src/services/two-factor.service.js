import {
    generateBackupCodes,
    hashBackupCode
} from '../utils/two-factor.js';

export const createBackupCodes = async ({ tx, twoFactorId }) => {
    const codes = generateBackupCodes();

    await Promise.all( codes.map(code => twoFactorRepository.createBackupCode({
                tx,
                data: {
                    twoFactorId,
                    codeHash: hashBackupCode(code)
                }
            })
        )
    );
    return codes;
};