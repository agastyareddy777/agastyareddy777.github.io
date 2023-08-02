(function() {
  window._satellite = window._satellite || {};
  window._satellite.container = {
  "buildInfo": {
    "buildDate": "2023-08-01T11:33:58Z",
    "turbineBuildDate": "2023-02-22T20:37:26Z",
    "turbineVersion": "27.5.0"
  },
  "environment": {
    "id": "EN0c904931fb6c40c39b8f259535bd7908",
    "stage": "development"
  },
  "dataElements": {
  },
  "extensions": {
    "adobe-analytics": {
      "displayName": "Adobe Analytics",
      "hostedLibFilesBaseUrl": "https://agastyareddy777.github.io/204118644db8/a0df8fdb2063/5a8bb2c244a9/hostedLibFiles/EPe51f9b26f7c243dfa8d1d3ea2bf16f5f/",
      "settings": {
        "orgId": "0103FFA9573F6FF77F000101@AdobeOrg",
        "libraryCode": {
          "type": "managed",
          "accounts": {
            "production": [
              "ageo1xxsinriteshgupta"
            ],
            "development": [
              "ageo1xxsinriteshgupta"
            ]
          },
          "useActivityMap": true,
          "scopeTrackerGlobally": false
        },
        "trackerProperties": {
          "currencyCode": "USD",
          "trackInlineStats": true,
          "trackDownloadLinks": true,
          "trackExternalLinks": true,
          "linkDownloadFileTypes": [
            "doc",
            "docx",
            "eps",
            "jpg",
            "png",
            "svg",
            "xls",
            "ppt",
            "pptx",
            "pdf",
            "xlsx",
            "tab",
            "csv",
            "zip",
            "txt",
            "vsd",
            "vxd",
            "xml",
            "js",
            "css",
            "rar",
            "exe",
            "wma",
            "mov",
            "avi",
            "wmv",
            "mp3",
            "wav",
            "m4v"
          ]
        }
      },
      "modules": {
        "adobe-analytics/src/lib/actions/sendBeacon.js": {
          "name": "send-beacon",
          "displayName": "Send Beacon",
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var getTracker = require('../sharedModules/getTracker');
var getNodeLinkText = require('../helpers/getNodeLinkText');

var isLink = function(element) {
  return element && element.nodeName && element.nodeName.toLowerCase() === 'a';
};

var getLinkName = function(element) {
  if (isLink(element)) {
    return getNodeLinkText(element);
  } else {
    return 'link clicked';
  }
};

var sendBeacon = function(tracker, settings, targetElement) {
  if (settings.type === 'page') {
    turbine.logger.info('Firing page view beacon.');
    tracker.t();
  } else {
    var linkSettings = {
      linkType: settings.linkType || 'o',
      linkName: settings.linkName || getLinkName(targetElement)
    };

    turbine.logger.info(
      'Firing link track beacon using the values: ' +
      JSON.stringify(linkSettings) + '.'
    );

    tracker.tl(
      isLink(targetElement) ? targetElement : 'true',
      linkSettings.linkType,
      linkSettings.linkName
    );
  }
};

module.exports = function(settings, event) {
  return getTracker().then(function(tracker) {
    sendBeacon(tracker, settings, event.element);
  }, function(errorMessage) {
    turbine.logger.error(
      'Cannot send beacon: ' +
      errorMessage
    );
  });
};

          }

        },
        "adobe-analytics/src/lib/actions/setVariables.js": {
          "name": "set-variables",
          "displayName": "Set Variables",
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var getTracker = require('../sharedModules/getTracker');
var applyTrackerVariables = require('../helpers/applyTrackerVariables');

module.exports = function(settings, event) {
  return getTracker().then(function(tracker) {
    turbine.logger.info('Set variables on the tracker.');
    applyTrackerVariables(tracker, settings.trackerProperties);
    if (settings.customSetup && settings.customSetup.source) {
      settings.customSetup.source.call(event.element, event, tracker);
    }
  }, function(errorMessage) {
    turbine.logger.error(
      'Cannot set variables: ' +
      errorMessage
    );
  });
};

          }

        },
        "adobe-analytics/src/lib/sharedModules/getTracker.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var cookie = require('@adobe/reactor-cookie');
var Promise = require('@adobe/reactor-promise');
var window = require('@adobe/reactor-window');
var settingsHelper = require('../helpers/settingsHelper');
var augmenters = require('../helpers/augmenters');

var applyTrackerVariables = require('../helpers/applyTrackerVariables');
var loadLibrary = require('../helpers/loadLibrary');
var generateVersion = require('../helpers/generateVersion');

var version = generateVersion(turbine.buildInfo.turbineBuildDate);
var BEFORE_SETTINGS_LOAD_PHASE = 'beforeSettings';

var mcidInstance = turbine.getSharedModule('adobe-mcid', 'mcid-instance');

var checkEuCompliance = function(trackingCoookieName) {
  if (!trackingCoookieName) {
    return true;
  }

  var euCookieValue = cookie.get(trackingCoookieName);
  return euCookieValue === 'true';
};

var augmentTracker = function(tracker) {
  return Promise.all(augmenters.map(function(augmenterFn) {
    var result;

    // If a tracker augmenter fails, we don't want to fail too. We'll re-throw the error in a
    // timeout so it still hits the console but doesn't reject our promise.
    try {
      result = augmenterFn(tracker);
    } catch (e) {
      setTimeout(function() {
        throw e;
      });
    }

    return Promise.resolve(result);
  })).then(function() {
    return tracker;
  });
};

var linkVisitorId = function(tracker) {
  if (mcidInstance) {
    turbine.logger.info('Setting MCID instance on the tracker.');
    tracker.visitor = mcidInstance;
  }

  return tracker;
};

var updateTrackerVersion = function(tracker) {
  turbine.logger.info('Setting version on tracker: "' + version + '".');

  if (typeof tracker.tagContainerMarker !== 'undefined') {
    tracker.tagContainerMarker = version;
  } else if (typeof tracker.version === 'string'
    && tracker.version.substring(tracker.version.length - 5) !== ('-' + version)) {
    tracker.version += '-' + version;
  }

  return tracker;
};

var updateTrackerVariables = function(trackerProperties, customSetup, tracker) {
  if (customSetup.loadPhase === BEFORE_SETTINGS_LOAD_PHASE && customSetup.source) {
    turbine.logger.info('Calling custom script before settings.');
    customSetup.source.call(window, tracker);
  }

  applyTrackerVariables(tracker, trackerProperties || {});

  if (customSetup.loadPhase !== BEFORE_SETTINGS_LOAD_PHASE && customSetup.source) {
    turbine.logger.info('Calling custom script after settings.');
    customSetup.source.call(window, tracker);
  }

  return tracker;
};

var initializeAudienceManagement = function(settings, tracker) {
  if (settingsHelper.isAudienceManagementEnabled(settings)) {
    tracker.loadModule('AudienceManagement');
    turbine.logger.info('Initializing AudienceManagement module');
    tracker.AudienceManagement.setup(settings.moduleProperties.audienceManager.config);
  }
  return tracker;
};

var initialize = function(settings) {
  if (checkEuCompliance(settings.trackingCookieName)) {
    return loadLibrary(settings)
      .then(augmentTracker)
      .then(linkVisitorId)
      .then(updateTrackerVersion)
      .then(updateTrackerVariables.bind(
        null,
        settings.trackerProperties,
        settings.customSetup || {}
      ))
      .then(initializeAudienceManagement.bind(null, settings));
  } else {
    return Promise.reject('EU compliance was not acknowledged by the user.');
  }
};

var promise = initialize(turbine.getExtensionSettings());
module.exports = function() {
  return promise;
};

          }
,
          "name": "get-tracker",
          "shared": true
        },
        "adobe-analytics/src/lib/sharedModules/augmentTracker.js": {
          "name": "augment-tracker",
          "shared": true,
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var augmenters = require('../helpers/augmenters');

module.exports = function(fn) {
  augmenters.push(fn);
};

          }

        },
        "adobe-analytics/src/lib/helpers/getNodeLinkText.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

/**
 * Reduces repeated whitespace within a string. Whitespace surrounding the string
 * is trimmed and any occurrence of whitespace within the string is replaced with
 * a single space.
 * @param {string} str String to be formatted.
 * @returns {string} Formatted string.
 */
var truncateWhiteSpace = function(str) {
  return str && str.replace(/\s+/g, ' ').trim();
};

var unsupportedNodeNames = /^(SCRIPT|STYLE|LINK|CANVAS|NOSCRIPT|#COMMENT)$/i;

/**
 * Determines if a node qualifies as a supported link text node.
 * @param {*} node Node to determine support for.
 * @returns {boolean}
 */
var isSupportedTextNode = function(node) {
  if (node && node.nodeName) {
    if (node.nodeName.match(unsupportedNodeNames)) {
      return false;
    }
  }
  return true;
};

/**
 * Orders and returns specified node and its child nodes in arrays of supported
 * and unsupported nodes.
 * @param {*} node The node to extract supported and unsupported nodes from.
 * @returns {{supportedNodes: Array, includesUnsupportedNodes: boolean}} Node support object.
 */
var extractSupportedNodes = function(node) {
  var supportedNodes = [];
  var includesUnsupportedNodes = false;
  if (isSupportedTextNode(node)) {
    supportedNodes.push(node);
    if (node.childNodes) {
      var childNodes = Array.prototype.slice.call(node.childNodes);
      childNodes.forEach(function(childNode) {
        var nodes = extractSupportedNodes(childNode);
        supportedNodes = supportedNodes.concat(nodes.supportedNodes);
        includesUnsupportedNodes = includesUnsupportedNodes || nodes.includesUnsupportedNodes;
      });
    }
  } else {
    includesUnsupportedNodes = true;
  }
  return {
    supportedNodes:supportedNodes,
    includesUnsupportedNodes:includesUnsupportedNodes
  };
};

/**
 * Returns the value of a node attribute.
 * @param {*} node The node holding the attribute.
 * @param {string} attributeName The name of the attribute.
 * @param {string} nodeName Optional node name constraint.
 * @returns {string} Attribute value or undefined.
 */
var getNodeAttributeValue = function(node, attributeName, nodeName) {
  var attributeValue;
  if (!nodeName || nodeName === node.nodeName.toUpperCase()) {
    attributeValue = node.getAttribute(attributeName);
  }
  return attributeValue;
};

/**
 * Extracts a link-name from a given node. This closely mirrors the logic
 * used in ActivityMap to determine link-names.
 *
 * The returned link-name is set to one of the following (in order of priority):
 *
 * 1. Clicked node innerText
 * 2. Clicked node textContent
 * 3. Clicked node and its child nodes nodeValue appended together.
 * 4. Clicked node alt attribute or node descendant alt attribute.
 *    Whichever is found first.
 * 5. Clicked node text attribute or node descendant text attribute.
 *    Whichever is found first.
 * 6. Clicked node INPUT descendant value attribute.
 *    Whichever is found first.
 * 7. Clicked node IMG descendant src attribute.
 *    Whichever is found first.
 *
 * @param {*} node The node to find link text for.
 * @returns {string} link-name or an empty string if not link-name is found.
 */
module.exports = function(node) {
  var nodeText = truncateWhiteSpace(node.innerText || node.textContent);
  var nodes = extractSupportedNodes(node);
  if (!nodeText || nodes.includesUnsupportedNodes) {
    var alt;
    var title;
    var inputValue;
    var imgSrc;
    var texts = [];
    nodes.supportedNodes.forEach(function(supportedNode) {
      if (supportedNode.getAttribute) {
        alt = alt || truncateWhiteSpace(supportedNode.getAttribute('alt'));
        title = title || truncateWhiteSpace(supportedNode.getAttribute('title'));
        inputValue = inputValue || truncateWhiteSpace(
          getNodeAttributeValue(supportedNode, 'value', 'INPUT'));
        imgSrc = imgSrc || truncateWhiteSpace(
          getNodeAttributeValue(supportedNode, 'src', 'IMG'));
      }
      if (supportedNode.nodeValue) {
        texts.push(supportedNode.nodeValue);
      }
    });
    nodeText = truncateWhiteSpace(texts.join(''));
    if (!nodeText) {
      nodeText = truncateWhiteSpace(alt || title || inputValue || imgSrc || '');
    }
  }
  return nodeText;
};

          }

        },
        "adobe-analytics/src/lib/helpers/settingsHelper.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var window = require('@adobe/reactor-window');

