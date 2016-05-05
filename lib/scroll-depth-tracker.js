/**
 * ScrollTracker
 */

var utilities = require('./utilities')

var defaults = require('./defaults')

var provide = require('./provide')

function scrollDepthTracker(tracker, _config){

  var self = this

  /**
   * ga tracker object
   * @type {object}
   */
  this.tracker = tracker

  /**
   * whether automated hit has been sent
   * @type {Boolean}
   */
  this.autoHitSent = false

  /**
   * hit count
   * @type {Number}
   */
  this.hitCount = 1

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


    // event handler test
    
    utilities.event(document)("click")(function(){
      document.innerHTML = "click!" + document.innerHTML
    })


    // set inital reach to the scroll depth as soon as DOMReady occurs
    self.initialReach = self.percent(self.depth(), self.pageHeight())

    if(self.config.setPage){
      if(self.config.setPage.big){
        self.tracker.set('page', self.config.setPage)
      } else {
        self.tracker.set('page', window.location.pathname)
      }
    }

    self.debug("is mobile?", self.isMobile())

    // check if mobile device
    if(self.isMobile() && document.visibilityState){
      // visiblity change event
      utilities.event(document, self)('visibilitychange')(self.onVisibilityChange)
      utilities.event(window, self)('pagehide')(self.onVisibilityChange)

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

    var sampleTime = function(){
      self.checkTimeout()
      setTimeout(sampleTime, 5000)
    }
    setTimeout(sampleTime, 5000)
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
 * check timeout
 */
scrollDepthTracker.prototype.checkTimeout = function(){
  if( new Date()*1 - this.startTime > ((this.config.maxTimeOnPage -0.5) * 60 * 1000) && !this.autoHitSent ){
    this.autoHitSent = true
    this.onUnload()

  }
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

  if( new Date()*1 - this.startTime > ((this.config.maxTimeOnPage) * 60 * 1000)){
    return;
  }

  var nonInteraction = true

  var skip = false

  if(( new Date()*1 - this.startTime > this.config.timeThreshold * 1000) || (this.reach > this.initialReach + this.config.scrollThreshold)){
    nonInteraction = false
  }

  var action = this.config.action

  if(this.hitCount > 1){
    action = action + " (" + this.hitCount + ")"
  }

  var data = {
    eventCategory: this.config.category,
    eventAction: action,
    eventLabel: (this.everScrolled) ? this.config.labelScroll : this.config.labelNoScroll,
    eventValue: this.reach,
    nonInteraction: nonInteraction,
    hitCallback: function(){
      skip = true
      self.debug('hit sent!')
    }
  }

  // check hit for debugging
  this.debug(data)

  // send event to GA
  this.tracker.send('event', data)
  this.hitCount++

  if (this.config.timeout && !window.navigator.sendBeacon){
    this.debug("no beacon support: using timeout fallback")
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
scrollDepthTracker.prototype.onVisibilityChange = function(eventName){
  if(eventName === "pagehide"){
    this.onUnload()
  } else if (eventName === "visibilitychange" && document.visibilityState == 'hidden') {
    this.onUnload()
  }
}

// provide plugin
provide('scrollDepthTracker', scrollDepthTracker)