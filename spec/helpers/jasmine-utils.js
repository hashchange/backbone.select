/**
 * Utilities and custom matchers for Jasmine.
 *
 * The matchers are not provided by jasmine-expect (aka jasmine-matchers), either.
 */

/**
 * Utilities
 */

function getJasmineHtmlElements () {
    // Works in IE8, too.
    return document.querySelectorAll( '[class*="jasmine"], [class*="Jasmine"]' );
}

/**
 * Hides Jasmine output.
 *
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * hideJasmineOutput() must be called before every test which requires it, if Jasmine output must be truly hidden.
 * Place it in a beforeEach, NOT in a beforeAll!
 *
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * The reason is this. Jasmine injects a jasmine_html-reporter div at the bottom of the document. That div is set to
 * `display: block` each time a Jasmine test runs. That is known to have caused trouble in iOS, where the div continues
 * to occupy a horizontal width of 8px in the document. For some reason, the body width is reduced by that amount.
 *
 * Incidentally, this bug does NOT occur when the affected suite is run in focus mode ("fdescribe"). Then, the `display:
 * block` setting is not renewed before each test, and a display: none set in a beforeAll survives. That way, the cause
 * for a failing test can become even more difficult to track down.
 *
 * In a nutshell: When hiding Jasmine output, hide it before each individual test - either in the test itself, or in a
 * beforeEach. Never rely on beforeAll for this.
 */
function hideJasmineOutput () {
    var i,
        els = getJasmineHtmlElements(),
        length = els.length;

    for ( i = 0; i < length; i++ )  els[i].style.display = "none";
}

function showJasmineOutput () {
    var i,
        els = getJasmineHtmlElements(),
        length = els.length;

    for ( i = 0; i < length; i++ )  els[i].style.display = "";
}


/**
 * Jasmine output customization: limiting nesting depth.
 *
 * Intended to keep the massive screen dumps for nested objects in check.
 */
var _jasmine_default_MAX_PRETTY_PRINT_DEPTH = jasmine.MAX_PRETTY_PRINT_DEPTH,
    _jasmine_current_MAX_PRETTY_PRINT_DEPTH;

function limitJasmineRecursiveScreenOutput ( maxDepth ) {
    maxDepth || ( maxDepth = 3 );
    jasmine.MAX_PRETTY_PRINT_DEPTH = maxDepth;
}

function restoreJasmineRecursiveScreenOutput () {
    var origDepth = _jasmine_current_MAX_PRETTY_PRINT_DEPTH !== undefined ? _jasmine_current_MAX_PRETTY_PRINT_DEPTH : _jasmine_default_MAX_PRETTY_PRINT_DEPTH;
    _jasmine_current_MAX_PRETTY_PRINT_DEPTH = undefined;
    jasmine.MAX_PRETTY_PRINT_DEPTH = origDepth;
}


/**
 * Custom matchers for Jasmine.
 *
 * Not provided by jasmine-expect (aka jasmine-matchers), either.
 */

// Making sure we have a private object to collect custom matchers in. We attach it to the jasmine namespace because we
// know for sure it is available.
//
// It is best to keep collection and registration separate. Custom matchers are registered with Jasmine in a global
// beforeEach call, which should only happen once. (That is done here: we call the forEach below.) But other components
// still have the chance to jump on the bandwagon and add their own custom matchers, simply by attaching them to the
// collection object.
if ( ! jasmine._addTheseCustomMatchers ) jasmine._addTheseCustomMatchers = {};

/**
 * @name jasmine.Matchers#toBeAtLeast
 * @function
 * @param   {number} floor
 * @returns {boolean}
 */

/** @function */
jasmine._addTheseCustomMatchers.toBeAtLeast = function ( util, customEqualityTesters ) {
    return {
        compare: function ( actual, expected ) {
            var result = {};
            result.pass = util.equals( actual >= expected, true, customEqualityTesters );
            if ( result.pass ) {
                result.message = "Expected " + actual + " to be less than " + expected;
            } else {
                result.message = "Expected " + actual + " to be at least " + expected;
            }
            return result;
        }
    }
};

