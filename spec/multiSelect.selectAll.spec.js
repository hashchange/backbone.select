describe( "multi-select collection: selectAll", function () {
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

    describe( "when no models are selected, and selecting all", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.selectAll();
        } );

        it( "should trigger a select:all event", function () {
            expect( events["select:all"] ).toHaveBeenCalledOnce();
            expect( events["select:all"] ).toHaveBeenCalledWith( { selected: [m1, m2], deselected: [] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );

        it( 'should trigger a model\'s selected event after the model status has been updated', function () {
            expect( eventStates.getEvent( m1, "selected" ).stateOf( m1 ).selected ).toEqual( true );
        } );

        it( 'should trigger a model\'s selected event after the collection\'s selected models have been updated with that model', function () {
            // m2 doesn't necessarily have to be part of collection.selected at this
            // time. The point is that events are fired when model and collection
            // states are consistent. When m1 fires the 'selected' event, only m1 must
            // be part of the collection.
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selected[m1.cid] ).toBe( m1 );
        } );

        it( 'should trigger a model\'s selected event after the collection\'s selected length has been updated', function () {
            // collection.selectedLength could be 1 or 2 at this time. Again, all we
            // are asking for is consistency - see comment above.
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selectedLength ).toBeGreaterThan( 0 );
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selectedLength ).toEqual( _.size( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selected ) );
        } );

        it( 'should trigger the collection\'s select:all event after the model status has been updated', function () {
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( m2 ).selected ).toEqual( true );
        } );

        it( 'should trigger the collection\'s select:all event after the collection\'s selected models have been updated', function () {
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( collection ).selected[m1.cid] ).toBe( m1 );
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( collection ).selected[m2.cid] ).toBe( m2 );
        } );

        it( 'should trigger the collection\'s select:all event after the collection\'s selected length has been updated', function () {
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( collection ).selectedLength ).toBe( 2 );
        } );
    } );

    describe( "when no models are selected, and selecting all, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );

            collection.selectAll( {silent: true} );
        } );

        it( "should not trigger an 'all' selected event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );
    } );

    describe( "when 1 model - the first one - is selected, and selecting all", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.selectAll();
        } );

        it( "should trigger a select:all event", function () {
            expect( events["select:all"] ).toHaveBeenCalledOnce();
            expect( events["select:all"] ).toHaveBeenCalledWith( { selected: [m2], deselected: [] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should trigger a reselect:any event, with an array containing the previously selected model as a parameter", function () {
            expect( events["reselect:any"] ).toHaveBeenCalledOnce();
            expect( events["reselect:any"] ).toHaveBeenCalledWith( [m1], collection, { label: "selected" } );
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );

        it( 'should trigger a model\'s reselected event when the collection\'s selected length is consistent with its selected models', function () {
            // m2 doesn't necessarily have to be part of collection.selected at this
            // time. The point is that events are fired when model and collection
            // states are consistent. When m1 fires the 'reselected' event, only m1
            // must be part of the collection.
            expect( eventStates.getEvent( m1, "reselected" ).stateOf( collection ).selectedLength ).toBeGreaterThan( 0 );
            expect( eventStates.getEvent( m1, "reselected" ).stateOf( collection ).selectedLength ).toEqual( _.size( eventStates.getEvent( m1, "reselected" ).stateOf( collection ).selected ) );
        } );

        it( 'should trigger the collection\'s reselect:any event after the model status has been updated', function () {
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( m2 ).selected ).toEqual( true );
        } );

        it( 'should trigger the collection\'s reselect:any event after the collection\'s selected models have been updated', function () {
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( collection ).selected[m1.cid] ).toBe( m1 );
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( collection ).selected[m2.cid] ).toBe( m2 );
        } );

        it( 'should trigger the collection\'s reselect:any event after the collection\'s selected length has been updated', function () {
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( collection ).selectedLength ).toBe( 2 );
        } );
    } );

    describe( "when 1 model - the last one - is selected, and selecting all", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m2.select();

            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.selectAll();
        } );

        it( "should trigger a select:all event", function () {
            expect( events["select:all"] ).toHaveBeenCalledOnce();
            expect( events["select:all"] ).toHaveBeenCalledWith( { selected: [m1], deselected: [] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should trigger a reselect:any event, with an array containing the previously selected model as a parameter", function () {
            expect( events["reselect:any"] ).toHaveBeenCalledOnce();
            expect( events["reselect:any"] ).toHaveBeenCalledWith( [m2], collection, { label: "selected" } );
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );

        it( 'should trigger a model\'s reselected event when the collection\'s selected length is consistent with its selected models', function () {
            // m1 doesn't necessarily have to be part of collection.selected at this
            // time. The point is that events are fired when model and collection
            // states are consistent. When m2 fires the 'reselected' event, only m2
            // must be part of the collection.
            expect( eventStates.getEvent( m2, "reselected" ).stateOf( collection ).selectedLength ).toBeGreaterThan( 0 );
            expect( eventStates.getEvent( m2, "reselected" ).stateOf( collection ).selectedLength ).toEqual( _.size( eventStates.getEvent( m2, "reselected" ).stateOf( collection ).selected ) );
        } );

        it( 'should trigger the collection\'s reselect:any event after the model status has been updated', function () {
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( m2 ).selected ).toEqual( true );
        } );

        it( 'should trigger the collection\'s reselect:any event after the collection\'s selected models have been updated', function () {
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( collection ).selected[m1.cid] ).toBe( m1 );
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( collection ).selected[m2.cid] ).toBe( m2 );
        } );

        it( 'should trigger the collection\'s reselect:any event after the collection\'s selected length has been updated', function () {
            expect( eventStates.getEvent( collection, "reselect:any" ).stateOf( collection ).selectedLength ).toBe( 2 );
        } );
    } );

    describe( "when 1 model is selected, and selecting all, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            collection.selectAll( {silent: true} );
        } );

        it( "should not trigger an 'all' selected event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );
    } );

    describe( "when all models are selected, and selecting all", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            collection.selectAll();
        } );

        it( "should not trigger a select:all event", function () {
            // NB This is a change in the spec. Up to version 0.2.0, it _did_ trigger
            // a select:all event. But an event triggered by a no-op didn't make sense
            // and was inconsistent with the behaviour elsewhere.
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should trigger a reselect:any event, with an array containing all models as a parameter", function () {
            expect( events["reselect:any"] ).toHaveBeenCalledOnce();
            expect( events["reselect:any"] ).toHaveBeenCalledWith( [m1, m2], collection, { label: "selected" } );
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );
    } );

    describe( "when all models are selected, and selecting all, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            collection.selectAll( {silent: true} );
        } );

        it( "should not trigger a select:all event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).not.toBeUndefined();
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).not.toBeUndefined();
        } );
    } );

    describe( 'custom options', function () {

        describe( "when 1 model is selected, and selecting all with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.selectAll( {foo: "bar"} );
            } );

            it( "should trigger a reselected event on the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "reselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a selected event on the second model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m2.trigger ).toHaveBeenCalledWith( "selected", m2, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:all event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:all", { selected: [m2], deselected: [] }, collection, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a reselect:any event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "reselect:any", [m1], collection, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when no models are selected, and selecting all with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.selectAll( {foo: "bar"} );
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

    } );

} );
