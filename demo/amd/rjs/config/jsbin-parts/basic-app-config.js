({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.basic",
    exclude: [
        "jquery",
        "underscore",
        "backbone",
        "backbone.select"
    ],
    out: "../../output/parts/basic-app.js"
})