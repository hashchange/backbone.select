describe( 'Custom labels: Select.Me model in Select.Many collection', function () {

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

    describe( 'Using a custom "starred" label, in a collection where one model is already selected with the default label and another with a different custom label ("picked")', function () {

        describe( 'select()', function () {
            var m1, m2, collection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();
                m2.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the model's select", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    m2.select( { label: "starred" } );
                } );

                it( 'should star the second model', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 2", function () {
                    expect( collection.starredLength ).toBe( 2 );
                } );

                it( "should have both models in the starred list", function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:all event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:all" ) ).toHaveBeenCalledWith( {
                        selected: [m2],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:all:starred event', function () {
                    expect( events.get( collection, "select:all:starred" ) ).toHaveBeenCalledWith( {
                        selected: [m2],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:all events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:all:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                    expect( events.get( collection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the model's select, with options.silent enabled", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    m2.select( { label: "starred", silent: true } );
                } );

                it( 'should star the second model', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 2", function () {
                    expect( collection.starredLength ).toBe( 2 );
                } );

                it( "should have both models in the starred list", function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the collection's select", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.select( m2, { label: "starred" } );
                } );

                it( 'should star the second model', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 2", function () {
                    expect( collection.starredLength ).toBe( 2 );
                } );

                it( "should have both models in the starred list", function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );


                it( 'should trigger a select:all event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:all" ) ).toHaveBeenCalledWith( {
                        selected: [m2],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:all:starred event', function () {
                    expect( events.get( collection, "select:all:starred" ) ).toHaveBeenCalledWith( {
                        selected: [m2],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:all events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:all:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                    expect( events.get( collection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the collection's select, with options.silent enabled", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.select( m2, { label: "starred", silent: true } );
                } );

                it( 'should star the second model', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 2", function () {
                    expect( collection.starredLength ).toBe( 2 );
                } );

                it( "should have both models in the starred list", function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

        } );

        describe( 'deselect()', function () {
            var m1, m2, collection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                collection = new Collection( [m1, m2] );
                m1.select();
                m2.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( "when all of 2 models are selected and deselecting the second one via the model's deselect", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    m2.deselect( { label: "starred" } );
                } );

                it( 'should unstar the second model', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 1", function () {
                    expect( collection.starredLength ).toBe( 1 );
                } );

                it( "should have the first model in the starred list, but not the second", function () {
                    expected[m1.cid] = m1;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:some event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                        selected: [],
                        deselected: [m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:some:starred event', function () {
                    expect( events.get( collection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                        selected: [],
                        deselected: [m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:some events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:some:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                    expect( events.get( collection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( "when all of 2 models are selected and deselecting the second one via the model's deselect, with options.silent enabled", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    m2.deselect( { label: "starred", silent: true } );
                } );

                it( 'should unstar the second model', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 1", function () {
                    expect( collection.starredLength ).toBe( 1 );
                } );

                it( "should have the first model in the starred list, but not the second", function () {
                    expected[m1.cid] = m1;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( "when all of 2 models are selected and deselecting the second one via the collection's deselect", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.deselect( m2, { label: "starred" } );
                } );

                it( 'should unstar the second model', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 1", function () {
                    expect( collection.starredLength ).toBe( 1 );
                } );

                it( "should have the first model in the starred list, but not the second", function () {
                    expected[m1.cid] = m1;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:some event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                        selected: [],
                        deselected: [m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:some:starred event', function () {
                    expect( events.get( collection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                        selected: [],
                        deselected: [m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:some events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:some:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                    expect( events.get( collection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( "when all of 2 models are selected and deselecting the second one via the collection's deselect, with options.silent enabled", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.deselect( m2, { label: "starred", silent: true } );
                } );

                it( 'should unstar the second model', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBe( true );
                } );

                it( "should have a starred count of 1", function () {
                    expect( collection.starredLength ).toBe( 1 );
                } );

                it( "should have the first model in the starred list, but not the second", function () {
                    expected[m1.cid] = m1;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the second model", function () {
                    expected[m2.cid] = m2;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

        } );

        describe( 'selectAll()', function () {
            var m1, m2, m3, collection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                m3 = new Model();

                collection = new Collection( [m1, m2, m3] );
                m1.select();
                m3.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'when 1 out of 3 models in a collection is already selected, and selecting all', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.selectAll( { label: "starred" } );
                } );

                it( 'should star the second model', function () {
                    expect( m2.starred ).toBe( true );
                } );

                it( 'should star the third model', function () {
                    expect( m3.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBeFalsy();
                } );

                it( 'should not change the selected, picked status of the third model', function () {
                    expect( m3.selected ).toBeFalsy();
                    expect( m3.picked ).toBe( true );
                } );

                it( "should have a starred count of 3", function () {
                    expect( collection.starredLength ).toBe( 3 );
                } );

                it( "should have all models in the starred list", function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expected[m3.cid] = m3;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the third model", function () {
                    expected[m3.cid] = m3;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:all event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:all" ) ).toHaveBeenCalledWith( {
                        selected: [m2, m3],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:all:starred event', function () {
                    expect( events.get( collection, "select:all:starred" ) ).toHaveBeenCalledWith( {
                        selected: [m2, m3],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:all events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:all:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a select:some event, including any of the namespaces", function () {
                    expect( events.get( collection, "select:some:*" ) ).not.toHaveBeenCalled();
                } );


                it( 'should trigger a reselect:any event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "reselect:any" ) ).toHaveBeenCalledWith( [m1], collection, { label: "starred" } );
                } );

                it( 'should trigger a reselect:any:starred event', function () {
                    expect( events.get( collection, "reselect:any:starred" ) ).toHaveBeenCalledWith( [m1], collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two reselect:any events (including namespaced ones)', function () {
                    expect( events.get( collection, "reselect:any:*" ) ).toHaveCallCount( 2 );
                } );

            } );

            describe( 'when 1 out of 3 models in a collection is already selected, and selecting all, with options.silent enabled', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.selectAll( { label: "starred", silent: true } );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

        } );

        describe( 'deselectAll()', function () {
            var m1, m2, m3, collection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                m3 = new Model();

                collection = new Collection( [m1, m2, m3] );
                m1.select();
                m3.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'when 2 out of 3 models in a collection are already selected, and deselecting all', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.deselectAll( { label: "starred" } );
                } );

                it( 'should unstar the first model', function () {
                    expect( m1.starred ).toBe( false );
                } );

                it( 'should unstar the second model', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'should not change the selected, picked status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBeFalsy();
                } );

                it( 'should not change the selected, picked, starred status of the third model', function () {
                    expect( m3.selected ).toBeFalsy();
                    expect( m3.picked ).toBe( true );
                    expect( m3.starred ).toBeFalsy();
                } );

                it( "should have a starred count of 0", function () {
                    expect( collection.starredLength ).toBe( 0 );
                } );

                it( "should not have any models in the starred list", function () {
                    expect( collection.starred ).toEqual( {} );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the third model", function () {
                    expected[m3.cid] = m3;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:none event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:none" ) ).toHaveBeenCalledWith( {
                        selected: [],
                        deselected: [m1, m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:none:starred event', function () {
                    expect( events.get( collection, "select:none:starred" ) ).toHaveBeenCalledWith( {
                        selected: [],
                        deselected: [m1, m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:none events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:none:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a select:some event, including any of the namespaces", function () {
                    expect( events.get( collection, "select:some:*" ) ).not.toHaveBeenCalled();
                } );

                it( "should not trigger a select:all event, including any of the namespaces", function () {
                    expect( events.get( collection, "select:all:*" ) ).not.toHaveBeenCalled();
                } );

                it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                    expect( events.get( collection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( 'when 2 out of 3 models in a collection are already selected, and deselecting all, with options.silent enabled', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.deselectAll( { label: "starred", silent: true } );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

        } );

        describe( 'toggleSelectAll()', function () {
            var m1, m2, m3, collection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                m3 = new Model();

                collection = new Collection( [m1, m2, m3] );
                m1.select();
                m3.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'when 2 out of 3 models in a collection are already selected, and selecting all with toggleSelectAll()', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.toggleSelectAll( { label: "starred" } );
                } );

                it( 'should star the third model', function () {
                    expect( m3.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                    expect( m1.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked, starred status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBeFalsy();
                    expect( m2.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the third model', function () {
                    expect( m3.selected ).toBeFalsy();
                    expect( m3.picked ).toBe( true );
                } );

                it( "should have a starred count of 3", function () {
                    expect( collection.starredLength ).toBe( 3 );
                } );

                it( "should have all models in the starred list", function () {
                    expected[m1.cid] = m1;
                    expected[m2.cid] = m2;
                    expected[m3.cid] = m3;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the third model", function () {
                    expected[m3.cid] = m3;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:all event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:all" ) ).toHaveBeenCalledWith( {
                        selected: [m3],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:all:starred event', function () {
                    expect( events.get( collection, "select:all:starred" ) ).toHaveBeenCalledWith( {
                        selected: [m3],
                        deselected: []
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:all events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:all:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a select:some event, including any of the namespaces", function () {
                    expect( events.get( collection, "select:some:*" ) ).not.toHaveBeenCalled();
                } );


                it( 'should trigger a reselect:any event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "reselect:any" ) ).toHaveBeenCalledWith( [m1, m2], collection, { label: "starred" } );
                } );

                it( 'should trigger a reselect:any:starred event', function () {
                    expect( events.get( collection, "reselect:any:starred" ) ).toHaveBeenCalledWith( [m1, m2], collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two reselect:any events (including namespaced ones)', function () {
                    expect( events.get( collection, "reselect:any:*" ) ).toHaveCallCount( 2 );
                } );

            } );

            describe( 'when 2 out of 3 models in a collection are already selected, and selecting all with toggleSelectAll(), with options.silent enabled', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.toggleSelectAll( { label: "starred", silent: true } );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

        } );

        describe( 'invertSelection()', function () {
            var m1, m2, m3, collection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();
                m3 = new Model();

                collection = new Collection( [m1, m2, m3] );
                m1.select();
                m3.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                collection.close();
            } );

            describe( 'when 2 out of 3 models in a collection are already selected, and inverting the selection', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.invertSelection( { label: "starred" } );
                } );

                it( 'should unstar the first model', function () {
                    expect( m1.starred ).toBe( false );
                } );

                it( 'should unstar the second model', function () {
                    expect( m2.starred ).toBe( false );
                } );

                it( 'should star the third model', function () {
                    expect( m3.starred ).toBe( true );
                } );

                it( 'should not change the selected, picked status of the first model', function () {
                    expect( m1.selected ).toBe( true );
                    expect( m1.picked ).toBeFalsy();
                } );

                it( 'should not change the selected, picked status of the second model', function () {
                    expect( m2.selected ).toBeFalsy();
                    expect( m2.picked ).toBeFalsy();
                } );

                it( 'should not change the selected, picked status of the third model', function () {
                    expect( m3.selected ).toBeFalsy();
                    expect( m3.picked ).toBe( true );
                } );

                it( "should have a starred count of 1", function () {
                    expect( collection.starredLength ).toBe( 1 );
                } );

                it( "should have the third model in the starred list", function () {
                    expected[m3.cid] = m3;
                    expect( collection.starred ).toEqual( expected );
                } );

                it( "should have an unchanged selected count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged selected list, containing the first model", function () {
                    expected[m1.cid] = m1;
                    expect( collection.selected ).toEqual( expected );
                } );

                it( "should have an unchanged picked count of 1", function () {
                    expect( collection.selectedLength ).toBe( 1 );
                } );

                it( "should have an unchanged picked list, containing the third model", function () {
                    expected[m3.cid] = m3;
                    expect( collection.picked ).toEqual( expected );
                } );

                it( 'should trigger a select:some event, with label "starred" in the event options', function () {
                    expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                        selected: [m3],
                        deselected: [m1, m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should trigger a select:some:starred event', function () {
                    expect( events.get( collection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                        selected: [m3],
                        deselected: [m1, m2]
                    }, collection, { label: "starred" } );
                } );

                it( 'should not trigger more than those two select:some events (including namespaced ones)', function () {
                    expect( events.get( collection, "select:some:*" ) ).toHaveCallCount( 2 );
                } );

                it( "should not trigger a select:all event, including any of the namespaces", function () {
                    expect( events.get( collection, "select:all:*" ) ).not.toHaveBeenCalled();
                } );

                it( "should not trigger a select:none event, including any of the namespaces", function () {
                    expect( events.get( collection, "select:none:*" ) ).not.toHaveBeenCalled();
                } );

                it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                    expect( events.get( collection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                } );

            } );

            describe( 'when 2 out of 3 models in a collection are already selected, and inverting the selection, with options.silent enabled', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m2.select( { label: "starred" } );

                    events = getEventSpies( [collection], ["selected", "picked", "starred"] );

                    collection.invertSelection( { label: "starred", silent: true } );
                } );

                it( 'should not trigger any selection-related events', function () {
                    expect( events.get( collection, "*" ) ).not.toHaveBeenCalled();
                } );

            } );

        } );

    } );

    describe( 'A property for the custom label exists, and holds a hash', function () {
        var model, collection, expected;

        describe( 'when the label has been used on a model contained in the collection', function () {

            // See also the corresponding tests in the defaultLabel suite

            beforeEach( function () {
                expected = {};
                model = new Model();
            } );

            afterEach( function () {
                if ( collection ) collection.close();
            } );

            it( 'for a selection', function () {
                collection = new Collection( [model] );
                model.select( { label: "starred" } );

                expected[model.cid] = model;
                expect( collection.starred ).toEqual( expected );
            } );

            it( 'for a deselection, even if that deselection is a no-op', function () {
                collection = new Collection( [model] );
                model.deselect( { label: "starred" } );
                expect( collection.starred ).toEqual( {} );
            } );

            it( 'for a deselection, even if that deselection is a no-op and happened before the model was added to the collection', function () {
                model.deselect( { label: "starred" } );
                collection = new Collection( undefined );
                collection.add( [model] );

                expect( collection.starred ).toEqual( {} );
            } );

            it( 'for a deselection, even if that deselection is a no-op and happened before the model was passed in when creating the collection', function () {
                model.deselect( { label: "starred" } );
                collection = new Collection( [model] );

                expect( collection.starred ).toEqual( {} );
            } );

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

        afterEach( function () {
            collection.close();
        } );

        it( 'calls the onSelectNone handler when triggering a select:none event with a custom label', function () {
            collection.trigger( "select:none", {
                selected: [],
                deselected: [model]
            }, collection, { label: "starred" } );
            expect( collection.onSelectNone ).toHaveBeenCalledWith( {
                selected: [],
                deselected: [model]
            }, collection, { label: "starred" } );
        } );

        it( 'calls the onSelectSome handler when triggering a select:some event with a custom label', function () {
            collection.trigger( "select:some", {
                selected: [model],
                deselected: []
            }, collection, { label: "starred" } );
            expect( collection.onSelectSome ).toHaveBeenCalledWith( {
                selected: [model],
                deselected: []
            }, collection, { label: "starred" } );
        } );

        it( 'calls the onSelectAll handler when triggering a select:all event with a custom label', function () {
            collection.trigger( "select:all", { selected: [model], deselected: [] }, collection, { label: "starred" } );
            expect( collection.onSelectAll ).toHaveBeenCalledWith( {
                selected: [model],
                deselected: []
            }, collection, { label: "starred" } );
        } );

        it( 'calls the onReselect handler when triggering a reselect:any event with a custom label', function () {
            collection.trigger( "reselect:any", [model], collection, { label: "starred" } );
            expect( collection.onReselect ).toHaveBeenCalledWith( [model], collection, { label: "starred" } );
        } );

        it( 'does not call the onSelectNone handler when triggering a select:none event with a namespace', function () {
            collection.trigger( "select:none:starred", {
                selected: [],
                deselected: [model]
            }, collection, { label: "starred" } );
            expect( collection.onSelectNone ).not.toHaveBeenCalled();
        } );

        it( 'does not call the onSelectSome handler when triggering a select:some event with a namespace', function () {
            collection.trigger( "select:some:starred", {
                selected: [model],
                deselected: []
            }, collection, { label: "starred" } );
            expect( collection.onSelectSome ).not.toHaveBeenCalled();
        } );

        it( 'does not call the onSelectAll handler when triggering a select:all event with a namespace', function () {
            collection.trigger( "select:all:starred", {
                selected: [model],
                deselected: []
            }, collection, { label: "starred" } );
            expect( collection.onSelectAll ).not.toHaveBeenCalled();
        } );

        it( 'does not call the onReselect handler when triggering a reselect:any event with a namespace', function () {
            collection.trigger( "reselect:any:starred", [model], collection, { label: "starred" } );
            expect( collection.onReselect ).not.toHaveBeenCalled();
        } );

    } );


} );