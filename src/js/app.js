    var app = angular.module('toDoApp',['angularMoment'])
    app.controller('controladorGeneral', ['$http','moment', mainCtrl]);
    function mainCtrl($http){
        //Conjunto de variables 
        var vm = this;
        getTaskList();
        vm.spinner = true;
        vm.disabled = true;
        vm.isChecked;
        vm.taskDone = taskDone;
        vm.taskState = taskState;
        vm.spinnerActive = spinnerActive;
        vm.spinnerHide = spinnerHide;
        vm.validateDisabled = validateDisabled;
        vm.prepareEditingList = prepareEditingList;
        vm.taskListData = [];
        vm.taskItemsDone = [];
        vm.taskItemsPending = [];
        vm.addToggle = "add";
        vm.noTaskHere = false;
        vm.noListHere = false;
        vm.openTaskList = openTaskList;
        vm.toggleCreateList = toggleCreateList;
        vm.goBack = goBack;
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
            taskListIsOpen: false,
            viewTasks:false
        }
        vm.flag ={
            add:true,
            edit:false
        }
        vm.flagList ={
            add:true,
            edit:false
        }
        //Función para activar el spinner de carga
        function spinnerActive(){
            vm.spinner = true;
        }
        //Función para esconder el spinner de carga
        function spinnerHide(){
            vm.spinner = false;
        }
     //Función para regresar con el icono de flecha izquierda
        function goBack(){
            vm.steps.taskListMain = true;
            vm.steps.taskListIsOpen = false;
            vm.steps.viewTasks = false;
            vm.toggleList = "checked";
            vm.taskListAdd = "";
            vm.flagList.add = true;
            vm.flagList.edit = false;
        }
        //Función para verificar si la lista de tareas esta vacia
        function checkIfEmpty(){
            if(vm.taskListItems.length === 0){
                vm.noTaskHere = true;
            }else{
                vm.noTaskHere = false;
            }
        }
        //Función oara verificar si una lista esta vacia
        function checkIfEmptyList(){
            if(vm.taskListData.length === 0){
                vm.noListHere = true;
            }else{
                vm.noListHere = false;
            }
        }

        //Función para abrir una lista
        function openTaskList(id,name,tasks,index){
            vm.steps.taskListMain = false;
            vm.steps.taskListIsOpen = true;
            vm.steps.viewTasks = false;
            vm.addToggle = "add";
            vm.taskName = "";
            vm.taskListID = id; 
            vm.taskListName = name;
            vm.taskListItems = tasks;

            checkIfEmpty();
        }
        //Función para validar si el input esta vacio
        function validateDisabled(){
            if(vm.taskListAdd !== "" || vm.taskListAdd !== undefined){
                vm.disabled = false;
            }else{
                vm.disabled = true;
            }
        }

//-------------------------------------------------------------------------------------------------------
        //CONSUMO DE APIS
