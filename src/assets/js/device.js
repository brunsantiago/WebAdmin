var optionEstadoDispositivo = [
  "ACTIVO",
  "BAJA",
  "SUSPENDIDO",
  "STOCK",
]

var optionMarcaDispositivo = [
  { id:0,ma:"SAMSUNG"},
  { id:1,ma:"MOTOROLA"},
  { id:2,ma:"LG"},
  { id:3,ma:"NOKIA"},
  { id:4,ma:"ALCATEL"},
]

var optionModeloDispositivo = [
  { id:0,mo:"GALAXY A10S"},
  { id:0,mo:"GALAXY A10"},
  { id:0,mo:"GALAXY A20S"},
  { id:0,mo:"GALAXY J2 PRIME"},
  { id:0,mo:"GALAXY S5"},
  { id:0,mo:"GALAXY S6"},
  { id:0,mo:"GALAXY S7"},
  { id:1,mo:"MOTOROLA"},
  { id:2,mo:"LG"},
  { id:3,mo:"NOKIA"},
  { id:4,mo:"ALCATEL"},
]

function listadoDispositivos(){

  let arrayDispositivos = [];
  db.collection("devices")
  .get()
  .then(function(querySnapshot){
    querySnapshot.forEach(function(doc){
      item = {
        nc : doc.data().nombreCliente,
        no : doc.data().nombreObjetivo,
        im : doc.data().imei,
        ma : doc.data().marca,
        mo : doc.data().modelo,
        es : doc.data().estado,
        id : doc.id,
      }
      arrayDispositivos.push(item);
    });
    cargarDispositivos(arrayDispositivos);
  })
}

function cargarDispositivos(listaDispositivos){

  let table="";

  if ( $.fn.dataTable.isDataTable("#devicetable") ) {
    table = $("#devicetable").DataTable();
    table.clear();
  }
  else {
    table = $("#devicetable").DataTable({
      paging: true,
      searching: true,
      ordering:  true,
      info: true,
      columns: [
          { data: 'nc' },
          { data: 'no' },
          { data: 'im' },
          { data: 'ma' },
          { data: 'mo' },
          {
              data: 'es',
              render: function ( data, type, row ) {
                if(data=="ACTIVO"){
                  return '<span class="label label-success">ACTIVO</span>';
                } else if (data=="BAJA"){
                  return '<span class="label label-danger">BAJA</span>';
                } else if (data=="SUSPENDIDO"){
                  return '<span class="label label-warning">SUSPENDIDO</span>';
                } else if (data=="STOCK"){
                  return '<span class="label label-info">STOCK</span>';
                }
              }
          },
          {
              data: 'id',
              render: function ( data, type, row ) {
                  return "<span class='editar' style='cursor:pointer'><i class='fas fa-edit'></i></span>";
              }

          }
      ],
      columnDefs: [{ //Centro el contenido de las n últimas columnas
          className: "text-center", "targets": [0,1,2,3,4,5,6]
      }],
      language: {
          search: "Buscar:",
          lengthMenu: "Mostrar _MENU_ dispositivos por pagina",
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando de _START_ a _END_ de _TOTAL_ dispositivos",
          infoEmpty: "Sin registros cargados",
          infoFiltered: "(_MAX_ dispositivos totales)",
          paginate: {
              first: "Primero",
              last: "Ultimo",
              next: "Siguiente",
              previous: "Anterior",
          },
      },
    });
  }

  listaDispositivos.forEach(function(item){
    table.row.add(item).draw();
  })

  $('#devicetable tbody').on('click', 'span.editar', function () {
    let data = table.row ( $(this).parents("tr") ).data();
    mostrarDispositivo(data);
  });

}

function agregarDispositivos(){
  resetFormCarDisp();
  $("#cargarDispositivo").prop("disabled",false);
  $("#agregar-dispositivo").modal("show");
}

function cargarDispositivo(){
$("#cargarDispositivo").prop("disabled",true);
  dispositivo = {
    nombreCliente : $("#nombreCliente").val(),
    nombreObjetivo : $("#nombreObjetivo").val(),
    imei : $("#imei").val(),
    marca : $("#marca").val(),
    modelo : $("#modelo").val(),
    estado : $("#estado").val(),
  }

  db.collection("devices").where("imei","==",$("#imei").val())
  .get()
  .then(function(querySnapshot){
    if(querySnapshot.empty){
      cargarDispositivoObjetivo();
    } else {
      $("#agregar-dispositivo").modal("hide");
      Swal.fire({
        icon: 'error',
        title: "Dispositivo ya cargado",
        text: 'Por favor verifique el numero de IMEI',
      })
      resetFormCarDisp();
    }
  })
  .catch(function(){
    console.log("No se pudo verificar la existencia del dispositivo");
    $("#agregar-dispositivo").modal("hide");
    resetFormCarDisp();
  });

}

