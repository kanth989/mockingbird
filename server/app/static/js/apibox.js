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

  var $alertBox = $("#alert-box"),
      $alertType = $alertBox.find("strong"),
      $alertMsg = $alertBox.find("label");

  function showError(message){

    $alertType.text("Error! ");
    $alertMsg.text(message);
    _applySpecialAlert('alert-danger');

    _showAlert();
    _invokeAlertHide();
  }

  function showWarning(message){

    $alertType.text("Warning! ");
    $alertMsg.text(message);
    _applySpecialAlert('alert-warning');

    _showAlert();
    _invokeAlertHide();
  }

  function showSuccess(message){

    $alertType.text("Success! ");
    $alertMsg.text(message);
    _applySpecialAlert('alert-success');

    _showAlert();
    _invokeAlertHide();
  }

  function _invokeAlertHide(){
    window.setTimeout(function(){
      _hideAlert();
    }, 5000);
  }

  function _applySpecialAlert(classNameValue){
    $alertBox.removeAttr('class');
    $alertBox.attr('class', 'alert collapse');
    $alertBox.addClass(classNameValue);
  }

  function _showAlert(){
    $alertBox.removeClass("collapse");
    $alertBox.addClass("expand");
  }

  function _hideAlert(){
    $alertBox.removeClass("expand");
    $alertBox.addClass("collapse");
  }


  return {
    showError : showError,
    showWarning : showWarning,
    showSuccess : showSuccess
  };
})();