//-------------------------------------------------------------------------------------------------------
        //Servicio para mostrar el conjunto de listas
        function getTaskList(){
            spinnerActive();
            $http.get('http://front-test.tide.mx/api/task_lists').then(function(response){
                   angular.forEach(response.data, function(val){
                       vm.taskListData.push({
                           id:val.id,
                           creationDate: val.creationDate,
                           name:val.name,
                           tasks:val.tasks
                       })
                   })
                   spinnerHide()
            })
        }
      
        //Srvicio para crear una lista
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

        //Función auxiliar para editar una lista
        function prepareEditingList(index,name,id){
            vm.taskListAdd = name;
            vm.toggleList = "edit";
            vm.taskListIndex = index;
            vm.taskListEditingId = id;
            vm.flagList.add = false;
            vm.flagList.edit = true;
        }

        //Función auxiliar para cambiar entre crear y editar una lista
        function toggleCreateList(){
            if(vm.flagList.add){
                createList();
            }else{
                editList(vm.taskListEditingId);
            }
        } 

        //Servicio para editar listas
        function editList(id){
            spinnerActive();
            $http.put('http://front-test.tide.mx/api/task_lists/' + id,{
                name:vm.taskListAdd
            }).then(function(response){
                vm.taskListData[vm.taskListIndex].name = vm.taskListAdd;
                vm.flagList.add = true;
                vm.flagList.edit = false;
                vm.toggleList = "checked";
                vm.taskListAdd = "";
                spinnerHide();
            })
        }

        //Servicio para borrar listas
        function deleteList(index,id){
            spinnerActive();
            $http.delete('http://front-test.tide.mx/api/task_lists/' + id).then(function(){
                vm.taskListData.splice(index,1);
                vm.toggleList = "checked";
                vm.taskListAdd = "";
                checkIfEmptyList();
                spinnerHide();
            })
        }




        //Servicio para añadir tareas
          function addTask(){
            spinnerActive()
              $http.post('http://front-test.tide.mx/api/tasks',{
                  name:vm.taskName,
                  taskList:vm.taskListID,
                  limitDate:moment().add(3,'week').format('YYYY-MM-DD'),
                  endDate: null
              }).then(function(response){
                  var _res = response.data;
                    vm.taskListItems.push({
                        name: _res.name,
                        creationDate: _res.creationDate,
                        limitDate: _res.limitDate,
                        endDate: _res.endDate,
                        id:_res.id
                    })
                    checkIfEmpty();
                    spinnerHide();
                    vm.taskName = "";
                    vm.flag.add = true;
                    vm.flag.edit = false;
              })
          }

          //Servicio para borrar tareas
          function deleteTask(index,id){
            spinnerActive();
              $http.delete('http://front-test.tide.mx/api/tasks/' + id).then(function(){
                vm.taskListItems.splice(index,1);
                vm.addToggle = "add";
                vm.flag.add = true;
                vm.flag.edit = false;
                vm.taskName = "";
                checkIfEmpty();
                spinnerHide();
              })
          }

          //Función auxiliar para editar tareas
          function prepareEditingTask(index,name,id){
            vm.taskName = name;
            vm.taskIndex = index;
            vm.taskEditingID = id
            vm.addToggle = "editing";
            vm.flag.add = false;
            vm.flag.edit = true;
          }

          //Servicio para editar tareas
          function editTask(id,endDate){
            spinnerActive();
            if(vm.isChecked){
                endDate
            }else{
                endDate = null
            }
               $http.put('http://front-test.tide.mx/api/tasks/' + id,{
                   name: vm.taskName,
                   taskList: vm.taskListID,
                   limitDate: moment().add(3,'week').format('YYYY-MM-DD'),
                   endDate: endDate
                 }).then(function(response){
                    var _resUpdate = response.data
                    vm.taskListItems[vm.taskIndex].name = _resUpdate.name
                    vm.taskListItems[vm.taskIndex].endDate = _resUpdate.endDate
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

          //Servicio de Busqueda de tareas
          function retrieveTask(id){
            spinnerActive();
            $http.get('http://front-test.tide.mx/api/tasks',{
               page:id 
            }).then(function(response){
                console.log(response.data);
                vm.taskItemsDone = [];
                vm.taskItemsPending = [];
                angular.forEach(response.data, function(val){
                    console.log(val.endDate);
                    if( val.endDate !== null){
                        vm.taskItemsDone.push({
                            id:val.id,
                            creationDate: val.creationDate,
                            limitDate: val.limitDate,
                            endDate:val.endDate,
                            name:val.name,
                            taskList:val.taskList
                        })
                    }else{
                        vm.taskItemsPending.push({
                            id:val.id,
                            creationDate: val.creationDate,
                            limitDate: val.limitDate,
                            endDate:val.endDate,
                            name:val.name,
                            taskList:val.taskList
                        })
                    }
                })
                console.log(vm.taskItemsDone);
                console.log(vm.taskItemsPending);
                spinnerHide();
                vm.steps.taskListMain = false;
                vm.steps.taskListIsOpen = false;
                vm.steps.viewTasks = true;
            })
          }

          //Maneja el estado de las tareas terminada/no terminada
          function taskState(index,id,e){
              console.log(e);
              vm.isChecked = e.target.checked;
              console.log(vm.isChecked);
              vm.taskListItems[index].nowChecked = vm.isChecked;
            
          }
          //Comprueba una tarea terminada
          function taskDone(index,id,name){
              vm.taskDoneId = id;
              vm.taskIndex = index;
              vm.taskName = name;
              vm.endDate = moment().format();
              editTask(vm.taskDoneId,vm.endDate);
          }
    }