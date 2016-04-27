/**
 * Scroll Tracking Plugin Core
 */

var event = require('./utilities/event.js')
var extend = require('./utilities/extend.js')
var ready = require('./utilities/ready.js')
var toArray = require('./utilities/toArray.js')

var defaults = {
  delay : true,
  catetory : 'Page',
  action : 'Pageview End',
  setPage : true,
  sampleRate : 100,
  timeout : 300,
  timeThreshold : 15,
  scrollThreshold : 10,
  debug : false,
  beacon : true,
  labelScroll : 'Did Scroll',
  labelNoScroll : 'Did Not Scroll'
}

function ScrollTracking(tracker, _config) {

  var self = this

  /**
   * debug utility
   * @param  {string} msg debug message
   */
  function debug(msg)
  {
    if(config.debug){
      console.log(msg)
    }
  }

  /**
   * configuration object
   * @type {object}
   */
  var config = extend(_config, defaults)

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

  // reach/depth variable
  var reach = 0

  // initial reach of window
  var initialReach = 0

  // startTime variable
  var startTime

  // run plugin on DOMReady
  ready(function(){

    // set inital reach to the scroll depth as soon as DOMReady occurs
    initialReach = onScroll()

    if(config.setPage){
      tracker.set('page', window.location.pathname)
    }

    event(window)('beforeUnload')(onUnload)

    event(window)('scroll')(function(){
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

  function depth()
  {
    return 
    (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0) +
    (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)
  }

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

    debug(reach)
  }

  function onUnload()
  {
    var interaction = false

    var skip = false

    if((new Date()*1) - startTime > config.timeThreshold * 1000 ||
       reach > initialReach + config.scrollThreshold
      ){
      interaction = true
    }

    var label = config.labelNoScroll

    if(everScrolled){
      label = config.labelScroll
    }

    tracker.send('event',
                  self.config.category,
                  self.config.action,
                  label,
                  reach,
                  {
                    nonInteraction: !interaction,
                    hitCallback: function(){
                      skip = true
                      debug('hit sent!')
                    }
                  }
                )


    if (config.timeout && !window.navigator.sendBeacon)
    {
      var start = new Date()
      var run = 0
      do
      {
        run = new Date() - start;

      } while (run < config.timeout && !skip);

      debug('close page')

    }

  }

}

module.exports = ScrollTracking


