/**
 * More custom matchers for Jasmine.
 */

/**
 * Returns a definition of internal Backbone.Select events.
 *
 * @type {string[]}
 */
jasmine.getInternalBackboneSelectEvents = function () {
    return ["_selected", "_deselected"];
};


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
                result.message = "Expected spy " + actual.and.identity() + " not to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but it was.";
            } else {
                result.message = !actual.calls.any() ?
                                 "Expected spy " + actual.and.identity() + " to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but it was never called." :
                                 "Expected spy " + actual.and.identity() + " to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but actual calls were " + jasmine.pp( actual.calls.allArgs() ).replace( /^\[ | \]$/g, '' ) + '.';
            }

            return result;
        }
    };
};

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone.Select.
 *
 * Checks if the `actual`, a Jasmine spy, was called. **Is meant to be used for spies on `trigger` only**, which
 * receive the name of the triggered event as first argument.
 *
 * The check excludes calls which pass the name of an internal Backbone.Select event as first argument. Otherwise,
 * functionally identical to Jasmine's `.toHaveBeenCalled()` matcher.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalled_ignoringInternalEvents = function ( util, customEqualityTesters ) {

    return {
        compare: function ( actual ) {

            var callCount,
                detectedEventNames = [],
                result = {};

            if ( !jasmine.isSpy( actual ) )  throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );

            callCount = _.reduce( actual.calls.allArgs(), function ( callCount, args ) {
                var eventName = args[0];

                if ( !_.contains( jasmine.getInternalBackboneSelectEvents(), eventName ) ) {
                    callCount++;
                    detectedEventNames.push( eventName );
                }

                return callCount;
            }, 0 );

            result.pass = callCount > 0;

            if ( result.pass ) {
                result.message = "Expected spy " + actual.and.identity() + " not to have been called (not counting internal events), but it was called " + callCount + ( callCount === 1 ? " time." : " times." ) + "\n" +
                                 ( callCount === 1 ? "The event name has been: " : "The event names have been: " ) + '"' + detectedEventNames.join( '", "' ) + '"';
            } else {
                result.message = "Expected spy " + actual.and.identity() + " to have been called (not counting internal events), but it wasn't.";
            }

            return result;
        }
    };
};

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone. Excludes calls for any number of
 * specified events. Otherwise, functionally identical to Jasmine's `.toHaveBeenCalled()` matcher.
 *
 * The names of excluded events can be passed in as a sequence of string arguments, or as a single array, or as a
 * combination of both.
 *
 * Checks if the `actual`, a Jasmine spy, was called. **Is meant to be used for spies on `trigger` only**, which
 * receive the name of the triggered event as first argument.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalled_ignoringEvents = function ( util, customEqualityTesters ) {

    return {
        compare: function ( actual ) {

            var callCount,
                detectedEventNames = [],
                result = {},
                ignoredEvents = jasmine.util.argsToArray( arguments ).slice( 1 );

            if ( !ignoredEvents.length ) throw new Error( "The names of ignored events have not been passed in. Please specify the event names." );
            if ( !jasmine.isSpy( actual ) )  throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );

            ignoredEvents = _.flatten( ignoredEvents );

            callCount = _.reduce( actual.calls.allArgs(), function ( callCount, args ) {
                var eventName = args[0];

                if ( !_.contains( ignoredEvents, eventName ) ) {
                    callCount++;
                    detectedEventNames.push( eventName );
                }

                return callCount;
            }, 0 );

            result.pass = callCount > 0;

            if ( result.pass ) {
                result.message = "Expected spy " + actual.and.identity() + " not to have been called (not counting ignored events), but it was called " + callCount + ( callCount === 1 ? " time." : " times." ) + "\n" +
                                 ( callCount === 1 ? "The event name has been: " : "The event names have been: " ) + '"' + detectedEventNames.join( '", "' ) + '"';
            } else {
                result.message = "Expected spy " + actual.and.identity() + " to have been called (not counting ignored events), but it wasn't.";
            }

            return result;
        }
    };
};
