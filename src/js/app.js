    var app = angular.module('toDoApp',['angularMoment'])
    app.controller('controladorGeneral', ['$http','moment', mainCtrl]);
    function mainCtrl($http){
        var vm = this;
        getTaskList();
        vm.spinner = true;
        vm.disabled = true;
        vm.spinnerActive = spinnerActive;
        vm.spinnerHide = spinnerHide;
        vm.validateDisabled = validateDisabled;
        vm.prepareEditingList = prepareEditingList;
        vm.taskListData =[];
        vm.addToggle = "add";
        vm.noTaskHere = false;
        vm.noListHere = false;
        vm.openTaskList = openTaskList;
        vm.toggleCreateList = toggleCreateList;
        vm.createList = createList;
        vm.editList = editList;
        vm.toggleList = "checked";
        vm.deleteList  = deleteList;
        vm.addTask = addTask;
        vm.deleteTask = deleteTask;
        vm.editTask = editTask;
        vm.retrieveTask = retrieveTask;
        vm.toggleTask = toggleTask;
        vm.prepareEditingTask = prepareEditingTask;
        vm.checkIfEmpty = checkIfEmpty;
        vm.checkIfEmptyList = checkIfEmptyList;
        vm.getTaskList = getTaskList;
        vm.steps = {
            taskListMain: true,
            taskListIsOpen: false
        }
        vm.flag ={
            add:true,
            edit:false
        }
        vm.flagList ={
            add:true,
            edit:false
        }

        function spinnerActive(){
            vm.spinner = true;
        }
        function spinnerHide(){
            vm.spinner = false;
        }
     

        function checkIfEmpty(){
            if(vm.taskListItems.length === 0){
                vm.noTaskHere = true;
            }else{
                vm.noTaskHere = false;
            }
        }
        function checkIfEmptyList(){
            if(vm.taskListData.length === 0){
                vm.noListHere = true;
            }else{
                vm.noListHere = false;
            }
        }
        function openTaskList(id,name,tasks,index){
            console.log(index);
            vm.steps.taskListIsOpen = true;
            vm.steps.taskListMain = false;

            vm.taskListID = id; 
            vm.taskListName = name;
            vm.taskListItems = tasks;

            console.log(vm.taskListItems.length);
            checkIfEmpty();
        }
        function validateDisabled(){
            if(vm.taskListAdd !== "" || vm.taskListAdd !== undefined){
                vm.disabled = false;
            }else{
                vm.disabled = true;
            }
        }

       
        //CONSUMO DE APIS
        function getTaskList(){
            spinnerActive();
            $http.get('http://front-test.tide.mx/api/task_lists').then(function(response){
                console.log(response.data);
                   angular.forEach(response.data, function(val){
                       vm.taskListData.push({
                           id:val.id,
                           creationDate: val.creationDate,
                           name:val.name,
                           tasks:val.tasks
                       })
                   })
                   console.log(vm.taskListData)
                   spinnerHide()
            })
        }
      
        function createList(){
            spinnerActive();
            $http.post('http://front-test.tide.mx/api/task_lists',{
                name:vm.taskListAdd
            }).then(function(response){
                var _respCreateList = response.data;
                vm.taskListData.push({
                    id:_respCreateList.id,
                    name:_respCreateList.name,
                    creationDate:_respCreateList.creationDate,
                    tasks:_respCreateList.tasks
                })
                vm.taskListAdd = "";
                checkIfEmptyList();
                spinnerHide();
            })
        }
        function prepareEditingList(index,name,id){
            vm.taskListAdd = name;
            vm.toggleList = "edit";
            vm.taskListIndex = index;
            vm.taskListEditingId = id;
            vm.flagList.add = false;
            vm.flagList.edit = true;
        }
        function toggleCreateList(){
            if(vm.flagList.add){
                createList();
            }else{
                editList(vm.taskListEditingId);
            }
        } 
        function editList(id){
            spinnerActive();
            $http.put('http://front-test.tide.mx/api/task_lists/' + id,{
                name:vm.taskListAdd
            }).then(function(response){
                console.log(response.data);
                vm.taskListData[vm.taskListIndex].name = vm.taskListAdd;
                vm.flagList.add = true;
                vm.flagList.edit = false;
                vm.toggleList = "checked";
                vm.taskListAdd = "";
                spinnerHide();
            })
        }

        function deleteList(index,id){
            spinnerActive();
            $http.delete('http://front-test.tide.mx/api/task_lists/' + id).then(function(){
                vm.taskListData.splice(index,1);
                checkIfEmptyList();
                spinnerHide();
            })
        }





          function addTask(){
            spinnerActive()
              $http.post('http://front-test.tide.mx/api/tasks',{
                  name:vm.taskName,
                  taskList:vm.taskListID,
                  limitDate:moment().add(3,'week').format('YYYY-MM-DD'),
                  endDate:moment().format()
              }).then(function(response){
                  var _res = response.data;
                    vm.taskListItems.push({
                        name: _res.name,
                        creationDate: _res.creationDate,
                        limitDate: _res.limitDate,
                        id:_res.id
                    })
                    checkIfEmpty();
                    spinnerHide();
                    vm.taskName = "";
                    vm.flag.add = true;
                    vm.flag.edit = false;
              })
          }

          function deleteTask(index,id){
            spinnerActive();
              $http.delete('http://front-test.tide.mx/api/tasks/' + id).then(function(){
                vm.taskListItems.splice(index,1);
                checkIfEmpty();
                spinnerHide();
              })
          }

          function prepareEditingTask(index,name,id){
            vm.taskName = name;
            vm.taskIndex = index;
            vm.taskEditingID = id
            vm.addToggle = "editing";
            vm.flag.add = false;
            vm.flag.edit = true;
          }

          function editTask(id){
            spinnerActive();
               $http.put('http://front-test.tide.mx/api/tasks/' + id,{
                   name: vm.taskName,
                   taskList: vm.taskListID,
                   limitDate: moment().add(3,'week').format('YYYY-MM-DD'),
                   endDate: moment().format()
                 }).then(function(response){
                    var _resUpdate = response.data
                    vm.taskListItems[vm.taskIndex].name = _resUpdate.name
                    spinnerHide();
                    vm.addToggle = "add";
                    vm.taskName = "";
                    vm.flag.add = true;
                    vm.flag.edit = false;
                 })

          }

          function toggleTask(){
            if(vm.flag.add){
                addTask();
            }else{
                editTask(vm.taskEditingID);
            }
          }

          function retrieveTask(id){
            $http.get('http://front-test.tide.mx/api/tasks/' + id).then(function(response){
                console.log(response.data);
            })
          }
    }