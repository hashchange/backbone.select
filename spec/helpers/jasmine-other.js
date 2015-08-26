/**
 * More custom matchers for Jasmine.
 */

if ( ! jasmine._addTheseCustomMatchers ) jasmine._addTheseCustomMatchers = {};

/**
 * Matcher that checks to see if the actual, a Jasmine spy, was called with parameters beginning with a specific set.
 *
 * @example
 *
 *     spyOn(obj, "foo");
 *     obj.foo(1, 2, 3);
 *     expect(obj.foo).toHaveBeenCalledWithInitial(1, 2);     // => true
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledWithInitial = function ( util, customEqualityTesters ) {

    return {
        compare: function ( actual, expected ) {

            var result = {},
                expectedArgs = jasmine.util.argsToArray( arguments ).slice( 1 );

            if ( !jasmine.isSpy( actual ) ) {
                throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );
            }

            var actualInitial = _.map( actual.calls.allArgs(), function ( args ) {
                return args.slice( 0, expectedArgs.length );
            } );
            result.pass = util.contains( actualInitial, expectedArgs, customEqualityTesters );

            if ( result.pass ) {
                result.message = !actual.calls.any() ?
                                 "Expected spy " + actual.and.identity() + " to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but it was never called." :
                                 "Expected spy " + actual.and.identity() + " to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but actual calls were " + jasmine.pp( actual.calls.allArgs() ).replace( /^\[ | \]$/g, '' ) + '.';
            } else {
                result.message = "Expected spy " + actual.and.identity() + " not to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but it was.";
            }

            return result;
        }
    };
};
