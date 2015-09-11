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

// --- Recording selection states for an object at given events ---

/**
 * Sets up a container recording the selection states for a model and/or a collection whenever a given event occurs.
 *
 * +++ ATTN +++
 *
 * Only keeps one record for each event name. Ie, it records the state for the last event of a given name (e.g. the last
 * "select:one" event). The record for preceding "select:one" events is overwritten.
 *
 * Usage example:
 *
 *     var model, collection, eventStates;
 *
 *     beforeEach( function () {
 *         model = new Model();
 *         collection = new Collection( [model] );
 *
 *         eventStates = recordSelectionStatesForEvents( {
 *             model: model,
 *             collection: collection,
 *             modelEvents: [ "selected", "selected:starred", "selected:selected" ],
 *             collectionEvents: [ "select:one", "select:one:starred", "select:one:selected" ],
 *             labels: "starred"
 *         } );
 *
 *         model.select( { label: "starred" } );
 *     } );
 *
 *     it( 'when the selected event of the model fires, the model is starred', function () {
 *         expect( eventStates["selected"].model.starred ).toEqual( true );
 *     } );
 *
 *     it( 'when the selected:starred event of the model fires, the model is starred in the collection', function () {
 *         expect( eventStates["selected:starred"].collection.starred ).toBe( model );
 *     } );
 *
 *     it( 'when the select:one event of the collection fires, the model is starred in the collection', function () {
 *         expect( eventStates["select:one"].collection.starred ).toBe( model );
 *     } );
 *
 *     it( 'when the select:one:starred event of the collection fires, the model is starred', function () {
 *         expect( eventStates["select:one:starred"].model.starred ).toEqual( true );
 *     } );
 *
 *
 * @param   {Object}                             options
 * @param   {Backbone.Model}                     [options.model]
 * @param   {Backbone.Collection}                [options.collection]
 * @param   {string[]}                           [options.modelEvents=[]]
 * @param   {string[]}                           [options.collectionEvents=[]]
 * @param   {string|string[]}                    [options.labels="selected"]
 * @param   {Object}                             [options.container={}]
 * @returns {Object}
 */
function recordSelectionStatesForEvents ( options ) {
    var model = options.model,
        collection = options.collection,
        modelEvents = options.modelEvents || [],
        collectionEvents = options.collectionEvents || [],
        labels = options.labels || [ "selected" ],
        eventStatesContainer = options.container || {};

    if ( _.isString( labels ) ) labels = [ labels ];

    _.each( modelEvents.concat( collectionEvents ), function ( eventName ) {
        eventStatesContainer[eventName] = { model: {}, collection: {} };
    } );

    _.each( labels, function ( label ) {

        if ( model ) {

            _.each( modelEvents, function ( eventName ) {

                model.on( eventName, function ( model ) {
                    eventStatesContainer[eventName].model[label] = model && model[label];
                    if ( collection ) eventStatesContainer[eventName].collection[label] = collection[label];
                } );

            } );

        }

        if ( collection ) {

            if ( collection._pickyType === "Backbone.Select.One" ) {

                _.each( collectionEvents, function ( eventName ) {

                    collection.on( eventName, function ( model, collection ) {
                        eventStatesContainer[eventName].model[label] = model[label];
                        eventStatesContainer[eventName].collection[label] = collection[label];
                    } );

                } );

            } else {

                _.each( collectionEvents, function ( eventName ) {

                    collection.on( eventName, function ( diff, collection ) {
                        if ( model ) eventStatesContainer[eventName].model[label] = model[label];
                        eventStatesContainer[eventName].collection[label] = collection[label];
                    } );

                } );

            }
        }

    } );

    return eventStatesContainer;
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
        baseEventNames = [
            "selected", "deselected", "reselected",
            "select:one", "deselect:one", "reselect:one",
            "select:none", "select:some", "select:all", "reselect:any"
        ];

    function EventSpiesHashTable () {
        this._eventSpiesTable = {};
    }

    EventSpiesHashTable.prototype._set = function ( observed, eventSpies ) {
        this._eventSpiesTable[_getObservedId( observed )] = eventSpies;
    };

    EventSpiesHashTable.prototype.get = function ( observed, eventName ) {
        return this._eventSpiesTable[_getObservedId( observed )][eventName];
    };

    function _getNamespacedEventNames ( baseEventName, namespaces ) {
        return _.map( namespaces, function ( namespace ) {
            return baseEventName + ":" + namespace;
        } );
    }

    function _getObservedId ( observed ) {
        return observed._pickyCid || "model " + observed.cid;
    }

    function _getTargetedEventSpies ( observed, eventNames ) {
        var observedId = _getObservedId( observed ),
            eventSpies = jasmine.createSpyObj( observedId + ': event', eventNames );

        _.each( eventNames, function ( eventName ) {
            observed.listenTo( observed, eventName, eventSpies[eventName] );
        } );

        return eventSpies;
    }

    function _getWildcardEventSpies ( observed, baseEventNames, namespaces ) {
        var observedId = _getObservedId( observed ),
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
        var observedId = _getObservedId( observed ),
            eventSpy = jasmine.createSpy( observedId + ': event.*' );

        _.each( eventNames, function ( eventName ) {
            observed.listenTo( observed, eventName, eventSpy );
        } );

        return { "*": eventSpy };
    }

    function _getEventSpies( observed, baseEventNames, namespaces ) {
        var targetedEventSpies, wildcardEventSpies, starEventSpy,
            eventNames = baseEventNames;

        _.each( baseEventNames, function ( baseEventName ) {
            var namespacedEventNames = _getNamespacedEventNames( baseEventName, namespaces );
            eventNames = eventNames.concat( namespacedEventNames );
        } );

        targetedEventSpies = _getTargetedEventSpies( observed, eventNames );
        wildcardEventSpies = _getWildcardEventSpies( observed, baseEventNames, namespaces );
        starEventSpy = _getStarEventSpy( observed, eventNames );

        return _.extend( targetedEventSpies, wildcardEventSpies, starEventSpy );
    }

    namespaces || ( namespaces = ["selected"] );
    if ( _.isString( namespaces ) ) namespaces = [ namespaces ];

    if ( _.isArray( observed ) ) {
        eventSpies = new EventSpiesHashTable();
        _.each( observed, function ( singleObserved ) {
            eventSpies._set( singleObserved, _getEventSpies( singleObserved, baseEventNames, namespaces ) );
        } );
    } else {
        eventSpies = _getEventSpies( observed, baseEventNames, namespaces );
    }

    return eventSpies;
}

