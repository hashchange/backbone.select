describe( 'Custom labels: Interaction. Select.Me models shared between Select.One and Select.Many collection', function () {

    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var SelectOneCollection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.One.applyTo( this, models );
        }
    } );

    var SelectManyCollection = Backbone.Collection.extend( {
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

    describe( 'Using a custom "starred" label, in a collection where one model is already selected with the default label and another with a different custom label ("picked")', function () {

        describe( 'select()', function () {
            var m1, m2, selectOneCollection, selectManyCollection, events, expected;

            beforeEach( function () {
                m1 = new Model();
                m2 = new Model();

                selectOneCollection = new SelectOneCollection( [m1, m2] );
                selectManyCollection = new SelectManyCollection( [m1, m2] );
                m1.select();
                m2.select( { label: "picked" } );

                expected = {};
            } );

            afterEach( function () {
                selectOneCollection.close();
                selectManyCollection.close();
            } );

            describe( "when 1 out of 2 models in a collection is already selected, and selecting the second one via the model's select", function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );

                    events = getEventSpies( [m1, m2, selectOneCollection, selectManyCollection], ["selected", "picked", "starred"] );

                    m2.select( { label: "starred" } );
                } );

                describe( 'Among the models, the action', function () {

                    it( 'should star the second model', function () {
                        expect( m2.starred ).toBe( true );
                    } );

                    it( 'should unstar the first model', function () {
                        // ... because both models are in a Select.One collection
                        expect( m1.starred ).toBe( false );
                    } );

                    it( 'should not change the selected, picked status of the first model', function () {
                        expect( m1.selected ).toBe( true );
                        expect( m1.picked ).toBeFalsy();
                    } );

                    it( 'should not change the selected, picked status of the second model', function () {
                        expect( m2.selected ).toBeFalsy();
                        expect( m2.picked ).toBe( true );
                    } );

                    it( 'should trigger a deselected event, with label "starred" in the event options, for the first model', function () {
                        expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "starred" } );
                    } );

                    it( 'should trigger a deselected:starred event for the first model', function () {
                        expect( events.get( m1, "deselected:starred" ) ).toHaveBeenCalledWith( m1, { label: "starred" } );
                    } );

                    it( 'should not trigger more than those two deselected events (including namespaced ones)', function () {
                        expect( events.get( m1, "deselected:*" ) ).toHaveCallCount( 2 );
                        expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( 'should trigger a selected event, with label "starred" in the event options, for the second model', function () {
                        expect( events.get( m2, "selected" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                    } );

                    it( 'should trigger a selected:starred event for the second model', function () {
                        expect( events.get( m2, "selected:starred" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                    } );

                    it( 'should not trigger more than those two selected events (including namespaced ones)', function () {
                        expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m2, "selected:*" ) ).toHaveCallCount( 2 );
                    } );

                } );

                describe( 'The Select.One collection', function () {

                    it( 'should store the newly selected model in the "starred" property', function () {
                        expect( selectOneCollection.starred ).toBe( m2 );
                    } );

                    it( 'should leave the "selected" property set to the first model', function () {
                        expect( selectOneCollection.selected ).toBe( m1 );
                    } );

                    it( 'should leave the "picked" property set to the second model', function () {
                        expect( selectOneCollection.picked ).toBe( m2 );
                    } );

                    it( 'should trigger a select:one event, with label "starred" in the event options', function () {
                        expect( events.get( selectOneCollection, "select:one" ) ).toHaveBeenCalledWith( m2, selectOneCollection, { label: "starred" } );
                    } );

                    it( 'should trigger a select:one:starred event', function () {
                        expect( events.get( selectOneCollection, "select:one:starred" ) ).toHaveBeenCalledWith( m2, selectOneCollection, { label: "starred" } );
                    } );

                    it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                        expect( events.get( selectOneCollection, "select:one:*" ) ).toHaveCallCount( 2 );
                    } );

                    it( 'should trigger a deselect:one event, with label "starred" in the event options', function () {
                        expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m1, selectOneCollection, { label: "starred" } );
                    } );

                    it( 'should trigger a deselect:one:starred event', function () {
                        expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m1, selectOneCollection, { label: "starred" } );
                    } );

                    it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                        expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 2 );
                    } );

                } );

                describe( 'The Select.Many collection', function () {

                    it( "should have a starred count of 1", function () {
                        expect( selectManyCollection.starredLength ).toBe( 1 );
                    } );

                    it( "should have the second model in the starred list", function () {
                        expected[m2.cid] = m2;
                        expect( selectManyCollection.starred ).toEqual( expected );
                    } );

                    it( "should have an unchanged selected count of 1", function () {
                        expect( selectManyCollection.selectedLength ).toBe( 1 );
                    } );

                    it( "should have an unchanged selected list, containing the first model", function () {
                        expected[m1.cid] = m1;
                        expect( selectManyCollection.selected ).toEqual( expected );
                    } );

                    it( "should have an unchanged picked count of 1", function () {
                        expect( selectManyCollection.selectedLength ).toBe( 1 );
                    } );

                    it( "should have an unchanged picked list, containing the second model", function () {
                        expected[m2.cid] = m2;
                        expect( selectManyCollection.picked ).toEqual( expected );
                    } );

                    it( 'should trigger a select:some event, with label "starred" in the event options', function () {
                        expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                            selected: [m2],
                            deselected: [m1]
                        }, selectManyCollection, { label: "starred" } );
                    } );

                    it( 'should trigger a select:some:starred event', function () {
                        expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                            selected: [m2],
                            deselected: [m1]
                        }, selectManyCollection, { label: "starred" } );
                    } );

                    it( 'should not trigger more than those two select:some events (including namespaced ones)', function () {
                        expect( events.get( selectManyCollection, "select:some:*" ) ).toHaveCallCount( 2 );
                    } );

                    it( "should not trigger a select:all event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a select:none event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                    } );

                } );

            } );

        } );

    } );

} );