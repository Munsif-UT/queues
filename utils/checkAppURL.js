export const checkAppURL = (NODE_ENV) => {
    switch (NODE_ENV) {
        case 'development':
            return 'https://app.inventooly.com/';
        default:
            return 'https://app.inventooly.com/';
    }
}