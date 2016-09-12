// basic.js

require( [

    'jquery',
    'underscore',
    'backbone',
    'backbone.select'

], function ( $, _, Backbone ) {

    var Model = Backbone.Model.extend( {
            initialize: function () {
                Backbone.Select.Me.applyTo( this );
            }
        } ),

        SelectOneCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.One.applyTo( this, models, {enableModelSharing: true} );
            }
        } ),

        SelectManyCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.Many.applyTo( this, models, {enableModelSharing: true} );
            }
        } ),

        modelCount = 6,
        createModels = function ( count, baseChar ) {
            // Creates an array of models. Their IDs are a single character, based
            // on a base char.
            var i,
                baseCharCode = baseChar.charCodeAt( 0 ),
                models = [];

            for ( i = 0; i < count; i++ ) {
                models.push( new Model( { id: String.fromCharCode( baseCharCode + i ) } ) );
            }

            return models;
        },

        modelsNumeric = createModels( modelCount, "1" ),
        modelsAlphaLC = createModels( modelCount, "a" ),
        modelsAlphaUC = createModels( modelCount, "A" ),

        selectOneNum = new SelectOneCollection( modelsNumeric ),
        selectOneAlphaLC = new SelectOneCollection( modelsAlphaLC ),
        selectOneAlphaUC = new SelectOneCollection( modelsAlphaUC ),
        selectOneFirst = new SelectOneCollection( [
            selectOneNum.first(),
            selectOneAlphaLC.first(),
            selectOneAlphaUC.first()
        ] ),
        selectMany = new SelectManyCollection(
            modelsNumeric.concat( modelsAlphaLC, modelsAlphaUC )
        ),


        ListView = Backbone.View.extend( {
            events: {
                "click .item": "toggleSelected"
            },

            initialize: function ( options ) {
                _.bindAll( this, "toggleSelected", "render" );
                this.collection = options.collection;

                // The view is used for both collection types, Select.One and
                // Select.Many. Because their select:* events differ in their
                // signature, it is easier to listen to the model events, which
                // bubble up to the collection.
                this.listenTo( this.collection, "selected", this.onModelSelect );
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

            toggleSelected: function ( event ) {
                var id = $( event.currentTarget ).text();
                if ( event ) event.preventDefault();
                this.collection.get( id ).toggleSelected();
            },

            onModelSelect: function ( model ) {
                this.getModelEl( model.id ).addClass( "selected" );
            },

            onModelDeselect: function ( model ) {
                this.getModelEl( model.id ).removeClass( "selected" );
            },

            render: function () {
                // Render the collection content
                this.$el.empty();
                this.collection.each( function ( model ) {
                    this.$el.append( '<li class="item"><a href="#">' + model.id + '</a></li>' );
                }, this );

                // Mark up selected elements
                if ( this.collection._pickyType === "Backbone.Select.One" && this.collection.selected ) {

                    this.onModelSelect( this.collection.selected );

                } else if ( this.collection._pickyType === "Backbone.Select.Many" && _.size( this.collection.selected ) ) {

                    _.each( this.collection.selected, function ( model ) {
                        this.onModelSelect( model );
                    }, this );

                }
            }
        } );

    // Initial selection
    selectOneFirst.first().select();

    new ListView( { collection: selectOneNum, el: "#numList" } );
    new ListView( { collection: selectOneAlphaLC, el: "#alphaLcList" } );
    new ListView( { collection: selectOneAlphaUC, el: "#alphaUcList" } );
    new ListView( { collection: selectOneFirst, el: "#firstList" } );
    new ListView( { collection: selectMany, el: "#multiList" } );

} );

define("local.basic", function(){});

