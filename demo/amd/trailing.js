// amd.js

require( [

    'jquery',
    'underscore',
    'backbone',
    'backbone.select'

], function ( $, _, Backbone ) {

    var modelCount = 24,
        trailingLag = 1600,

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

        collection = new SelectOneCollection( models ),

        ListView = Backbone.View.extend( {
            events: {
                "click .item": "select"
            },

            initialize: function ( options ) {
                _.bindAll( this, "select", "onModelSelect", "render" );
                this.collection = options.collection;

                this.listenTo( this.collection, "selected", this.onModelSelect );
                this.listenTo( this.collection, "deselected", this.onModelDeselect );

                this.render();
            },
            getEl: function ( modelId ) {
                // Return the DOM node representing the model, as a jQuery object
                return this.$el
                    .find( "a" )
                    .filter( function () {
                        return $( this ).text() === String( modelId );
                    } );
            },
            select: function ( event ) {
                var id = $( event.target ).text();
                if ( event ) event.preventDefault();
                this.collection.get( id ).select();
            },
            onModelSelect: function ( model, options ) {
                var trailing,
                    view = this,
                    label = options && options.label || "selected",

                    cbUpdateTrailing = function () {
                        view.collection.get( Math.round( this.trailingId ) ).select( { label: "trailing" } );
                    };

                // Set a "selected" class to an element which is selected, and a "trailing" class to an element which
                // is selected with label "trailing".
                this.getEl( model.id ).addClass( label );

                // If an element is selected, animate the trailing element and make it catch up. Use the .select()
                // method with the label "trailing".
                if ( label === "selected" ) {
                    trailing = this.collection.trailing && this.collection.trailing.id || this.collection.first().id;
                    $( { trailingId: trailing } ).animate(
                        { trailingId: model.id },
                        { step: cbUpdateTrailing, done: cbUpdateTrailing, duration: trailingLag }
                    );
                }
            },
            onModelDeselect: function ( model, options ) {
                var label = options && options.label || "selected";
                this.getEl( model.id ).removeClass( label );
            },
            render: function () {
                // Render the collection content
                this.$el.empty();
                this.collection.each( function ( model ) {
                    this.$el.append( '<li class="item"><a href="#">' + model.id + '</a></li>' );
                }, this );

                // Mark up selected elements
                if ( this.collection.selected ) this.onModelSelect( this.collection.selected );
            }
        } );

    // Initial selection
    collection.first().select();

    new ListView( { collection: collection, el: "#list" } );

} );
