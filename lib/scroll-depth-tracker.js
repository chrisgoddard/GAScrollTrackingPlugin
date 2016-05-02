/**
 * ScrollTracker
 */

var utilities = require('./utilities')

var defaults = require('./defaults')

var provide = require('./provide')

function scrollDepthTracker(tracker, _config){

  var self = this

  this.tracker = tracker

  /**
   * configuration object
   * @type {object}
   */
  this.config = utilities.extend(_config, defaults)

  this.debug(this.config)


  /**
   * @type {Boolean}
   */
  this.hasScrolled = false

  /**
   * @type {Boolean}
   */
  this.everScrolled = false

  /**
   * set useBeacon to beacon config.beacon
   */
  this.tracker.set('useBeacon', this.config.beacon)


  /**
   * maximum scroll reach recorded
   * @type {Number}
   */
  this.reach = 0

  /**
   * scroll reach on page load (usually window height)
   * @type {Number}
   */
  this.initialReach = 0

  /**
   * used to store the timestamp of DOMready/plugin initalization
   */
  this.startTime = new Date()*1


  /**
   * Initalize plugin on DOMready
   */
  utilities.ready(function(){

    // set inital reach to the scroll depth as soon as DOMReady occurs
    self.initialReach = self.percent(self.depth(), self.pageHeight())

    if(self.config.setPage){
      self.tracker.set('page', window.location.pathname)
    }

    // check if mobile device
    if(self.isMobile() && document.visibilityState){
      // visiblity change event
      utilities.event(window, self)('visibilitychange')(self.onVisibilityChange)
    } else {
      // standard beforeunload event
      utilities.event(window, self)('beforeunload')(self.onUnload)
    }  

    // attach scroll event handler
    utilities.event(window)('scroll')(function(){
      self.everScrolled = true
      self.hasScrolled = true
    })

    // sampled scroll
    var sampleScroll = function(){
      if(self.hasScrolled){
        self.hasScrolled = false
        self.onScroll()
      }
      setTimeout(sampleScroll, self.config.sampleRate)
    }
    setTimeout(sampleScroll, self.config.sampleRate)
  })


}

scrollDepthTracker.prototype.isMobile = function(){
  return window.navigator.userAgent.match(/Mobi|Touch|Opera\ Mini|Android/)
}

/**
 * debug utility - only outputs to console if debug method is true
 * @param  {string} msg debug message
 */
scrollDepthTracker.prototype.debug = function(){
  if(this.config.debug){
    console.log(utilities.toArray(arguments))
  }
}

/**
 * calculate scroll depth to the bottom on the viewport
 * @return {int} current scroll depth in pixels
 */
scrollDepthTracker.prototype.depth = function(){
  return (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0) +
    (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)
}

/**
 * return percentage depth from depth and page height
 * @param  {integer} depth  scroll depth in pixels
 * @param  {integer} height page height in pixels
 * @return {integer}        percent depth
 */
scrollDepthTracker.prototype.percent = function(depth, height){
  return Math.floor(100 * depth / height)
}

/**
 * sampled scroll callback
 * @return {null} 
 */
scrollDepthTracker.prototype.onScroll = function(){
  var self = this

  var temp = this.percent(this.depth(), this.pageHeight())

  if(temp > this.reach){
    if(temp > 100){
      this.reach = 100
    } else {
      this.reach = temp
    }
  }

  if(this.config.metric && this.config.metric.toFixed){
    this.tracker.set('metric'+this.config.metric, this.reach)
  }

  this.debug('on scroll: reach', this.reach)
}


/**
 * calculate height of document
 * @return {int} height in pixels
 */
scrollDepthTracker.prototype.pageHeight = function()
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
 * window beforeunload callback
 * @return {null} 
 */
scrollDepthTracker.prototype.onUnload = function(){

  var self = this

  var nonInteraction = true

  var skip = false

  if(( new Date()*1 - this.startTime > this.config.timeThreshold * 1000) || (this.reach > this.initialReach + this.config.scrollThreshold)){
    nonInteraction = false
  }

  var data = {
    eventCategory: this.config.category,
    eventAction: this.config.action,
    eventLabel: (this.everScrolled) ? this.config.labelScroll : this.config.labelNoScroll,
    eventValue: this.reach,
    nonInteraction: nonInteraction,
    hitCallback: function(){
      skip = true
      self.debug('hit sent!')
    }
  }

  this.debug(data)

  // send event to GA
  this.tracker.send('event', data)

  if (this.config.timeout && !window.navigator.sendBeacon){
    var start = new Date()
    var run = 0
    do {
      run = new Date() - start

    } while (run < this.config.timeout && !skip)

    this.debug('close page')
  }

}

/**
 * fires on visibility change event
 * checks that it is changing to "hidden" and then fires normal onUnload event
 * @return {[type]} [description]
 */
scrollDepthTracker.prototype.onVisibilityChange = function(){
  if (document.visibilityState == 'hidden') {
    this.onUnload()
  }
}

// provide plugin
provide('scrollDepthTracker', scrollDepthTracker)