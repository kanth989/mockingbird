app.service('apiData', function ApiData() {
    var apiData = this;
    /*apiData.data = [
    	{
    		"title" : "A",
    		"endpoint" : "/add",
    		"endpointmethod" : "PUT",
    		"response" : "sdfadfasdfasdf"
    	},
    	{
    		"title" : "B",
    		"endpoint" : "/edit",
    		"endpointmethod" : "POST",
    		"response" : "sdfadfasdfasdf2"
    	},
    	{
    		"title" : "C",
    		"endpoint" : "/delete",
    		"endpointmethod" : "DELETE",
    		"response" : "sdfadfasdfasdf3"
    	},
    	{
    		"title" : "D",
    		"endpoint" : "/get",
    		"endpointmethod" : "GET",
    		"response" : "sdfadfasdfasdf4"
    	}
    ];*/
  });

app.controller("loginController", ['$scope', '$location', '$cookies', 'apiData', function($scope, $location, $cookies, apiData){
	$scope.signinMode = true;
	$scope.login = function(){
		
		$.ajax({
			url : '/api/v1/posts',
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
				if(data && data instanceof Array && data.length){
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
	};

	$scope.signup = function(){
		var scopeData = $scope;
		$.ajax({
			url : '/api/v1/users',
			type: "POST",
			async : true,
			dataType: 'json',
			data: {
			    "email" : scopeData.username, 
				"password" : scopeData.password
			  },
			success : function(data){
				alertBox.showSuccess("Signup Succeded");
				$cookies.username = scopeData.username;
				$cookies.password = scopeData.password;
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
				alertBox.showError("Signup Filed");

			}
		});
	};
	$scope.toggleToSignup = function(){
		$scope.signinMode = false;
	}
}]);

app.controller("detailViewController", ['$scope', '$location', '$cookies' , 'apiData', function($scope, $location, $cookies, apiData){
	/*if(!$cookies.username ){
		$location.path('/');
		$scope.$apply();
		return;
	}*/
	$scope.init = function(){
		$scope.title = "";
		$scope.endpoint = "";
		$scope.endpointmethod = "GET";
		$scope.body = "";
	};

	$scope.addNewEndpoint = function(){
		var scopeData = $scope;
		$.ajax({
			url : '/api/v1/posts',
			type: "POST",
			async : true,
			dataType: 'json',
			headers: {
			    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
			  },
			  data : {"title" : scopeData.title, 
					  "endpoint" : scopeData.endpoint, 
					  "endpointmethod" : scopeData.endpointmethod, 
					  "body" : scopeData.body
					},
			success : function(data){
				apiData.data = data;
				$location.path('/list');
				$scope.$apply();
			},
			error : function(data){
				debugger;
			}
		});
	};
}]);


app.controller("listViewController", ['$scope', '$location', '$cookies', 'apiData', function($scope, $location, $cookies, apiData){
	$scope.renderList = function(bindData){
		for(var di=0;di<bindData.length;di++){
			bindData[di].showDetail = false;
		}
		$scope.data = {
			api_list : bindData
		}
	};
	$scope.saveRow = function(){
		var currentRow = this;
		$.ajax({
			url : '/api/v1/posts/'+currentRow.api_info.id,
			type: "POST",
			async : true,
			dataType: 'json',
			headers: {
			    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
			  },
			  data : {"title" : currentRow.api_info.title, 
					  "endpoint" : currentRow.api_info.endpoint, 
					  "endpointmethod" : currentRow.api_info.endpointmethod, 
					  "body" : currentRow.api_info.body
					},
			success : function(data){
				$scope.toggleRow(currentRow.api_info);
				$scope.$apply();
			},
			error : function(data){
				$scope.toggleRow(currentRow.api_info);
				$scope.$apply();
			}
		});
	};
	$scope.toggleRow = function(appInfo){
		if(!appInfo.showDetail){
			$.map(this.$parent.data.api_list, function(appDetail){
				appDetail.showDetail = false;
			});
		}
		appInfo.showDetail = !appInfo.showDetail;
	};
	$scope.toggleStatus = function(){
		var currentRow = this;
		$.ajax({
			url : '/apistatus/v1/'+(!currentRow.api_info.status)+'/'+currentRow.api_info.id,
			type: "GET",
			async : true,
			dataType: 'json',
			headers: {
			    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
			  },
			success : function(data){
				currentRow.api_info.status = !currentRow.api_info.status;
				$scope.$apply();
			},
			error : function(data){
			}
		});
	};
	$scope.deleteRow = function(){
		var currentRow = this;
		$.ajax({
			url : '/apistatus/v1/delete/'+currentRow.api_info.id,
			type: "POST",
			async : true,
			headers: {
			    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
			  },
			dataType: 'json',
			success : function(data){
				var updatedApps = jQuery.grep(currentRow.$parent.data.api_list, function(appDetail){
									return (appDetail.id !== currentRow.api_info.id);
								});
				$scope.renderList(updatedApps);
				$scope.$apply();
			},
			error : function(data){
				
			}
		});
	};
	$scope.showDetailPage = function(){
		$location.path('/detail');
	};
	if(!(apiData && apiData.data)){
		$.ajax({
			url : '/api/v1/posts',
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
			},
			error : function(resp, status, error){
				if(error === "UNAUTHORIZED"){
					$location.path('/');
					$scope.$apply();
				}
			}
		});
	} else {
		$scope.renderList(apiData.data);
	}
}]);

app.controller("headerController", ['$scope', '$location', '$cookies', 'apiData', '$route', function($scope, $location, $cookies, apiData, $route){
	var fileInput = document.querySelector(".file-input"),
        uploadBtn = document.querySelector(".upload"),
        actualFileInp = document.querySelector(".actual"),
        uploadForm = document.querySelector("#uploadForm");

    fileInput.addEventListener("click", function(){
        actualFileInp.click();
    });
     uploadBtn.addEventListener("click", function(){
        if(fileInput.value){
            /* uploadForm.submit(function(){
				
				return false;
			});*/

     var formData = new FormData();
     formData.append( 'file', actualFileInp.files[0] );

			$.ajax({
				url:'/api/v1/upload',
				type: 'POST',
				data: formData,
				async: true,
				headers: {
				    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
				  },
				success: function (data) {
					apiData.data = data;
					if($location.$$path === "/list"){
						$route.reload();
					} else {
						$location.path('/list');
						$scope.$apply();
					}
				},
				error : function(){
					debugger;
				},
				cache: false,
				contentType: false,
				processData: false
			});
        }
    });

     actualFileInp.addEventListener("change", function(){
        var filePath = actualFileInp.value;
        fileInput.value = filePath.match(/[^\/\\]+$/);
    });

     $scope.logout = function(){
		delete $cookies.username;
		delete $cookies.password;
		$location.path('/');
		$scope.$apply();
	};

}]);
