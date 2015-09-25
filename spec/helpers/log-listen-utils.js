// !!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Depends on helpers/other.js
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!

// --- Logger ---

var Logger = function () {
    this.reset();
};

_.extend( Logger.prototype, {
    log: function ( content ) {
        this.entries.push( content );
    },
    reset: function () {
        this.entries = [];
    }
} );

// --- Recording selection states for a set of objects when selection events occur ---

/**
 * Sets up a container recording the selection states for models and/or collections whenever a selection-related event
 * occurs.
 *
 * The list of objects passed to the method
 *
 * +++ ATTN +++
 *
 * Only keeps the last event of a given type for each object (ie, it keeps the last "select:one:selected" event which
 * was triggered on object m1, but not previous "select:one:selected" events triggered on object m1). Older records are
 * overwritten.
 *
 * +++
 *
 * Creating the store:
 *
 * - The method takes an observed object, or an array of objects, as the first argument. These objects can be Select.Me
 *   models and Select.One/Select.Many collections.
 *
 * - Optionally, it takes a namespace or an array of namespaces as the second argument. If unspecified, the "selected"
 *   namespace is used.
 *
 * Observed events, recorded values:
 *
 * - The store observes all base event types, like "selected", "deselected", "select:one" etc, and their namespaced
 *   variants. The whole set is covered for each observed object, regardless of its type.
 *
 * - Whenever an event occurs on any of the observed models or collections, the selection state of all these models and
 *   collections is recorded.
 *
 *   (In other words, there is just one list of items: the items are observed for their events, and at the same time,
 *   they are also the items of which snapshots are made whenever an event occurs.)
 *
 * - The base event types are hard-coded. The list must be modified when new event types are created.
 *
 * Retrieving a value:
 *
 * - First, you declare which model or collection has emitted the event, and the event name. You get the event data with
 *   `eventData = store.getEvent( emitter, eventName )`
 *
 * - Second, you retrieve the model or collection which you want to examine the state of. You get the snapshot from the
 *   event data with `entityState = eventData.stateOf( capturedEntity )`
 *
 * - Finally, you query the snapshot for the label you are interested in: `entityState.selected`
 *
 * Usage example:
 *
 *     beforeEach( function () {
 *         ...
 *
 *         eventStates = getEventStateStore( [m1, m2, m3, collection], ["selected", "starred"] );
 *
 *        ...
 *     } );
 *
 *     it( 'when the selected event of model m2 fires, the model is starred', function () {
 *         expect( eventStates.getEvent( m2, "selected" ).stateOf( m2 ).starred ).toBe( true );
 *     } );
 *
 *     it( 'when the selected:starred event of the model fires, the model is starred in the Select.One collection', function () {
 *         expect( eventStates.getEvent( m2, "selected:starred" ).stateOf( collection ).starred ).toBe( m2 );
 *     } );
 *
 *     it( 'when the select:one event of the collection fires, only model m3 is selected', function () {
 *         var event = eventStates.getEvent( collection, "select:one" );
 *         expect( event.stateOf( m1 ).selected ).toBe( false );
 *         expect( event.stateOf( m2 ).selected ).toBeFalsy();
 *         expect( event.stateOf( m3 ).selected ).toBe( true );
 *     } );
 *
 * @param   {Backbone.Model|Backbone.Collection|Array} entities             a Select.Me, Select.One or Select.Many entity,
 *                                                                          or an array of them (may be mixed object types)
 * @param   {string|string[]}                          [labels="selected"]
 * @returns {Object}
 */
