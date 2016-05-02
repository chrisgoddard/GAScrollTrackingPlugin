var assert = require('assert')

var ga = require('../analytics')

var utilities = require('../test-utilities')



// describe('scroll depth tracking', function(){

//   beforeEach(function() {
//     browser
//         .url('/scroll-depth-tracker.html')
//         .execute(ga.run, 'create', 'UA-XXXXX-Y', 'auto')
//         .execute(ga.trackHitData)
//   })

//   describe('plugin setup', function(){

//     it('loads plugin', function(){
//       var gaplugins = browser
//         .execute(ga.run, 'require', 'scrollDepthTracker', '/scripts/scroll-depth-tracker.js')
//         .execute(ga.getProvidedPlugins)
//         .value;

//       assert(gaplugins.ScrollDepthTracker)
//     })

//   })

// })

describe('plugin functionality', function(){

  browser.addCommand('after', function aync(delay){
    return function(){
      var self = this
      this.pause(delay)
      return self
    }
  })

  var config = {
    action : 'Pageview End',
    category : 'Page',
    debug : false,
    labelNoScroll : 'Did Not Scroll',
    labelScroll : 'Did Scroll',
    scrollThreshold : 10,
    setPage : true,
    timeout : 300,
    timeThreshold : 3
    
  }

  beforeEach(function(){
    
  })

  it('correctly tracks visitor arriving and leaving/clicking-away immediately', function() {
    
    var childFrame = browser
        .url('/scroll-depth-tracker.html')
        .element('iframe').value

    var hitData = browser
        .frame(childFrame)
        .execute(ga.run, 'create', 'UA-XXXXX-Y', 'auto')
        .execute(ga.trackHitData)
        .execute(ga.sendFrameData)
        .execute(ga.run, 'require', 'scrollDepthTracker', '/scripts/scroll-depth-tracker.js')
        .execute(ga.run, 'send', 'pageview')
        .click('#link')
        .frame()
        .execute(ga.getMessages)
        .value


    assert.equal(hitData[1].eventAction, config.action)
    assert.equal(hitData[1].eventCategory, config.category)
    assert.equal(hitData[1].eventLabel, config.labelNoScroll)
    assert(hitData[1].nonInteraction)

  })


  it('tracks a 4 second visit with no scroll', function(){

    var childFrame = browser
        .url('/scroll-depth-tracker.html')
        .element('iframe').value


    browser
        .frame(childFrame)
        .execute(ga.run, 'create', 'UA-XXXXX-Y', 'auto')
        .execute(ga.trackHitData)
        .execute(ga.sendFrameData)
        .execute(ga.run, 'require', 'scrollDepthTracker', '/scripts/scroll-depth-tracker.js')
        .execute(ga.run, 'send', 'pageview')
    
    browser.pause(4000)

    browser
        .frame(childFrame)
        .click('#link')
        .frame()
        .execute(ga.getMessages)
        .value

        return hitData

      //  browser.pause(4000)



    // console.log("before pause")
    // console.log(browser)
    // browser.pause(4000)
    // console.log(browser)
    // console.log("after pause")

    // var hitData = _frame
    //   .frame(childFrame)
    //   .click('#link')
    //   .frame()
    //   .execute(ga.getMessages)
    //   .value

    //   return hitData

    // assert.equal(hitData[1].eventAction, config.action)
    // assert.equal(hitData[1].eventCategory, config.category)
    // assert.equal(hitData[1].eventLabel, config.labelNoScroll)
    // assert.equal(hitData[1].nonInteraction, false)


  })

  // it('tracks a 2 second visit with 50% scroll', function(done){

  //   var childFrame = browser
  //       .url('/scroll-depth-tracker.html')
  //       .element('iframe').value


  //   browser
  //       .frame(childFrame)
  //       .execute(ga.run, 'create', 'UA-XXXXX-Y', 'auto')
  //       .execute(ga.trackHitData)
  //       .execute(ga.sendFrameData)
  //       .execute(ga.run, 'require', 'scrollDepthTracker', '/scripts/scroll-depth-tracker.js')
  //       .execute(ga.run, 'send', 'pageview')
  //       .scroll(0, parseInt(browser.getViewportSize('height') * .5) )
  //       //.pause(4000)


  //   // hacky version as pause doesn't seem to keep correct context

  //   setTimeout(function(){

  //      var hitData = browser
  //       .frame(childFrame)
  //       .click('#link')
  //       .frame()
  //       .execute(ga.getMessages)
  //       .value


  //     assert.equal(hitData[1].eventAction, config.action)
  //     assert.equal(hitData[1].eventCategory, config.category)
  //     assert.equal(hitData[1].eventLabel, config.labelScroll)
  //     assert.equal(hitData[1].nonInteraction, false)

  //     done()

  //   }, 2000)


  // })


  // it('tracks a 5 second visit with 40% scroll', function(done){

  //   var childFrame = browser
  //       .url('/scroll-depth-tracker.html')
  //       .element('iframe').value


  //   browser
  //       .frame(childFrame)
  //       .execute(ga.run, 'create', 'UA-XXXXX-Y', 'auto')
  //       .execute(ga.trackHitData)
  //       .execute(ga.sendFrameData)
  //       .execute(ga.run, 'require', 'scrollDepthTracker', '/scripts/scroll-depth-tracker.js')
  //       .execute(ga.run, 'send', 'pageview')
  //       .scroll(0, parseInt(browser.getViewportSize('height') * .4) )
  //       //.pause(4000)


  //   // hacky version as pause doesn't seem to keep correct context

  //   setTimeout(function(){

  //      var hitData = browser
  //       .frame(childFrame)
  //       .click('#link')
  //       .frame()
  //       .execute(ga.getMessages)
  //       .value

  //     console.log("I RAN!!!")

  //     assert.equal(hitData[1].eventAction, config.action)
  //     assert.equal(hitData[1].eventCategory, config.category)
  //     assert.equal(hitData[1].eventLabel, config.labelScroll)
  //     assert.equal(hitData[1].nonInteraction, false)

  //     done()

  //   }, 5000)


  // })


  // it('tracks a 15 second visit with no scroll', function() {
    
  //   var childFrame = browser
  //       .url('/scroll-depth-tracker.html')
  //       .element('iframe').value;

  //   var hitData = browser
  //       .frame(childFrame)
  //       .click('#link')
  //       .frame()
  //       .execute(function(){
  //         return window.messages
  //       })
  //       .value


  //   assert.equal(hitData[1].eventAction, config.action)
  //   assert.equal(hitData[1].eventCategory, config.category)
  //   assert.equal(hitData[1].eventLabel, config.labelNoScroll)
  //   assert(hitData[1].nonInteraction)

  // })


  it('tracks a 80% scroll, then back to 50% scroll, in 10 second visit')

})