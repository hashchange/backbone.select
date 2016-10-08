;( function ( root, factory ) {
    "use strict";

    // UMD for a Backbone plugin. Supports AMD, Node.js, CommonJS and globals.
    //
    // - Code lives in the Backbone namespace.
    // - The module does not export a meaningful value.
    // - The module does not create a global.

    var supportsExports = typeof exports === "object" && exports && !exports.nodeType && typeof module === "object" && module && !module.nodeType;

    // AMD:
    // - Some AMD build optimizers like r.js check for condition patterns like the AMD check below, so keep it as is.
    // - Check for `exports` after `define` in case a build optimizer adds an `exports` object.
    // - The AMD spec requires the dependencies to be an array **literal** of module IDs. Don't use a variable there,
    //   or optimizers may fail.
    if ( typeof define === "function" && typeof define.amd === "object" && define.amd ) {

        // AMD module
        define( [ "exports", "underscore", "backbone" ], factory );

    } else if ( supportsExports ) {

        // Node module, CommonJS module
        factory( exports, require( "underscore" ), require( "backbone" ) );

    } else  {

        // Global (browser or Rhino)
        factory( {}, _, Backbone );

    }

}( this, function ( exports, _, Backbone ) {
    "use strict";

    var illegalLabelNames = [],

        Mixins = {

            SelectOne: {

                // Type indicator, part of the API (monitored by tests). Can be queried safely by other components. Use
                // it read-only.
                _pickyType: "Backbone.Select.One",

                select: function ( model, options ) {
                    var label, reselected, eventOptions, forwardedOptions;

                    options = initOptions( options );
                    if ( options["@bbs:processedBy"][this._pickyCid] ) return this;

                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    reselected = model && this[label] === model ? model : undefined;

                    if ( !reselected ) {
                        // Using eventQueueAppendOnly instead of eventQueue for the forwarded options:
                        //
                        // When a deselect sub action is initiated from a select action, the deselection events are
                        // added to the common event queue. But the event queue must not be resolved prematurely during
                        // the deselection phase. Resolution is prevented by naming the queue differently.
                        //
                        // See getActiveQueue() for a detailed description of the process. (Also explains why
                        // processedBy is omitted in the call.)
                        forwardedOptions = _.extend(
                            _.omit( options, "@bbs:silentLocally", "@bbs:processedBy", "@bbs:eventQueue" ),
                            { "@bbs:eventQueueAppendOnly": getActiveQueue( options ) }
                        );

                        this.deselect( undefined, forwardedOptions );
                        this[label] = model;
                    }
                    options["@bbs:processedBy"][this._pickyCid] = { done: false };

                    if ( !options["@bbs:processedBy"][this[label].cid] ) this[label].select( stripLocalOptions( options ) );

                    if ( !( options.silent || options["@bbs:silentLocally"] ) ) {

                        eventOptions = toEventOptions( options, label, this );
                        if ( reselected ) {
                            if ( !options["@bbs:silentReselect"] ) queueEventSet( "reselect:one", label, [ model, this, eventOptions ], this, options );
                        } else {
                            queueEventSet( "select:one", label, [ model, this, eventOptions ], this, options );
                        }

                    }

                    options["@bbs:processedBy"][this._pickyCid].done = true;
                    processEventQueue( options );

                    return this;
                },

                deselect: function ( model, options ) {
                    var label;

                    options = initOptions( options );
                    if ( options["@bbs:processedBy"][this._pickyCid] ) return this;

                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) || !this[label] ) return this;

                    // The messageOnly flag is used for a noop which is supposed to convey the label name only, and
                    // make sure it is registered. That's done, so we can bail out now.
                    if ( options["@bbs:messageOnly"] ) return this;

                    model = model || this[label];
                    if ( this[label] !== model ) return this;

                    options["@bbs:processedBy"][this._pickyCid] = { done: false };

                    delete this[label];
                    if ( !options["@bbs:skipModelCall"] ) model.deselect( stripLocalOptions( options ) );
                    if ( !( options.silent || options["@bbs:silentLocally"] ) ) queueEventSet( "deselect:one", label, [ model, this, toEventOptions( options, label, this ) ], this, options );

                    options["@bbs:processedBy"][this._pickyCid].done = true;
                    processEventQueue( options );

                    return this;
                },

                close: function () {
                    unregisterCollectionWithModels( this );
                    this.stopListening();

                    return this;
                }

            },

            SelectMany: {

                // Type indicator, part of the API (monitored by tests). Can be queried safely by other components. Use
                // it read-only.
                _pickyType: "Backbone.Select.Many",

                select: function ( model, options ) {
                    var label, prevSelected, reselected, forwardedOptions;

                    options = initOptions( options );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    prevSelected = _.clone( this[label] );
                    reselected = this[label][model.cid] ? [model] : [];

                    if ( reselected.length && options["@bbs:processedBy"][this._pickyCid] ) return this;

                    if ( options.exclusive ) {
                        // Using eventQueueAppendOnly instead of eventQueue for the forwarded options: See .select() in
                        // Select.One or, in more detail, getActiveQueue() (also explains why processedBy is omitted in
                        // the call).
                        forwardedOptions = _.extend(
                            _.omit( options, "@bbs:eventQueue", "exclusive" ),
                            { "@bbs:eventQueueAppendOnly": getActiveQueue( options ), "@bbs:silentLocally": true }
                        );

                        this.each( function ( iteratedModel ) {
                            if ( iteratedModel !== model ) this.deselect( iteratedModel, _.omit( forwardedOptions, "@bbs:processedBy" ) );
                        }, this );
                    }

                    if ( !reselected.length ) {
                        this[label][model.cid] = model;
                        setSelectionSize( _.size( this[label] ), this, label );
                    }
                    options["@bbs:processedBy"][this._pickyCid] = { done: false };

                    if ( !options["@bbs:processedBy"][model.cid] ) model.select( stripLocalOptions( options ) );
                    triggerMultiSelectEvents( this, prevSelected, options, reselected );

                    options["@bbs:processedBy"][this._pickyCid].done = true;
                    processEventQueue( options );

                    return this;
                },

                deselect: function ( model, options ) {
                    var label, prevSelected;

                    if ( !model ) return this.deselectAll( options );

                    options = initOptions( options );
                    if ( options["@bbs:processedBy"][this._pickyCid] ) return this;

                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    // The messageOnly flag is used for a noop which is supposed to convey the label name only, and
                    // make sure it is registered. That's done, so we can bail out now.
                    if ( options["@bbs:messageOnly"] ) return this;

                    prevSelected = _.clone( this[label] );

                    if ( !this[label][model.cid] ) return this;

                    options["@bbs:processedBy"][this._pickyCid] = { done: false };

                    delete this[label][model.cid];
                    setSelectionSize( _.size( this[label] ), this, label );

                    if ( !options["@bbs:skipModelCall"] ) model.deselect( stripLocalOptions( options ) );
                    triggerMultiSelectEvents( this, prevSelected, options );

                    options["@bbs:processedBy"][this._pickyCid].done = true;
                    processEventQueue( options );

                    return this;
                },

                selectAll: function ( options ) {
                    var label, prevSelected, forwardedOptions,
                        reselected = [];

                    options = initOptions( options );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    prevSelected = _.clone( this[label] );

                    // Using eventQueueAppendOnly instead of eventQueue for the forwarded options: See .select() in
                    // Select.One or, in more detail, getActiveQueue() (also explains why processedBy is omitted in the
                    // call).
                    forwardedOptions = _.extend(
                        _.omit( options, "@bbs:eventQueue", "exclusive" ),
                        { "@bbs:eventQueueAppendOnly": getActiveQueue( options ), "@bbs:silentLocally": true }
                    );

                    this.each( function ( model ) {
                        if ( this[label][model.cid] ) reselected.push( model );
                        this.select( model, _.omit( forwardedOptions, "@bbs:processedBy" ) );
                    }, this );

                    setSelectionSize( _.size( this[label] ), this, label );

                    triggerMultiSelectEvents( this, prevSelected, options, reselected );

                    if ( options["@bbs:processedBy"][this._pickyCid] ) {
                        options["@bbs:processedBy"][this._pickyCid].done = true;
                    } else {
                        options["@bbs:processedBy"][this._pickyCid] = { done: true };
                    }
                    processEventQueue( options );

                    return this;
                },

                invertSelection: function ( options ) {
                    var label, prevSelected, forwardedOptions;

                    options = initOptions( options );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    prevSelected = _.clone( this[label] );

                    // Using eventQueueAppendOnly instead of eventQueue for the forwarded options: See .select() in
                    // Select.One or, in more detail, getActiveQueue() (also explains why processedBy is omitted in the
                    // call).
                    forwardedOptions = _.extend(
                        _.omit( options, "@bbs:eventQueue", "exclusive" ),
                        { "@bbs:eventQueueAppendOnly": getActiveQueue( options ), "@bbs:silentLocally": true }
                    );

                    this.each( function ( model ) {
                        if ( this[label][model.cid] ) {
                            this.deselect( model, _.omit( forwardedOptions, "@bbs:processedBy" ) );
                        } else {
                            this.select( model, _.omit( forwardedOptions, "@bbs:processedBy" ) );
                        }
                    }, this );

                    setSelectionSize( _.size( this[label] ), this, label );

                    triggerMultiSelectEvents( this, prevSelected, options );

                    if ( options["@bbs:processedBy"][this._pickyCid] ) {
                        options["@bbs:processedBy"][this._pickyCid].done = true;
                    } else {
                        options["@bbs:processedBy"][this._pickyCid] = { done: true };
                    }
                    processEventQueue( options );

                    return this;
                },

                deselectAll: function ( options ) {
                    var prevSelected, label, forwardedOptions;

                    options = initOptions( options );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    if ( getSelectionSize( this, label ) === 0 ) return this;
                    prevSelected = _.clone( this[label] );

                    // Using eventQueueAppendOnly instead of eventQueue for the forwarded options: See .select() in
                    // Select.One or, in more detail, getActiveQueue() (also explains why processedBy is omitted in the
                    // call).
                    forwardedOptions = _.extend(
                        _.omit( options, "@bbs:eventQueue" ),
                        { "@bbs:eventQueueAppendOnly": getActiveQueue( options ), "@bbs:silentLocally": true }
                    );

                    this.each( function ( model ) {
                        this.deselect( model, _.omit( forwardedOptions, "@bbs:processedBy" ) );
                    }, this );

                    setSelectionSize( 0, this, label );

                    triggerMultiSelectEvents( this, prevSelected, options );

                    if ( options["@bbs:processedBy"][this._pickyCid] ) {
                        options["@bbs:processedBy"][this._pickyCid].done = true;
                    } else {
                        options["@bbs:processedBy"][this._pickyCid] = { done: true };
                    }
                    processEventQueue( options );

                    return this;
                },

                selectNone: function ( options ) {
                    return this.deselectAll( options );
                },

                // Toggle select all / none. If some are selected, it will select all. If all are selected, it will
                // select none. If none are selected, it will select all.
                toggleSelectAll: function ( options ) {
                    var label;

                    options || ( options = {} );
                    label = getLabel( options, this );
                    if ( isIgnoredLabel( label, this ) ) return this;

                    if ( getSelectionSize( this, label ) === this.length ) {
                        this.deselectAll( options );
                    } else {
                        this.selectAll( options );
                    }

                    return this;
                },

                close: function () {
                    unregisterCollectionWithModels( this );
                    this.stopListening();

                    return this;
                }
            },

            SelectMe: {

                // Type indicator, part of the API (monitored by tests). Can be queried safely by other components. Use
                // it read-only.
                _pickyType: "Backbone.Select.Me",

                select: function ( options ) {
                    var label, reselected, eventOptions;

                    options = initOptions( options );
                    if ( options["@bbs:processedBy"][this.cid] ) return this;

                    options["@bbs:processedBy"][this.cid] = { done: false };

                    label = getLabel( options, this );
                    reselected = this[label];
                    this[label] = true;

                    // Notify collections with an event
                    if ( this._pickyCollections )  this.trigger( "@bbs:_selected", this, stripLocalOptionsExcept( options, "exclusive" ) );

                    if ( !( options.silent || options["@bbs:silentLocally"] ) ) {
                        eventOptions = toEventOptions( options, label, this );

                        if ( reselected ) {
                            if ( !options["@bbs:silentReselect"] ) queueEventSet( "reselected", label, [ this, eventOptions ], this, options );
                        } else {
                            queueEventSet( "selected", label, [ this, eventOptions ], this, options );
                        }
                    }

                    options["@bbs:processedBy"][this.cid].done = true;
                    processEventQueue( options );

                    return this;
                },

                deselect: function ( options ) {
                    var label, isNoop;

                    options = initOptions( options );
                    if ( options["@bbs:processedBy"][this.cid] ) return this;

                    label = getLabel( options, this );
                    isNoop = !this[label];

                    options["@bbs:processedBy"][this.cid] = { done: isNoop };
                    this[label] = false;

                    // Notify collections with an event
                    if ( this._pickyCollections ) {
                        if ( isNoop ) options = _.extend( options, { "@bbs:messageOnly": true } );
                        this.trigger( "@bbs:_deselected", this, stripLocalOptions( options ) );
                    }

                    if ( isNoop ) return this;

                    if ( !( options.silent || options["@bbs:silentLocally"] ) ) queueEventSet( "deselected", label, [ this, toEventOptions( options, label, this ) ], this, options );

                    options["@bbs:processedBy"][this.cid].done = true;
                    processEventQueue( options );

                    return this;
                },

                toggleSelected: function ( options ) {
                    var label;

                    options || ( options = {} );
                    label = getLabel( options, this );

                    if ( this[label] ) {
                        this.deselect( options );
                    } else {
                        this.select( options );
                    }

                    return this;
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
                    if ( arguments.length < 2 ) throw new Error( "The `models` parameter has not been passed to Select.One.applyTo. Its value can be undefined, or null, if no models are passed in during instantiation, but even so, it must be provided." );

                    // Store a reference to the existing select method (most likely the default
                    // Backbone.Collection.select method). Used to overload the new select method.
                    oldSelect = hostObject.select;

                    _.extend( hostObject, Mixins.SelectOne );

                    hostObject._pickyCid = _.uniqueId( 'singleSelect' );

                    hostObject._pickyLabels = {};
                    hostObject._pickyDefaultLabel = options && options.defaultLabel || "selected";
                    registerIgnoredLabels( options && options.ignoreLabel, hostObject );
                    ensureLabelIsRegistered( hostObject._pickyDefaultLabel, hostObject );

                    augmentTrigger( hostObject );
                    overloadSelect( oldSelect, hostObject );

                    patchSilentAdd( hostObject );
                    patchSilentSet( hostObject );
                    patchSilentRemove( hostObject );
                    patchSilentReset( hostObject );

                    if ( _.isArray( models ) ) {

                        // Setting up the models.
                        _.each( models, function ( model ) {

                            // Bail out if the item is not a model.
                            //
                            // In that case, Backbone creates the model(s) when the collection is populated, with a
                            // silent reset(). That happens just before the constructor exits, after initialize() has
                            // run. The model setup is deferred until after the reset. (It is handled by
                            // onResetSingleSelect(), which is invoked at the end of the reset.)
                            //
                            // NB When Backbone models are passed in, the setup is done here. Then, selections can be
                            // made immediately after the mixin is applied - ie, in initialize(). If raw model data is
                            // passed in, selections can't be made in initialize().
                            if ( !( model && model instanceof Backbone.Model ) ) return;

                            // Auto-apply the Backbone.Select.Me mixin if not yet done for the model.
                            //
                            // Options are passed on to the mixin. Ie, if `defaultLabel` has been defined for the
                            // collection, the model will share it. If models need a different setting, do not rely on
                            // an auto-applied mixin.
                            ensureModelMixin( model, options );

                            registerCollectionWithModel( model, hostObject );

                            forEachLabelInModel( model, function ( label ) {
                                ensureLabelIsRegistered( label, hostObject );
                                if ( model[label] && !isIgnoredLabel( label, hostObject ) ) {
                                    if ( hostObject[label] ) hostObject[label].deselect( { label: label } );
                                    hostObject[label] = model;
                                }
                            } );

                        } );

                    }

                    hostObject.listenTo( hostObject, '@bbs:_selected', hostObject.select );
                    hostObject.listenTo( hostObject, '@bbs:_deselected', hostObject.deselect );

                    // NB Calls to reset, add, remove are handled by listening to the corresponding event. That doesn't
                    // work when the call is silenced (silent option). Then, the handler is called directly (sans event)
                    // by the patched version of each method.
                    hostObject.listenTo( hostObject, 'reset', onResetSingleSelect );
                    hostObject.listenTo( hostObject, 'add', onAdd );
                    hostObject.listenTo( hostObject, 'remove', onRemove );

                }

            },

            Many: {

                applyTo: function ( hostObject, models, options ) {
                    var oldSelect;

                    if ( !_.isObject( hostObject ) ) throw new Error( "The host object is undefined or not an object." );
                    if ( arguments.length < 2 ) throw new Error( "The `models` parameter has not been passed to Select.One.applyTo. Its value can be undefined, or null, if no models are passed in during instantiation, but even so, it must be provided." );

                    // Store a reference to the existing select method (most likely the default
                    // Backbone.Collection.select method). Used to overload the new select method.
                    oldSelect = hostObject.select;

                    _.extend( hostObject, Mixins.SelectMany );

                    hostObject._pickyCid = _.uniqueId( 'multiSelect' );

                    hostObject._pickyLabels = {};
                    hostObject._pickyDefaultLabel = options && options.defaultLabel || "selected";
                    registerIgnoredLabels( options && options.ignoreLabel, hostObject );
                    ensureLabelIsRegistered( hostObject._pickyDefaultLabel, hostObject );

                    augmentTrigger( hostObject );
                    overloadSelect( oldSelect, hostObject );

                    patchSilentAdd( hostObject );
                    patchSilentSet( hostObject );
                    patchSilentRemove( hostObject );
                    patchSilentReset( hostObject );

                    if ( _.isArray( models ) ) {

                        // Setting up the models.
                        _.each( models, function ( model ) {

                            // Bail out if the item is not a model.
                            //
                            // In that case, Backbone creates the model(s) when the collection is populated, with a
                            // silent reset(). That happens just before the constructor exits, after initialize() has
                            // run. The model setup is deferred until after the reset. (It is handled by
                            // onResetMultiSelect(), which is invoked at the end of the reset.)
                            //
                            // NB When Backbone models are passed in, the setup is done here. Then, selections can be
                            // made immediately after the mixin is applied - ie, in initialize(). If raw model data is
                            // passed in, selections can't be made in initialize().
                            if ( !( model && model instanceof Backbone.Model ) ) return;

                            // Auto-apply the Backbone.Select.Me mixin if not yet done for the model.
                            //
                            // Options are passed on to the mixin. Ie, if `defaultLabel` has been defined for the
                            // collection, the model will share it. If models need a different setting, do not rely on
                            // an auto-applied mixin.
                            ensureModelMixin( model, options );

                            registerCollectionWithModel( model, hostObject );

                            forEachLabelInModel( model, function ( label ) {
                                ensureLabelIsRegistered( label, hostObject );
                                if ( model[label] && !isIgnoredLabel( label, hostObject ) ) {
                                    hostObject[label][model.cid] = model;
                                }
                            } );

                        } );

                    }

                    hostObject.listenTo( hostObject, '@bbs:_selected', hostObject.select );
                    hostObject.listenTo( hostObject, '@bbs:_deselected', hostObject.deselect );

                    // NB Calls to reset, add, remove are handled by listening to the corresponding event. That doesn't
                    // work when the call is silenced (silent option). Then, the handler is called directly (sans event)
                    // by the patched version of each method.
                    hostObject.listenTo( hostObject, 'reset', onResetMultiSelect );
                    hostObject.listenTo( hostObject, 'add', onAdd );
                    hostObject.listenTo( hostObject, 'remove', onRemove );

                }

            }

        };


    // Helper Methods
    // --------------

    /** @type {string[]}  options which are local to a method call, and not inherited by other method calls */
    var localOptions = ["@bbs:silentLocally", "_externalEvent", "exclusive"],

        /** @type {string[]}  options which are used internally for communicating across method calls, should not appear in public events */
        internalOptions = ["@bbs:messageOnly", "@bbs:silentLocally", "@bbs:silentReselect", "@bbs:skipModelCall", "@bbs:processedBy", "@bbs:eventQueue", "@bbs:eventQueueAppendOnly", "@bbs:backboneSubcall"];

    // Trigger events from a multi-select collection, based on the number of selected items.
    function triggerMultiSelectEvents ( collection, prevSelected, options, reselected ) {
        function mapCidsToModels ( cids, collection, previousSelection ) {
            function mapper ( cid ) {
                // Find the model in the collection. If not found, it has been removed, so get it from the array of
                // previously selected models.
                return collection.get( cid ) || previousSelection[cid];
            }

            return _.map( cids, mapper );
        }

        if ( options.silent || options["@bbs:silentLocally"] ) return;

        var diff,
            label = getLabel( options, collection ),

            selectionSize = getSelectionSize( collection, label ),
            length = collection.length,

            prevSelectedCids = _.keys( prevSelected ),
            selectedCids = _.keys( collection[label] ),
            addedCids = _.difference( selectedCids, prevSelectedCids ),
            removedCids = _.difference( prevSelectedCids, selectedCids ),

            unchanged = (selectionSize === prevSelectedCids.length && addedCids.length === 0 && removedCids.length === 0);

        if ( reselected && reselected.length && !options["@bbs:silentReselect"] ) {
            queueEventSet( "reselect:any", label, [ reselected, collection, toEventOptions( options, label, collection ) ], collection, options );
        }

        if ( unchanged ) return;

        diff = {
            selected: mapCidsToModels( addedCids, collection, prevSelected ),
            deselected: mapCidsToModels( removedCids, collection, prevSelected )
        };

        if ( selectionSize === 0 ) {
            queueEventSet( "select:none", label, [ diff, collection, toEventOptions( options, label, collection ) ], collection, options );
            return;
        }

        if ( selectionSize === length ) {
            queueEventSet( "select:all", label, [ diff, collection, toEventOptions( options, label, collection ) ], collection, options );
            return;
        }

        if ( selectionSize > 0 && selectionSize < length ) {
            queueEventSet( "select:some", label, [ diff, collection, toEventOptions( options, label, collection ) ], collection, options );
            return;
        }
    }

    function onAdd ( model, collection, options ) {
        ensureModelMixin( model, options );

        registerCollectionWithModel( model, collection );
        forEachLabelInModel( model, function ( label ) {
            var selectOptions;
            // We want to keep the list of registered labels as small as possible in the collection, in order to keep
            // the processing overhead low.
            //
            // In Select.One collections, there is no need to register a label before we encounter a model which is
            // selected with it. The collection property for the label does not have to be created before - it would be
            // left undefined anyway. (Below, a collection.select() call handles label creation when it is required.)
            //
            // In Select.Many collections, however, existing labels should be registered even if no model is selected
            // with that label at the moment. We want the collection property for the label to exist, even if it is just
            // an empty hash. That way, we don't have to guard against the property being undefined when it is queried
            // in client code.
            if ( collection._pickyType === "Backbone.Select.Many" ) ensureLabelIsRegistered( label, collection );

            selectOptions = { "@bbs:silentReselect": true, _externalEvent: "add", label: label };
            if ( options.silent ) selectOptions.silent = options.silent;

            if ( model[label] ) collection.select( model, selectOptions );
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
                    deselectOptions = _.extend( {}, options, { label: label, "@bbs:skipModelCall": true } );
                }

                collection.deselect( model, deselectOptions );
            }

        } );
    }

    function onResetSingleSelect ( collection, options ) {
        var selected, releaseOptions, deselectOptions, excessiveSelections,
            deselectOnRemove = {};

        forEachLabelInCollection( collection, function ( label ) {
            var removeThis = _.find( options.previousModels, function ( model ) { return model[label]; } );
            if ( removeThis ) deselectOnRemove[removeThis.cid] = removeThis;
        } );

        releaseOptions = { "@bbs:silentLocally": true };
        if ( options.silent ) releaseOptions.silent = options.silent;

        _.each( deselectOnRemove, function ( model ) {
            releaseModel( model, collection, releaseOptions );
        } );

        _.each( options.previousModels, function ( model ) {
            if ( model._pickyCollections ) model._pickyCollections = _.without( model._pickyCollections, collection._pickyCid );
        } );

        collection.each( function ( model ) {
            ensureModelMixin( model, options );
            registerCollectionWithModel( model, collection );
            ensureModelLabelsInCollection( model, collection );
        } );

        forEachLabelInCollection( collection, function ( label ) {

            selected = collection.filter( function ( model ) { return model[label]; } );
            excessiveSelections = _.initial( selected );

            deselectOptions = { label: label };
            if ( options.silent ) deselectOptions.silent = options.silent;

            if ( excessiveSelections.length ) _.each( excessiveSelections, function ( model ) { model.deselect( deselectOptions ); } );
            if ( selected.length ) collection.select( _.last( selected ), { silent: true, label: label } );

        } );
    }

    function onResetMultiSelect ( collection, options ) {
        var select, deselectOptions,
            deselect = _.filter( options.previousModels, function ( model ) { return isModelSelectedWithAnyCollectionLabel( model, collection ); } );

        deselectOptions = { "@bbs:silentLocally": true };
        if ( options.silent ) deselectOptions.silent = options.silent;

        if ( deselect ) _.each( deselect, function ( model ) { releaseModel( model, collection, deselectOptions ); } );

        _.each( options.previousModels, function ( model ) {
            if ( model._pickyCollections ) model._pickyCollections = _.without( model._pickyCollections, collection._pickyCid );
        } );

        collection.each( function ( model ) {
            ensureModelMixin( model, options );
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
            releaseModel( model, collection, { "@bbs:silentLocally": true } );
        } );
    }

    function stripLocalOptions ( options ) {
        return _.omit( options, localOptions );
    }

    function stripLocalOptionsExcept ( options, exceptions ) {
        var omit = localOptions;

        if ( exceptions ) {
            if ( _.isString( exceptions ) ) exceptions = [exceptions];
            omit = _.without.apply( undefined, [ localOptions ].concat( exceptions ) );
        }

        return _.omit( options, omit );
    }

    function stripInternalOptions ( options ) {
        return _.omit( options, internalOptions );
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

    // Auto-apply the Backbone.Select.Me mixin if not yet done for the model.
    //
    // Options are passed on to the mixin. Ie, if `defaultLabel` has been defined in the options, the model will be set
    // up accordingly.
    function ensureModelMixin( model, options ) {
        if ( !model._pickyType ) Backbone.Select.Me.applyTo( model, options );
    }

    function ensureLabelIsRegistered ( name, obj ) {
        if ( name && !obj._pickyLabels[name] && !isIgnoredLabel( name, obj ) ) {
            // Check if the name is safe
            if ( _.indexOf( illegalLabelNames, name ) !== -1 ) throw new Error( 'Illegal label name "' + name + '", is in conflict with an existing Backbone or Backbone.Select property or method' );

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

    function initOptions ( options ) {
        options || (options = {});
        options["@bbs:processedBy"] || (options["@bbs:processedBy"] = {});
        options["@bbs:eventQueue"] || (options["@bbs:eventQueue"] = []);

        return options;
    }

    function queueEventSet ( eventName, label, eventArgs, context, storage ) {
        // Queue two events which are identical, except that one is namespaced to the label.
        queueEvent( storage, context, [ eventName ].concat( eventArgs ) );
        queueEvent( storage, context, [ eventName + ":" + label ].concat( eventArgs ) );
    }

    function getActiveQueue ( storage ) {
        // There are two properties which could store the queue:
        //
        // - Usually, the queue is stored in the eventQueue property.
        //
        //   The queue will eventually be processed by the object which created it. The eventQueue is created in the
        //   initial select/deselect method call which started the whole thing. When all secondary calls are done and
        //   the end of that method is reached, the eventQueue is processed.
        //
        //   Secondary calls on other objects just add to the queue. They don't resolve it when they reach their own
        //   processEventQueue() because its resolution is blocked by the original method. That method has created a
        //   processedBy entry for the calling object which is not yet marked as done. (All processedBy entries must be
        //   marked as done when the queue is processed.)
        //
        //   In the course of secondary calls, the original object is called back sometimes. These recursive, tertiary
        //   calls also don't resolve the queue (which would be premature). They also don't have to do any real work,
        //   except for some minor tasks. Recursive, tertiary calls return early when a processedBy entry for the object
        //   exists, whether it is marked done or not. Hence, they don't reach processEventQueue().
        //
        // - Sometimes, though, recursive calls to methods on the original object _have_ to do real work and must be
        //   followed through. For those calls, the processedBy entry is not passed on. They don't return early
        //   (allowing them to do their work), add events to the queue etc, but when their end is reached,
        //   processEventQueue() must not process the queue.
        //
        //   That's why they don't receive the queue in eventQueue. Instead, the queue object is referenced in
        //   eventQueueAppendOnly during these calls. The eventQueueAppendOnly property is left alone by
        //   processEventQueue(), protecting the queue from premature resolution.
        //
        //   New events in these recursive calls must be added to eventQueueAppendOnly, not eventQueue, which just
        //   contains an unused, empty hash. The original calling method shares the reference, and will process the
        //   queue in the end, including the events added by the recursive call.
        //
        // eventQueueAppendOnly exists only when needed, and thus takes precedence. If it exists, it is the active
        // queue, whereas eventQueue just contains an unused, empty hash. If not, eventQueue is the real thing.
        return storage["@bbs:eventQueueAppendOnly"] || storage["@bbs:eventQueue"];
    }

    function queueEvent ( storage, context, triggerArgs ) {
        var queue = getActiveQueue( storage );
        queue.push( {
            context: context,
            triggerArgs: triggerArgs
        } );
    }

    function processEventQueue ( storage ) {
        var resolved, eventData;

        if ( storage["@bbs:eventQueue"].length ) {
            resolved = _.every( storage["@bbs:processedBy"], function ( entry ) {
                return entry.done;
            } );

            if ( resolved ) {
                mergeMultiSelectEvents( storage["@bbs:eventQueue"] );
                while ( storage["@bbs:eventQueue"].length ) {
                    eventData = storage["@bbs:eventQueue"].pop();
                    eventData.context.trigger.apply( eventData.context, eventData.triggerArgs );
                }
            }
        }
    }

    // Merges separate (sub-)events of a Select.Many collection into a single, summary event, and cleans up the event
    // queue.
    //
    // NB "reselect:any" events stand on their own and are not merged into a joint select:some event. They only occur
    // once per collection in the event queue.
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

        // If there are multiple event entries for a collection, remove them from the queue and append a merged event.

        // - Don't touch the queued events for multi-select collections which have just one entry.
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

            // NB Multiple entries only occur if a select has been accompanied by one or more deselects. By definition,
            // that translates into a select:some event (and never into select:all, select:none).
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

    // Overloads the select method. Provides access to the previous, legacy implementation, based on the arguments
    // passed to the method.
    //
    // If `select` is called with a model as first parameter, the `select` method of the mixin is used, otherwise the
    // previous implementation is called.
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

    function patchSilentAdd ( context ) {
        var add = context.add;

        context.add = function () {
            var returned, models, previousModels, fakeEventOptions,

                args = _.toArray( arguments ),
                options = args[1] ? _.clone( args[1] ) : {},

                isSilent = options.silent,
                isInSubcall = options["@bbs:backboneSubcall"],
                needsFakeEvent = isSilent && !isInSubcall;

            args[1] = options;

            if ( needsFakeEvent ) {
                fakeEventOptions = _.clone( options );
                previousModels = this.models && this.models.slice() || [];
            }

            options["@bbs:backboneSubcall"] = true;
            models = returned = add.apply( this, args );

            if ( needsFakeEvent && models ) {
                if ( !_.isArray( models ) ) models = [models];
                models = _.difference( models, previousModels );

                _.each( models, function ( model ) {

                    var _options = _.clone( fakeEventOptions );
                    onAdd( model, this, _options );

                    // Notify plugins with an unofficial event.
                    //
                    // The event is safe to use: it is part of the API, guaranteed by tests.
                    this.trigger( "@bbs:add:silent", model, this, _options );

                }, this );
            }

            return returned;
        };
    }

    function patchSilentSet ( context ) {
        var set = context.set;

        context.set = function () {
            var returned, models, previousModels, modelSelectionStatus,
                addedModels, removedModels, removeIndexes, fakeEventOptions,

                args = _.toArray( arguments ),
                options = args[1] ? _.clone( args[1] ) : {},

                isSilent = options.silent,
                isInSubcall = options["@bbs:backboneSubcall"],
                needsFakeEvent = isSilent && !isInSubcall;

            args[1] = options;

            if ( needsFakeEvent ) {
                fakeEventOptions = _.clone( options );
                previousModels = this.models && this.models.slice() || [];
                modelSelectionStatus = getSelectionStatusForModels( this );
            }

            options["@bbs:backboneSubcall"] = true;
            models = returned = set.apply( this, args );

            if ( needsFakeEvent && models ) {

                if ( !_.isArray( models ) ) models = [models];

                // For consistency, the onRemove and onAdd handlers are called in the same order the events are fired
                // by set() - ie, onRemove before onAdd.
                if ( options.remove === undefined || !!options.remove ) {

                    removedModels = _.difference( previousModels, models );
                    removeIndexes = getRemoveIndexes( removedModels, previousModels );

                    _.each( removedModels, function ( model ) {

                        var _options = _.clone( fakeEventOptions );
                        _options.index = removeIndexes[model.cid];
                        _options["@bbs:wasSelected"] = modelSelectionStatus[model.cid];

                        onRemove( model, this, _options );

                        // Notify plugins with an unofficial event.
                        //
                        // The event is safe to use: it is part of the API, guaranteed by tests.
                        this.trigger( "@bbs:remove:silent", model, this, _options );

                    }, this );

                }

                if ( options.add === undefined || !!options.add ) {

                    addedModels = _.difference( models, previousModels );

                    _.each( addedModels, function ( model ) {

                        var _options = _.clone( fakeEventOptions );
                        onAdd( model, this, _options );

                        // Notify plugins with an unofficial event.
                        //
                        // The event is safe to use: it is part of the API, guaranteed by tests.
                        this.trigger( "@bbs:add:silent", model, this, _options );

                    }, this );

                }

            }

            return returned;
        };
    }

    function patchSilentRemove ( context ) {
        var remove = context.remove;

        context.remove = function () {
            var returned, removed, removeIndexes, modelSelectionStatus, fakeEventOptions,

                args = _.toArray( arguments ),
                options = args[1] ? _.clone( args[1] ) : {},
                modelsToRemove = args[0],

                isSilent = options.silent,
                isInSubcall = options["@bbs:backboneSubcall"],
                needsFakeEvent = isSilent && !isInSubcall;

            args[1] = options;

            if ( needsFakeEvent ) {
                fakeEventOptions = _.clone( options );
                removeIndexes = getRemoveIndexes( modelsToRemove, this.models );
                modelSelectionStatus = getSelectionStatusForModels( this, modelsToRemove );
            }

            options["@bbs:backboneSubcall"] = true;
            removed = returned = remove.apply( this, args );

            if ( needsFakeEvent && removed ) {
                if ( !_.isArray( removed ) ) removed = [removed];

                _.each( removed, function ( model ) {

                    var _options = _.clone( fakeEventOptions );
                    _options.index = removeIndexes[model.cid];
                    _options["@bbs:wasSelected"] = modelSelectionStatus[model.cid];

                    onRemove( model, this, _options );

                    // Notify plugins with an unofficial event.
                    //
                    // The event is safe to use: it is part of the API, guaranteed by tests.
                    this.trigger( "@bbs:remove:silent", model, this, _options );

                }, this );
            }

            return returned;
        };
    }

    function patchSilentReset ( context ) {
        var reset = context.reset,
            onReset = context._pickyType === "Backbone.Select.One" ? onResetSingleSelect : onResetMultiSelect;

        context.reset = function () {
            var returned, fakeEventOptions,

                args = _.toArray( arguments ),
                options = args[1] ? _.clone( args[1] ) : {},

                isSilent = options.silent,
                isInSubcall = options["@bbs:backboneSubcall"],
                needsFakeEvent = isSilent && !isInSubcall;

            args[1] = options;

            if ( needsFakeEvent ) {
                fakeEventOptions = _.clone( options );
                fakeEventOptions.previousModels = this.models || [];
            }

            // The internal backboneSubcall option must be passed to the reset() call. It is needed when reset()
            // delegates part of its work to add() with an internal (and silent) call. For that reason, we can't remove
            // backboneSubcall from the visible options before the "reset" event is fired - it has to be sanitized in
            // trigger() itself.
            options["@bbs:backboneSubcall"] = true;
            returned = reset.apply( this, args );

            if ( needsFakeEvent ) {
                onReset( this, fakeEventOptions );

                // Notify plugins with an unofficial event.
                //
                // The event is safe to use: it is part of the API, guaranteed by tests.
                this.trigger( "@bbs:reset:silent", this, fakeEventOptions );
            }

            return returned;
        };
    }

    // Creates a new trigger method which calls the predefined event handlers (onDeselect etc) as well as triggering the
    // event.
    //
    // Also removes the internal backboneSubcall flag from the options of a Backbone event. That can only be done here,
    // see comment in patchSilentReset().
    //
    // Adapted from Marionette.triggerMethod.
    function augmentTrigger ( context ) {

        context.trigger = (function () {

            var origTrigger = context.trigger;

            // Return an augmented trigger method implementation, in order to replace the original trigger method
            return function ( event, /** ...* */ varArgs ) {

                var args = _.toArray( arguments ),

                    isBackboneEvent_OptArg2 = event === "update" || event === "reset" || event === "sort" || event === "change",
                    isBackboneEvent_OptArg3 = event === "add" || event === "remove" || event === "destroy";

                // Remove the internal backboneSubcall flag from a Backbone event.
                if ( isBackboneEvent_OptArg2 && _.isObject( args[2] ) && _.has( args[2], "@bbs:backboneSubcall" ) ) delete args[2]["@bbs:backboneSubcall"];
                if ( isBackboneEvent_OptArg3 && _.isObject( args[3] ) && _.has( args[3], "@bbs:backboneSubcall" ) ) delete args[3]["@bbs:backboneSubcall"];

                if ( isSelectionEvent( event ) ) {
                    // get the method name from the event name
                    var unifiedEvent = unifyEventNames( event ),

                        // Split the event name on the ":" (regex), capitalize, add "on" prefix
                        methodName = 'on' + unifiedEvent.replace( /(^|:)(\w)/gi, getEventName ),
                        method = this[methodName];

                    // call the onMethodName if it exists
                    if ( _.isFunction( method ) ) {
                        // pass all trigger arguments, except the event name
                        method.apply( this, _.tail( args ) );
                    }
                }

                // trigger the event
                origTrigger.apply( this, args );
                return this;

            };

        })();
    }

    // Helpers for patchSilent*

    function getRemoveIndexes ( modelsToRemove, models ) {
        var indexes = {},
            toRemove = modelsToRemove || [];

        if( !_.isArray( toRemove ) ) toRemove = [toRemove];

        models = models.slice() || [];

        _.each( toRemove, function ( model ) {
            var index = _.indexOf( models, model );
            if ( index !== -1 ) {
                indexes[model.cid] = index;
                models.splice( index, 1 );
            }
        } );

        return indexes;
    }

    function getSelectionStatusForModels ( collection, modelSubset ) {
        var models = modelSubset || collection.models,
            modelStatusByCid = {};

        if( !_.isArray( models ) ) models = [models];

        forEachLabelInCollection( collection, function ( label ) {
            _.each( models, function ( model ) {
                modelStatusByCid[model.cid] || ( modelStatusByCid[model.cid] = {} );
                modelStatusByCid[model.cid][label] = !!model[label];
            } );
        } );

        return modelStatusByCid;
    }

    // Helpers for augmentTrigger

    // Checks if the event is generated by Backbone.Select. Excludes internal events like `@bbs:_selected`.
    function isSelectionEvent ( eventName ) {
        return ( /^([rd]e)?select(ed)?($|:)/ ).test( eventName );
    }

    // Take the event section ("section1:section2:section3") and turn it into an uppercase name
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
    Backbone.Select.version = "__COMPONENT_VERSION_PLACEHOLDER__";

    // Capture existing Backbone model and collection methods and properties, as well as the mixin methods and
    // properties, to populate a blacklist of illegal label names.
    (function () {
        var key,

            modelKeys = [],
            selectOneKeys= [],
            selectManyKeys = [],

            Model = Backbone.Model.extend( {
                initialize: function () {
                    Backbone.Select.Me.applyTo( this );
                }
            } ),

            SelectOneCollection = Backbone.Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Select.One.applyTo( this, models );
                }
            } ),

            SelectManyCollection = Backbone.Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Select.Many.applyTo( this, models );
                }
            } ),

            model = new Model(),

            selectOneCollection = new SelectOneCollection(),

            selectManyCollection = new SelectManyCollection();

        if ( _.allKeys ) {
            // _.allKeys is not available before Underscore 1.8. Use it if it is there.
            modelKeys = _.allKeys( model );
            selectOneKeys = _.allKeys( selectOneCollection );
            selectManyKeys = _.allKeys( selectManyCollection );
        } else {
            // Use simple for-in iteration to get the properties. In IE8, some properties might be missed that way (see
            // http://stackoverflow.com/a/3705407/508355). Label name conflicts would still be caught while testing in
            // other browsers, so never mind.
            for ( key in model ) modelKeys.push( key );
            for ( key in selectOneCollection ) selectOneKeys.push( key );
            for ( key in selectManyCollection ) selectManyKeys.push( key );
        }

        illegalLabelNames = _.without( _.union( modelKeys, selectOneKeys, selectManyKeys ), "selected", "selectedLength" );

        selectOneCollection.close();
        selectManyCollection.close();

    })();


    // Module return value
    // -------------------
    //
    // A return value may be necessary for AMD to detect that the module is loaded. It ony exists for that reason and is
    // purely symbolic. Don't use it in client code. The functionality of this module lives in the Backbone namespace.
    exports.info = "Backbone.Select has loaded. Don't use the exported value of the module. Its functionality is available inside the Backbone namespace.";

} ) );

