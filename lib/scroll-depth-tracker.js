/**
 * ScrollTracker
 */

var utilities = require('./utilities')

var defaults = require('./defaults')

var provide = require('./provide')

function scrollDepthTracker (tracker, _config){

  var self = this

  /**
   * configuration object
   * @type {object}
   */
  var config = utilities.extend(_config, defaults)

  /**
   * debug utility
   * @param  {string} msg debug message
   */
  function debug()
  {
    if(config.debug){
      console.log(utilities.toArray(arguments))
    }
  }

  debug(config)

  /**
   * @type {Boolean}
   */
  var hasScrolled = false

  /**
   * @type {Boolean}
   */
  var everScrolled = false

  /**
   * set useBeacon to beacon config.beacon
   */
  tracker.set('useBeacon', config.beacon)

  /**
   * maximum scroll reach recorded
   * @type {Number}
   */
  var reach = 0

  /**
   * scroll reach on page load (usually window height)
   * @type {Number}
   */
  var initialReach = 0

  /**
   * used to store the timestamp of DOMready/plugin initalization
   */
  var startTime

  /**
   * Initalize plugin on DOMready
   */
  utilities.ready(function(){

    // set inital reach to the scroll depth as soon as DOMReady occurs
    initialReach = onScroll()

    if(config.setPage){
      tracker.set('page', window.location.pathname)
    }

    utilities.event(window)('beforeunload')(onUnload)

    utilities.event(window)('scroll')(function(){
      everScrolled = true
      hasScrolled = true
    })

    var sampleScroll = function(){
      if(hasScrolled){
        hasScrolled = false
        onScroll()
      }
      setTimeout(sampleScroll, config.sampleRate)
    }
    setTimeout(sampleScroll, config.sampleRate)

  })

  /**
   * Private Functions
   */

  /**
   * calculate height of document
   * @return {int} height in pixels
   */
  function pageHeight()
  {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    )
  }

  /**
   * calculate scroll depth to the bottom on the viewport
   * @return {int} current scroll depth in pixels
   */
  function depth()
  {
    return (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0) +
    (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)
  }

  /**
   * sampled scroll callback
   * @return {null} 
   */
  function onScroll()
  {
    var temp = Math.floor(100 * depth() / pageHeight())

    if(temp > reach){
      if(temp > 100){
        reach = 100
      } else {
        reach = temp
      }
    }

    if(config.metric && config.metric.toFixed){
      tracker.set('metric'+config.metric, reach)
    }

    debug('on scroll: reach', reach)
  }

  /**
   * window beforeunload callback
   * @return {null} 
   */
  function onUnload()
  {

    var interaction = false

    var skip = false

    if(( new Date()*1 - startTime > config.timeThreshold * 1000) || (reach > initialReach + config.scrollThreshold)){
      interaction = true
    }

    var data = {
      eventCategory: config.category,
      eventAction: config.action,
      eventLabel: (everScrolled) ? config.labelScroll : config.labelNoScroll,
      eventValue: reach,
      nonInteraction: !interaction,
      hitCallback: function(){
        skip = true
        debug('hit sent!')
      }
    }

    debug(data)

    // send event to GA
    tracker.send('event', data)

    if (config.timeout && !window.navigator.sendBeacon){
      var start = new Date()
      var run = 0
      do {
        run = new Date() - start

      } while (run < config.timeout && !skip)

      debug('close page')
    }

  }

}

provide('scrollDepthTracker', scrollDepthTracker)