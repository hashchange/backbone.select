( function ( Backbone, _, $ ) {
    "use strict";

    console || ( console = { log: function ( msg ) {} } );

    var $log = $( "#log" ),
        $memtest = $( "#memtest" ),
        $submit = $memtest.find( "#runMemtest" ),

        $modelSetSize = $memtest.find( "#modelSetSize" ),
        $modelLoop = $memtest.find( "#modelLoop" ),
        $collectionLoop = $memtest.find( "#collectionLoop" ),

        $collectionBehavior = $memtest.find( "#collectionBehavior" ),
        $optModelSharing = $collectionBehavior.find( "#optModelSharingMode" ),
        $optInitialSelection = $collectionBehavior.find( "#optInitialSelection" ),
        $closeCollection = $collectionBehavior.find( "#closeCollection" ),

        $testTypes = $memtest.find( "#testTypes" ),
        getTestType = function () {
            return String( $testTypes.find( "input[name='testType']:checked" ).val() );
        },

        msg = function ( text, collection, models ) {
            collection || (collection = []);
            models || (models = []);

            var msg,
                collectionStatus = "    Length of collection: " + collection.length,
                modelStatus = "    Number of models: " + models.length,
                lf = "\n",
                br = "<br>";

            msg = text.replace( lf, br );
            if ( collection.length ) msg += br + collectionStatus;
            if ( models.length ) msg += br + modelStatus;

            console.log( msg.replace( br, lf ) );
            $log.append( msg + br );
        },

        waitCb = function ( collection, models ) {
            console.log( "WAIT output: collection.length=" + collection.length + ", models.length=" + models.length );
            msg( "WAIT has ended.\n" );
        },

        wait = function () {
            window.setTimeout( waitCb, 500, arguments[0], arguments[1] );
        },

        memtest = {};

    // NB, wait function:
    //
    // Don't use _.debounce, as in `wait = _.debounce( waitCb, 500 )`. It leaked memory like crazy in these tests, using
    // Underscore 1.5.2. I thought I had a leak, turned out I had been chasing ghosts for a couple of hours. Apparently
    // it has been fixed and merged months ago (jashkenas/underscore#1329, #1330), but still hasn't made it into a
    // release.

    $testTypes.find( 'input[name="testType"]' ).change( function () {

        var optsSelect = [ 'optModelSharingMode', 'closeCollection' ],
            optsCycleOnly = [ 'optInitialSelection' ],
            optsAll = optsSelect.concat( optsCycleOnly ),

            activate = function ( optionIds, activate ) {
                if ( _.isUndefined( activate ) ) activate = true;

                _.each( optionIds, function ( optionId ) {

                    var labelSelector = 'label[for="' + optionId + '"]';
                    var $formEl = $( $collectionBehavior ).find( '#' + optionId ),
                        $label = $( $collectionBehavior ).find( labelSelector );

                    $formEl.get( 0 ).disabled = !activate;
                    if ( activate ) {
                        $label.removeClass( 'disabled' );
                    } else {
                        $label.addClass( 'disabled' );
                    }

                } );
            };

        switch ( getTestType() ) {
            case "select":
                activate( optsSelect );
                activate( optsCycleOnly, false );
                break;
            case "cycle":
                activate( optsAll );
                break;
            default:
                activate( optsAll, false );
        }

    } );

    $submit.click( function ( event ) {
        var modelSetSize = Number( $modelSetSize.val() ),
            modelLoop = Number( $modelLoop.val() ),
            collectionLoop = Number( $collectionLoop.val() ),
            options = {
                initialSelection: $optInitialSelection.val(),
                enableModelSharing: $optModelSharing.is( ':checked' ),
                closeCollection: $closeCollection.is( ':checked' )
            };

        event.preventDefault();
        memtest.run( modelSetSize, modelLoop, collectionLoop, getTestType(), options );
    } );

    memtest.run = function ( modelSetSize, modelLoop, collectionLoop, testType, options ) {
        var i, j,
            Collection,
            collection,
            Model,
            models,
            hasClose = false,
            doClose,

            Logger = function () {
                this.reset();
            };

        Logger.prototype.log = function ( content ) {
            this.entries.push( content );
        };
        Logger.prototype.reset = function () {
            this.entries = [];
        };

        var logger = new Logger();

        switch ( testType ) {
            case "picky":
                msg( "Testing Backbone.Picky" );

                Model = Backbone.Model.extend( {
                    initialize: function () {
                        _.extend( this, new Backbone.Picky.Selectable( this ) );
                    }
                } );

                Collection = Backbone.Collection.extend( {
                    initialize: function () {
                        _.extend( this, new Backbone.Picky.SingleSelect( this ) );
                        this.listenTo( this, "select:one", this.log );
                    },
                    log: function ( model ) {
                        logger.log( "select:one event: Model " + model.cid + " selected in collection " + this._pickyCid );
                    }
                } );

                break;

            case "select":
                msg( "Testing Backbone.Select" );

                Model = Backbone.Model.extend( {
                    initialize: function () {
                        Backbone.Select.Me.applyTo( this );
                    }
                } );

                Collection = Backbone.Collection.extend( {
                    initialize: function ( models ) {
                        Backbone.Select.One.applyTo( this, models, options );
                        this.listenTo( this, "select:one", this.log );
                    },
                    log: function ( model ) {
                        logger.log( "select:one event: Model " + model.cid + " selected in collection " + this._pickyCid );
                    }
                } );

                hasClose = true;

                break;

            case "cycle":
                msg( "Testing Backbone.Cycle" );

                Model = Backbone.Model.extend( {
                    initialize: function () {
                        Backbone.Cycle.SelectableModel.applyTo( this );
                    }
                } );

                Collection = Backbone.Collection.extend( {
                    initialize: function ( models, options ) {
                        Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
                        this.listenTo( this, "select:one", this.log );
                    },
                    log: function ( model ) {
                        logger.log( "select:one event: Model " + model.cid + " selected in collection " + this._pickyCid );
                    }
                } );

                hasClose = true;

                break;

            default:
                msg( "Testing plain Backbone" );

                Model = Backbone.Model;
                Collection = Backbone.Collection;
        }

        for ( i = 0; i < modelLoop; i++ ) {
            models = [];
            for ( j = 0; j < modelSetSize; j++ ) {
                models.push( new Model( { id: j, number: j + 1, caption: "I am model #" + ( j + 1 ) } ) );
            }
        }

        msg( i + " model sets are created.", undefined, models );

        doClose = hasClose && options.closeCollection;
        collection = { close: function () {} };
        for ( i = 0; i < collectionLoop; i++ ) {
            if ( doClose ) collection.close();
            collection = new Collection( models, options );
        }

        msg(
            i + " collections are created." +
            ( doClose ? " close() has been called." : "" ),
            collection, models
        );

        if ( models[0].select ) {
            models[models.length - 1].select();
            if ( models.length > 1 && logger.entries.length > 1 ) msg( "ZOMBIE ALERT! SUSPECTED LEAK!" );
            msg( "The last model in the set has been selected, selection was logged " + logger.entries.length + " times." );
        }

        msg( "Done.\n----\n" );

        // Prevent collection and models from being released too early by keeping the references around a bit. Should
        // ensure that the profiler captures memory spikes.
        wait( collection, models );

    }

}( Backbone, _, jQuery ));