({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.trailing",
    exclude: [
        "jquery",
        "underscore",
        "backbone",
        "backbone.select"
    ],
    out: "../../output/parts/trailing-app.js"
})