// focus-label.js

require( [

    'jquery',
    'underscore',
    'backbone',
    'backbone.select'

], function ( $, _, Backbone ) {

    var modelCount = 12,

        FocusableModel = Backbone.Model.extend( {

            initialize: function () {
                Backbone.Select.Me.applyTo( this );
                this.listenTo( this, "selected:inFocus", this.onFocus );
            },

            focus: function ( options ) {
                this.select( _.extend( {}, options, { label: "inFocus" } ) );
            },

            defocus: function ( options ) {
                this.deselect( _.extend( {}, options, { label: "inFocus" } ) );
            },

            onFocus: function ( model, options ) {
                if ( !this.selected ) this.select( _.extend( {}, options, { label: "selected" } ) );
            },

            onDeselect: function ( model, options ) {
                if ( this.inFocus ) this.defocus( options );
            }

        } ),

        FocusableCollection = Backbone.Collection.extend( {

            initialize: function ( models ) {
                var trackingCollection, close,

                    TrackingCollection = Backbone.Collection.extend( {

                        initialize: function ( models, options ) {
                            this.tracked = options.tracked;

                            Backbone.Select.One.applyTo( this, models, {
                                defaultLabel: "inFocus",
                                ignoreLabel: "selected"
                            } );

                            this.listenTo( this.tracked, "selected:selected", this.onModelSelect );
                            this.listenTo( this.tracked, "deselected:selected", this.onModelDeselect );
                            this.listenTo( this.tracked, "reset", this.onReset );
                        },

                        onModelSelect: function ( model ) {
                            this.add( model );
                        },

                        onModelDeselect: function ( model ) {
                            this.remove( model );
                        },

                        onReset: function () {
                            this.reset( _.toArray( this.tracked.selected ) );
                        }

                    } );

                Backbone.Select.Many.applyTo( this, models );

                trackingCollection = new TrackingCollection( _.toArray( this.selected ), { tracked: this } );

                close = this.close;
                this.close = function () {
                    trackingCollection.close();
                    close.apply( this );
                };
            },

            focus: function ( model, options ) {
                model.focus( options );
            },

            defocus: function ( model, options ) {
                model.defocus( options );
            }

        } ),

        createModels = function ( count ) {
            // Creates an array of models.
            var i,
                models = [];

            for ( i = 0; i < count; i++ ) {
                models.push( new FocusableModel( { id: i + 1 } ) );
            }

            return models;
        },

        models = createModels( modelCount ),

        collection = new FocusableCollection( models ),

        BaseView = Backbone.View.extend( {

            getModelEl: function ( modelId ) {
                // Return the DOM node representing the model, as a jQuery object
                return this.$el
                    .find( ".item" )
                    .filter( function () {
                        return $( ".content", this ).text() === String( modelId );
                    } );
            },

            getEventItemId: function ( event ) {
                var item = $( event.currentTarget ).closest( ".item" );
                return $( ".content", item ).text();
            }

        } ),

        ListView = BaseView.extend( {

            events: {
                "click .content": "toggleSelected"
            },

            initialize: function ( options ) {
                this.collection = options.collection;
                this.template = _.template( $( options.template ).html() );

                this.listenTo( this.collection, "selected", this.onModelSelect );
                this.listenTo( this.collection, "deselected", this.onModelDeselect );

                this.render();
            },

            toggleSelected: function ( event ) {
                var label = event.ctrlKey ? "inFocus" : "selected",
                    id = this.getEventItemId( event );

                event.preventDefault();
                this.collection.get( id ).toggleSelected( { label: label } );
            },

            onModelSelect: function ( model, options ) {
                this.getModelEl( model.id ).addClass( toDashed( options.label ) );
            },

            onModelDeselect: function ( model, options ) {
                this.getModelEl( model.id ).removeClass( toDashed( options.label ) );
            },

            render: function () {
                // Render the collection content
                var labels = [ "selected", "inFocus" ];

                this.$el.empty();
                this.collection.each( function ( model ) {
                    this.$el.append( this.template( model ) );
                }, this );

                // Mark up selected/labeled elements
                _.each( labels, function ( label ) {
                    _.each( this.collection[label], function ( model ) {
                        this.onModelSelect( model, { label: label } );
                    }, this );
                }, this );
            }

        } ),

        PickView = BaseView.extend( {

            events: {
                "click .trash": "trash"
            },

            constructor: function () {
                _.extend( this.events, PickView.prototype.events );
                BaseView.apply( this, arguments );
            },

            initialize: function ( options ) {
                this.label = options.label;
                this.collection = options.collection;
                this.template = _.template( $( options.template ).html() );

                this.listenTo( this.collection, "selected:" + this.label, this.onModelSelect );
                this.listenTo( this.collection, "deselected:" + this.label, this.onModelDeselect );

                this.render();
            },

            trash: function ( event ) {
                var id = this.getEventItemId( event );

                event.preventDefault();
                this.collection.get( id ).deselect( { label: this.label } );
            },

            onModelSelect: function ( model ) {
                this.$el.append( this.template( model ) );
            },

            onModelDeselect: function ( model ) {
                this.getModelEl( model.id ).remove();
            },

            render: function () {
                // Render the content which has been selected with the label which is handled by this view ("selected",
                // "starred" or "loved").
                this.$el.empty();

                _.each( this.collection[this.label], function ( model ) {
                    this.onModelSelect( model );
                }, this );
            }

        } ),

        SelectionView = PickView.extend( {

            events: {
                "click .focus": "toggleFocus"
            },

            initialize: function ( options ) {
                PickView.prototype.initialize.call( this, _.extend( { label: "selected" }, options ) );

                this.listenTo( this.collection, "selected:inFocus", function ( model ) {
                    this.getModelEl( model.id ).addClass( "in-focus" );
                } );
                this.listenTo( this.collection, "deselected:inFocus", function ( model ) {
                    this.getModelEl( model.id ).removeClass( "in-focus" );
                } );
            },

            toggleFocus: function ( event ) {
                var id = this.getEventItemId( event );

                event.preventDefault();
                this.collection.get( id ).toggleSelected( { label: "inFocus" } );
            }

        } ),

        InFocusView = PickView.extend( {

            initialize: function ( options ) {
                PickView.prototype.initialize.call( this, _.extend( { label: "inFocus" }, options ) );
            }

        } );

    function toDashed ( camelCase ) {
        return camelCase.replace( /([a-z])([A-Z])/g, function ( match, group1, group2 ) { return group1 + "-" + group2.toLowerCase(); } );
    }

    // Initial selection
    collection.first().select();

    new ListView( { collection: collection, el: "#list", template: "#item-template" } );
    new SelectionView( { collection: collection, el: "#selected", template: "#selected-template" } );
    new InFocusView( { collection: collection, el: "#in-focus", template: "#in-focus-template" } );

} );
