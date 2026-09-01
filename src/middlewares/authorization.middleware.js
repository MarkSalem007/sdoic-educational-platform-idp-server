import { AuthenticationError, AuthorizationError } from '../errors/index.js';

export const requireAuthentication = (req, res, next) => {
    if (!req.authentication) {
        throw new AuthenticationError('AUTH_TOKEN_REQUIRED','Authentication required.');
    }
    next();
};

export const requireSelf = (parameter = 'id') => {
    return (req, res, next) => {
        if (req.user.id !== req.params[parameter]) {
            throw new AuthorizationError('AUTH_FORBIDDEN','You are not allowed to access this resource.');
        }
        next();
    };
};

import { extractPermissions } from '../utils/permissions.js';

export const requirePermission = (permissionCode) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user) {
            throw new AuthorizationError('AUTH_FORBIDDEN', 'Access denied. No user found.');
        }

        const permissions = extractPermissions(user);

        if (permissions.includes('ALL_PERMISSIONS')) {
            return next();
        }

        if (permissions.includes(permissionCode)) {
            return next();
        }

        throw new AuthorizationError('AUTH_FORBIDDEN', 'Access denied. You do not have permission to perform this action.');
    };
};

export const requireAnyPermission = (permissionCodes) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user) {
            throw new AuthorizationError('AUTH_FORBIDDEN', 'Access denied. No user found.');
        }

        const permissions = extractPermissions(user);

        if (permissions.includes('ALL_PERMISSIONS')) {
            return next();
        }

        const hasPermission = permissionCodes.some(code => permissions.includes(code));
        
        if (hasPermission) {
            return next();
        }

        throw new AuthorizationError('AUTH_FORBIDDEN', 'Access denied. You do not have permission to perform this action.');
    };
};

export const requireSystemAdmin = (req, res, next) => {
    const user = req.user;
    
    if (!user) {
        throw new AuthorizationError('AUTH_FORBIDDEN', 'Access denied. No user found.');
    }

    const isSysAdmin = user.roleAssignments?.some(ra => 
        ra.role?.code === 'SYS_ADMIN' || 
        ra.role?.code === 'SYSTEM_ADMIN' || 
        ra.role?.name === 'System Administrator'
    );

    const permissions = extractPermissions(user);

    if (isSysAdmin || permissions.includes('ALL_PERMISSIONS')) {
        return next();
    }

    throw new AuthorizationError('AUTH_FORBIDDEN', 'Access denied. Only System Administrators can perform this action.');
};