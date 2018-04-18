module.exports = {
    "extends": "airbnb-base",
    "parser": "babel-eslint",
    "rules": {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "padded-blocks": ["error", {
        "classes": "always",
        "switches": "never",
        "blocks": "never",
      }],
      "consistent-return" : 0,
      "no-restricted-syntax": 0,
      "no-await-in-loop": 0,
    },
};
