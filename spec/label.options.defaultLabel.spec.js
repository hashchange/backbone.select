describe( 'Custom label options: defaultLabel.', function () {

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

    describe( 'The default label is changed (to "starred").', function () {

        describe( 'Select.Me model', function () {
            var model;

            beforeEach( function () {
                model = new Model( undefined, { defaultLabel: "starred" } );
            } );

            describe( 'Calling select() without a label option', function () {

                beforeEach( function () {
                    model.select();
                } );

                it( 'selects a model with the modified default label', function () {
                    expect( model.starred ).toBe( true );
                } );

                it( 'does not select the model with the "selected" label', function () {
                    expect( model.selected ).toBeFalsy();
                } );

            } );

            describe( 'Calling deselect() without a label option', function () {

                beforeEach( function () {
                    model.select();
                    model.select( { label: "selected" } );
                    model.deselect();
                } );

                it( 'deselects a model with the modified default label', function () {
                    expect( model.starred ).toBe( false );
                } );

                it( 'does not deselect the model with the "selected" label', function () {
                    expect( model.selected ).toBe( true );
                } );

            } );

        } );

        describe( 'Select.One collection', function () {
            var collection;

            beforeEach( function () {
                collection = new SelectOneCollection( [m1, m2], { defaultLabel: "starred" } );
            } );

            describe( 'Calling select() without a label option', function () {

                beforeEach( function () {
                    m1.select();                        // using the default "selected" label of the model here
                    m1.select( { label: "starred" } );

                    collection.select( m2 );
                } );

                it( 'selects a model with the modified default label', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'does not select the model with the "selected" label', function () {
                    expect( m2.selected ).toBeFalsy();
                } );

                it( 'deselects a previously selected model with the modified default label', function () {
                    expect( m1.starred ).toBe( false );
                } );

                it( 'does not deselect a previously selected model with the "selected" label', function () {
                    expect( m1.selected ).toBe( true );
                } );

                it( 'sets the "starred" property of the collection to the selected model', function () {
                    expect( collection.starred ).toBe( m2 );
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expect( collection.selected ).toBe( m1 );
                } );

            } );

            describe( 'Calling deselect() without a label option', function () {

                beforeEach( function () {
                    collection.select( m2 );
                    collection.select( m2, { label: "selected" } );
                    collection.deselect( m2 );
                } );

                it( 'deselects a model with the modified default label', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'does not deselect the model with the "selected" label', function () {
                    expect( m2.selected ).toBe( true );
                } );

                it( 'sets the "starred" property of the collection to undefined', function () {
                    expect( collection.starred ).toBeUndefined();
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expect( collection.selected ).toBe( m2 );
                } );

            } );

        } );

        describe( 'Select.Many collection', function () {
            var collection, expected;

            beforeEach( function () {
                collection = new SelectManyCollection( [m1, m2], { defaultLabel: "starred" } );
                expected = {};
            } );

            describe( 'Calling select() without a label option', function () {

                beforeEach( function () {
                    m1.select();                        // using the default "selected" label of the model here
                    collection.select( m2 );
                } );

                it( 'selects a model with the modified default label', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'does not select the model with the "selected" label', function () {
                    expect( m2.selected ).toBeFalsy();
                } );

                it( 'sets the "starred" property of the collection to the selected model', function () {
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

            } );

            describe( 'Calling deselect() without a label option', function () {

                beforeEach( function () {
                    collection.select( m2 );
                    collection.select( m2, { label: "selected" } );
                    collection.deselect( m2 );
                } );

                it( 'deselects a model with the modified default label', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'does not deselect the model with the "selected" label', function () {
                    expect( m2.selected ).toBe( true );
                } );

                it( 'sets the "starred" property of the collection to an empty hash', function () {
                    expect( collection.starred ).toEqual( {} );
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expected[m2.cid] = m2;
                    expect( collection.selected ).toEqual( expected );
                } );

            } );

            describe( 'Calling selectAll() without a label option', function () {

                beforeEach( function () {
                    collection.selectAll();
                } );

                it( 'selects all models using the modified default label', function () {
                    expect( m1.starred ).toBe( true );
                    expect( m2.starred ).toBe( true );
                } );

                it( 'does not select the models using the "selected" label', function () {
                    expect( m1.selected ).toBeFalsy();
                    expect( m2.selected ).toBeFalsy();
                } );

                it( 'sets the "starred" property of the collection to the selected models', function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expect( collection.selected ).toEqual( {} );
                } );

            } );

            describe( 'Calling deselectAll() without a label option', function () {

                beforeEach( function () {
                    collection.selectAll();
                    collection.selectAll( { label: "selected" } );

                    collection.deselectAll();
                } );

                it( 'deselects all models using the modified default label', function () {
                    expect( m1.starred ).toBe( false );
                    expect( m2.starred ).toBe( false );
                } );

                it( 'does not deselect the models using the "selected" label', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m2.selected ).toBe( true );
                } );

                it( 'sets the "starred" property of the collection to an empty hash', function () {
                    expect( collection.starred ).toEqual( {} );
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.selected ).toEqual( expected );
                } );

            } );

            describe( 'Calling toggleSelectAll() without a label option, when some models are selected with the custom label,', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select();                        // using the default "selected" label of the model here

                    collection.toggleSelectAll();
                } );

                it( 'selects all models using the modified default label', function () {
                    expect( m1.starred ).toBe( true );
                    expect( m2.starred ).toBe( true );
                } );

                it( 'does not change the selection of models using the "selected" label', function () {
                    expect( m1.selected ).toBeFalsy();
                    expect( m2.selected ).toBe( true );
                } );

                it( 'sets the "starred" property of the collection to the selected models', function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( 'does not change the "selected" property of the collection', function () {
                    expected[m2.cid] = m2;
                    expect( collection.selected ).toEqual( expected );
                } );

            } );

        } );

    } );

    describe( 'Interaction between model and collection with different default labels.', function () {
        var model, otherModel, collection;

        describe( 'Select.One collection', function () {

            describe( 'The default label is changed in the collection.', function () {

                beforeEach( function () {
                    model = new Model();
                    otherModel = new Model();
                    collection = new SelectOneCollection( [model, otherModel], { defaultLabel: "starred" } );
                } );

                describe( 'When select() is called on the collection,', function () {

                    beforeEach( function () {
                        collection.select( model );
                    } );

                    it( 'the default label of the collection is selected in the model', function () {
                        expect( model.starred ).toBe( true );
                    } );

                    it( 'the default label of the model remains unselected', function () {
                        expect( model.selected ).toBeFalsy();
                    } );

                } );

                describe( 'When select() is called on the model,', function () {

                    beforeEach( function () {
                        model.select();
                    } );

                    it( 'the default label of the model is updated in the collection', function () {
                        expect( collection.selected ).toBe( model );
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        expect( collection.starred ).toBeUndefined();
                    } );

                } );

                describe( 'When deselect() is called on the collection,', function () {

                    beforeEach( function () {
                        model.select();
                        model.select( { label: "starred" } );
                        collection.deselect( model );
                    } );

                    it( 'the default label of the collection is deselected in the model', function () {
                        expect( model.starred ).toBe( false );
                    } );

                    it( 'the default label of the model remains unchanged', function () {
                        expect( model.selected ).toBe( true );
                    } );

                } );

                describe( 'When deselect() is called on the model (which was marked as "selected" previously),', function () {

                    beforeEach( function () {
                        model.select();
                        otherModel.select( { label: "starred" } );

                        model.deselect();
                    } );

                    it( 'the default label of the model is updated in the collection (set to undefined)', function () {
                        expect( collection.selected ).toBeUndefined();
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        expect( collection.starred ).toBe( otherModel );
                    } );

                } );

            } );

            describe( 'The default label is changed in the model.', function () {

                beforeEach( function () {
                    model = new Model( undefined, { defaultLabel: "starred" } );
                    otherModel = new Model();
                    collection = new SelectOneCollection( [model, otherModel] );
                } );

                describe( 'When select() is called on the collection,', function () {

                    beforeEach( function () {
                        collection.select( model );
                    } );

                    it( 'the default label of the collection is selected in the model', function () {
                        expect( model.selected ).toBe( true );
                    } );

                    it( 'the default label of the model remains unselected', function () {
                        expect( model.starred ).toBeFalsy();
                    } );

                } );

                describe( 'When select() is called on the model,', function () {

                    beforeEach( function () {
                        model.select();
                    } );

                    it( 'the default label of the model is updated in the collection', function () {
                        expect( collection.starred ).toBe( model );
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        expect( collection.selected ).toBeUndefined();
                    } );

                } );

                describe( 'When deselect() is called on the collection,', function () {

                    beforeEach( function () {
                        model.select();
                        model.select( { label: "selected" } );
                        collection.deselect( model );
                    } );

                    it( 'the default label of the collection is deselected in the model', function () {
                        expect( model.selected ).toBe( false );
                    } );

                    it( 'the default label of the model remains unchanged', function () {
                        expect( model.starred ).toBe( true );
                    } );

                } );

                describe( 'When deselect() is called on the model (which was marked as "selected" previously)', function () {

                    beforeEach( function () {
                        model.select();
                        otherModel.select( { label: "selected" } );

                        model.deselect();
                    } );

                    it( 'the default label of the model is updated in the collection (set to undefined)', function () {
                        expect( collection.starred ).toBeUndefined();
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        expect( collection.selected ).toBe( otherModel );
                    } );

                } );

            } );

        } );

        describe( 'Select.Many collection', function () {
            var expected;

            beforeEach( function () {
                expected = {};
            } );

            describe( 'The default label is changed in the collection.', function () {

                beforeEach( function () {
                    model = new Model();
                    otherModel = new Model();
                    collection = new SelectManyCollection( [model, otherModel], { defaultLabel: "starred" } );
                } );

                describe( 'When select() is called on the collection,', function () {

                    beforeEach( function () {
                        collection.select( model );
                    } );

                    it( 'the default label of the collection is selected in the model', function () {
                        expect( model.starred ).toBe( true );
                    } );

                    it( 'the default label of the model remains unselected', function () {
                        expect( model.selected ).toBeFalsy();
                    } );

                } );

                describe( 'When select() is called on the model,', function () {

                    beforeEach( function () {
                        model.select();
                    } );

                    it( 'the default label of the model is updated in the collection', function () {
                        expected[model.cid] = model;
                        expect( collection.selected ).toEqual( expected );
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        // If a label has been registered in any model or the collection, the corresponding collection
                        // property is no longer undefined, but set to an empty hash. Here, the hash exists because
                        // "starred" is registered as the default label in the collection.
                        expect( collection.starred ).toEqual( {} );
                    } );

                } );

                describe( 'When deselect() is called on the collection,', function () {

                    beforeEach( function () {
                        model.select();
                        model.select( { label: "starred" } );
                        collection.deselect( model );
                    } );

                    it( 'the default label of the collection is deselected in the model', function () {
                        expect( model.starred ).toBe( false );
                    } );

                    it( 'the default label of the model remains unchanged', function () {
                        expect( model.selected ).toBe( true );
                    } );

                } );

                describe( 'When deselect() is called on the model (which was marked as "selected" previously),', function () {

                    beforeEach( function () {
                        model.select();
                        otherModel.select( { label: "starred" } );

                        model.deselect();
                    } );

                    it( 'the default label of the model is updated in the collection (set to an empty hash)', function () {
                        expect( collection.selected ).toEqual( {} );
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        expected[otherModel.cid] = otherModel;
                        expect( collection.starred ).toEqual( expected );
                    } );

                } );

            } );

            describe( 'The default label is changed in the model.', function () {

                beforeEach( function () {
                    model = new Model( undefined, { defaultLabel: "starred" } );
                    otherModel = new Model();
                    collection = new SelectManyCollection( [model, otherModel] );
                } );

                describe( 'When select() is called on the collection,', function () {

                    beforeEach( function () {
                        collection.select( model );
                    } );

                    it( 'the default label of the collection is selected in the model', function () {
                        expect( model.selected ).toBe( true );
                    } );

                    it( 'the default label of the model remains unselected', function () {
                        expect( model.starred ).toBeFalsy();
                    } );

                } );

                describe( 'When select() is called on the model,', function () {

                    beforeEach( function () {
                        model.select();
                    } );

                    it( 'the default label of the model is updated in the collection', function () {
                        expected[model.cid] = model;
                        expect( collection.starred ).toEqual( expected );
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        // If a label has been registered in any model or the collection, the corresponding collection
                        // property is no longer undefined, but set to an empty hash. Here, the hash exists because
                        // "selected" is registered as the default label in the collection.
                        expect( collection.selected ).toEqual( {} );
                    } );

                } );

                describe( 'When deselect() is called on the collection,', function () {

                    beforeEach( function () {
                        model.select();
                        model.select( { label: "selected" } );
                        collection.deselect( model );
                    } );

                    it( 'the default label of the collection is deselected in the model', function () {
                        expect( model.selected ).toBe( false );
                    } );

                    it( 'the default label of the model remains unchanged', function () {
                        expect( model.starred ).toBe( true );
                    } );

                } );

                describe( 'When deselect() is called on the model (which was marked as "selected" previously)', function () {

                    beforeEach( function () {
                        model.select();
                        otherModel.select( { label: "selected" } );

                        model.deselect();
                    } );

                    it( 'the default label of the model is updated in the collection (set to an empty hash)', function () {
                        expect( collection.starred ).toEqual( {} );
                    } );

                    it( 'the default label of the collection is not updated', function () {
                        expected[otherModel.cid] = otherModel;
                        expect( collection.selected ).toEqual( expected );
                    } );

                } );

            } );

        } );

    } );

    describe( 'Interaction between collections with different default labels, sharing the same models.', function () {
        var collection, otherSelectOneCollection, otherSelectManyCollection, events;

        describe( 'Select.One collection with custom default label', function () {

            beforeEach( function () {
                collection = new SelectOneCollection( [m1, m2], { defaultLabel: "starred", enableModelSharing: true } );

                otherSelectOneCollection = new SelectOneCollection( [m1, m2], { defaultLabel: "picked", enableModelSharing: true } );
                otherSelectManyCollection = new SelectManyCollection( [m1, m2], { defaultLabel: "picked", enableModelSharing: true } );

                events = getEventSpies( [otherSelectOneCollection, otherSelectManyCollection], ["selected", "starred", "picked"] );
            } );

            describe( 'When select() is called on the collection,', function () {

                beforeEach( function () {
                    collection.select( m1 );
                } );

                it( 'another Select.One collection emits the correct label in its select:one event', function () {
                    expect( events.get( otherSelectOneCollection, "select:one" ) ).toHaveBeenCalledOnce();
                    expect( events.get( otherSelectOneCollection, "select:one" ) ).toHaveBeenCalledWith( m1, otherSelectOneCollection, { label: "starred" } );
                } );

                it( 'another Select.Many collection emits the correct label in its select:some event', function () {
                    expect( events.get( otherSelectManyCollection, "select:some" ) ).toHaveBeenCalledOnce();
                    expect( events.get( otherSelectManyCollection, "select:some" ) ).toHaveBeenCalledWith( { selected: [m1], deselected: [] }, otherSelectManyCollection, { label: "starred" } );
                } );

            } );

        } );

        describe( 'Select.Many collection with custom default label', function () {

            beforeEach( function () {
                collection = new SelectManyCollection( [m1, m2], { defaultLabel: "starred", enableModelSharing: true } );

                otherSelectOneCollection = new SelectOneCollection( [m1, m2], { defaultLabel: "picked", enableModelSharing: true } );
                otherSelectManyCollection = new SelectManyCollection( [m1, m2], { defaultLabel: "picked", enableModelSharing: true } );

                events = getEventSpies( [otherSelectOneCollection, otherSelectManyCollection], ["selected", "starred", "picked"] );
            } );

            describe( 'When select() is called on the collection,', function () {

                beforeEach( function () {
                    collection.select( m1 );
                } );

                it( 'another Select.One collection emits the correct label in its select:one event', function () {
                    expect( events.get( otherSelectOneCollection, "select:one" ) ).toHaveBeenCalledOnce();
                    expect( events.get( otherSelectOneCollection, "select:one" ) ).toHaveBeenCalledWith( m1, otherSelectOneCollection, { label: "starred" } );
                } );

                it( 'another Select.Many collection emits the correct label in its select:some event', function () {
                    expect( events.get( otherSelectManyCollection, "select:some" ) ).toHaveBeenCalledOnce();
                    expect( events.get( otherSelectManyCollection, "select:some" ) ).toHaveBeenCalledWith( { selected: [m1], deselected: [] }, otherSelectManyCollection, { label: "starred" } );
                } );

            } );
        } );

    } );

    describe( 'Select.Many: A collection property is created for a custom default label, and holds a hash,', function () {
        var model, collection;

        it( 'for a default label defined in a model, even if the label has not actually been used', function () {
            model = new Model( undefined, { defaultLabel: "starred" } );
            collection = new SelectManyCollection( [model] );
            expect( collection.starred ).toEqual( {} );
        } );

        it( 'for a default label defined in a model, even if the label has not actually been used (model sharing enabled)', function () {
            model = new Model( undefined, { defaultLabel: "starred" } );
            collection = new SelectManyCollection( [model], { enableModelSharing: true } );
            expect( collection.starred ).toEqual( {} );
        } );

        it( 'for a default label defined in the collection, even if the label has not actually been used', function () {
            collection = new SelectManyCollection( undefined, { defaultLabel: "starred" } );
            expect( collection.starred ).toEqual( {} );
        } );

    } );

    describe( '_pickyDefaultLabel property.', function () {

        describe( 'Select.Me model', function () {

            it( 'By default, _pickyDefaultLabel is set to "selected"', function () {
                var model = new Model();
                expect( model._pickyDefaultLabel ).toEqual( "selected" );
            } );

            it( 'When the default label is changed, _pickyDefaultLabel is set to the new label', function () {
                var model = new Model( undefined, { defaultLabel: "starred" } );
                expect( model._pickyDefaultLabel ).toEqual( "starred" );
            } );

        } );

        describe( 'Select.One collection', function () {

            it( 'By default, _pickyDefaultLabel is set to "selected"', function () {
                var collection = new SelectOneCollection();
                expect( collection._pickyDefaultLabel ).toEqual( "selected" );
            } );

            it( 'When the default label is changed, _pickyDefaultLabel is set to the new label', function () {
                var collection = new SelectOneCollection( undefined, { defaultLabel: "starred" } );
                expect( collection._pickyDefaultLabel ).toEqual( "starred" );
            } );

        } );

        describe( 'Select.Many collection', function () {

            it( 'By default, _pickyDefaultLabel is set to "selected"', function () {
                var collection = new SelectManyCollection();
                expect( collection._pickyDefaultLabel ).toEqual( "selected" );
            } );

            it( 'When the default label is changed, _pickyDefaultLabel is set to the new label', function () {
                var collection = new SelectManyCollection( undefined, { defaultLabel: "starred" } );
                expect( collection._pickyDefaultLabel ).toEqual( "starred" );
            } );

        } );

    } );

    describe( 'Preventing conflicts with existing methods and properties.', function () {

        describe( 'Using an illegal default label in a call on a Backbone.Select.Me model. An error is thrown', function () {

            it( 'when a label name matches an existing Backbone model method', function () {
                var label = "save";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'when a label name matches an existing Backbone model property', function () {
                var label = "attributes";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection method', function () {
                var label = "at";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection property', function () {
                var label = "models";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Me method', function () {
                var label = "toggleSelected";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.One method', function () {
                var label = "deselect";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Many method', function () {
                var label = "toggleSelectAll";
                expect( function () { new Model( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

        } );

        describe( 'Using an illegal default label in a call on a Backbone.Select.One collection. An error is thrown', function () {

            it( 'when a label name matches an existing Backbone model method', function () {
                var label = "save";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'when a label name matches an existing Backbone model property', function () {
                var label = "attributes";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection method', function () {
                var label = "at";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection property', function () {
                var label = "models";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Me method', function () {
                var label = "toggleSelected";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.One method', function () {
                var label = "deselect";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Many method', function () {
                var label = "toggleSelectAll";
                expect( function () { new SelectOneCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

        } );

        describe( 'Using an illegal default label in a call on a Backbone.Select.Many collection. An error is thrown', function () {

            it( 'when a label name matches an existing Backbone model method', function () {
                var label = "save";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'when a label name matches an existing Backbone model property', function () {
                var label = "attributes";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection method', function () {
                var label = "at";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Backbone collection property', function () {
                var label = "models";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Me method', function () {
                var label = "toggleSelected";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.One method', function () {
                var label = "deselect";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

            it( 'When a label name matches an existing Select.Many method', function () {
                var label = "toggleSelectAll";
                expect( function () { new SelectManyCollection( undefined, { defaultLabel: label } ); } ).toThrowError( 'Illegal label name "' + label + '", is in conflict with an existing Backbone or Backbone.Select property or method' );
            } );

        } );

    } );

} );