requirejs.config( {

    // Base URL: project root
    baseUrl: '../../',

    paths: {
        'jquery': 'demo/bower_demo_components/jquery/dist/jquery',
        'underscore': 'bower_components/underscore/underscore',
        'backbone': 'bower_components/backbone/backbone',

        'backbone.select': 'dist/backbone.select',

        'local.basic': 'demo/amd/basic',
        'local.baskets': 'demo/amd/baskets',
        'local.focus-exclusive': 'demo/amd/focus-exclusive',
        'local.focus-label': 'demo/amd/focus-label',
        'local.trailing': 'demo/amd/trailing'
    },

    shim: {
        'jquery': {
            exports: "jQuery"
        }
    }

} );
