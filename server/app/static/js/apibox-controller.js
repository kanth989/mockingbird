app.service('apiData', function ApiData() {
    var apiData = this;
  });

app.controller("loginController", ['$scope', '$location', '$cookies', 'apiData', function($scope, $location, $cookies, apiData){
	$scope.login = function(){
		
		$.ajax({
			url : 'http://172.17.0.48/api/v1/posts',
			type: "GET",
			async : true,
			dataType: 'json',
			headers: {
			    "Authorization": "Basic " + btoa($scope.username + ":" + $scope.password)
			  },
			success : function(data){
				alertBox.showSuccess("Login Succeded");
				$cookies.username = $scope.username;
				$cookies.password = $scope.password;
				if(data && data instanceof Array){
					apiData.data = data;
					$location.path('/list');
					$scope.$apply();
				} else{
					apiData.data = [];
					$location.path('/detail');
					$scope.$apply();
				}
			},
			error : function(){
				alertBox.showError("Login Filed, please check the credential provided");

			}
		});
	}
}]);

app.controller("detailViewController", ['$scope', '$location', 'apiData', function($scope, $location, apiData){
	
}]);


app.controller("listViewController", ['$scope', '$location', '$cookies', 'apiData', function($scope, $location, $cookies, apiData){
	$scope.renderList = function(bindData){
		$scope.data = {
			app_names : bindData
		}
	}

	if(!(apiData && apiData.data)){
		$.ajax({
			url : 'http://172.17.0.48/api/v1/posts',
			type: "GET",
			async : true,
			dataType: 'json',
			headers: {
			    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
			  },
			success : function(data){
				if(data && data instanceof Array){
					apiData.data = data;
					$scope.renderList(data);
					$scope.$apply();
				}
			}
		});
	} else {
		$scope.renderList(apiData.data);
	}
}]);

app.controller("headerController", ['$scope', '$location', function($scope, $location){
	var fileInput = document.querySelector(".file-input"),
        uploadBtn = document.querySelector(".upload"),
        actualFileInp = document.querySelector(".actual"),
        uploadForm = document.querySelector("#uploadForm");

    fileInput.addEventListener("click", function(){
        actualFileInp.click();
    });
     uploadBtn.addEventListener("click", function(){
        if(fileInput.value){
             uploadForm.submit(function(){
				var formData = new FormData($(this)[0]);

				$.ajax({
					//url:$(this).attr("action"),
					url : 'response/list.json',
					type: 'POST',
					data: formData,
					async: false,
					success: function (data) {
						$location.path('/list');
						//$scope.$apply();
					},
					cache: false,
					contentType: false,
					processData: false
				});
				return false;
			});
        }
    });

     actualFileInp.addEventListener("change", function(){
        var filePath = actualFileInp.value;
        fileInput.value = filePath.match(/[^\/\\]+$/);
    });

}]);
