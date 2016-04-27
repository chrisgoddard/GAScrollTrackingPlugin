/**
 * Tests for utilities
 */

var chai = require("chai")

//var jsdom = require('mocha-jsdom')

function fakeElement()
{
  var events = {}

  this.addEventListener = function(event, fn){
    events[event] = fn
  }

  this.detatchEventListener = function(event, fn){
    delete events[event]
  }

  this.dispatchEvent = function(event){
    events[event]()
  }
}


chai.should()

// utilities

var event = require('../src/utilities/event.js')

describe('event.js', function(){

  var element

  beforeEach(function(){

    element = new fakeElement()

    console.log(element)

  })


  describe('basic click handler', function(){

    var partial

    it('should create partial handler without error', function(){
       partial = event(element)("click")
    })

    it('should run handler when event is triggered', function(done){
      partial(function(){
        done()
      })
      element.dispatchEvent("click")
    })

  })


})