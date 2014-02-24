// --- Logger ---

var Logger = function () {
    this.reset();
};

_.extend( Logger.prototype, {
    log: function ( content ) {
        this.entries.push( content );
    },
    reset: function () {
        this.entries = [];
    }
} );


// --- ListenerMixin ---

var ListenerMixin = function ( observableNames, takeSnapshotMethod ) {

    var createContainer = function () {
        var container = {
            calls: 0
        };
        _.each( observableNames, function ( name ) {
            container[name] = {}
        } );

        return container;
    };

    this.snapshots = {
        onSelected: _.extend( {}, createContainer() ),
        onDeselected: _.extend( {}, createContainer() ),
        onSelectOne: _.extend( {}, createContainer() ),
        onDeselectOne: _.extend( {}, createContainer() ),
        onSelectNone: _.extend( {}, createContainer() ),
        onSelectSome: _.extend( {}, createContainer() ),
        onSelectAll: _.extend( {}, createContainer() )
    };

    this.takeSnapshot = takeSnapshotMethod;
};

_.extend( ListenerMixin.prototype, {

    bindEvents: function () {
        this.listenTo( this, "selected", this.captureOnSelected );
        this.listenTo( this, "deselected", this.captureOnDeselected );
        this.listenTo( this, "select:one", this.captureOnSelectOne );
        this.listenTo( this, "deselect:one", this.captureOnDeselectOne );
        this.listenTo( this, "select:none", this.captureOnSelectNone );
        this.listenTo( this, "select:some", this.captureOnSelectSome );
        this.listenTo( this, "select:all", this.captureOnSelectAll );
        _.bindAll( this, "takeSnapshot" );
    },

    captureOnSelected: function () {
        this.takeSnapshot( this.snapshots.onSelected );
    },

    captureOnDeselected: function () {
        this.takeSnapshot( this.snapshots.onDeselected );
    },

    captureOnSelectOne: function () {
        this.takeSnapshot( this.snapshots.onSelectOne );
    },

    captureOnDeselectOne: function () {
        this.takeSnapshot( this.snapshots.onDeselectOne );
    },

    captureOnSelectNone: function () {
        this.takeSnapshot( this.snapshots.onSelectNone );
    },

    captureOnSelectSome: function () {
        this.takeSnapshot( this.snapshots.onSelectSome );
    },

    captureOnSelectAll: function () {
        this.takeSnapshot( this.snapshots.onSelectAll );
    },

    takeSnapshot: function ( container ) {

        // Implement takeSnapshot as suggested in the section below and add to
        // the prototype.

        // NB doCapture: just a suggested name. Use some var which is in scope, a
        // boolean, to activate the capturing.

        //noinspection JSUnresolvedVariable
        if ( doCapture ) {
            container.calls++;

//          container.model1.selected = model1.selected;
//          container.model2.selected = model2.selected;
//          container.someSingleSelectCollection.selected = someSingleSelectCollection.selected;
//          container.someMultiSelectCollection.selected = _.clone( someMultiSelectCollection.selected );
        }

    }
} );

ListenerMixin.applyTo = function ( hostObject, observableNames, takeSnapshotMethod ) {
    Backbone.Select.Me.applyTo( this );
    _.extend( hostObject, new ListenerMixin( observableNames, takeSnapshotMethod ) );
    hostObject.bindEvents();
};


// --- Custom Matchers ---

beforeEach( function () {

    this.addMatchers( {

        /**
         * Matcher that checks to see if the actual, a Jasmine spy, was called with
         * parameters beginning with a specific set.
         *
         * @example
         *
         *     spyOn(obj, "foo");
         *     obj.foo(1, 2, 3);
         *     expect(obj.foo).toHaveBeenCalledWithInitial(1, 2);     // => true
         */
        toHaveBeenCalledWithInitial: function () {
            var expectedArgs = jasmine.util.argsToArray( arguments );
            if ( !jasmine.isSpy( this.actual ) ) {
                throw new Error( 'Expected a spy, but got ' + jasmine.pp( this.actual ) + '.' );
            }
            this.message = function () {
                var invertedMessage = "Expected spy " + this.actual.identity + " not to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but it was.";
                var positiveMessage = "";
                if ( this.actual.callCount === 0 ) {
                    positiveMessage = "Expected spy " + this.actual.identity + " to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but it was never called.";
                } else {
                    positiveMessage = "Expected spy " + this.actual.identity + " to have been called with initial arguments " + jasmine.pp( expectedArgs ) + " but actual calls were " + jasmine.pp( this.actual.argsForCall ).replace( /^\[ | \]$/g, '' )
                }
                return [positiveMessage, invertedMessage];
            };

            var actualInitial = _.map( this.actual.argsForCall, function ( args ) {
                return args.slice( 0, expectedArgs.length );
            } );
            return this.env.contains_( actualInitial, expectedArgs );
        }

    } );

} );
