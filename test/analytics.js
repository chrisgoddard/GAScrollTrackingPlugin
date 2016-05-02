/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var get = require('lodash/get');

module.exports =  {

  run: function() {
    var ga = window[window.GoogleAnalyticsObject || 'ga'];
    ga.apply(window, Array.prototype.slice.call(arguments))
  },

  getProvidedPlugins: function() {
    return window.gaplugins;
  },

  getHitData: function() {
    return window.hitData;
  },

  getErrorLog: function() {
    return window.errorlog;
  },

  getMessages: function(){
    return window.messages;
  },

  trackHitData: function() {
    window.hitData = [];
    var ga = window[window.GoogleAnalyticsObject || 'ga'];
    ga('set', 'sendHitTask', function(model) {
      window.hitData.push({
        hitType: model.get('hitType'),
        page: model.get('page'),
        title: model.get('title'),
        eventCategory: model.get('eventCategory'),
        eventAction: model.get('eventAction'),
        eventLabel: model.get('eventLabel'),
        eventValue: model.get('eventValue'),
        socialNetwork: model.get('socialNetwork'),
        socialAction: model.get('socialAction'),
        socialTarget: model.get('socialTarget'),
        dimension1: model.get('dimension1'),
        dimension2: model.get('dimension2'),
        metric1: model.get('metric1'),
        metric2: model.get('metric2'),
        nonInteraction : model.get('nonInteraction'),
        devId: model.get('&did')
      });
    });
  },

  hitDataMatches: function(expected) {
    return function() {
      return browser.execute(this.getHitData).then(function(hitData) {
        return expected.every(function(item) {
          return get(hitData.value, item[0]) === item[1];
        });
      });
    }.bind(this);
  },

  getTrackerData: function() {
    var ga = window[window.GoogleAnalyticsObject || 'ga'];
    var tracker = ga.getAll()[0];
    return {
      dimension1: tracker.get('dimension1'),
      dimension2: tracker.get('dimension2')
    };
  },

  trackerDataMatches: function(expected) {
    return function() {
      return browser.execute(this.getTrackerData).then(function(trackerData) {
        return expected.every(function(item) {
          return get(trackerData.value, item[0]) === item[1];
        });
      });
    }.bind(this);
  },

  clearHitData: function() {
    window.hitData = [];
  },

  sendFrameData: function(){
    var ga = window[window.GoogleAnalyticsObject || 'ga'];
    window.hitData = window.hitData || [];
    ga(function() {
    window.addEventListener('unload', function(event) {
      var data = JSON.stringify({
        sessionDurationMessage: window.hitData
      });
      window.parent.postMessage(data, '*');
    });
  });
  }
};
