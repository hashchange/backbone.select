/**
 * Fixture used when testing the automatic creation of Select.Me models in a collection.
 *
 * Fixture object:
 *
 * @typedef {Object} AutoCreationFixture
 *
 * @property {Object[]|undefined}         attributeSets   the attribute sets underlying the fixture, as passed in
 * @property {Object[]|undefined}         modelDataSets   the actual model data sets, calculated, differ from attribute
 *                                                        sets when testing parse
 * @property {Backbone.Model[]|undefined} models          an alternative to attributeSets, used when models are passe
 *                                                        in
 * @property {Function}                   Collection      the collection class to use, derived from the base class but
 *                                                        modified as appropriate when the fixture is applied
 * @property {Function}                   modelTemplate   the model type the collection should use when generating
 *                                                        models from data. When set to Backbone.Model, the
 *                                                        collection.model property remains undefined.
 * @property {string}                     creationMethod  the operation which should create the models: "new" (models
 *                                                        are created during instantiation), "add", "remove", "reset"
 * @property {Object}                     options         the options applied during the operation which creates the
 *                                                        models
 *
 * @property {Function} createPopulatedCollection         predefined function; do not set this property. Creates (and
 *                                                        returns) the collection, and populates it according to the
 *                                                        chosen method.
 */

/**
 *
 * @param {(Backbone.Model[]|Object[])} modelsOrAttributeSets  sets of models, or of attributes which the collection will
 *                                                             have to generate models from
 * @constructor
 */
function AutoCreationFixture( modelsOrAttributeSets ) {
    if ( _.some( modelsOrAttributeSets, function ( item ) { return item && item instanceof Backbone.Model; } ) ) {
        this.models = modelsOrAttributeSets;
    } else {
        this.attributeSets = modelsOrAttributeSets;
    }

    this.options = {};
}

AutoCreationFixture.prototype.setBaseCollectionType = function ( collectionType ) {
    this.Collection = collectionType;
};

AutoCreationFixture.prototype.createPopulatedCollection = function ( modelData, instantiationOptions ) {
    var collection;

    if ( this.creationMethod === "new" ) {
        collection = new this.Collection( modelData, _.extend( {}, this.options, instantiationOptions ) );
    } else {
        collection = new this.Collection( null, instantiationOptions );
        collection[this.creationMethod]( modelData, this.options );
    }

    return collection;
};

/**
 * -------------------------------------------------------------------------------------------------------------
 */


/**
 * Creates and configures optOut and optIn hashes on an object (which can also be a configuration function).
 *
 * Accepts a hash with optOut and optIn properties, which are each set to a test label (an arbitrary name), or an array
 * of such labels.
 *
 * Alternatively, if the configuration should run the default set of tests, just pass in the string "default" instead
 * of a hash. (That runs a test set without the tests which require an opt-in, and including tests which would otherwise
 * require an opt-out).
 *
 * @param   {(string|TestPicks)} picks
 * @param   {Object}             configuration
 * @returns {Object}
 */
function pickTests ( picks, configuration ) {
    var optOut, optIn;

    if ( !configuration.optOut ) configuration.optOut = {};
    if ( !configuration.optIn ) configuration.optIn = {};

    if ( picks !== "default" ) {
        optOut = _.isArray( picks.optOut ) ? picks.optOut : [ picks.optOut ];
        optIn = _.isArray( picks.optIn ) ? picks.optIn : [ picks.optIn ];

        _.each( optOut, function ( name ) { configuration.optOut[name] = true; } );
        _.each( optIn, function ( name ) { configuration.optIn[name] = true; } );
    }

    return configuration;
}

function hasOptedIn ( configuration, testLabel ) {
    return configuration.optIn && configuration.optIn[testLabel];
}

function hasOptedOut ( configuration, testLabel ) {
    return configuration.optOut && configuration.optOut[testLabel];
}

/**
 * @typedef  {Object} TestPicks
 *
 * @property {(string|string[]|undefined)} [optOut]
 * @property {(string|string[]|undefined)} [optIn]
 */

