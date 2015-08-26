// --- Other Utilities ---

/**
 * _.extend as in Underscore 1.6.0, copied verbatim. Used to work around the modified, shallow _.extend in
 * Underscore 1.7.0.
 */
function deepExtend ( obj ) {
    _.each( Array.prototype.slice.call( arguments, 1 ), function ( source ) {
        if ( source ) {
            for ( var prop in source ) {
                obj[prop] = source[prop];
            }
        }
    } );
    return obj;
}
