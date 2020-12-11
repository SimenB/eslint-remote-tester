const baseConfig = require('../base.config');

module.exports = {
    ...baseConfig,
    eslintrc: {
        ...baseConfig.eslintrc,
        extensions: ['js', 'jsx'],
        parser: undefined,
        extends: ['eslint:all'],
    },
};
