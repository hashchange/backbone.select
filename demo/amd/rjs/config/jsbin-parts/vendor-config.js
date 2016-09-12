({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.basic",
    include: ["local.baskets", "local.focus-exclusive", "local.focus-label", "local.trailing"],
    excludeShallow: [
        "local.basic",
        "local.baskets",
        "local.focus-exclusive",
        "local.focus-label",
        "local.trailing"
    ],
    out: "../../output/parts/vendor.js"
})