/**
 * @name jasmine.Matchers#toBeAtMost
 * @function
 * @param   {number} ceil
 * @returns {boolean}
 */

/** @function */
jasmine._addTheseCustomMatchers.toBeAtMost = function ( util, customEqualityTesters ) {
    return {
        compare: function ( actual, expected ) {
            var result = {};
            result.pass = util.equals( actual <= expected, true, customEqualityTesters );
            if ( result.pass ) {
                result.message = "Expected " + actual + " to be greater than " + expected;
            } else {
                result.message = "Expected " + actual + " to be at most " + expected;
            }
            return result;
        }
    }
};

/**
 * @name jasmine.Matchers#toHaveBeenCalledOnce
 * @function
 * @returns {boolean}
 */

/** @function */
jasmine._addTheseCustomMatchers.toHaveBeenCalledOnce = function ( util, customEqualityTesters ) {
    return {
        compare: function ( actual ) {
            var result = {},
                callCount;

            if ( !jasmine.isSpy( actual ) ) {
                throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );
            }

            callCount = actual.calls.count();
            result.pass = util.equals( callCount === 1, true, customEqualityTesters );

            result.message = "Expected spy " + actual.and.identity();
            if ( result.pass ) {
                result.message += " not to have been called once, but it was.";
            } else {
                result.message += " to have been called once, but it was called " + callCount + " times.";
            }
            return result;
        }
    }
};

/**
 * @name jasmine.Matchers#toHaveBeenCalledTwice
 * @returns {boolean}
 */

/** @function */
jasmine._addTheseCustomMatchers.toHaveBeenCalledTwice = function ( util, customEqualityTesters ) {
    return {
        compare: function ( actual ) {
            var result = {},
                callCount;

            if ( !jasmine.isSpy( actual ) ) {
                throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );
            }

            callCount = actual.calls.count();
            result.pass = util.equals( callCount === 2, true, customEqualityTesters );

            result.message = "Expected spy " + actual.and.identity();
            if ( result.pass ) {
                result.message += " not to have been called twice, but it was.";
            } else {
                result.message += " to have been called twice, but it was called " + callCount + " times.";
            }
            return result;
        }
    }
};

/**
 * @name jasmine.Matchers#toHaveBeenCalledThrice
 * @returns {boolean}
 */

/** @function */
jasmine._addTheseCustomMatchers.toHaveBeenCalledThrice = function ( util, customEqualityTesters ) {
    return {
        compare: function ( actual ) {
            var result = {},
                callCount;

            if ( !jasmine.isSpy( actual ) ) {
                throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );
            }

            callCount = actual.calls.count();
            result.pass = util.equals( callCount === 3, true, customEqualityTesters );

            result.message = "Expected spy " + actual.and.identity();
            if ( result.pass ) {
                result.message += " not to have been called three times, but it was.";
            } else {
                result.message += " to have been called three times, but it was called " + callCount + " times.";
            }
            return result;
        }
    }
};

/**
 * @name jasmine.Matchers#toHaveCallCount
 * @function
 * @param   {number} expectedCallCount
 * @returns {boolean}
 */

/** @function */
jasmine._addTheseCustomMatchers.toHaveCallCount = function ( util, customEqualityTesters ) {
    return {
        compare: function ( actual, expected ) {
            var result = {},
                callCount;

            if ( !jasmine.isSpy( actual ) ) {
                throw new Error( 'Expected a spy, but got ' + jasmine.pp( actual ) + '.' );
            }

            callCount = actual.calls.count();
            result.pass = util.equals( callCount === expected, true, customEqualityTesters );

            result.message = "Expected spy " + actual.and.identity();
            if ( result.pass ) {
                result.message += " not to have been called " + expected + " times, but it was.";
            } else {
                result.message += " to have been called " + expected + " times, but it was called " + callCount + " times.";
            }
            return result;
        }
    }
};

beforeEach( function () {

    // When beforeEach is called outside of a `describe` scope, the matchers are available globally.
    // See http://stackoverflow.com/a/11942151/508355

    jasmine.addMatchers( jasmine._addTheseCustomMatchers );

} );
