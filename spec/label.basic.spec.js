describe( "Custom labels: basic tests.", function () {

    var Model = Backbone.Model.extend( {
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
        } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( 'Preventing conflicts with existing methods and properties.', function () {

        describe( 'Using an illegal label in a call on a Backbone.Select.Me model. An error is thrown', function () {
            var model;

            beforeEach( function () {
                model = new Model();
            } );

            it( 'when a label name matches an existing Backbone model method', function () {
                var label = "save";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'when a label name matches an existing Backbone model property', function () {
                var label = "attributes";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection method', function () {
                var label = "at";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection property', function () {
                var label = "models";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Me method', function () {
                var label = "toggleSelected";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.One method', function () {
                var label = "deselect";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Many method', function () {
                var label = "toggleSelectAll";
                expect( function () { model.select( { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

        } );

        describe( 'Using an illegal label in a call on a Backbone.Select.One collection. An error is thrown', function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new SelectOneCollection( [model] );
            } );

            it( 'when a label name matches an existing Backbone model method', function () {
                var label = "save";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'when a label name matches an existing Backbone model property', function () {
                var label = "attributes";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection method', function () {
                var label = "at";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection property', function () {
                var label = "models";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Me method', function () {
                var label = "toggleSelected";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.One method', function () {
                var label = "deselect";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Many method', function () {
                var label = "toggleSelectAll";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

        } );

        describe( 'Using an illegal label in a call on a Backbone.Select.Many collection. An error is thrown', function () {
            var model, collection;

            beforeEach( function () {
                model = new Model();
                collection = new SelectManyCollection( [model] );
            } );

            it( 'when a label name matches an existing Backbone model method', function () {
                var label = "save";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'when a label name matches an existing Backbone model property', function () {
                var label = "attributes";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection method', function () {
                var label = "at";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection property', function () {
                var label = "models";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Me method', function () {
                var label = "toggleSelected";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.One method', function () {
                var label = "deselect";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Many method', function () {
                var label = "toggleSelectAll";
                expect( function () { collection.select( model, { label: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

        } );

    } );

} );
