;( function ( Backbone, _ ) {
    "use strict";

    var Mixins = {

            // Select.One
            // ----------
            // A single-select mixin for Backbone.Collection, allowing a single
            // model to be selected within a collection. Selection of another
            // model within the collection causes the previous model to be
            // deselected.

            SelectOne: {

                // Type indicator, undocumented, but part of the API (monitored by tests).
                // Can be queried safely by other components. Use it read-only.
                _pickyType: "Backbone.Select.One",

                // Select a model, deselecting any previously selected model
                select: function ( model, options ) {
                    var label, reselected, eventOptions;

                    options = initOptions( options );
                    if ( options._processedBy[this._pickyCid] ) return;

                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return;

                    reselected = model && this[label] === model ? model : undefined;

                    if ( !reselected ) {
                        this.deselect( undefined, _.extend(
                            // _eventQueue vs _eventQueueAppendOnly:
                            //
                            // When a deselect sub action is initiated from a select action, the
                            // deselection events are added to the common event queue. But the
                            // event queue must not be resolved prematurely during the
                            // deselection phase. Resolution is prevented by naming the queue
                            // differently.
                            _.omit( options, "_silentLocally", "_processedBy", "_eventQueue" ),
                            { _eventQueueAppendOnly: options._eventQueue }
                        ) );
                        this[label] = model;
                    }
                    options._processedBy[this._pickyCid] = { done: false };

                    if ( !options._processedBy[this[label].cid] ) this[label].select( stripLocalOptions( options ) );

                    if ( !(options.silent || options._silentLocally) ) {

                        eventOptions = toEventOptions( options, label, this );
                        if ( reselected ) {
                            if ( !options._silentReselect ) queueEventSet( "reselect:one", label, [ model, this, eventOptions ], this, options );
                        } else {
                            queueEventSet( "select:one", label, [ model, this, eventOptions ], this, options );
                        }

                    }

                    options._processedBy[this._pickyCid].done = true;
                    processEventQueue( options );
                },

                // Deselect a model, resulting in no model
                // being selected
                deselect: function ( model, options ) {
                    var label;

                    options = initOptions( options );
                    if ( options._processedBy[this._pickyCid] ) return;

                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) || !this[label] ) return;

                    model = model || this[label];
                    if ( this[label] !== model ) return;

                    options._processedBy[this._pickyCid] = { done: false };

                    delete this[label];
                    if ( !options._skipModelCall ) model.deselect( stripLocalOptions( options ) );
                    if ( !(options.silent || options._silentLocally) ) queueEventSet( "deselect:one", label, [ model, this, toEventOptions( options, label, this ) ], this, options );

                    options._processedBy[this._pickyCid].done = true;
                    processEventQueue( options );
                },

                close: function () {
                    unregisterCollectionWithModels( this );
                    this.stopListening();
                }

            },

            // Select.Many
            // -----------
            // A multi-select mixin for Backbone.Collection, allowing a collection to
            // have multiple items selected, including `selectAll` and `deselectAll`
            // capabilities.

            SelectMany: {

                // Type indicator, undocumented, but part of the API (monitored by tests).
                // Can be queried safely by other components. Use it read-only.
                _pickyType: "Backbone.Select.Many",

                // Select a specified model, make sure the model knows it's selected, and
                // hold on to the selected model.
                select: function ( model, options ) {
                    var label, prevSelected, reselected;

                    options = initOptions( options );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return;

                    prevSelected = multiSelectionToArray( this[label] );
                    reselected = this[label][model.cid] ? [model] : [];

                    if ( reselected.length && options._processedBy[this._pickyCid] ) return;

                    if ( options.exclusive ) {
                        this.each( function ( iteratedModel ) {
                            if ( iteratedModel !== model ) this.deselect( iteratedModel, _.extend( {}, options, { _silentLocally: true } ) );
                        }, this );
                    }

                    if ( !reselected.length ) {
                        this[label][model.cid] = model;
                        setSelectionSize( _.size( this[label] ), this, label );
                    }
                    options._processedBy[this._pickyCid] = { done: false };

                    if ( !options._processedBy[model.cid] ) model.select( stripLocalOptions( options ) );
                    triggerMultiSelectEvents( this, prevSelected, options, reselected );

                    options._processedBy[this._pickyCid].done = true;
                    processEventQueue( options );
                },

                // Deselect a specified model, make sure the model knows it has been deselected,
                // and remove the model from the selected list.
                deselect: function ( model, options ) {
                    var label, prevSelected;

                    options = initOptions( options );
                    if ( options._processedBy[this._pickyCid] ) return;

                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return;

                    prevSelected = multiSelectionToArray( this[label] );

                    if ( !this[label][model.cid] ) return;

                    options._processedBy[this._pickyCid] = { done: false };

                    delete this[label][model.cid];
                    setSelectionSize( _.size( this[label] ), this, label );

                    if ( !options._skipModelCall ) model.deselect( stripLocalOptions( options ) );
                    triggerMultiSelectEvents( this, prevSelected, options );

                    options._processedBy[this._pickyCid].done = true;
                    processEventQueue( options );
                },

                // Select all models in this collection
                selectAll: function ( options ) {
                    var label, prevSelected,
                        reselected = [];

                    options || ( options = {} );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return;

                    prevSelected = multiSelectionToArray( this[label] );

                    this.each( function ( model ) {
                        if ( this[label][model.cid] ) reselected.push( model );
                        this.select( model, _.extend( {}, options, { _silentLocally: true } ) );
                    }, this );

                    setSelectionSize( _.size( this[label] ), this, label );

                    options = initOptions( options );
                    triggerMultiSelectEvents( this, prevSelected, options, reselected );

                    if ( options._processedBy[this._pickyCid] ) {
                        options._processedBy[this._pickyCid].done = true;
                    } else {
                        options._processedBy[this._pickyCid] = { done: true };
                    }
                    processEventQueue( options );
                },

                // Deselect all models in this collection
                deselectAll: function ( options ) {
                    var prevSelected, label;

                    options || ( options = {} );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return;

                    if ( getSelectionSize( this, label ) === 0 ) return;
                    prevSelected = multiSelectionToArray( this[label] );


                    this.each( function ( model ) {
                        this.deselect( model, _.extend( {}, options, { _silentLocally: true } ) );
                    }, this );

                    setSelectionSize( 0, this, label );

                    options = initOptions( options );
                    triggerMultiSelectEvents( this, prevSelected, options );

                    if ( options._processedBy[this._pickyCid] ) {
                        options._processedBy[this._pickyCid].done = true;
                    } else {
                        options._processedBy[this._pickyCid] = { done: true };
                    }
                    processEventQueue( options );
                },

                selectNone: function ( options ) {
                    this.deselectAll( options );
                },

                // Toggle select all / none. If some are selected, it will select all. If all
                // are selected, it will select none. If none are selected, it will select all.
                toggleSelectAll: function ( options ) {
                    var label;

                    options || ( options = {} );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return;

                    if ( getSelectionSize( this, label ) === this.length ) {
                        this.deselectAll( options );
                    } else {
                        this.selectAll( options );
                    }
                },

                close: function () {
                    unregisterCollectionWithModels( this );
                    this.stopListening();
                }
            },

            // Select.Me
            // ---------
            // A selectable mixin for Backbone.Model, allowing a model to be selected,
            // enabling it to work with Select.One or Select.Many, or on it's own.

            SelectMe: {

                // Type indicator, undocumented, but part of the API (monitored by tests).
                // Can be queried safely by other components. Use it read-only.
                _pickyType: "Backbone.Select.Me",

                // Select this model, and tell our
                // collection that we're selected
                select: function ( options ) {
                    var label, reselected, eventOptions;

                    options = initOptions( options );
                    if ( options._processedBy[this.cid] ) return;

                    options._processedBy[this.cid] = { done: false };

                    label = getLabel( options, this );
                    reselected = this[label];
                    this[label] = true;

                    if ( this._pickyCollections ) {
                        // Model-sharing mode: notify collections with an event
                        this.trigger( "_selected", this, stripLocalOptions( options ) );
                    } else if ( this.collection ) {
                        // Single collection only: no event listeners set up in collection, call
                        // it directly
                        if ( !options._processedBy[this.collection._pickyCid] ) this.collection.select( this, stripLocalOptions( options ) );
                    }

                    if ( !(options.silent || options._silentLocally) ) {
                        eventOptions = toEventOptions( options, label, this );

                        if ( reselected ) {
                            if ( !options._silentReselect ) queueEventSet( "reselected", label, [ this, eventOptions ], this, options );
                        } else {
                            queueEventSet( "selected", label, [ this, eventOptions ], this, options );
                        }
                    }

                    options._processedBy[this.cid].done = true;
                    processEventQueue( options );
                },

                // Deselect this model, and tell our collection that we're deselected
                deselect: function ( options ) {
                    var label;

                    options = initOptions( options );
                    if ( options._processedBy[this.cid] ) return;

                    label = getLabel( options, this );
                    if ( !this[label] ) return;

                    options._processedBy[this.cid] = { done: false };
                    this[label] = false;

                    if ( this._pickyCollections ) {
                        // Model-sharing mode: notify collections with an event
                        this.trigger( "_deselected", this, stripLocalOptions( options ) );
                    } else if ( this.collection ) {
                        // Single collection only: no event listeners set up in collection, call
                        // it directly
                        this.collection.deselect( this, stripLocalOptions( options ) );
                    }

                    if ( !(options.silent || options._silentLocally) ) queueEventSet( "deselected", label, [ this, toEventOptions( options, label, this ) ], this, options );

                    options._processedBy[this.cid].done = true;
                    processEventQueue( options );
                },

                // Change selected to the opposite of what
                // it currently is
                toggleSelected: function ( options ) {
                    var label;

                    options || ( options = {} );
                    label = getLabel( options, this );

                    if ( this[label] ) {
                        this.deselect( options );
                    } else {
                        this.select( options );
                    }
                }
            }

        },


        // Applying the mixins: setup methods

        Select = {

            Me: {

                applyTo: function ( hostObject, options ) {
                    if ( !_.isObject( hostObject ) ) throw new Error( "The host object is undefined or not an object." );

                    _.extend( hostObject, Mixins.SelectMe );

                    hostObject._pickyLabels = {};
                    hostObject._pickyDefaultLabel = options && options.defaultLabel || "selected";
                    ensureLabelIsRegistered( hostObject._pickyDefaultLabel, hostObject );

                    augmentTrigger( hostObject );
                }

            },

            One: {

                applyTo: function ( hostObject, models, options ) {
                    var oldSelect;

                    if ( !_.isObject( hostObject ) ) throw new Error( "The host object is undefined or not an object." );
                    if ( arguments.length < 2 ) throw new Error( "The `models` parameter has not been passed to Select.One.applyTo. Its value can be undefined if no models are passed in during instantiation, but even so, it must be provided." );
                    if ( !(_.isArray( models ) || _.isUndefined( models ) || _.isNull( models )) ) throw new Error( "The `models` parameter is not of the correct type. It must be either an array of models, or be undefined. (Null is acceptable, too)." );

                    // Store a reference to the existing select method (most likely the
                    // default Backbone.Collection.select method). Used to overload the new
                    // select method.
                    oldSelect = hostObject.select;

                    _.extend( hostObject, Mixins.SelectOne );

                    hostObject._pickyCid = _.uniqueId( 'singleSelect' );

                    hostObject._pickyLabels = {};
                    hostObject._pickyDefaultLabel = options && options.defaultLabel || "selected";
                    registerIgnoredLabels( options && options.ignoreLabel, hostObject );
                    ensureLabelIsRegistered( hostObject._pickyDefaultLabel, hostObject );

                    augmentTrigger( hostObject );
                    overloadSelect( oldSelect, hostObject );

                    if ( options && options.enableModelSharing ) {

                        // model-sharing mode
                        _.each( models || [], function ( model ) {
                            registerCollectionWithModel( model, hostObject );

                            forEachLabelInModelOrCollection( model, hostObject, function ( label ) {
                                ensureLabelIsRegistered( label, hostObject );
                                if ( model[label] && !isIgnoredLabel( label, hostObject ) ) {
                                    if ( hostObject[label] ) hostObject[label].deselect();
                                    hostObject[label] = model;
                                }
                            } );
                        } );

                        hostObject.listenTo( hostObject, '_selected', hostObject.select );
                        hostObject.listenTo( hostObject, '_deselected', hostObject.deselect );

                        hostObject.listenTo( hostObject, 'reset', onResetSingleSelect );
                        hostObject.listenTo( hostObject, 'add', onAdd );
                        hostObject.listenTo( hostObject, 'remove', onRemove );

                        // Mode flag, undocumented, but part of the API (monitored by tests). Can
                        // be queried safely by other components. Use it read-only.
                        hostObject._modelSharingEnabled = true;

                    }

                }

            },

            Many: {

                applyTo: function ( hostObject, models, options ) {
                    var oldSelect;

                    if ( !_.isObject( hostObject ) ) throw new Error( "The host object is undefined or not an object." );
                    if ( arguments.length < 2 ) throw new Error( "The `models` parameter has not been passed to Select.One.applyTo. Its value can be undefined if no models are passed in during instantiation, but even so, it must be provided." );
                    if ( !(_.isArray( models ) || _.isUndefined( models ) || _.isNull( models )) ) throw new Error( "The `models` parameter is not of the correct type. It must be either an array of models, or be undefined. (Null is acceptable, too)." );

                    // Store a reference to the existing select method (most likely the
                    // default Backbone.Collection.select method). Used to overload the new
                    // select method.
                    oldSelect = hostObject.select;

                    _.extend( hostObject, Mixins.SelectMany );

                    hostObject._pickyCid = _.uniqueId( 'multiSelect' );

                    hostObject._pickyLabels = {};
                    hostObject._pickyDefaultLabel = options && options.defaultLabel || "selected";
                    registerIgnoredLabels( options && options.ignoreLabel, hostObject );
                    ensureLabelIsRegistered( hostObject._pickyDefaultLabel, hostObject );

                    augmentTrigger( hostObject );
                    overloadSelect( oldSelect, hostObject );

                    if ( options && options.enableModelSharing ) {

                        // model-sharing mode
                        _.each( models || [], function ( model ) {
                            registerCollectionWithModel( model, hostObject );

                            forEachLabelInModelOrCollection( model, hostObject, function ( label ) {
                                ensureLabelIsRegistered( label, hostObject );
                                if ( model[label] && !isIgnoredLabel( label, hostObject ) ) {
                                    hostObject[label][model.cid] = model;
                                }
                            } );
                        } );

                        hostObject.listenTo( hostObject, '_selected', hostObject.select );
                        hostObject.listenTo( hostObject, '_deselected', hostObject.deselect );

                        hostObject.listenTo( hostObject, 'reset', onResetMultiSelect );
                        hostObject.listenTo( hostObject, 'add', onAdd );
                        hostObject.listenTo( hostObject, 'remove', onRemove );

                        // Mode flag, undocumented, but part of the API (monitored by tests). Can
                        // be queried safely by other components. Use it read-only.
                        hostObject._modelSharingEnabled = true;

                    }

                }

            }

        };


    // Helper Methods
    // --------------

    // Trigger events from a multi-select collection, based on the number of selected items.
    var triggerMultiSelectEvents = function ( collection, prevSelected, options, reselected ) {
        function mapCidsToModels ( cids, collection, previousSelection ) {
            function mapper ( cid ) {
                // Find the model in the collection. If not found, it has been removed,
                // so get it from the array of previously selected models.
                return collection.get( cid ) || previousSelection[cid];
            }

            return _.map( cids, mapper );
        }

        if ( options.silent || options._silentLocally ) return;

        var diff,
            label = getLabel( options, collection ),

            selectionSize = getSelectionSize( collection, label ),
            length = collection.length,

            prevSelectedCids = _.keys( prevSelected ),
            selectedCids = _.keys( collection[label] ),
            addedCids = _.difference( selectedCids, prevSelectedCids ),
            removedCids = _.difference( prevSelectedCids, selectedCids ),

            unchanged = (selectionSize === prevSelectedCids.length && addedCids.length === 0 && removedCids.length === 0);

        if ( reselected && reselected.length && !options._silentReselect ) {
            queueEventSet( "reselect:any", label, [ reselected, collection, toEventOptions( options, label, collection ) ], collection, options );
        }

        if ( unchanged ) return;

        diff = {
            selected: mapCidsToModels( addedCids, collection, prevSelected ),
            deselected: mapCidsToModels( removedCids, collection, prevSelected )
        };

        if ( selectionSize === length ) {
            queueEventSet( "select:all", label, [ diff, collection, toEventOptions( options, label, collection ) ], collection, options );
            return;
        }

        if ( selectionSize === 0 ) {
            queueEventSet( "select:none", label, [ diff, collection, toEventOptions( options, label, collection ) ], collection, options );
            return;
        }

        if ( selectionSize > 0 && selectionSize < length ) {
            queueEventSet( "select:some", label, [ diff, collection, toEventOptions( options, label, collection ) ], collection, options );
            return;
        }
    };

    function onAdd ( model, collection ) {
        registerCollectionWithModel( model, collection );
        forEachLabelInModelOrCollection( model, collection, function ( label ) {
            if ( model[label] ) collection.select( model, { _silentReselect: true, _externalEvent: "add", label: label } );
        } );

    }

    function onRemove ( model, collection, options ) {
        releaseModel( model, collection, _.extend( {}, options, { _externalEvent: "remove" } ) );
    }

    function releaseModel ( model, collection, options ) {
        if ( model._pickyCollections ) model._pickyCollections = _.without( model._pickyCollections, collection._pickyCid );

        forEachLabelInCollection( collection, function ( label ) {
            var deselectOptions;

            if ( model[label] ) {

                if ( model._pickyCollections && model._pickyCollections.length === 0 ) {
                    deselectOptions = _.extend( {}, options, { label: label } );
                } else {
                    deselectOptions = _.extend( {}, options, { label: label, _skipModelCall: true } );
                }

                collection.deselect( model, deselectOptions );
            }

        } );
    }

    function onResetSingleSelect ( collection, options ) {
        var selected,
            excessiveSelections,
            deselectOnRemove = {};
        
        forEachLabelInCollection( collection, function ( label ) {
            var removeThis = _.find( options.previousModels, function ( model ) { return model[label]; } );
            if ( removeThis ) deselectOnRemove[removeThis.cid] = removeThis; 
        } );

        _.each( deselectOnRemove, function ( model ) {
            releaseModel( model, collection, { _silentLocally: true } );
        } );

        _.each( options.previousModels, function ( model ) {
            if ( model._pickyCollections ) model._pickyCollections = _.without( model._pickyCollections, collection._pickyCid );
        } );

        collection.each( function ( model ) {
            registerCollectionWithModel( model, collection );
            ensureModelLabelsInCollection( model, collection );
        } );

        forEachLabelInCollection( collection, function ( label ) {

            selected = collection.filter( function ( model ) { return model[label]; } );
            excessiveSelections = _.initial( selected );
            if ( excessiveSelections.length ) _.each( excessiveSelections, function ( model ) { model.deselect( { label: label } ); } );
            if ( selected.length ) collection.select( _.last( selected ), { silent: true, label: label } );

        } );
    }

    function onResetMultiSelect ( collection, options ) {
        var select,
            deselect = _.filter( options.previousModels, function ( model ) { return isModelSelectedWithAnyCollectionLabel( model, collection ); } );

        if ( deselect ) _.each( deselect, function ( model ) { releaseModel( model, collection, { _silentLocally: true } ); } );

        _.each( options.previousModels, function ( model ) {
            if ( model._pickyCollections ) model._pickyCollections = _.without( model._pickyCollections, collection._pickyCid );
        } );

        collection.each( function ( model ) {
            registerCollectionWithModel( model, collection );
            ensureModelLabelsInCollection( model, collection );
        } );

        forEachLabelInCollection( collection, function ( label ) {
            select = collection.filter( function ( model ) { return model[label]; } );
            if ( select.length ) _.each( select, function ( model ) { collection.select( model, { silent: true, label: label } ); } );
        } );
    }

    function registerCollectionWithModel ( model, collection ) {
        model._pickyCollections || (model._pickyCollections = []);
        model._pickyCollections.push( collection._pickyCid );
    }

    function unregisterCollectionWithModels ( collection ) {
        collection.each( function ( model ) {
            releaseModel( model, collection, { _silentLocally: true } );
        } );
    }

    function stripLocalOptions ( options ) {
        return _.omit( options, "_silentLocally", "_externalEvent" );
    }

    function toEventOptions ( options, label ) {
        var eventOptions = stripInternalOptions( options );

        // The default label is used for a select/deselect action unless the label has been passed in explicitly. More
        // precisely, what gets used is the default label of the object on which select/deselect has initially been
        // called.
        //
        // But other objects may have been created with another default label. So it can happen that the default label
        // of the ongoing operation, initiated elsewhere, is different from the default label of the object which is
        // processed right now.
        //
        // Therefore, in order to avoid ambiguity, the label is always exposed in the event options.
        _.extend( eventOptions, { label: label } );

        return eventOptions;
    }

    function stripInternalOptions ( options ) {
        return _.omit( options, "_silentLocally", "_silentReselect", "_skipModelCall", "_processedBy", "_eventQueue", "_eventQueueAppendOnly" );
    }

    function getLabel ( options, obj ) {
        // getLabel must be called before any work gets done in a select/deselect method. Therefore, it is also tasked
        // with a few side jobs regarding proper initialization:
        //
        // - It ensures that the label is explicit in the options object, from here on out
        // - It ensures that the label is registered
        options.label || ( options.label = obj._pickyDefaultLabel );
        ensureLabelIsRegistered( options.label, obj );

        return options.label;
    }

    function ensureLabelIsRegistered ( name, obj ) {
        if ( name && !obj._pickyLabels[name] && !isIgnoredLabel( name, obj ) ) {
            obj._pickyLabels[name] = true;

            if ( obj._pickyType === "Backbone.Select.Many" ) {
                obj[name] = {};
                setSelectionSize( 0, obj, name );
            }
        }
    }

    function ensureModelLabelsInCollection ( model, collection ) {
        forEachLabelInModel( model, function ( label ) {
            ensureLabelIsRegistered( label, collection );
        } );
    }

    function isModelSelectedWithAnyCollectionLabel ( model, collection ) {
        var hasCollectionLabel = false;

        forEachLabelInCollection( collection, function ( label ) {
            hasCollectionLabel || ( hasCollectionLabel = model[label] );
        } );

        return hasCollectionLabel;
    }

    function registerIgnoredLabels ( labels, collection ) {
        labels || ( labels = [] );
        if ( _.isString( labels ) ) labels = [ labels ];

        if ( !_.isArray( labels ) ) throw new Error( "ignoreLabel option: illegal value. Expected a string or an array of strings but got the value " + labels );
        if ( _.contains( labels, collection._pickyDefaultLabel ) ) throw new Error( "ignoreLabel option: illegal value. Can't ignore the default label, \"" + collection._pickyDefaultLabel + "\", of a collection (_pickyCid: " + collection._pickyCid + ")" );

        collection._pickyIgnoredLabels = labels;
    }

    function isIgnoredLabel ( label, collection ) {
        // - The query only really makes sense for collections. Labels can be ignored in collections.
        // - A model doesn't ignore labels and doesn't have a _pickyIgnoredLabels property, so return false for a model.
        // - If the label is undefined, return false, too.
        return ( label && collection._pickyIgnoredLabels ) ? _.contains( collection._pickyIgnoredLabels, label ) : false;
    }

    function getSelectionSizeProp ( label ) {
        // For Select.Many collections only
        return label + "Length";
    }

    function getSelectionSize( collection, label ) {
        // For Select.Many collections only
        return collection[getSelectionSizeProp( label )];
    }

    function setSelectionSize( size, collection, label ) {
        // For Select.Many collections only
        collection[getSelectionSizeProp( label )] = size;
    }

    function forEachLabelInModelOrCollection ( model, collection, callback ) {
        var labels = _.keys( _.extend( {}, collection._pickyLabels, model._pickyLabels ) );
        _.each( labels, function ( label, index ) {
            callback( label, model, collection, index, labels );
        } );
    }
    
    function forEachLabelInCollection ( collection, callback ) {
        _forEachEntityLabel( collection, callback );
    }

    function forEachLabelInModel ( model, callback ) {
        _forEachEntityLabel( model, callback );
    }

    function _forEachEntityLabel ( collectionOrModel, callback ) {
        var labels = _.keys( collectionOrModel._pickyLabels );
        _.each( labels, function ( label, index ) {
            callback( label, collectionOrModel, index, labels );
        } );
    }

    function multiSelectionToArray ( selectionsHash ) {
        function mapper ( value, key ) {
            selectedArr[key] = value;
        }

        var selectedArr = [];
        _.each( selectionsHash, mapper );

        return selectedArr;
    }

    function initOptions ( options ) {
        options || (options = {});
        options._processedBy || (options._processedBy = {});
        options._eventQueue || (options._eventQueue = []);

        return options;
    }

    function queueEventSet ( eventName, label, eventArgs, context, storage ) {
        // Queue two events which are identical, except that one is namespaced to the label.
        queueEvent( storage, context, [ eventName ].concat( eventArgs ) );
        queueEvent( storage, context, [ eventName + ":" + label ].concat( eventArgs ) );
    }

    function queueEvent ( storage, context, triggerArgs ) {
        // Use either _eventQueue, which will eventually be processed by the calling
        // object, or _eventQueueAppendOnly, which is another object's event queue
        // and resolved elsewhere. _eventQueueAppendOnly exists only when needed,
        // and thus takes precedence.
        var queue = storage._eventQueueAppendOnly || storage._eventQueue;
        queue.push( {
            context: context,
            triggerArgs: triggerArgs
        } );
    }

    function processEventQueue ( storage ) {
        var resolved, eventData;

        if ( storage._eventQueue.length ) {
            resolved = _.every( storage._processedBy, function ( entry ) {
                return entry.done;
            } );

            if ( resolved ) {
                mergeMultiSelectEvents( storage._eventQueue );
                while ( storage._eventQueue.length ) {
                    eventData = storage._eventQueue.pop();
                    eventData.context.trigger.apply( eventData.context, eventData.triggerArgs );
                }
            }
        }
    }

    // Merges separate (sub-)events of a Select.Many collection into a single,
    // summary event, and cleans up the event queue.
    //
    // NB "reselect:any" events stand on their own and are not merged into a joint
    // select:some event. They only occur once per collection in the event queue.
    function mergeMultiSelectEvents ( queue ) {
        var multiSelectCollections = {};

        // Create merged data for each multi-select collection
        _.each( queue, function ( event, index ) {
            var label, datasetId, extractedData, diff, opts,
                context = event.context,
                eventName = event.triggerArgs[0];

            // Only act on queue entries for Backbone.Select.Many, and ignore their "reselect:any" events.
            if ( context._pickyType === "Backbone.Select.Many" && eventName.indexOf( "reselect:any" ) === -1 ) {

                // NB Label (= event namespace) is an empty string for the non-namespaced event
                label = eventName.replace( /^select:(all|some|none):?/, "" );
                datasetId = context._pickyCid + "-ns-" + label;

                extractedData = multiSelectCollections[datasetId];
                if ( !extractedData ) extractedData = multiSelectCollections[datasetId] = {
                    context: context,
                    label: label,
                    indexes: [],
                    merged: {
                        selected: [],
                        deselected: [],
                        options: {}
                    }
                };

                extractedData.indexes.push( index );

                diff = event.triggerArgs[1];
                opts = event.triggerArgs[3];
                extractedData.merged.selected = extractedData.merged.selected.concat( diff.selected );
                extractedData.merged.deselected = extractedData.merged.deselected.concat( diff.deselected );
                _.extend( extractedData.merged.options, opts );

            }
        } );

        // If there are multiple event entries for a collection, remove them from
        // the queue and append a merged event.

        // - Don't touch the queued events for multi-select collections which have
        //   just one entry.
        multiSelectCollections = _.filter( multiSelectCollections, function ( entry ) {
            return entry.indexes.length > 1;
        } );

        // - Remove existing entries in the queue.
        var removeIndexes = _.flatten( _.pluck( multiSelectCollections, "indexes" ) );
        removeIndexes.sort( function ( a, b ) {
            return a - b;
        } );
        _.each( removeIndexes, function ( position, index ) {
            queue.splice( position - index, 1 );
        } );

        // - Append merged event entry.
        _.each( multiSelectCollections, function ( extractedData ) {

            // NB Multiple entries only occur if a select has been accompanied by
            // one or more deselects. By definition, that translates into a
            // select:some event (and never into select:all, select:none).
            queue.push( {
                context: extractedData.context,
                triggerArgs: [
                    extractedData.label ? "select:some:" + extractedData.label : "select:some",
                    { selected: extractedData.merged.selected, deselected: extractedData.merged.deselected },
                    extractedData.context,
                    extractedData.merged.options
                ]
            } );

        } );

    }

    // Overloads the select method. Provides access to the previous, legacy
    // implementation, based on the arguments passed to the method.
    //
    // If `select` is called with a model as first parameter, the `select`
    // method of the mixin is used, otherwise the previous implementation is
    // called.
    function overloadSelect ( oldSelect, context ) {

        context.select = (function () {
            var mixinSelect = context.select;
            return function ( model ) {
                if ( model instanceof Backbone.Model ) {
                    return mixinSelect.apply( context, arguments );
                } else {
                    return oldSelect.apply( context, arguments );
                }
            };
        })();

    }

    // Creates a new trigger method which calls the predefined event handlers
    // (onDeselect etc) as well as triggering the event.
    //
    // Adapted from Marionette.triggerMethod.
    function augmentTrigger ( context ) {

        context.trigger = (function () {

            var origTrigger = context.trigger;

            // Return an augmented trigger method implementation, in order to replace
            // the original trigger method
            return function ( event, eventArgs ) {

                if ( isSelectionEvent( event ) ) {
                    // get the method name from the event name
                    var unifiedEvent = unifyEventNames( event ),

                    // Split the event name on the ":" (regex), capitalize, add "on" prefix
                        methodName = 'on' + unifiedEvent.replace( /(^|:)(\w)/gi, getEventName ),
                        method = this[methodName];

                    // call the onMethodName if it exists
                    if ( _.isFunction( method ) ) {
                        // pass all trigger arguments, except the event name
                        method.apply( this, _.tail( arguments ) );
                    }
                }

                // trigger the event
                origTrigger.apply( this, arguments );
                return this;

            };

        })();
    }

    // Helpers for augmentTrigger

    // Checks if the event is generated by Backbone.Select. Excludes internal
    // events like `_selected`.
    function isSelectionEvent ( eventName ) {
        return ( /^([rd]e)?select(ed)?($|:)/ ).test( eventName );
    }

    // Take the event section ("section1:section2:section3") and turn it
    // into an uppercase name
    //noinspection JSUnusedLocalSymbols
    function getEventName ( match, prefix, eventName ) {
        return eventName.toUpperCase();
    }

    // Unifies event names for the method call:
    // - (re, de)selected   => (re, de)select
    // - (re, de)select:one => (re, de)select
    // - reselect:any       => reselect
    function unifyEventNames ( eventName ) {
        if ( eventName.slice( -2 ) === "ed" ) {
            eventName = eventName.slice( 0, -2 );
        } else if ( eventName.slice( -4 ) === ":one" || eventName.slice( -4 ) === ":any" ) {
            eventName = eventName.slice( 0, -4 );
        }

        return eventName;
    }

    Backbone.Select = Select;

} )( Backbone, _ );
