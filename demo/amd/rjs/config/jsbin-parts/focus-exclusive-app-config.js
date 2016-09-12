({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.focus-exclusive",
    exclude: [
        "jquery",
        "underscore",
        "backbone",
        "backbone.select"
    ],
    out: "../../output/parts/focus-exclusive-app.js"
})