# Backbone.Select

Backbone.Cycle is a set of mixins for Backbone models and collections. Models gain the ability to be selected, and collections handle those selections.

Collections either allow only a single model to be selected ([Backbone.Select.One][] mixin), or cater for multiple selections ([Backbone.Select.Many][]). Events communicate selections and deselections to other parts of your application. In [model-sharing mode][sharing], models can be part of more than one collection. Backbone.Select will keep selections of shared models in sync and guarantee consistency in even the most complex scenarios.

Backbone.Select is [compatible with Backbone.Picky][picky-compatibility]. For a superset of Backbone.Select with additional features, have a look at [Backbone.Cycle][].

#### Outline

- [Introductory example](#an-introductory-example)
- [Dependencies and setup](#dependencies-and-setup)
- [Basic model and collection interaction](#basic-model-and-collection-interaction)
- [Backbone.Select.Me: Making models selectable](#backboneselectme-making-models-selectable)
    * [Basic usage](#basic-usage)
    * [Methods](#backboneselectme-methods): [`select`](#modelselect-options-), [`deselect`](#modeldeselect-options-), [`toggleSelected`](#modeltoggleselected-options-)
    * [Property](#backboneselectme-properties): [`selected`](#modelselected)
    * [Events](#backboneselectme-events): ["selected"](#selected), ["deselected"](#deselected), ["reselected"](#reselected)
- [Backbone.Select.One: a single-select collection](#backboneselectone-a-single-select-collection)
    * [Basic usage](#basic-usage-1)
    * [Methods](#backboneselectone-methods): [`select`](#collectionselect-model-options-), [`deselect`](#collectiondeselect-model-options-)
    * [Property](#backboneselectone-properties): [`selected`](#collectionselected)
    * [Events](t#backboneselectone-events): ["select:one"](#selectone), ["deselect:one"](#deselectone), ["reselect:one"](#reselectone)
- [Backbone.Select.Many: a multi-select collection](#backboneselectmany-a-multi-select-collection)
    * [Basic usage](#basic-usage-2)
    * [Methods](#backboneselectmany-methods): [`select`](#collectionselect-model-options--1), [`deselect`](#collectiondeselect-model-options--1), [`selectAll`](#collectionselectall-options-), [`deselectAll`](#collectiondeselectall-options-), [`toggleSelectAll`](#collectiontoggleselectall-options-)
    * [Properties](#backboneselectmany-properties): [`selected`](#collectionselected-1), [`selectedLength`](#collectionselectedlength)
    * [Events](#backboneselectmany-events): ["select:all"](#selectall), ["select:none"](#selectnone), ["select:some"](#selectsome), ["reselect:any"](#reselectany)
- [Sharing models among collections](#sharing-models-among-collections)
- [Custom options](#custom-options)
- [Compatibility with Backbone's own select method](#compatibility-with-backbones-own-select-method)
- [Compatibility with Backbone.Picky](#compatibility-with-backbonepicky)
- [Build process and tests](#build-process-and-tests), [release notes](#release-notes), [credits, copyright, MIT license](#credits-copyright-mit-license)

## An introductory example

Perhaps the best way to explain what Backbone.Select does, before getting into the details, is an example.

```javascript
var Model = Backbone.Model.extend({
  initialize: function () {
    // Applies the mixin:
    Backbone.Select.Me.applyTo( this );
  }
});

// A collection type allowing only one selection at a time
var Collection = Backbone.Collection.extend({
  initialize: function ( models, options ) {
    // Applies the mixin:
    Backbone.Select.One.applyTo( this, models, options );
  }
});

var m1 = new Model( {id: "m1"} ),
    m2 = new Model( {id: "m2"} ),
    m3 = new Model( {id: "m3"} );

var collection = new Collection( [m1, m2, m3] );

collection.select( m1 );

console.log( collection.selected.id ); // prints "m1"
console.log( m1.selected );            // prints true

collection.on( "select:one", function ( model ) {
  console.log( model.id + " has been selected." );
});
collection.on( "deselect:one", function ( model ) {
  console.log( model.id + " has been deselected." );
});

m2.select();
// prints "m1 has been deselected."
// prints "m2 has been selected."
```

## Dependencies and setup

[Backbone][] is the only dependency. Include backbone.select.js after [Backbone][]. Backbone.Select requires Backbone 0.9.9 or later.

The stable version of Backbone.Select is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install backbone.select`.

## Basic model and collection interaction

In theory, a selectable model could be used on its own, but what purpose would it serve? Models are selected in the context of a collection.

So the mixins are used in tandem: Models are augmented with the Backbone.Select.Me mixin, and stored in Backbone.Select.One or Backbone.Select.Many collections. All models in a Backbone.Select collection must have the Backbone.Select.Me mixin applied to them.

Selections can be made with model or collection methods. Model and collection will keep each other in sync. Thus, if `model` is part of `collection`, `model.select()` and `collection.select( model )` are equivalent.

## Backbone.Select.Me: Making models selectable

Adds methods for selecting and deselecting a model. Tracks whether or not the model is selected, and triggers events when the selection changes.

### Basic usage

To create a selectable model type, apply the mixin in its `initialize` method. Assuming your base type is `Backbone.Model`, augment it with

```js
SelectableModel = Backbone.Model.extend({
  initialize: function () {
    Backbone.Select.Me.applyTo( this );
  }
});
```

Replace `Backbone.Model` in the example above with whatever base type you work with.

### Backbone.Select.Me methods

The following methods are added to a model by the `Select.Me` mixin.

#### model.select( [options] )

Selects a model. It sets the model's `selected` property to true and triggers a "selected" event.

```js
var myModel = new SelectableModel({ id: "foo" });

myModel.on( "selected", function ( model ) {
  console.log( "I am model " + model.id + " and just got selected." );
});

myModel.select(); // => prints "I am model foo and just got selected."
myModel.selected; // => true
```

The `select` method can be called with the `{silent: true}` option to prevent selection-related events from firing. See the [events section][select.me-events] below.

If the model has already been selected, selecting it again does not affect its state, and a "selected" event is not triggered. A "reselected" event is triggered instead.

#### model.deselect( [options] )

Deselects a model. It sets the model's `selected` property to false and triggers a "deselected" event.

```js
var myModel = new SelectableModel({ id: "foo" });

myModel.on( "deselected", function ( model ){
  console.log( "I am model " + model.id + " and just got deselected." );
});

// A model must be selected for `deselect` to have any effect.
myModel.select();

myModel.deselect(); // => prints "I am model foo and just got deselected."
myModel.selected;   // => false
```

The `deselect` method supports the `silent` option. If a model is not selected, deselecting it is a no-op and does not trigger a "deselected" event.

#### model.toggleSelected( [options] )

Toggles the selection state between selected and deselected. Calls either the `select` or `deselect` method, which does the actual work.

```js
var myModel = new SelectableModel();

myModel.on( "selected", function () {
  console.log( "I am selected." );
});

myModel.on( "deselected", function () {
  console.log( "I am no longer selected." );
});

myModel.toggleSelected(); // => prints "I am selected."
myModel.toggleSelected(); // => prints "I am no longer selected."
```

The `toggleSelected` method supports the `silent` option.

### Backbone.Select.Me properties

The following property is managed by the Select.Me mixin.

#### model.selected

Returns a boolean value indicating whether or not the model is currently selected. May be `undefined` instead of false if a model has never been selected.

### Backbone.Select.Me events

The events listed below are are triggered from Select.Me models. They bubble up to the collection, too. Events can be prevented from firing when Backbone.Select methods are called with the `silent` option, as in `myModel.select( {silent: true} )`.

Event handlers with standard names are invoked automatically. Standard names are `onSelect`, `onDeselect`, and `onReselect`. If these methods exist on the model, they are run without having to be wired up with the event manually.

Custom options can be used when invoking any method. See the [section on custom options][custom-options], below.

#### "selected"

Triggered when a model has been selected. Provides the selected model as the first parameter. Runs the `onSelect` event handler if the method exists on the model.

Is not triggered when the model had already been selected and is selected again (without any change in status). That results in a "reselected" event.

#### "deselected"

Triggered when a model has been deselected. Provides the deselected model as the first parameter. Runs the `onDeselect` event handler if the method exists on the model.

#### "reselected"

Triggered when a model, which is already selected, is selected again. Provides the re-selected model as the first parameter. Runs the `onReselect` event handler if the method exists on the model.

## Backbone.Select.One: a single-select collection

Adds methods for selecting and deselecting models to a collection. Tracks which model is selected, and triggers events when the selection changes.

Allows only a single model to be selected within the collection. Selecting another model will cause the first one to be deselected.

Models in a Backbone.Select.One collection must have the `Backbone.Select.Me` mixin applied to them.

### Basic usage

To create a single-select collection type, apply the mixin in the `initialize` method. Assuming your base type is `Backbone.Collection`, augment it with

```js
SingleCollection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models );
  }
});
```

Replace `Backbone.Collection` in the example above with whatever base type you work with.

If you share models among multiple collections, Backbone.Select will handle the interaction for you. You must turn on model-sharing mode explicitly, with the `enableModelSharing` option:

```js
SingleCollection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.One.applyTo( this, models, { enableModelSharing: true } );
  }
});
```

See the [section on model sharing][sharing], below, for more.

### Backbone.Select.One methods

The following methods are added to a collection by the `Select.One` mixin.

#### collection.select( model, [options] )

Selects a model. It stores the selected model in the `selected` property of the collection, and updates the `selected` property of the model as well. Both collection and model fire their respective events for a selection.

```js
myModel = new SelectableModel();
myCollection = new SingleCollection( [myModel] );

myCollection.select( myModel );
```

As [mentioned before][model-collection-interaction], calling `myCollection.select( myModel )` is equivalent in every way to calling `myModel.select()`.

If another model had already been selected, that model is deselected in the process. The events indicating a deselection are also triggered. Combined select-deselect actions are treated as atomic, so all related events - for the selection as well as the deselection - are fired only after the selection and the deselection have already taken place.

Reselecting the same model again will not affect the state of the model or the collection, and events indicating a selection will not be triggered - no "select:one" event for the collection, no "selected" event for the model. Instead, a "reselect:one" event (collection) and a "reselected" event (model) indicate the action.

The `select` method supports the `silent` option.

_Compatibility:_ Backbone collections have a `select` method out of the box, an alias of `filter`. It continues to be accessible, based on its different signature. [See below][select-compatibility].

#### collection.deselect( [model], [options] )

Deselects a model if it had been selected. It removes the model from the `selected` property of the collection, and sets the `selected` property of the model to false as well. Both collection and model fire their respective events for a deselection.

```js
myModel = new SelectableModel();
myCollection = new SingleCollection( [myModel] );

myCollection.deselect( myModel );
```

Again, as [mentioned before][model-collection-interaction], calling `myCollection.deselect( myModel )` is equivalent in every way to calling `myModel.deselect()`.

If the model is not currently selected, this action is a no-op. If you try to deselect a model which is not the currently selected model of the collection, the actual selected model will not be deselected.

You can call `deselect` without a model argument. The currently selected model, if any, will be deselected in that case.

The `deselect` method supports the `silent` option.

### Backbone.Select.One properties

The following property is managed by the Select.One mixin.

#### collection.selected

Returns the model which is currently selected in the collection, or `undefined` if no model is selected.

```js
myCollection = new SingleCollection();
myCollection.select( myModel );

myCollection.selected; // => myModel
```

### Backbone.Select.One events

The events listed below are triggered by Backbone.Select.One based on changes of the selection. Events can be prevented from firing when Backbone.Select methods are called with the `silent` option, as in `collection.select( model, {silent: true} )`.

Event handlers with standard names are invoked automatically. Standard names are `onSelect`, `onDeselect`, and `onReselect`. If these methods exist on the collection, they are run without having to be wired up with the event manually.

Custom options can be used when invoking any method. See the [section on custom options][custom-options], below.

#### "select:one"

Triggered when a model has been selected. Provides the selected model as the first parameter, and the collection as the second. Runs the `onSelect` event handler if the method exists on the collection.

Is not triggered when the model had already been selected and is selected again (without any change in status). That results in a "reselect:one" event.

#### "deselect:one"

Triggered when a model has been deselected. Provides the deselected model as the first parameter, and the collection as the second.. Runs the `onDeselect` event handler if the method exists on the collection.

The event fires when `deselect` has been called explicitly, and also when a model is deselected by selecting another one.

Combined select-deselect actions are treated as atomic, so "deselect:one" fires after both the deselection and the selection have already taken place. That is also the case for any other events related to the transaction, such as the "deselected" and "selected" events on the models involved.

#### "reselect:one"

Triggered when a model, which is already selected, is selected again. Provides the selected model as the first parameter, and the collection as the second. Runs the `onReselect` event handler if the method exists on the collection.

## Backbone.Select.Many: a multi-select collection

Adds methods for selecting and deselecting models to a collection. Tracks which models are selected, and triggers events when the selection changes.

Backbone.Select.Many allows multiple models to be selected in a collection at the same time.

Models in a Backbone.Select.Many collection must have the `Backbone.Select.Me` mixin applied to them.

### Basic usage

To create a multi-select collection type, apply the mixin in the `initialize` method. Assuming your base type is `Backbone.Collection`, augment it with

```js
MultiCollection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.Many.applyTo( this, models );
  }
});
```

Replace `Backbone.Collection` in the example above with whatever base type you work with.

If you share models among multiple collections, Backbone.Select will handle the interaction for you. You must turn on model-sharing mode explicitly, with the `enableModelSharing` option:

```js
MultiCollection = Backbone.Collection.extend({
  initialize: function ( models ) {
    Backbone.Select.Many.applyTo( this, models, { enableModelSharing: true } );
  }
});
```

See the [section on model sharing][sharing], below, for more.

### Backbone.Select.Many methods

The following methods are added to a collection by the `Select.Many` mixin.

#### collection.select( model, [options] )

Selects a model. It stores the selected model in the `selected` list of the collection, and updates the `selected` property of the model as well. Both collection and model fire their respective events for a selection.

```js
myModel = new SelectableModel();
myCollection = new MultiCollection( [myModel] );

myCollection.select( myModel );
```

As [mentioned before][model-collection-interaction], calling `myCollection.select( myModel )` is equivalent in every way to calling `myModel.select()`.

Reselecting the same model again will not affect the state of the model or the collection, and events indicating a selection will not be triggered - no "select:some" or "select:all" event for the collection, no "selected" event for the model. Instead, a "reselect:any" event (collection) and a "reselected" event (model) indicate the action.

The `select` method supports the `silent` option.

_Compatibility:_ Backbone collections have a `select` method out of the box, an alias of `filter`. It continues to be accessible, based on its different signature. [See below][select-compatibility].

#### collection.deselect( model, [options] )

Deselects a model if it had been selected. It removes the model from the `selected` list of the collection, and sets the `selected` property of the model to false as well. Both collection and model fire their respective events for a deselection.

```js
myModel = new SelectableModel();
myCollection = new MultiCollection( [myModel] );

myCollection.deselect( myModel );
```

If the model is not currently selected, this action is a no-op.

The `deselect` method supports the `silent` option.

#### collection.selectAll( [options] )

Selects all models in the collection. Fires collection and model events indicating the change, and separate events for any re-selections. See the [events section][select.many-events] below.

```js
myCollection.selectAll();
```

The `selectAll` method supports the `silent` option.

#### collection.deselectAll( [options] )

Deselects all models in the collection. Fires collection and model events indicating the change. See the [events section][select.many-events] below.

```js
myCollection.deselectAll();
```

The `deselectAll` method supports the `silent` option.

#### collection.toggleSelectAll( [options] )

Selects all models in the collection. If that is already the case and all models are selected, they are deselected instead. Fires collection and model events indicating the change, and separate events for any re-selections. See the [events section][select.many-events] below.

```js
myCollection = new MultiCollection( models );

myCollection.toggleSelectAll(); // selects all models in the collection
myCollection.toggleSelectAll(); // deselects all models in the collection
```

The following rules apply when toggling:

* If no models are selected, select them all.
* If some models are selected, but not all of them, select them all.
* If all models are selected, deselect them all.

The `toggleSelectAll` method supports the `silent` option.

### Backbone.Select.Many properties

The following properties are managed by the Select.Many mixin.

#### collection.selected

Returns a hash of the selected models. The `cid` of the models serve as the keys. Returns an empty object, `{}`, if no models are selected.

```js
myCollection = new MultiCollection( [model1, model2] );
myCollection.select( model1 );

myCollection.selected; // => { "c1": model1 }

// Select an additional model
myCollection.select( model2 );

myCollection.selected; // => { "c1": model1, "c2": model2 }
```

#### collection.selectedLength

Stores the number of selected items in the collection. Equivalent to calling `_.size( myCollection.selected )`.

```js
myCollection = new MultiCollection();
myCollection.select( model );

myCollection.selectedLength; // => 1
```

### Backbone.Select.Many events

The events below are triggered by Backbone.Select.Many based on changes of the selection. Events can be prevented from firing when Backbone.Select methods are called with the `silent` option, as in `collection.select( model, {silent: true} )`.

Select.Many events, with the exception of `reselect:any`, pass a "diff" hash to event handlers as the first parameter: `{ selected: [...], deselected: [...] }`. The `selected` array holds models which have been newly selected by the action triggering the event. Likewise, models in the `deselected` array have changed their status from selected to deselected.

_(Backbone.Picky users: Note that up to version 0.2, the first parameter passed to event handlers had been the collection.)_

Event handlers with standard names are invoked automatically. Standard names are `onSelectNone`, `onSelectSome`, `onSelectAll` and `onReselect`. If these methods exist on the collection, they are run without having to be wired up with the event manually.

Custom options can be used when invoking any method. See the [section on custom options][custom-options], below.

#### "select:all"

Triggered when all models have been selected. Provides the ["diff" hash][select.many-events] as the first parameter, and the collection as the second. Runs the `onSelectAll` event handler if the method exists on the collection.

#### "select:none"

Triggered when all models have been deselected. Provides the ["diff" hash][select.many-events] as the first parameter, and the collection as the second. Runs the `onSelectNone` event handler if the method exists on the collection.

#### "select:some"

Triggered when some, but not all, models have been selected. Provides the ["diff" hash][select.many-events] as the first parameter, and the collection as the second. Runs the `onSelectSome` event handler if the method exists on the collection.

#### "reselect:any"

Triggered when at least one model, which is already selected, is selected again. Provides an array of the re-selected models as the first parameter. Runs the `onReselect` event handler if the method exists on the collection.

In contrast to the other events, this event fires even if there isn't any change in the resulting selection at all. Note that there is no separate reselect:all event; the re-selection of all items in the collection is also covered by `reselect:any`.

## Sharing models among collections

Models can be part of more than one collection, and Backbone.Select still manages selections correctly. You must enable model sharing explicitly, though, and play by a few rules.

### Features

When sharing models among collections, the collections don't have to be of the same type. A model can be part of single-select and multi-select collections at the same time. Backbone.Select handles all aspects of it:

- Suppose you have selected a model (or models) in one collection, and then you create another one with these models. The new collection will pick up the selections you have already made. That also works when adding models to existing collections.

- The selections in a collection are updated as needed when models are removed. A model loses its `selected` status when it is removed from the last collection holding it. Resetting collections is governed by the same rules.

- When a selection, or deselection, is made with the `silent` option enabled, selection-related events will be silenced in all of the collections sharing the model.

- Selections and deselections involving a number of collections and models are treated as atomic. Events are delayed until all collections and models have been updated, without select or deselect actions pending.

- Edge cases are covered as well. Suppose a number of models are selected in a multi-select collection. You then proceed to add them to a single-select collection. Only one model can be selected there, so Backbone.Select will deselect all but one of them. The last model added to the single-select collection "wins", ie its `selected` status survives.

### Enabling model sharing

To enable model sharing, use the option `enableModelSharing`. Create the mixin with

```js
Backbone.Select.One.applyTo( this, models, { enableModelSharing: true } );
```

and likewise for Backbone.Select.Many. See the Basic Usage sections of [Backbone.Select.One][select.one-basic-usage] and [Backbone.Select.Many][select.many-basic-usage].

### Restrictions when sharing models

There are a few things you must and mustn't do in order to make sharing work, and keep yourself out of trouble.

- Don't use the `silent` option when adding models, removing them, or resetting a collection. If you change the contents of a collection silently, the `selected`/`deselected` status of the shared models won't be synced across collections reliably.

- When a collection is no longer in use, call `close()` on it to avoid memory leaks.

  So don't just replace a collection like this:

  ```js
  var myCol = new MySelectableCollection( [myModel] );
  // ... do stuff
  myCol = new MySelectableCollection( [myModel] );  // WRONG!
  ```

  Instead, call `close()` before you let an obsolete collection fade away into oblivion:

  ```js
  var myCol = new MySelectableCollection( [myModel] );
  // ... do stuff
  myCol.close();
  myCol = new MySelectableCollection( [myModel] );  // now OK
  ```

  Note that you don't need to call `close()` if you use Backbone.Select in "single-collection mode", without sharing models among collections.

### Events

If you are working with events a lot, there are a few details which may help.

- As stated earlier, selections and deselections involving a number of collections and models are treated as atomic. Events are delayed until all collections and models have been updated, without select or deselect actions pending.

- When selected models are added or removed, the collection is updated and the corresponding `select:*` event is fired. In its options, the name of the initial Backbone `add` or `remove` event is available as `options._externalEvent`. The `select:*` options also contain the event options of the initial Backbone event.

- By contrast, a `reset` does not trigger a `select:*` or `deselect:one` event on the collection which is reset. The command is meant to suppress individual notifications, just like it does for `add` and `remove` events, and only fires a `reset` event in the end.

## Custom options

With custom options, you can send additional information to event handlers. Just pass an arbitrary, custom option (or a whole bunch of them) to any method. Custom options don't affect the operation of Backbone.Select, but they are passed on to the event handlers as the last argument.

```js
myCollection = new SingleCollection( [myModel] );
myCollection.on( "select:one", function ( model, collection, options ) {
  if ( options ) console.log( "Selected while foo=" + options.foo );
});

myCollection.select( myModel, {foo: "bar"} );    // prints "Selected while foo=bar"
```

Options get passed around to all event handlers which are running. In the example above, the event handler is set up for the collection. It will also pick up an option passed to the `select` method of the model, for instance.

```js
myModel.select( {foo: "baz"} );    // prints "Selected while foo=baz"
```

## Compatibility with Backbone's own select method

Out of the box, Backbone collections have their own `select` method - an alias of `filter`. In your own code, that should not be an issue: just use `filter`.

The original `select` method of Backbone collections is still available, though, and can be called just as before. Even implementations overriding Backbone's `select` remain accessible. That's because the `select` method is overloaded. If the first argument in a `select` call is a model, the Backbone.Select mixin will handle it. If not, the call is passed up the prototype chain.

That kind of compatibility is crucial for third-party plugins or legacy code. They may rely on Backbone's select, or on their own implementation. Even so, they will continue to work - no modification required.

## Compatibility with Backbone.Picky

This component started off as a series of PRs for [Backbone.Picky][] and eventually turned into an independent fork.

### Picky vs Select: When to choose which

Backbone.Picky has a smaller feature set than Backbone.Select and doesn't handle edge cases nearly as well. Picky provides a bare-bones implementation which leaves the details up to you. But guess what? This is exactly why you might want to choose it over Backbone.Select.

- You can read the source of Backbone.Picky in minutes and understand every aspect of it.
- Because it is easy to understand, it is also easy to tweak. If you adapt the code and make it fit your needs, you are unlikely to accidentally mess up the component.

Simplicity is a virtue. If that is what you want, Picky is the better choice. Conversely, you might want to go with Backbone.Select because there is less need to hack it.

- If you share models among multiple collections, by all means, choose Backbone.Select. It takes care of all the quirks, and there are many. Backbone.Picky doesn't support model sharing.
- Additions, resets, and models passed in during instantiation are taken care of.
- The original `select` method of Backbone collections can still be called. Third-party code relying on it will continue to work.
- You get a richer set of events, more helpful data emitted by these events, a `silent` option, custom options pass-through, and predefined event handlers like `onSelect`.
- Better events make it less likely you ever need to touch the component itself. Your adaptations can go into event handlers, allowing for a clean design.
- Backbone.Select is extremely well tested. Even though the code is (a little) more complex than Backbone.Picky, you can tweak it without hesitation. If you mess up, a unit test will tell you.

### Compatibility

Backbone.Select is fully compatible to Backbone.Picky once you have instantiated it. You only have to change the way the mixin is created and applied to an object.

Picky.Selectable was applied like this:

```js
initialize: function () {
  var selectable = new Backbone.Picky.Selectable( this );
  _.extend( this, selectable );
}
```

In Backbone.Select, it has become

```js
initialize: function () {
  Backbone.Select.Me.applyTo( this );
}
```

Similarly, the initialization of Picky.SingleSelect

```js
initialize: function () {
  var singleSelect = new Backbone.Picky.SingleSelect( this );
  _.extend( this, singleSelect );
}
```

is replaced by

```js
initialize: function ( models ) {
  Backbone.Select.One.applyTo( this, models );
}
```

Picky.MultiSelect is treated the same way. Use `Backbone.Select.Many.applyTo( this, models )`.

If you want to [enable model sharing][sharing] in a Select.One or Select.Many collection, you need to pass in an options hash as the third argument: `{ enableModelSharing: true }`. [See above][sharing].

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] and [Bower][] set up the environment for you.

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now. If you want to test against specific versions of Backbone, edit `bower.json` first.

### Running tests, creating a new build

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Jasmine][] (test framework). But you don't really need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http. By default, that access is restricted to localhost. You can relax the restriction in `Gruntfile.js`, but be aware of the security implications._

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## Release notes

### v1.2.5

* Restored access to the `select` method of Backbone.Collection by overloading the `select` method.

### v1.2.4

* Added arguments validation to `applyTo` factory methods.
* Various minor bugs fixed.

### v1.2.0

* Related selections and deselections are treated as a single, atomic transaction. Firing of events is delayed until select and deselect actions have spread across all affected models and collections, without any actions still pending.

### v1.1.2

* Fixed bug when models were added or removed with `reset` (collection was not correctly registered with models)

### v1.1.1

* Relaxed dependency requirements in `bower.json`

### v1.1.0

* Moved build to `dist` directory
* Added `_pickyType` property to identify mixins in a model or collection
* Switched development stack to Bower, Karma, Node web server
* Added demo app, memory-leak test environment in `demo` directory

### v1.0.1

* Removed obsolete Backbone.Picky files from build

### v1.0.0

* Forked Backbone.Picky, renaming the project to Backbone.Select
* Renamed components to Select.Me (former Selectable), Select.One (former SingleSelect), Select.Many (former MultiSelect)
* Added `options._externalEvent`, available when the selection in a collection is altered during an `add` or `remove` action
* Added `applyTo` class methods for setup
* Removed support for creating new Backbone.Select objects solely with the constructor
* Event handlers with standard names are invoked automatically if they exist (`onSelect`, `onDeselect`, `onReselect`, `onSelectNone`, `onSelectSome`, `onSelectAll`)
* Options - including arbitrary, custom ones - are passed on to event handlers
* The collection is also passed to event handlers (single-select collection)
* A "diff" hash is passed to select:* event handlers (multi-select collection)
* New events capture when models are re-selected: `reselected` (model), `reselect:one` (single-select collection), `reselect:any` (multi-select collection)
* Multi-select events no longer fire when `selectAll`, `deselectAll` actions are a no-op (change in spec)
* Added support for sharing models among collections
* Added a `silent` option
* Improved events, now firing when model and collection are in a consistent state (Picky issue #18)
* Added `deselectAll`, while keeping `selectNone` around as an alias
* More comprehensive testing
* Added config file for the Karma test runner

### v0.2.0

* Renamed `SingleSelect` events from "select" and "deselect" to "select:one" and "deselect:one"
* Pass model as argument in select:one / deselect:one events
* Updated the build to use latest grunt and related tools
* Removed reliance on ruby for any part of this project

### v0.1.0

* Added Picky.SingleSelect
* Fleshed out the specs more

### v0.0.1

* Initial release of untested code
* Basic "Selectable" mixin for models
* Basic "MultiSelect" mixin for collections

## Credits, copyright, MIT license

Special credits go to [Derick Bailey][muted-solutions], who created the original version of this component, [Backbone.Picky][]. It is still around; see the [Backbone.Picky Compatibility section][picky-compatibility] for the differences.

Copyright (c) 2014 Michael Heim<br>
Copyright (c) 2013 Derick Bailey, Muted Solutions, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma - Spectacular Test Runner for Javascript"
[Jasmine]: http://pivotal.github.io/jasmine/ "Jasmine, a behavior-driven development framework"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"

[dist-dev]: https://raw.github.com/hashchange/backbone.select/master/dist/backbone.select.js "backbone.select.js"
[dist-prod]: https://raw.github.com/hashchange/backbone.select/master/dist/backbone.select.min.js "backbone.select.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/backbone.select/master/dist/amd/backbone.select.js "backbone.select.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/backbone.select/master/dist/amd/backbone.select.min.js "backbone.select.min.js, AMD build"

[muted-solutions]: http://mutedsolutions.com/ "Muted Solutions, LLC"
[Backbone.Picky]: https://github.com/derickbailey/backbone.picky#readme "Backbone.Picky"
[Backbone.Cycle]: https://github.com/hashchange/backbone.cycle#readme "Backbone.Cycle"

[Backbone.Select.Me]: #backboneselectme-making-models-selectable
[Backbone.Select.One]: #backboneselectone-a-single-select-collection
[Backbone.Select.Many]: #backboneselectmany-a-multi-select-collection
[model-collection-interaction]: #basic-model-and-collection-interaction
[select.me-events]: #backboneselectme-events
[select.one-basic-usage]: #basic-usage-1
[select.many-basic-usage]: #basic-usage-2
[select.many-events]: #backboneselectmany-events
[sharing]: #sharing-models-among-collections
[custom-options]: #custom-options
[select-compatibility]: #compatibility-with-backbones-own-select-method
[picky-compatibility]: #compatibility-with-backbonepicky
