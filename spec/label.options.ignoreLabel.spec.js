describe( 'Custom label options: ignoreLabel.', function () {

    var Model = Backbone.Model.extend( {
            initialize: function ( attributes, options ) {
                Backbone.Select.Me.applyTo( this, options );
            }
        } ),

        SelectOneCollection = Backbone.Collection.extend( {
            initialize: function ( models, options ) {
                Backbone.Select.One.applyTo( this, models, options );
            }
        } ),

        SelectManyCollection = Backbone.Collection.extend( {
            initialize: function ( models, options ) {
                Backbone.Select.Many.applyTo( this, models, options );
            }
        } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    var m1, m2;

    beforeEach( function () {
        m1 = new Model();
        m2 = new Model();
    } );

    describe( 'Select.One collection', function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
        } );

        describe( 'A set of (two) labels is ignored in a collection.', function () {

            beforeEach( function () {
                collection = new SelectOneCollection( undefined, { ignoreLabel: ["starred", "picked"], enableModelSharing: true } );
            } );

            describe( 'It leaves the property for the first label undefined', function () {

                it( 'when select() is called on the collection with that label', function () {
                    collection.add( model );
                    collection.select( model, { label: "starred" } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (model sharing enabled)', function () {
                    collection.add( model );
                    model.select( { label: "starred" } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (no model sharing enabled)', function () {
                    collection = new SelectOneCollection( [model], { ignoreLabel: ["starred", "picked"] } );
                    model.select( { label: "starred" } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model with that label is added to the collection', function () {
                    model.select( { label: "starred" } );
                    collection.add( model );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during instantiation', function () {
                    model.select( { label: "starred" } );
                    collection = new SelectOneCollection( [model], { ignoreLabel: ["starred", "picked"] } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during a reset()', function () {
                    model.select( { label: "starred" } );
                    collection.reset( [model] );

                    expect( collection.starred ).toBeUndefined();
                } );

            } );

            describe( 'It leaves the property for the second label undefined', function () {

                it( 'when select() is called on the collection with that label', function () {
                    collection.add( model );
                    collection.select( model, { label: "picked" } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (model sharing enabled)', function () {
                    collection.add( model );
                    model.select( { label: "picked" } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (no model sharing enabled)', function () {
                    collection = new SelectOneCollection( [model], { ignoreLabel: ["starred", "picked"] } );
                    model.select( { label: "picked" } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model with that label is added to the collection', function () {
                    model.select( { label: "picked" } );
                    collection.add( model );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during instantiation', function () {
                    model.select( { label: "picked" } );
                    collection = new SelectOneCollection( [model], { ignoreLabel: ["starred", "picked"] } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during a reset()', function () {
                    model.select( { label: "picked" } );
                    collection.reset( [model] );

                    expect( collection.picked ).toBeUndefined();
                } );

            } );

        } );

        describe( 'A single label is ignored in a collection, being passed in as a string.', function () {

            // Just tests that the ignoreLabel option works with a string input for a single label. Basic test only.

            it( 'It leaves the property for the ignored label undefined when select() is called on the collection with that label', function () {
                collection = new SelectOneCollection( [model], { ignoreLabel: "starred", enableModelSharing: true } );
                collection.select( model, { label: "starred" } );

                expect( collection.starred ).toBeUndefined();
            } );

        } );

        describe( 'When a label is ignored, a select() call on the collection still works normally', function () {

            beforeEach( function () {
                collection = new SelectOneCollection( [model], { ignoreLabel: "starred", enableModelSharing: true } );
            } );

            it( 'with the default label', function () {
                collection.select( model );
                expect( collection.selected ).toBe( model );
            } );

            it( 'with a non-ignored custom label', function () {
                collection.select( model, { label: "picked" } );
                expect( collection.picked ).toBe( model );
            } );

        } );

        describe( 'Interplay of ignoreLabel and the default label', function () {

            it( 'When trying to ignore the "selected" label without changing the default label of the collection, an error is thrown', function () {
                expect( function () {
                    collection = new SelectOneCollection( undefined, { ignoreLabel: "selected" } );
                } ).toThrowError( /^ignoreLabel option: illegal value. Can't ignore the default label, "selected", of a collection/ );
            } );

            it( 'When trying to ignore the custom default label of the collection, an error is thrown', function () {
                expect( function () {
                    collection = new SelectOneCollection( undefined, { defaultLabel: "starred", ignoreLabel: "starred" } );
                } ).toThrowError( /^ignoreLabel option: illegal value. Can't ignore the default label, "starred", of a collection/ );
            } );

            it( 'When setting the defaultLabel to a custom value, the "selected" label can be ignored', function () {
                collection = new SelectOneCollection( [model], { defaultLabel: "starred", ignoreLabel: "selected" } );

                collection.select( model, { label: "selected" } );
                collection.select( model );                             // using the custom default label "starred" here

                expect( collection.selected ).toBeUndefined();          // ignoring the "selected" label works
                expect( collection.starred ).toBe( model );             // a selection with the default label works
            } );

        } );
        
    } );

    describe( 'Select.Many collection', function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
        } );

        describe( 'A set of (two) labels is ignored in a collection.', function () {

            beforeEach( function () {
                collection = new SelectManyCollection( undefined, { ignoreLabel: ["starred", "picked"], enableModelSharing: true } );
            } );

            describe( 'It leaves the property for the first label undefined', function () {

                it( 'when select() is called on the collection with that label', function () {
                    collection.add( model );
                    collection.select( model, { label: "starred" } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (model sharing enabled)', function () {
                    collection.add( model );
                    model.select( { label: "starred" } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (no model sharing enabled)', function () {
                    collection = new SelectManyCollection( [model], { ignoreLabel: ["starred", "picked"] } );
                    model.select( { label: "starred" } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model with that label is added to the collection', function () {
                    model.select( { label: "starred" } );
                    collection.add( model );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during instantiation', function () {
                    model.select( { label: "starred" } );
                    collection = new SelectManyCollection( [model], { ignoreLabel: ["starred", "picked"] } );

                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during a reset()', function () {
                    model.select( { label: "starred" } );
                    collection.reset( [model] );

                    expect( collection.starred ).toBeUndefined();
                } );

            } );

            describe( 'It leaves the property for the second label undefined', function () {

                it( 'when select() is called on the collection with that label', function () {
                    collection.add( model );
                    collection.select( model, { label: "picked" } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (model sharing enabled)', function () {
                    collection.add( model );
                    model.select( { label: "picked" } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model in the collection is selected for that label (no model sharing enabled)', function () {
                    collection = new SelectManyCollection( [model], { ignoreLabel: ["starred", "picked"] } );
                    model.select( { label: "picked" } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model with that label is added to the collection', function () {
                    model.select( { label: "picked" } );
                    collection.add( model );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during instantiation', function () {
                    model.select( { label: "picked" } );
                    collection = new SelectManyCollection( [model], { ignoreLabel: ["starred", "picked"] } );

                    expect( collection.picked ).toBeUndefined();
                } );

                it( 'when a model with that label is passed to the collection during a reset()', function () {
                    model.select( { label: "picked" } );
                    collection.reset( [model] );

                    expect( collection.picked ).toBeUndefined();
                } );

            } );

        } );

        describe( 'A single label is ignored in a collection, being passed in as a string.', function () {

            // Just tests that the ignoreLabel option works with a string input for a single label. Basic test only.

            it( 'It leaves the property for the ignored label undefined when select() is called on the collection with that label', function () {
                collection = new SelectManyCollection( [model], { ignoreLabel: "starred", enableModelSharing: true } );
                collection.select( model, { label: "starred" } );

                expect( collection.starred ).toBeUndefined();
            } );

        } );

        describe( 'When a label is ignored, a select() call on the collection still works normally', function () {
            var expected;

            beforeEach( function () {
                expected = {};
                collection = new SelectManyCollection( [model], { ignoreLabel: "starred", enableModelSharing: true } );
            } );

            it( 'with the default label', function () {
                collection.select( model );

                expected[model.cid] = model;
                expect( collection.selected ).toEqual( expected );
            } );

            it( 'with a non-ignored custom label', function () {
                collection.select( model, { label: "picked" } );

                expected[model.cid] = model;
                expect( collection.picked ).toEqual( expected );
            } );

        } );

        describe( 'Interplay of ignoreLabel and the default label', function () {
            var expected;

            beforeEach( function () {
                expected = {};
            } );

            it( 'When trying to ignore the "selected" label without changing the default label of the collection, an error is thrown', function () {
                expect( function () {
                    collection = new SelectManyCollection( undefined, { ignoreLabel: "selected" } );
                } ).toThrowError( /^ignoreLabel option: illegal value. Can't ignore the default label, "selected", of a collection/ );
            } );

            it( 'When trying to ignore the custom default label of the collection, an error is thrown', function () {
                expect( function () {
                    collection = new SelectManyCollection( undefined, { defaultLabel: "starred", ignoreLabel: "starred" } );
                } ).toThrowError( /^ignoreLabel option: illegal value. Can't ignore the default label, "starred", of a collection/ );
            } );

            it( 'When setting the defaultLabel to a custom value, the "selected" label can be ignored', function () {
                collection = new SelectManyCollection( [model], { defaultLabel: "starred", ignoreLabel: "selected" } );

                collection.select( model, { label: "selected" } );
                collection.select( model );                             // using the custom default label "starred" here

                expect( collection.selected ).toBeUndefined();          // ignoring the "selected" label works

                expected[model.cid] = model;
                expect( collection.starred ).toEqual( expected );       // a selection with the default label works
            } );

        } );

    } );

} );