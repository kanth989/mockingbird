var app = angular.module('ApiboxUI', [
  'ngRoute', 'ngCookies', 'ngAnimate'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "static/partials/login.html"})
    // Pages
    .when("/detail", {templateUrl: "static/partials/detail.html"})
    .when("/list", {templateUrl: "static/partials/list.html"})
    // else 404
    .otherwise("/404", {templateUrl: "static/partials/notfound.html"});
}]);

app.directive('jsonText', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {            
          function into(input) {
            return input;
          }
          function out(data) {
            return JSON.stringify(data);
          }
          ngModel.$parsers.push(into);
          ngModel.$formatters.push(out);
        }
    };
});

var alertBox = (function(){
  var autoCloseId,
      closeCallbackRegistered;

  var $alertBox = $("#alert-box"),
      $alertMsgCont = $alertBox.find(".msg-container"),
      $alertType = $alertBox.find("strong"),
      $alertMsg = $alertBox.find("label");

  function showError(message, properties, eventInfo){

    $alertType.text("Error! ");
    $alertMsg.text(message);

    _showAlert(properties);
    _applySpecialAlert('alert-danger');
    _invokeAlertHide((eventInfo && eventInfo.onclose));
  }

  function showWarning(message, properties, eventInfo){

    $alertType.text("Warning! ");
    $alertMsg.text(message);

    _showAlert(properties);
    _applySpecialAlert('alert-warning');
    _invokeAlertHide((eventInfo && eventInfo.onclose));
  }

  function showSuccess(message, properties, eventInfo){

    $alertType.text("Success! ");
    $alertMsg.text(message);

    _showAlert(properties);
    _applySpecialAlert('alert-done');
    _invokeAlertHide((eventInfo && eventInfo.onclose));
  }

  function forceClose(){
    _hideAlert();
    if(closeCallbackRegistered){
        closeCallbackRegistered.call();
        closeCallbackRegistered = null;
      }
  }

  function _invokeAlertHide(closeCallback){
    closeCallbackRegistered = closeCallback;
    autoCloseId = window.setTimeout(function(){
      var status = _hideAlert();
      if(status && closeCallback){
        closeCallback.call();
        closeCallbackRegistered = null;
      }
    }, 5000);
  }

  function _applySpecialAlert(classNameValue){
    
    $alertBox.addClass(classNameValue);
  }

  function _showAlert(propertyInfo){
    forceClose();
    var actionLink = "<a>{{Action}}</a>";
    if(propertyInfo){
      if(propertyInfo.dom){
        var $refElm = $(propertyInfo.dom);
        if($refElm.length>0){
          $alertBox.css("top", $(propertyInfo.dom).offset().top + "px");
        }
        if(propertyInfo.action){
          if(propertyInfo.action.fnName){
            $alertMsgCont.append(actionLink.replace("{{Action}}", propertyInfo.action.fnName));
            $alertMsgCont.find("*:last-child").bind("click", function(){
              _hideAlert();
              propertyInfo.action.fnAction.call();
            });
          }
        }
      }
    }
    $alertBox.removeAttr('class');
    $alertBox.attr('class', 'alert collapse');

    $alertBox.removeClass("collapse");
    $alertBox.addClass("expand");
  }

  function _hideAlert(){
    if($alertBox.hasClass("expand")){
      $alertBox.removeClass("expand");
      $alertBox.addClass("collapse");

      while($alertMsg.next().length>0){
        $alertMsg.next().remove();
      }
      if(autoCloseId){
        window.clearTimeout(autoCloseId);
      }
      return true;
    } else {
      return false;
    }
    
  }


  return {
    showError : showError,
    showWarning : showWarning,
    showSuccess : showSuccess,
    forceClose : forceClose
  };
})();