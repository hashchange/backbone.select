describe( "multi-select collection: general", function () {
    var Model = Backbone.Model.extend( {
        initialize: function ( attributes, options ) {
            Backbone.Select.Me.applyTo( this, options );
        }
    } );

    var Collection = Backbone.Collection.extend( {
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

    describe( 'A Select.Many collection instance should identify itself', function () {
        var collection;

        beforeEach( function () {
            collection = new Collection();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "as an instance of Backbone.Collection", function () {
            expect( collection instanceof Backbone.Collection ).toBe( true );
        } );

        it( "as 'Backbone.Select.Many' with the _pickyType property", function () {
            expect( collection._pickyType ).toBe( "Backbone.Select.Many" );
        } );
    } );

    describe( 'automatic invocation of onSelectNone, onSelectSome, onSelectAll, onReselect handlers', function () {
        var EventHandlingCollection, model, collection;

        beforeEach( function () {

            EventHandlingCollection = Collection.extend( {
                onSelectNone: function () {},
                onSelectSome: function () {},
                onSelectAll: function () {},
                onReselect: function () {},

                // Pseudo event handlers modeled on internal events `@bbs:_selected`,
                // `@bbs:_deselected`; should not be invoked automatically
                "on@bbs:_selected": function () {},
                "on@bbs:_deselected": function () {},

                // Pseudo event handlers modeled on standard Backbone events `add`,
                // `remove`, `reset`, `all` (as stand-ins for all others) ; should
                // not be invoked automatically
                onAdd: function () {},
                onRemove: function () {},
                onReset: function () {},
                onAll: function () {}
            } );

            model = new Model();
            collection = new EventHandlingCollection( [model] );

            spyOn( collection, "onSelectNone" ).and.callThrough();
            spyOn( collection, "onSelectSome" ).and.callThrough();
            spyOn( collection, "onSelectAll" ).and.callThrough();
            spyOn( collection, "onReselect" ).and.callThrough();

            spyOn( collection, "on@bbs:_selected" ).and.callThrough();
            spyOn( collection, "on@bbs:_deselected" ).and.callThrough();

            spyOn( collection, "onAdd" ).and.callThrough();
            spyOn( collection, "onRemove" ).and.callThrough();
            spyOn( collection, "onReset" ).and.callThrough();
            spyOn( collection, "onAll" ).and.callThrough();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( 'calls the onSelectNone handler when triggering a select:none event', function () {
            collection.trigger( "select:none", { selected: [], deselected: [model] }, collection, {foo: "bar"} );
            expect( collection.onSelectNone ).toHaveBeenCalledWith( { selected: [], deselected: [model] }, collection, {foo: "bar"} );
        } );

        it( 'calls the onSelectSome handler when triggering a select:some event', function () {
            collection.trigger( "select:some", { selected: [model], deselected: [] }, collection, {foo: "bar"} );
            expect( collection.onSelectSome ).toHaveBeenCalledWith( { selected: [model], deselected: [] }, collection, {foo: "bar"} );
        } );

        it( 'calls the onSelectAll handler when triggering a select:all event', function () {
            collection.trigger( "select:all", { selected: [model], deselected: [] }, collection, {foo: "bar"} );
            expect( collection.onSelectAll ).toHaveBeenCalledWith( { selected: [model], deselected: [] }, collection, {foo: "bar"} );
        } );

        it( 'calls the onReselect handler when triggering a reselect:any event', function () {
            collection.trigger( "reselect:any", [model], collection, {foo: "bar"} );
            expect( collection.onReselect ).toHaveBeenCalledWith( [model], collection, {foo: "bar"} );
        } );

        it( 'does not call an event handler accidentally named after the internal @bbs:_selected event', function () {
            model.trigger( "@bbs:_selected", model );
            expect( collection["on@bbs:_selected"] ).not.toHaveBeenCalled();
        } );

        it( 'does not call an event handler accidentally named after the internal @bbs:_deselected event', function () {
            model.trigger( "@bbs:_deselected", model );
            expect( collection["on@bbs:_deselected"] ).not.toHaveBeenCalled();
        } );

        it( 'does not automatically call an event handler named after a standard Backbone event (e.g. onAdd)', function () {
            collection.trigger( "add", model, collection, {} );
            collection.trigger( "remove", model, collection, {} );
            collection.trigger( "reset", collection, { previousModels: [] } );
            collection.trigger( "all", "add", model, collection, {} );

            expect( collection.onAdd ).not.toHaveBeenCalled();
            expect( collection.onRemove ).not.toHaveBeenCalled();
            expect( collection.onReset ).not.toHaveBeenCalled();
            expect( collection.onAll ).not.toHaveBeenCalled();
        } );
    } );

    describe( 'Chaining', function () {
        var model, collection;

        beforeEach( function () {
            model = new Model();
            collection = new Collection( [model] );
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'The collection is returned', function () {

            describe( 'when calling select()', function () {

                it( 'with an unselected model as argument', function () {
                    expect( collection.select( model ) ).toBe( collection );
                } );

                it( 'with a selected model as argument', function () {
                    model.select();
                    expect( collection.select( model ) ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    expect( collection.select( model, { label: "starred" } ) ).toBe( collection );
                } );

            } );

            describe( 'when calling deselect()', function () {

                it( 'with an unselected model as argument', function () {
                    expect( collection.deselect( model ) ).toBe( collection );
                } );

                it( 'with a selected model as argument', function () {
                    model.select();
                    expect( collection.deselect( model ) ).toBe( collection );
                } );

                it( 'without a model argument, while no model in the collection is selected', function () {
                    expect( collection.deselect() ).toBe( collection );
                } );

                it( 'without a model argument, while a model in the collection is selected', function () {
                    model.select();
                    expect( collection.deselect() ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    model.select( { label: "starred" } );
                    expect( collection.deselect( model, { label: "starred" } ) ).toBe( collection );
                } );

            } );

            describe( 'when calling selectAll()', function () {

                it( 'when no models in the collection are selected', function () {
                    expect( collection.selectAll() ).toBe( collection );
                } );

                it( 'when all models in the collection are selected', function () {
                    collection.selectAll();
                    expect( collection.selectAll() ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    expect( collection.selectAll( { label: "starred" } ) ).toBe( collection );
                } );

            } );

            describe( 'when calling deselectAll()', function () {

                it( 'when no models in the collection are selected', function () {
                    expect( collection.deselectAll() ).toBe( collection );
                } );

                it( 'when all models in the collection are selected', function () {
                    collection.selectAll();
                    expect( collection.deselectAll() ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    model.select( { label: "starred" } );
                    expect( collection.deselectAll( { label: "starred" } ) ).toBe( collection );
                } );

            } );

            describe( 'when calling invertSelection()', function () {

                it( 'when no models in the collection are selected', function () {
                    expect( collection.invertSelection() ).toBe( collection );
                } );

                it( 'when all models in the collection are selected', function () {
                    collection.selectAll();
                    expect( collection.invertSelection() ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    expect( collection.invertSelection( { label: "starred" } ) ).toBe( collection );
                } );

            } );

            describe( 'when calling toggleSelectAll()', function () {

                it( 'when no models in the collection are selected', function () {
                    expect( collection.toggleSelectAll() ).toBe( collection );
                } );

                it( 'when all models in the collection are selected', function () {
                    collection.selectAll();
                    expect( collection.toggleSelectAll() ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    expect( collection.toggleSelectAll( { label: "starred" } ) ).toBe( collection );
                } );

            } );

            describe( 'when calling selectNone()', function () {

                it( 'when no models in the collection are selected', function () {
                    expect( collection.selectNone() ).toBe( collection );
                } );

                it( 'when all models in the collection are selected', function () {
                    collection.selectAll();
                    expect( collection.selectNone() ).toBe( collection );
                } );

                it( 'with a custom label which is ignored in the collection', function () {
                    collection = new Collection( [model], { ignoreLabel: "starred" } );
                    model.select( { label: "starred" } );
                    expect( collection.selectNone( { label: "starred" } ) ).toBe( collection );
                } );

            } );

        } );

    } );

    describe( 'Compatibility with Backbone.Collection.select', function () {

        describe( "The collection's select is called without a model as first argument", function () {

            describe( 'when Backbone.Collection.select has not been modified or overridden on the base type', function () {

                var model0, model1, model2, models, filter, filterWithContext, collection;

                beforeEach( function () {
                    filter = function ( model ) {
                        // Arbitrary filter function, here returning the models with an even ID.
                        return model.id % 2 === 0;
                    };

                    filterWithContext = function ( model ) {
                        // Arbitrary filter function, relying on a this argument representing the collection. Returns
                        // models at an even index in the collection, given the default sort order.
                        return this.indexOf( model ) % 2 === 0;
                    };


                    model0 = new Model( {id: 0} );
                    model1 = new Model( {id: 1} );
                    model2 = new Model( {id: 2} );

                    models = [ model0, model1, model2 ];

                    collection = new Collection( models );
                } );

                afterEach( function () {
                    collection.close();
                } );

                it( 'returns the same array of models as Backbone.Collection.filter', function () {
                    var result = collection.select( filter );
                    expect( result ).toEqual( [ model0, model2 ] );
                    expect( result ).toEqual( collection.filter( filter ) );
                } );

                it( 'honours the context argument of the Backbone filter/select method if it is provided', function () {
                    var result = collection.select( filterWithContext, collection );
                    expect( result ).toEqual( [ model0, model2 ] );
                    expect( result ).toEqual( collection.filter( filterWithContext, collection ) );
                } );
            } );

            describe( 'when Backbone.Collection.select has been overridden in the prototype chain', function () {

                var CollectionWithCustomSelectFoo, CollectionWithCustomSelectBar,
                    model, collectionFoo, collectionBar;

                beforeEach( function () {

                    CollectionWithCustomSelectFoo = Backbone.Collection.extend( {
                        initialize: function ( models ) {
                            Backbone.Select.Many.applyTo( this, models );
                        },
                        select: function ( arg1, arg2 ) {
                            return "foo:" + arg1 + ":" + arg2;
                        }
                    } );

                    CollectionWithCustomSelectBar = CollectionWithCustomSelectFoo.extend( {
                        select: function ( arg1, arg2 ) {
                            return "bar:" + arg1 + ":" + arg2;
                        }
                    } );

                    model = new Model();
                } );

                afterEach( function () {
                    if ( collectionFoo ) collectionFoo.close();
                    if ( collectionBar ) collectionBar.close();
                } );

                it( 'returns the result of the modified select method', function () {
                    collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    expect( collectionFoo.select( "arg1", "arg2" ) ).toEqual( "foo:arg1:arg2" );
                } );

                // Now checking that the modified select methods are kept around independently, without e.g. the last
                // modification overwriting the others.

                it( 'returns the result of a another select method, which has been modified in different way, when that collection is instantiated after the original one', function () {
                    //noinspection JSUnusedLocalSymbols
                    collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    collectionBar = new CollectionWithCustomSelectBar( [model] );
                    expect( collectionBar.select( "arg1", "arg2" ) ).toEqual( "bar:arg1:arg2" );
                } );

                it( 'returns the result of a another select method, which has been modified in different way, when that collection is instantiated before the original one', function () {
                    collectionBar = new CollectionWithCustomSelectBar( [model] );
                    //noinspection JSUnusedLocalSymbols
                    collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    expect( collectionBar.select( "arg1", "arg2" ) ).toEqual( "bar:arg1:arg2" );
                } );
            } );

        } );

    } );

    describe( 'Checking for memory leaks', function () {

        describe( 'when a collection is replaced by another one and is not referenced by a variable any more', function () {
            var logger, Collection, LoggedCollection, m1, m2, collection;

            beforeEach( function () {
                logger = new Logger();

                Collection = Backbone.Collection.extend( {
                    model: Model,

                    initialize: function ( models ) {
                        Backbone.Select.Many.applyTo( this, models );
                    }
                } );

                LoggedCollection = Collection.extend( {
                    initialize: function ( models ) {
                        this.on( "select:none", function () {
                            logger.log( "select:none event fired in selected in collection " + this._pickyCid );
                        } );
                        this.on( "select:some", function () {
                            logger.log( "select:some event fired in selected in collection " + this._pickyCid );
                        } );
                        this.on( "select:all", function () {
                            logger.log( "select:all event fired in selected in collection " + this._pickyCid );
                        } );

                        Collection.prototype.initialize.call( this, models );
                    }
                } );

                m1 = new Model();
                m2 = new Model();

                // A model holds a reference to the first collection it is assigned to, in its .collection property.
                // That reference keeps the first collection around as long as the model exists. This (small) memory
                // leak is caused by Backbone itself.
                //
                // For testing the impact of Backbone.Select, that effect must not be at play. So the models are
                // assigned to a throw-away collection first, which "occupies" the .collection property in the models,
                // neutralizing it.
                new Backbone.Collection( [m1, m2] );
            } );

            afterEach( function () {
                if ( collection ) collection.close();
            } );

            it( 'should no longer respond to model events after calling close on it', function () {
                // With only variable holding a collection, only one 'select:*' event
                // should be logged.
                collection = new LoggedCollection( [m1, m2] );
                collection.close();
                collection = new LoggedCollection( [m1, m2] );

                m2.select();
                expect( logger.entries.length ).toBe( 1 );
            } );
        } );

    } );

    describe( 'Mixin is protected from modification', function () {
        var m1, m2, c1, c2;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            c1 = new Collection( [ m1 ] );
            c2 = new Collection( [ m2 ] );
        } );

        afterEach( function () {
            c1.close();
            c2.close();
        } );

        it( 'when overwriting the select() method on one collection, the select method of another collection stays intact', function () {
            var expected = {};

            c1.select = function () {};
            c2.select( m2 );

            expected[m2.cid] = m2;
            expect( c2.selected ).toEqual( expected );
        } );
    } );

} );
