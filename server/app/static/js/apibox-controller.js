(function(){
	var baseURI = "http://172.17.0.48/";
	app.service('apiData', function ApiData() {
	    var apiData = this;
	    var _data;
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
	    this.setData = function(data){
	    	_data = data;
	    };

	    this.getData = function(){
	    	return _data;
	    }
	  });

	app.controller("loginController", ['$scope', '$location', '$cookies', 'apiData', function($scope, $location, $cookies, apiData){
		$scope.signinMode = true;
		$scope.login = function(){
			
			$.ajax({
				url : baseURI+'api/v1/posts',
				type: "GET",
				async : true,
				dataType: 'json',
				headers: {
				    "Authorization": "Basic " + btoa($scope.username + ":" + $scope.password)
				  },
				success : function(data){
					$cookies.username = $scope.username;
					$cookies.password = $scope.password;
					if(data && data instanceof Array && data.length){

						apiData.setData(data);
						$location.path('/list');
						$scope.$apply();
					} else{
						apiData.setData([]);
						$location.path('/detail');
						$scope.$apply();
					}
				},
				error : function(){
				}
			});
		};

		$scope.signup = function(){
			var scopeData = $scope;
			$.ajax({
				url : baseURI+'api/v1/users',
				type: "POST",
				async : true,
				dataType: 'json',
				data: {
				    "email" : scopeData.username, 
					"password" : scopeData.password
				  },
				success : function(data){
					$cookies.username = scopeData.username;
					$cookies.password = scopeData.password;
					if(data && data instanceof Array){
						apiData.setData(data);
						$location.path('/list');
						$scope.$apply();
					} else{
						apiData.setData([]);
						$location.path('/detail');
						$scope.$apply();
					}
				},
				error : function(){
				}
			});
		};
		$scope.toggleToSignup = function(){
			$scope.signinMode = false;
		};
		$scope.toggleToSignin = function(){
			$scope.signinMode = true;
		};
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
				url : baseURI+'api/v1/posts',
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
					apiData.setData(data);
					$location.path('/list');
					$scope.$apply();
					alertBox.showSuccess("Record saved", {
						dom : ".main-content"
					});
				},
				error : function(data){
					alertBox.showError(" while adding new record", {
						dom : "#addEndpoint"
					});
				}
			});
		};
	}]);


	app.controller("listViewController", ['$scope', '$location', '$cookies', 'apiData', '$route', function($scope, $location, $cookies, apiData, $route){
		$scope.showNewApp = false;
		$scope.disableDeleteApi = false;
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
				url : baseURI+'api/v1/posts/'+currentRow.api_info.id,
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
					alertBox.showSuccess("Record saved", {
						dom : ".main-content"
					});
				},
				error : function(data){
					$scope.toggleRow(currentRow.api_info);
					$scope.$apply();
					alertBox.showError(" while saving the record", {
						dom : ".main-content"
					});
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
				url : baseURI+'apistatus/v1/'+(!currentRow.api_info.status)+'/'+currentRow.api_info.id,
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
			var deletingDetail = JSON.stringify(this.api_info);
			var oldRecordList = apiData.getData();
			oldRecordList = oldRecordList.slice(0);

			var updatedApps = jQuery.grep(currentRow.$parent.data.api_list, function(appDetail){
										return (appDetail.id !== currentRow.api_info.id);
									});
			$scope.disableDeleteApi = true;
			$scope.renderList(updatedApps);
			apiData.setData(updatedApps);

			
			alertBox.showSuccess("Record deleted", {
				dom : ".main-content",
				action : {
					fnName : "undo",
					fnAction : function(){
						$scope.disableDeleteApi = false;
						apiData.setData(oldRecordList);
						$route.reload();
					}
				}
			}, {onclose : function(){
										delRecord(currentRow.api_info.id, updatedApps);
									}
				});
			
		};
		$scope.showNewAppSection = function(){
			$scope.showNewApp = true;
			$scope.title = "";
			$scope.endpoint = "";
			$scope.endpointmethod = "GET";
			$scope.body = "";
		};
		$scope.hideNewAppSection = function(){
			$scope.showNewApp = false;
		};

		$scope.addNewEndpoint = function(){
			var scopeData = $scope;
			$.ajax({
				url : baseURI+'api/v1/posts',
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
					scopeData.showNewApp = false;
					apiData.setData(data);
					$route.reload();
					$scope.$apply();
					alertBox.showSuccess("Record saved", {
						dom : ".main-content"
					});
				},
				error : function(data){
					alertBox.showError(" while adding new record", {
						dom : "#addEndpoint"
					});
				}
			});
		};
		if(!(apiData && apiData.getData())){
			$.ajax({
				url : baseURI+'api/v1/posts',
				type: "GET",
				async : true,
				dataType: 'json',
				headers: {
				    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
				  },
				success : function(data){
					if(data && data instanceof Array){
						apiData.setData(data);
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
			$scope.renderList(apiData.getData());
		}

		function delRecord(recordId, data){
			//var undoData = JSON.parse(deletingDetail);
			$.ajax({
				url : baseURI+'apistatus/v1/delete/'+recordId,
				type: "POST",
				async : true,
				dataType: 'json',
				headers: {
				    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
				  },
				success : function(){
					$scope.disableDeleteApi = false;
					apiData.setData(data);
					$route.reload();
					/*alertBox.showSuccess("Data added back", {
						dom : ".main-content"
					});*/
				},
				error : function(data){
					$route.reload();
					alertBox.showError(" while deleting the record", {
						dom : ".main-content"
					});
				}
			});
		}
	}]);

	app.controller("headerController", ['$scope', '$location', '$cookies', 'apiData', '$route', function($scope, $location, $cookies, apiData, $route){
		var fileInput = document.querySelector(".file-input"),
	        uploadBtn = document.querySelector(".upload"),
	        actualFileInp = document.querySelector(".actual"),
	        uploadForm = document.querySelector("#uploadForm");

	    $scope.formData = null;
	    $scope.fileDroped = false;

	    $(fileInput).bind("click", function(){
	    	actualFileInp.click();
	    });

	     $(uploadBtn).bind("click", function(){
	        if(fileInput.value){
	            /* uploadForm.submit(function(){
					
					return false;
				});*/
	     		if(!$scope.fileDroped){
	     			$scope.formData = new FormData();
					$scope.formData.append( 'file', actualFileInp.files[0] );
	     		}

				uploadAction($scope.formData);
	        }
	    });

	    $(actualFileInp).bind("change", function(){
	        var filePath = actualFileInp.value;
	        fileInput.value = filePath.match(/[^\/\\]+$/);
	    });

	     $scope.logout = function(){
			delete $cookies.username;
			delete $cookies.password;
			$location.path('/');
			/*$scope.$apply();*/
		};

		function uploadAction(fd){
			$.ajax({
					url:baseURI+'api/v1/upload',
					type: 'POST',
					data: fd,
					async: true,
					headers: {
					    "Authorization": "Basic " + btoa($cookies.username + ":" + $cookies.password)
					  },
					success: function (data) {
						apiData.setData(data);
						if($location.$$path === "/list"){
							$route.reload();
						} else {
							$location.path('/list');
							$scope.$apply();
						}
					},
					error : function(){
						alertBox.showError(" while uploading the endpoint list");
					},
					cache: false,
					contentType: false,
					processData: false
				});
		}

		var obj = $(".drop-area");
		obj.on('dragenter', function (e) 
		{
		    e.stopPropagation();
		    e.preventDefault();
		    $(this).css('border', '2px solid #0B85A1');
		});
		obj.on('dragover', function (e) 
		{
		     e.stopPropagation();
		     e.preventDefault();
		});
		obj.on('drop', function (e) 
		{
		 
			$(this).css('border', 'none');
			e.preventDefault();
			var files = e.originalEvent.dataTransfer.files;
		 		
			for (var i = 0; i < files.length; i++) 
			{
			    $scope.formData = new FormData();
			    $scope.formData.append('file', files[i]);
			    fileInput.value = files[i].name;
			    $scope.fileDroped = true;
			    break;
			}
			//uploadAction(formData);
		});

		$(document).on('dragenter', function (e) 
		{
		    e.stopPropagation();
		    e.preventDefault();
		});
		$(document).on('dragover', function (e) 
		{
		  e.stopPropagation();
		  e.preventDefault();
		  obj.css('border', 'none');
		});
		$(document).on('drop', function (e) 
		{
		    e.stopPropagation();
		    e.preventDefault();
		});

	}]);
})();

