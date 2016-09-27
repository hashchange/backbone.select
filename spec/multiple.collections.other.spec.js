describe( "Models shared between multiple collections: _externalEvent option, registering and unregistering a collection", function () {

    var Model, SingleSelectCollection, MultiSelectCollection;

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    beforeEach( function () {

        Model = Backbone.Model.extend( {
            initialize: function () {
                Backbone.Select.Me.applyTo( this );
            }
        } );

        SingleSelectCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.One.applyTo( this, models );
            }
        } );

        MultiSelectCollection = Backbone.Collection.extend( {
            initialize: function ( models ) {
                Backbone.Select.Many.applyTo( this, models );
            }
        } );

    } );

    describe( 'option signalling the external event', function () {

        describe( 'when a selected model is added', function () {
            var model1, model2, model3, singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                MultiSelectCollection = MultiSelectCollection.extend( {
                    onSelectSome: function ( diff, collection, options ) {
                        this.externalEventOnSelectSome = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();
                model2.select();
                model3.select();

                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should set _externalEvent: "add" in the select:one event when added to a single-select collection', function () {
                singleCollectionA.add( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should set _externalEvent: "add" in the deselect:one event when added to a single-select collection', function () {
                singleCollectionA.add( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to the deselected model when added to a single-select collection', function () {
                singleCollectionA.add( model2 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "add" in the select:some or select:all event when added to a multi-select collection', function () {
                multiCollectionA.add( model3 );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model3], deselected: [] }, multiCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to another collection when the addition is inducing a deselection there', function () {
                singleCollectionA.add( model2 );
                expect( multiCollectionA.externalEventOnSelectSome ).toBeUndefined();
            } );
        } );

        describe( 'when a selected model is added with set()', function () {
            var model1, model2, model3, singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                MultiSelectCollection = MultiSelectCollection.extend( {
                    onSelectSome: function ( diff, collection, options ) {
                        this.externalEventOnSelectSome = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();
                model2.select();
                model3.select();

                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should set _externalEvent: "add" in the select:one event when added to a single-select collection', function () {
                singleCollectionA.set( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", model2, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should set _externalEvent: "remove" in the deselect:one event when added to a single-select collection', function () {
                singleCollectionA.set( model2 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, jasmine.objectContaining( { _externalEvent: "remove", label: "selected" } ) );
            } );

            it( 'should not propagate the _externalEvent option to the deselected model when added to a single-select collection', function () {
                singleCollectionA.set( model2 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "add" in the select:some or select:all event when added to a multi-select collection', function () {
                multiCollectionA.set( model3 );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [model3], deselected: [] }, multiCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent option to another collection when the addition is inducing a deselection there', function () {
                singleCollectionA.set( model2 );
                expect( multiCollectionA.externalEventOnSelectSome ).toBeUndefined();
            } );
        } );

        describe( 'when a selected model is added with create()', function () {

            // NB In order to create a model **selected**, we need to use a model type which self-selects in initialize().

            var originalBackboneAjax,
                model1, model2,
                singleCollectionA, multiCollectionA;

            beforeAll( function () {
                originalBackboneAjax = Backbone.ajax;
                Backbone.ajax = function () {};
            } );

            afterAll( function () {
                Backbone.ajax = originalBackboneAjax;
            } );

            beforeEach( function () {
                var SelfSelectingModel;

                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                SelfSelectingModel = Model.extend( {

                    initialize: function () {
                        Backbone.Select.Me.applyTo( this );
                        spyOn( this, "trigger" ).and.callThrough();
                        this.select();
                    },

                    urlRoot: "/"

                } );

                MultiSelectCollection = MultiSelectCollection.extend( {
                    onSelectSome: function ( diff, collection, options ) {
                        this.externalEventOnSelectSome = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1], { model: SelfSelectingModel } );
                multiCollectionA = new MultiSelectCollection( [model1, model2], { model: SelfSelectingModel } );

                model1.select();
                model2.select();

                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should set _externalEvent: "add" in the select:one event when created in a single-select collection', function () {
                var createdModel = singleCollectionA.create( {} );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "select:one", createdModel, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should set _externalEvent: "add" in the deselect:one event when created in a single-select collection', function () {
                singleCollectionA.create( {} );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to the deselected model when created in a single-select collection', function () {
                singleCollectionA.create( {} );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "add" in the select:some or select:all event when created in a multi-select collection', function () {
                var createdModel = multiCollectionA.create( {} );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:all", { selected: [createdModel], deselected: [] }, multiCollectionA, { _externalEvent: "add", label: "selected" } );
            } );

            it( 'should not propagate the _externalEvent: "add" option to another collection when the model creation is inducing a deselection there', function () {
                singleCollectionA.create( {} );
                expect( multiCollectionA.externalEventOnSelectSome ).toBeUndefined();
            } );
        } );

        describe( 'when a selected model is removed', function () {
            var model1, model2,
                singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1, model2] );
                multiCollectionA = new MultiSelectCollection( [model1, model2] );

                model1.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should not propagate the _externalEvent: "remove" option to the deselected model when the model is removed from all collections (single-select collection last)', function () {
                multiCollectionA.remove( model1 );
                singleCollectionA.remove( model1 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should not propagate the _externalEvent: "remove" option to the deselected model when the model is removed from all collections (multi-select collection last)', function () {
                singleCollectionA.remove( model1 );
                multiCollectionA.remove( model1 );
                expect( model1.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "remove" in the deselect:one event, and pass along options.index from the remove event, when the model is removed from a single-select collection', function () {
                singleCollectionA.remove( model1 );
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, { _externalEvent: "remove", index: 0, label: "selected" } );
            } );

            it( 'should set _externalEvent: "remove" in the select:some or select:none event, and pass along options.index from the remove event, when the model is removed from a multi-select collection', function () {
                multiCollectionA.remove( model1 );
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [model1] }, multiCollectionA, { _externalEvent: "remove", index: 0, label: "selected" } );
            } );

            it( 'should set _externalEvent: "remove" in the select:all event, and pass along options.index from the remove event, when the model is removed from a multi-select collection and all remaining models are still selected', function () {
                var model3 = new Model();
                var model4 = new Model();

                var multiCollection = new MultiSelectCollection( [model3, model4] );
                model3.select();
                model4.select();

                spyOn( multiCollection, "trigger" ).and.callThrough();

                multiCollection.remove( model3 );
                expect( multiCollection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [], deselected: [model3] }, multiCollection, { _externalEvent: "remove", index: 0, label: "selected" } );
            } );
        } );

        describe( 'when a selected model is destroyed', function () {
            var model1, model2, model3, model4,
                singleCollectionA, multiCollectionA;

            beforeEach( function () {
                Model = Model.extend( {
                    onDeselect: function ( model, options ) {
                        this.externalEventOnDeselect = options && options._externalEvent;
                    }
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();
                model4 = new Model();

                singleCollectionA = new SingleSelectCollection( [model1, model3, model4] );
                multiCollectionA = new MultiSelectCollection( [model2, model3, model4] );

                model3.select();

                spyOn( model1, "trigger" ).and.callThrough();
                spyOn( model2, "trigger" ).and.callThrough();
                spyOn( singleCollectionA, "trigger" ).and.callThrough();
                spyOn( multiCollectionA, "trigger" ).and.callThrough();
            } );

            afterEach( function () {
                singleCollectionA.close();
                multiCollectionA.close();
            } );

            it( 'should not propagate the _externalEvent: "remove" option to the destroyed model', function () {
                model3.destroy();
                expect( model3.externalEventOnDeselect ).toBeUndefined();
            } );

            it( 'should set _externalEvent: "remove" in the deselect:one event, and pass along options.index from the remove event, when the model is destroyed in a single-select collection', function () {
                model1.select();
                singleCollectionA.trigger.calls.reset();

                model1.destroy();
                expect( singleCollectionA.trigger ).toHaveBeenCalledWith( "deselect:one", model1, singleCollectionA, jasmine.objectContaining( { _externalEvent: "remove", index: 0, label: "selected" } ) );
            } );

            it( 'should set _externalEvent: "remove" in the select:some or select:none event, and pass along options.index from the remove event, when the model is destroyed in a multi-select collection', function () {
                model2.select();
                multiCollectionA.trigger.calls.reset();

                model2.destroy();
                expect( multiCollectionA.trigger ).toHaveBeenCalledWith( "select:some", { selected: [], deselected: [model2] }, multiCollectionA, jasmine.objectContaining( { _externalEvent: "remove", index: 0, label: "selected" } ) );
            } );

            it( 'should set _externalEvent: "remove" in the select:all event, and pass along options.index from the remove event, when the model is destroyed in a multi-select collection and all remaining models are still selected', function () {
                var model5 = new Model();
                var model6 = new Model();

                var multiCollection = new MultiSelectCollection( [model5, model6] );
                model5.select();
                model6.select();

                spyOn( multiCollection, "trigger" ).and.callThrough();

                model5.destroy();
                expect( multiCollection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [], deselected: [model5] }, multiCollection, jasmine.objectContaining( { _externalEvent: "remove", index: 0, label: "selected" } ) );
            } );
        } );

        // `reset` event:
        //
        // The _externalEvent: "reset" is not implemented. reset() is meant to
        // suppress individual notifications. Just like the add event, selection
        // events are silenced during a reset. Hence, without a selection event,
        // _externalEvent: "reset" won't ever occur.
        //
        // Whatever needs to be done, should be dealt with in the reset event
        // handler.

    } );

    describe( 'registering and unregistering a collection with models', function () {

        var originalBackboneAjax;

        beforeAll( function () {
            originalBackboneAjax = Backbone.ajax;
            Backbone.ajax = function () {};
        } );

        afterAll( function () {
            Backbone.ajax = originalBackboneAjax;
        } );

        describe( 'A single-select collection', function () {

            var model1, model2, model3, models, collection;

            beforeEach( function () {
                SingleSelectCollection = SingleSelectCollection.extend( {
                    url: "/"
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                models = [model1, model2, model3];

                model2.select();

                collection = new SingleSelectCollection();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'is registered with a set of models', function () {

                it( 'when the models are passed in at instantiation', function () {
                    collection = new SingleSelectCollection( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added', function () {
                    collection.add( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added, with options.silent enabled', function () {
                    collection.add( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set()', function () {
                    collection.set( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set(), with options.silent enabled', function () {
                    collection.set( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create()', function () {
                    var createdModel1 = collection.create( {} ),
                        createdModel2 = collection.create( {} ),
                        createdModel3 = collection.create( {} );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create(), with options.silent enabled', function () {
                    var createdModel1 = collection.create( {}, { silent: true } ),
                        createdModel2 = collection.create( {}, { silent: true } ),
                        createdModel3 = collection.create( {}, { silent: true } );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset', function () {
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, with options.silent enabled', function () {
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before', function () {
                    collection.add( models );
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before (options.silent enabled)', function () {
                    collection.add( models );
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

            } );

            describe( 'is unregistered with a set of models', function () {

                it( 'when the models are removed', function () {
                    collection.add( models );
                    collection.remove( models );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are removed, with options.silent enabled', function () {
                    collection.add( models );
                    collection.remove( models, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy();
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed, with options.silent enabled', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy( { silent: true } );
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset', function () {
                    collection.add( models );
                    collection.reset();

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset, with options.silent enabled', function () {
                    collection.add( models );
                    collection.reset( null, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

            } );

        } );

        describe( 'A multi-select collection', function () {

            var model1, model2, model3, models, collection;

            beforeEach( function () {
                MultiSelectCollection = MultiSelectCollection.extend( {
                    url: "/"
                } );

                model1 = new Model();
                model2 = new Model();
                model3 = new Model();

                models = [model1, model2, model3];

                model2.select();

                collection = new MultiSelectCollection();
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'is registered with a set of models', function () {

                it( 'when the models are passed in at instantiation', function () {
                    collection = new MultiSelectCollection( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added', function () {
                    collection.add( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added, with options.silent enabled', function () {
                    collection.add( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set()', function () {
                    collection.set( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with set(), with options.silent enabled', function () {
                    collection.set( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create()', function () {
                    var createdModel1 = collection.create( {} ),
                        createdModel2 = collection.create( {} ),
                        createdModel3 = collection.create( {} );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are added with create(), with options.silent enabled', function () {
                    var createdModel1 = collection.create( {}, { silent: true } ),
                        createdModel2 = collection.create( {}, { silent: true } ),
                        createdModel3 = collection.create( {}, { silent: true } );

                    expect( createdModel1._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel2._pickyCollections ).toContain( collection._pickyCid );
                    expect( createdModel3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset', function () {
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, with options.silent enabled', function () {
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before', function () {
                    collection.add( models );
                    collection.reset( models );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

                it( 'when the models are passed in with a reset, even if they had been part of the collection before (options.silent enabled)', function () {
                    collection.add( models );
                    collection.reset( models, { silent: true } );

                    expect( model1._pickyCollections ).toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).toContain( collection._pickyCid );
                } );

            } );

            describe( 'is unregistered with a set of models', function () {

                it( 'when the models are removed', function () {
                    collection.add( models );
                    collection.remove( models );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are removed, with options.silent enabled', function () {
                    collection.add( models );
                    collection.remove( models, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy();
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the models are destroyed, with options.silent enabled', function () {
                    collection.add( models );
                    _.each( models, function ( model ) {
                        model.destroy( { silent: true } );
                    } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset', function () {
                    collection.add( models );
                    collection.reset();

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

                it( 'when the collection is reset, with options.silent enabled', function () {
                    collection.add( models );
                    collection.reset( null, { silent: true } );

                    expect( model1._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model2._pickyCollections ).not.toContain( collection._pickyCid );
                    expect( model3._pickyCollections ).not.toContain( collection._pickyCid );
                } );

            } );

        } );

    } );

} );
