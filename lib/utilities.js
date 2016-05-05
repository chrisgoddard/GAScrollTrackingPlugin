/**
 * Utilities
 */
var Utilities = {

  /**
   * convert to Array
   * @return {Array} 
   */
  toArray : function toArray(arr){
    return Array.prototype.slice.call(arr)
  },

  /**
   * DOMready handler
   * @param  {function} fn handler
   * @return {null}      
   */
  ready : function ready(fn){
    if (document.readyState != 'loading')
    {
      fn()
    } else if (document.addEventListener){
      document.addEventListener('DOMContentLoaded', fn)
    } else {
      document.attachEvent('onreadystatechange', function () {
        if (document.readyState != 'loading') fn()
      })
    }
  },

  /**
   * Capitalizes the first letter of a string.
   * @param {string} str The input string.
   * @return {string} The capitalized string
   */
  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Object Extend Utility
   * @return {Object} combined object
   */
  extend : function extend()
  {
    var objects = Utilities.toArray(arguments)
    var newObject = {}
    var key
    var i

    function _extend(consumer, provider)
    {
      var key
      for(key in provider)
      {
        if(!consumer.hasOwnProperty(key)){
          consumer[key] = provider[key]
        }
      }
      return consumer
    }

    for(i in objects)
    {
      objects[i] = _extend(newObject, objects[i])
    }

    return newObject
  },


  /**
   * event handler utility
   * @param  {element} element DOM element to attach event listener
   * @param  {object} context The context the handler will be run in - can be overriden
   * @return {function}         Specify event
   */
  event : function event(element, context){

    // Assume modern browser
    var pasteeater = false

    // Check to see whether we're dealing with an old browser
    // and change pasteeater to true if old browser detected
    if(!element.addEventListener && element.attachEvent){
      pasteeater = true
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
       * @param  {object} _context Override the context the handler is run in
       * @return {function}         Function to remove event listener
       */
      return function(handler, data, _context){
        
        context = _context || context

        if(!handler.call){
          throw Error('Callback is not a function')
        }

        // create new handler function based on arguments passed
        var _handler = function(){
          handler.call(context || element, event, data)
        }

        // fallback for old browsers
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
          // fallback for old browsers
          if(pasteeater){
            element.detachEvent("on"+event, _handler)
          } else {
            element.removeEventListener(event, _handler, false)
          }
        }
      }
    }
  }

}

module.exports = Utilities