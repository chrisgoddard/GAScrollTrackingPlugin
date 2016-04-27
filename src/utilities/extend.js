/**
 * Extend object utilty
 */

var toArray = require('./toArray.js')

function extend()
{
  var objects = toArray(arguments)
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

  for(i in objs)
  {
    obj[i] = _extend(newObject, objs[i])
  }

  return newObject
}

module.exports = extend