describe( "multi-select collection: toggleSelectAll", function () {
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

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( "when no models are selected, and toggling", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            spyOn( collection, "trigger" ).and.callThrough();

            collection.toggleSelectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:all event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m1, m2], deselected: [] }, collection, { label: "selected" } );
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have 2 models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 2 );
        } );
    } );

    describe( "when no models are selected, and toggling with options.silent enabled", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            spyOn( collection, "trigger" ).and.callThrough();

            collection.toggleSelectAll( {silent: true} );
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:all event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:all" );
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have 2 models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 2 );
        } );
    } );

    describe( "when some models are selected, and toggling", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            spyOn( collection, "trigger" ).and.callThrough();

            collection.toggleSelectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:all event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m2], deselected: [] }, collection, { label: "selected" } );
        } );

        it( "should trigger a reselect:any event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { label: "selected" } );
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have 2 models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 2 );
        } );
    } );

    describe( "when all models are selected, and toggling", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            spyOn( collection, "trigger" ).and.callThrough();

            collection.toggleSelectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( collection.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [m1, m2] }, collection, { label: "selected" } );
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should have 0 models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when all models are selected, and toggling with options.silent enabled", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            spyOn( collection, "trigger" ).and.callThrough();

            collection.toggleSelectAll( {silent: true} );
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:none event", function () {
            expect( collection.trigger ).not.toHaveBeenCalledWithInitial( "select:none" );
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should have 0 models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( 'custom options', function () {

        describe( "when no models are selected, and toggling with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.toggleSelectAll( {foo: "bar"} );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( "should trigger a selected event on the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "selected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a selected event on the second model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m2.trigger ).toHaveBeenCalledWith( "selected", m2, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:all event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m1, m2], deselected: [] }, collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when all models are selected, and toggling with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                collection.selectAll();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.toggleSelectAll( {foo: "bar"} );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( "should trigger a deselected event on the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a deselected event on the second model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m2.trigger ).toHaveBeenCalledWith( "deselected", m2, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:none event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:none", { selected: [], deselected: [m1, m2] }, collection, { foo: "bar", label: "selected" } );
            } );
        } );

    } );

} );
