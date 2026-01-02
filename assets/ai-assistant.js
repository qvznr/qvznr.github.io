// Advanced AI Assistant for ColorOS Ports
// Enhanced with intelligent NLP, context awareness, and dynamic responses

(function() {
  'use strict';

  // Knowledge base with comprehensive information
  const KNOWLEDGE_BASE = {
    devices: {
      supported: ['OnePlus 8', 'OnePlus 8 Pro', 'OnePlus 9', 'OnePlus 9 Pro'],
      codenames: {
        'OnePlus 8': 'instantnoodle',
        'OnePlus 8 Pro': 'instantnoodlep',
        'OnePlus 9': 'lemonade',
        'OnePlus 9 Pro': 'lemonadep'
      },
      specs: {
        'OnePlus 9 Pro': {
          processor: 'Snapdragon 888',
          ram: '8GB/12GB',
          storage: '128GB/256GB',
          display: '6.7" AMOLED 120Hz',
          camera: 'Hasselblad 48MP'
        }
      }
    },
    roms: {
      colorOS: {
        version: '16.0.2.402',
        base: 'China',
        android: 'Android 15',
        features: ['Aquamorphic Design', 'Trinity Engine', 'AI Features', 'Better Battery Life']
      },
      oxygenOS: {
        version: '16.0.2.400',
        base: 'Global',
        android: 'Android 15',
        features: ['Clean UI', 'Fast Performance', 'OxygenOS Customization', 'Stock Android Feel']
      }
    },
    installation: {
      requirements: ['Unlocked bootloader', 'OrangeFox Recovery', 'USB Cable', 'ADB & Fastboot tools', 'ROM ZIP file'],
      steps: [
        'Unlock bootloader (Device specific)',
        'Download OrangeFox Recovery',
        'Boot recovery: fastboot boot orangefox.img',
        'Wipe System, Data, Cache partitions',
        'Flash ROM ZIP via ADB sideload or SD card',
        'Reboot system',
        'Initial setup may take 5-10 minutes'
      ],
      warnings: [
        'Backup all data before installation',
        'Ensure battery is above 50%',
        'Use official USB cables for stable connection',
        'ADB sideload stopping at 47% is normal'
      ]
    },
    troubleshooting: {
      'bootloop': 'Try wiping cache and dalvik, then reflash ROM. If persists, format data and reinstall.',
      'no boot': 'Boot to recovery and check if all partitions were wiped properly. Reflash ROM.',
      'no wifi': 'Flash the appropriate firmware for your device. Check XDA for firmware packages.',
      'camera crash': 'Clear camera app data, or reflash ROM. Some camera features may need GCam.',
      'battery drain': 'Let the ROM settle for 2-3 days. Clear battery stats if issue persists.',
      'slow performance': 'Clear cache partition, disable animations in developer options.',
      'fingerprint not working': 'Re-register fingerprints. May need to format data and reinstall.',
      'mobile data': 'Check APN settings, try resetting network settings.'
    }
  };

  // Conversation context for smarter follow-ups
  let conversationContext = {
    lastTopic: null,
    userDevice: null,
    preferredROM: null,
    messageHistory: []
  };

  // Advanced NLP patterns for intent detection
  const INTENT_PATTERNS = {
    greeting: /^(hi|hello|hey|sup|yo|greetings|good\s+(morning|afternoon|evening))/i,
    installation: /(how|install|flash|setup|guide|steps?|tutorial)/i,
    download: /(download|get|where|link|url)/i,
    device: /(device|phone|support|compatible|work)/i,
    troubleshoot: /(problem|issue|error|fix|help|not\s+working|broken|crash|stuck)/i,
    compare: /(difference|compare|vs|versus|better|which)/i,
    features: /(feature|what\s+is|capability|can\s+it)/i,
    recovery: /(recovery|orangefox|twrp)/i,
    bootloader: /(bootloader|unlock|lock|oem)/i,
    rom: /(rom|coloros|oxygenos|firmware|version)/i,
    thanks: /(thank|thanks|thx|appreciate)/i,
    goodbye: /(bye|goodbye|see\s+you|later|exit|close)/i
  };

  // Entity extraction for devices, ROMs, versions
  function extractEntities(message) {
    const entities = {
      device: null,
      rom: null,
      version: null,
      issue: null
    };

    // Extract device mentions
    const devicePatterns = [
      /oneplus\s*(\d+)\s*(pro)?/i,
      /op\s*(\d+)\s*(pro)?/i,
      /(\d+)\s*pro/i
    ];

    for (const pattern of devicePatterns) {
      const match = message.match(pattern);
      if (match) {
        const num = match[1];
        const isPro = match[2] || message.toLowerCase().includes('pro');
        entities.device = `OnePlus ${num}${isPro ? ' Pro' : ''}`;
        conversationContext.userDevice = entities.device;
        break;
      }
    }

    // Extract ROM type
    if (/coloros|color\s*os|china/i.test(message)) {
      entities.rom = 'ColorOS';
      conversationContext.preferredROM = 'ColorOS';
    } else if (/oxygenos|oxygen\s*os|global|stock/i.test(message)) {
      entities.rom = 'OxygenOS';
      conversationContext.preferredROM = 'OxygenOS';
    }

    // Extract version numbers
    const versionMatch = message.match(/(\d+\.){2,}\d+/);
    if (versionMatch) {
      entities.version = versionMatch[0];
    }

    // Extract common issues
    const issueKeywords = {
      'bootloop': /boot\s*loop|stuck\s+boot|reboot/i,
      'no boot': /won'?t\s+boot|not\s+boot|no\s+boot/i,
      'wifi': /wifi|wi-fi|wireless|internet/i,
      'camera': /camera|photo|picture/i,
      'battery': /battery|drain|charge/i,
      'performance': /slow|lag|performance|stutter/i,
      'fingerprint': /fingerprint|sensor|unlock/i,
      'data': /mobile\s+data|network|cellular/i
    };

    for (const [issue, pattern] of Object.entries(issueKeywords)) {
      if (pattern.test(message)) {
        entities.issue = issue;
        break;
      }
    }

    return entities;
  }

  // Detect primary intent
  function detectIntent(message) {
    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general';
  }

  // Generate intelligent response based on intent and context
  function generateResponse(message, intent, entities) {
    const msg = message.toLowerCase();
    
    // Greeting
    if (intent === 'greeting') {
      return {
        text: '👋 Hey there! I\'m your ColorOS/OxygenOS Assistant. I can help you with:<br><br>' +
              '🔧 <strong>Installation guides</strong> & troubleshooting<br>' +
              '📱 <strong>Device compatibility</strong> & specifications<br>' +
              '💾 <strong>ROM downloads</strong> & features<br>' +
              '🔓 <strong>Bootloader unlocking</strong> & recovery<br><br>' +
              'What would you like to know?',
        suggestions: ['Installation guide', 'Supported devices', 'Download ROMs', 'Troubleshooting']
      };
    }

    // Thanks
    if (intent === 'thanks') {
      return {
        text: '😊 You\'re welcome! Feel free to ask if you need anything else. Happy flashing! 🚀',
        suggestions: []
      };
    }

    // Goodbye
    if (intent === 'goodbye') {
      return {
        text: '👋 Take care! Come back if you need more help. Good luck with your ROM! ✨',
        suggestions: []
      };
    }

    // Installation
    if (intent === 'installation') {
      let response = '<strong>📱 Complete Installation Guide:</strong><br><br>';
      response += '<strong>Requirements:</strong><br>';
      response += KNOWLEDGE_BASE.installation.requirements.map(r => `• ${r}`).join('<br>');
      response += '<br><br><strong>Installation Steps:</strong><br>';
      response += KNOWLEDGE_BASE.installation.steps.map((s, i) => `${i + 1}. ${s}`).join('<br>');
      response += '<br><br><strong>⚠️ Important Warnings:</strong><br>';
      response += KNOWLEDGE_BASE.installation.warnings.map(w => `• ${w}`).join('<br>');
      response += '<br><br>📖 <a href="installation.html" style="color:#00d9ff;font-weight:600;">View Detailed Guide →</a>';
      
      return {
        text: response,
        suggestions: ['What devices are supported?', 'Download ROM', 'Troubleshooting']
      };
    }

    // Device compatibility
    if (intent === 'device') {
      if (entities.device && KNOWLEDGE_BASE.devices.supported.includes(entities.device)) {
        const specs = KNOWLEDGE_BASE.devices.specs[entities.device];
        let response = `<strong>✅ ${entities.device} is fully supported!</strong><br><br>`;
        
        if (specs) {
          response += '<strong>Device Specifications:</strong><br>';
          response += Object.entries(specs).map(([key, value]) => 
            `• <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}`
          ).join('<br>');
          response += '<br><br>';
        }
        
        response += '<strong>Available ROMs:</strong><br>';
        response += `• ColorOS ${KNOWLEDGE_BASE.roms.colorOS.version} (China)<br>`;
        response += `• OxygenOS ${KNOWLEDGE_BASE.roms.oxygenOS.version} (Global)<br><br>`;
        response += `📱 <a href="devices.html" style="color:#00d9ff;font-weight:600;">View All Devices →</a>`;
        
        return {
          text: response,
          suggestions: ['Download ROM', 'Installation guide', 'Compare ColorOS vs OxygenOS']
        };
      } else if (entities.device) {
        return {
          text: `⚠️ Sorry, <strong>${entities.device}</strong> is not currently supported.<br><br>` +
                '<strong>Supported devices:</strong><br>' +
                KNOWLEDGE_BASE.devices.supported.map(d => `• ${d}`).join('<br>') +
                '<br><br>📱 <a href="devices.html" style="color:#00d9ff;font-weight:600;">View All Supported Devices →</a>',
          suggestions: ['OnePlus 9 Pro specs', 'Installation guide']
        };
      } else {
        return {
          text: '<strong>🎯 Supported Devices:</strong><br><br>' +
                KNOWLEDGE_BASE.devices.supported.map(d => `• ${d}`).join('<br>') +
                '<br><br>All devices support both ColorOS 16 and OxygenOS 16!<br><br>' +
                '📱 <a href="devices.html" style="color:#00d9ff;font-weight:600;">View Details & Specs →</a>',
          suggestions: ['OnePlus 9 Pro', 'Installation guide', 'Download ROM']
        };
      }
    }

    // ROM Download
    if (intent === 'download') {
      let response = '<strong>💾 Download ROMs:</strong><br><br>';
      
      if (entities.rom) {
        const romInfo = entities.rom === 'ColorOS' ? KNOWLEDGE_BASE.roms.colorOS : KNOWLEDGE_BASE.roms.oxygenOS;
        response += `<strong>${entities.rom} ${romInfo.version}</strong><br>`;
        response += `Base: ${romInfo.base} | ${romInfo.android}<br><br>`;
        response += '<strong>Features:</strong><br>';
        response += romInfo.features.map(f => `• ${f}`).join('<br>');
      } else {
        response += '<strong>ColorOS 16.0.2.402</strong> (China Base)<br>';
        response += '• Aquamorphic Design, Trinity Engine, AI Features<br><br>';
        response += '<strong>OxygenOS 16.0.2.400</strong> (Global Base)<br>';
        response += '• Clean UI, Fast Performance, Stock Feel<br>';
      }
      
      response += '<br><br>🔽 <a href="roms.html" style="color:#00d9ff;font-weight:600;">Download ROMs →</a>';
      
      return {
        text: response,
        suggestions: ['Installation guide', 'Compare ROMs', 'Device compatibility']
      };
    }

    // Troubleshooting
    if (intent === 'troubleshoot') {
      if (entities.issue && KNOWLEDGE_BASE.troubleshooting[entities.issue]) {
        return {
          text: `<strong>🔧 Fix for ${entities.issue.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong><br><br>` +
                `${KNOWLEDGE_BASE.troubleshooting[entities.issue]}<br><br>` +
                'Still having issues? Join our community or contact support.',
          suggestions: ['Other common issues', 'Reinstall ROM', 'Factory reset']
        };
      }
      
      return {
        text: '<strong>🔧 Common Issues & Fixes:</strong><br><br>' +
              Object.entries(KNOWLEDGE_BASE.troubleshooting).slice(0, 4).map(([issue, fix]) => 
                `<strong>${issue}:</strong> ${fix.substring(0, 80)}...`
              ).join('<br><br>') +
              '<br><br>💡 Describe your specific issue for targeted help!',
        suggestions: ['Bootloop fix', 'WiFi issues', 'Camera problems', 'Battery drain']
      };
    }

    // Compare ROMs
    if (intent === 'compare') {
      return {
        text: '<strong>⚖️ ColorOS vs OxygenOS Comparison:</strong><br><br>' +
              '<strong>ColorOS 16 (China):</strong><br>' +
              '✨ Aquamorphic Design, Rich features<br>' +
              '🔋 Better battery optimization<br>' +
              '🎨 Heavy customization<br>' +
              '🇨🇳 China base (needs Google fix)<br><br>' +
              '<strong>OxygenOS 16 (Global):</strong><br>' +
              '🎯 Clean, minimalist UI<br>' +
              '⚡ Faster, stock Android feel<br>' +
              '🌍 Global base, Google pre-installed<br>' +
              '🔧 Less bloat, more control<br><br>' +
              '<strong>Recommendation:</strong><br>' +
              '• <strong>ColorOS</strong> for features & battery<br>' +
              '• <strong>OxygenOS</strong> for speed & simplicity',
        suggestions: ['Download ColorOS', 'Download OxygenOS', 'Installation guide']
      };
    }

    // Recovery
    if (intent === 'recovery') {
      return {
        text: '<strong>🛠️ OrangeFox Recovery Guide:</strong><br><br>' +
              '<strong>Why OrangeFox?</strong><br>' +
              '• Best compatibility with ColorOS/OxygenOS<br>' +
              '• Built-in ADB sideload support<br>' +
              '• Modern UI with touch gestures<br><br>' +
              '<strong>Installation:</strong><br>' +
              '1. Download OrangeFox for your device<br>' +
              '2. Boot to bootloader: <code>adb reboot bootloader</code><br>' +
              '3. Boot recovery: <code>fastboot boot orangefox.img</code><br><br>' +
              '📖 <a href="installation.html" style="color:#00d9ff;font-weight:600;">Full Recovery Guide →</a>',
        suggestions: ['Flash ROM', 'Unlock bootloader', 'Download recovery']
      };
    }

    // Bootloader
    if (intent === 'bootloader') {
      return {
        text: '<strong>🔓 Bootloader Unlock Guide:</strong><br><br>' +
              '<strong>⚠️ WARNING:</strong> Unlocking wipes all data!<br><br>' +
              '<strong>Steps:</strong><br>' +
              '1. Enable Developer Options<br>' +
              '2. Enable OEM Unlocking & USB Debugging<br>' +
              '3. Boot to bootloader: <code>adb reboot bootloader</code><br>' +
              '4. Unlock: <code>fastboot oem unlock</code> or <code>fastboot flashing unlock</code><br>' +
              '5. Confirm on device screen<br><br>' +
              '💾 <strong>Backup everything first!</strong>',
        suggestions: ['Install recovery', 'Flash ROM', 'Supported devices']
      };
    }

    // Default intelligent response
    return {
      text: '🤔 I can help with that! I have expertise in:<br><br>' +
            '• <strong>Installation</strong> - Step-by-step ROM flashing<br>' +
            '• <strong>Troubleshooting</strong> - Fix common issues<br>' +
            '• <strong>Downloads</strong> - Get latest ROMs<br>' +
            '• <strong>Device Info</strong> - Check compatibility<br>' +
            '• <strong>Comparisons</strong> - ColorOS vs OxygenOS<br><br>' +
            'Try asking something like "How do I install ColorOS?" or "OnePlus 9 Pro support?"',
      suggestions: ['Installation guide', 'Supported devices', 'Download ROMs', 'Troubleshooting']
    };
  }

  // Main conversation handler
  function handleConversation(userMessage) {
    // Store message in history
    conversationContext.messageHistory.push({
      user: userMessage,
      timestamp: Date.now()
    });

    // Keep only last 10 messages for context
    if (conversationContext.messageHistory.length > 10) {
      conversationContext.messageHistory.shift();
    }

    // Extract entities and detect intent
    const entities = extractEntities(userMessage);
    const intent = detectIntent(userMessage);
    
    // Update context topic
    conversationContext.lastTopic = intent;

    // Generate intelligent response
    const response = generateResponse(userMessage, intent, entities);
    
    return response;
  }

  // Initialize AI when available
  window.ColorOSAI = {
    chat: handleConversation,
    resetContext: () => {
      conversationContext = {
        lastTopic: null,
        userDevice: null,
        preferredROM: null,
        messageHistory: []
      };
    },
    getContext: () => conversationContext,
    version: '2.0.0'
  };

  console.log('🤖 ColorOS AI Assistant v2.0.0 loaded - Enhanced intelligence active');

})();
