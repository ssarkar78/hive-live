'use strict';

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('post');
var messageInput = document.getElementById('ripple-text');
var titleInput = document.getElementById('ripple-tag');
var signInButton = document.getElementById('sign-up-btn');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var recentPostsSection = document.getElementById('recent-posts-list');
var userPostsSection = document.getElementById('user-posts-list');
var topUserPostsSection = document.getElementById('top-user-posts-list');
var recentMenuButton = document.getElementById('menu-recent');
var myPostsMenuButton = document.getElementById('menu-my-posts');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
var messageId = $('body>div.container').attr('value');
var sendComment = document.getElementById("comment-send-btn");
var commentInput = document.getElementById('comment-input');
var listeningFirebaseRefs = [];

/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    starCount: 0,
    authorPic: picture
  };

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}
// [END write_fan_out]

/**
 * Star/unstar post.
 */
// [START post_stars_transaction]
function toggleStar(postRef, uid) {
  postRef.transaction(function(post) {
    if (post) {
      if (post.stars && post.stars[uid]) {
        post.starCount--;
        post.stars[uid] = null;
      } else {
        post.starCount++;
        if (!post.stars) {
          post.stars = {};
        }
        post.stars[uid] = true;
      }
    }
    return post;
  });
}
// [END post_stars_transaction]

/**
 * Creates a post element.
 */
function createPostElement(postId, title, text, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;

 var html = '<div class="ripple-feeds-element" id="' + postId + '" data-value="' + title + '">'
  + '<p class="ripple-feeds-element-text">' + text + '</p>'
                +'<span class="label label-success">'+title+'</span></h5><br><br>'
                +'<img src="' + authorPic + '"><a data-id="' + authorId + '" class="user-link"' +
                "href='#" + author + "_" + authorId + "'>" + author + "</a>";
  $('#ripple-panel').html(html);

  // Create the DOM element from the HTML.
  // var div = document.createElement('div');
  // div.innerHTML = html;
  // var postElement = div.firstChild;
  // if (componentHandler) {
  //   componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
  // }

  // var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
  // var commentInput = postElement.getElementsByClassName('new-comment')[0];
  // var star = postElement.getElementsByClassName('starred')[0];
  // var unStar = postElement.getElementsByClassName('not-starred')[0];

  // // Set values.
  // postElement.getElementsByClassName('text')[0].innerText = text;
  // postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  // postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  // postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
  //     (authorPic || './silhouette.jpg') + '")';

  // Listen for comments.
  // [START child_event_listener_recycler]
  var commentsRef = firebase.database().ref('post-comments/' + postId);
  commentsRef.on('child_added', function(data) {
    console.log(data.val().text);
  addCommentElement(data.key, data.val().text, data.val().author,data.val().uid);
  });

  commentsRef.on('child_changed', function(data) {
    //setCommentValues(postElement, data.key, data.val().text, data.val().author);
  });

  commentsRef.on('child_removed', function(data) {
    //deleteComment(postElement, data.key);
  });
  // [END child_event_listener_recycler]

  // Listen for likes counts.
  // [START post_value_event_listener]
  var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
  starCountRef.on('value', function(snapshot) {
    //updateStarCount(postElement, snapshot.val());
  });
  // [END post_value_event_listener]

  // Listen for the starred status.
  var starredStatusRef = firebase.database().ref('posts/' + postId + '/stars/' + uid)
  starredStatusRef.on('value', function(snapshot) {
    //updateStarredByCurrentUser(postElement, snapshot.val());
  });

  // Keep track of all Firebase reference on which we are listening.
  listeningFirebaseRefs.push(commentsRef);
  listeningFirebaseRefs.push(starCountRef);
  listeningFirebaseRefs.push(starredStatusRef);

  // Create new comment.
  sendComment.onclick = function(e) {
    e.preventDefault();
    createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
    commentInput.value = '';
  };

  // // Bind starring action.
  // var onStarClicked = function() {
  //   var globalPostRef = firebase.database().ref('/posts/' + postId);
  //   var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
  //   toggleStar(globalPostRef, uid);
  //   toggleStar(userPostRef, uid);
  // };
  // unStar.onclick = onStarClicked;
  // star.onclick = onStarClicked;

  // return postElement;
}

