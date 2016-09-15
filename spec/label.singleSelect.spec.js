describe( "Custom labels: Select.Me model in Select.One collection", function () {

    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var Collection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.One.applyTo( this, models );
        }
    } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( 'Using a custom "starred" label', function () {

        describe( "when selecting a model via the model's select", function () {
            var model, collection, events, eventStates;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                events = getEventSpies( [model, collection], ["selected", "starred"] );
                eventStates = getEventStateStore( [model, collection], "starred" );

                model.select( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the currently selected model in the "starred" property of the collection', function () {
                expect( collection.starred ).toBe( model );
            } );

            it( 'should leave the selected property of the collection undefined', function () {
                expect( collection.selected ).toBeUndefined();
            } );

            it( 'should create a "starred" property on the model and set it to true', function () {
                expect( model.starred ).toBe( true );
            } );

            it( 'should leave the selected property of the model undefined', function () {
                expect( model.selected ).toBeUndefined();
            } );

            it( 'should trigger a selected event, with label "starred" in the event options', function () {
                expect( events.get( model, "selected" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should trigger a selected:starred event', function () {
                expect( events.get( model, "selected:starred" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should not trigger more than those two selected events (including namespaced ones)', function () {
                expect( events.get( model, "selected:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselected event, including any of the namespaces", function () {
                expect( events.get( model, "reselected:*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a collection select:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "select:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a collection select:one:starred event', function () {
                expect( events.get( collection, "select:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                expect( events.get( collection, "select:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should trigger the model's selected event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "selected" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the model's selected:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "selected:starred" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the model's selected event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "selected" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should trigger the model's selected:starred event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "selected:starred" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should trigger the collection's select:one event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the collection's select:one:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one:starred" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the collection's select:one event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should trigger the collection's select:one:starred event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one:starred" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( "when selecting a model via the model's select, with options.silent enabled", function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                model.select( { label: "starred", silent: true } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the currently selected model in the "starred" property of the collection', function () {
                expect( collection.starred ).toBe( model );
            } );

            it( 'should leave the selected property of the collection undefined', function () {
                expect( collection.selected ).toBeUndefined();
            } );

            it( 'should create a "starred" property on the model and set it to true', function () {
                expect( model.starred ).toBe( true );
            } );

            it( 'should leave the selected property of the model undefined', function () {
                expect( model.selected ).toBeUndefined();
            } );

            it( 'should not trigger any selection-related events on the model', function () {
                expect( events.get( model, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the collection', function () {
                expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( "when selecting a model via the collection's select", function () {
            var model, collection, events, eventStates;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                events = getEventSpies( [model, collection], ["selected", "starred"] );
                eventStates = getEventStateStore( [model, collection], ["selected", "starred"] );
                spyOn( model, "select" ).and.callThrough();

                collection.select( model, { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the currently selected model in the "starred" property', function () {
                expect( collection.starred ).toBe( model );
            } );

            it( 'should tell the model to select itself, with the label option set to "starred"', function () {
                expect( model.select ).toHaveBeenCalledWith( jasmine.objectContaining( { label: "starred" } ) );
            } );

            it( "should not trigger a reselected event, including any of the namespaces", function () {
                expect( events.get( model, "reselected:*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a select:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "select:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a collection select:one:starred event', function () {
                expect( events.get( collection, "select:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                expect( events.get( collection, "select:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

            it( "should trigger the model's selected event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "selected" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the model's selected:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "selected:starred" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the model's selected event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "selected" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should trigger the model's selected:starred event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "selected:starred" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should trigger the collection's select:one event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the collection's select:one:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one:starred" ).stateOf( model ).starred ).toBe( true );
            } );

            it( "should trigger the collection's select:one event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one" ).stateOf( collection ).starred ).toBe( model );
            } );

            it( "should trigger the collection's select:one:starred event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "select:one:starred" ).stateOf( collection ).starred ).toBe( model );
            } );

        } );

        describe( "when selecting a model via the collection's select, with options.silent enabled", function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                events = getEventSpies( [model, collection], ["selected", "starred"] );
                spyOn( model, "select" ).and.callThrough();

                collection.select( model, { label: "starred", silent: true } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the currently selected model in the "starred" property', function () {
                expect( collection.starred ).toBe( model );
            } );

            it( 'should leave the selected property undefined', function () {
                expect( collection.selected ).toBeUndefined();
            } );

            it( 'should tell the model to select itself, with the label option set to "starred"', function () {
                expect( model.select ).toHaveBeenCalledWith( jasmine.objectContaining( { label: "starred" } ) );
            } );

            it( 'should not trigger any selection-related events on the model', function () {
                expect( events.get( model, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the collection', function () {
                expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( 'when selecting a model via the model\'s select, while it is already selected with the default label ("selected")', function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                model.select();

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                model.select( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the currently selected model in the "starred" property of the collection', function () {
                expect( collection.starred ).toBe( model );
            } );

            it( 'should leave the selected property of the collection set to the model', function () {
                expect( collection.selected ).toBe( model );
            } );

            it( 'should create a "starred" property on the model and set it to true', function () {
                expect( model.starred ).toBe( true );
            } );

            it( 'should leave the selected property of the model set to true', function () {
                expect( model.selected ).toBe( true );
            } );

            it( 'should trigger a selected event, with label "starred" in the event options', function () {
                expect( events.get( model, "selected" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should trigger a selected:starred event', function () {
                expect( events.get( model, "selected:starred" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should not trigger more than those two selected events (including namespaced ones)', function () {
                expect( events.get( model, "selected:*" ) ).toHaveCallCount( 2 );
            } );

            it( 'should trigger a collection select:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "select:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a collection select:one:starred event', function () {
                expect( events.get( collection, "select:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                expect( events.get( collection, "select:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselected event, including any of the namespaces", function () {
                expect( events.get( model, "reselected:*" ) ).not.toHaveBeenCalled();
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( 'when selecting a model via the model\'s select, while it is already selected with another custom label ("picked")', function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                model.select( { label: "picked" } );

                events = getEventSpies( [model, collection], ["selected", "picked", "starred"] );

                model.select( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the currently selected model in the "starred" property of the collection', function () {
                expect( collection.starred ).toBe( model );
            } );

            it( 'should leave the "picked" property of the collection set to the model', function () {
                expect( collection.picked ).toBe( model );
            } );

            it( 'should create a "starred" property on the model and set it to true', function () {
                expect( model.starred ).toBe( true );
            } );

            it( 'should leave the "picked" property of the model set to true', function () {
                expect( model.picked ).toBe( true );
            } );

            it( 'should trigger a selected event, with label "starred" in the event options', function () {
                expect( events.get( model, "selected" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should trigger a selected:starred event', function () {
                expect( events.get( model, "selected:starred" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should not trigger more than those two selected events (including namespaced ones)', function () {
                expect( events.get( model, "selected:*" ) ).toHaveCallCount( 2 );
            } );

            it( 'should trigger a collection select:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "select:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a collection select:one:starred event', function () {
                expect( events.get( collection, "select:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                expect( events.get( collection, "select:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselected event, including any of the namespaces", function () {
                expect( events.get( model, "reselected:*" ) ).not.toHaveBeenCalled();
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( "when selecting a model that is already selected", function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                model.select( { label: "starred" } );

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                collection.select( model, { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( "should not trigger a select:one event, including any of the namespaces", function () {
                expect( events.get( collection, "select:one:*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a reselected event, with label "starred" in the event options', function () {
                expect( events.get( model, "reselected" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should trigger a reselected:starred event', function () {
                expect( events.get( model, "reselected:starred" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should not trigger more than those two reselected events (including namespaced ones)', function () {
                expect( events.get( model, "reselected:*" ) ).toHaveCallCount( 2 );
            } );

            it( 'should trigger a reselect:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "reselect:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( "should trigger a reselect:one:starred event", function () {
                expect( events.get( collection, "reselect:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two reselect:one events (including namespaced ones)', function () {
                expect( events.get( collection, "reselect:one:*" ) ).toHaveCallCount( 2 );
            } );

        } );

        describe( "when selecting a model that is already selected, with options.silent enabled", function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                model.select( { label: "starred" } );

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                collection.select( model, { silent: true, label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should not trigger any selection-related events on the model', function () {
                expect( events.get( model, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the collection', function () {
                expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( "when a model is already selected and selecting a different model", function () {
            var m1, m2, collection, events;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                collection = new Collection( [m1, m2] );
                m1.select( { label: "starred" } );

                events = getEventSpies( [collection], ["selected", "starred"] );
                spyOn( m1, "deselect" ).and.callThrough();

                m2.select( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the newly selected model in the "starred" property of the collection', function () {
                expect( collection.starred ).toBe( m2 );
            } );

            it( 'should create a "starred" property on the newly selected model and set it to true', function () {
                expect( m2.starred ).toBe( true );
            } );

            it( 'should deselect the "starred" property of the first model', function () {
                expect( m1.starred ).toBe( false );
            } );

            it( 'should trigger a select:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "select:one" ) ).toHaveBeenCalledWith( m2, collection, { label: "starred" } );
            } );

            it( 'should trigger a select:one:starred event', function () {
                expect( events.get( collection, "select:one:starred" ) ).toHaveBeenCalledWith( m2, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                expect( events.get( collection, "select:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a deselect:one event for the first model, with label "starred" in the event options', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledWith( m1, collection, { label: "starred" } );
            } );

            it( 'should trigger a deselect:one:starred event for the first model, with label "starred" in the event options', function () {
                expect( events.get( collection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m1, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                expect( events.get( collection, "deselect:one:*" ) ).toHaveCallCount( 2 );
            } );

        } );

        describe( "when a model is already selected and selecting a different model, with options.silent enabled", function () {
            var m1, m2, collection, events;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                collection = new Collection( [m1, m2] );
                m1.select( { label: "starred" } );

                events = getEventSpies( [m1, m2, collection], ["selected", "starred"] );
                spyOn( m1, "deselect" ).and.callThrough();

                m2.select( { silent: true, label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should store the newly selected model in the "starred" property of the collection', function () {
                expect( collection.starred ).toBe( m2 );
            } );

            it( 'should create a "starred" property on the newly selected model and set it to true', function () {
                expect( m2.starred ).toBe( true );
            } );

            it( 'should deselect the "starred" property of the first model', function () {
                expect( m1.starred ).toBe( false );
            } );

            it( 'should not trigger any selection-related events on the first model', function () {
                expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the second model', function () {
                expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the collection', function () {
                expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( "when no model is selected and deselecting", function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                collection.deselect( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should not trigger any selection-related events on the model', function () {
                expect( events.get( model, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the collection', function () {
                expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( "when a model is selected and deselecting the model through the model's deselect", function () {
            var model, collection, events, eventStates;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select( { label: "starred" } );

                events = getEventSpies( [collection], ["selected", "starred"] );
                eventStates = getEventStateStore( [model, collection], ["selected", "starred"] );

                model.deselect( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should set the "starred" property of the collection to undefined', function () {
                expect( collection.starred ).toBeUndefined();
            } );

            it( 'should deselect the "starred" property of the deselected model', function () {
                expect( model.starred ).toBe( false );
            } );

            it( 'should trigger a deselect:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a deselect:one:starred event', function () {
                expect( events.get( collection, "deselect:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                expect( events.get( collection, "deselect:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should trigger the model's deselected event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the model's deselected event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected" ).stateOf( collection ).starred ).toBeUndefined();
            } );

            it( "should trigger the model's deselected:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected:starred" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the model's deselected event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected:starred" ).stateOf( collection ).starred ).toBeUndefined();
            } );

            it( "should trigger the collection's deselect:one event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the collection's deselect:one event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one" ).stateOf( collection ).starred ).toBeUndefined();
            } );

            it( "should trigger the collection's deselect:one:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one:starred" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the collection's deselect:one:starred event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one:starred" ).stateOf( collection ).starred ).toBeUndefined();
            } );

        } );

        describe( "when a model is selected and deselecting the model through the collection's deselect", function () {
            var model, collection, events, eventStates;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select( { label: "starred" } );

                events = getEventSpies( [collection], ["selected", "starred"] );
                eventStates = getEventStateStore( [model, collection], ["selected", "starred"] );

                collection.deselect( model, { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should set the "starred" property of the collection to undefined', function () {
                expect( collection.starred ).toBeUndefined();
            } );

            it( 'should deselect the "starred" property of the deselected model', function () {
                expect( model.starred ).toBe( false );
            } );

            it( 'should trigger a deselect:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a deselect:one:starred event', function () {
                expect( events.get( collection, "deselect:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                expect( events.get( collection, "deselect:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should trigger the model's deselected event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the model's deselected event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected" ).stateOf( collection ).starred ).toBeUndefined();
            } );

            it( "should trigger the model's deselected:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected:starred" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the model's deselected event after the collection status has been updated", function () {
                expect( eventStates.getEvent( model, "deselected:starred" ).stateOf( collection ).starred ).toBeUndefined();
            } );

            it( "should trigger the collection's deselect:one event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the collection's deselect:one event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one" ).stateOf( collection ).starred ).toBeUndefined();
            } );

            it( "should trigger the collection's deselect:one:starred event after the model status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one:starred" ).stateOf( model ).starred ).toBe( false );
            } );

            it( "should trigger the collection's deselect:one:starred event after the collection status has been updated", function () {
                expect( eventStates.getEvent( collection, "deselect:one:starred" ).stateOf( collection ).starred ).toBeUndefined();
            } );

        } );

        describe( "when a model is selected and deselecting the model, with options.silent enabled", function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );
                model.select( { label: "starred" } );

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                collection.deselect( undefined, { silent: true, label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should set the "starred" property of the collection to undefined', function () {
                expect( collection.starred ).toBeUndefined();
            } );

            it( 'should deselect the "starred" property of the deselected model', function () {
                expect( model.starred ).toBe( false );
            } );

            it( 'should not trigger any selection-related events on the model', function () {
                expect( events.get( model, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger any selection-related events on the collection', function () {
                expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( 'when deselecting a model via the model\'s deselect, while it is also selected with the default label ("selected")', function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                model.select();
                model.select( { label: "starred" } );

                events = getEventSpies( [model, collection], ["selected", "starred"] );

                model.deselect( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should set the "starred" property of the collection to undefined', function () {
                expect( collection.starred ).toBeUndefined();
            } );

            it( 'should leave the selected property of the collection set to the model', function () {
                expect( collection.selected ).toBe( model );
            } );

            it( 'should deselect the "starred" property of the deselected model', function () {
                expect( model.starred ).toBe( false );
            } );

            it( 'should leave the selected property of the model set to true', function () {
                expect( model.selected ).toBe( true );
            } );

            it( 'should trigger a deselected event, with label "starred" in the event options', function () {
                expect( events.get( model, "deselected" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should trigger a deselected:starred event', function () {
                expect( events.get( model, "deselected:starred" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should not trigger more than those two selected events (including namespaced ones)', function () {
                expect( events.get( model, "deselected:*" ) ).toHaveCallCount( 2 );
            } );

            it( 'should trigger a collection deselect:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a collection deselect:one:starred event', function () {
                expect( events.get( collection, "deselect:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                expect( events.get( collection, "deselect:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselected event, including any of the namespaces", function () {
                expect( events.get( model, "reselected:*" ) ).not.toHaveBeenCalled();
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( 'when deselecting a model via the model\'s deselect, while it is also selected with another custom label ("picked")', function () {
            var model, collection, events;

            beforeEach( function () {
                model = new Model();
                collection = new Collection( [model] );

                model.select( { label: "picked" } );
                model.select( { label: "starred" } );

                events = getEventSpies( [model, collection], ["selected", "picked", "starred"] );

                model.deselect( { label: "starred" } );
            } );

            afterEach( function () {
                collection.close();
            } );

            it( 'should set the "starred" property of the collection to undefined', function () {
                expect( collection.starred ).toBeUndefined();
            } );

            it( 'should leave the "picked" property of the collection set to the model', function () {
                expect( collection.picked ).toBe( model );
            } );

            it( 'should deselect the "starred" property of the deselected model', function () {
                expect( model.starred ).toBe( false );
            } );

            it( 'should leave the "picked" property of the model set to true', function () {
                expect( model.picked ).toBe( true );
            } );

            it( 'should trigger a deselected event, with label "starred" in the event options', function () {
                expect( events.get( model, "deselected" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should trigger a deselected:starred event', function () {
                expect( events.get( model, "deselected:starred" ) ).toHaveBeenCalledWith( model, { label: "starred" } );
            } );

            it( 'should not trigger more than those two deselected events (including namespaced ones)', function () {
                expect( events.get( model, "deselected:*" ) ).toHaveCallCount( 2 );
            } );

            it( 'should trigger a collection deselect:one event, with label "starred" in the event options', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should trigger a collection deselect:one:starred event', function () {
                expect( events.get( collection, "deselect:one:starred" ) ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
            } );

            it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                expect( events.get( collection, "deselect:one:*" ) ).toHaveCallCount( 2 );
            } );

            it( "should not trigger a reselected event, including any of the namespaces", function () {
                expect( events.get( model, "reselected:*" ) ).not.toHaveBeenCalled();
            } );

            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                expect( events.get( collection, "reselect:one:*" ) ).not.toHaveBeenCalled();
            } );

        } );

    } );

    describe( 'automatic invocation of onSelect, onDeselect, onReselect handlers', function () {
        var EventHandlingCollection, model, collection;

        beforeEach( function () {

            EventHandlingCollection = Collection.extend( {
                onSelect: function () {},
                onDeselect: function () {},
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

            spyOn( collection, "onSelect" ).and.callThrough();
            spyOn( collection, "onDeselect" ).and.callThrough();
            spyOn( collection, "onReselect" ).and.callThrough();

            spyOn( collection, "on_select" ).and.callThrough();
            spyOn( collection, "on_deselect" ).and.callThrough();

            spyOn( collection, "onAdd" ).and.callThrough();
            spyOn( collection, "onRemove" ).and.callThrough();
            spyOn( collection, "onReset" ).and.callThrough();
            spyOn( collection, "onAll" ).and.callThrough();
        } );

        afterEach( function () {
            collection.close();
        } );

        it( 'calls the onSelect handler when triggering a select:one event with a custom label', function () {
            collection.trigger( "select:one", model, collection, { label: "starred" } );
            expect( collection.onSelect ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
        } );

        it( 'calls the onDeselect handler when triggering a deselect:one event with a custom label', function () {
            collection.trigger( "deselect:one", model, collection, { label: "starred" } );
            expect( collection.onDeselect ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
        } );

        it( 'calls the onReselect handler when triggering a reselect:one event with a custom label', function () {
            collection.trigger( "reselect:one", model, collection, { label: "starred" } );
            expect( collection.onReselect ).toHaveBeenCalledWith( model, collection, { label: "starred" } );
        } );

        it( 'does not call the onSelect handler when triggering a select:one event with a namespace', function () {
            collection.trigger( "select:one:starred", model, collection, { label: "starred" } );
            expect( collection.onSelect ).not.toHaveBeenCalled();
        } );

        it( 'does not call the onDeselect handler when triggering a deselect:one event with a namespace', function () {
            collection.trigger( "deselect:one:starred", model, collection, { label: "starred" } );
            expect( collection.onDeselect ).not.toHaveBeenCalled();
        } );

        it( 'does not call the onReselect handler when triggering a reselect:one event with a namespace', function () {
            collection.trigger( "reselect:one:starred", model, collection, { label: "starred" } );
            expect( collection.onReselect ).not.toHaveBeenCalled();
        } );

    } );

} );
