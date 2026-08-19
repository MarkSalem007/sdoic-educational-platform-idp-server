import usersRoutes from '../modules/users/users.endpoints.js';
import authenticationRoutes from '../modules/authentication/authentication.endpoints.js';
import auditLogRoutes from '../modules/audit/audit.endpoints.js';
import officeRoutes from '../modules/offices/office.endpoints.js';
import profileRoutes from '../modules/profiles/profile.endpoints.js';
import twoFactorRoutes from '../modules/two-factor/two-factor.endpoints.js';
import applicationRoutes from '../modules/applications/application.endpoints.js';
import applicationModulesRoutes from '../modules/application-modules/application-modules.endpoints.js';
import institutionRoutes from '../modules/institutions/institution.endpoints.js';
import rolesRoutes from '../modules/roles/roles.endpoints.js';
import permissionsRoutes from '../modules/permissions/permissions.endpoints.js';

export default function routes(app) {
    app.use('/api/v1/users', usersRoutes);
    app.use('/api/v1/authentication', authenticationRoutes);
    app.use('/api/v1/audit-logs', auditLogRoutes);
    app.use('/api/v1/offices', officeRoutes);
    app.use('/api/v1/profiles', profileRoutes);
    app.use('/api/v1/two-factor', twoFactorRoutes);
    app.use('/api/v1/applications', applicationRoutes);
    app.use('/api/v1/application-modules', applicationModulesRoutes);
    app.use('/api/v1/institutions', institutionRoutes);
    app.use('/api/v1/roles', rolesRoutes);
    app.use('/api/v1/permissions', permissionsRoutes);
}