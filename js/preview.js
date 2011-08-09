
var Preview = (function(){
  // change the display depending on whether we're rendering for a facebook mockup or google plus mockup

  var Display = {
    /*
    Event Handlers
    ==============
    Logic that helps the form do what it's suppose to. There is nothing really
    all that special here in terms of 'the right way'. It's totally up to the
    developer.
    */
    
    // The bulk of the scroll left and right functions. dir is either 'left'
    // or 'right'. I'm pretty sure there is a better wat to do this.
    scroll : function(dir,e,t){
      e.preventDefault();
      //Grabs the current 'left' style
      var left = Ext.fly('images').getStyle('left');
      //Gets the number of images
      var len = Ext.fly('images').select('img').elements.length * 100;
      //General logic to set the new left value
      if (dir == 'left'){
        left = parseInt(left)+100;
        if (left > 0) return false;
      } else if (dir == 'right'){
        left = parseInt(left)-100;
        if (left <= -len) return false;
      } else {
        console.log('not a valid direction: '+dir)
        return false;
      }
      //Puts the current thumbnail into the thumbnail_url input
      Ext.fly('id_thumbnail_url').dom.value = Ext.DomQuery.select('#images li:nth-child('+((left/-100)+1)+') img')[0].src
      //Sets the new left.
      Ext.fly('images').setStyle('left',left+'px');
    },
    //Scrolls the image selector when the `right` button is clicked.
    scrollRight : function(e,t){Preview.Display.scroll('right', e, t)},
    //Scrolls 
    scrollLeft : function(e,t){Preview.Display.scroll('left', e, t)},
    
    // When a user wants to Edit a title or description we need to switch out
    // an input or text area
    setTitle : function(e,t){
      e.preventDefault();
      //Make it an Ext element.
      var elem = Ext.get(t);
      // Sets the New Title in the hidden inputs
      Ext.fly('id_title').dom.value = encodeURIComponent(elem.dom.value);
      //overwrite the a tag with the value of the tag.
      elem = elem.replaceWith({
          'tag' : 'a', 
          'class' : 'title',
          'html': elem.dom.value
      });
    },
    editTitle : function(e, t){
      e.preventDefault();
      //Make it an Ext element.
      var elem = Ext.get(t);
      //overwrite the a tag with the value of the tag.
      elem = elem.replaceWith({
        'tag' : 'input', 
        'type' : 'text',
        'class' : 'title',
        'value': elem.dom.innerHTML
      });
      //Set the focus on this element
      elem.focus();
      // puts the a tag back on blur. It's a single bind so it will be
      // trashed on blur.
      elem.on('blur', Preview.Display.setTitle, null, {single: true});   
    },
    //Same as before, but for description
    setDescription : function(e,t){
      e.preventDefault();
      //Make t an Ext Element
      var elem = Ext.get(t);
      // Sets the New Description in the hidden inputs
      Ext.fly('id_description').dom.value = encodeURIComponent(elem.dom.value);
      //overwrite the a tag with the value of the tag.
      elem = elem.replaceWith({
        'tag' : 'a',
        'class' : 'description',
        'html': elem.dom.value
      });
      
    },
    editDescription: function(e,t){
      e.preventDefault();
      // Make t an Ext Element
      var elem = Ext.get(t);
      // overwrite the a tag with the value of the tag. Passes back the new
      // element.
      elem = elem.replaceWith({
        'tag' : 'textarea',
        'class' : 'description',
        'html': elem.dom.innerHTML
      });
      //Focus the Text Area
      elem.focus();
      //When the element is then blured update the value.
      elem.on('blur', Preview.Display.setDescription, null, {single : true});
    },
    
    /*
      Display Functions
    */
    render : function(obj){
      if(Preview.site=='fb'){
        Ext.fly('id_submit').addClass('submit');
        Ext.fly('id_submit').dom.value = 'Share';
        Ext.fly('preview_form').addClass('preview');
      }
      // We are going to handle just images first. This is when a user
      // directly links to an image asset. i.e.
      //http://images.instagram.com/media/2011/08/01/55d07d3fac974d45ababdb7f04673f72_7.jpg
      if (obj.type == 'image'){
        //Add the image to the scoller that won't scroll in this case.
        Preview.Display.imageScroller([obj.url]);
        
        //Set the title to obj.url
        obj.title = obj.url;
        Preview.Display.title(obj);
      }

      // In here we handle the majority of the use cases. It's a link to an
      // html page with image assests and words. In this case you also
      // may have access to an `object` attribute which will be an image or
      // a video
      if (obj.type == 'html'){
        if(Preview.site == 'plus'){
          //add the title or a blank one.
          Preview.Display.title(obj);

          // add the favicon to the preview to match Google Plus
          Preview.Display.favicon(obj);
        }
        

        // If there are images we need to build the slider.
        Preview.Display.images(obj);
        
        // display customizations for facebook version
        if(Preview.site == 'fb'){
          Ext.DomHelper.append('display', 
            {
              'tag': 'a',
              'class' : 'title',
              'href' : '#',
              'html' : obj.title ? obj.title : 'Click to add your own title.'
            }
          );
          Ext.DomHelper.append('display',{
            'tag':'p',
            'class':'url',
            'html':obj.url
          });
        }
        

        //add the description or a blank one.
        Preview.Display.description(obj);
        
        //This is the fun where the video comes into play.
        if (obj.object && obj.object.type in {'video':'', 'rich':''}){
          Ext.fly('id_html').dom.value = obj.object.html;
          Ext.fly('id_type').dom.value = obj.object.type;
        }
      }
      
      
      
      //Clear div.
      Ext.DomHelper.append('display',{
          tag : 'div',
          class : 'clear',
      });
    },
    
    // Resets the form to the orginal state
    reset : function(){
      // If this is a change in the URL we need to delete all the old
      // information first.
      Ext.fly('preview_form').select('input[type="hidden"]').remove();
      Ext.fly('display').select('*').remove();
      Ext.fly('display').hide();
      Ext.fly('display').setStyle('display', 'none');
      Ext.fly('id_status').dom.value = ''
      Ext.fly('id_status').blur();
      if(Preview.site=='fb'){
        Ext.fly('id_submit').dom.value='Attach';
        Ext.fly('id_submit').removeClass('submit');
        Ext.fly('preview_form').removeClass('preview');
      }
    },
    setStylesheet : function(name){
      var i, obj;
      Preview.site=name;
      for(i=0; i<document.getElementsByTagName("link").length; i++)
      {
        obj = document.getElementsByTagName("link")[i];
        if(obj.getAttribute("rel").indexOf("alt") != -1 && obj.getAttribute("title")){
          obj.disabled = true;
          if(obj.getAttribute("title") === name){
              obj.disabled = false;
          }
        }
      }
    },
    swapStylesheets : function(){
      if(Preview.site == 'plus'){
        Ext.fly('status_label').update("http://");
        Ext.fly('id_submit').dom.value = 'Attach';
        Ext.fly('preview_h2').update("<span></span>News Feed");
        Preview.Display.setStylesheet('fb');
      }else{
        Ext.fly('status_label').update("Share what's new...");
        Ext.fly('id_submit').dom.value = 'Share';
        Ext.fly('preview_h2').update("Stream");
        Preview.Display.setStylesheet('plus');
      }
      Preview.Feed.populateFeed();
    },

    title : function(obj){
      Ext.DomHelper.insertFirst('display', 
        {
          'tag': 'a',
          'class' : 'title',
          'href' : '#',
          'html' : obj.title ? obj.title : 'Click to add your own title.'
        }
      );
    },
    favicon : function(obj){
      if(Preview.site == 'plus' && obj.favicon_url){
        Ext.DomHelper.insertFirst('display', 
          {
            'tag': 'img',
            'class' : 'favicon',
            'src' : obj.favicon_url
          }
        );
      }
    },
    description : function(obj){
      Ext.DomHelper.append('display',{ 
        tag : 'div',
        class : 'attributes',
        children : [{
          'tag': 'p',
          'children' : {
            'tag' : 'a',
            'class' : 'description',
            'html' :obj.description ? obj.description : 'Click to add your own description.'
          }
      }]});
    },
    images : function(obj){
      if (obj.images.length > 0){
        var images = [];
        // Add all the images that are in the `images` array. This allows
        // the user to select which image they want to use
        for (var i in obj.images){
          var img = obj.images[i];
          if (!img.hasOwnProperty('url')) continue;
          images.push(img.url);
        }
        //Builds the image scroller.
        Preview.Display.imageScroller(images);
      }
    },
    
    imageScroller : function(images){
      // Add the first image as the current thumbnail
      Ext.fly('id_thumbnail_url').dom.value = encodeURIComponent(images[0]);
      
      var image_data = [];
      // Add all the images that are in the `images` array. This allows
      // the user to select which image they want to use
      Ext.each(images, function(img){
        image_data.push( 
          {
            'tag': 'li', 
            'children' : {
              'tag': 'img',
              'src' : img
            }
          }
        );
      });
      var image_slider = {
        tag : 'div',
        class : 'wrap',
        children: [{
          tag : 'div',
          class : 'controls',
          children : [{
              tag: 'a',
              id : 'left',
              class: 'button',
              href :'#',
              html : '&lt;'
            },{
              tag:   'a',
              id : 'right',
              class: 'button',
              href :'#',
              html : '&gt;'
            },
          ] 
        },{
          tag : 'div',
          class : 'items',
          children: [{
            tag:'ul',
            id : 'images',
            children : image_data
          }]
        }]
      }
      Ext.DomHelper.append('display',image_slider); 
    },
    bind : function(){
      //Scroll
      Ext.getBody().on('click', Preview.Display.scrollRight, null, {delegate: '#right'});
      Ext.getBody().on('click', Preview.Display.scrollLeft, null, {delegate: '#left'});

      //Equivalent to $('').live from what I understand.
      Ext.getBody().on('click', Preview.Display.editTitle, null, {delegate: 'a.title'});
      Ext.getBody().on('click', Preview.Display.editDescription, null, {delegate: 'a.description'});
      
      //Simple Expando function for the text area.
      Ext.EventManager.on("id_status", 'focus', function(e, t){
        var elem = Ext.get(t);
        Ext.fly('status_label').dom.style.display='none'
        if(Preview.site=='plus')
          elem.dom.rows = 5;
      });
      Ext.EventManager.on("id_status", 'blur', function(e, t){
        var elem = Ext.get(t);
        if(elem.dom.value =='')
          Ext.fly('status_label').dom.style.display='inline';
        if(Preview.site=='plus')
          elem.dom.rows = 1;
      });
    }
  }

  /*
    Feed Functions
  */
  
  var Feed = {
    /*
    Feed Methods
    ============
    Methods that allow us to update the fake feed. We use window.localStorage
    to save off the items to the browser.
    */
    //This creates and adds an item to the feed.
    createFeedItem : function (data){
      // We need to create an element structure
      var elem = {};
      
      // the item div will have a bunch of data-* attributes that help us later
      // with events.
      Ext.each(Preview.attrs, function(n){elem['data-'+(n == 'html' ? 'embed' : n)] = encodeURIComponent(data[n])});
      elem['tag'] = 'div';
      elem['class'] = 'item';
      
      if(Preview.site=='plus')
        Feed.plusFeedItem(elem, data);
      else
        Feed.fbFeedItem(elem, data);
    },
    fbFeedItem : function(elem, data){
      elem['children'] = [{
        tag:'img',
        src:'http://www.freshlyinkedmag.com/static/images/noprofileimage.gif',
        class:'profilepic'
      }, {
        tag:'h6',
        html:'Demo User'
      },{
        tag:'div',
        class:'embed',
        children: [{
          tag : 'div',
          class : data.thumbnail_url? 'grid_2 alpha thumbnail': 'alpha no_thumbnail',
          children : [{
            tag : 'a',
            href : '#',
            class : data['type'] in {'video':'', 'rich':''}? 'video' : '',
            children : [{
              tag : 'img',
              src : data.thumbnail_url
            },{
              tag : 'span',
              class : 'player_overlay'
            }]
          }]
        },{
          tag : 'div',
          class : 'info',
          children:[{
              tag:'a',
              class : 'title',
              href : data.url,
              html : data.title,
              target :'_blank'
          },{
            tag:'p',
            html : data.provider_display,
            target :'_blank'
          },{
            tag : 'p',
            html : data.description
          }]
        },{
              tag : 'p',
            class : 'via',
              children : [{
                tag:'img',
                src:data.favicon_url,
                class:'postIcon'
              },{
                tag:'span',
                html: ' via '+data.provider_display
              }]
            }]
      },{
        tag:'div',
        class:'clear',
        html:''
      }];
      Ext.fly('feed').insertFirst(elem);
    },
    plusFeedItem : function(elem, data) {
      elem['children'] = [{
        tag:'a',
        class : 'favicon',
        href : data.provider_url,
        title : data.provider_display,
        target :'_blank',
        children : [{
          tag : 'img',
          src : data.favicon_url
        }]
      },{
        tag:'a',
        class : 'title',
        href : data.url,
        html : data.title,
        target :'_blank'
      },{
        tag : 'div',
        class : data.thumbnail_url? 'grid_2 alpha thumbnail': 'alpha no_thumbnail',
        children : [{
            tag : 'a',
            href : '#',
            class : data['type'] in {'video':'', 'rich':''}? 'video' : '',
            children : [{
                tag : 'img',
                src : data.thumbnail_url
              },{
                tag : 'span',
                class : 'player_overlay'
              }]
          }]
        },{
        tag : 'div',
        class : 'info grid_5 omega',
        children : [{
          tag:'a',
          class: 'provider',
          href : data.provider_url,
          html : data.provider_display,
          target :'_blank'
        },
        {
          tag : 'p',
          html : data.description
        },
        {
          tag : 'a',
          class : 'close',
          href : '#',
          html : 'x'
        }]
      },
      {
         tag : 'div',
        class: 'clear',
        html : '&nbsp;'
      }];
      Ext.fly('feed').insertFirst(elem);
    },
    // Adds the feed item to localStorage so we can display them on refresh
    // You wouldn't use these in the real world. Only in testing.
    storeFeedItem: function(data){
      //Grab it out of localStorage.
      var items = window.localStorage.getItem('items');
      if (items === null) items = [];
      else items = JSON.parse(items);
      items.push(data);
      //Set it into storage, it must be a string to save.
      window.localStorage.setItem('items', JSON.stringify(items));
    },
    // Populates your feed on refresh.
    populateFeed: function(){
      // Get the items.
      Ext.fly('feed').update('');
      var items = window.localStorage.getItem('items');
      if (items === null || items == '[]'){
        //Fill with initial data
        if (EMBEDLY_INITIAL_DATA !== undefined){
          items = EMBEDLY_INITIAL_DATA;
          window.localStorage.setItem('items', JSON.stringify(items));
        } else{ 
          return false;
        }
      } else{
      //Parse the string to JSON
        items = JSON.parse(items);
      }
      //decode the values.
      Ext.each(items, function(i){Preview.Feed.createFeedItem(i)});
      
      //We need to add the `first` class to the first .items
      Ext.fly('feed').first().addClass('first');
    },
    // When an Item is submitted we need to create the item in the feed and
    // store it in local storage.
    submitFeedItem: function(e,t){
      e.preventDefault(); 
      var data = {};
      // Get the data we need out of the form. These are all the hidden inputs
      // we used.
      Ext.select('#preview_form input').each(function(e){data[e.dom.name] = decodeURIComponent(e.dom.value)});
      //Create
      Preview.Feed.createFeedItem(data);
      //Stores
      Preview.Feed.storeFeedItem(data);
      
      //Resets the first Attribute on the 
      Ext.fly('feed').select('.item').removeClass('first');
      Ext.fly('feed').first().addClass('first');
      
      Preview.Display.reset();
    },
    deleteFeedItem: function(e,t){
      e.preventDefault(); 
      var elem = Ext.fly(t).parent('.item');
      var url = decodeURIComponent(elem.dom.getAttribute('data-url'));
      elem.remove();

      //Get rid of the url in the items dir.
      var items = window.localStorage.getItem('items');
      if (items === null) return false;
      //Parse the string to JSON
      items = JSON.parse(items);
      
      for (var i in items){
        var item = items[i];
        if (item.url == url){
          items.remove(item);
        }
      }
      window.localStorage.setItem('items', JSON.stringify(items));
    },
        
    /*
    playVideo
    
    */
    playVideo : function(e,t){
      e.preventDefault(); 
      var elem = Ext.fly(t).parent('.item');
      //
      elem.dom.innerHTML = decodeURIComponent(elem.dom.getAttribute('data-embed'));
    },
    
    bind :function (){
      //Show and Hide the little x button.
      Ext.getBody().on('mouseover', function(e,t){Ext.fly(t).select('a.close').show();}, null, {delegate: 'div.item'});
      Ext.getBody().on('mouseout', function(e,t){Ext.fly(t).select('a.close').hide();}, null, {delegate: 'div.item'});
      //Do something about the little x button. (useful for testing.)
      Ext.getBody().on('click', Preview.Feed.deleteFeedItem, null, {delegate: 'a.close'});
      
      //Wire up the video action
      Ext.getBody().on('click', Preview.Feed.playVideo, null, {delegate: 'a.video'});
    }
  }



  var Preview = {

    //The set of attributes that we want to POST to the form.
    attrs : ['type', 'original_url', 'url', 'title', 'description', 'favicon_url', 
    'provider_url', 'provider_display', 'safe', 'html', 'thumbnail_url'],
    
    /*
    Utils for handling the status.
    */
    getStatusUrl : function(obj){
      // Grabs the status out of the Form.
      var status = Ext.fly('id_status').getValue();

      //ignore the status it's blank.
      if (status == ''){
        return null;
      }

      // Simple regex to make sure the url with a scheme is valid.
      var urlexp = /^http(s?):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      var matches = status.match(urlexp);

      var url = matches? matches[0] : null
  
      //No urls is the status. Try for urls without scheme i.e. example.com
      if (url === null){
        var urlexp = /[-\w]+(\.[a-z]{2,})+(\S+)?(\/|\/[\w#!:.?+=&%@!\-\/])?/g;
        var matches = status.match(urlexp);
        url = matches? 'http://'+matches[0] : null
      }
      
      //Note that in both cases we only grab the first URL.
      return url;
    },
    
    /*
    Embedly Methods
    ===============
    This is where Embedly comes into play.
    */
    metadataCallback : function(obj){
      //tells the loader to stop
      Ext.fly('loading').hide();
      Ext.fly('loading').setStyle('display', 'none');

      // Here is where you actually care about the obj
      console.log(obj);

      // Every obj should have a 'type'. This is a clear sign that
      // something is off. This is a basic check to make sure we should
      // proceed. Generally will never happen.
      if (!obj.hasOwnProperty('type')){
        console.log('Embedly returned an invalid response'); 
        return false;
      }

      // Error. If the url was invalid, or 404'ed or something else. The
      // endpoint will pass back an obj  of type 'error'. Generally this is
      // were the default workflow should happen.
      if (obj.type == 'error'){
        console.log('URL ('+obj.url+') returned an error: '+ obj.error_message);
        return false;
      }

      // Generally you only want to handle preview objs that are of type
      // `html` or `image`. Others could include `ppt`,`video` or `audio`
      // which I don't believe you have a good solution for yet. We could
      // wrap them in HTML5 tags, but won't work cross browser.
      if (!(obj.type in {'html':'', 'image':''})){
        console.log('URL ('+obj.url+') returned a type ('+obj.type+') not handled'); 
        return false;
      }
      
      // If this is a change in the URL we need to delete all the old
      // information first.
      Ext.fly('preview_form').select('input[type="hidden"]').remove();
      Ext.fly('display').select('*').remove();
      
      //Sets all the data to a hidden inputs for the post.
      Ext.each(Preview.attrs, function(n){
        Ext.DomHelper.append('preview_form', {
          tag:'input',
          name : n,
          type : 'hidden',
          id : 'id_'+n,
          value : obj.hasOwnProperty(n) && obj[n] ? encodeURIComponent(obj[n]): ''
        });
      });

      //display the display section
      Ext.fly('display').show();
      Ext.fly('id_submit').removeClass('disabled');
      
      Preview.Display.render(obj);
      
      
    },
    // Fetches the Metadata from the Embedly API
    fetchMetadata: function(){
      // Get a url out of the status box.
      var url = Preview.getStatusUrl();

      // If there is no url return false.
      if (url === null) return false;
      
      // If we already looked for a url, there will be an original_url hidden
      // input that we should look for and compare values. If they are the
      // same we will ignore.
      var original_url = Ext.fly('id_original_url') ? Ext.fly('id_original_url').dom.value : null;
      if (original_url == encodeURIComponent(url)) return false;

      //Tells the loaded to start
      Ext.fly('loading').show();

      //sets up the data we are going to use in the request.
      data = {
        url:url, 
        key: EMBEDLY_API_KEY, //Your Key
        autoplay:true,
        wmode : 'opaque',
        maxwidth:500,
        words:30
      }

      // Make the request to Embedly. Note we are using the
      // preview endpoint: http://embed.ly/docs/endpoints/1/preview
      Ext.ux.JSONP.request('http://api.embed.ly/1/preview', {
        callbackKey: 'callback',
        params: data,
        callback: Preview.metadataCallback
      });      
    },
    
    onKeyUp : function(e,t){
      // Ignore Everthing but the spacebar Key event.
      if (e.getKey() != 32) return null;
      
      //See if there is a url in the status textarea
      var url = Preview.getStatusUrl();
      if (url == null) return null;
      
      // If there is a url, then we need to unbind the event so it doesn't fire
      // again. This is very common for all status updaters as otherwise it
      // would create a ton of unwanted requests.
      Ext.EventManager.un("id_status", 'keyup', Preview.onKeyUp);
      
      //Fire the fetch metadata function
      Preview.fetchMetadata();
    },

    //Binds all the Event Handlers
    bind : function(){
      //Form submission
      Ext.EventManager.on("preview_form", "submit", Preview.Feed.submitFeedItem);
      
      //Embedly Functions
      //Loses focus
      Ext.EventManager.on("id_status", 'blur', Preview.fetchMetadata);
      
      //onPaste Event
      Ext.EventManager.on("id_status", 'paste', function(){setTimeout(Preview.fetchMetadata, 250);});

      //onKeyUp Event
      Ext.EventManager.on("id_status", 'keyup', Preview.onKeyUp);
      
      // key event listener for swapping themes, looking for CMD-' or CTRL-'
      Ext.EventManager.addListener(document, 'keydown', function(e){
        if(e.ctrlKey && e.getKey()=="222")
          Preview.Display.swapStylesheets();
      });
      
      //Bind the display Events
      Preview.Display.bind();
      
      //Bind the Feed Events
      Preview.Feed.bind();
      
    }
  };
  
  Preview.Display = Display;
  Preview.Feed = Feed;
  return Preview;
})();

Ext.onReady(function(){
  //Once everything is ready bind the events.
  Preview.bind();

  //set the default stylesheet and populate the feed accordingly
  Preview.site = 'fb';
  Preview.Display.swapStylesheets();
  // hide the label if there's text in the form field
  if(Ext.fly('id_status').dom.value != '')
    Ext.fly('status_label').dom.style.display='none'
});