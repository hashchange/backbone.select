describe( "multi-select collection: deselectAll", function () {
    var Model = Backbone.Model.extend( {
            initialize: function () {
                Backbone.Select.Me.applyTo( this );
            }
        } ),

        Collection = Backbone.Collection.extend( {
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

    describe( "when no models are selected, and deselecting all", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );

            collection.deselectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:none event", function () {
            // NB This is a change in the spec. Up to version 0.2.0, it _did_ trigger
            // a select:none event. But an event triggered by a no-op didn't make
            // sense and was inconsistent with the behaviour elsewhere.
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when no models are selected, and deselecting all (deselect() without model argument)", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );

            collection.deselect();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:none event", function () {
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );

    } );

    describe( "when no models are selected, and deselecting all, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );

            collection.deselectAll( {silent: true} );
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:none event", function () {
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when 1 model - the first one - is selected, and deselecting all", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            collection.deselectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when 1 model - the last one - is selected, and deselecting all", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m2.select();

            events = getEventSpies( collection );
            collection.deselectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m2] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when 1 model is selected, and deselecting all, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            collection.deselectAll( {silent: true} );
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:none event", function () {
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when 1 model is selected, and deselecting all (selectNone)", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            collection.selectNone();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when 1 model is selected, and deselecting all (deselect() without model argument)", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            collection.deselect();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );

    } );

    describe( "when all models are selected, and deselecting all", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.deselectAll();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1, m2] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );

        it( "should trigger a model's deselected event after the model status has been updated", function () {
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( m1 ).selected ).toEqual( false );
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( m2 ).selected ).toEqual( false );

            expect( eventStates.getEvent( m2, "deselected" ).stateOf( m1 ).selected ).toEqual( false );
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( m2 ).selected ).toEqual( false );
        } );

        it( "should trigger a model's deselected event after the collection's selected models have been updated", function () {
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( collection ).selected ).toEqual( {} );
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( collection ).selected ).toEqual( {} );
        } );

        it( "should trigger a model's deselected event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( collection ).selectedLength ).toEqual( 0 );
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( collection ).selectedLength ).toEqual( 0 );
        } );

        it( "should trigger the collection's select:none event after the model status has been updated", function () {
            expect( eventStates.getEvent( collection, "select:none" ).stateOf( m1 ).selected ).toEqual( false );
            expect( eventStates.getEvent( collection, "select:none" ).stateOf( m2 ).selected ).toEqual( false );
        } );

        it( "should trigger the collection's select:none event after the collection's selected models have been updated", function () {
            expect( eventStates.getEvent( collection, "select:none" ).stateOf( collection ).selected ).toEqual( {} );
        } );

        it( "should trigger the collection's select:none event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( collection, "select:none" ).stateOf( collection ).selectedLength ).toBe( 0 );
        } );
    } );

    describe( "when all models are selected, and deselecting all (selectNone)", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            collection.selectNone();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1, m2] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when all models are selected, and deselecting all (deselect() without model argument)", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            collection.deselect();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1, m2] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );

    } );

    describe( "when all models are selected, and deselecting all, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            collection.deselectAll( {silent: true} );
        } );

        afterEach( function () {
            collection.close();
        } );

        it( "should not trigger a select:none event", function () {
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 0", function () {
            expect( collection.selectedLength ).toBe( 0 );
        } );

        it( "should not have any models in the selected list", function () {
            var size = _.size( collection.selected );
            expect( size ).toBe( 0 );
        } );
    } );

    describe( "when all models are selected, and deselecting all with a custom option", function () {
        var m1, m2, collection;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            spyOn( m1, "trigger" ).and.callThrough();
            spyOn( m2, "trigger" ).and.callThrough();
            spyOn( collection, "trigger" ).and.callThrough();

            collection.deselectAll( { foo: "bar" } );
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
