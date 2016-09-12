// baskets.js

require( [

    'jquery',
    'underscore',
    'backbone',
    'backbone.select'

], function ( $, _, Backbone ) {

    var modelCount = 12,

        Model = Backbone.Model.extend( {
            initialize: function () {
                Backbone.Select.Me.applyTo( this );
            }
        } ),

        SelectManyCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.Many.applyTo( this, models );
            }
        } ),

        createModels = function ( count ) {
            // Creates an array of models.
            var i,
                models = [];

            for ( i = 0; i < count; i++ ) {
                models.push( new Model( { id: i + 1 } ) );
            }

            return models;
        },

        models = createModels( modelCount ),

        collection = new SelectManyCollection( models ),

        BaseView = Backbone.View.extend( {

            getModelEl: function ( modelId ) {
                // Return the DOM node representing the model, as a jQuery object
                return this.$el
                    .find( ".item" )
                    .filter( function () {
                        return $( ".content", this ).text() === String( modelId );
                    } );
            }

        } ),

        ListView = BaseView.extend( {
            events: {
                "click .content": "toggleSelect",
                "click .star": "toggleStar",
                "click .heart": "toggleLove"
            },

            initialize: function ( options ) {
                _.bindAll( this, "toggleSelect", "toggleStar", "toggleLove", "render" );

                this.collection = options.collection;
                this.template = _.template( $( options.template ).html() );

                this.listenTo( this.collection, "selected", this.onModelSelect );
                this.listenTo( this.collection, "deselected", this.onModelDeselect );

                this.render();
            },

            toggleSelect: function ( event ) {
                this._toggleSelected( event, "selected" );
            },

            toggleStar: function ( event ) {
                this._toggleSelected( event, "starred" );
            },

            toggleLove: function ( event ) {
                this._toggleSelected( event, "loved" );
            },

            _toggleSelected: function ( event, label ) {
                var item = $( event.currentTarget ).closest( ".item" ),
                    id = $( ".content", item ).text();

                if ( event ) event.preventDefault();
                this.collection.get( id ).toggleSelected( { label: label } );
            },

            onModelSelect: function ( model, options ) {
                this.getModelEl( model.id ).addClass( options.label );
            },

            onModelDeselect: function ( model, options ) {
                this.getModelEl( model.id ).removeClass( options.label );
            },

            render: function () {
                // Render the collection content
                var labels = [ "selected", "starred", "loved" ];

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
                "click .trash": "deselect"
            },

            initialize: function ( options ) {
                _.bindAll( this, "deselect", "render" );

                this.label = options.label;
                this.collection = options.collection;
                this.template = _.template( $( options.template ).html() );

                this.listenTo( this.collection, "selected:" + this.label, this.onModelSelect );
                this.listenTo( this.collection, "deselected:" + this.label, this.onModelDeselect );

                this.render();
            },

            deselect: function ( event ) {
                var item = $( event.currentTarget ).closest( ".item" ),
                    id = $( ".content", item ).text();

                if ( event ) event.preventDefault();
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
        } );

    // Initial selection
    collection.first().select();

    new ListView( { collection: collection, el: "#list", template: "#item" } );
    new PickView( { collection: collection, label: "selected", el: "#selected", template: "#pick" } );
    new PickView( { collection: collection, label: "starred", el: "#starred", template: "#pick" } );
    new PickView( { collection: collection, label: "loved", el: "#loved", template: "#pick" } );

} );

define("local.baskets", function(){});

