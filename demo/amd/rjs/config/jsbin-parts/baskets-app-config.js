({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.baskets",
    exclude: [
        "jquery",
        "underscore",
        "backbone",
        "backbone.select"
    ],
    out: "../../output/parts/baskets-app.js"
})