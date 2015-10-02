describe( "multi-select collection: invertSelection", function () {
    var expected,

        Model = Backbone.Model.extend( {
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

    beforeEach( function () {
        expected = {};
    } );

    describe( "when no models are selected, and inverting the selection", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.invertSelection();
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
            expect( collection.selected[m1.cid] ).toBe( m1 );
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).toBe( m2 );
        } );

        it( "should trigger a model's selected event after the model status has been updated for all models", function () {
            expect( eventStates.getEvent( m1, "selected" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( m1, "selected" ).stateOf( m2 ).selected ).toEqual( true );

            expect( eventStates.getEvent( m2, "selected" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( m2, "selected" ).stateOf( m2 ).selected ).toEqual( true );
        } );

        it( "should trigger a model's selected event after the collection's selected models have been updated", function () {
            expected[m1.cid] = m1;
            expected[m2.cid] = m2;
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selected ).toEqual( expected );
            expect( eventStates.getEvent( m2, "selected" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger a model's selected event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selectedLength ).toEqual( 2 );
            expect( eventStates.getEvent( m2, "selected" ).stateOf( collection ).selectedLength ).toEqual( 2 );
        } );

        it( "should trigger the collection's select:all event after the model status has been updated", function () {
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( m2 ).selected ).toEqual( true );
        } );

        it( "should trigger the collection's select:all event after the collection's selected models have been updated", function () {
            expected[m1.cid] = m1;
            expected[m2.cid] = m2;
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger the collection's select:all event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( collection, "select:all" ).stateOf( collection ).selectedLength ).toBe( 2 );
        } );
    } );

    describe( "when no models are selected, and inverting the selection, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            events = getEventSpies( collection );

            collection.invertSelection( {silent: true} );
        } );

        it( "should not trigger an 'all' selected event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 2", function () {
            expect( collection.selectedLength ).toBe( 2 );
        } );

        it( "should have the first selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).toBe( m1 );
        } );

        it( "should have the second selected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).toBe( m2 );
        } );
    } );

    describe( "when 1 model - the first one - is selected, and inverting the selection", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.invertSelection();
        } );

        it( "should trigger a select:some event", function () {
            expect( events["select:some"] ).toHaveBeenCalledOnce();
            expect( events["select:some"] ).toHaveBeenCalledWith( { selected: [m2], deselected: [m1] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:all event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a select:none event", function () {
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 1", function () {
            expect( collection.selectedLength ).toBe( 1 );
        } );

        it( "should not have the first model in the selected list", function () {
            expect( collection.selected[m1.cid] ).toBeUndefined();
        } );

        it( "should have the second model in the selected list", function () {
            expect( collection.selected[m2.cid] ).toBe( m2 );
        } );

        it( "should trigger the first model's deselected event after the selected status of the models is updated", function () {
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( m1 ).selected ).toBe( false );
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( m2 ).selected ).toBe( true );
        } );

        it( "should trigger the first model's deselected event after the collection's selected models have been updated", function () {
            expected[m2.cid] = m2;
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger the first model's deselected event when the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( m1, "deselected" ).stateOf( collection ).selectedLength ).toEqual( 1 );
        } );

        it( "should trigger the second model's selected event after the selected status of the models is updated", function () {
            expect( eventStates.getEvent( m2, "selected" ).stateOf( m1 ).selected ).toBe( false );
            expect( eventStates.getEvent( m2, "selected" ).stateOf( m2 ).selected ).toBe( true );
        } );

        it( "should trigger the second model's selected event after the collection's selected models have been updated", function () {
            expected[m2.cid] = m2;
            expect( eventStates.getEvent( m2, "selected" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger the second model's selected event when the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( m2, "selected" ).stateOf( collection ).selectedLength ).toEqual( 1 );
        } );

        it( "should trigger the collection's select:some event after the model status has been updated", function () {
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( m1 ).selected ).toEqual( false );
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( m2 ).selected ).toEqual( true );
        } );

        it( "should trigger the collection's select:some event after the collection's selected models have been updated", function () {
            expected[m2.cid] = m2;
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger the collection's select:some event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( collection ).selectedLength ).toBe( 1 );
        } );

    } );

    describe( "when 1 model - the last one - is selected, and inverting the selection", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m2.select();

            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.invertSelection();
        } );

        it( "should trigger a select:some event", function () {
            expect( events["select:some"] ).toHaveBeenCalledOnce();
            expect( events["select:some"] ).toHaveBeenCalledWith( { selected: [m1], deselected: [m2] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:all event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a select:none event", function () {
            expect( events["select:none:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 1", function () {
            expect( collection.selectedLength ).toBe( 1 );
        } );

        it( "should have the first model in the selected list", function () {
            expect( collection.selected[m1.cid] ).toBe( m1 );
        } );

        it( "should not have the second model in the selected list", function () {
            expect( collection.selected[m2.cid] ).toBeUndefined();
        } );

        it( "should trigger the first model's selected event after the selected status of the models is updated", function () {
            expect( eventStates.getEvent( m1, "selected" ).stateOf( m1 ).selected ).toBe( true );
            expect( eventStates.getEvent( m1, "selected" ).stateOf( m2 ).selected ).toBe( false );
        } );

        it( "should trigger the first model's selected event after the collection's selected models have been updated", function () {
            expected[m1.cid] = m1;
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger the first model's selected event when the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( m1, "selected" ).stateOf( collection ).selectedLength ).toEqual( 1 );
        } );

        it( "should trigger the second model's deselected event after the selected status of the models is updated", function () {
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( m1 ).selected ).toBe( true );
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( m2 ).selected ).toBe( false );
        } );

        it( "should trigger the second model's deselected event after the collection's selected models have been updated", function () {
            expected[m1.cid] = m1;
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( collection ).selected ).toEqual( expected );
        } );

        it( "should trigger the second model's deselected event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( m2, "deselected" ).stateOf( collection ).selectedLength ).toEqual( 1 );
        } );

        it( "should trigger the collection's select:some event after the model status has been updated", function () {
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( m1 ).selected ).toEqual( true );
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( m2 ).selected ).toEqual( false );
        } );

        it( "should trigger the collection's select:some event after the collection's selected models have been updated", function () {
            expected[m1.cid] = m1;
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( collection ).selected ).toEqual( expected )
        } );

        it( "should trigger the collection's select:some event after the collection's selected length has been updated", function () {
            expect( eventStates.getEvent( collection, "select:some" ).stateOf( collection ).selectedLength ).toBe( 1 );
        } );

    } );

    describe( "when 1 model is selected, and inverting the selection, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();

            events = getEventSpies( collection );
            collection.invertSelection( {silent: true} );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a reselect:any event", function () {
            expect( events["reselect:any:*"] ).not.toHaveBeenCalled();
        } );

        it( "should have a selected count of 1", function () {
            expect( collection.selectedLength ).toBe( 1 );
        } );

        it( "should have the previously unselected model in the selected list", function () {
            expect( collection.selected[m2.cid] ).toBe( m2 );
        } );

        it( "should not have the previously selected model in the selected list", function () {
            expect( collection.selected[m1.cid] ).toBeUndefined();
        } );
    } );

    describe( "when all models are selected, and inverting the selection", function () {
        var m1, m2, collection, events, eventStates;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            eventStates = getEventStateStore( [m1, m2, collection] );

            collection.invertSelection();
        } );

        it( "should trigger a select:none event", function () {
            expect( events["select:none"] ).toHaveBeenCalledOnce();
            expect( events["select:none"] ).toHaveBeenCalledWith( { selected: [], deselected: [m1, m2] }, collection, { label: "selected" } );
        } );

        it( "should not trigger a select:some event", function () {
            expect( events["select:some:*"] ).not.toHaveBeenCalled();
        } );

        it( "should not trigger a select:all event", function () {
            expect( events["select:all:*"] ).not.toHaveBeenCalled();
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

    describe( "when all models are selected, and inverting the selection, with options.silent enabled", function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();

            collection = new Collection( [m1, m2] );
            m1.select();
            m2.select();

            events = getEventSpies( collection );
            collection.invertSelection( {silent: true} );
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

    describe( 'custom options', function () {

        describe( "when 1 model is selected, and inverting the selection with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();

                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.invertSelection( {foo: "bar"} );
            } );

            it( "should trigger a deselected event on the first model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m1.trigger ).toHaveBeenCalledWith( "deselected", m1, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a selected event on the second model and pass the custom option along in the options object (the last parameter)", function () {
                expect( m2.trigger ).toHaveBeenCalledWith( "selected", m2, { foo: "bar", label: "selected" } );
            } );

            it( "should trigger a select:some event and pass the custom option along in the options object (the last parameter)", function () {
                expect( collection.trigger ).toHaveBeenCalledWith( "select:some", { selected: [m2], deselected: [m1] }, collection, { foo: "bar", label: "selected" } );
            } );

        } );

        describe( "when no models are selected, and inverting the selection with a custom option", function () {
            var m1, m2, collection;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                spyOn( m1, "trigger" ).and.callThrough();
                spyOn( m2, "trigger" ).and.callThrough();
                spyOn( collection, "trigger" ).and.callThrough();

                collection.invertSelection( {foo: "bar"} );
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

        describe( "when all models are selected, and inverting the selection with a custom option", function () {
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

                collection.invertSelection( { foo: "bar" } );
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