var settingsHelper = {
  LIB_TYPES: {
    MANAGED: 'managed',
    PREINSTALLED: 'preinstalled',
    REMOTE: 'remote',
    CUSTOM: 'custom'
  },

  MANAGED_LIB_PATHS: {
    APP_MEASUREMENT: 'AppMeasurement.js',
    ACTIVITY_MAP: 'AppMeasurement_Module_ActivityMap.js',
    AUDIENCE_MANAGEMENT: 'AppMeasurement_Module_AudienceManagement.js',
  },

  getReportSuites: function(reportSuitesData) {
    var reportSuiteValues = reportSuitesData.production;
    if (reportSuitesData[turbine.environment.stage]) {
      reportSuiteValues = reportSuitesData[turbine.environment.stage];
    }

    return reportSuiteValues.join(',');
  },

  isActivityMapEnabled: function(settings) {
    return !(settings.libraryCode &&
      !settings.libraryCode.useActivityMap &&
      settings.libraryCode.useActivityMap === false);
  },

  isAudienceManagementEnabled: function(settings) {
    var isEnabled = false;
    // check if audience management module should be enabled
    if (settings &&
      settings.moduleProperties &&
      settings.moduleProperties.audienceManager &&
      settings.moduleProperties.audienceManager.config &&
      window &&
      window._satellite &&
      window._satellite.company &&
      window._satellite.company.orgId) {
      isEnabled = true;
    }

    return isEnabled;
  }
};

module.exports = settingsHelper;

          }

        },
        "adobe-analytics/src/lib/helpers/augmenters.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

module.exports = [];

          }

        },
        "adobe-analytics/src/lib/helpers/applyTrackerVariables.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var queryString = require('@adobe/reactor-query-string');
var window = require('@adobe/reactor-window');

var eVarRegExp = /eVar([0-9]+)/;
var propRegExp = /prop([0-9]+)/;
var linkTrackVarsKeys = new RegExp('^(eVar[0-9]+)|(prop[0-9]+)|(hier[0-9]+)|campaign|purchaseID|' +
  'channel|server|state|zip|pageType$');

var onlyUnique = function(value, index, self) {
  return self.indexOf(value) === index;
};

var buildLinkTrackVars = function(tracker, newTrackerProperties, addEvents) {
  var linkTrackVarsValues = Object.keys(newTrackerProperties)
    .filter(linkTrackVarsKeys.test.bind(linkTrackVarsKeys));

  if (addEvents) {
    linkTrackVarsValues.push('events');
  }

  // Merge with the values already set on tracker.
  linkTrackVarsValues = linkTrackVarsValues.concat((tracker.linkTrackVars || '').split(','));

  return linkTrackVarsValues.filter(function(value, index) {
    return value !== 'None' && value && onlyUnique(value, index, linkTrackVarsValues);
  }).join(',');
};

var buildLinkTrackEvents = function(tracker, eventsData) {
  var linkTrackEventsValues = eventsData.map(function(event) {
    return event.name;
  });

  // Merge with the values already set on tracker.
  linkTrackEventsValues = linkTrackEventsValues.concat((tracker.linkTrackEvents || '').split(','));

  return linkTrackEventsValues.filter(function(value, index) {
    return value !== 'None'  && onlyUnique(value, index, linkTrackEventsValues);
  }).join(',');
};

var commaJoin = function(store, keyName, trackerProperties) {
  store[keyName] = trackerProperties[keyName].join(',');
};

var variablesTransform = function(store, keyName, trackerProperties) {
  var dynamicVariablePrefix = trackerProperties.dynamicVariablePrefix || 'D=';

  trackerProperties[keyName].forEach(function(variableData) {
    var value;
    if (variableData.type === 'value') {
      value = variableData.value;
    } else {
      var eVarData = eVarRegExp.exec(variableData.value);

      if (eVarData) {
        value = dynamicVariablePrefix + 'v' + eVarData[1];
      } else {
        var propData = propRegExp.exec(variableData.value);

        if (propData) {
          value = dynamicVariablePrefix + 'c' + propData[1];
        }
      }
    }

    store[variableData.name] = value;
  });
};

var transformers = {
  linkDownloadFileTypes: commaJoin,
  linkExternalFilters: commaJoin,
  linkInternalFilters: commaJoin,
  hierarchies: function(store, keyName, trackerProperties) {
    trackerProperties[keyName].forEach(function(hierarchyData) {
      store[hierarchyData.name] = hierarchyData.sections.join(hierarchyData.delimiter);
    });
  },
  props: variablesTransform,
  eVars: variablesTransform,
  campaign: function(store, keyName, trackerProperties) {
    if (trackerProperties[keyName].type === 'queryParam') {
      var queryParams = queryString.parse(window.location.search);
      store[keyName] = queryParams[trackerProperties[keyName].value];
    } else {
      store[keyName] = trackerProperties[keyName].value;
    }
  },
  events: function(store, keyName, trackerProperties) {
    var events = trackerProperties[keyName].map(function(data) {
      var entry = data.name;
      if (data.id) {
        entry = [entry, data.id].join(':');
      }
      if (data.value) {
        entry = [entry, data.value].join('=');
      }
      return entry;
    });
    store[keyName] = events.join(',');
  }
};

module.exports = function(tracker, trackerProperties) {
  var newProperties = {};
  trackerProperties = trackerProperties || {};

  Object.keys(trackerProperties).forEach(function(propertyName) {
    var transform = transformers[propertyName];
    var value = trackerProperties[propertyName];

    if (transform) {
      transform(newProperties, propertyName, trackerProperties);
    } else {
      newProperties[propertyName] = value;
    }
  });

  // New events are added to existing tracker events
  if (newProperties.events) {
    if (tracker.events && tracker.events.length > 0) {
      newProperties.events = tracker.events + ',' + newProperties.events;
    }
  }

  var hasEvents =
    trackerProperties && trackerProperties.events && trackerProperties.events.length > 0;
  var linkTrackVars = buildLinkTrackVars(tracker, newProperties, hasEvents);
  if (linkTrackVars) {
    newProperties.linkTrackVars = linkTrackVars;
  }

  var linkTrackEvents = buildLinkTrackEvents(tracker, trackerProperties.events || []);
  if (linkTrackEvents) {
    newProperties.linkTrackEvents = linkTrackEvents;
  }

  turbine.logger.info(
    'Applying the following properties on tracker: "' +
    JSON.stringify(newProperties) +
    '".'
  );

  Object.keys(newProperties).forEach(function(propertyName) {
    tracker[propertyName] = newProperties[propertyName];
  });
};

          }

        },
        "adobe-analytics/src/lib/helpers/loadLibrary.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var loadScript = require('@adobe/reactor-load-script');
var window = require('@adobe/reactor-window');
var Promise = require('@adobe/reactor-promise');
var settingsHelper = require('./settingsHelper');
var pollHelper = require('./pollHelper');

var createTracker = function(settings, reportSuites) {
  if (!window.s_gi) {
    throw new Error(
      'Unable to create AppMeasurement tracker, `s_gi` function not found.' + window.AppMeasurement
    );
  }
  turbine.logger.info('Creating AppMeasurement tracker with these report suites: "' +
    reportSuites + '"');
  var tracker = window.s_gi(reportSuites);
  if (settings.libraryCode.scopeTrackerGlobally) {
    turbine.logger.info('Setting the tracker as window.s');
    window.s = tracker;
  }
  return tracker;
};

/**
 * @param settings
 *
 * @return array
 */
var getUrlsToLoad = function(settings) {
  var urls = [];
  switch (settings.libraryCode.type) {
    case settingsHelper.LIB_TYPES.MANAGED:
      // load app measurement
      urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.APP_MEASUREMENT));
      // check if activity map should be loaded
      if (settingsHelper.isActivityMapEnabled(settings)) {
        urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.ACTIVITY_MAP));
      }
      break;
    case settingsHelper.LIB_TYPES.CUSTOM:
      urls.push(settings.libraryCode.source);
      break;
    case settingsHelper.LIB_TYPES.REMOTE:
      urls.push(window.location.protocol === 'https:' ?
        settings.libraryCode.httpsUrl : settings.libraryCode.httpUrl);
      break;
  }
  // check if audience management should be loaded
  if (settingsHelper.isAudienceManagementEnabled(settings)) {
    var visitorServiceConfig = {
      namespace: window._satellite.company.orgId
    };
    settings.moduleProperties.audienceManager.config.visitorService = visitorServiceConfig;
    urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.AUDIENCE_MANAGEMENT));
  }
  return urls;
};

var loadLibraryScripts = function(settings) {
  return Promise.all(getUrlsToLoad(settings).map(function(url) {
    turbine.logger.info("Loading script: " + url);
    return loadScript(url);
  }));
};

var setReportSuitesOnTracker = function(settings, tracker) {
  if (settings.libraryCode.accounts) {
    if (!tracker.sa) {
      turbine.logger.warn('Cannot set report suites on tracker. `sa` method not available.');
    } else {
      var reportSuites = settingsHelper.getReportSuites(settings.libraryCode.accounts);
      turbine.logger.info('Setting the following report suites on the tracker: "' +
        reportSuites + '"');
      tracker.sa(reportSuites);
    }
  }

  return tracker;
};

var getTrackerFromVariable = function(trackerVariableName) {
  if (window[trackerVariableName]) {
    turbine.logger.info('Found tracker located at: "' + trackerVariableName + '".');
    return window[trackerVariableName];
  } else {
    throw new Error('Cannot find the global variable name: "' + trackerVariableName + '".');
  }
};

// returns a promise that resolves with the tracker
module.exports = function(settings) {
  // loads all libraries from urls in parallel
  var loadLibraries = loadLibraryScripts(settings);

  // now setup the tracker
  switch (settings.libraryCode.type) {
    case settingsHelper.LIB_TYPES.MANAGED:
      var reportSuites = settingsHelper.getReportSuites(settings.libraryCode.accounts);
      return loadLibraries
        .then(createTracker.bind(null, settings, reportSuites));

    case settingsHelper.LIB_TYPES.PREINSTALLED:
      return loadLibraries
        .then(pollHelper.poll.bind(null, window, settings.libraryCode.trackerVariableName))
        .then(setReportSuitesOnTracker.bind(null, settings));

    case settingsHelper.LIB_TYPES.CUSTOM:
    case settingsHelper.LIB_TYPES.REMOTE:
      return loadLibraries
        .then(getTrackerFromVariable.bind(null, settings.libraryCode.trackerVariableName))
        .then(setReportSuitesOnTracker.bind(null, settings));

    default:
      throw new Error('Cannot load library. Type not supported.');

  }
};

          }

        },
        "adobe-analytics/src/lib/helpers/generateVersion.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

// The Launch code version is a 4 characters string.  The first character will always be L
// followed by year, month, and day codes.
// For example: JS-1.4.3-L53O = JS 1.4.3 code, Launch 2015 March 24th release (revision 1)
// More info: https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=tagmanager&title=DTM+Analytics+Code+Versions

'use strict';

var THIRD_OF_DAY = 8; //hours

var getDayField = function(date) {
  return date.getUTCDate().toString(36);
};

var getLastChar = function(str) {
  return str.substr(str.length - 1);
};

var getRevision = function(date) {
  // We are under the assumption that a Turbine version will be release at least 8h apart (max 3
  // releases per day).
  return Math.floor(date.getUTCHours() / THIRD_OF_DAY);
};

var getMonthField = function(date) {
  var monthNumber = date.getUTCMonth() + 1;
  var revision = getRevision(date);

  var monthField = (monthNumber + revision * 12).toString(36);

  return getLastChar(monthField);
};

var getYearField = function(date) {
  return (date.getUTCFullYear() - 2010).toString(36);
};

module.exports = function(dateString) {
  var date = new Date(dateString);

  if (isNaN(date)) {
    throw new Error('Invalid date provided');
  }

  return ('L' + getYearField(date) + getMonthField(date) + getDayField(date)).toUpperCase();
};

          }

        },
        "adobe-analytics/src/lib/helpers/pollHelper.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var Promise = require('@adobe/reactor-promise');

var MAX_ITERATIONS = 40;
var INTERVAL = 250;

var found = function(resolve, variableName, result) {
  turbine.logger.info('Found property located at: "' + variableName + '"].');
  resolve(result);
};

var getPromise = function(object, variableName) {
  return new Promise(function(resolve, reject) {
    if (object[variableName]) {
      return found(resolve, variableName, object[variableName]);
    }
    var i = 1;
    var intervalId = setInterval(function() {
      if (object[variableName]) {
        found(resolve, variableName, object[variableName]);
        clearInterval(intervalId);
      }
      // give up after 10 seconds
      if (i >= MAX_ITERATIONS) {
        clearInterval(intervalId);
        reject(new Error(
          'Bailing out. Cannot find the variable name: "' + variableName + '"].'));
      }
      i++;
    }, INTERVAL); // every 1/4th second
  });
};

