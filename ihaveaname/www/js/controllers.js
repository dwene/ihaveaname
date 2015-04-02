function appendHashTags(_inTweet, _outTweet, _hashtags){
  console.log("appendHashTags: inputs: ",_inTweet, _outTweet, _hashtags)
  var inTweet = _inTweet.toLowerCase();
  var outTweetLower = _outTweet.toLowerCase();
  var returnTweet = _outTweet.trim();
  for (var i = 0; i < _hashtags.length; i++){
    if(inTweet.indexOf(_hashtags[i]) != -1 && outTweetLower.indexOf(_hashtags[i]) == -1){
      if ((returnTweet.length + _hashtags[i].length + 1) <=140){
        returnTweet += " " + _hashtags[i];
      }
    }
  }
  return returnTweet;
}

angular.module('starter.controllers', [])
.controller('tweetCtrl', function($scope, Tweet, TwitterService, $ionicModal, $ionicPlatform, $sce, $timeout) {
  TwitterService.initialize().then(function() {
    $scope.tweets = [];
    $scope.tweetlist = [
      'You know what it is. #rpgo tinyurl.com/qx8jero', 
      'Real People Getting Oppressed #rpgo tinyurl.com/qx8jero', 
      'She is worth it. #rpgo tinyurl.com/qx8jero'
    ];
  	$scope.$on('tweetReady', function(scopeInfo, new_tweet) {
      $scope.tweets.push(new_tweet);
      if ($scope.tweets.length < 3){
        Tweet.getTweet(new_tweet.Id);
      }
  	});

    $scope.$on('retweetsReady', function(scopeInfo, replies) {
      $scope.replies = replies;
    });
  	Tweet.getTweet(window.localStorage.getItem('lastId') || '0');  

    $scope.skip = function() {
      var lastId = $scope.tweets[0].Id;
      window.localStorage.setItem('lastId', lastId);
      Tweet.getTweet($scope.tweets[$scope.tweets.length - 1].Id);
      $scope.tweets.splice(0, 1);
    };

    $scope.openModal = function(){
      if (!$scope.modal){
        $ionicModal.fromTemplateUrl('templates/tweetout.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      }
      else{
        $scope.modal.show();
      }
    };
    $scope.closeModal = function(outTweet){
      outTweet = appendHashTags($scope.tweets[0].Text, outTweet, Tweet.getHashTagList());
      console.log("Sending Tweet: ", outTweet);
      TwitterService.postTweet(outTweet).then(function () {
        console.log('Successfully tweeted response');
      }).catch(function (err) {
        if (err.status === 401) {
          TwitterService.storeUserToken(null);
          TwitterService.initialize().then(function() {
            TwitterService.postTweet(outTweet);
          });
        } else {
          console.error('Failed to tweet response', err);
        }
      }).finally(function () {        //wait for modal to close before removing element
        $timeout(function() {
         $scope.skip();
        }, 400);
        $scope.modal.hide();
        $scope.modal.remove();
        delete $scope.modal;
      });
    };
  });
})
.controller('shareCtrl', function($scope){

});
