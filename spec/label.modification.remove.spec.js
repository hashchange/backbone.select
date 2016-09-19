describe( 'Custom labels: Removing models from a collection.', function () {

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

    describe( 'remove(), using a custom "starred" label along with conventional selections (label "selected")', function () {
        var m1, m2, m3, m4, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            m3 = new Model();

            m1.select();

            m2.select();
            m2.select( { label: "starred" } );

            m3.select( { label: "starred" } );

            m4 = new Model();
            m4.select( { label: "starred" } );
        } );

        describe( 'Select.One collection', function () {
            var selectOneCollection, events;

            beforeEach( function () {
                selectOneCollection = new SelectOneCollection( [m1, m2, m3, m4] );
            } );

            afterEach( function () {
                selectOneCollection.close();
            } );

            describe( 'The removed model is "starred"', function () {

                beforeEach( function () {
                    events = getEventSpies( [m1, m2, m3, m4, selectOneCollection], ["selected", "starred"] );
                } );

                describe( 'The removed model is also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectOneCollection( [m4] );
                        selectOneCollection.remove( m4 );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection remains set to the existing "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m2 );
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a deselect:one event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one:starred event for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 2 );
                        } );

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is also part of another collection, and removed with options.silent enabled', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectOneCollection( [m4] );
                        selectOneCollection.remove( m4, { silent: true } );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection remains set to the existing "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m2 );
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection', function () {

                    beforeEach( function () {
                        selectOneCollection.remove( m4 );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection remains set to the existing "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m2 );
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the removed model', function () {
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should not trigger more than those two deselected events (including namespaced ones) for the removed model', function () {
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 2 );
                        } );

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any of the remaining models', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a deselect:one event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one:starred event for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 2 );
                        } );

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection, and removed with options.silent enabled', function () {

                    beforeEach( function () {
                        selectOneCollection.remove( m4, { silent: true } );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection remains set to the existing "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m2 );
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

            } );

            describe( 'The removed model is "starred" and "selected"', function () {

                beforeEach( function () {
                    m4.select();
                    events = getEventSpies( [m1, m2, m3, m4, selectOneCollection], ["selected", "starred"] );
                } );

                describe( 'The removed model is also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectOneCollection( [m4] );
                        selectOneCollection.remove( m4 );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.selected ).toBeUndefined();
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model retains its "selected" status', function () {
                            expect( m4.selected ).toBe( true );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a deselect:one event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one:starred event for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one event, with label "selected" in the event options, for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one:selected event for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one:selected" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those four deselect:one events (including namespaced ones)', function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 4 );
                        } );

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is also part of another collection, and removed with options.silent enabled', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectOneCollection( [m4] );
                        selectOneCollection.remove( m4, { silent: true } );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.selected ).toBeUndefined();
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model retains its "selected" status', function () {
                            expect( m4.selected ).toBe( true );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection', function () {

                    beforeEach( function () {
                        selectOneCollection.remove( m4 );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.selected ).toBeUndefined();
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model loses its "selected" status', function () {
                            expect( m4.selected ).toBe( false );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the removed model', function () {
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the removed model', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the removed model', function () {
                            expect( events.get( m4, "deselected:selected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should not trigger more than those four deselected events (including namespaced ones) for the removed model', function () {
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 4 );
                        } );

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any of the remaining models', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a deselect:one event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one:starred event for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one event, with label "selected" in the event options, for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a deselect:one:selected event for the removed model', function () {
                            expect( events.get( selectOneCollection, "deselect:one:selected" ) ).toHaveBeenCalledWith( m4, selectOneCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those four deselect:one events (including namespaced ones)', function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 4 );
                        } );

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection, and removed with options.silent enabled', function () {

                    beforeEach( function () {
                        selectOneCollection.remove( m4, { silent: true } );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.selected ).toBeUndefined();
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model loses its "selected" status', function () {
                            expect( m4.selected ).toBe( false );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

            } );

        } );

        describe( 'Select.Many collection', function () {
            var selectManyCollection, events, expected;

            beforeEach( function () {
                selectManyCollection = new SelectManyCollection( [m1, m2, m3, m4] );
                expected = {};
            } );

            afterEach( function () {
                selectManyCollection.close();
            } );

            describe( 'The removed model is "starred"', function () {

                beforeEach( function () {
                    events = getEventSpies( [m1, m2, m3, m4, selectManyCollection], ["selected", "starred"] );
                } );

                describe( 'The removed model is also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [m4] );
                        selectManyCollection.remove( m4 );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a select:some event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some:starred event for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those two select:some events (including namespaced ones)', function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).toHaveCallCount( 2 );
                        } );

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:none event, including any of the namespaces", function () {
                            // ... unless it were the last selected or starred model, leaving none left.
                            expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is also part of another collection, and removed with options.silent enabled', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [m4] );
                        selectManyCollection.remove( m4, { silent: true } );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection', function () {

                    beforeEach( function () {
                        selectManyCollection.remove( m4 );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the removed model', function () {
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should not trigger more than those two deselected events (including namespaced ones) for the removed model', function () {
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 2 );
                        } );

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any of the remaining models', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a select:some event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some:starred event for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those two select:some events (including namespaced ones)', function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).toHaveCallCount( 2 );
                        } );

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:none event, including any of the namespaces", function () {
                            // ... unless it were the last selected or starred model, leaving none left.
                            expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection, and removed with options.silent enabled', function () {

                    beforeEach( function () {
                        selectManyCollection.remove( m4, { silent: true } );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model remains deselected with regard to the "selected" label', function () {
                            expect( m4.selected ).toBeFalsy();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

            } );

            describe( 'The removed model is "starred" and "selected"', function () {

                beforeEach( function () {
                    m4.select();
                    events = getEventSpies( [m1, m2, m3, m4, selectManyCollection], ["selected", "starred"] );
                } );

                describe( 'The removed model is also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [m4] );
                        selectManyCollection.remove( m4 );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model retains its "selected" status', function () {
                            expect( m4.selected ).toBe( true );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a select:some event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some:starred event for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some event, with label "selected" in the event options, for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some:selected event for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some:selected" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those four select:some events (including namespaced ones)', function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).toHaveCallCount( 4 );
                        } );

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:none event, including any of the namespaces", function () {
                            // ... unless it were the last selected or starred model, leaving none left.
                            expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is also part of another collection, and removed with options.silent enabled', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [m4] );
                        selectManyCollection.remove( m4, { silent: true } );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model retains its "starred" status', function () {
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the removed model retains its "selected" status', function () {
                            expect( m4.selected ).toBe( true );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection', function () {

                    beforeEach( function () {
                        selectManyCollection.remove( m4 );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model loses its "selected" status', function () {
                            expect( m4.selected ).toBe( false );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the removed model', function () {
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the removed model', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the removed model', function () {
                            expect( events.get( m4, "deselected:selected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should not trigger more than those four deselected events (including namespaced ones) for the removed model', function () {
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 4 );
                        } );

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any of the remaining models', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( 'should trigger a select:some event, with label "starred" in the event options, for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some:starred event for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "starred", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some event, with label "selected" in the event options, for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should trigger a select:some:selected event for the removed model', function () {
                            expect( events.get( selectManyCollection, "select:some:selected" ) ).toHaveBeenCalledWith( {
                                selected: [],
                                deselected: [m4]
                            }, selectManyCollection, jasmine.objectContaining( { label: "selected", _externalEvent: "remove" } ) );
                        } );

                        it( 'should not trigger more than those four select:some events (including namespaced ones)', function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).toHaveCallCount( 4 );
                        } );

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:none event, including any of the namespaces", function () {
                            // ... unless it were the last selected or starred model, leaving none left.
                            expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed model is not part of another collection, and removed with options.silent enabled', function () {

                    beforeEach( function () {
                        selectManyCollection.remove( m4, { silent: true } );
                    } );

                    describe( 'Status', function () {

                        it( 'the remaining models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the remaining models retain their deselected "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the remaining "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the "starred" property of the collection contains the remaining "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                        it( 'the removed model loses its "starred" status', function () {
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed model loses its "selected" status', function () {
                            expect( m4.selected ).toBe( false );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a selection-related event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a selection-related event, including for any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

            } );

        } );

    } );

} );