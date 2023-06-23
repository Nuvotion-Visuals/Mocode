const path = require('path');

const withTM = require("next-transpile-modules")([
  "codemirror"
]);

module.exports = withTM({
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve('./node_modules/react'),
    };

    const rule = config.module.rules
      .find(rule => rule.oneOf)
      .oneOf.find(
        r =>
          r.issuer && r.issuer.include && r.issuer.include.includes("_app")
      );
    if (rule) {
      rule.issuer.include = [
        rule.issuer.include,
        /[\\/]node_modules[\\/]codemirror[\\/]/
      ];
    }

    return config;
  }
});
