describe( "multi-select collection: general", function () {
    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var Collection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.Many.applyTo( this, models );
        }
    } );

    describe( 'A Select.Many collection instance should identify itself', function () {
        var collection;

        beforeEach( function () {
            collection = new Collection();
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

                // Pseudo event handlers modeled on internal events `_selected`,
                // `_deselected`; should not be invoked automatically
                on_select: function () {},
                on_deselect: function () {},

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

            spyOn( collection, "on_select" ).and.callThrough();
            spyOn( collection, "on_deselect" ).and.callThrough();

            spyOn( collection, "onAdd" ).and.callThrough();
            spyOn( collection, "onRemove" ).and.callThrough();
            spyOn( collection, "onReset" ).and.callThrough();
            spyOn( collection, "onAll" ).and.callThrough();
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

        it( 'does not call an event handler accidentally named after the internal _selected event', function () {
            model.trigger( "_selected", model );
            expect( collection.on_select ).not.toHaveBeenCalled();
        } );

        it( 'does not call an event handler accidentally named after the internal _deselected event', function () {
            model.trigger( "_deselected", model );
            expect( collection.on_deselect ).not.toHaveBeenCalled();
        } );

        it( 'does not automatically call an event handler named after a standard Backbone event (e.g. onAdd)', function () {
            collection.trigger( "add", model );
            collection.trigger( "remove", model );
            collection.trigger( "reset" );
            collection.trigger( "all", model );
            expect( collection.onAdd ).not.toHaveBeenCalled();
            expect( collection.onRemove ).not.toHaveBeenCalled();
            expect( collection.onReset ).not.toHaveBeenCalled();
            expect( collection.onAll ).not.toHaveBeenCalled();
        } );
    } );

    describe( 'Model-sharing status flag', function () {

        describe( 'when model sharing is disabled', function () {
            var collection;

            it( 'with no models being passed in during construction, the _modelSharingEnabled property is not set to true', function () {
                // Ie, the property must not exist, or be false.
                collection = new Collection();
                expect( collection._modelSharingEnabled ).not.toBe( true );
            } );

            it( 'with models being passed in during construction, the _modelSharingEnabled property is not set to true', function () {
                // Ie, the property must not exist, or be false.
                collection = new Collection( [new Model()] );
                expect( collection._modelSharingEnabled ).not.toBe( true );
            } );
        } );

        describe( 'when model sharing is enabled', function () {
            var SharingCollection, collection;

            beforeEach( function () {
                SharingCollection = Backbone.Collection.extend( {
                    initialize: function ( models ) {
                        Backbone.Select.Many.applyTo( this, models, { enableModelSharing: true } );
                    }
                } );
            } );

            it( 'with no models being passed in during construction, the _modelSharingEnabled property is true', function () {
                collection = new SharingCollection();
                expect( collection._modelSharingEnabled ).toBe( true );
            } );

            it( 'with models being passed in during construction, the _modelSharingEnabled property is true', function () {
                collection = new SharingCollection( [new Model()] );
                expect( collection._modelSharingEnabled ).toBe( true );
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

                var model, CollectionWithCustomSelectFoo, CollectionWithCustomSelectBar;

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

                it( 'returns the result of the modified select method', function () {
                    var collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    expect( collectionFoo.select( "arg1", "arg2" ) ).toEqual( "foo:arg1:arg2" );
                } );

                // Now checking that the modified select methods are kept around independently, without e.g. the last
                // modification overwriting the others.

                it( 'returns the result of a another select method, which has been modified in different way, when that collection is instantiated after the original one', function () {
                    //noinspection JSUnusedLocalSymbols
                    var collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    var collectionBar = new CollectionWithCustomSelectBar( [model] );
                    expect( collectionBar.select( "arg1", "arg2" ) ).toEqual( "bar:arg1:arg2" );
                } );

                it( 'returns the result of a another select method, which has been modified in different way, when that collection is instantiated before the original one', function () {
                    var collectionBar = new CollectionWithCustomSelectBar( [model] );
                    //noinspection JSUnusedLocalSymbols
                    var collectionFoo = new CollectionWithCustomSelectFoo( [model] );
                    expect( collectionBar.select( "arg1", "arg2" ) ).toEqual( "bar:arg1:arg2" );
                } );
            } );

        } );

    } );

    describe( 'Checking for memory leaks', function () {

        describe( 'when a collection is replaced by another one and is not referenced by a variable any more, with model sharing disabled', function () {
            var logger, LoggedCollection, m1, m2, collection;

            beforeEach( function () {
                logger = new Logger();

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
            } );

            it( 'should no longer respond to model events', function () {
                // With only variable holding a collection, only one 'select:*' event
                // should be logged.

                //noinspection JSUnusedAssignment
                collection = new LoggedCollection( [m1, m2] );
                collection = new LoggedCollection( [m1, m2] );

                m2.select();
                expect( logger.entries.length ).toBe( 1 );
            } );
        } );

        describe( 'when a collection is replaced by another one and is not referenced by a variable any more, with model sharing enabled', function () {
            var logger, Collection, LoggedCollection, m1, m2, collection;

            beforeEach( function () {
                logger = new Logger();

                Collection = Backbone.Collection.extend( {
                    model: Model,

                    initialize: function ( models ) {
                        Backbone.Select.Many.applyTo( this, models, { enableModelSharing: true } );
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

        it( 'when overwriting the select() method on one collection, the select method of another collection stays intact', function () {
            var expected = {};

            c1.select = function () {};
            c2.select( m2 );

            expected[m2.cid] = m2;
            expect( c2.selected ).toEqual( expected );
        } );
    } );

} );
