document.getElementById("openCB").addEventListener("click", function() {

        document.getElementById("chatBox").classList.toggle("active");

})

function draggable(element, grabHandle) {
	var isMouseDown = false;

    // initial mouse X and Y for `mousedown`
    var mouseX;
    var mouseY;

    // element X and Y before and after move
    var elementX = 0;
    var elementY = 0;

    var currMoveX = 0;
    var currMoveY = 0;


    // mouse button down over the element
    grabHandle.addEventListener('mousedown', onMouseDown);

	/**
     * Listens to `mousedown` event.
     *
     * @param {Object} event - The event.
     */
	function onMouseDown(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
        isMouseDown = true;
        console.log(mouseX, mouseY)
    }

	// mouse button released
    document.addEventListener('mouseup', onMouseUp);

	/**
     * Listens to `mouseup` event.
     *
     * @param {Object} event - The event.
     */
	function onMouseUp(event) {
        isMouseDown = false;
        elementX = currMoveX;
        elementY = currMoveY;
    }

	// need to attach to the entire document
    // in order to take full width and height
    // this ensures the element keeps up with the mouse
    document.addEventListener('mousemove', onMouseMove);

	/**
     * Listens to `mousemove` event.
     *
     * @param {Object} event - The event.
     */
	function onMouseMove(event) {
    	if (!isMouseDown) return;
        var deltaX = event.clientX - mouseX;
        var deltaY = event.clientY - mouseY;
        element.style.transform = "translate("+(elementX + deltaX)+"px, "+(elementY + deltaY)+"px)"
        currMoveX = elementX + deltaX;
        currMoveY = elementY + deltaY
       
    }
}

draggable(document.getElementById("chatBox"), document.getElementById("chatHeader"))