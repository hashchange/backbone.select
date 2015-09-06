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
                _.bindAll( this, "select", "render" );
                this.collection = options.collection;

                this.listenTo( this.collection, "selected", this.onModelSelectWithAnyLabel );
                this.listenTo( this.collection, "selected:selected", this.onModelSelect );    // with default label "selected" only
                this.listenTo( this.collection, "deselected", this.onModelDeselect );

                this.render();
            },

            getModelEl: function ( modelId ) {
                // Return the DOM node representing the model, as a jQuery object
                return this.$el
                    .find( ".item" )
                    .filter( function () {
                        return $( this ).text() === String( modelId );
                    } );
            },

            select: function ( event ) {
                var id = $( event.currentTarget ).text();
                if ( event ) event.preventDefault();
                this.collection.get( id ).select();
            },

            // Runs when a model is selected with any label. Labels are "selected" (default) or "trailing"
            onModelSelectWithAnyLabel: function ( model, options ) {
                // Set a "selected" class to an element which is selected, and a "trailing" class to an element which
                // is selected with label "trailing".
                this.getModelEl( model.id ).addClass( options.label );
            },

            // Only runs when a model is selected with the default label, not with the custom label "trailing"
            onModelSelect: function ( model ) {
                var trailing = this.collection.trailing && this.collection.trailing.id || this.collection.first().id,
                    view = this,

                    cbUpdateTrailing = function () {
                        view.collection.get( Math.round( this.trailingId ) ).select( { label: "trailing" } );
                    };

                // Animate the trailing element and make it catch up. Use the .select() method with the label
                // "trailing".
                $( { trailingId: trailing } ).animate(
                    { trailingId: model.id },
                    { step: cbUpdateTrailing, done: cbUpdateTrailing, duration: trailingLag }
                );
            },

            onModelDeselect: function ( model, options ) {
                this.getModelEl( model.id ).removeClass( options.label );
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

    new ListView( { collection: collection, el: "#list" } );

    // Initial selection
    collection.first().select();

} );
