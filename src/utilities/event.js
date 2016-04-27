/**
 * event handler utility
 * @param  {element} element DOM element to attach event listener
 * @param  {object} context The context the handler will be run in - can be overriden
 * @return {function}         Specify event
 */
function event(element, context){

  // Check to see whether we're dealing with an old browser
  var pasteeater = false

  if(!element.addEventListener && element.attachEvent){
    pasteeater = true;
  }

  /**
   * specify event
   * @param  {string} event The event name
   * @return {function}       Add handler
   */
  return function(event){

    /**
     * attach handler
     * @param  {function} handler event handler
     * @param  {object} data    Any extra data to pass to the handler
     * @param  {object} context Override the context the handler is run in
     * @return {function}         Function to remove event listener
     */
    return function(handler, data, context){
      
      if(!handler.call){
        throw Error('Callback is not a function')
      }

      var _handler = function(){
        handler.call(context || element, event, data)
      }

      if(pasteeater){
        element.attachEvent("on"+event, _handler)
      } else {
        element.addEventListener(event, _handler, false)
      }

      /**
       * remove handler
       * @return {function} Call this function to remove event listener
       */
      return function(){
        if(pasteeater){
          element.detachEvent(event, _handler)
        } else {
          element.removeEventListener(event, _handler, false)
        }
      }
    }
  }
}

module.exports = event