function cargarDispositivoObjetivo(){
  db.collection("devices").where("nombreCliente","==",$("#nombreCliente").val()).where("nombreObjetivo","==",$("#nombreObjetivo").val())
  .where("estado","==","ACTIVO")
  .get()
  .then(function(querySnapshot){
    if(querySnapshot.empty){
      db.collection("devices")
      .add(dispositivo)
      .then(function(){
        listadoDispositivos();
        mensajeOk();
      })
      .catch(function(){
        console.log("No se pudo cargar el dispositivo correctamente !");
      });
      $("#agregar-dispositivo").modal("hide");
      resetFormCarDisp();
    } else {
      $("#agregar-dispositivo").modal("hide");
      Swal.fire({
        icon: 'error',
        title: "Objetivo con dispositivo Activo",
        text: 'Por favor verifique el objetivo',
      })
      resetFormCarDisp();
    }
  })
  .catch(function(){
    console.log("No se pudo verificar si el dispositivo se encuentra en otro Objetivo");
    $("#agregar-dispositivo").modal("hide");
    resetFormCarDisp();
  });
}

function modificarDispositivo(){

  $("#modificarDispositivo").prop("disabled",true);

  let device = {
    nombreCliente : $("#nombreClienteMod").val(),
    nombreObjetivo : $("#nombreObjetivoMod").val(),
    imei : $("#imeiMod").val(),
    marca : $("#marcaMod").val(),
    modelo : $("#modeloMod").val(),
    estado : $("#estadoMod").val(),
  }

  db.collection("devices").where("nombreCliente","==",$("#nombreClienteMod").val()).where("nombreObjetivo","==",$("#nombreObjetivoMod").val())
  .where("estado","==","ACTIVO")
  .get()
  .then(function(querySnapshot){
    if(querySnapshot.empty){
      cargarDispositivoMod(device);
    } else {
      let encontrado=false;
      querySnapshot.forEach(function(doc){
        if(doc.id==$("#idDevice").data("id")){
          cargarDispositivoMod(device);
          encontrado=true;
        }
      });
      if(!encontrado){
        $("#modificar-dispositivo").modal("hide");
        Swal.fire({
          icon: 'error',
          title: "Objetivo con dispositivo Activo",
          text: 'Por favor verifique el objetivo',
        })
        resetFormModDisp();
      }

    }
  })
  .catch(function(){
    console.log("No se pudo verificar si el dispositivo se encuentra en otro Objetivo");
    $("#modificar-dispositivo").modal("hide");
    resetFormCarDisp();
  });
}

function resetFormCarDisp(){
  $("#nombreCliente").val("");
  $("#nombreObjetivo").val("");
  $("#imei").val("");
  $("#marca").val("");
  $("#modelo").val("");
  $("#estado").val("");
}

function resetFormModDisp(){
  $("#nombreClienteMod").val("");
  $("#nombreObjetivoMod").val("");
  $("#imeiMod").val("");
  $("#marcaMod").val("");
  $("#modeloMod").val("");
  $("#estadoMod").val("");
}

function mostrarDispositivo(data){
  listadoObjetivosDevice('nombreClienteMod','nombreObjetivoMod','dataListBranchMod');
  resetFormModDisp();
  $("#nombreClienteMod").val(data.nc);
  $("#nombreObjetivoMod").val(data.no);
  $("#imeiMod").val(data.im);
  $("#marcaMod").val(data.ma);
  $("#modeloMod").val(data.mo);
  $("#estadoMod").val(data.es);
  $("#idDevice").data("id",data.id);
  $("#modificarDispositivo").prop("disabled",false);
  $("#modificar-dispositivo").modal("show");
}

function cargarDispositivoMod(device){

  db.collection("devices").doc($("#idDevice").data("id"))
  .update(device)
  .then(function(){

    $("#modificar-dispositivo").modal("hide");
    listadoDispositivos();
    mensajeOk();
    resetFormModDisp();
  })
  .catch(function(){
    $("#modificar-dispositivo").modal("hide");
    Swal.fire({
      icon: 'error',
      title: "Dispositivo no encontrado",
      text: 'El ID del dispositivo ha sido cambiado',
    })
    resetFormModDisp();
  });

}

