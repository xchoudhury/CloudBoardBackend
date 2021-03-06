// Boards controller, has main control over the functions that directly affect the board data
app.controller('boards', ['$scope', '$http', '$window', 'loginService', function($scope, $http, $window, loginService) {
    $scope.loggedIn;
    $scope.name;
    $scope.order = "id";
    $scope.reverse = false;
    $scope.search;

    $scope.pasteHandler = function($event, board, snippet) {
      for (var i = 0; i < $event.originalEvent.clipboardData.items.length; i++) {
        if ($event.originalEvent.clipboardData.items[i].type.indexOf('image') != -1) {
          $http({
            method: 'PUT',
            url: '/clipboards/'+board.id+'/snippet/',
            data: {
              snip_id: snippet.id,
              text: snippet.content,
              image: snippet.content
            }
          }).then(function successCallback(response) {
            console.log(response);
            snippet.isImage = true;
            setTimeout(function() {
              $("#" + board.id + '_' + snippet.id + "pasting").blur();
              $("#" + board.id + '_' + snippet.id + "saveButton").hide();
            }, 100);
            $('#pasteAlert').show();
            setTimeout(function() {
              $('#pasteAlert').fadeOut(300);
            }, 3000);
            return;
          }, function errorCallback(response) {
            console.log(response);
            alertError('Error: Could not save image paste to snippet ID ' + snippet.id + ' in board ID ' + board.id + '. Response status ' + response.status + '.');
            return;
          });
        }
      }
      if (snippet.content.match(/\.(jpeg|jpg|gif|png)$/) != null) {
        $http({
          method: 'PUT',
          url: '/clipboards/'+board.id+'/snippet/',
          data: {
            snip_id: snippet.id,
            text: snippet.content,
            image: snippet.content
          }
        }).then(function successCallback(response) {
          console.log(response);
          snippet.isImage = true;
          setTimeout(function() {
            $("#" + board.id + '_' + snippet.id + "pasting").blur();
            $("#" + board.id + '_' + snippet.id + "saveButton").hide();
          }, 100);
          $('#pasteAlert').show();
          setTimeout(function() {
            $('#pasteAlert').fadeOut(300);
          }, 3000);
          return;
        }, function errorCallback(response) {
          console.log(response);
          alertError('Error: Could not save image paste to snippet ID ' + snippet.id + ' in board ID ' + board.id + '. Response status ' + response.status + '.');
          return;
        });
      }
    };

    $scope.toggleOrder = function(expression) {
      var id = "#" + expression + "Order";
      if (expression == $scope.order) {
        $scope.reverse = !$scope.reverse;
        $(id).toggleClass('btn-primary');
        $(id).toggleClass('btn-dark');
      }
      else {
        $scope.order = expression;
        $scope.reverse = false;
        $('#orderGroup').children('button').each(function() {
          if (this.id != id) {
            $(this).removeClass('btn-primary');
            $(this).removeClass('btn-dark');
            $(this).addClass('btn-outline-secondary');
          }
        });
        $(id).removeClass('btn-outline-secondary');
        $(id).addClass('btn-primary');
      }
    };
  
    $scope.boards = []; // This array variable will store all the boards and their info
  
    $scope.$on('loggingIn', function() { // Get updated user info when loginService sends loggingIn signal
      $scope.loggedIn = true;
      $scope.name = loginService.getUserName();
      $scope.getBoards();
      $('#dimmer').hide();
      $('.contentView').show();
      $('.boardsView').hide();
      $('#boardsLoader').show();
    });
  
    $scope.$on('loggingOut', function() { // Clear boards when the user logs out
      $scope.loggedIn = false;
      $scope.name = loginService.getUserName();
      $('.contentView').show();
      $scope.getBlankBoards();
    });

    $scope.$on('update', function() {
      $scope.name = loginService.getUserName();
    });
  
    // Create a board from passed in name
    $scope.createBoard = function(id, name) {
      var board = new Board(id, name, true);
      // GET SNIPPETS
      $http({
        method: 'GET',
        url: '/clipboards/'+id+'/snippet/'
      }).then(function successCallback(response) {
        console.log(response);
        if (response.data.length == 0) {
          board.hasContent = false;
        }
        else {
          for (var i = 0; i < response.data.length; i++) {
            board.data.push(new Snippet(response.data[i].id, response.data[i].text));
          }
        }
      }, function errorCallback(response) {
        console.log(response);
        alertError('Error: Could not get snippets for board ID ' + id + '. Response status ' + response.status + '.');
      })
      $scope.boards.push(board);
    };
    
    $scope.createEmptyBoard = function(id, name) {
      var board = new Board(id, name, false);
      $scope.boards.push(board);
    };
  
    // Creates a blank board and adds it to the end of the boards arrays
    $scope.createBlankBoard = function() {
      var blankBoard = new Board($scope.boards.length, "Board " + ($scope.boards.length+1), false);
      $scope.boards.push(blankBoard);
    };

    $scope.createNewBoard = function() {
      $http({
        method: 'POST',
        url: '/clipboards/',
        data: {
          name: String("Board " + ($scope.boards.length+1))
        }
      }).then(function successCallback(response) {
        console.log(response);
        $scope.createEmptyBoard(response.data.id, response.data.name);
      }, function errorCallback(response) {
        alertError('Error: Could not create a new board. Response status ' + response.status + '.');
        console.log(response);
      });
    };
    
    $scope.removingBoard = false;
    $scope.removeID = -1;
    // Remove specific board with given id
    $scope.removeBoard = function(id) {
      if (!$scope.removingBoard) {
        $('#deleteBoardModal').modal('show');
        $scope.removingBoard = true;
        $scope.removeID = id;
        return;
      }
      if ($scope.boards.length == 0) {
        return;
      }
      if ($scope.removeID == -1) {
        return;
      }
      // console.log($scope.boards);
      $http({
        method: 'DELETE',
        url: '/clipboards/',
        data: {
          id: String($scope.removeID)
        },
        headers: {
          "Content-Type": "application/json"
        }
      }).then(function successCallback(response) {
        console.log(response);
        for (var i = 0; i < $scope.boards.length; i++) {
          if ($scope.boards[i].id == $scope.removeID) {
            $scope.boards.splice(i, 1);
          }
        }
        $scope.removingBoard = false;
        $scope.removeID = -1;
      }, function errorCallback(response) {
        console.log(response);
        alertError('Error: Could not remove board ID ' + id + '. Response status ' + response.status + '.');
      });
      $('#deleteBoardModal').modal('hide');
    };

    $scope.cancelRemove = function() {
      // Reset remove variables to prevent accidental deletion
      $scope.removingBoard = false;
      $scope.removeID = -1;
    };

    $scope.renameKeyCheck = function(e) {
      if (e.keyCode == 13) {
        $scope.renameBoard();
      }
    };

    $scope.renamingBoard = false;
    $scope.renameID = -1;
    $scope.rename = "";
    // Rename a board with a given id
    $scope.renameBoard = function(id = $scope.renameID) {
      $('#renameBoardError').html("");
      if (!$scope.renamingBoard) {
        $('#renameBoardModal').modal('show');
        $scope.renamingBoard = true;
        $scope.renameID = id;
        for (var i = 0; i < $scope.boards.length; i++) {
          if ($scope.boards[i].id == id) {
            $scope.rename = $scope.boards[i].name;
            break;
          }
        }
        setTimeout(function() {
          $("#renameInput").focus();
        }, 200);
        return;
      }
      if ($scope.boards.length == 0) {
        return;
      }
      if ($scope.renameID == -1) {
        return;
      }
      $http({
        method: 'PUT',
        url: '/clipboards/',
        data: {
          id: $scope.renameID,
          name: $scope.rename
        }
      }).then(function successCallback(response) {
        console.log(response);
        for (var i = 0; i < $scope.boards.length; i++) {
          if ($scope.boards[i].id == $scope.renameID) {
            $scope.boards[i].name = $scope.rename;
          }
        }
        $scope.renamingBoard = false;
        $scope.renameID = -1;
        $scope.rename = "";
        $('#renameBoardModal').modal('hide');
      }, function errorCallback(response) {
        console.log(response);
        printErrors(response.data.name, 'renameBoardError');
      });
    };

    $scope.cancelRename = function() {
      // Reset rename variables to prevent accidental rename
      $scope.renamingBoard = false;
      $scope.renameID = -1;
      $scope.rename = "";
    };

    function createBoardPromise(id, name, last_modified) {
      return new Promise(resolve => {
        var board = new Board(id, name, true, last_modified);
        // GET SNIPPETS
        $http({
          method: 'GET',
          url: '/clipboards/'+id+'/snippet/'
        }).then(function successCallback(response) {
          console.log(response);
          if (response.data.length == 0) {
            board.hasContent = false;
          }
          else {
            for (var i = 0; i < response.data.length; i++) {
              board.data.push(new Snippet(response.data[i].id, response.data[i].text, response.data[i].image != ""));
            }
          }
          $scope.boards.push(board);
          resolve();
        }, function errorCallback(response) {
          console.log(response);
          alertError('Error: Could not get snippets for board ID ' + id + '. Response status ' + response.status + '.');
        });
      });
    }
  
    // Get users boards
    $scope.getBoards = function() {
      $scope.boards = [];
      // Database call to load up this users current boards
      $http({
        method: 'GET',
        url: '/clipboards/'
      }).then(function successCallback(response) {
        console.log(response);
        var promises = [];
        for (var i = 0; i < response.data.length; i++) {
          promises.push(createBoardPromise(response.data[i].id, response.data[i].name, response.data[i].last_modified));
        }
        Promise.all(promises).then(function() {
          $('#boardsLoader').hide();
          $('.boardsView').slideDown("slow", function() {});
        })
      }, function errorCallback(response) {
        alertError('Error: Could not get clipboards. Response status ' + response.status + '.');
        console.log(response);
      });
    };
  
    // Create blank boards when not logged in, serve as background data
    $scope.getBlankBoards = function() {
      $scope.boards = [];
      $scope.createBlankBoard();
      $scope.createBlankBoard();
      $scope.createBlankBoard();
    }
  
    $scope.expand = function($event, board) {
      for (var i = 0; i < $scope.boards.length; i++) {
        if ($scope.boards[i].expanded && $scope.boards[i].id != board.id) {
          $('#' + $scope.boards[i].id + 'snippets').slideUp('slow', function(){});
          $('#' + $scope.boards[i].id + 'board').stop(true, false).animate({
            width: "80%"
          }, 400);
          $scope.boards[i].expanded = false;
        }
      }
      $('#' + board.id + 'snippets').slideToggle('slow', function() {});
      $('#' + board.id + 'board').stop(true, false).animate({
        width: board.expanded ? "80%" : "100%"
      }, 400);
      board.expanded = !board.expanded;
    };

     //https://stackoverflow.com/questions/27863617/is-it-possible-to-copy-a-canvas-image-to-the-clipboard
     function SelectText(element) {
      var doc = document;
      if (doc.body.createTextRange) {
          var range = document.body.createTextRange();
          range.moveToElementText(element);
          range.select();
      } else if (window.getSelection) {
          var selection = window.getSelection();
          var range = document.createRange();
          range.selectNodeContents(element);
          selection.removeAllRanges();
          selection.addRange(range);
      }
    }
  
    // Copy function
    $scope.copySnippet = function(snippet) {
      if (snippet.isImage) {
        // Redirect to copy function
        $scope.copyImage(snippet);
        return;
      }

      $('#copyAlert').hide(); // Hide stacked copy notifications
  
      // Create off-screen text area, populate it with this boards data, execute a copy, delete this off-screen text area
      var textarea = document.createElement( "textarea" );
      textarea.style.height = "0px";
      textarea.style.left = "-100px";
      textarea.style.opacity = "0";
      textarea.style.position = "fixed";
      textarea.style.top = "-100px";
      textarea.style.width = "0px";
      textarea.contentEditable = true;
      textarea.readOnly = false;
      document.body.appendChild( textarea );
      textarea.value = snippet.content;
      if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
        textarea.setSelectionRange(0, 999999);
      }
      else {
        textarea.select();
      }
      document.execCommand('copy');
      textarea.parentNode.removeChild( textarea );
  
      // Show copy alert and fade it out after 3 seconds
      $('#copyAlert').show();
      setTimeout(function() {
        $('#copyAlert').fadeOut(300);
      }, 3000);
    };

   

    // Copy an image provided by the snippet link
    $scope.copyImage = function(snippet) {
      $('#copyAlert').hide();
      var img = document.createElement('img');
      img.src = snippet.content;

      var div = document.createElement('div');
      div.contentEditable = true;
      div.appendChild(img);
      document.body.appendChild(div);

      // do copy
      SelectText(div);
      document.execCommand('Copy');
      document.body.removeChild(div);

      // Show copy alert and fade it out after 3 seconds
      $('#copyAlert').show();
      setTimeout(function() {
        $('#copyAlert').fadeOut(300);
      }, 3000);
    };

    // New Snippet function
    $scope.addSnippet = function(board) {
      $http({
        method: 'POST',
        url: '/clipboards/'+board.id+'/snippet/'
      }).then(function successCallback(response) {
        console.log(response);
        var snippet = new Snippet(response.data.id, "");
        if (board.data.length == 0) {
          board.hasContent = true;
        }
        board.data.push(snippet);
        setTimeout(function() {
          $("#" + board.id + "_" + snippet.id + "pasting").focus();
        }, 100);
      }, function errorCallback(response) {
        console.log(response);
        alertError('Error: Could not add snippet to board ID ' + board.id + '. Response status ' + response.status + '.');
      })
    };

    $scope.removeSnippet = function(boardID, snippetID) {
      $http({
        method: 'DELETE',
        url: '/clipboards/'+boardID+'/snippet/',
        data: {
          snip_id: snippetID
        },
        headers: {
          "Content-Type": "application/json"
        }
      }).then(function successCallback(response) {
        console.log(response);
        for (var i = 0; i < $scope.boards.length; i++) {
          if ($scope.boards[i].id == boardID) {
            for (var j = 0; j < $scope.boards[i].data.length; j++) {
              if ($scope.boards[i].data[j].id == snippetID) {
                $scope.boards[i].data.splice(j, 1);
                break;
              }
            }
          }
        }
      }, function errorCallback(response) {
        console.log(response);
        alertError('Error: Could not remove snippet ID ' + snippetID + ' from board ID ' + boardID + '. Response status ' + response.status + '.');
      })
    };
  
    // Save the paste when the user hits error
    $scope.pasteKeyCheck = function(e, board, snippet) {
      if (e.keyCode == 13) {
        $scope.savePaste(board, snippet);
      }
    };

    $scope.showSaveButton = function(boardID, snippetID) {
      $('#' + boardID + '_' + snippetID + 'saveButton').show();
    };

    $scope.hideSaveButton = function(boardID, snippetID) {
      setTimeout(function() {
        $('#' + boardID + '_' + snippetID + 'saveButton').hide();
      }, 100);
    };
  
    // Save user's paste
    $scope.savePaste = function(board, snippet) {
      //console.log(board);
      // Hide overlapping paste alert
      $('#pasteAlert').hide();
      // Update variables
      board.hasContent = true;

      $http({
        method: 'PUT',
        url: '/clipboards/'+board.id+'/snippet/',
        data: {
          snip_id: snippet.id,
          image: "",
          text: snippet.content
        }
      }).then(function successCallback(response) {
        console.log(response);
        snippet.isImage = false;
        setTimeout(function() {
          $("#" + board.id + '_' + snippet.id + "pasting").blur();
          $("#" + board.id + '_' + snippet.id + "saveButton").hide();
        }, 100);
        // Show successful paste alert, fade
        $('#pasteAlert').show();
        setTimeout(function() {
          $('#pasteAlert').fadeOut(300);
        }, 3000);
      }, function errorCallback(response) {
        alertError('Error: Could not save paste to snippet ID ' + snippet.id + ' in board ID ' + board.id + '. Response status ' + response.status + '.');
        console.log(response);
      })
    };
  
    // If the content of the board is longer than 45 characters, give it a '...' (can be made to any length)
    $scope.filterPreview = function(x) {
      if (typeof x == undefined) {
        return "";
      }
      if (x.length <= 45) {
        return x;
      }
      else {
        return x.substring(0, 44) + "...";
      }
    };
  
  }]);