// Closes the #build-info box when clicking on the close button. Hides the box immediately on JS Bin and Codepen.
//
// Works in any browser.
( function ( window, document ) {
    "use strict";

    var isLocalDemo =!window.location.hostname.match( /jsbin\.|codepen\./i ),

        box = document.getElementById( "build-info" ),
        closeButton = document.getElementById( "close-build-info" ),

        close = function ( event ) {
            if ( event ) event.preventDefault();
            box.style.display = "none";
        };

    addEventHandler( closeButton, "click", close );
    if ( !isLocalDemo ) close();

    function addEventHandler( element, event, handler ) {

        if ( element ) {

            if ( element.addEventListener ) {
                element.addEventListener( event, handler, false );
            } else if ( element.attachEvent ) {
                element.attachEvent( "on" + event, handler )
            } else {
                element["on" + event] = handler;
            }

        } else if ( window.console && window.console.log ) {
            window.console.log( "close-build-info.js: Build info box (or its close button) not found" );
        }

    }

} ( window, document ) );