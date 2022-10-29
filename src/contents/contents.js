window.onload = (async() => {
  console.log(prefix, "Hi.");

  // Check if extension is reloaded
  setInterval(async() => {
    try {
      await chrome.runtime.getManifest();
    } catch {
      // if so -> reload content.js but it can only reload in once
      if (reloading == false) {
        location.reload();
        reloading = true;
        console.info(prefix, 'reloading...');
      }
    }
  }, 10000);
});

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  // Debug:
  // if (request.type != 'request-data') console.log('received:', request);
  switch (request.type) {
    case 'request-data': {
      json['title'] = getTitle();
      json['artist'] = getArtist();
      json['artwork'] = getArtwork();
      json['link'] = getLink();
      json['playing'] = isPlaying();
      json['favorite'] = isLiked();
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();
      json['volume'] = getVolume();
      json['mute'] = isMuted();
      json['repeat'] = getRepeatMode();
      json['shuffle'] = isShuffling();

      callback(json);
      break;
    }
    case 'smart-request-data': {
      let d = false; // NOTE: debug = on/off

      if (getTitle() != json['title']) {
        if (d) console.log(prefix, 'title sent');
        json['title'] = getTitle();
      }
      if (getArtist() != json['artist']) {
        if (d) console.log(prefix, 'artist sent');
        json['artist'] = getArtist();
      }
      if (getArtwork() != json['artwork']) {
        if (d) console.log(prefix, 'artwork sent');
        json['artwork'] = getArtwork();
      }
      if (getLink() != json['link']) {
        if (d) console.log(prefix, 'link sent');
        json['link'] = getLink();
      }
      if (isPlaying() != json['playing']) {
        if (d) console.log(prefix, 'playing sent');
        json['playing'] = isPlaying();
      }
      if (isLiked() != json['favorite']) {
        if (d) console.log(prefix, 'fav sent');
        json['favorite'] = isLiked();
      }
      if (getCurrentTime() != json['time']['current']) {
        if (d) console.log(prefix, 'time current sent');
        json['time']['current'] = getCurrentTime();
      }
      if (getEndTime() != json['time']['end']) {
        if (d) console.log(prefix, 'time end sent');
        json['time']['end'] = getEndTime();
      }
      if (getVolume() != json['volume']) {
        if (d) console.log(prefix, 'volume sent');
        json['volume'] = getVolume();
      }
      if (isMuted() != json['mute']) {
        if (d) console.log(prefix, 'mute sent');
        json['mute'] = isMuted();
      }
      if (getRepeatMode() != json['repeat']) {
        if (d) console.log(prefix, 'repeat sent');
        json['repeat'] = getRepeatMode();
      }
      if (isShuffling() != json['shuffle']) {
        if (d) console.log(prefix, 'shuffle sent');
        json['shuffle'] = isShuffling();
      }

      callback(json);
      break;
    }
    case 'open': {
      $('.playbackSoundBadge__titleLink.sc-truncate')[0].click();
      break;
    }
    case 'play':
    case 'pause':
    case 'toggle': {
      let elem = $('.playControl.sc-ir.playControls__control.playControls__play')[0];
      elem.click();
      json['playing'] = elem.title.includes('Pause');

      callback( {'response': { 'playing': json['playing'], 'volume': json['volume'] } } );
      break;
    }
    case 'prev': { // MEMO: 'prev', 'next' 共にcallbackのコードを付けるとカクつく = 曲が始まった時音が ダブって聞こえる/プツっとなる
      $('.playControls__prev')[0].click();
      // callback( {'response': {'code': 'song-changed'} } );
      break;
    }
    case 'next': {
      $('.playControls__next')[0].click();
      // callback( {'response': {'code': 'song-changed'} } );
      break;
    }
    case 'unfav':
    case 'fav': {
      let btn = $('.playbackSoundBadge__like')[0];
      btn.click();
      json['favorite'] = btn.title == "Unlike";
      
      callback( {'response': {'favorite': json['favorite']} } );
      break;
    }
    case 'repeat': {
      let btn = $('.repeatControl')[0];
      btn.click();
      json['repeat'] = getRepeatMode(); // none -> one -> all
      
      callback( {'response': {'repeat': json['repeat']} } );
      break;
    }
    case 'shuffle': {
      let btn = $('.shuffleControl')[0];
      btn.click();
      json['shuffle'] = isShuffling();
      
      callback( {'response': {'shuffle': json['shuffle']} } );
      break;
    }
    case 'mute':
    case 'unmute': {
      $('.volume button[type="button"]')[0].click();
      json['mute'] = $('.volume')[0].className.includes('muted');
      
      callback( {'response': {'mute': json['mute']} } );
      break;
    }
    case 'up':
    case 'down': {
      if (request.type == 'up') {
        volumeUp();
      } else if (request.type == 'down') {
        volumeDown();
      }
      json['volume'] = getVolume();
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();

      callback( {'response': { 'time': json['time'], 'volume': json['volume'] } } );
      break;
    }
    case 'seekb':
    case 'seekf': {
      if (request.type == 'seekb') {
        seekBack();
      } else if (request.type == 'seekf') {
        seekForward();
      }
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();

      callback( {'response': { 'time': json['time'] } } );
      break;
    }
    default: {
      // console.log('default:', request);
      break;
    };
  }
});

var prefix = '[SoundCloud Player] ', 
  reloading = false,
  json = {
    'playing': false,
    'artwork': null,
    'link': null,
    'favorite': false,
    'shuffle': false,
    'repeat': 'none',
    'time': {
      'current': null,
      'end': null
    },
    'volume': 0,
    'mute': false
    // , "playlist": []
  };