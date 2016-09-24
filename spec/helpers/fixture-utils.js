/**
 * Fixture used when testing the automatic creation of Select.Me models in a collection.
 *
 * Fixture object:
 *
 * @typedef {Object} AutoCreationFixture
 *
 * @property {(Object[]|undefined)}       attributeSets   the attribute sets underlying the fixture, as passed in
 *
 * @property {(Object[]|undefined)}       modelDataSets   the actual model data sets, must be calculated from the
 *                                                        attribute sets, must be different from them when testing parse
 * @property {Backbone.Collection}        Collection      the collection class to use, derived from the base class but
 *                                                        modified as appropriate when the fixture is applied
 * @property {(Backbone.Model|undefined)} modelTemplate   the model type the collection should use when generating
 *                                                        models from data. When set to Backbone.Model, the
 *                                                        collection.model property is left undefined.
 * @property {string}                     creationMethod  the operation which should create the models: "new" (models
 *                                                        are created during instantiation), "add", "set", "reset"
 * @property {Object}                     options         the options applied during the operation which creates the
 *                                                        models
 */

/**
 * Fixture constructor.
 *
 * @param {Object[]} attributeSets  sets of attributes. Used either for feeding them to the collection as raw data to
 *                                  generate models from, or for retrieving them, turned into a set of Backbone.Model
 *                                  instances, with createPlainModels()
 * @constructor
 */
function AutoCreationFixture( attributeSets ) {
    this.attributeSets = attributeSets;
    this.options = {};
}

/**
 * Sets the base collection type for the fixture.
 *
 * The actual fixture.Collection type will likely not be identical, but derived from it, extending the base type as
 * needed.
 *
 * @param {Backbone.Collection} collectionType
 */
AutoCreationFixture.prototype.setBaseCollectionType = function ( collectionType ) {
    this.Collection = collectionType;
};

/**
 * Creates and returns a set of Backbone.Models, generated from the initial attribute sets.
 *
 * @returns {Backbone.Model[]}
 */
AutoCreationFixture.prototype.createPlainModels = function () {
    return _.map( this.attributeSets, function ( attributeSet ) {
        return new Backbone.Model( attributeSet );
    } );
};

/**
 * Creates, populates and returns the collection.
 *
 * It is populated as defined in the creationMethod property (during instantiation, or with add, set, reset).
 *
 * @param   {(Object|Object[])}   modelData              can be raw data, or Backbone.Model instance(s)
 * @param   {Object}              [instantiationOptions]
 * @returns {Backbone.Collection}
 */
AutoCreationFixture.prototype.createPopulatedCollection = function ( modelData, instantiationOptions ) {
    var collection,
        Collection = this.Collection;

    if ( this.creationMethod === "new" ) {
        collection = new Collection( modelData, _.extend( {}, this.options, instantiationOptions ) );
    } else {
        collection = new Collection( null, instantiationOptions );
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