/**
 * Writes a new comment for the given post.
 */
function createNewComment(postId, username, uid, text) {
  firebase.database().ref('post-comments/' + postId).push({
    text: text,
    author: username,
    uid: uid
  });
}

/**
 * Updates the starred status of the post.
 */
function updateStarredByCurrentUser(postElement, starred) {
  if (starred) {
    postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
  } else {
    postElement.getElementsByClassName('starred')[0].style.display = 'none';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
  }
}

/**
 * Updates the number of stars displayed for a post.
 */
function updateStarCount(postElement, nbStart) {
  postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
}

/**
 * Creates a comment element and adds it to the given postElement.
 */
function addCommentElement(id, text, author,uid) {
 var html = '<div class="ripple-comment-element" id="' + id + '" data-value="' + text + '">'
  + '<p class="ripple-comment-element-text">' + text + '</p>'
                +'<a data-id="' + uid + '" class="user-link"' +
                "href='#" + author + "_" + uid + "'>" + author + "</a>";
  $('#ripple-comment-panel').prepend(html);
}

/**
 * Sets the comment's values in the given postElement.
 */
function setCommentValues(postElement, id, text, author) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('fp-username')[0].innerText = author;
}

/**
 * Deletes the comment of the given ID in the given postElement.
 */
function deleteComment(postElement, id) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.parentElement.removeChild(comment);
}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  // [START my_top_posts_query]
  var myUserId = firebase.auth().currentUser.uid;
  var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
  // [END my_top_posts_query]
  // [START recent_posts_query]
  var recentPostsRef = firebase.database().ref('posts/'+messageId);
  // [END recent_posts_query]
  var userPostsRef = firebase.database().ref('user-posts/' + myUserId);

  var fetchPosts = function(postsRef, sectionElement) {
    postsRef.on('value', function(data) {
      var author = data.val().author || 'Anonymous';
      createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic);
    });
    postsRef.on('child_changed', function(data) {	
      console.log(data)
		// var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
		// var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
		// postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
		// postElement.getElementsByClassName('username')[0].innerText = data.val().author;
    console.log(data.val().body);
		// postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
    });
    postsRef.on('child_removed', function(data) {
		var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
		var post = containerElement.getElementsByClassName('post-' + data.key)[0];
	    post.parentElement.removeChild(post);
    });
  };

  // Fetching and displaying all posts of each sections.
  //fetchPosts(topUserPostsRef, topUserPostsSection);
  fetchPosts(recentPostsRef, recentPostsSection);
  //fetchPosts(userPostsRef, userPostsSection);

  // Keep track of all Firebase refs we are listening to.
  //listeningFirebaseRefs.push(topUserPostsRef);
  listeningFirebaseRefs.push(recentPostsRef);
  //listeningFirebaseRefs.push(userPostsRef);
}

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  // topUserPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
  // recentPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
  // userPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    currentUID = user.uid;
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = snapshot.val().username;
    // [START_EXCLUDE]
    return writeNewPost(firebase.auth().currentUser.uid, username,
        firebase.auth().currentUser.photoURL,
        title, text);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  recentPostsSection.style.display = 'none';
  userPostsSection.style.display = 'none';
  topUserPostsSection.style.display = 'none';
  addPost.style.display = 'none';
  recentMenuButton.classList.remove('is-active');
  myPostsMenuButton.classList.remove('is-active');
  myTopPostsMenuButton.classList.remove('is-active');

  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  }
}

// Bindings on load.
window.addEventListener('load', function() {
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
   messageForm.onclick = function(e) {
    e.preventDefault();
    var text = messageInput.value;
    var title = titleInput.value;
    if (text && title) {
      newPostForCurrentUser(title, text).then(function() {
        //myPostsMenuButton.click();
      });
      messageInput.value = '';
      titleInput.value = '';
    }
  };


}, false);
