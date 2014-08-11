;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'underscore' ),
            require( 'backbone' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'underscore',
            'backbone'
        ], factory );

    }
}( this, function ( _, Backbone ) {
    "use strict";

    // @include backbone.select.js
    return Backbone.Select;

} ));

