const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "gsap/CustomEase": path.resolve(__dirname, "node_modules/gsap/CustomEase.js"),
    }
  },
};
