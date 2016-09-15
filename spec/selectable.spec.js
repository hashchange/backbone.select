describe( "selectable model", function () {
    var Model = Backbone.Model.extend( {
        initialize: function ( attributes, options ) {
            Backbone.Select.Me.applyTo( this, options );
        }
    } );

    beforeAll( function () {
        limitJasmineRecursiveScreenOutput();
    } );

    afterAll( function () {
        restoreJasmineRecursiveScreenOutput();
    } );

    describe( 'A selectable model instance should identify itself', function () {
        var model;

        beforeEach( function () {
            model = new Model();
        } );

        it( "as an instance of Backbone.Model", function () {
            expect( model instanceof Backbone.Model ).toBe( true );
        } );

        it( "as 'Backbone.Select.Me' with the _pickyType property", function () {
            expect( model._pickyType ).toBe( "Backbone.Select.Me" );
        } );
    } );

    describe( "when selecting a model", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            spyOn( model, "trigger" ).and.callThrough();

            model.select();
        } );

        it( "should be selected", function () {
            expect( model.selected ).toBe( true );
        } );

        it( "should trigger a selected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { label: "selected" } );
        } );

        it( "should not trigger a reselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );
    } );

    describe( "when selecting a model, with options.silent enabled", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            spyOn( model, "trigger" ).and.callThrough();

            model.select( {silent: true} );
        } );

        it( "should be selected", function () {
            expect( model.selected ).toBe( true );
        } );

        it( "should not trigger a selected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );
    } );

    describe( "when selecting a model that is already selected", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            model.select();
        } );

        it( "should still be selected", function () {
            expect( model.selected ).toBe( true );
        } );

        it( "should not trigger a selected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( "should trigger a reselected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "reselected", model, { label: "selected" } );
        } );
    } );

    describe( "when selecting a model that is already selected, with options.silent enabled", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            model.select( {silent: true} );
        } );

        it( "should still be selected", function () {
            expect( model.selected ).toBe( true );
        } );

        it( "should not trigger a selected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "selected" );
        } );

        it( "should not trigger a reselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );
    } );

    describe( "when deselecting a model that has been selected", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            model.deselect();
        } );

        it( "should not be selected", function () {
            expect( model.selected ).toBe( false );
        } );

        it( "should trigger a deselected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "deselected", model, { label: "selected" } );
        } );
    } );

    describe( "when deselecting a model that has been selected, with options.silent enabled", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            model.deselect( {silent: true} );
        } );

        it( "should not be selected", function () {
            expect( model.selected ).toBe( false );
        } );

        it( "should not trigger a deselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );
    } );

    describe( "when deselecting a model that is not selected", function () {
        var model;

        beforeEach( function () {
            model = new Model();

            spyOn( model, "trigger" ).and.callThrough();
            model.deselect();
        } );

        it( "should not be selected", function () {
            expect( model.selected ).toBeFalsy();
        } );

        it( "should not trigger a deselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "deselected" );
        } );

        it( "should not trigger a reselected event", function () {
            expect( model.trigger ).not.toHaveBeenCalledWithInitial( "reselected" );
        } );
    } );

    describe( "when toggling the selected status of a model that is selected", function () {
        var model;

        beforeEach( function () {
            model = new Model();
            model.select();

            spyOn( model, "trigger" ).and.callThrough();
            model.toggleSelected();
        } );

        it( "should not be selected", function () {
            expect( model.selected ).toBe( false );
        } );

        it( "should trigger a deselected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "deselected", model, { label: "selected" } );
        } );
    } );

    describe( "when toggling the selected status of a model that is not selected", function () {
        var model;

        beforeEach( function () {
            model = new Model();

            spyOn( model, "trigger" ).and.callThrough();
            model.toggleSelected();
        } );

        it( "should be selected", function () {
            expect( model.selected ).toBe( true );
        } );

        it( "should trigger a selected event", function () {
            expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { label: "selected" } );
        } );
    } );

    describe( 'custom options', function () {

        describe( "when selecting a model with a custom option", function () {
            var model;

            beforeEach( function () {
                model = new Model();
                spyOn( model, "trigger" ).and.callThrough();

                model.select( {foo: "bar"} );
            } );

            it( "should trigger a selected event and pass the the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when re-selecting a model with a custom option", function () {
            var model;

            beforeEach( function () {
                model = new Model();
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                model.select( {foo: "bar"} );
            } );

            it( "should trigger a reselected event and pass the the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "reselected", model, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when deselecting a model with a custom option", function () {
            var model;

            beforeEach( function () {
                model = new Model();
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                model.deselect( {foo: "bar"} );
            } );

            it( "should trigger a deselected event and pass the the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "deselected", model, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when toggling the selected status of a model that is selected, with a custom option", function () {
            var model;

            beforeEach( function () {
                model = new Model();
                model.select();

                spyOn( model, "trigger" ).and.callThrough();
                model.toggleSelected( {foo: "bar"} );
            } );

            it( "should trigger a deselected event and pass the the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "deselected", model, { foo: "bar", label: "selected" } );
            } );
        } );

        describe( "when toggling the selected status of a model that is not selected, with a custom option", function () {
            var model;

            beforeEach( function () {
                model = new Model();

                spyOn( model, "trigger" ).and.callThrough();
                model.toggleSelected( {foo: "bar"} );
            } );

            it( "should trigger a selected event and pass the the custom option along in the options object (the last parameter)", function () {
                expect( model.trigger ).toHaveBeenCalledWith( "selected", model, { foo: "bar", label: "selected" } );
            } );
        } );

    } );

    describe( '_silentLocally option', function () {
        var m1, m2, collection, events;

        beforeEach( function () {
            var SelectOneCollection = Backbone.Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Select.One.applyTo( this, models );
                }
            } );

            m1 = new Model();
            m2 = new Model();
            collection = new SelectOneCollection( [m1,m2] );
        } );

        afterEach( function () {
            collection.close();
        } );

        describe( 'When a model is selected with the _silentLocally option', function () {

            beforeEach( function () {
                m2.select();
                events = getEventSpies( [m1, m2, collection] );
                m1.select( { _silentLocally: true } );
            } );

            it( 'should not trigger a "selected" event on the model', function () {
                expect( events.get( m1, "selected" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger a "selected" event on the collection, bubbling up from the model', function () {
                expect( events.get( collection, "selected" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a select:one event on the collection', function () {
                expect( events.get( collection, "select:one" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a "deselected" event on another model which has been deselected in the process', function () {
                expect( events.get( m2, "deselected" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a deselect:one event on the collection, for another model which has been deselected in the process', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledOnce();
            } );

            it( 'should trigger a "deselected" event on the collection, bubbling up from the model which had been deselected in the process', function () {
                expect( events.get( collection, "deselected" ) ).toHaveBeenCalledOnce();
            } );

        } );

        describe( 'When a model is deselected with the _silentLocally option', function () {

            beforeEach( function () {
                m1.select();
                events = getEventSpies( [m1, collection] );
                m1.deselect( { _silentLocally: true } );
            } );

            it( 'should not trigger a "deselected" event on the model', function () {
                expect( events.get( m1, "deselected" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger a "deselected" event on the collection, bubbling up from the model', function () {
                expect( events.get( collection, "deselected" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a deselect:one event on the collection', function () {
                expect( events.get( collection, "deselect:one" ) ).toHaveBeenCalledOnce();
            } );

        } );

        describe( 'When a model is reselected with the _silentLocally option', function () {

            beforeEach( function () {
                m1.select();
                events = getEventSpies( [m1, collection] );
                m1.select( { _silentLocally: true } );
            } );

            it( 'should not trigger a "reselected" event on the model', function () {
                expect( events.get( m1, "reselected" ) ).not.toHaveBeenCalled();
            } );

            it( 'should not trigger a "reselected" event on the collection, bubbling up from the model', function () {
                expect( events.get( collection, "reselected" ) ).not.toHaveBeenCalled();
            } );

            it( 'should trigger a reselect:one event on the collection', function () {
                expect( events.get( collection, "reselect:one" ) ).toHaveBeenCalledOnce();
            } );

        } );

    } );

    describe( 'automatic invocation of onSelect, onDeselect, onReselect handlers', function () {
        var EventHandlingModel, model;

        beforeEach( function () {

            EventHandlingModel = Model.extend( {
                onSelect: function () {},
                onDeselect: function () {},
                onReselect: function () {},

                // Pseudo event handlers modeled on internal events `_selected`,
                // `_deselected`; should not be invoked automatically
                on_select: function () {},
                on_deselect: function () {},

                // Pseudo event handlers modeled on standard Backbone events `add`,
                // `remove`, `change`, `all` (as stand-ins for all others) ; should
                // not be invoked automatically
                onAdd: function () {},
                onRemove: function () {},
                onChange: function () {},
                onAll: function () {}
            } );

            model = new EventHandlingModel();

            spyOn( model, "onSelect" ).and.callThrough();
            spyOn( model, "onDeselect" ).and.callThrough();
            spyOn( model, "onReselect" ).and.callThrough();

            spyOn( model, "on_select" ).and.callThrough();
            spyOn( model, "on_deselect" ).and.callThrough();

            spyOn( model, "onAdd" ).and.callThrough();
            spyOn( model, "onRemove" ).and.callThrough();
            spyOn( model, "onChange" ).and.callThrough();
            spyOn( model, "onAll" ).and.callThrough();
        } );

        it( 'calls the onSelect handler when triggering a selected event on the model', function () {
            model.trigger( "selected", model, {foo: "bar"} );
            expect( model.onSelect ).toHaveBeenCalledWith( model, {foo: "bar"} );
        } );

        it( 'calls the onDeselect handler when triggering a deselected event on the model', function () {
            model.trigger( "deselected", model, {foo: "bar"} );
            expect( model.onDeselect ).toHaveBeenCalledWith( model, {foo: "bar"} );
        } );

        it( 'calls the onReselect handler when triggering a reselected event on the model', function () {
            model.trigger( "reselected", model, {foo: "bar"} );
            expect( model.onReselect ).toHaveBeenCalledWith( model, {foo: "bar"} );
        } );

        it( 'does not call an event handler accidentally named after the internal _selected event', function () {
            model.trigger( "_selected", model );
            expect( model.on_select ).not.toHaveBeenCalled();
        } );

        it( 'does not call an event handler accidentally named after the internal _deselected event', function () {
            model.trigger( "_deselected", model );
            expect( model.on_deselect ).not.toHaveBeenCalled();
        } );

        it( 'does not automatically call an event handler named after a standard Backbone event (e.g. onAdd)', function () {
            model.trigger( "add", model );
            model.trigger( "remove", model );
            model.trigger( "change" );
            model.trigger( "all", model );
            expect( model.onAdd ).not.toHaveBeenCalled();
            expect( model.onRemove ).not.toHaveBeenCalled();
            expect( model.onChange ).not.toHaveBeenCalled();
            expect( model.onAll ).not.toHaveBeenCalled();
        } );
    } );

    describe( 'Chaining', function () {
        var model;

        beforeEach( function () {
            model = new Model();
        } );

        describe( 'The model is returned', function () {

            it( 'when calling select() on an unselected model', function () {
                expect( model.select() ).toBe( model );
            } );

            it( 'when calling select() on a selected model', function () {
                model.select();
                expect( model.select() ).toBe( model );
            } );

            it( 'when calling deselect() on an unselected model', function () {
                expect( model.deselect() ).toBe( model );
            } );

            it( 'when calling deselect() on a selected model', function () {
                model.select();
                expect( model.deselect() ).toBe( model );
            } );

            it( 'when calling toggleSelected() on an unselected model', function () {
                expect( model.toggleSelected() ).toBe( model );
            } );

            it( 'when calling toggleSelect() on a selected model', function () {
                model.select();
                expect( model.toggleSelected() ).toBe( model );
            } );

        } );

    } );

    describe( 'Mixin is protected from modification', function () {
        var m1, m2;

        beforeEach( function () {
            m1 = new Model();
            m2 = new Model();
        } );

        it( 'when overwriting the select() method on one model, the select method of another model stays intact', function () {
            m1.select = function () {};
            m2.select();
            expect( m2.selected ).toBe( true );
        } );
    } );

    describe( 'Works with nested inheritance hierarchies', function () {
        var Model, ModelSubtype, model;

        beforeEach( function () {
            Model = Backbone.Model.extend();

            ModelSubtype = Model.extend( {
                initialize: function () {
                    Backbone.Select.Me.applyTo( this );
                }
            } );

            model = new ModelSubtype();
        } );

        it( 'A selection works as intended', function () {
            model.select();
            expect( model.selected ).toBe( true );
        } );

        it( 'A deselection works as intended', function () {
            model.select();
            model.deselect();
            expect( model.selected ).toBe( false );
        } );
    } );

} );