function validateFormAgregarDispositivo(){

  $("form[name='formAgregarDispositivo']").validate({
    rules: {
      imei: "required",
      marca: "required",
      modelo: "required",
      estado: "required",
    },
    messages: {
      imei: "Por favor indique un IMEI",
      marca: "Por favor seleccione un marca",
      modelo: "Por favor seleccione un modelo",
      estado: "Por favor seleccione un estado",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      cargarDispositivo();
    }
  });
}

function validateFormModificarDispositivo(){

  $("form[name='formModificarDispositivo']").validate({
    rules: {
      imeiMod: "required",
      marcaMod: "required",
      modeloMod: "required",
      estadoMod: "required",
    },
    messages: {
      imeiMod: "Por favor indique un IMEI",
      marcaMod: "Por favor seleccione un marca",
      modeloMod: "Por favor seleccione un modelo",
      estadoMod: "Por favor seleccione un estado",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      modificarDispositivo();
    }
  });
}

function disableFormAgregarDispositivo(){
  $("form[name='formAgregarDispositivo']").validate().resetForm();
}

function disableFormModificarDispositivo(){
  $("form[name='formModificarDispositivo']").validate().resetForm();
}

function inicializarFuncionesDispositivos(){
  listadoDispositivos();
  validateFormAgregarDispositivo();
  validateFormModificarDispositivo();
  desplegableEstadoDispositivo("dataListEstado");
  desplegableMarcaDispositivo("dataListMarca");
  listadoClientesClient("dataListClient","TODOS",false);
  desplegableEstadoDispositivo("dataListEstadoMod");
  desplegableMarcaDispositivo("dataListMarcaMod");
  listadoClientesClient("dataListClientMod","TODOS",false);
  enforcingValueDataList();
}

function desplegableEstadoDispositivo(idDataList){
  let datalist = document.getElementById(idDataList);
  $("#"+idDataList).empty();
  optionEstadoDispositivo.forEach(function(item){
     let option = document.createElement("option");
     option.value = item;
     datalist.appendChild(option);
  });
}

function desplegableMarcaDispositivo(idDataList){
  let datalist = document.getElementById(idDataList);
  $("#"+idDataList).empty();
  optionMarcaDispositivo.forEach(function(item){
     let option = document.createElement("option");
     option.setAttribute("data-id",item.id);
     option.value = item.ma;
     datalist.appendChild(option);
  });
}

function desplegableModeloDispositivo(idDataListMarca,idDataListModelo,idMarca,idModelo){
  $("#"+idModelo).val("");

  if($("#"+idMarca).val()!=""){
    let idMarcaDisp = $("#"+idDataListMarca).find("option[value='"+$("#"+idMarca).val()+"']").data("id");
    let datalist = document.getElementById(idDataListModelo);
    $("#"+idDataListModelo).empty();
    optionModeloDispositivo.forEach(function(item){
      if(item.id==idMarcaDisp){
        let option = document.createElement("option");
        option.value = item.mo;
        datalist.appendChild(option);
      }
    });
  }
}

function enforcingValueDataList(){
  // Find all inputs on the DOM which are bound to a datalist via their list attribute.
  var inputs = document.querySelectorAll('input[list]');
  for (var i = 0; i < inputs.length; i++) {
    // When the value of the input changes...
    inputs[i].addEventListener('change', function() {
      var optionFound = false,
        datalist = this.list;
      // Determine whether an option exists with the current value of the input.
      for (var j = 0; j < datalist.options.length; j++) {
          if (this.value == datalist.options[j].value) {
              optionFound = true;
              break;
          }
      }
      // use the setCustomValidity function of the Validation API
      // to provide an user feedback if the value does not exist in the datalist
      if (!optionFound){
        this.value="";
      }
    });
  }
}

function listadoObjetivosDevice(idSelectClient,idSelectBranch,idDataList){

  let listadoObjetivos = [];
  let nombreCliente = $("#"+idSelectClient).val();

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        desplegableObjetivosBranch(listadoObjetivos,idSelectClient,idSelectBranch,idDataList);
      }else{
        querySnapshot.forEach(function(doc) {
          idClienteGlobal = doc.id;
            db.collection("clientes").doc(doc.id).collection("objetivos")
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                    listadoObjetivos.push(doc.data().nombreObjetivo);
              });
              desplegableObjetivosBranch(listadoObjetivos,idSelectClient,idSelectBranch,idDataList);
            });
        })
      }
    });
}
