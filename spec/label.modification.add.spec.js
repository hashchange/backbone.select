describe( 'Custom labels: Adding models to a collection', function () {

    var Model = Backbone.Model.extend( {
        initialize: function () {
            Backbone.Select.Me.applyTo( this );
        }
    } );

    var SelectOneCollection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.One.applyTo( this, models, { enableModelSharing: true } );
        }
    } );

    var SelectManyCollection = Backbone.Collection.extend( {
        initialize: function ( models ) {
            Backbone.Select.Many.applyTo( this, models, { enableModelSharing: true } );
        }
    } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( 'Using a custom "starred" label along with conventional selections (label "selected")', function () {
        var m1, m2, m3, events;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
            m3 = new Model();

            m1.select();

            m2.select();
            m2.select( { label: "starred" } );

            m3.select( { label: "starred" } );
        } );

        describe( 'Passing in models when creating a collection', function () {

            describe( 'Select.One collection', function () {
                var selectOneCollection;

                describe( 'with each model changing only one selection ("selected" or "starred") at a time', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m2, m3 ], ["selected", "starred"] );

                        selectOneCollection = new SelectOneCollection( [m1, m2, m3] );
                    } );

                    describe( 'Status', function () {

                        it( 'the last model for the "selected" label retains its status, the other is deselected', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m2 );
                        } );

                        it( 'the last model for the "starred" label retains its status, the other is deselected', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                            expect( selectOneCollection.starred ).toBe( m3 );
                        } );

                    } );

                    describe( 'Events', function () {

                        // NB We can't attach handlers to the collection while it is instantiated, so we only test
                        // model events here. (For a more involved test of collection events during instantiation,
                        // see the corresponding basic tests without label. Collection events shouldn't fire anyway.)

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the first of the two models which had been selected', function () {
                            expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                        } );

                        it( 'should trigger a deselected:starred event for the first of the two models which had been selected', function () {
                            expect( events.get( m1, "deselected:selected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                        } );

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the first of the two models which had been starred', function () {
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected:starred event for the first of the two models which had been starred', function () {
                            expect( events.get( m2, "deselected:starred" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                        } );

                        it( 'should not trigger more than those four deselected events (including namespaced ones)', function () {
                            expect( events.get( m1, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m2, "deselected:*" ) ).toHaveCallCount( 2 );
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'with the last model changing both selections ("selected" and "starred") at the same time', function () {
                    var m4;

                    beforeEach( function () {
                        m4 = new Model();
                        m4.select();
                        m4.select( { label: "starred" } );

                        events = getEventSpies( [m1, m2, m3, m4 ], ["selected", "starred"] );

                        selectOneCollection = new SelectOneCollection( [m1, m2, m3, m4] );
                    } );

                    describe( 'Status', function () {

                        it( 'the last model for the "selected" label retains its status, the other is deselected', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( true );

                        } );

                        it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m4 );
                        } );

                        it( 'the last model for the "starred" label retains its status, the other is deselected', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                            expect( selectOneCollection.starred ).toBe( m4 );
                        } );

                    } );

                    describe( 'Events', function () {

                        // NB We can't attach handlers to the collection while it is instantiated, so we only test
                        // model events here. (For a more involved test of collection events during instantiation,
                        // see the corresponding basic tests without label. Collection events shouldn't fire anyway.)

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should trigger a deselected event, with label "starred" in the event options, for the first two of the three models which had been starred', function () {
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                            expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected:starred event for the first two of the three models which had been starred', function () {
                            expect( events.get( m2, "deselected:starred" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                            expect( events.get( m3, "deselected:starred" ) ).toHaveBeenCalledWith( m3, { label: "starred" } );
                        } );

                        it( 'should trigger a deselected event, with label "selected" in the event options, for the first two of the three models which had been selected', function () {
                            expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                            expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                        } );

                        it( 'should trigger a deselected:selected event for the first two of the three models which had been selected', function () {
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

                } );

            } );

            describe( 'Select.Many collection', function () {
                var selectManyCollection, expected;

                beforeEach( function () {
                    expected = {};
                } );

                describe( 'with each model changing only one selection ("selected" or "starred") at a time', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m2, m3 ], ["selected", "starred"] );

                        selectManyCollection = new SelectManyCollection( [m1, m2, m3] );
                    } );

                    describe( 'Status', function () {

                        it( 'all models retain their status for the "selected" label', function () {
                            expect( m1.selected ).toBe( true );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the "selected" property of the collection contains the "selected" models', function () {
                            expected[m1.cid] = m1;
                            expected[m2.cid] = m2;
                            expect( selectManyCollection.selected ).toEqual( expected );
                        } );

                        it( 'all models retain their status for the "starred" label', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( true );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection contains the "starred" models', function () {
                            expected[m2.cid] = m2;
                            expected[m3.cid] = m3;
                            expect( selectManyCollection.starred ).toEqual( expected );
                        } );

                    } );

                    describe( 'Events', function () {

                        // NB We can't attach handlers to the collection while it is instantiated, so we only test
                        // model events here. (For a more involved test of collection events during instantiation,
                        // see the corresponding basic tests without label. Collection events shouldn't fire anyway.)

                        it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                        } );

                        it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                            expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                            expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                        } );

                    } );

                } );

                describe( 'with the last model changing both selections ("selected" and "starred") at the same time', function () {
                    var m4;

                    beforeEach( function () {
                        m4 = new Model();
                        m4.select();
                        m4.select( { label: "starred" } );

                        events = getEventSpies( [m1, m2, m3, m4 ], ["selected", "starred"] );

                        selectManyCollection = new SelectManyCollection( [m1, m2, m3, m4] );
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

                    describe( 'Events', function () {

                        // NB We can't attach handlers to the collection while it is instantiated, so we only test
                        // model events here. (For a more involved test of collection events during instantiation,
                        // see the corresponding basic tests without label. Collection events shouldn't fire anyway.)

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

                } );

            } );

        } );

        describe( 'add()', function () {

            describe( 'Select.One collection', function () {
                var selectOneCollection;

                describe( 'Status: When adding the models to the collection', function () {

                    beforeEach( function () {
                        selectOneCollection = new SelectOneCollection();
                        selectOneCollection.add( m1 );
                        selectOneCollection.add( m2 );
                        selectOneCollection.add( m3 );
                    } );

                    describe( 'with each model changing only one selection ("selected" or "starred") at a time', function () {

                        it( 'the last model for the "selected" label retains its status, the other is deselected', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( true );
                            expect( m3.selected ).toBeFalsy();
                        } );

                        it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m2 );
                        } );

                        it( 'the last model for the "starred" label retains its status, the other is deselected', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                            expect( selectOneCollection.starred ).toBe( m3 );
                        } );

                    } );

                    describe( 'with the last model changing both selections ("selected" and "starred") at the same time', function () {
                        var m4;

                        beforeEach( function () {
                            m4 = new Model();
                            m4.select();
                            m4.select( { label: "starred" } );

                            selectOneCollection.add( m4 );
                        } );

                        it( 'the last model for the "selected" label retains its status, the other is deselected', function () {
                            expect( m1.selected ).toBe( false );
                            expect( m2.selected ).toBe( false );
                            expect( m3.selected ).toBeFalsy();
                            expect( m4.selected ).toBe( true );
                        } );

                        it( 'the "selected" property of the collection is set to the last "selected" model', function () {
                            expect( selectOneCollection.selected ).toBe( m4 );
                        } );

                        it( 'the last model for the "starred" label retains its status, the other is deselected', function () {
                            expect( m1.starred ).toBeFalsy();
                            expect( m2.starred ).toBe( false );
                            expect( m3.starred ).toBe( false );
                            expect( m4.starred ).toBe( true );
                        } );

                        it( 'the "starred" property of the collection is set to the last "starred" model', function () {
                            expect( selectOneCollection.starred ).toBe( m4 );
                        } );

                    } );

                } );

                describe( 'Events', function () {

                    describe( 'When adding a model which is "starred"', function () {
                        var events;

                        beforeEach( function () {
                            selectOneCollection = new SelectOneCollection( [m1, m2] );

                            events = getEventSpies( [m1, m2, m3, selectOneCollection ], ["selected", "starred"] );

                            selectOneCollection.add( m3 );
                        } );

                        describe( 'model events', function () {

                            it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                                expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            } );

                            it( 'should trigger a deselected event, with label "starred" in the event options, for an existing model which had been starred', function () {
                                expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                            } );

                            it( 'should trigger a deselected:starred event for an existing model which had been starred', function () {
                                expect( events.get( m2, "deselected:starred" ) ).toHaveBeenCalledWith( m2, { label: "starred" } );
                            } );

                            it( 'should not trigger more than those two deselected events (including namespaced ones)', function () {
                                expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "deselected:*" ) ).toHaveCallCount( 2 );
                                expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            } );

                            it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                                expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            } );

                        } );

                        describe( 'collection events', function () {

                            it( 'should trigger a select:one event, with label "starred" in the event options, for the added model', function () {
                                expect( events.get( selectOneCollection, "select:one" ) ).toHaveBeenCalledWith( m3, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:one:starred event for the added model', function () {
                                expect( events.get( selectOneCollection, "select:one:starred" ) ).toHaveBeenCalledWith( m3, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should not trigger more than those two select:one events (including namespaced ones)', function () {
                                expect( events.get( selectOneCollection, "select:one:*" ) ).toHaveCallCount( 2 );
                            } );

                            it( 'should trigger a deselect:one event, with label "starred" in the event options, for an existing model which had been starred', function () {
                                expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m2, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a deselect:one:starred event for an existing model which had been starred', function () {
                                expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m2, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should not trigger more than those two deselect:one events (including namespaced ones)', function () {
                                expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 2 );
                            } );

                            it( "should not trigger a reselect:one event, including any of the namespaces", function () {
                                expect( events.get( selectOneCollection, "reselect:one:*" ) ).not.toHaveBeenCalled();
                            } );

                        } );

                    } );

                    describe( 'When adding a model which is both "selected" and "starred"', function () {
                        var m4, events;

                        beforeEach( function () {
                            m4 = new Model();
                            m4.select();
                            m4.select( { label: "starred" } );

                            selectOneCollection = new SelectOneCollection( [m1, m2, m3] );
                            events = getEventSpies( [m1, m2, m3, m4, selectOneCollection ], ["selected", "starred"] );

                            selectOneCollection.add( m4 );
                        } );

                        describe( 'model events', function () {

                            it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                                expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m4, "selected:*" ) ).not.toHaveBeenCalled();
                            } );

                            it( 'should trigger a deselected event, with label "starred" in the event options, for an existing model which had been starred', function () {
                                expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "starred" } );
                            } );

                            it( 'should trigger a deselected:starred event for an existing model which had been starred', function () {
                                expect( events.get( m3, "deselected:starred" ) ).toHaveBeenCalledWith( m3, { label: "starred" } );
                            } );

                            it( 'should trigger a deselected event, with label "selected" in the event options, for an existing model which had been selected', function () {
                                expect( events.get( m2, "deselected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                            } );

                            it( 'should trigger a deselected:selected event for an existing model which had been selected', function () {
                                expect( events.get( m2, "deselected:selected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                            } );

                            it( 'should not trigger more than those four deselected events (including namespaced ones)', function () {
                                expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "deselected:*" ) ).toHaveCallCount( 2 );
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

                        describe( 'collection events', function () {

                            it( 'should trigger a select:one event, with label "starred" in the event options, for the added model', function () {
                                expect( events.get( selectOneCollection, "select:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:one:starred event for the added model', function () {
                                expect( events.get( selectOneCollection, "select:one:starred" ) ).toHaveBeenCalledWith( m4, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:one event, with label "selected" in the event options, for the added model', function () {
                                expect( events.get( selectOneCollection, "select:one" ) ).toHaveBeenCalledWith( m4, selectOneCollection, { label: "selected", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:one:selected event for the added model', function () {
                                expect( events.get( selectOneCollection, "select:one:selected" ) ).toHaveBeenCalledWith( m4, selectOneCollection, { label: "selected", _externalEvent: "add" } );
                            } );

                            it( 'should not trigger more than those four select:one events (including namespaced ones)', function () {
                                expect( events.get( selectOneCollection, "select:one:*" ) ).toHaveCallCount( 4 );
                            } );

                            it( 'should trigger a deselect:one event, with label "starred" in the event options, for an existing model which had been starred', function () {
                                expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m3, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a deselect:one:starred event for an existing model which had been starred', function () {
                                expect( events.get( selectOneCollection, "deselect:one:starred" ) ).toHaveBeenCalledWith( m3, selectOneCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a deselect:one event, with label "selected" in the event options, for an existing model which had been selected', function () {
                                expect( events.get( selectOneCollection, "deselect:one" ) ).toHaveBeenCalledWith( m2, selectOneCollection, { label: "selected", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a deselect:one:selected event for an existing model which had been selected', function () {
                                expect( events.get( selectOneCollection, "deselect:one:selected" ) ).toHaveBeenCalledWith( m2, selectOneCollection, { label: "selected", _externalEvent: "add" } );
                            } );

                            it( 'should not trigger more than those four deselect:one events (including namespaced ones)', function () {
                                expect( events.get( selectOneCollection, "deselect:one:*" ) ).toHaveCallCount( 4 );
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

                describe( 'Status: When adding the models to the collection', function () {

                    beforeEach( function () {
                        selectManyCollection = new SelectManyCollection();
                        selectManyCollection.add( m1 );
                        selectManyCollection.add( m2 );
                        selectManyCollection.add( m3 );
                    } );

                    it( 'all models retain their status for the "selected" label', function () {
                        expect( m1.selected ).toBe( true );
                        expect( m2.selected ).toBe( true );
                        expect( m3.selected ).toBeFalsy();
                    } );

                    it( 'the "selected" property of the collection contains the "selected" models', function () {
                        expected[m1.cid] = m1;
                        expected[m2.cid] = m2;
                        expect( selectManyCollection.selected ).toEqual( expected );
                    } );

                    it( 'all models retain their status for the "starred" label', function () {
                        expect( m1.starred ).toBeFalsy();
                        expect( m2.starred ).toBe( true );
                        expect( m3.starred ).toBe( true );
                    } );

                    it( 'the "starred" property of the collection contains the "starred" models', function () {
                        expected[m2.cid] = m2;
                        expected[m3.cid] = m3;
                        expect( selectManyCollection.starred ).toEqual( expected );
                    } );

                } );

                describe( 'Events', function () {

                    describe( 'When adding a model which is "starred"', function () {
                        var events;

                        beforeEach( function () {
                            selectManyCollection = new SelectManyCollection( [m1, m2] );

                            events = getEventSpies( [m1, m2, m3, selectManyCollection ], ["selected", "starred"] );

                            selectManyCollection.add( m3 );
                        } );

                        describe( 'model events', function () {

                            it( 'should not trigger a selected event, including for any of the namespaces, for any model', function () {
                                expect( events.get( m1, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "selected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m3, "selected:*" ) ).not.toHaveBeenCalled();
                            } );

                            it( 'should not trigger a deselected event, including for any of the namespaces, for any model', function () {
                                expect( events.get( m1, "deselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "deselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m3, "deselected:*" ) ).not.toHaveBeenCalled();
                            } );

                            it( 'should not trigger a reselected event, including for any of the namespaces, for any model', function () {
                                expect( events.get( m1, "reselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m2, "reselected:*" ) ).not.toHaveBeenCalled();
                                expect( events.get( m3, "reselected:*" ) ).not.toHaveBeenCalled();
                            } );

                        } );

                        describe( 'collection events', function () {

                            it( 'should trigger a select:some event, with label "starred" in the event options, for the added model', function () {
                                expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                    selected: [m3],
                                    deselected: []
                                }, selectManyCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:some:starred event for the added model', function () {
                                expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                                    selected: [m3],
                                    deselected: []
                                }, selectManyCollection, { label: "starred", _externalEvent: "add" } );
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

                    describe( 'When adding a model which is both "selected" and "starred"', function () {
                        var m4, events;

                        beforeEach( function () {
                            m4 = new Model();
                            m4.select();
                            m4.select( { label: "starred" } );

                            selectManyCollection = new SelectManyCollection( [m1, m2, m3] );
                            events = getEventSpies( [m1, m2, m3, m4, selectManyCollection ], ["selected", "starred"] );

                            selectManyCollection.add( m4 );
                        } );

                        describe( 'model events', function () {

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

                        describe( 'collection events', function () {

                            it( 'should trigger a select:some event, with label "starred" in the event options, for the added model', function () {
                                expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                    selected: [m4],
                                    deselected: []
                                }, selectManyCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:some:starred event for the added model', function () {
                                expect( events.get( selectManyCollection, "select:some:starred" ) ).toHaveBeenCalledWith( {
                                    selected: [m4],
                                    deselected: []
                                }, selectManyCollection, { label: "starred", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:some event, with label "selected" in the event options, for the added model', function () {
                                expect( events.get( selectManyCollection, "select:some" ) ).toHaveBeenCalledWith( {
                                    selected: [m4],
                                    deselected: []
                                }, selectManyCollection, { label: "selected", _externalEvent: "add" } );
                            } );

                            it( 'should trigger a select:some:selected event for the added model', function () {
                                expect( events.get( selectManyCollection, "select:some:selected" ) ).toHaveBeenCalledWith( {
                                    selected: [m4],
                                    deselected: []
                                }, selectManyCollection, { label: "selected", _externalEvent: "add" } );
                            } );

                            it( 'should not trigger more than those four select:some events (including namespaced ones)', function () {
                                expect( events.get( selectManyCollection, "select:some:*" ) ).toHaveCallCount( 4 );
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

    } );

} );