function getEventStateStore ( entities, labels ) {
    var events,
        store = new HashTableForBackboneEntities();

    // Using getEvent() as an alias of get(), makes more sense when reading tests
    store.getEvent = store.get;

    function Capture ( entities, captureFunc ) {
        var states = new HashTableForBackboneEntities();

        _.each( entities, function ( entity ) {
            var entityState = {};
            _.each( labels, function ( label ) {
                entityState[label] = captureFunc( entity, label );
            } );
            states._set( entity, entityState );
        } );

        this._states = states;
    }

    Capture.prototype.stateOf = function ( entity ) {
        return this._states.get( entity )
    };

    if ( !_.isArray( entities ) ) entities = [entities];

    labels || ( labels = ["selected"] );
    if ( _.isString( labels ) ) labels = [labels];

    events = _getAllEventNames( _getBackboneSelectBaseEventNames(), labels );

    _.each( entities, function ( entity ) {
        var eventCaptures = {};

        _.each( events, function ( eventName ) {

            // Set the default value for each captured entity, for each entity-event combination in the store
            eventCaptures[eventName] = new Capture( entities, function ( entity, label ) {
                return 'The "' + eventName + '" event for label "' + label + '" has not been triggered on ' + entity._pickyType + ' entity ' + _getEntityId( entity );
            } );

            // Set up the listener to capture the event state
            entity.listenTo( entity, eventName, function () {
                 eventCaptures[eventName] = new Capture( entities, function ( entity, label ) {
                     if ( !entity ) return "Entity not defined at time of capture";

                     var value = entity[label],
                         isPlainObject = _.isObject( value ) && !_.isFunction( value ) && !_.isArray( value ) && !value.initialize;

                     // Clone hashes stored by Select.Many collections in order to protect them from subsequent changes;
                     // pass all other values directly (boolean for Select.Me models, a model or undefined for Select.One).
                     return isPlainObject ? _.clone( entity[label] ) : entity[label];
                 } );
            } );
        } );

        store._set( entity, eventCaptures );
    } );

    return store;
}

// --- Recording event arguments for select/deselect events ---

/**
 * Creates and returns event spies for select(ed) and deselect(ed) events, including catch-all spies based on wildcards.
 *
 * Creating the spies:
 *
 * - The method takes an observed object, or an array of objects, as the first argument. These objects can be Select.Me
 *   models and Select.One/Select.Many collections.
 *
 * - Optionally, it takes a namespace or an array of namespaces as the second argument. If unspecified, the "selected"
 *   namespace is used.
 *
 * Generated spies:
 *
 * - The spy collection covers all base event types, like "selected", "deselected", "select:one" etc, and their
 *   namespaced variants. The whole set is created for each observed object, regardless of its type.
 *
 * - In addition, wildcard event spies capture all namespaces for a given event type, as well as the un-namespaced base
 *   event. E.g., when the namespaces "selected" and "starred" have been passed in, the "select:one:*" spy captures
 *   "select:one", "select:one:selected" and "select:one:starred" events.
 *
 * - There is also a top-level "*" spy, capturing all selection-related events. It does not capture other events, like
 *   "add", "remove" etc. Usage example: expect( events.get( model, "*" ).toHaveBeenCalledTwice();
 *
 * - Note that there isn't any wildcard for event subtypes like ":one", ":some", ":all" etc. These have to be spelled
 *   out when querying a spy.
 *
 * - The base event types are hard-coded. The list must be modified when new event types are created.
 *
 * Retrieving a spy:
 *
 * - When a single observed object is passed in during creation, and it is NOT wrapped in an array, the method returns a
 *   hash of spies. Event names serve as keys. Example:
 *
 *     var modelEvents = getEventSpies( model, ["selected", "starred"] );
 *     expect( modelEvents["selected:starred"] ).not.toHaveBeenCalled();
 *
 *  - When an array of observed objects is passed in during creation, the method returns a hash table object. Retrieve
 *    the event spy for an object and an event with the .get( object, eventName ) method. Example:
 *
 *      var events = getEventSpies( [ model, collection ], ["selected", "starred"] );
 *      expect( events.get( model, "selected:starred" ) ).not.toHaveBeenCalled();
 *
 *
 * @param   {Backbone.Model|Backbone.Collection|Array} observed  a Select.Me, Select.One or Select.Many entity, or an
 *                                                               array of them (may be mixed object types)
 * @param   {string|string[]}  [namespaces="selected"]
 * @returns {Array|Object}
 */
