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
 * @name jasmine.Matchers#toHaveBeenCalledWithInitial
 * @function
 * @param   {...*} initialCallArguments
 * @returns {boolean}
 */

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
 * @name jasmine.Matchers#toHaveBeenCalled_ignoringInternalEvents
 * @function
 * @returns {boolean}
 */

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

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.getInternalBackboneSelectEvents(); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount > 0; },
        msgAction: "to have been called (not counting internal events)",
        showActualWhenNegated: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalled_ignoringInternalEventsAnd
 * @function
 * @param   {...(string|string[])} ignoredEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone.Select. Just like
 * toHaveBeenCalled_ignoringInternalEvents, but allows to add other event names to be ignored.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalled_ignoringInternalEventsAnd = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.getInternalBackboneSelectEvents().concat( jasmine.util.argsToArray( arguments ).slice( 1 ) ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount > 0; },
        msgAction: "to have been called (not counting internal and ignored events)",
        showActualWhenNegated: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledOnce_ignoringInternalEvents
 * @function
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone.Select. Just like
 * toHaveBeenCalled_ignoringInternalEvents, but tests for exactly one call.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledOnce_ignoringInternalEvents = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.getInternalBackboneSelectEvents(); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount === 1; },
        msgAction: "to have been called once (not counting internal events)",
        showActual: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledTwice_ignoringInternalEvents
 * @function
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone.Select. Just like
 * toHaveBeenCalled_ignoringInternalEvents, but tests for exactly two calls.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledTwice_ignoringInternalEvents = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.getInternalBackboneSelectEvents(); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount === 2; },
        msgAction: "to have been called twice (not counting internal events)",
        showActual: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledOnce_ignoringInternalEventsAnd
 * @function
 * @param   {...(string|string[])} ignoredEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone.Select. Just like
 * toHaveBeenCalled_ignoringInternalEventsAnd, but tests for exactly one call.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledOnce_ignoringInternalEventsAnd = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.getInternalBackboneSelectEvents().concat( jasmine.util.argsToArray( arguments ).slice( 1 ) ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount === 1; },
        msgAction: "to have been called once (not counting internal and ignored events)",
        showActual: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledTwice_ignoringInternalEventsAnd
 * @function
 * @param   {...(string|string[])} ignoredEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone.Select. Just like
 * toHaveBeenCalled_ignoringInternalEventsAnd, but tests for exactly two calls.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledTwice_ignoringInternalEventsAnd = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.getInternalBackboneSelectEvents().concat( jasmine.util.argsToArray( arguments ).slice( 1 ) ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount === 2; },
        msgAction: "to have been called twice (not counting internal and ignored events)",
        showActual: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalled_ignoringEvents
 * @function
 * @param   {...(string|string[])} ignoredEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

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

    return customToHaveBeenCalled( {
        getIgnoredEvents: function () { return jasmine.util.argsToArray( arguments ).slice( 1 ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount > 0; },
        msgAction: "to have been called (not counting ignored events)",
        showActualWhenNegated: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledForEvents
 * @function
 * @param   {...(string|string[])} exclusiveEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone. Only examines calls for specified events.
 * Otherwise, functionally identical to Jasmine's `.toHaveBeenCalled()` matcher.
 *
 * The names of the exclusive events can be passed in as a sequence of string arguments, or as a single array, or as a
 * combination of both.
 *
 * Checks if the `actual`, a Jasmine spy, was called. **Is meant to be used for spies on `trigger` only**, which
 * receive the name of the triggered event as first argument.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledForEvents = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getExclusiveEvents: function () { return jasmine.util.argsToArray( arguments ).slice( 1 ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount > 0; },
        msgAction: "to have been called (only counting the specified events)",
        showActualWhenNegated: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledOnceForEvents
 * @function
 * @param   {...(string|string[])} exclusiveEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone. Just like toHaveBeenCalledForEvents, but
 * tests for exactly one call.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledOnceForEvents = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getExclusiveEvents: function () { return jasmine.util.argsToArray( arguments ).slice( 1 ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount === 1; },
        msgAction: "to have been called once (only counting the specified events)",
        showActual: true
    } );

};

/**
 * @name jasmine.Matchers#toHaveBeenCalledTwiceForEvents
 * @function
 * @param   {...(string|string[])} exclusiveEvents  a sequence of string arguments, or a single array, or a combination of both
 * @returns {boolean}
 */

/**
 * Matcher specifically for `trigger` event spies, in the context of Backbone. Just like toHaveBeenCalledForEvents, but
 * tests for exactly two calls.
 */
jasmine._addTheseCustomMatchers.toHaveBeenCalledTwiceForEvents = function ( util, customEqualityTesters ) {

    return customToHaveBeenCalled( {
        getExclusiveEvents: function () { return jasmine.util.argsToArray( arguments ).slice( 1 ); },
        checkFilteredCallCount: function ( filteredCallCount ) { return filteredCallCount === 2; },
        msgAction: "to have been called twice (only counting the specified events)",
        showActual: true
    } );

};

/**
 * @param {Object}          config
 * @param {function}        config.checkFilteredCallCount
 * @param {string}          config.msgAction
 * @param {boolean}         [config.showActual=false]
 * @param {boolean}         [config.showActualWhenNegated=false]
 * @param {function}        [config.getIgnoredEvents]
 * @param {function}        [config.getExclusiveEvents]
 * @returns {Object}
 */
function customToHaveBeenCalled ( config ) {

    return {
        compare: function ( actual ) {

            var callCount, msgActualCalls,

                ignoredEvents = config.getIgnoredEvents && config.getIgnoredEvents.apply( null, arguments ) || [],
                exclusiveEvents = config.getExclusiveEvents && config.getExclusiveEvents.apply( null, arguments ) || [],

                detectedEventNames = [],
                result = {};

            // if ( !_.isArray( ignoredEvents.length ) throw new Error( "The names of ignored events have not been passed in. Please specify the event names." );
            if ( !jasmine.isSpy( actual ) )  throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );

            ignoredEvents = _.flatten( ignoredEvents );
            exclusiveEvents = _.flatten( exclusiveEvents );

            callCount = _.reduce( actual.calls.allArgs(), function ( callCount, args ) {
                var eventName = args[0];

                if ( !_.contains( ignoredEvents, eventName ) && ( !exclusiveEvents.length || _.contains( exclusiveEvents, eventName ) ) ) {
                    callCount++;
                    detectedEventNames.push( eventName );
                }

                return callCount;
            }, 0 );

            result.pass = config.checkFilteredCallCount( callCount );

            msgActualCalls = callCount === 0 ?
                             "it was not called." :
                             "it was called " + callCount + ( callCount === 1 ? " time." : " times." ) + "\n" +
                             ( callCount === 1 ? "The event name has been: " : "The event names have been: " ) + '"' + detectedEventNames.join( '", "' ) + '"';

            if ( result.pass ) {
                result.message = "Expected spy " + actual.and.identity() + " not " + config.msgAction + ", but " + ( config.showActualWhenNegated ? msgActualCalls : "it was." );
            } else {
                result.message = "Expected spy " + actual.and.identity() + " " + config.msgAction + ", but " + ( config.showActual ? msgActualCalls : "it wasn't." );
            }

            return result;
        }
    };

}
