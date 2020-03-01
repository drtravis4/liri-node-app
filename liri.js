'use strict';

// write the code you need to grab the data from keys.js. Then store the keys in a variable.

var keys = require('./keys.js');


// fs is a core Node package for reading and writing files
var fs = require("fs");


var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var imdb = require("imdb-api");

// Store all of the arguments in an array
var nodeArgs = process.argv;



// Make it so that this file can take in one of the following commands: my-tweets / spotify-this-song / movie-this / do-what-it-says

/* What Each Command Should Do
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
1. node liri.js my-tweets
	This will show your last 20 tweets and when they were created at in your terminal/bash window.
*/
function show20Tweets(){
  
  // testing the function
  // console.log("I'm showing my tweets");

  var client = new Twitter(keys.twitterKeys);

  console.log("Showing tweets for Twitter user 'QMichauxii'" + "\n");

  var params = {screen_name: 'QMichauxii'};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      for(var i=0; i<Math.min(20, tweets.length); i++){
        appendToLog(tweets[i].created_at);
        appendToLog(tweets[i].text + "\n");
      }
    } else {
      console.log(error);
    }
  });
}




/*   +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
2. node liri.js spotify-this-song '<song name here>'
  This will show the following information about the song in your terminal/bash window
    Artist(s)
    The song's name
    A preview link of the song from Spotify The album that the song is from
  if no song is provided then your program will default to "The Sign" by Ace of Base
*/



function showSongInfo(songName){
  // console.log("I'm showing song information for " + songName);
  
  var spotify = new Spotify(keys.spotifyKeys);

    // checking to see if NO song name entered
    if(!songName) {
      //  songName = "The Sign"
      spotify
        .request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
        .then(function(data) {
          appendToLog('Since you didn\'t specify a song title, then you\'re stuck with this one:' + '\n')
          appendToLog('Artist: ' + data.artists[0].name);
          appendToLog('Title: ' + data.name);
          appendToLog('Song URL: ' + data.preview_url);
          appendToLog('Album: ' + data.album.name + "\n"); 
        })
        .catch(function(err) {
          console.error('Error occurred: ' + err); 
        });

    } else {
      // search based on song name entered

      spotify.search({ type: 'track', query: songName, limit: 1}, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }

        // this just gives me more info than I need
        //console.log(JSON.stringify(data)); 

        // iterating to display all in case of multiple artists
        for(var i=0; i<data.tracks.items[0].artists.length; i++) {
          appendToLog('Artist(s): ' + data.tracks.items[0].artists[i].name);
        ;}

        // song title
        appendToLog('Title: ' + data.tracks.items[0].name);
        
        // Since not all of the songs have a preview URL, then check for the absence of one and return a custom message
        var url = data.tracks.items[0].preview_url;
        if (url) {
          appendToLog('Song URL: ' + data.tracks.items[0].preview_url);
        } else {
          appendToLog('(This song does not appear to have a URL in Spotify!)')
        }

        // song's album
        appendToLog('Album: ' + data.tracks.items[0].album.name + "\n");
      });
    }
}




/*   +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
3. node liri.js movie-this '<movie name here>'
  This will output the following information to your terminal/bash window:
    * Title of the movie.
    * Year the movie came out.
    * IMDB Rating of the movie.
    * Country where the movie was produced. 
    * Language of the movie.
    * Plot of the movie.
    * Actors in the movie.
    * Rotten Tomatoes URL.
  If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
    If you haven't watched "Mr. Nobody," then you should: http://www.imdb.com/title/tt0485947/ 
    It's on Netflix!
*/

function showMovieInfo(movieName){

  // checking to see if NO movie name entered
  if(!movieName) {
    //  movieName = "Mr. Nobody"
    movieName = "Mr. Nobody";
    appendToLog('Since you didn\'t specify a movie title, then you\'re stuck with this one:' + '\n')

  } /* 
    This was not needed because movieName seems to going in as a string already ???
  else {
    // search based on movie name entered
    // Loop through all the words in the node argument
    // And do a little for-loop magic to handle the inclusion of "+"s
    for (var i = 3; i < nodeArgs.length; i++) {
      if (i > 3 && i < nodeArgs.length) {
        movieName = movieName + "+" + nodeArgs[i];
      }
      else {
        movieName += nodeArgs[i];
      }
    } 
  } */

  // Then run a request to the OMDB API with the movie specified
  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&tomatoes=true&r=json&apikey=40e9cece";

  // This line is just to help us debug against the actual URL.
   // console.log(queryUrl);


  request(queryUrl, function(error, response, body) {

    // If the request is successful
    if (!error && response.statusCode === 200) {

      // Parse the body of the site and recover just the imdbRating
      // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
      appendToLog("Movie Title: " + JSON.parse(body).Title);
      appendToLog("Release Year: " + JSON.parse(body).Year);
      appendToLog("IMDB Rating: " + JSON.parse(body).imdbRating);
      appendToLog("Country of Origin: " + JSON.parse(body).Country);
      appendToLog("Language: " + JSON.parse(body).Language);
      appendToLog("Plot: " + JSON.parse(body).Plot);
      appendToLog("Actors: " + JSON.parse(body).Actors);
      appendToLog("Rotten Tomatoes URL: " + JSON.parse(body).tomatoURL + "\n");
    } else {
      console.log(error);
      console.log(response.statusCode);
    }

  });

}


//  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// function to piece it all together and run functions depending on the command given

function doWhatItSays(command, args){
  if (command === 'my-tweets'){
    show20Tweets();
  } else if (command === 'spotify-this-song') {
    showSongInfo(args);
  } else if (command === 'movie-this') {
    showMovieInfo(args);
  } else {
    console.log('This is an error.\r\n \r\nPlease enter: \r\n \r\nmy-tweets, \r\nspotify-this-song, \r\nmovie-this, or \r\ndo-what-it-says\r\n \r\nfollowing the liri.js command. \r\n');
  }
}



 /*   +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
BONUS
  In addition to logging the data to your terminal/bash window, output the data to a .txt file called log.txt . 
  Make sure you append each command you run to the log.txt file.
  
  Do not overwrite your file each time you run a command. */

function appendToLog(result){
  console.log(result);
  fs.appendFile("log.txt", result + "\n", function(err) {

    // If an error was experienced we say it.
    if (err) {
      console.log(err);
    }
  });
}

// this writes the command to BOTH the console and to the log.txt file AND formats everything nicely with preceeding new line so that BOTH the console AND the appended log.txt file both have a line of space between results

// ALSO because the nodeArgs 'result' is an array, we need to join it again

appendToLog("\n" + nodeArgs.slice(2).join(" ") + "\n");



/*   +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  4. node liri.js do-what-it-says
  Using the fs Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands
  It should run spotify-this-song for "I Want it That Way," as follows the text in random.txt .
  Feel free to change the text in that document to test out the feature for other commands
*/


if(nodeArgs[2] === 'do-what-it-says') {
  fs.readFile("random.txt", "utf8", function(error, data) {

    // If the code experiences any errors it will log the error to the console.
    if (error) {
      return console.log(error);
    }

    var infoRead = data.split(',');
    // We will then print the contents of data
    return doWhatItSays(infoRead[0], infoRead[1]);
  });

} else {
  doWhatItSays(nodeArgs[2], nodeArgs[3]);
}


// DONE !!!!!    +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