module.exports = {
  poll: function(object, variableName) {
    turbine.logger.info('Waiting for the property to become accessible at: "'
      + variableName + '"].');
    return getPromise(object, variableName);
  }
};

          }

        }
      }
    },
    "core": {
      "displayName": "Core",
      "hostedLibFilesBaseUrl": "https://agastyareddy777.github.io/204118644db8/a0df8fdb2063/5a8bb2c244a9/hostedLibFiles/EP1fdd2a6ec2ae468fb1d2cac08df65f83/",
      "modules": {
        "core/src/lib/events/pageBottom.js": {
          "name": "page-bottom",
          "displayName": "Page Bottom",
          "script": function(module, exports, require, turbine) {
/***************************************************************************************
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

var pageLifecycleEvents = require('./helpers/pageLifecycleEvents');

/**
 * Page bottom event. This event occurs as soon as the user calls _satellite.pageBottom() (which is
 * supposed to be at the bottom of the page).
 * @param {Object} settings The event settings object.
 * @param {ruleTrigger} trigger The trigger callback.
 */
module.exports = function (settings, trigger) {
  pageLifecycleEvents.registerPageBottomTrigger(trigger);
};

          }

        },
        "core/src/lib/events/helpers/pageLifecycleEvents.js": {
          "script": function(module, exports, require, turbine) {
/***************************************************************************************
 * (c) 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

// We need to be able to fire the rules in a specific order, no matter if the library is loaded
// sync or async. The rules are fired in the following order:
// Library loaded rules -> Page bottom rules -> Dom Ready rules -> Window load rules.

var window = require('@adobe/reactor-window');
var document = require('@adobe/reactor-document');

var isIE10 = window.navigator.appVersion.indexOf('MSIE 10') !== -1;
var WINDOW_LOADED = 'WINDOW_LOADED';
var DOM_READY = 'DOM_READY';
var PAGE_BOTTOM = 'PAGE_BOTTOM';

var lifecycleEventsOrder = [PAGE_BOTTOM, DOM_READY, WINDOW_LOADED];

var createSyntheticEvent = function (element, nativeEvent) {
  return {
    element: element,
    target: element,
    nativeEvent: nativeEvent
  };
};

var registry = {};
lifecycleEventsOrder.forEach(function (event) {
  registry[event] = [];
});

var processRegistry = function (lifecycleEvent, nativeEvent) {
  lifecycleEventsOrder
    .slice(0, getLifecycleEventIndex(lifecycleEvent) + 1)
    .forEach(function (lifecycleEvent) {
      processTriggers(nativeEvent, lifecycleEvent);
    });
};

var detectLifecycleEvent = function () {
  if (document.readyState === 'complete') {
    return WINDOW_LOADED;
  } else if (document.readyState === 'interactive') {
    return !isIE10 ? DOM_READY : null;
  }
};

var getLifecycleEventIndex = function (event) {
  return lifecycleEventsOrder.indexOf(event);
};

var processTriggers = function (nativeEvent, lifecycleEvent) {
  registry[lifecycleEvent].forEach(function (triggerData) {
    processTrigger(nativeEvent, triggerData);
  });
  registry[lifecycleEvent] = [];
};

var processTrigger = function (nativeEvent, triggerData) {
  var trigger = triggerData.trigger;
  var syntheticEventFn = triggerData.syntheticEventFn;

  trigger(syntheticEventFn ? syntheticEventFn(nativeEvent) : null);
};

window._satellite = window._satellite || {};
window._satellite.pageBottom = processRegistry.bind(null, PAGE_BOTTOM);

document.addEventListener(
  'DOMContentLoaded',
  processRegistry.bind(null, DOM_READY),
  true
);
window.addEventListener(
  'load',
  processRegistry.bind(null, WINDOW_LOADED),
  true
);

// Depending on the way the Launch library was loaded, none of the registered listeners that
// execute `processRegistry` may fire . We need to execute the `processRegistry` method at
// least once. If this timeout fires before any of the registered listeners, we auto-detect the
// current lifecycle event and fire all the registered triggers in order. We don't care if the
// `processRegistry` is called multiple times for the same lifecycle event. We fire the registered
// triggers for a lifecycle event only once. We used a `setTimeout` here to make sure all the rules
// using Library Loaded are registered and executed synchronously and before rules using any of the
// other lifecycle event types.
window.setTimeout(function () {
  var lifecycleEvent = detectLifecycleEvent();
  if (lifecycleEvent) {
    processRegistry(lifecycleEvent);
  }
}, 0);

module.exports = {
  registerLibraryLoadedTrigger: function (trigger) {
    trigger();
  },
  registerPageBottomTrigger: function (trigger) {
    registry[PAGE_BOTTOM].push({
      trigger: trigger
    });
  },
  registerDomReadyTrigger: function (trigger) {
    registry[DOM_READY].push({
      trigger: trigger,
      syntheticEventFn: createSyntheticEvent.bind(null, document)
    });
  },
  registerWindowLoadedTrigger: function (trigger) {
    registry[WINDOW_LOADED].push({
      trigger: trigger,
      syntheticEventFn: createSyntheticEvent.bind(null, window)
    });
  }
};

          }

        }
      }
    }
  },
  "company": {
    "orgId": "0103FFA9573F6FF77F000101@AdobeOrg",
    "dynamicCdnEnabled": false
  },
  "property": {
    "name": "Self Hosting",
    "settings": {
      "domains": [
        "agastyareddy777.github.io"
      ],
      "undefinedVarsReturnEmpty": false,
      "ruleComponentSequencingEnabled": true
    },
    "id": "PRfcc3278bcec74ab9ba89f001f13c3e1f"
  },
  "rules": [
    {
      "id": "RL51760c0a8efb4f4ab21f39a2edebab33",
      "name": "global rule",
      "events": [
        {
          "modulePath": "core/src/lib/events/pageBottom.js",
          "settings": {
          },
          "ruleOrder": 50.0
        }
      ],
      "conditions": [

      ],
      "actions": [
        {
          "modulePath": "adobe-analytics/src/lib/actions/setVariables.js",
          "settings": {
            "trackerProperties": {
              "eVars": [
                {
                  "name": "eVar61",
                  "type": "value",
                  "value": "Test Page"
                }
              ]
            }
          },
          "timeout": 2000,
          "delayNext": true
        },
        {
          "modulePath": "adobe-analytics/src/lib/actions/sendBeacon.js",
          "settings": {
            "type": "page"
          },
          "timeout": 2000,
          "delayNext": true
        }
      ]
    }
  ]
}
})();

var _satellite = (function () {
	'use strict';

	if (!window.atob) { console.warn('Adobe Launch is unsupported in IE 9 and below.'); return; }

	var reactorDocument = document;

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty$1.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

	var reactorObjectAssign = objectAssign;

	var reactorWindow = window;

	/***************************************************************************************
	 * (c) 2021 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var createDynamicHostResolver = function (
	  turbineEmbedCode,
	  dynamicCdnEnabled,
	  cdnAllowList,
	  debugController
	) {
	  // A missing list means that we are not trying to dynamic replace (archives,
	  // sftp, no premium CDN option enabled on the company).
	  // even an empty list is flagging to us that we're trying to enforce dynamic
	  var isDynamicEnforced = Boolean(
	    dynamicCdnEnabled && Array.isArray(cdnAllowList)
	  );
	  var shouldAugment = Boolean(isDynamicEnforced && turbineEmbedCode);

	  // using document.createElement('a') because IE10/11 doesn't support new URL()
	  var turbineUrl = document.createElement('a');
	  if (isDynamicEnforced) {
	    var throwUnavailableEmbedCode = function () {
	      var missingEmbedCodeError = new Error(
	        'Unable to find the Library Embed Code for Dynamic Host Resolution.'
	      );
	      missingEmbedCodeError.code = 'dynamic_host_resolver_constructor_error';
	      throw missingEmbedCodeError;
	    };
	    if (turbineEmbedCode) {
	      if (!/^((https?:)?\/\/).+/.test(turbineEmbedCode)) {
	        throwUnavailableEmbedCode();
	      }
	      if (/^\/\/.+/.test(turbineEmbedCode)) {
	        // for IE 10, you must throw on the protocol
	        turbineUrl.href = reactorWindow.location.protocol + turbineEmbedCode;
	      } else {
	        turbineUrl.href = turbineEmbedCode;
	      }
	    }

	    // check URL construction
	    if (!turbineUrl.hostname) {
	      throwUnavailableEmbedCode();
	    }
	    // is this within the allowed list of hosts?
	    if (cdnAllowList.indexOf(turbineUrl.hostname) === -1) {
	      var dynamicDeniedError = new Error(
	        'This library is not authorized for this domain. ' +
	          'Please contact your CSM for more information.'
	      );
	      dynamicDeniedError.code = 'dynamic_host_not_allowed';
	      throw dynamicDeniedError;
	    }
	  }

	  /**
	   * Returns the host of the Turbine embed code, or an empty string if Dynamic Host
	   * is not enabled.
	   * @returns {string}
	   */
	  var memoizedHostResult;
	  var getTurbineHost = function () {
	    if (memoizedHostResult != null) {
	      return memoizedHostResult;
	    }

	    if (shouldAugment) {
	      // be sure we always force https to Adobe managed domains.
	      // IE 10/11 returns the :443 protocol when modern browsers don't, so this replacement
	      // is bringing every browser in line with the same return value
	      var sanitizedHost = turbineUrl.host;
	      if (/:80$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':80', '');
	      } else if (/:80\/$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':80/', '');
	      } else if (/:443$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':443', '');
	      } else if (/:443\/$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':443/', '');
	      }

	      memoizedHostResult = turbineUrl.protocol + '//' + sanitizedHost;
	    } else {
	      memoizedHostResult = '';
	    }

	    return memoizedHostResult;
	  };

	  /**
	   * Returns a url decorated with the host of the Turbine embed code. If Dynamic host
	   * is disabled, the original sourceUrl is returned unmodified.
	   * @param sourceUrl
	   * @returns {string|*}
	   */
	  var decorateWithDynamicHost = function (sourceUrl) {
	    if (shouldAugment && typeof sourceUrl === 'string') {
	      var urlParts = [
	        getTurbineHost(),
	        sourceUrl.charAt(0) === '/' ? sourceUrl.slice(1) : sourceUrl
	      ];

	      return urlParts.join('/');
	    }

	    return sourceUrl;
	  };

	  var dynamicHostResolver = {
	    getTurbineHost: getTurbineHost,
	    decorateWithDynamicHost: decorateWithDynamicHost,
	    get isDynamicEnforced() {
	      return isDynamicEnforced;
	    }
	  };

	  if (reactorWindow) {
	    debugController.onDebugChanged(function (isEnabled) {
	      if (isEnabled) {
	        reactorWindow.dynamicHostResolver = dynamicHostResolver;
	      } else {
	        delete reactorWindow.dynamicHostResolver;
	      }
	    });
	  }

	  return dynamicHostResolver;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Rules can be ordered by users at the event type level. For example, assume both Rule A and Rule B
	 * use the Library Loaded and Window Loaded event types. Rule A can be ordered to come before Rule B
	 * on Library Loaded but after Rule B on Window Loaded.
	 *
	 * Order values are integers and act more as a priority. In other words, multiple rules can have the
	 * same order value. If they have the same order value, their order of execution should be
	 * considered nondetermistic.
	 *
	 * @param {Array} rules
	 * @returns {Array} An ordered array of rule-event pair objects.
	 */
	var buildRuleExecutionOrder = function (rules) {
	  var ruleEventPairs = [];

	  rules.forEach(function (rule) {
	    if (rule.events) {
	      rule.events.forEach(function (event) {
	        ruleEventPairs.push({
	          rule: rule,
	          event: event
	        });
	      });
	    }
	  });

	  return ruleEventPairs.sort(function (ruleEventPairA, ruleEventPairB) {
	    return ruleEventPairA.event.ruleOrder - ruleEventPairB.event.ruleOrder;
	  });
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var DEBUG_LOCAL_STORAGE_NAME = 'debug';

	var createDebugController = function (localStorage, logger) {
	  var getPersistedDebugEnabled = function () {
	    return localStorage.getItem(DEBUG_LOCAL_STORAGE_NAME) === 'true';
	  };

	  var setPersistedDebugEnabled = function (enabled) {
	    localStorage.setItem(DEBUG_LOCAL_STORAGE_NAME, enabled);
	  };

	  var debugChangedCallbacks = [];
	  var onDebugChanged = function (callback) {
	    debugChangedCallbacks.push(callback);
	  };

	  logger.outputEnabled = getPersistedDebugEnabled();

	  return {
	    onDebugChanged: onDebugChanged,
	    getDebugEnabled: getPersistedDebugEnabled,
	    setDebugEnabled: function (enabled) {
	      if (getPersistedDebugEnabled() !== enabled) {
	        setPersistedDebugEnabled(enabled);
	        logger.outputEnabled = enabled;
	        debugChangedCallbacks.forEach(function (callback) {
	          callback(enabled);
	        });
	      }
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2018 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var MODULE_NOT_FUNCTION_ERROR = 'Module did not export a function.';

	var createExecuteDelegateModule = function (
	  moduleProvider,
	  replaceTokens,
	  settingsFileTransformer
	) {
	  return function (moduleDescriptor, syntheticEvent, moduleCallParameters) {
	    moduleCallParameters = moduleCallParameters || [];
	    var moduleExports = moduleProvider.getModuleExports(
	      moduleDescriptor.modulePath
	    );

	    if (typeof moduleExports !== 'function') {
	      throw new Error(MODULE_NOT_FUNCTION_ERROR);
	    }

	    // dynamically replace the host on the module settings
	    var moduleDefinition = moduleProvider.getModuleDefinition(
	      moduleDescriptor.modulePath
	    );

	    // We're transforming URLs in-place to ensure that the developer's settings object reference
	    // is the same object reference as moduleDescriptor.settings. Therefore, we must only transform
	    // the settings one time and save a reference saying that we've done that. We're saving this in
	    // the module descriptor of each event, condition, and action so that we aren't modifying the
	    // settings object.
	    var moduleSettings = moduleDescriptor.settings || {};
	    if (
	      !moduleDescriptor.hasTransformedFilePaths &&
	      moduleDefinition.filePaths
	    ) {
	      settingsFileTransformer(
	        moduleSettings,
	        moduleDefinition.filePaths,
	        moduleDescriptor.modulePath
	      );
	      moduleDescriptor.hasTransformedFilePaths = true;
	    }

	    // replace tokens
	    var moduleDescriptorSettings = replaceTokens(
	      moduleSettings,
	      syntheticEvent
	    );
	    return moduleExports
	      .bind(null, moduleDescriptorSettings)
	      .apply(null, moduleCallParameters);
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * "Cleans" text by trimming the string and removing spaces and newlines.
	 * @param {string} str The string to clean.
	 * @returns {string}
	 */
	var cleanText = function (str) {
	  return typeof str === 'string' ? str.replace(/\s+/g, ' ').trim() : str;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Log levels.
	 * @readonly
	 * @enum {string}
	 * @private
	 */
	var levels = {
	  LOG: 'log',
	  INFO: 'info',
	  DEBUG: 'debug',
	  WARN: 'warn',
	  ERROR: 'error'
	};

	/**
	 * Rocket unicode surrogate pair.
	 * @type {string}
	 */
	var ROCKET = '\uD83D\uDE80';

	/**
	 * The user's internet explorer version. If they're not running internet explorer, then it should
	 * be NaN.
	 * @type {Number}
	 */
	var ieVersion = parseInt(
	  (/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]
	);

	/**
	 * Prefix to use on all messages. The rocket unicode doesn't work on IE 10.
	 * @type {string}
	 */
	var launchPrefix = ieVersion === 10 ? '[Launch]' : ROCKET;

	/**
	 * Whether logged messages should be output to the console.
	 * @type {boolean}
	 */
	var outputEnabled = false;

	/**
	 * Processes a log message.
	 * @param {string} level The level of message to log.
	 * @param {...*} arg Any argument to be logged.
	 * @private
	 */
	var process = function (level) {
	  if (outputEnabled && window.console) {
	    var logArguments = Array.prototype.slice.call(arguments, 1);
	    logArguments.unshift(launchPrefix);
	    // window.debug is unsupported in IE 10
	    if (level === levels.DEBUG && !window.console[level]) {
	      level = levels.INFO;
	    }
	    window.console[level].apply(window.console, logArguments);
	  }
	};

	/**
	 * Outputs a message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var log = process.bind(null, levels.LOG);

	/**
	 * Outputs informational message to the web console. In some browsers a small "i" icon is
	 * displayed next to these items in the web console's log.
	 * @param {...*} arg Any argument to be logged.
	 */
	var info = process.bind(null, levels.INFO);

	/**
	 * Outputs debug message to the web console. In browsers that do not support
	 * console.debug, console.info is used instead.
	 * @param {...*} arg Any argument to be logged.
	 */
	var debug = process.bind(null, levels.DEBUG);

	/**
	 * Outputs a warning message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var warn = process.bind(null, levels.WARN);

	/**
	 * Outputs an error message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var error = process.bind(null, levels.ERROR);

	/**
	 * Outputs a warning message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var logDeprecation = function () {
	  var wasEnabled = outputEnabled;
	  outputEnabled = true;

	  process.apply(
	    null,
	    Array.prototype.concat(levels.WARN, Array.prototype.slice.call(arguments))
	  );

	  if (!wasEnabled) {
	    outputEnabled = false;
	  }
	};

	var logger = {
	  log: log,
	  info: info,
	  debug: debug,
	  warn: warn,
	  error: error,
	  deprecation: logDeprecation,
	  /**
	   * Whether logged messages should be output to the console.
	   * @type {boolean}
	   */
	  get outputEnabled() {
	    return outputEnabled;
	  },
	  set outputEnabled(value) {
	    outputEnabled = value;
	  },
	  /**
	   * Creates a logging utility that only exposes logging functionality and prefixes all messages
	   * with an identifier.
	   */
	  createPrefixedLogger: function (identifier) {
	    var loggerSpecificPrefix = '[' + identifier + ']';

	    return {
	      log: log.bind(null, loggerSpecificPrefix),
	      info: info.bind(null, loggerSpecificPrefix),
	      debug: debug.bind(null, loggerSpecificPrefix),
	      warn: warn.bind(null, loggerSpecificPrefix),
	      error: error.bind(null, loggerSpecificPrefix)
	    };
	  }
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var NAMESPACE = 'com.adobe.reactor.';

	var getNamespacedStorage = function (storageType, additionalNamespace) {
	  var finalNamespace = NAMESPACE + (additionalNamespace || '');

	  // When storage is disabled on Safari, the mere act of referencing window.localStorage
	  // or window.sessionStorage throws an error. For this reason, we wrap in a try-catch.
	  return {
	    /**
	     * Reads a value from storage.
	     * @param {string} name The name of the item to be read.
	     * @returns {string}
	     */
	    getItem: function (name) {
	      try {
	        return reactorWindow[storageType].getItem(finalNamespace + name);
	      } catch (e) {
	        return null;
	      }
	    },
	    /**
	     * Saves a value to storage.
	     * @param {string} name The name of the item to be saved.
	     * @param {string} value The value of the item to be saved.
	     * @returns {boolean} Whether the item was successfully saved to storage.
	     */
	    setItem: function (name, value) {
	      try {
	        reactorWindow[storageType].setItem(finalNamespace + name, value);
	        return true;
	      } catch (e) {
	        return false;
	      }
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var DATA_ELEMENTS_NAMESPACE = 'dataElements.';

	var dataElementSessionStorage = getNamespacedStorage(
	  'sessionStorage',
	  DATA_ELEMENTS_NAMESPACE
	);
	var dataElementLocalStorage = getNamespacedStorage(
	  'localStorage',
	  DATA_ELEMENTS_NAMESPACE
	);

	var storageDurations = {
	  PAGEVIEW: 'pageview',
	  SESSION: 'session',
	  VISITOR: 'visitor'
	};

	var pageviewCache = {};

	var serialize = function (value) {
	  var serialized;

	  try {
	    // On some browsers, with some objects, errors will be thrown during serialization. For example,
	    // in Chrome with the window object, it will throw "TypeError: Converting circular structure
	    // to JSON"
	    serialized = JSON.stringify(value);
	    // eslint-disable-next-line no-empty
	  } catch (e) {}

	  return serialized;
	};

	var setValue = function (key, storageDuration, value) {
	  var serializedValue;

	  switch (storageDuration) {
	    case storageDurations.PAGEVIEW:
	      pageviewCache[key] = value;
	      return;
	    case storageDurations.SESSION:
	      serializedValue = serialize(value);
	      if (serializedValue) {
	        dataElementSessionStorage.setItem(key, serializedValue);
	      }
	      return;
	    case storageDurations.VISITOR:
	      serializedValue = serialize(value);
	      if (serializedValue) {
	        dataElementLocalStorage.setItem(key, serializedValue);
	      }
	      return;
	  }
	};

	var getValue = function (key, storageDuration) {
	  var value;

	  // It should consistently return the same value if no stored item was found. We chose null,
	  // though undefined could be a reasonable value as well.
	  switch (storageDuration) {
	    case storageDurations.PAGEVIEW:
	      return pageviewCache.hasOwnProperty(key) ? pageviewCache[key] : null;
	    case storageDurations.SESSION:
	      value = dataElementSessionStorage.getItem(key);
	      return value === null ? value : JSON.parse(value);
	    case storageDurations.VISITOR:
	      value = dataElementLocalStorage.getItem(key);
	      return value === null ? value : JSON.parse(value);
	  }
	};

	var dataElementSafe = {
	  setValue: setValue,
	  getValue: getValue
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var getErrorMessage = function (
	  dataDef,
	  dataElementName,
	  errorMessage,
	  errorStack
	) {
	  return (
	    'Failed to execute data element module ' +
	    dataDef.modulePath +
	    ' for data element ' +
	    dataElementName +
	    '. ' +
	    errorMessage +
	    (errorStack ? '\n' + errorStack : '')
	  );
	};

	var createGetDataElementValue = function (
	  moduleProvider,
	  getDataElementDefinition,
	  replaceTokens,
	  undefinedVarsReturnEmpty,
	  settingsFileTransformer
	) {
	  return function (name, syntheticEvent) {
	    var dataDef = getDataElementDefinition(name);

	    if (!dataDef) {
	      return undefinedVarsReturnEmpty ? '' : undefined;
	    }

	    var storageDuration = dataDef.storageDuration;
	    var moduleExports;
	    var moduleDefinition;

	    try {
	      moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);
	      moduleDefinition = moduleProvider.getModuleDefinition(dataDef.modulePath);
	    } catch (e) {
	      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
	      return;
	    }

	    if (typeof moduleExports !== 'function') {
	      logger.error(
	        getErrorMessage(dataDef, name, 'Module did not export a function.')
	      );
	      return;
	    }

	    var value;

	    var dataElementSettings = dataDef.settings || {};
	    if (!dataDef.hasTransformedFilePaths && moduleDefinition.filePaths) {
	      settingsFileTransformer(
	        dataElementSettings,
	        moduleDefinition.filePaths,
	        dataDef.modulePath
	      );
	      dataDef.hasTransformedFilePaths = true;
	    }

	    try {
	      value = moduleExports(
	        replaceTokens(dataElementSettings, syntheticEvent),
	        syntheticEvent
	      );
	    } catch (e) {
	      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
	      return;
	    }

	    if (storageDuration) {
	      if (value != null) {
	        dataElementSafe.setValue(name, storageDuration, value);
	      } else {
	        value = dataElementSafe.getValue(name, storageDuration);
	      }
	    }

	    if (value == null && dataDef.defaultValue != null) {
	      value = dataDef.defaultValue;
	    }

	    if (typeof value === 'string') {
	      if (dataDef.cleanText) {
	        value = cleanText(value);
	      }

	      if (dataDef.forceLowerCase) {
	        value = value.toLowerCase();
	      }
	    }

	    return value;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var specialPropertyAccessors = {
	  text: function (obj) {
	    return obj.textContent;
	  },
	  cleanText: function (obj) {
	    return cleanText(obj.textContent);
	  }
	};

	/**
	 * This returns the value of a property at a given path. For example, a <code>path<code> of
	 * <code>foo.bar</code> will return the value of <code>obj.foo.bar</code>.
	 *
	 * In addition, if <code>path</code> is <code>foo.bar.getAttribute(unicorn)</code> and
	 * <code>obj.foo.bar</code> has a method named <code>getAttribute</code>, the method will be
	 * called with a value of <code>"unicorn"</code> and the value will be returned.
	 *
	 * Also, if <code>path</code> is <code>foo.bar.@text</code> or other supported properties
	 * beginning with <code>@</code>, a special accessor will be used.
	 *
	 * @param host
	 * @param path
	 * @param supportSpecial
	 * @returns {*}
	 */
	var getObjectProperty = function (host, propChain, supportSpecial) {
	  var value = host;
	  var attrMatch;
	  for (var i = 0, len = propChain.length; i < len; i++) {
	    if (value == null) {
	      return undefined;
	    }
	    var prop = propChain[i];
	    if (supportSpecial && prop.charAt(0) === '@') {
	      var specialProp = prop.slice(1);
	      value = specialPropertyAccessors[specialProp](value);
	      continue;
	    }
	    if (
	      value.getAttribute &&
	      (attrMatch = prop.match(/^getAttribute\((.+)\)$/))
	    ) {
	      var attr = attrMatch[1];
	      value = value.getAttribute(attr);
	      continue;
	    }
	    value = value[prop];
	  }
	  return value;
	};

	/**
	 * Returns the value of a variable.
	 * @param {string} variable
	 * @param {Object} [syntheticEvent] A synthetic event. Only required when using %event... %this...
	 * or %target...
	 * @returns {*}
	 */
	var createGetVar = function (
	  customVars,
	  getDataElementDefinition,
	  getDataElementValue
	) {
	  return function (variable, syntheticEvent) {
	    var value;

	    if (getDataElementDefinition(variable)) {
	      // Accessing nested properties of a data element using dot-notation is unsupported because
	      // users can currently create data elements with periods in the name.
	      value = getDataElementValue(variable, syntheticEvent);
	    } else {
	      var propChain = variable.split('.');
	      var variableHostName = propChain.shift();

	      if (variableHostName === 'this') {
	        if (syntheticEvent) {
	          // I don't know why this is the only one that supports special properties, but that's the
	          // way it was in Satellite.
	          value = getObjectProperty(syntheticEvent.element, propChain, true);
	        }
	      } else if (variableHostName === 'event') {
	        if (syntheticEvent) {
	          value = getObjectProperty(syntheticEvent, propChain);
	        }
	      } else if (variableHostName === 'target') {
	        if (syntheticEvent) {
	          value = getObjectProperty(syntheticEvent.target, propChain);
	        }
	      } else {
	        value = getObjectProperty(customVars[variableHostName], propChain);
	      }
	    }

	    return value;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Determines if the provided name is a valid variable, where the variable
	 * can be a data element, element, event, target, or custom var.
	 * @param variableName
	 * @returns {boolean}
	 */
	var createIsVar = function (customVars, getDataElementDefinition) {
	  return function (variableName) {
	    var nameBeforeDot = variableName.split('.')[0];

	    return Boolean(
	      getDataElementDefinition(variableName) ||
	        nameBeforeDot === 'this' ||
	        nameBeforeDot === 'event' ||
	        nameBeforeDot === 'target' ||
	        customVars.hasOwnProperty(nameBeforeDot)
	    );
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var extractModuleExports = function (script, require, turbine) {
	  var module = {
	    exports: {}
	  };

	  script.call(module.exports, module, module.exports, require, turbine);

	  return module.exports;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var createModuleProvider = function () {
	  var moduleByReferencePath = {};

	  var getModule = function (referencePath) {
	    var module = moduleByReferencePath[referencePath];

	    if (!module) {
	      throw new Error('Module ' + referencePath + ' not found.');
	    }

	    return module;
	  };

	  var registerModule = function (
	    referencePath,
	    moduleDefinition,
	    extensionName,
	    require,
	    turbine
	  ) {
	    var module = {
	      definition: moduleDefinition,
	      extensionName: extensionName,
	      require: require,
	      turbine: turbine
	    };
	    module.require = require;
	    moduleByReferencePath[referencePath] = module;
	  };

	  var hydrateCache = function () {
	    Object.keys(moduleByReferencePath).forEach(function (referencePath) {
	      try {
	        getModuleExports(referencePath);
	      } catch (e) {
	        var errorMessage =
	          'Error initializing module ' +
	          referencePath +
	          '. ' +
	          e.message +
	          (e.stack ? '\n' + e.stack : '');
	        logger.error(errorMessage);
	      }
	    });
	  };

	  var getModuleExports = function (referencePath) {
	    var module = getModule(referencePath);

	    // Using hasOwnProperty instead of a falsey check because the module could export undefined
	    // in which case we don't want to execute the module each time the exports is requested.
	    if (!module.hasOwnProperty('exports')) {
	      module.exports = extractModuleExports(
	        module.definition.script,
	        module.require,
	        module.turbine
	      );
	    }

	    return module.exports;
	  };

	  var getModuleDefinition = function (referencePath) {
	    return getModule(referencePath).definition;
	  };

	  var getModuleExtensionName = function (referencePath) {
	    return getModule(referencePath).extensionName;
	  };

	  return {
	    registerModule: registerModule,
	    hydrateCache: hydrateCache,
	    getModuleExports: getModuleExports,
	    getModuleDefinition: getModuleDefinition,
	    getModuleExtensionName: getModuleExtensionName
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var warningLogged = false;

	var createNotifyMonitors = function (_satellite) {
	  return function (type, event) {
	    var monitors = _satellite._monitors;

	    if (monitors) {
	      if (!warningLogged) {
	        logger.warn(
	          'The _satellite._monitors API may change at any time and should only ' +
	            'be used for debugging.'
	        );
	        warningLogged = true;
	      }

	      monitors.forEach(function (monitor) {
	        if (monitor[type]) {
	          monitor[type](event);
	        }
	      });
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	/**
	 * Replacing any variable tokens (%myDataElement%, %this.foo%, etc.) with their associated values.
	 * A new string, object, or array will be created; the thing being processed will never be
	 * modified.
	 * @param {*} thing Thing potentially containing variable tokens. Objects and arrays will be
	 * deeply processed.
	 * @param {HTMLElement} [element] Associated HTML element. Used for special tokens
	 * (%this.something%).
	 * @param {Object} [event] Associated event. Used for special tokens (%event.something%,
	 * %target.something%)
	 * @returns {*} A processed value.
	 */
	var createReplaceTokens = function (isVar, getVar, undefinedVarsReturnEmpty) {
	  var replaceTokensInString;
	  var replaceTokensInObject;
	  var replaceTokensInArray;
	  var replaceTokens;
	  var variablesBeingRetrieved = [];

	  var getVarValue = function (token, variableName, syntheticEvent) {
	    if (!isVar(variableName)) {
	      return token;
	    }

	    variablesBeingRetrieved.push(variableName);
	    var val = getVar(variableName, syntheticEvent);
	    variablesBeingRetrieved.pop();
	    return val == null && undefinedVarsReturnEmpty ? '' : val;
	  };

	  /**
	   * Perform variable substitutions to a string where tokens are specified in the form %foo%.
	   * If the only content of the string is a single data element token, then the raw data element
	   * value will be returned instead.
	   *
	   * @param str {string} The string potentially containing data element tokens.
	   * @param element {HTMLElement} The element to use for tokens in the form of %this.property%.
	   * @param event {Object} The event object to use for tokens in the form of %target.property%.
	   * @returns {*}
	   */
	  replaceTokensInString = function (str, syntheticEvent) {
	    // Is the string a single data element token and nothing else?
	    var result = /^%([^%]+)%$/.exec(str);

	    if (result) {
	      return getVarValue(str, result[1], syntheticEvent);
	    } else {
	      return str.replace(/%(.+?)%/g, function (token, variableName) {
	        return getVarValue(token, variableName, syntheticEvent);
	      });
	    }
	  };

	  replaceTokensInObject = function (obj, syntheticEvent) {
	    var ret = {};
	    var keys = Object.keys(obj);
	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      ret[key] = replaceTokens(value, syntheticEvent);
	    }
	    return ret;
	  };

	  replaceTokensInArray = function (arr, syntheticEvent) {
	    var ret = [];
	    for (var i = 0, len = arr.length; i < len; i++) {
	      ret.push(replaceTokens(arr[i], syntheticEvent));
	    }
	    return ret;
	  };

	  replaceTokens = function (thing, syntheticEvent) {
	    if (typeof thing === 'string') {
	      return replaceTokensInString(thing, syntheticEvent);
	    } else if (Array.isArray(thing)) {
	      return replaceTokensInArray(thing, syntheticEvent);
	    } else if (typeof thing === 'object' && thing !== null) {
	      return replaceTokensInObject(thing, syntheticEvent);
	    }

	    return thing;
	  };

	  return function (thing, syntheticEvent) {
	    // It's possible for a data element to reference another data element. Because of this,
	    // we need to prevent circular dependencies from causing an infinite loop.
	    if (variablesBeingRetrieved.length > 10) {
	      logger.error(
	        'Data element circular reference detected: ' +
	          variablesBeingRetrieved.join(' -> ')
	      );
	      return thing;
	    }

	    return replaceTokens(thing, syntheticEvent);
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var createSetCustomVar = function (customVars) {
	  return function () {
	    if (typeof arguments[0] === 'string') {
	      customVars[arguments[0]] = arguments[1];
	    } else if (arguments[0]) {
	      // assume an object literal
	      var mapping = arguments[0];
	      for (var key in mapping) {
	        customVars[key] = mapping[key];
	      }
	    }
	  };
	};

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	/**
	 * @this {Promise}
	 */
	function finallyConstructor(callback) {
	  var constructor = this.constructor;
	  return this.then(
	    function(value) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        return value;
	      });
	    },
	    function(reason) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        // @ts-ignore
	        return constructor.reject(reason);
	      });
	    }
	  );
	}

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function isArray(x) {
	  return Boolean(x && typeof x.length !== 'undefined');
	}

	function noop() {}

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
	  return function() {
	    fn.apply(thisArg, arguments);
	  };
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	function Promise$1(fn) {
	  if (!(this instanceof Promise$1))
	    throw new TypeError('Promises must be constructed via new');
	  if (typeof fn !== 'function') throw new TypeError('not a function');
	  /** @type {!number} */
	  this._state = 0;
	  /** @type {!boolean} */
	  this._handled = false;
	  /** @type {Promise|undefined} */
	  this._value = undefined;
	  /** @type {!Array<!Function>} */
	  this._deferreds = [];

	  doResolve(fn, this);
	}

	function handle(self, deferred) {
	  while (self._state === 3) {
	    self = self._value;
	  }
	  if (self._state === 0) {
	    self._deferreds.push(deferred);
	    return;
	  }
	  self._handled = true;
	  Promise$1._immediateFn(function() {
	    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	    if (cb === null) {
	      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	      return;
	    }
	    var ret;
	    try {
	      ret = cb(self._value);
	    } catch (e) {
	      reject(deferred.promise, e);
	      return;
	    }
	    resolve(deferred.promise, ret);
	  });
	}

	function resolve(self, newValue) {
	  try {
	    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    if (newValue === self)
	      throw new TypeError('A promise cannot be resolved with itself.');
	    if (
	      newValue &&
	      (typeof newValue === 'object' || typeof newValue === 'function')
	    ) {
	      var then = newValue.then;
	      if (newValue instanceof Promise$1) {
	        self._state = 3;
	        self._value = newValue;
	        finale(self);
	        return;
	      } else if (typeof then === 'function') {
	        doResolve(bind(then, newValue), self);
	        return;
	      }
	    }
	    self._state = 1;
	    self._value = newValue;
	    finale(self);
	  } catch (e) {
	    reject(self, e);
	  }
	}

	function reject(self, newValue) {
	  self._state = 2;
	  self._value = newValue;
	  finale(self);
	}

	function finale(self) {
	  if (self._state === 2 && self._deferreds.length === 0) {
	    Promise$1._immediateFn(function() {
	      if (!self._handled) {
	        Promise$1._unhandledRejectionFn(self._value);
	      }
	    });
	  }

	  for (var i = 0, len = self._deferreds.length; i < len; i++) {
	    handle(self, self._deferreds[i]);
	  }
	  self._deferreds = null;
	}

	/**
	 * @constructor
	 */
	function Handler(onFulfilled, onRejected, promise) {
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	  this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
	  var done = false;
	  try {
	    fn(
	      function(value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      },
	      function(reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      }
	    );
	  } catch (ex) {
	    if (done) return;
	    done = true;
	    reject(self, ex);
	  }
	}

	Promise$1.prototype['catch'] = function(onRejected) {
	  return this.then(null, onRejected);
	};

	Promise$1.prototype.then = function(onFulfilled, onRejected) {
	  // @ts-ignore
	  var prom = new this.constructor(noop);

	  handle(this, new Handler(onFulfilled, onRejected, prom));
	  return prom;
	};

	Promise$1.prototype['finally'] = finallyConstructor;

	Promise$1.all = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.all accepts an array'));
	    }

	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;

	    function res(i, val) {
	      try {
	        if (val && (typeof val === 'object' || typeof val === 'function')) {
	          var then = val.then;
	          if (typeof then === 'function') {
	            then.call(
	              val,
	              function(val) {
	                res(i, val);
	              },
	              reject
	            );
	            return;
	          }
	        }
	        args[i] = val;
	        if (--remaining === 0) {
	          resolve(args);
	        }
	      } catch (ex) {
	        reject(ex);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	};

	Promise$1.resolve = function(value) {
	  if (value && typeof value === 'object' && value.constructor === Promise$1) {
	    return value;
	  }

	  return new Promise$1(function(resolve) {
	    resolve(value);
	  });
	};

	Promise$1.reject = function(value) {
	  return new Promise$1(function(resolve, reject) {
	    reject(value);
	  });
	};

	Promise$1.race = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.race accepts an array'));
	    }

	    for (var i = 0, len = arr.length; i < len; i++) {
	      Promise$1.resolve(arr[i]).then(resolve, reject);
	    }
	  });
	};

	// Use polyfill for setImmediate for performance gains
	Promise$1._immediateFn =
	  // @ts-ignore
	  (typeof setImmediate === 'function' &&
	    function(fn) {
	      // @ts-ignore
	      setImmediate(fn);
	    }) ||
	  function(fn) {
	    setTimeoutFunc(fn, 0);
	  };

	Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	  if (typeof console !== 'undefined' && console) {
	    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	  }
	};

	var src$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': Promise$1
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(src$1);

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	// For building Turbine we are using Rollup. For running the turbine tests we are using
	// Karma + Webpack. You need to specify the default import when using promise-polyfill`
	// with Webpack 2+. We need `require('promise-polyfill').default` for running the tests
	// and `require('promise-polyfill')` for building Turbine.
	var reactorPromise =
	  (typeof window !== 'undefined' && window.Promise) ||
	  (typeof commonjsGlobal !== 'undefined' && commonjsGlobal.Promise) ||
	  require$$0.default ||
	  require$$0;

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var createAddActionToQueue = function (
	  executeDelegateModule,
	  normalizeRuleComponentError,
	  logActionError
	) {
	  return function (action, rule, syntheticEvent, lastPromiseInQueue) {
	    return lastPromiseInQueue.then(function () {
	      // This module is used when ruleComponentSequencing is enabled.
	      // action.timeout is always supplied to this module as >= 0 when delayNext is true.

	      var delayNextAction = action.delayNext;
	      var actionTimeoutId;

	      return new reactorPromise(function (resolve, reject) {
	        var moduleResult = executeDelegateModule(action, syntheticEvent, [
	          syntheticEvent
	        ]);

	        if (!delayNextAction) {
	          return resolve();
	        }

	        var promiseTimeoutMs = action.timeout;
	        var timeoutPromise = new reactorPromise(function (resolve, reject) {
	          actionTimeoutId = setTimeout(function () {
	            reject(
	              new Error(
	                'A timeout occurred because the action took longer than ' +
	                  promiseTimeoutMs / 1000 +
	                  ' seconds to complete. '
	              )
	            );
	          }, promiseTimeoutMs);
	        });

	        reactorPromise.race([moduleResult, timeoutPromise]).then(resolve, reject);
	      })
	        .catch(function (e) {
	          clearTimeout(actionTimeoutId);
	          e = normalizeRuleComponentError(e);
	          logActionError(action, rule, e);
	          return reactorPromise.reject(e);
	        })
	        .then(function () {
	          clearTimeout(actionTimeoutId);
	        });
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var createAddConditionToQueue = function (
	  executeDelegateModule,
	  normalizeRuleComponentError,
	  isConditionMet,
	  logConditionError,
	  logConditionNotMet
	) {
	  return function (condition, rule, syntheticEvent, lastPromiseInQueue) {
	    return lastPromiseInQueue.then(function () {
	      // This module is used when ruleComponentSequencing is enabled.
	      // condition.timeout is always supplied to this module as >= 0.
	      // Conditions always assume delayNext = true because we have to know the
	      // condition result before moving on.
	      var conditionTimeoutId;

	      return new reactorPromise(function (resolve, reject) {
	        var moduleResult = executeDelegateModule(condition, syntheticEvent, [
	          syntheticEvent
	        ]);

	        var promiseTimeoutMs = condition.timeout;
	        var timeoutPromise = new reactorPromise(function (resolve, reject) {
	          conditionTimeoutId = setTimeout(function () {
	            reject(
	              new Error(
	                'A timeout occurred because the condition took longer than ' +
	                  promiseTimeoutMs / 1000 +
	                  ' seconds to complete. '
	              )
	            );
	          }, promiseTimeoutMs);
	        });

	        reactorPromise.race([moduleResult, timeoutPromise]).then(resolve, reject);
	      })
	        .catch(function (e) {
	          clearTimeout(conditionTimeoutId);
	          e = normalizeRuleComponentError(e);
	          logConditionError(condition, rule, e);
	          return reactorPromise.reject(e);
	        })
	        .then(function (result) {
	          clearTimeout(conditionTimeoutId);
	          if (!isConditionMet(condition, result)) {
	            logConditionNotMet(condition, rule);
	            return reactorPromise.reject();
	          }
	        });
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var lastPromiseInQueue = reactorPromise.resolve();

	var createAddRuleToQueue = function (
	  addConditionToQueue,
	  addActionToQueue,
	  logRuleCompleted
	) {
	  return function (rule, syntheticEvent) {
	    if (rule.conditions) {
	      rule.conditions.forEach(function (condition) {
	        lastPromiseInQueue = addConditionToQueue(
	          condition,
	          rule,
	          syntheticEvent,
	          lastPromiseInQueue
	        );
	      });
	    }

	    if (rule.actions) {
	      rule.actions.forEach(function (action) {
	        lastPromiseInQueue = addActionToQueue(
	          action,
	          rule,
	          syntheticEvent,
	          lastPromiseInQueue
	        );
	      });
	    }

	    lastPromiseInQueue = lastPromiseInQueue.then(function () {
	      logRuleCompleted(rule);
	    });

	    // Allows later rules to keep running when an error occurs within this rule.
	    lastPromiseInQueue = lastPromiseInQueue.catch(function () {});

	    return lastPromiseInQueue;
	  };
	};

	var isPromiseLike = function (value) {
	  return Boolean(
	    value && typeof value === 'object' && typeof value.then === 'function'
	  );
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var createEvaluateConditions = function (
	  executeDelegateModule,
	  isConditionMet,
	  logConditionNotMet,
	  logConditionError
	) {
	  return function (rule, syntheticEvent) {
	    var condition;

	    if (rule.conditions) {
	      for (var i = 0; i < rule.conditions.length; i++) {
	        condition = rule.conditions[i];

	        try {
	          var result = executeDelegateModule(condition, syntheticEvent, [
	            syntheticEvent
	          ]);

	          // If the result is promise-like, the extension needs to do something asynchronously,
	          // but the customer does not have rule component sequencing enabled on the property.
	          // If we didn't do this, the condition would always pass because the promise is
	          // considered "truthy".
	          if (isPromiseLike(result)) {
	            throw new Error(
	              'Rule component sequencing must be enabled on the property ' +
	                'for this condition to function properly.'
	            );
	          }

	          if (!isConditionMet(condition, result)) {
	            logConditionNotMet(condition, rule);
	            return false;
	          }
	        } catch (e) {
	          logConditionError(condition, rule, e);
	          return false;
	        }
	      }
	    }

	    return true;
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createExecuteRule = function (evaluateConditions, runActions) {
	  return function (rule, normalizedSyntheticEvent) {
	    if (evaluateConditions(rule, normalizedSyntheticEvent)) {
	      runActions(rule, normalizedSyntheticEvent);
	    }
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createGetModuleDisplayNameByRuleComponent = function (moduleProvider) {
	  return function (ruleComponent) {
	    var moduleDefinition = moduleProvider.getModuleDefinition(
	      ruleComponent.modulePath
	    );
	    return (
	      (moduleDefinition && moduleDefinition.displayName) ||
	      ruleComponent.modulePath
	    );
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createGetSyntheticEventMeta = function (moduleProvider) {
	  return function (ruleEventPair) {
	    var rule = ruleEventPair.rule;
	    var event = ruleEventPair.event;

	    var moduleName = moduleProvider.getModuleDefinition(event.modulePath).name;
	    var extensionName = moduleProvider.getModuleExtensionName(event.modulePath);

	    return {
	      $type: extensionName + '.' + moduleName,
	      $rule: {
	        id: rule.id,
	        name: rule.name
	      }
	    };
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createInitEventModule = function (
	  triggerRule,
	  executeDelegateModule,
	  normalizeSyntheticEvent,
	  getErrorMessage,
	  getSyntheticEventMeta,
	  logger
	) {
	  return function (guardUntilAllInitialized, ruleEventPair) {
	    var rule = ruleEventPair.rule;
	    var event = ruleEventPair.event;
	    event.settings = event.settings || {};

	    try {
	      var syntheticEventMeta = getSyntheticEventMeta(ruleEventPair);

	      executeDelegateModule(event, null, [
	        /**
	         * This is the callback that executes a particular rule when an event has occurred.
	         * @param {Object} [syntheticEvent] An object that contains detail regarding the event
	         * that occurred.
	         */
	        function trigger(syntheticEvent) {
	          // DTM-11871
	          // If we're still in the process of initializing event modules,
	          // we need to queue up any calls to trigger, otherwise if the triggered
	          // rule does something that triggers a different rule whose event module
	          // has not been initialized, that secondary rule will never get executed.
	          // This can be removed if we decide to always use the rule queue, since
	          // conditions and actions will be processed asynchronously, which
	          // would give time for all event modules to be initialized.

	          var normalizedSyntheticEvent = normalizeSyntheticEvent(
	            syntheticEventMeta,
	            syntheticEvent
	          );

	          guardUntilAllInitialized(function () {
	            triggerRule(normalizedSyntheticEvent, rule);
	          });
	        }
	      ]);
	    } catch (e) {
	      logger.error(getErrorMessage(event, rule, e));
	    }
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogActionError = function (
	  getRuleComponentErrorMessage,
	  getModuleDisplayNameByRuleComponent,
	  logger,
	  notifyMonitors
	) {
	  return function (action, rule, e) {
	    var actionDisplayName = getModuleDisplayNameByRuleComponent(action);

	    logger.error(getRuleComponentErrorMessage(actionDisplayName, rule.name, e));

	    notifyMonitors('ruleActionFailed', {
	      rule: rule,
	      action: action
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogConditionError = function (
	  getRuleComponentErrorMessage,
	  getModuleDisplayNameByRuleComponent,
	  logger,
	  notifyMonitors
	) {
	  return function (condition, rule, e) {
	    var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

	    logger.error(
	      getRuleComponentErrorMessage(conditionDisplayName, rule.name, e)
	    );

	    notifyMonitors('ruleConditionFailed', {
	      rule: rule,
	      condition: condition
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogConditionNotMet = function (
	  getModuleDisplayNameByRuleComponent,
	  logger,
	  notifyMonitors
	) {
	  return function (condition, rule) {
	    var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

	    logger.log(
	      'Condition "' +
	        conditionDisplayName +
	        '" for rule "' +
	        rule.name +
	        '" was not met.'
	    );

	    notifyMonitors('ruleConditionFailed', {
	      rule: rule,
	      condition: condition
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogRuleCompleted = function (logger, notifyMonitors) {
	  return function (rule) {
	    logger.log('Rule "' + rule.name + '" fired.');
	    notifyMonitors('ruleCompleted', {
	      rule: rule
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createRunActions = function (
	  executeDelegateModule,
	  logActionError,
	  logRuleCompleted
	) {
	  return function (rule, syntheticEvent) {
	    var action;

	    if (rule.actions) {
	      for (var i = 0; i < rule.actions.length; i++) {
	        action = rule.actions[i];
	        try {
	          executeDelegateModule(action, syntheticEvent, [syntheticEvent]);
	        } catch (e) {
	          logActionError(action, rule, e);
	          return;
	        }
	      }
	    }

	    logRuleCompleted(rule);
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createTriggerRule = function (
	  ruleComponentSequencingEnabled,
	  executeRule,
	  addRuleToQueue,
	  notifyMonitors
	) {
	  return function (normalizedSyntheticEvent, rule) {
	    notifyMonitors('ruleTriggered', {
	      rule: rule
	    });

	    if (ruleComponentSequencingEnabled) {
	      addRuleToQueue(rule, normalizedSyntheticEvent);
	    } else {
	      executeRule(rule, normalizedSyntheticEvent);
	    }
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var getRuleComponentErrorMessage = function (ruleComponentName, ruleName, error) {
	  return (
	    'Failed to execute "' +
	    ruleComponentName +
	    '" for "' +
	    ruleName +
	    '" rule. ' +
	    error.message +
	    (error.stack ? '\n' + error.stack : '')
	  );
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var isConditionMet = function (condition, result) {
	  return (result && !condition.negate) || (!result && condition.negate);
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var triggerCallQueue = [];
	var eventModulesInitialized = false;

	var guardUntilAllInitialized = function (callback) {
	  if (!eventModulesInitialized) {
	    triggerCallQueue.push(callback);
	  } else {
	    callback();
	  }
	};

	var initRules = function (buildRuleExecutionOrder, rules, initEventModule) {
	  buildRuleExecutionOrder(rules).forEach(function (ruleEventPair) {
	    initEventModule(guardUntilAllInitialized, ruleEventPair);
	  });

	  eventModulesInitialized = true;
	  triggerCallQueue.forEach(function (triggerCall) {
	    triggerCall();
	  });

	  triggerCallQueue = [];
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var normalizeRuleComponentError = function (e) {
	  if (!e) {
	    e = new Error(
	      'The extension triggered an error, but no error information was provided.'
	    );
	  }

	  if (!(e instanceof Error)) {
	    var stringifiedError =
	      typeof e === 'object' ? JSON.stringify(e) : String(e);
	    e = new Error(stringifiedError);
	  }

	  return e;
	};

	/*!
	 * isobject <https://github.com/jonschlinkert/isobject>
	 *
	 * Copyright (c) 2014-2017, Jon Schlinkert.
	 * Released under the MIT License.
	 */

	var isobject = function isObject(val) {
	  return val != null && typeof val === 'object' && Array.isArray(val) === false;
	};

	/*!
	 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
	 *
	 * Copyright (c) 2014-2017, Jon Schlinkert.
	 * Released under the MIT License.
	 */



	function isObjectObject(o) {
	  return isobject(o) === true
	    && Object.prototype.toString.call(o) === '[object Object]';
	}

	var isPlainObject = function isPlainObject(o) {
	  var ctor,prot;

	  if (isObjectObject(o) === false) return false;

	  // If has modified constructor
	  ctor = o.constructor;
	  if (typeof ctor !== 'function') return false;

	  // If has modified prototype
	  prot = ctor.prototype;
	  if (isObjectObject(prot) === false) return false;

	  // If constructor does not have an Object-specific method
	  if (prot.hasOwnProperty('isPrototypeOf') === false) {
	    return false;
	  }

	  // Most likely a plain Object
	  return true;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	/**
	 * Normalizes a synthetic event so that it exists and has at least meta.
	 * @param {Object} syntheticEventMeta
	 * @param {Object} [syntheticEvent]
	 * @returns {Object}
	 */
	var normalizeSyntheticEvent = function (syntheticEventMeta, syntheticEvent) {
	  syntheticEvent = syntheticEvent || {};

	  // This ensures that as the user hands us a synthetic event for multiple rules,
	  // we aren't overwriting a new meta into the same object reference.
	  if (isPlainObject(syntheticEvent)) {
	    syntheticEvent = reactorObjectAssign({}, syntheticEvent, syntheticEventMeta);
	  } else {
	    // When syntheticEvent is not an object, there's nothing we can guarantee
	    // about the ability to "copy". Leave it alone.
	    reactorObjectAssign(syntheticEvent, syntheticEventMeta);
	  }

	  // Remove after some arbitrary time period when we think users have had sufficient chance
	  // to move away from event.type
	  if (!syntheticEvent.hasOwnProperty('type')) {
	    Object.defineProperty(syntheticEvent, 'type', {
	      get: function () {
	        logger.deprecation(
	          'Accessing event.type in Adobe Launch has been deprecated and will be ' +
	            'removed soon. Please use event.$type instead.'
	        );
	        return syntheticEvent.$type;
	      }
	    });
	  }

	  return syntheticEvent;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Creates a function that, when called with an extension name and module name, will return the
	 * exports of the respective shared module.
	 *
	 * @param {Object} extensions
	 * @param {Object} moduleProvider
	 * @returns {Function}
	 */
	var createGetSharedModuleExports = function (extensions, moduleProvider) {
	  return function (extensionName, moduleName) {
	    var extension = extensions[extensionName];

	    if (extension) {
	      var modules = extension.modules;
	      if (modules) {
	        var referencePaths = Object.keys(modules);
	        for (var i = 0; i < referencePaths.length; i++) {
	          var referencePath = referencePaths[i];
	          var module = modules[referencePath];
	          if (module.shared && module.name === moduleName) {
	            return moduleProvider.getModuleExports(referencePath);
	          }
	        }
	      }
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Creates a function that, when called, will return a configuration object with data element
	 * tokens replaced.
	 *
	 * @param {Object} settings
	 * @returns {Function}
	 */
	var createGetExtensionSettings = function (replaceTokens, settings) {
	  return function () {
	    return settings ? replaceTokens(settings) : {};
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Creates a function that, when called, will return the full hosted lib file URL.
	 *
	 * @param {string} hostedLibFilesBaseUrl
	 * @returns {Function}
	 */

	var createGetHostedLibFileUrl = function (
	  decorateWithDynamicHost,
	  hostedLibFilesBaseUrl,
	  minified
	) {
	  return function (file) {
	    if (minified) {
	      var fileParts = file.split('.');
	      fileParts.splice(fileParts.length - 1 || 1, 0, 'min');
	      file = fileParts.join('.');
	    }

	    return decorateWithDynamicHost(hostedLibFilesBaseUrl) + file;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var JS_EXTENSION = '.js';

	/**
	 * @private
	 * Returns the directory of a path. A limited version of path.dirname in nodejs.
	 *
	 * To keep it simple, it makes the following assumptions:
	 * path has a least one slash
	 * path does not end with a slash
	 * path does not have empty segments (e.g., /src/lib//foo.bar)
	 *
	 * @param {string} path
	 * @returns {string}
	 */
	var dirname = function (path) {
	  return path.substr(0, path.lastIndexOf('/'));
	};

	/**
	 * Determines if a string ends with a certain string.
	 * @param {string} str The string to test.
	 * @param {string} suffix The suffix to look for at the end of str.
	 * @returns {boolean} Whether str ends in suffix.
	 */
	var endsWith = function (str, suffix) {
	  return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	/**
	 * Given a starting path and a path relative to the starting path, returns the final path. A
	 * limited version of path.resolve in nodejs.
	 *
	 * To keep it simple, it makes the following assumptions:
	 * fromPath has at least one slash
	 * fromPath does not end with a slash.
	 * fromPath does not have empty segments (e.g., /src/lib//foo.bar)
	 * relativePath starts with ./ or ../
	 *
	 * @param {string} fromPath
	 * @param {string} relativePath
	 * @returns {string}
	 */
	var resolveRelativePath = function (fromPath, relativePath) {
	  // Handle the case where the relative path does not end in the .js extension. We auto-append it.
	  if (!endsWith(relativePath, JS_EXTENSION)) {
	    relativePath = relativePath + JS_EXTENSION;
	  }

	  var relativePathSegments = relativePath.split('/');
	  var resolvedPathSegments = dirname(fromPath).split('/');

	  relativePathSegments.forEach(function (relativePathSegment) {
	    if (!relativePathSegment || relativePathSegment === '.') {
	      return;
	    } else if (relativePathSegment === '..') {
	      if (resolvedPathSegments.length) {
	        resolvedPathSegments.pop();
	      }
	    } else {
	      resolvedPathSegments.push(relativePathSegment);
	    }
	  });

	  return resolvedPathSegments.join('/');
	};

	/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */

	var js_cookie = createCommonjsModule(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	});

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/



	// js-cookie has other methods that we haven't exposed here. By limiting the exposed API,
	// we have a little more flexibility to change the underlying implementation later. If clear
	// use cases come up for needing the other methods js-cookie exposes, we can re-evaluate whether
	// we want to expose them here.
	var reactorCookie = {
	  get: js_cookie.get,
	  set: js_cookie.set,
	  remove: js_cookie.remove
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/



	var getPromise = function(url, script) {
	  return new reactorPromise(function(resolve, reject) {
	    script.onload = function() {
	      resolve(script);
	    };

	    script.onerror = function() {
	      reject(new Error('Failed to load script ' + url));
	    };
	  });
	};

	var reactorLoadScript = function(url) {
	  var script = document.createElement('script');
	  script.src = url;
	  script.async = true;

	  var promise = getPromise(url, script);

	  document.getElementsByTagName('head')[0].appendChild(script);
	  return promise;
	};

	// Copyright Joyent, Inc. and other Node contributors.

	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	var decode = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	};

	// Copyright Joyent, Inc. and other Node contributors.

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	var encode = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};

	var querystring = createCommonjsModule(function (module, exports) {

	exports.decode = exports.parse = decode;
	exports.encode = exports.stringify = encode;
	});

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/



	// We proxy the underlying querystring module so we can limit the API we expose.
	// This allows us to more easily make changes to the underlying implementation later without
	// having to worry about breaking extensions. If extensions demand additional functionality, we
	// can make adjustments as needed.
	var reactorQueryString = {
	  parse: function(string) {
	    //
	    if (typeof string === 'string') {
	      // Remove leading ?, #, & for some leniency so you can pass in location.search or
	      // location.hash directly.
	      string = string.trim().replace(/^[?#&]/, '');
	    }
	    return querystring.parse(string);
	  },
	  stringify: function(object) {
	    return querystring.stringify(object);
	  }
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var CORE_MODULE_PREFIX = '@adobe/reactor-';

	var modules = {
	  cookie: reactorCookie,
	  document: reactorDocument,
	  'load-script': reactorLoadScript,
	  'object-assign': reactorObjectAssign,
	  promise: reactorPromise,
	  'query-string': reactorQueryString,
	  window: reactorWindow
	};

	/**
	 * Creates a function which can be passed as a "require" function to extension modules.
	 *
	 * @param {Function} getModuleExportsByRelativePath
	 * @returns {Function}
	 */
	var createPublicRequire = function (getModuleExportsByRelativePath) {
	  return function (key) {
	    if (key.indexOf(CORE_MODULE_PREFIX) === 0) {
	      var keyWithoutScope = key.substr(CORE_MODULE_PREFIX.length);
	      var module = modules[keyWithoutScope];

	      if (module) {
	        return module;
	      }
	    }

	    if (key.indexOf('./') === 0 || key.indexOf('../') === 0) {
	      return getModuleExportsByRelativePath(key);
	    }

	    throw new Error('Cannot resolve module "' + key + '".');
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var hydrateModuleProvider = function (
	  container,
	  moduleProvider,
	  debugController,
	  replaceTokens,
	  getDataElementValue,
	  settingsFileTransformer,
	  decorateWithDynamicHost
	) {
	  var extensions = container.extensions;
	  var buildInfo = container.buildInfo;
	  var environment = container.environment;
	  var propertySettings = container.property.settings;

	  if (extensions) {
	    var getSharedModuleExports = createGetSharedModuleExports(
	      extensions,
	      moduleProvider
	    );

	    Object.keys(extensions).forEach(function (extensionName) {
	      var extension = extensions[extensionName];
	      var extensionSettings = extension.settings;
	      if (Array.isArray(extension.filePaths)) {
	        extensionSettings = settingsFileTransformer(
	          extensionSettings,
	          extension.filePaths
	        );
	      }
	      var getExtensionSettings = createGetExtensionSettings(
	        replaceTokens,
	        extensionSettings
	      );

	      if (extension.modules) {
	        var prefixedLogger = logger.createPrefixedLogger(extension.displayName);
	        var getHostedLibFileUrl = createGetHostedLibFileUrl(
	          decorateWithDynamicHost,
	          extension.hostedLibFilesBaseUrl,
	          buildInfo.minified
	        );
	        var turbine = {
	          buildInfo: buildInfo,
	          environment: environment,
	          property: {
	            name: container.property.name,
	            id: container.property.id
	          },
	          getDataElementValue: getDataElementValue,
	          getExtensionSettings: getExtensionSettings,
	          getHostedLibFileUrl: getHostedLibFileUrl,
	          getSharedModule: getSharedModuleExports,
	          logger: prefixedLogger,
	          propertySettings: propertySettings,
	          replaceTokens: replaceTokens,
	          onDebugChanged: debugController.onDebugChanged,
	          get debugEnabled() {
	            return debugController.getDebugEnabled();
	          }
	        };

	        Object.keys(extension.modules).forEach(function (referencePath) {
	          var module = extension.modules[referencePath];
	          var getModuleExportsByRelativePath = function (relativePath) {
	            var resolvedReferencePath = resolveRelativePath(
	              referencePath,
	              relativePath
	            );
	            return moduleProvider.getModuleExports(resolvedReferencePath);
	          };
	          var publicRequire = createPublicRequire(
	            getModuleExportsByRelativePath
	          );

	          moduleProvider.registerModule(
	            referencePath,
	            module,
	            extensionName,
	            publicRequire,
	            turbine
	          );
	        });
	      }
	    });

	    // We want to extract the module exports immediately to allow the modules
	    // to run some logic immediately.
	    // We need to do the extraction here in order for the moduleProvider to
	    // have all the modules previously registered. (eg. when moduleA needs moduleB, both modules
	    // must exist inside moduleProvider).
	    moduleProvider.hydrateCache();
	  }
	  return moduleProvider;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var hydrateSatelliteObject = function (
	  _satellite,
	  container,
	  setDebugEnabled,
	  getVar,
	  setCustomVar
	) {
	  var customScriptPrefixedLogger = logger.createPrefixedLogger('Custom Script');

	  // Will get replaced by the directCall event delegate from the Core extension. Exists here in
	  // case there are no direct call rules (and therefore the directCall event delegate won't get
	  // included) and our customers are still calling the method. In this case, we don't want an error
	  // to be thrown. This method existed before Reactor.
	  _satellite.track = function (identifier) {
	    logger.log(
	      '"' + identifier + '" does not match any direct call identifiers.'
	    );
	  };

	  // Will get replaced by the Marketing Cloud ID extension if installed. Exists here in case
	  // the extension is not installed and our customers are still calling the method. In this case,
	  // we don't want an error to be thrown. This method existed before Reactor.
	  _satellite.getVisitorId = function () {
	    return null;
	  };

	  // container.property also has property settings, but it shouldn't concern the user.
	  // By limiting our API exposure to necessities, we provide more flexibility in the future.
	  _satellite.property = {
	    name: container.property.name,
	    id: container.property.id
	  };

	  _satellite.company = container.company;

	  _satellite.buildInfo = container.buildInfo;

	  _satellite.environment = container.environment;

	  _satellite.logger = customScriptPrefixedLogger;

	  /**
	   * Log a message. We keep this due to legacy baggage.
	   * @param {string} message The message to log.
	   * @param {number} [level] A number that represents the level of logging.
	   * 3=info, 4=warn, 5=error, anything else=log
	   */
	  _satellite.notify = function (message, level) {
	    logger.deprecation(
	      '_satellite.notify is deprecated. Please use the `_satellite.logger` API.'
	    );

	    switch (level) {
	      case 3:
	        customScriptPrefixedLogger.info(message);
	        break;
	      case 4:
	        customScriptPrefixedLogger.warn(message);
	        break;
	      case 5:
	        customScriptPrefixedLogger.error(message);
	        break;
	      default:
	        customScriptPrefixedLogger.log(message);
	    }
	  };

	  _satellite.getVar = getVar;
	  _satellite.setVar = setCustomVar;

	  /**
	   * Writes a cookie.
	   * @param {string} name The name of the cookie to save.
	   * @param {string} value The value of the cookie to save.
	   * @param {number} [days] The number of days to store the cookie. If not specified, the cookie
	   * will be stored for the session only.
	   */
	  _satellite.setCookie = function (name, value, days) {
	    var optionsStr = '';
	    var options = {};

	    if (days) {
	      optionsStr = ', { expires: ' + days + ' }';
	      options.expires = days;
	    }

	    var msg =
	      '_satellite.setCookie is deprecated. Please use ' +
	      '_satellite.cookie.set("' +
	      name +
	      '", "' +
	      value +
	      '"' +
	      optionsStr +
	      ').';

	    logger.deprecation(msg);
	    reactorCookie.set(name, value, options);
	  };

	  /**
	   * Reads a cookie value.
	   * @param {string} name The name of the cookie to read.
	   * @returns {string}
	   */
	  _satellite.readCookie = function (name) {
	    logger.deprecation(
	      '_satellite.readCookie is deprecated. ' +
	        'Please use _satellite.cookie.get("' +
	        name +
	        '").'
	    );
	    return reactorCookie.get(name);
	  };

	  /**
	   * Removes a cookie value.
	   * @param name
	   */
	  _satellite.removeCookie = function (name) {
	    logger.deprecation(
	      '_satellite.removeCookie is deprecated. ' +
	        'Please use _satellite.cookie.remove("' +
	        name +
	        '").'
	    );
	    reactorCookie.remove(name);
	  };

	  _satellite.cookie = reactorCookie;

	  // Will get replaced by the pageBottom event delegate from the Core extension. Exists here in
	  // case the customers are not using core (and therefore the pageBottom event delegate won't get
	  // included) and they are still calling the method. In this case, we don't want an error
	  // to be thrown. This method existed before Reactor.
	  _satellite.pageBottom = function () {};

	  _satellite.setDebug = setDebugEnabled;

	  var warningLogged = false;

	  Object.defineProperty(_satellite, '_container', {
	    get: function () {
	      if (!warningLogged) {
	        logger.warn(
	          '_satellite._container may change at any time and should only ' +
	            'be used for debugging.'
	        );
	        warningLogged = true;
	      }

	      return container;
	    }
	  });
	};

	/***************************************************************************************
	 * (c) 2021 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	function isArrayReference(str) {
	  return (
	    typeof str === 'string' &&
	    str.indexOf('[') !== -1 &&
	    str.indexOf(']') !== -1
	  );
	}
	function sanitizeArrayKey(pathStrSegment) {
	  return pathStrSegment.substr(
	    0,
	    // the name goes up to the start of the array bracket: 'someArrayName[]'
	    pathStrSegment.indexOf('[')
	  );
	}

	/**
	 * Recursive function to loop through settings and look for the setting to transform,
	 * which is the final entry within the pathSegments array. Alters settings in-place.
	 * @param {Array} pathSegments
	 * @param {Object} settings
	 * @param {Function} decorateWithDynamicHost
	 */
	function traverseIntoSettings(pathSegments, settings, decorateWithDynamicHost) {
	  // nothing to do
	  if (!pathSegments.length || !isPlainObject(settings)) {
	    return;
	  }

	  var currentKey = pathSegments[0];

	  // base case
	  if (pathSegments.length === 1) {
	    if (
	      settings.hasOwnProperty(currentKey) &&
	      typeof settings[currentKey] === 'string'
	    ) {
	      settings[currentKey] = decorateWithDynamicHost(settings[currentKey]);
	    }
	    return;
	  }

	  // still more work to do
	  var remainingPathSegments = pathSegments.slice(1);
	  if (isArrayReference(currentKey)) {
	    // 'someArrayReference[]' --> 'someArrayReference'
	    currentKey = sanitizeArrayKey(currentKey);
	    var settingsValue = settings[currentKey];
	    if (Array.isArray(settingsValue)) {
	      settingsValue.forEach(function (arrayEntryObject) {
	        return traverseIntoSettings(
	          remainingPathSegments,
	          arrayEntryObject,
	          decorateWithDynamicHost
	        );
	      });
	    }
	  } else {
	    // object case
	    return traverseIntoSettings(
	      remainingPathSegments,
	      settings[currentKey],
	      decorateWithDynamicHost
	    );
	  }
	}

	/**
	 * Returns a function that when called will attempt to traverse the passed in
	 * settings object to each file path and transform a relative URL to an absolute
	 * URL.
	 *
	 * @param isDynamicEnforced
	 * @param decorateWithDynamicHost
	 * @returns {(function(*=, *=, *=): (*))|*}
	 */
	var createSettingsFileTransformer = function (isDynamicEnforced, decorateWithDynamicHost) {
	  return function (settings, filePaths, moduleReferencePath) {
	    if (
	      !isDynamicEnforced ||
	      !isPlainObject(settings) ||
	      !Object.keys(settings).length ||
	      !Array.isArray(filePaths) ||
	      !filePaths.length
	    ) {
	      return settings;
	    }

	    // pull out the file paths by the module's reference path and loop over each urlPath
	    filePaths.forEach(function (filePathString) {
	      // The custom code action provides the ability to have the source code in the 'source'
	      // variable or to have an external file. Therefore, this module has 2 behaviors.
	      // It also does not provide a value of false for isExternal just as all other extensions
	      // that use fileTransform do not provide an isExternal variable check. Therefore, we need
	      // to treat Adobe's custom code action special, and don't augment the 'source' variable
	      // if isExternal is not also present.
	      var isAdobeCustomCodeAction = Boolean(
	        moduleReferencePath != null &&
	          /^core\/.*actions.*\/customCode\.js$/.test(moduleReferencePath)
	      );
	      if (
	        isAdobeCustomCodeAction &&
	        filePathString === 'source' &&
	        !settings.isExternal
	      ) {
	        return;
	      }

	      // modify the object in place
	      traverseIntoSettings(
	        filePathString.split('.'),
	        settings,
	        decorateWithDynamicHost
	      );
	    });

	    return settings;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	// DYNAMIC URL













































	var _satellite = window._satellite;

	if (_satellite && !window.__satelliteLoaded) {
	  // If a consumer loads the library multiple times, make sure only the first time is effective.
	  window.__satelliteLoaded = true;

	  var container = _satellite.container;

	  // Remove container in public scope ASAP so it can't be manipulated by extension or user code.
	  delete _satellite.container;

	  /*
	    get rid of container.buildInfo decoration once deprecation is finished of
	    buildInfo.environment string
	   */
	  var buildInfo = reactorObjectAssign({}, container.buildInfo);
	  Object.defineProperty(buildInfo, 'environment', {
	    get: function () {
	      logger.deprecation(
	        'container.buildInfo.environment is deprecated.' +
	          'Please use `container.environment.stage` instead'
	      );
	      return container.environment.stage;
	    }
	  });
	  container.buildInfo = buildInfo;

	  var localStorage = getNamespacedStorage('localStorage');
	  var debugController = createDebugController(localStorage, logger);

	  var currentScriptSource = '';
	  if (reactorDocument.currentScript && reactorDocument.currentScript.getAttribute('src')) {
	    currentScriptSource = reactorDocument.currentScript.getAttribute('src');
	  }
	  var dynamicHostResolver;
	  try {
	    dynamicHostResolver = createDynamicHostResolver(
	      currentScriptSource,
	      Boolean(container.company.dynamicCdnEnabled),
	      container.company.cdnAllowList,
	      debugController
	    );
	  } catch (e) {
	    logger.warn('Please review the following error:');
	    throw e; // We don't want to continue allowing Turbine to start up if we detect an error in here
	  }

	  var settingsFileTransformer = createSettingsFileTransformer(
	    dynamicHostResolver.isDynamicEnforced,
	    dynamicHostResolver.decorateWithDynamicHost
	  );

	  var moduleProvider = createModuleProvider();

	  var replaceTokens;

	  var undefinedVarsReturnEmpty =
	    container.property.settings.undefinedVarsReturnEmpty;
	  var ruleComponentSequencingEnabled =
	    container.property.settings.ruleComponentSequencingEnabled;

	  var dataElements = container.dataElements || {};

	  var getDataElementDefinition = function (name) {
	    return dataElements[name];
	  };

	  // We support data elements referencing other data elements. In order to be able to retrieve a
	  // data element value, we need to be able to replace data element tokens inside its settings
	  // object (which is what replaceTokens is for). In order to be able to replace data element
	  // tokens inside a settings object, we need to be able to retrieve data element
	  // values (which is what getDataElementValue is for). This proxy replaceTokens function solves the
	  // chicken-or-the-egg problem by allowing us to provide a replaceTokens function to
	  // getDataElementValue that will stand in place of the real replaceTokens function until it
	  // can be created. This also means that createDataElementValue should not call the proxy
	  // replaceTokens function until after the real replaceTokens has been created.
	  var proxyReplaceTokens = function () {
	    return replaceTokens.apply(null, arguments);
	  };

	  var getDataElementValue = createGetDataElementValue(
	    moduleProvider,
	    getDataElementDefinition,
	    proxyReplaceTokens,
	    undefinedVarsReturnEmpty,
	    settingsFileTransformer
	  );

	  var customVars = {};
	  var setCustomVar = createSetCustomVar(customVars);

	  var isVar = createIsVar(customVars, getDataElementDefinition);

	  var getVar = createGetVar(
	    customVars,
	    getDataElementDefinition,
	    getDataElementValue
	  );

	  replaceTokens = createReplaceTokens(isVar, getVar, undefinedVarsReturnEmpty);

	  // Important to hydrate satellite object before we hydrate the module provider or init rules.
	  // When we hydrate module provider, we also execute extension code which may be
	  // accessing _satellite.
	  hydrateSatelliteObject(
	    _satellite,
	    container,
	    debugController.setDebugEnabled,
	    getVar,
	    setCustomVar
	  );

	  hydrateModuleProvider(
	    container,
	    moduleProvider,
	    debugController,
	    replaceTokens,
	    getDataElementValue,
	    settingsFileTransformer,
	    dynamicHostResolver.decorateWithDynamicHost
	  );

	  var notifyMonitors = createNotifyMonitors(_satellite);
	  var executeDelegateModule = createExecuteDelegateModule(
	    moduleProvider,
	    replaceTokens,
	    settingsFileTransformer
	  );

	  var getModuleDisplayNameByRuleComponent =
	    createGetModuleDisplayNameByRuleComponent(moduleProvider);
	  var logConditionNotMet = createLogConditionNotMet(
	    getModuleDisplayNameByRuleComponent,
	    logger,
	    notifyMonitors
	  );
	  var logConditionError = createLogConditionError(
	    getRuleComponentErrorMessage,
	    getModuleDisplayNameByRuleComponent,
	    logger,
	    notifyMonitors
	  );
	  var logActionError = createLogActionError(
	    getRuleComponentErrorMessage,
	    getModuleDisplayNameByRuleComponent,
	    logger,
	    notifyMonitors
	  );
	  var logRuleCompleted = createLogRuleCompleted(logger, notifyMonitors);

	  var evaluateConditions = createEvaluateConditions(
	    executeDelegateModule,
	    isConditionMet,
	    logConditionNotMet,
	    logConditionError
	  );
	  var runActions = createRunActions(
	    executeDelegateModule,
	    logActionError,
	    logRuleCompleted
	  );
	  var executeRule = createExecuteRule(evaluateConditions, runActions);

	  var addConditionToQueue = createAddConditionToQueue(
	    executeDelegateModule,
	    normalizeRuleComponentError,
	    isConditionMet,
	    logConditionError,
	    logConditionNotMet
	  );
	  var addActionToQueue = createAddActionToQueue(
	    executeDelegateModule,
	    normalizeRuleComponentError,
	    logActionError
	  );
	  var addRuleToQueue = createAddRuleToQueue(
	    addConditionToQueue,
	    addActionToQueue,
	    logRuleCompleted
	  );

	  var triggerRule = createTriggerRule(
	    ruleComponentSequencingEnabled,
	    executeRule,
	    addRuleToQueue,
	    notifyMonitors
	  );

	  var getSyntheticEventMeta = createGetSyntheticEventMeta(moduleProvider);

	  var initEventModule = createInitEventModule(
	    triggerRule,
	    executeDelegateModule,
	    normalizeSyntheticEvent,
	    getRuleComponentErrorMessage,
	    getSyntheticEventMeta,
	    logger
	  );

	  initRules(buildRuleExecutionOrder, container.rules || [], initEventModule);
	}

	// Rollup's iife option always sets a global with whatever is exported, so we'll set the
	// _satellite global with the same object it already is (we've only modified it).
	var src = _satellite;

	return src;

})();