function getEventSpies ( observed, namespaces ) {
    var eventSpies,
        baseEventNames = _getBackboneSelectBaseEventNames();

    function _getTargetedEventSpies ( observed, eventNames ) {
        var observedId = _getEntityId( observed ),
            eventSpies = jasmine.createSpyObj( observedId + ': event', eventNames );

        _.each( eventNames, function ( eventName ) {
            observed.listenTo( observed, eventName, eventSpies[eventName] );
        } );

        return eventSpies;
    }

    function _getWildcardEventSpies ( observed, baseEventNames, namespaces ) {
        var observedId = _getEntityId( observed ),
            wildcardEventNames = _.map( baseEventNames, function ( baseEventName ) {
                return baseEventName + ":*";
            } ),
            eventSpies = jasmine.createSpyObj( observedId + ': event', wildcardEventNames );

        _.each( baseEventNames, function ( baseEventName ) {
            var eventNameVariations = [baseEventName].concat( _getNamespacedEventNames( baseEventName, namespaces ) );
            _.each( eventNameVariations, function ( eventName ) {
                observed.listenTo( observed, eventName, eventSpies[baseEventName + ":*"]);
            } );
        } );

        return eventSpies;
    }

    function _getStarEventSpy ( observed, eventNames ) {
        var observedId = _getEntityId( observed ),
            eventSpy = jasmine.createSpy( observedId + ': event.*' );

        _.each( eventNames, function ( eventName ) {
            observed.listenTo( observed, eventName, eventSpy );
        } );

        return { "*": eventSpy };
    }

    function _getEventSpies( observed, baseEventNames, namespaces ) {
        var targetedEventSpies, wildcardEventSpies, starEventSpy,
            eventNames = _getAllEventNames( baseEventNames, namespaces );

        targetedEventSpies = _getTargetedEventSpies( observed, eventNames );
        wildcardEventSpies = _getWildcardEventSpies( observed, baseEventNames, namespaces );
        starEventSpy = _getStarEventSpy( observed, eventNames );

        return _.extend( targetedEventSpies, wildcardEventSpies, starEventSpy );
    }

    namespaces || ( namespaces = ["selected"] );
    if ( _.isString( namespaces ) ) namespaces = [ namespaces ];

    if ( _.isArray( observed ) ) {
        eventSpies = new HashTableForBackboneEntities();
        _.each( observed, function ( singleObserved ) {
            eventSpies._set( singleObserved, _getEventSpies( singleObserved, baseEventNames, namespaces ) );
        } );
    } else {
        eventSpies = _getEventSpies( observed, baseEventNames, namespaces );
    }

    return eventSpies;
}

// --- Helpers ---

function HashTableForBackboneEntities () {
    this._hashTable = {};
}

HashTableForBackboneEntities.prototype._set = function ( entity, entry ) {
    this._hashTable[_getEntityId( entity )] = entry;
};

HashTableForBackboneEntities.prototype.get = function ( entity, category ) {
    return category === undefined ? this._hashTable[_getEntityId( entity )] : this._hashTable[_getEntityId( entity )][category];
};

function _getNamespacedEventNames ( baseEventName, namespaces ) {
    return _.map( namespaces, function ( namespace ) {
        return baseEventName + ":" + namespace;
    } );
}

function _getBackboneSelectBaseEventNames () {
    return [
        "selected", "deselected", "reselected",
        "select:one", "deselect:one", "reselect:one",
        "select:none", "select:some", "select:all", "reselect:any"
    ];
}

function _getEntityId ( entity ) {
    return entity._pickyCid || "model " + entity.cid;
}

function _getAllEventNames ( baseEventNames, namespaces ) {
    var eventNames = baseEventNames;

    _.each( baseEventNames, function ( baseEventName ) {
        var namespacedEventNames = _getNamespacedEventNames( baseEventName, namespaces );
        eventNames = eventNames.concat( namespacedEventNames );
    } );

    return eventNames;
}