// --- ListenerMixin ---

var ListenerMixin = function ( observableNames, takeSnapshotMethod ) {

    var createContainer = function () {
        var container = {
            calls: 0
        };
        _.each( observableNames, function ( name ) {
            container[name] = {}
        } );

        return container;
    };

    this.snapshots = {
        onSelected: _.extend( {}, createContainer() ),
        onDeselected: _.extend( {}, createContainer() ),
        onSelectOne: _.extend( {}, createContainer() ),
        onDeselectOne: _.extend( {}, createContainer() ),
        onSelectNone: _.extend( {}, createContainer() ),
        onSelectSome: _.extend( {}, createContainer() ),
        onSelectAll: _.extend( {}, createContainer() )
    };

    this.takeSnapshot = takeSnapshotMethod;
};

_.extend( ListenerMixin.prototype, {

    bindEvents: function () {
        this.listenTo( this, "selected", this.captureOnSelected );
        this.listenTo( this, "deselected", this.captureOnDeselected );
        this.listenTo( this, "select:one", this.captureOnSelectOne );
        this.listenTo( this, "deselect:one", this.captureOnDeselectOne );
        this.listenTo( this, "select:none", this.captureOnSelectNone );
        this.listenTo( this, "select:some", this.captureOnSelectSome );
        this.listenTo( this, "select:all", this.captureOnSelectAll );
        _.bindAll( this, "takeSnapshot" );
    },

    captureOnSelected: function () {
        this.takeSnapshot( this.snapshots.onSelected );
    },

    captureOnDeselected: function () {
        this.takeSnapshot( this.snapshots.onDeselected );
    },

    captureOnSelectOne: function () {
        this.takeSnapshot( this.snapshots.onSelectOne );
    },

    captureOnDeselectOne: function () {
        this.takeSnapshot( this.snapshots.onDeselectOne );
    },

    captureOnSelectNone: function () {
        this.takeSnapshot( this.snapshots.onSelectNone );
    },

    captureOnSelectSome: function () {
        this.takeSnapshot( this.snapshots.onSelectSome );
    },

    captureOnSelectAll: function () {
        this.takeSnapshot( this.snapshots.onSelectAll );
    },

    takeSnapshot: function ( container ) {

        // Implement takeSnapshot as suggested in the section below and add to
        // the prototype.

        // NB doCapture: just a suggested name. Use some var which is in scope, a
        // boolean, to activate the capturing.

        //noinspection JSUnresolvedVariable
        if ( doCapture ) {
            container.calls++;

//          container.model1.selected = model1.selected;
//          container.model2.selected = model2.selected;
//          container.someSingleSelectCollection.selected = someSingleSelectCollection.selected;
//          container.someMultiSelectCollection.selected = _.clone( someMultiSelectCollection.selected );
        }

    }
} );

ListenerMixin.applyTo = function ( hostObject, observableNames, takeSnapshotMethod ) {
    Backbone.Select.Me.applyTo( this );
    deepExtend( hostObject, new ListenerMixin( observableNames, takeSnapshotMethod ) );
    hostObject.bindEvents();
};
