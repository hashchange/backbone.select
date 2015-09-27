describe( 'Options: exclusive, for Backbone.Select.Many collections.', function () {

    var Model = Backbone.Model.extend( {
            initialize: function ( attributes, options ) {
                Backbone.Select.Me.applyTo( this, options );
            }
        } ),

        SelectManyCollection = Backbone.Collection.extend( {
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

    var m1, m2, m3, m4, collection, events, eventStates, expected;

    beforeEach( function () {
        m1 = new Model();
        m2 = new Model();
        m3 = new Model();
        m4 = new Model();

        expected = {};
    } );

    describe( 'Calling select() with the `exclusive` option on a collection.', function () {
        
        // NB These tests must work without model sharing being enabled.

        beforeEach( function () {
            collection = new SelectManyCollection( [m1, m2, m3, m4] );

            m1.select();
            m3.select();
        } );

        describe( "When the targeted model hasn't been selected before,", function () {

            beforeEach( function () {
                events = getEventSpies( [m1, m2, m3, m4, collection] );
                eventStates = getEventStateStore( [m1, m2, m3, m4, collection] );

                collection.select( m2, { exclusive: true } );
            } );

            it( 'it selects the model', function () {
                expect( m2.selected ).toBe( true );
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );

            it( 'it triggers a selected event for the model', function () {
                expect( events.get( m2, "selected" ) ).toHaveBeenCalledOnce();
                expect( events.get( m2, "selected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
            } );

            it( 'it triggers the selected event when all models and the collection are updated', function () {
                var event = eventStates.getEvent( m2, "selected" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();

                expected[m2.cid] = m2;
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );

            it( 'it deselects all other selected models', function () {
                expect( m1.selected ).toBe( false );
                expect( m3.selected ).toBe( false );
                expect( m4.selected ).toBeFalsy();
            } );

            it( 'it triggers a deselected event for each of the deselected models', function () {
                expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
            } );

            it( 'it triggers the deselected events when all models and the collection are updated', function () {
                var event;

                expected[m2.cid] = m2;

                // deselected event of m1
                event = eventStates.getEvent( m1, "deselected" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();
                expect( event.stateOf( collection ).selected ).toEqual( expected );

                // deselected event of m3
                event = eventStates.getEvent( m3, "deselected" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );

            it( 'it triggers a select:some event', function () {
                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                    selected: [m2],
                    deselected: [m1, m3]
                }, collection, { exclusive: true, label: "selected" } );
            } );

            it( 'it triggers the select:some event when all models and the collection are updated', function () {
                var event = eventStates.getEvent( collection, "select:some" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();

                expected[m2.cid] = m2;
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );

            it( 'it does not trigger a reselect:any event', function () {
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();
            } );
            
        } );

        describe( 'When the targeted model is already selected,', function () {

            beforeEach( function () {
                m2.select();

                events = getEventSpies( [m1, m2, m3, m4, collection] );
                eventStates = getEventStateStore( [m1, m2, m3, m4, collection] );

                collection.select( m2, { exclusive: true } );
            } );

            it( 'it leaves the model selected', function () {
                expect( m2.selected ).toBe( true );
                expect( collection.selected[m2.cid] ).toBe( m2 );
            } );

            it( 'it triggers a reselected event for the model', function () {
                expect( events.get( m2, "reselected" ) ).toHaveBeenCalledOnce();
                expect( events.get( m2, "reselected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
            } );

            it( 'it triggers the reselected event when all models and the collection are updated', function () {
                var event = eventStates.getEvent( m2, "reselected" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();

                expected[m2.cid] = m2;
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );

            it( 'it deselects all other selected models', function () {
                expect( m1.selected ).toBe( false );
                expect( m3.selected ).toBe( false );
                expect( m4.selected ).toBeFalsy();
            } );

            it( 'it triggers a deselected event for each of the deselected models', function () {
                expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
            } );

            it( 'it triggers the deselected events when all models and the collection are updated', function () {
                var event;

                expected[m2.cid] = m2;

                // deselected event of m1
                event = eventStates.getEvent( m1, "deselected" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();
                expect( event.stateOf( collection ).selected ).toEqual( expected );

                // deselected event of m3
                event = eventStates.getEvent( m3, "deselected" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );

            it( 'it triggers a select:some event', function () {
                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                    selected: [],
                    deselected: [m1, m3]
                }, collection, { exclusive: true, label: "selected" } );
            } );

            it( 'it triggers the select:some event when all models and the collection are updated', function () {
                var event = eventStates.getEvent( collection, "select:some" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();

                expected[m2.cid] = m2;
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );
            
            it( 'it triggers a reselect:any event', function () {
                expect( events.get( collection, "reselect:any" ) ).toHaveBeenCalledOnce();
                expect( events.get( collection, "reselect:any" ) ).toHaveBeenCalledWith( [m2], collection, { exclusive: true, label: "selected" } );
            } );

            it( 'it triggers the reselect:any event when all models and the collection are updated', function () {
                var event = eventStates.getEvent( collection, "reselect:any" );
                expect( event.stateOf( m1 ).selected ).toBe( false );
                expect( event.stateOf( m2 ).selected ).toBe( true );
                expect( event.stateOf( m3 ).selected ).toBe( false );
                expect( event.stateOf( m4 ).selected ).toBeFalsy();

                expected[m2.cid] = m2;
                expect( event.stateOf( collection ).selected ).toEqual( expected );
            } );

        } );

        describe( 'It triggers a select:some event, and no other select:* event,', function () {

            it( 'when all models of the collection had been selected before', function () {
                collection.selectAll();

                events = getEventSpies( [m1, m2, m3, m4, collection] );
                eventStates = getEventStateStore( [m1, m2, m3, m4, collection] );

                collection.select( m2, { exclusive: true } );

                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                    selected: [],
                    deselected: [m1, m3, m4]
                }, collection, { exclusive: true, label: "selected" } );

                expect( events.get( collection, "select:none" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all" ) ).not.toHaveBeenCalled();
            } );

            it( 'when no models of the collection had been selected before', function () {
                collection.deselectAll();

                events = getEventSpies( [m1, m2, m3, m4, collection] );
                eventStates = getEventStateStore( [m1, m2, m3, m4, collection] );

                collection.select( m2, { exclusive: true } );

                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledOnce();
                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                    selected: [m2],
                    deselected: []
                }, collection, { exclusive: true, label: "selected" } );

                expect( events.get( collection, "select:none" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all" ) ).not.toHaveBeenCalled();
            } );

        } );
        
    } );

    describe( 'Calling select() with the `exclusive` option on a model.', function () {

        // NB These tests must work without model sharing being enabled. Model sharing is tested separately in the
        // interaction specs, below.

        beforeEach( function () {
            collection = new SelectManyCollection( [m1, m2, m3, m4] );

            m1.select();
            m3.select();

            events = getEventSpies( [m1, m2, m3, m4, collection] );
            eventStates = getEventStateStore( [m1, m2, m3, m4, collection] );

            m2.select( { exclusive: true } );
        } );

        it( 'it selects the model', function () {
            expect( m2.selected ).toBe( true );
            expect( collection.selected[m2.cid] ).toBe( m2 );
        } );

        it( 'it triggers a selected event for the model', function () {
            expect( events.get( m2, "selected" ) ).toHaveBeenCalledOnce();
            expect( events.get( m2, "selected" ) ).toHaveBeenCalledWith( m2, { exclusive: true, label: "selected" } );
        } );

        it( 'it triggers the selected event when all models and the collection are updated', function () {
            var event = eventStates.getEvent( m2, "selected" );
            expect( event.stateOf( m1 ).selected ).toBe( false );
            expect( event.stateOf( m2 ).selected ).toBe( true );
            expect( event.stateOf( m3 ).selected ).toBe( false );
            expect( event.stateOf( m4 ).selected ).toBeFalsy();

            expected[m2.cid] = m2;
            expect( event.stateOf( collection ).selected ).toEqual( expected );
        } );

        it( 'it deselects all other selected models', function () {
            expect( m1.selected ).toBe( false );
            expect( m3.selected ).toBe( false );
            expect( m4.selected ).toBeFalsy();
        } );

        it( 'it triggers a deselected event for each of the deselected models', function () {
            expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
            expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
        } );

        it( 'it triggers the deselected events when all models and the collection are updated', function () {
            var event;

            expected[m2.cid] = m2;

            // deselected event of m1
            event = eventStates.getEvent( m1, "deselected" );
            expect( event.stateOf( m1 ).selected ).toBe( false );
            expect( event.stateOf( m2 ).selected ).toBe( true );
            expect( event.stateOf( m3 ).selected ).toBe( false );
            expect( event.stateOf( m4 ).selected ).toBeFalsy();
            expect( event.stateOf( collection ).selected ).toEqual( expected );

            // deselected event of m3
            event = eventStates.getEvent( m3, "deselected" );
            expect( event.stateOf( m1 ).selected ).toBe( false );
            expect( event.stateOf( m2 ).selected ).toBe( true );
            expect( event.stateOf( m3 ).selected ).toBe( false );
            expect( event.stateOf( m4 ).selected ).toBeFalsy();
            expect( event.stateOf( collection ).selected ).toEqual( expected );
        } );

        it( 'it triggers a select:some event', function () {
            expect( events.get( collection, "select:some" ) ).toHaveBeenCalledOnce();
            expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( {
                selected: [m2],
                deselected: [m1, m3]
            }, collection, { exclusive: true, label: "selected" } );
        } );

        it( 'it triggers the select:some event when all models and the collection are updated', function () {
            var event = eventStates.getEvent( collection, "select:some" );
            expect( event.stateOf( m1 ).selected ).toBe( false );
            expect( event.stateOf( m2 ).selected ).toBe( true );
            expect( event.stateOf( m3 ).selected ).toBe( false );
            expect( event.stateOf( m4 ).selected ).toBeFalsy();

            expected[m2.cid] = m2;
            expect( event.stateOf( collection ).selected ).toEqual( expected );
        } );

        it( 'it does not trigger a reselect:any event', function () {
            expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();
        } );

    } );

    describe( 'Interaction between Select.Many collections sharing some models.', function () {
        var otherCollection;

        beforeEach( function () {
            collection = new SelectManyCollection( [m1, m2], { enableModelSharing: true } );
            otherCollection = new SelectManyCollection( [m1, m2, m3], { enableModelSharing: true } );

            m1.select();
            m3.select();
        } );

        describe( 'When calling select() with the exclusive option on one collection,', function () {

            beforeEach( function () {
                collection.select( m2, { exclusive: true } );
            } );

            it( 'it selects the model exclusively in that collection, deselecting all other models there', function () {
                expect( m1.selected ).toBe( false );

                expected[m2.cid] = m2;
                expect( collection.selected ).toEqual( expected );
            } );

            it( 'it does not deselect models in another collection which are not shared with the first collection', function () {
                // The `exclusive` option is local to the collection where it is used; otherCollection is unaffected by
                // the exclusive option, so model m3 - which is not shared - stays selected.
                //
                // Model m1, however, is shared with the first collection, and hence is deselected.
                expect( m1.selected ).toBe( false );
                expect( m3.selected ).toBe( true );

                expected[m2.cid] = m2;
                expected[m3.cid] = m3;
                expect( otherCollection.selected ).toEqual( expected );
            } );
            
        } );

        describe( 'When calling select() with the exclusive option on a model, rather than a collection,', function () {

            beforeEach( function () {
                m2.select( { exclusive: true } );
            } );

            it( 'it does deselect all other models in Select.Many collections, even the models which are not shared between them', function () {

                // This is a trick, a way to make the exclusive option work across multiple collections.
                //
                // The `exclusive` option is supposed to be local to the Select.Many collection where it is invoked.
                // Here, though, the origin of the option is the model. So the option is passed on to all collections
                // holding it, and they act accordingly.

                // The `exclusive` option is no longer local to just one collection; in otherCollection, m3 is deselected
                expect( m3.selected ).toBe( false );

                expected[m2.cid] = m2;
                expect( otherCollection.selected ).toEqual( expected );

                // Likewise, in the originating collection, the exclusive option deselects m1
                expect( m1.selected ).toBe( false );

                expected = {};
                expected[m2.cid] = m2;
                expect( collection.selected ).toEqual( expected );
            } );

        } );

    } );

    describe( 'Custom label support.', function () {

        beforeEach( function () {
            collection = new SelectManyCollection( [m1, m2, m3, m4] );

            m1.select();
            m1.select( { label: "starred" } );
            m3.select();
            m4.select( { label: "starred" } );
        } );

        describe( 'Calling select() with the `exclusive` option and a custom label on a collection', function () {

            beforeEach( function () {
                collection.select( m2, { label: "starred", exclusive: true } );
            } );

            it( 'selects the model with that label', function () {
                expect( m2.starred ).toBe( true );

                expected[m2.cid] = m2;
                expect( collection.starred ).toEqual( expected );
            } );

            it( 'deselects all other selected models with that label', function () {
                expect( m1.starred ).toBe( false );
                expect( m3.starred ).toBeFalsy();
                expect( m4.starred ).toBe( false );

                expected[m2.cid] = m2;
                expect( collection.starred ).toEqual( expected );
            } );

            it( 'does not select the model with the default label', function () {
                expect( m2.selected ).toBeFalsy();
            } );

            it( 'does not deselect other models selected with the default label', function () {
                expect( m1.selected ).toBe( true );
                expect( m3.selected ).toBe( true );
                expect( m4.selected ).toBeFalsy();

                expected[m1.cid] = m1;
                expected[m3.cid] = m3;
                expect( collection.selected ).toEqual( expected );
            } );

        } );

        describe( 'Calling select() with the `exclusive` option and a custom label on a model', function () {

            beforeEach( function () {
                m2.select( { label: "starred", exclusive: true } );
            } );

            it( 'selects the model with that label', function () {
                expect( m2.starred ).toBe( true );

                expected[m2.cid] = m2;
                expect( collection.starred ).toEqual( expected );
            } );

            it( 'deselects all other selected models with that label', function () {
                expect( m1.starred ).toBe( false );
                expect( m3.starred ).toBeFalsy();
                expect( m4.starred ).toBe( false );

                expected[m2.cid] = m2;
                expect( collection.starred ).toEqual( expected );
            } );

            it( 'does not select the model with the default label', function () {
                expect( m2.selected ).toBeFalsy();
            } );

            it( 'does not deselect other models selected with the default label', function () {
                expect( m1.selected ).toBe( true );
                expect( m3.selected ).toBe( true );
                expect( m4.selected ).toBeFalsy();

                expected[m1.cid] = m1;
                expected[m3.cid] = m3;
                expect( collection.selected ).toEqual( expected );
            } );

        } );

    } );

    describe( 'The `exclusive` option is ignored when passed to any other Select.Many method.', function () {
        var m5;

        beforeEach( function () {
            m5 = new Model();
            collection = new SelectManyCollection( [m1, m2, m3, m4, m5] );

            m1.select();
            m3.select();
            m5.select();

            events = getEventSpies( [m1, m2, m3, m4, m5, collection] );
            eventStates = getEventStateStore( [m1, m2, m3, m4, m5, collection] );
        } );

        describe( 'When calling deselect() on the collection for a model which had been selected,', function () {

            beforeEach( function () {
                collection.deselect( m3, { exclusive: true } );
            } );

            it( 'it does not change the outcome', function () {
                expect( m1.selected ).toBe( true );
                expect( m2.selected ).toBeFalsy();
                expect( m3.selected ).toBe( false );
                expect( m4.selected ).toBeFalsy();
                expect( m5.selected ).toBe( true );

                expected[m1.cid] = m1;
                expected[m5.cid] = m5;
                expect( collection.selected ).toEqual( expected );
            } );

            it( 'it does not change the fired events', function () {
                expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
                expect( events.get( m3, "deselected:selected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
                expect( events.get( m3, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( collection, "select:some" ) ).toHaveBeenCalledWith( { selected: [], deselected: [m3] }, collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "select:some:selected" ) ).toHaveBeenCalledWith( { selected: [], deselected: [m3] }, collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "select:some:*" ) ).toHaveCallCount( 2 );
                expect( events.get( collection, "select:none:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();

                expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m5, "*" ) ).not.toHaveBeenCalled();
            } );

            it( 'it does not change the state captured by these events, ie they fire at the end', function () {
                expected[m1.cid] = m1;
                expected[m5.cid] = m5;

                expect( eventStates.getEvent( m3, "deselected" ).stateOf( m3 ).selected ).toBe( false );
                expect( eventStates.getEvent( m3, "deselected" ).stateOf( collection ).selected ).toEqual( expected );

                expect( eventStates.getEvent( collection, "select:some" ).stateOf( m3 ).selected ).toBe( false );
                expect( eventStates.getEvent( collection, "select:some" ).stateOf( collection ).selected ).toEqual( expected );
            } );

        } );

        describe( 'When calling deselect() on the collection for a model which had not been selected,', function () {

            beforeEach( function () {
                collection.deselect( m2, { exclusive: true } );
            } );

            it( 'it does not change the outcome', function () {
                expect( m1.selected ).toBe( true );
                expect( m2.selected ).toBeFalsy();
                expect( m3.selected ).toBe( true );
                expect( m4.selected ).toBeFalsy();
                expect( m5.selected ).toBe( true );

                expected[m1.cid] = m1;
                expected[m3.cid] = m3;
                expected[m5.cid] = m5;
                expect( collection.selected ).toEqual( expected );
            } );

            it( 'it does not change the fired events (none fired at all)', function () {
                expect( events.get( collection, "select:some:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:none:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();

                expect( events.get( m1, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m3, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m5, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( 'When calling selectAll() on the collection,', function () {

            beforeEach( function () {
                collection.selectAll( { exclusive: true } );
            } );

            it( 'it does not change the outcome', function () {
                expect( m1.selected ).toBe( true );
                expect( m2.selected ).toBe( true );
                expect( m3.selected ).toBe( true );
                expect( m4.selected ).toBe( true );
                expect( m5.selected ).toBe( true );

                expected[m1.cid] = m1;
                expected[m2.cid] = m2;
                expected[m3.cid] = m3;
                expected[m4.cid] = m4;
                expected[m5.cid] = m5;
                expect( collection.selected ).toEqual( expected );
            } );

            it( 'it does not change the fired events', function () {
                expect( events.get( m2, "selected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                expect( events.get( m2, "selected:selected" ) ).toHaveBeenCalledWith( m2, { label: "selected" } );
                expect( events.get( m2, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( m4, "selected" ) ).toHaveBeenCalledWith( m4, { label: "selected" } );
                expect( events.get( m4, "selected:selected" ) ).toHaveBeenCalledWith( m4, { label: "selected" } );
                expect( events.get( m4, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( m1, "reselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                expect( events.get( m1, "reselected:selected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                expect( events.get( m1, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( m3, "reselected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
                expect( events.get( m3, "reselected:selected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
                expect( events.get( m3, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( m5, "reselected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                expect( events.get( m5, "reselected:selected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                expect( events.get( m5, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( collection, "select:all" ) ).toHaveBeenCalledWith( { selected: [m2, m4], deselected: [] }, collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "select:all:selected" ) ).toHaveBeenCalledWith( { selected: [m2, m4], deselected: [] }, collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "select:all:*" ) ).toHaveCallCount( 2 );
                expect( events.get( collection, "reselect:any" ) ).toHaveBeenCalledWith( [m1, m3, m5], collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "reselect:any:selected" ) ).toHaveBeenCalledWith( [m1, m3, m5], collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "reselect:any:*" ) ).toHaveCallCount( 2 );
                expect( events.get( collection, "select:none:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:some:*" ) ).not.toHaveBeenCalled();
            } );

        } );

        describe( 'When calling deselectAll() on the collection,', function () {

            beforeEach( function () {
                collection.deselectAll( { exclusive: true } );
            } );

            it( 'it does not change the outcome', function () {
                expect( m1.selected ).toBe( false );
                expect( m2.selected ).toBeFalsy();
                expect( m3.selected ).toBe( false );
                expect( m4.selected ).toBeFalsy();
                expect( m5.selected ).toBe( false );

                expect( collection.selected ).toEqual( {} );
            } );

            it( 'it does not change the fired events', function () {
                expect( events.get( m1, "deselected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                expect( events.get( m1, "deselected:selected" ) ).toHaveBeenCalledWith( m1, { label: "selected" } );
                expect( events.get( m1, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( m3, "deselected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
                expect( events.get( m3, "deselected:selected" ) ).toHaveBeenCalledWith( m3, { label: "selected" } );
                expect( events.get( m3, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( m5, "deselected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                expect( events.get( m5, "deselected:selected" ) ).toHaveBeenCalledWith( m5, { label: "selected" } );
                expect( events.get( m5, "*" ) ).toHaveCallCount( 2 );

                expect( events.get( collection, "select:none" ) ).toHaveBeenCalledWith( { selected: [], deselected: [m1, m3, m5] }, collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "select:none:selected" ) ).toHaveBeenCalledWith( { selected: [], deselected: [m1, m3, m5] }, collection, { exclusive: true, label: "selected" } );
                expect( events.get( collection, "select:none:*" ) ).toHaveCallCount( 2 );
                expect( events.get( collection, "select:some:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "select:all:*" ) ).not.toHaveBeenCalled();
                expect( events.get( collection, "reselect:any" ) ).not.toHaveBeenCalled();

                expect( events.get( m2, "*" ) ).not.toHaveBeenCalled();
                expect( events.get( m4, "*" ) ).not.toHaveBeenCalled();
            } );

        } );

    } );

} );