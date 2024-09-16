const express = require('express');

const authRouter = require('./authentication');
const adUserRouter = require('./user');
const companyRouter = require('./company');
const customerRouter = require('./customer');
const categoryRouter = require('./category');
const permissionRouter = require('./permission');
const recentActivityRouter = require('./recentActivity');
const dashboardUpdatesRouter = require('./dashboardUpdates');
const licenseRouter = require('./license');
const licenseNewRouter = require('./licenseNew');
const licenseFileRouter = require('./licenseFile');
const licenseManufacturerRouter = require('./licenseManufacturers');
const maintenanceContractsRouter = require('./maintenanceContracts');
const imageUploaderRouter = require('./imageUploader');
const notificationRouter = require('./notification');

function setupRouters(app) {
    const apiRouter = express.Router();
    apiRouter.use('/auth', authRouter);
    apiRouter.use('/admin-user', adUserRouter);
    apiRouter.use('/company', companyRouter);
    apiRouter.use('/customer', customerRouter);
    apiRouter.use('/category', categoryRouter);
    apiRouter.use('/permission', permissionRouter);
    apiRouter.use('/recent-activity', recentActivityRouter);
    apiRouter.use('/dashboard-updates', dashboardUpdatesRouter);
    apiRouter.use('/license', licenseRouter);
    apiRouter.use('/license-new', licenseNewRouter);
    apiRouter.use('/license-file', licenseFileRouter);
    apiRouter.use('/manufacturer', licenseManufacturerRouter);
    apiRouter.use('/maintenance-contracts', maintenanceContractsRouter);
    apiRouter.use('/file-server/upload', imageUploaderRouter);
    apiRouter.use('/notification', notificationRouter);

    app.use('/api-server', apiRouter);
}

module.exports = {
    setupRouters,
};
