describe( 'Custom labels: Resetting a collection.', function () {

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

    describe( 'reset(), using a custom "starred" label along with conventional selections (label "selected").', function () {

        var m1, m2, m3, m4, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            m3 = new Model();
            m4 = new Model();

            m1.select();

            m2.select();
            m2.select( { label: "starred" } );

            m3.select( { label: "starred" } );

            m4.select();
            m4.select( { label: "starred" } );
        } );

        describe( 'Select.One collection', function () {
            var selectOneCollection;

            describe( 'Adding items to an empty collection with reset()', function () {

                beforeEach( function () {
                    selectOneCollection = new SelectOneCollection();
                    events = getEventSpies( [m1, m2, m3, m4, selectOneCollection], ["selected", "starred"] );

                    selectOneCollection.reset( [ m1, m2, m3, m4 ] );
                } );

                afterEach( function () {
                    selectOneCollection.close();
                } );

                describe( 'Status', function () {

                    it( 'the last model for the "selected" label retains its status, the others are deselected', function () {
                        expect( m1.selected ).toBe( false );
                        expect( m2.selected ).toBe( false );
                        expect( m3.selected ).toBeFalsy();
                        expect( m4.selected ).toBe( true );
                    } );

                    it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                        expect( selectOneCollection.selected ).toBe( m4 );
                    } );

                    it( 'the last model for the "starred" label retains its status, the others are deselected', function () {
                        expect( m1.starred ).toBeFalsy();
                        expect( m2.starred ).toBe( false );
                        expect( m3.starred ).toBe( false );
                        expect( m4.starred ).toBe( true );
                    } );

                    it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                        expect( selectOneCollection.starred ).toBe( m4 );
                    } );

                } );

                describe( 'Model events', function () {

                    it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                        expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( 'should trigger a deselected event, with label "starred" in the event options, for models which had been starred and are added before the last starred one', function () {
                        expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                        expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "starred" } );
                    } );

                    it( 'should trigger a deselected:starred event for models which had been starred and are added before the last starred one', function () {
                        expect( events.get( m2, "deselected:starred" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                        expect( events.get( m3, "deselected:starred" ) ).toHaveBeenCalledWith( m3, { label: "starred" } );
                    } );

                    it( 'should trigger a deselected event, with label "selected" in the event options, for models which had been selected and are added before the last selected one', function () {
                        expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                        expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                    } );

                    it( 'should trigger a deselected:selected event for models which had been selected and are added before the last selected one', function () {
                        expect( events.get( m1, "deselected:selected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                        expect( events.get( m2, "deselected:selected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                    } );

                    it( 'should not trigger more than those eight deselected events (including namespaced ones)', function () {
                        expect( events.get( m1, "deselected:*" ) ).toHaveCallCount( 2 );
                        expect( events.get( m2, "deselected:*" ) ).toHaveCallCount( 4 );
                        expect( events.get( m3, "deselected:*" ) ).toHaveCallCount( 2 );
                        expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                        expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                    } );

                } );

                describe( 'Collection events', function () {

                    it( "should not trigger a select:one event, including any of the namespaces", function () {
                        expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a deselect:one event, including any of the namespaces", function () {
                        expect( events.get( selectOneCollection, "deselect:one:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                        expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                    } );

                } );

            } );

            describe( 'Emptying a collection with reset().', function () {

                beforeEach( function () {
                    selectOneCollection = new SelectOneCollection( [ m1, m2, m3, m4 ] );
                } );

                afterEach( function () {
                    selectOneCollection.close();
                } );

                describe( 'The removed models are also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [ m1, m2, m3, m4 ] );
                        events = getEventSpies( [m1, m2, m3, m4, selectOneCollection], ["selected", "starred"] );

                        selectOneCollection.reset();
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( true );
                        } );

                        it( 'the models retain their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.selected ).toBeUndefined();
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
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

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a deselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed models are not part of another collection', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m2, m3, m4, selectOneCollection], ["selected", "starred"] );

                        selectOneCollection.reset();
                    } );

                    describe( 'Status', function () {

                        it( 'the removed models lose their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( false );
                        } );

                        it( 'the removed models lose their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.selected ).toBeUndefined();
                        } );

                        it( 'the "starred" property of the collection is set to undefined', function () {
                            expect( selectOneCollection.starred ).toBeUndefined();
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the removed model which has been starred', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the removed model which has been starred', function () {
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the removed model which has been selected', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the removed model which has been selected', function () {
                            expect( events.get( m4, "deselected:selected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should not trigger more than those four deselected events (including namespaced ones) for the removed models', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 4 );
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

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a deselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

            } );

            describe( 'Swapping out the collection content with reset(), with partial overlap of models before and after.', function () {
                var m5, m6, m7;

                beforeEach( function () {
                    m5 = new Model();
                    m6 = new Model();
                    m7 = new Model();

                    m5.select();

                    m6.select( { label: "starred" } );

                    m7.select();
                    m7.select( { label: "starred" } );

                    selectOneCollection = new SelectOneCollection( [ m1, m2, m3, m4 ] );
                } );

                afterEach( function () {
                    selectOneCollection.close();
                } );

                describe( 'The removed models are also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [ m1, m2, m3, m4 ] );
                        events = getEventSpies( [m1, m2, m3, m4, m5, m6, m7, selectOneCollection], ["selected", "starred"] );

                        // m2 is part of the initial set and the new set.
                        selectOneCollection.reset( [ m2, m5, m6, m7 ] );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the permanently removed models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( true );
                        } );

                        it( 'the permanently removed models retain their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the last "selected" of the added models retains its status, the others are deselected', function () {
                            expect( m2.selected ).toBe( false );
                            expect( m5.selected ).toBe( false );
                            expect( m6.selected ).toBeFalsy();
                            expect( m7.selected ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m7 );
                        } );

                        it( 'the last "starred" of the added models retains its status, the others are deselected', function () {
                            expect( m2.starred ).toBe( false );
                            expect( m5.starred ).toBeFalsy();
                            expect( m6.starred ).toBe( false );
                            expect( m7.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                            expect( selectOneCollection.starred ).toBe( m7 );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a deselected event, including for any of the namespaces, for the permanently removed models', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should trigger a deselected event, with label "starred" in the event options, for added models which had been starred and precede the last starred one', function () {
                            expect( events.get( m6, "deselected" ) ).toHaveBeenCalledWith( m6, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected:starred event for added models which had been starred and precede the last starred one', function () {
                            expect( events.get( m6, "deselected:starred" ) ).toHaveBeenCalledWith( m6, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for added models which had been selected and precede the last selected one', function () {
                            expect( events.get( m5, "deselected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                        } );

                        it( 'should trigger a deselected:selected event for added models which had been selected and precede the last selected one', function () {
                            expect( events.get( m5, "deselected:selected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                        } );

                        it( 'should not trigger more than those four deselected events (including namespaced ones) for the added models', function () {
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m5, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m6, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m7, "deselected:*" ) ).not.toHaveBeenCalled();
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

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a deselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed models are not part of another collection', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m2, m3, m4, m5, m6, m7, selectOneCollection], ["selected", "starred"] );

                        // m2 is part of the initial set and the new set.
                        selectOneCollection.reset( [ m2, m5, m6, m7 ] );
                    } );

                    describe( 'Status', function () {

                        it( 'the permanently removed models lose their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( false );
                        } );

                        it( 'the permanently removed models lose their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the last "selected" of the added models retains its status, the others are deselected', function () {
                            expect( m2.selected ).toBe( false );
                            expect( m5.selected ).toBe( false );
                            expect( m6.selected ).toBeFalsy();
                            expect( m7.selected ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m7 );
                        } );

                        it( 'the last "starred" of the added models retains its status, the others are deselected', function () {
                            expect( m2.starred ).toBe( false );
                            expect( m5.starred ).toBeFalsy();
                            expect( m6.starred ).toBe( false );
                            expect( m7.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                            expect( selectOneCollection.starred ).toBe( m7 );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the permanently removed model which has been starred', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the permanently removed model which has been starred', function () {
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the permanently removed model which has been selected', function () {
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the permanently removed model which has been selected', function () {
                            expect( events.get( m4, "deselected:selected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "starred" in the event options, for added models which had been starred and precede the last starred one', function () {
                            expect( events.get( m6, "deselected" ) ).toHaveBeenCalledWith( m6, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected:starred event for added models which had been starred and precede the last starred one', function () {
                            expect( events.get( m6, "deselected:starred" ) ).toHaveBeenCalledWith( m6, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for added models which had been selected and precede the last selected one', function () {
                            expect( events.get( m5, "deselected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                        } );

                        it( 'should trigger a deselected:selected event for added models which had been selected and precede the last selected one', function () {
                            expect( events.get( m5, "deselected:selected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                        } );

                        it( 'should not trigger more than those eight deselected events (including namespaced ones)', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 4 );
                            expect( events.get( m5, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m6, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m7, "deselected:*" ) ).not.toHaveBeenCalled();
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

                        it( "should not trigger a select:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "select:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a deselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "deselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                            expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

            } );

        } );

        describe( 'Select.Many collection', function () {
            var selectManyCollection, expected;

            beforeEach( function () {
                expected = {};
            } );

            describe( 'Adding items to an empty collection with reset()', function () {

                beforeEach( function () {
                    selectManyCollection = new SelectManyCollection();
                    events = getEventSpies( [m1, m2, m3, m4, selectManyCollection], ["selected", "starred"] );

                    selectManyCollection.reset( [ m1, m2, m3, m4 ] );
                } );

                afterEach( function () {
                    selectManyCollection.close();
                } );

                describe( 'Status', function () {

                    it( 'all models retain their status for the "selected" label', function () {
                        expect( m1.selected ).toBe( true );
                        expect( m2.selected ).toBe( true );
                        expect( m3.selected ).toBeFalsy();
                        expect( m4.selected ).toBe( true );
                    } );

                    it( 'the "selected" property of the collection contains the "selected" models', function () {
                        expected[m1.cid] = m1;
                        expected[m2.cid] = m2;
                        expected[m4.cid] = m4;
                        expect( selectManyCollection.selected ).toEqual( expected );
                    } );

                    it( 'all models retain their status for the "starred" label', function () {
                        expect( m1.starred ).toBeFalsy();
                        expect( m2.starred ).toBe( true );
                        expect( m3.starred ).toBe( true );
                        expect( m4.starred ).toBe( true );
                    } );

                    it( 'the "starred" property of the collection contains the "starred" models', function () {
                        expected[m2.cid] = m2;
                        expected[m3.cid] = m3;
                        expected[m4.cid] = m4;
                        expect( selectManyCollection.starred ).toEqual( expected );
                    } );

                } );

                describe( 'Model events', function () {

                    it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                        expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                        expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                        expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                        expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                    } );

                } );

                describe( 'Collection events', function () {

                    it( "should not trigger a select:all event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a select:some event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "select:some:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a select:none event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                    } );

                    it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                        expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                    } );

                } );

            } );

            describe( 'Emptying a collection with reset().', function () {

                beforeEach( function () {
                    selectManyCollection = new SelectManyCollection( [ m1, m2, m3, m4 ] );
                } );

                afterEach( function () {
                    selectManyCollection.close();
                } );

                describe( 'The removed models are also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [ m1, m2, m3, m4 ] );
                        events = getEventSpies( [m1, m2, m3, m4, selectManyCollection], ["selected", "starred"] );

                        selectManyCollection.reset();
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'all models retain their status for the "selected" label', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( true );
                        } );

                        it( 'all models retain their status for the "starred" label', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection is set to an empty object', function () {
                            expect( selectManyCollection.selected ).toEqual( {} );
                        } );

                        it( 'the "starred" property of the collection is set to an empty object', function () {
                            expect( selectManyCollection.starred ).toEqual( {} );
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

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:some event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:none event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed models are not part of another collection', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m2, m3, m4, selectManyCollection], ["selected", "starred"] );

                        selectManyCollection.reset();
                    } );

                    describe( 'Status', function () {

                        it( 'the removed models lose their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( false );
                        } );

                        it( 'the removed models lose their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the "selected" property of the collection is set to an empty object', function () {
                            expect( selectManyCollection.selected ).toEqual( {} );
                        } );

                        it( 'the "starred" property of the collection is set to an empty object', function () {
                            expect( selectManyCollection.starred ).toEqual( {} );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the removed models which have been starred', function () {
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "starred" } ) );
                            expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, jasmine.objectContaining( { label: "starred" } ) );
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the removed models which have been starred', function () {
                            expect( events.get( m2, "deselected:starred" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "starred" } ) );
                            expect( events.get( m3, "deselected:starred" ) ).toHaveBeenCalledWith( m3, jasmine.objectContaining( { label: "starred" } ) );
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the removed models which have been selected', function () {
                            expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, jasmine.objectContaining( { label: "selected" } ) );
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "selected" } ) );
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the removed models which have been selected', function () {
                            expect( events.get( m1, "deselected:selected" ) ).toHaveBeenCalledWith( m1, jasmine.objectContaining( { label: "selected" } ) );
                            expect( events.get( m2, "deselected:selected" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "selected" } ) );
                            expect( events.get( m4, "deselected:selected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should not trigger more than those 12 deselected events (including namespaced ones) for the removed models', function () {
                            expect( events.get( m1, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m2, "deselected:*" ) ).toHaveCallCount( 4 );
                            expect( events.get( m3, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 4 );
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

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:some event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).not.toHaveBeenCalled();
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

            describe( 'Swapping out the collection content with reset(), with partial overlap of models before and after.', function () {
                var m5, m6, m7;

                beforeEach( function () {
                    m5 = new Model();
                    m6 = new Model();
                    m7 = new Model();

                    m5.select();

                    m6.select( { label: "starred" } );

                    m7.select();
                    m7.select( { label: "starred" } );

                    selectManyCollection = new SelectManyCollection( [ m1, m2, m3, m4 ] );
                } );

                afterEach( function () {
                    selectManyCollection.close();
                } );

                describe( 'The removed models are also part of another collection', function () {
                    var otherCollection;

                    beforeEach( function () {
                        otherCollection = new SelectManyCollection( [ m1, m2, m3, m4 ] );
                        events = getEventSpies( [m1, m2, m3, m4, m5, m6, m7, selectManyCollection], ["selected", "starred"] );

                        // m2 is part of the initial set and the new set.
                        selectManyCollection.reset( [ m2, m5, m6, m7 ] );
                    } );

                    afterEach( function () {
                        otherCollection.close();
                    } );

                    describe( 'Status', function () {

                        it( 'the permanently removed models retain their "selected" status', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( true );
                        } );

                        it( 'the permanently removed models retain their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m3.starred ).toBe( true );
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the added models retain their "selected" status', function () {
                            expect( m2.selected ).toBe( true );
                            expect( m5.selected ).toBe( true );
                            expect( m6.selected ).toBeFalsy();
                            expect( m7.selected ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the added "selected" models', function () {
                            expected[m2.cid] = m2;
                            expected[m5.cid] = m5;
                            expected[m7.cid] = m7;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the added models retain their "starred" status', function () {
                            expect( m2.starred ).toBe( true );
                            expect( m5.starred ).toBeFalsy();
                            expect( m6.starred ).toBe( true );
                            expect( m7.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection contains the added "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m6.cid] = m6;
                            expected[m7.cid] = m7;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m5, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m6, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m7, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m5, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m6, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m7, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m5, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m6, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m7, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:some event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:none event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:none:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a reselect:any event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "reselect:any:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'The removed models are not part of another collection', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m2, m3, m4, m5, m6, m7, selectManyCollection], ["selected", "starred"] );

                        // m2 is part of the initial set and the new set.
                        selectManyCollection.reset( [ m2, m5, m6, m7 ] );
                    } );

                    describe( 'Status', function () {

                        it( 'the permanently removed models lose their "selected" status', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( false );
                        } );

                        it( 'the permanently removed models lose their "starred" status', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( false );
                        } );

                        it( 'the removed and re-added model loses its "selected" status', function () {
                            // That happens because a reset() does indeed imply a remove(), followed by an add(). The
                            // model loses its selected status when it is removed (because it is no longer part of any
                            // collection, for an instant anyway).
                            expect( m2.selected ).toBe( false );
                        } );

                        it( 'the newly added models retain their "selected" status', function () {
                            expect( m5.selected ).toBe( true );
                            expect( m6.selected ).toBeFalsy();
                            expect( m7.selected ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection contains the newly added "selected" models', function () {
                            expected[m5.cid] = m5;
                            expected[m7.cid] = m7;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'the removed and re-added model loses its "starred" status', function () {
                            // See the corresponding "selected" case, above.
                            expect( m2.starred ).toBe( false );
                        } );

                        it( 'the newly added models retain their "starred" status', function () {
                            expect( m5.starred ).toBeFalsy();
                            expect( m6.starred ).toBe( true );
                            expect( m7.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection contains the newly added "starred" models', function () {
                            expected[m6.cid] = m6;
                            expected[m7.cid] = m7;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                    } );

                    describe( 'Model events', function () {

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the permanently removed models which have been starred', function () {
                            expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, jasmine.objectContaining( { label: "starred" } ) );
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the permanently removed models which have been starred', function () {
                            expect( events.get( m3, "deselected:starred" ) ).toHaveBeenCalledWith( m3, jasmine.objectContaining( { label: "starred" } ) );
                            expect( events.get( m4, "deselected:starred" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the permanently removed models which have been selected', function () {
                            expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, jasmine.objectContaining( { label: "selected" } ) );
                            expect( events.get( m4, "deselected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the permanently removed models which have been selected', function () {
                            expect( events.get( m1, "deselected:selected" ) ).toHaveBeenCalledWith( m1, jasmine.objectContaining( { label: "selected" } ) );
                            expect( events.get( m4, "deselected:selected" ) ).toHaveBeenCalledWith( m4, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the temporarily removed, re-added model which has been starred', function () {
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected:starred event for the temporarily removed, re-added model which has been starred', function () {
                            expect( events.get( m2, "deselected:starred" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "starred" } ) );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the temporarily removed, re-added model which has been selected', function () {
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should trigger a deselected:selected event for the temporarily removed, re-added model which has been selected', function () {
                            expect( events.get( m2, "deselected:selected" ) ).toHaveBeenCalledWith( m2, jasmine.objectContaining( { label: "selected" } ) );
                        } );

                        it( 'should not trigger more than those 12 deselected events (including namespaced ones)', function () {
                            expect( events.get( m1, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m2, "deselected:*" ) ).toHaveCallCount( 4 );
                            expect( events.get( m3, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m4, "deselected:*" ) ).toHaveCallCount( 4 );
                            expect( events.get( m5, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m6, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m7, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m5, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m6, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m7, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m5, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m6, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m7, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                    describe( 'Collection events', function () {

                        it( "should not trigger a select:all event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:all:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( "should not trigger a select:some event, including any of the namespaces", function () {
                            expect( events.get( selectManyCollection, "select:some:*" ) ).not.toHaveBeenCalled();
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

} );