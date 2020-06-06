var personalObject;
var idUser;
var optionSexo = [
  "MASCULINO",
  "FEMENINO"
];
var optionEstadoCivil = [
  "CASADO/A",
  "SOLTERO/A",
  "CONCUBINATO",
  "DIVORCIADO/A",
  "SEPARADO/A",
  "VIUDO/A",
];
var optionCategoria = [
  "VIGILADOR/A",
  "CUSTODIA",
  "ADMINISTRATIVO/A",
  "SUPERVISOR/A",
  "GERENTE/A",
  "OPERADOR/A",
  "TECNICO/A",
  "VENDEDOR/A",
  "VIGILADOR/A Y CUSTODIA",
]

function desplegableSexo(){

  var datalist = document.getElementById("dataListSexo");

  $("#dataListSexo").empty();

  optionSexo.forEach(function(item){
     var option = document.createElement("option");
     option.value = item;
     datalist.appendChild(option);
  });
}

function desplegableEstadoCivil(){

  var datalist = document.getElementById("dataListEstadoCivil");

  $("#dataListEstadoCivil").empty();

  optionEstadoCivil.forEach(function(item){
     var option = document.createElement("option");
     option.value = item;
     datalist.appendChild(option);
  });
}

function desplegableCategoria(){

  var datalist = document.getElementById("dataListCategoria");

  $("#dataListCategoria").empty();

  optionCategoria.forEach(function(item){
     var option = document.createElement("option");
     option.value = item;
     datalist.appendChild(option);
  });
}

function listadoPersonal(){
  let listadoPersonal = [];
  db.collection("users").orderBy("nombre")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        listadoPersonal.push(doc.data().nombre);
      });
      desplegablePersonal(listadoPersonal);
    });
}

function desplegablePersonal(listadoPersonal){

  var datalist = document.getElementById("dataListPersonal");

  $("#dataListPersonal").empty();

  listadoPersonal.forEach(function(nombre){
     var option = document.createElement("option");
     option.value = nombre;
     datalist.appendChild(option);
  });
}

function mostrarPersonal(){

  allFieldsDisablePersonal();

  personalObject="";
  idUser="";

  $("#tab-personal").hide(200);
  $("#btnGuardarPersonal").prop("disabled", true);
  $("#btnCancelarPersonal").prop("disabled", true);
  $("#btnModificarPersonal").prop("disabled", false);

  let nombre = $("#personal").val();

  db.collection("users").where("nombre","==",nombre)
  .get()
  .then(function(querySnapshot) {
    if (querySnapshot.empty){
      mensajeErrorCampoVacio("Persona no seleccionada o inexistente")
    } else {
      querySnapshot.forEach(function(doc){
        personalObject = doc.data();
        idUser = doc.id;
        cargarDatosBasicosPersonal(personalObject)
      });
    }
  }).
  catch(function(error){
    console.log("Error al buscar Cliente",error);
  });
}

function cargarDatosBasicosPersonal(doc){

  inicializarFormularioPersonal();

  let calle = "";
  let nroPuerta = "";
  let localidad = "";
  let departamento = "";
  let provincia = "";
  let pais = "";

  let fechaNac = new Cleave('.input-fechaNac', {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y']
  });

  let fechaIngreso = new Cleave('.input-fechaIngreso', {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y']
  });

  let fechaEgreso = new Cleave('.input-fechaEgreso', {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y']
  });

  let cuit = new Cleave('.input-cuit', {
      delimiter: '-',
      blocks: [2, 8, 1],
      uppercase: true,
      });

  let dni = new Cleave('.input-dni', {
    numeral: true,
    numeralDecimalMark: ',',
    delimiter: '.'
  });

  fechaNac.setRawValue(asignarValores(doc.fechaNac));
  fechaIngreso.setRawValue(asignarValores(doc.fechaIngreso));
  fechaEgreso.setRawValue(asignarValores(doc.fechaEgreso));
  cuit.setRawValue(asignarValores(doc.cuit));
  dni.setRawValue(asignarValores(doc.dni));

  $("#legajo").val(asignarValores(doc.idPersonal));
  $("#usuario").val(asignarValores(doc.idPersonal));
  $("#apellidoNombre").val(asignarValores(doc.nombre));
  $("#categoria").val(asignarValores(doc.categoria));
  $("#estadoCivil").val(asignarValores(doc.estadoCivil));
  $("#sexo").val(asignarValores(doc.sexo));
  $("#objetivo").val(asignarValores(doc.objetivo));
  devolverNombreUser(doc.idSupervisor);

  if(doc.domicilio!=undefined && doc.domicilio!=""){

    calle = asignarValores(doc.domicilio.calle);
    nroPuerta = asignarValores(doc.domicilio.nroPuerta);
    localidad = asignarValores(doc.domicilio.localidad);
    departamento = asignarValores(doc.domicilio.departamento);
    provincia = asignarValores(doc.domicilio.provincia);
    pais = asignarValores(doc.domicilio.pais);

    $("#pais").val(pais);
    $("#provincia").val(provincia);
    $("#departamento").val(departamento);
    $("#localidad").val(localidad);
    $("#calle").val(calle);
    $("#nroPuerta").val(nroPuerta);
    $("#piso").val(asignarValores(doc.domicilio.piso));
    $("#depto").val(asignarValores(doc.domicilio.depto));
    $("#cp").val(asignarValores(doc.domicilio.cp));

  }

  if(doc.vigente!=undefined && doc.vigente==true){
    cambiarEstadoActivo();
  }else{
    cambiarEstadoInactivo();
  }

  let mostrarUbicacion = asignarValores(doc.mostrarUbicacion);

  let lat = "";
  let lon = "";

  if(doc.coordenadas!=undefined && doc.coordenadas!=""){
    lat = asignarValores(doc.coordenadas.lat);
    lon = asignarValores(doc.coordenadas.lon);
  }

  $("#lat").val(lat);
  $("#lon").val(lon);

  if(mostrarUbicacion=="COORDENADAS"){
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    $("#checkCoordenadas").prop("checked", true);
  } else {
    $("#checkDomicilio").prop("checked", true);
    if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      provincia="CABA";
      departamento="";
    }
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+calle+nroPuerta+localidad+departamento+provincia+pais+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }

  if(doc.usuario!=undefined && doc.usuario!=""){
    $("#estadoUsuario").val("USUARIO CREADO");
    $("#estadoUsuario").css({'color':'green','font-weight':'bold','width':'160px'});
    $("#mostrarUsuario").hide();
    $("#datos-usuario").show();
    $("#clave").val(doc.usuario.clave);
    $("#clave").prop("readonly",true);
    $("#btnGenerarUsuario").hide();
    $("#cambiarClave").hide();
    $("#btnCambiarClave").show();
  } else {
    $("#estadoUsuario").val("USUARIO NO CREADO");
    $("#estadoUsuario").css({'color':'red','font-weight':'bold','width':'180px'});
    $("#mostrarUsuario").show();
    $("#datos-usuario").hide();
    $("#clave").val("");
    $("#clave").prop("readonly",false);
    $("#btnGenerarUsuario").show();
    $("#cambiarClave").hide();
    $("#btnCambiarClave").hide();
  }

  cargarDataListDomicilio();

  $("#tab-personal").show(200);

}

function inicializarFormularioPersonal(){

  $("#legajo").val("");
  $("#apellidoNombre").val("");
  $("#fechaNac").val("");
  $("#categoria").val("");
  $("#estadoCivil").val("");
  $("#sexo").val("");
  $("#dni").val("");
  $("#cuit").val("");
  $("#objetivo").val("");
  $("#supervisor").val("");
  $("#fechaIngreso").val("");
  $("#fechaEgreso").val("");
  $("#pais").val("ARGENTINA");
  $("#provincia").val("");
  $("#departamento").val("");
  $("#localidad").val("");
  $("#calle").val("");
  $("#nroPuerta").val("");
  $("#piso").val("");
  $("#depto").val("");
  $("#cp").val("");
  $("#lat").val("");
  $("#lon").val("");
  cambiarEstadoActivo();
  $("#checkCoordenadas").prop("checked", false);
  $("#checkDomicilio").prop("checked", true);
  $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&ie=UTF8&t=&z=14&iwloc=B&output=embed");

  $("#datos-usuario").hide();

}

function modificarDatosPersonal(){

  allFieldsEnablePersonal();

  $("#btnGuardarPersonal").prop("disabled", false);
  $("#btnCancelarPersonal").prop("disabled", false);
  $("#btnModificarPersonal").prop("disabled", true);

}

function allFieldsEnablePersonal(){

  // $("#legajo").prop("readonly",false);
  $("#apellidoNombre").prop("readonly",false);
  $("#fechaNac").prop("readonly",false);
  $("#categoria").prop("readonly",false);
  $("#estadoCivil").prop("readonly",false);
  $("#sexo").prop("readonly",false);
  $("#dni").prop("readonly",false);
  $("#cuit").prop("readonly",false);
  $("#objetivo").prop("readonly",false);
  $("#supervisor").prop("readonly",false);
  $("#fechaIngreso").prop("readonly",false);
  $("#fechaEgreso").prop("readonly",false);
  $("#pais").prop("readonly",false);
  $("#provincia").prop("readonly",false);
  $("#departamento").prop("readonly",false);
  $("#localidad").prop("readonly",false);
  $("#calle").prop("readonly",false);
  $("#nroPuerta").prop("readonly",false);
  $("#piso").prop("readonly",false);
  $("#depto").prop("readonly",false);
  $("#cp").prop("readonly",false);
  $("#lat").prop("readonly",false);
  $("#lon").prop("readonly",false);
  $("#estadoActivo").attr("disabled",false);
  $("#estadoInactivo").attr("disabled",false);
  $("#checkCoordenadas").prop("disabled", false);
  $("#checkDomicilio").prop("disabled", false);

}

function allFieldsDisablePersonal(){
  $("#legajo").prop("readonly",true);
  $("#apellidoNombre").prop("readonly",true);
  $("#fechaNac").prop("readonly",true);
  $("#categoria").prop("readonly",true);
  $("#estadoCivil").prop("readonly",true);
  $("#sexo").prop("readonly",true);
  $("#dni").prop("readonly",true);
  $("#cuit").prop("readonly",true);
  $("#objetivo").prop("readonly",true);
  $("#supervisor").prop("readonly",true);
  $("#fechaIngreso").prop("readonly",true);
  $("#fechaEgreso").prop("readonly",true);
  $("#pais").prop("readonly",true);
  $("#provincia").prop("readonly",true);
  $("#departamento").prop("readonly",true);
  $("#localidad").prop("readonly",true);
  $("#calle").prop("readonly",true);
  $("#nroPuerta").prop("readonly",true);
  $("#piso").prop("readonly",true);
  $("#depto").prop("readonly",true);
  $("#cp").prop("readonly",true);
  $("#lat").prop("readonly",true);
  $("#lon").prop("readonly",true);
  $("#estadoActivo").attr("disabled",true);
  $("#estadoInactivo").attr("disabled",true);
  $("#checkCoordenadas").prop("disabled", true);
  $("#checkDomicilio").prop("disabled", true);
}

function cancelarCambiosPersonal(){
  $("#tab-personal").hide(300);
}

function guardarCambiosPersonal(){

  if (verificarCamposPpalesPersonal()){

    allFieldsDisablePersonal();

    $("#btnGuardarPersonal").prop("disabled", true);
    $("#btnCancelarPersonal").prop("disabled", true);
    $("#btnModificarPersonal").prop("disabled", false);

    let idPersonal = $("#legajo").val().toUpperCase();
    let nombre = $("#apellidoNombre").val().toUpperCase();
    let fechaNac = $("#fechaNac").val().toUpperCase();
    let categoria = $("#categoria").val().toUpperCase();
    let estadoCivil = $("#estadoCivil").val().toUpperCase();
    let sexo = $("#sexo").val().toUpperCase();
    let dni = replaceAll($("#dni").val(), ".", "" );
    let cuit = $("#cuit").val().toUpperCase();
    let objetivo = $("#objetivo").val().toUpperCase();
    let fechaIngreso = $("#fechaIngreso").val().toUpperCase();
    let fechaEgreso = $("#fechaEgreso").val().toUpperCase();
    let idSupervisor = $("#dataListSuper").find("option[value='"+$("#supervisor").val()+"']").data("id");
    if(idSupervisor==undefined){ idSupervisor="";}

    let domicilio = {
      pais : $("#pais").val().toUpperCase(),
      provincia : $("#provincia").val().toUpperCase(),
      departamento : $("#departamento").val().toUpperCase(),
      localidad : $("#localidad").val().toUpperCase(),
      calle : $("#calle").val().toUpperCase(),
      nroPuerta : $("#nroPuerta").val().toUpperCase(),
      piso : $("#piso").val().toUpperCase(),
      depto : $("#depto").val().toUpperCase(),
      cp : $("#cp").val().toUpperCase(),
    }

    let coordenadas = {
        lat : $("#lat").val(),
        lon : $("#lon").val(),
      }

    let mostrarUbicacion="";

    if($("#checkCoordenadas").prop('checked')){
      mostrarUbicacion="COORDENADAS";
    } else {
      mostrarUbicacion="DOMICILIO";
    }

    let estado = "";

    if($("#estadoActivo").prop("enable")==true){
      estado = true;
    } else {
      estado = false;
    }

    personalObject = {
      idPersonal : idPersonal,
      nombre : nombre,
      fechaNac : fechaNac,
      categoria : categoria,
      estadoCivil : estadoCivil,
      sexo : sexo,
      dni : dni,
      cuit : cuit,
      objetivo : objetivo,
      idSupervisor : idSupervisor.toString(),
      fechaIngreso : fechaIngreso,
      fechaEgreso : fechaEgreso,
      vigente: estado,
      domicilio : domicilio,
      coordenadas : coordenadas,
      mostrarUbicacion : mostrarUbicacion,
    }


    if(idUser!=undefined && idUser!=""){
      db.collection("users").doc(idUser)
      .update(personalObject)
      .then(function(){
        mensajeOk();
      })
      .catch(function(error){
        console.log("Error al actualizar el Personal",error);
      });

    } else {
      // Debe recorrer todos los usuarios para verificar que no haya alguno ya cargado con los datos principales
      // Datos principales: dni - cuit
      db.collection("users")
      .get()
      .then(function(querySnapshot){
        let encontrado = false;
        querySnapshot.forEach(function(doc){
          let docDni = doc.data().dni;
          let docCuit = doc.data().cuit;
          if(docDni==dni){
            encontrado=true;
          } else if(docCuit==cuit){
            encontrado=true;
          }
        });
        if(encontrado){
          Swal.fire({
          title:'Esta seguro que desea agregar una persona ya cargada ?',
          text: '',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f56954',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Cargar Personal',
          cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {
              cargarPersonal(personalObject);
            }
          });
        } else {
          cargarPersonal(personalObject);
        }
      })
      .catch(function(error){
        console.log("Error al verificar el personal cargado",error);
      });
    }
  }

}

function verificarCamposPpalesPersonal(){

  if ( $("#legajo").val()=="" ){
    mensajeErrorCampoVacio("Legajo vacio");
    return false;
  } else if ( $("#apellidoNombre").val()=="" ){
    mensajeErrorCampoVacio("Apellido y nombre vacio");
    return false;
  } else if ( $("#fechaNac").val()=="" ){
    mensajeErrorCampoVacio("Fecha de nacimiento vacia");
    return false;
  } else if ( $("#sexo").val()=="" ){
    mensajeErrorCampoVacio("Sexo vacio");
    return false;
  } else if ( $("#dni").val()=="" ){
    mensajeErrorCampoVacio("DNI vacio");
    return false;
  } else if ( $("#cuit").val()=="" ){
    mensajeErrorCampoVacio("CUIT vacio");
    return false;
  } else if ( $("#fechaIngreso").val()=="" ){
    mensajeErrorCampoVacio("Fecha de ingreso vacia");
    return false;
  } else if ( $("#pais").val()=="" ){
    mensajeErrorCampoVacio("Pais vacio");
    return false;
  } else if ( $("#provincia").val()=="" ){
    mensajeErrorCampoVacio("Provincia vacia");
    return false;
  } else if ( $("#departamento").val()=="" ){
    mensajeErrorCampoVacio("Departamento vacio");
    return false;
  } else if ( $("#localidad").val()=="" ){
    mensajeErrorCampoVacio("Localidad vacia");
    return false;
  } else if ( $("#calle").val()=="" ){
    mensajeErrorCampoVacio("Calle vacia");
    return false;
  } else if ( $("#nroPuerta").val()=="" ){
    mensajeErrorCampoVacio("Nro de puerta vacia");
    return false;
  } else {
    return true;
  }

}

function cargarPersonal(personalObject){
  db.collection("users")
  .add(personalObject)
  .then(function(doc){
    idUser = doc.id;
    mensajeOk();
    listadoPersonal();
    cargarLastUserId();
  })
  .catch(function(error){
    console.log("Error al intentar cargar el personal nuevo",error);
  });
}

function agregarPersonal(){

  $("#tab-personal").hide(200);
  $("#btnGuardarPersonal").prop("disabled", false);
  $("#btnCancelarPersonal").prop("disabled", false);
  $("#btnModificarPersonal").prop("disabled", true);
  inicializarFormularioPersonal();
  allFieldsEnablePersonal();
  personalObject="";
  idUser="";
  cargarDataListDomicilio();

  db.collection("data").doc("usersData")
  .get()
  .then(function(doc) {
    $("#legajo").val(doc.data().lastUserId+1);
    $("#legajo").prop("readonly",true);
    $("#tab-personal").show(200);
  }).
  catch(function(error){
    console.log("No se pudo acceder a Users Data",error);
  });

  let fechaNac = new Cleave('.input-fechaNac', {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y']
  });

  let fechaIngreso = new Cleave('.input-fechaIngreso', {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y']
  });

  let fechaEgreso = new Cleave('.input-fechaEgreso', {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y']
  });

  let cuit = new Cleave('.input-cuit', {
      delimiter: '-',
      blocks: [2, 8, 1],
      uppercase: true,
      });

  let dni = new Cleave('.input-dni', {
    numeral: true,
    numeralDecimalMark: ',',
    delimiter: '.'
  });

}

function replaceAll( text, busca, reemplaza ){
  while (text.toString().indexOf(busca) != -1)
      text = text.toString().replace(busca,reemplaza);
  return text;
}

function listadoObjetivosPersonal(){

  let listadoObjetivos = [];
  let listPromises = [];

  db.collection("clientes").orderBy("nombreCliente")
    .get()
    .then(function(querySnapshot) {

      if(querySnapshot.empty){
        desplegableObjetivosPersonal(listadoObjetivos);
      }else{
        querySnapshot.forEach(function(doc) {
          listPromises.push( cargarObjetivosPersonal(doc.id,doc.data().nombreCliente,listadoObjetivos) );
        });
        Promise.all(listPromises)
        .then(function(result) {
          desplegableObjetivosPersonal(listadoObjetivos);
        })
        .catch(function(error) {
          console.log("Hubo algun error al intentar cargar los objetivos");
        });
      }

    });
}

function cargarObjetivosPersonal(idCliente,nombreCliente,listadoObjetivos){

  return new Promise(function(resolve,reject){

  db.collection("clientes").doc(idCliente).collection("objetivos").orderBy("nombreObjetivo")
  .get()
  .then(function(querySnapshot) {
    if(querySnapshot.empty){
      resolve();
    } else {
    querySnapshot.forEach(function(doc) {
        let item = {
          nc : nombreCliente,
          no : doc.data().nombreObjetivo,
        }
        listadoObjetivos.push(item);
    });
    resolve();
    }
  })
  .catch(function(error){
    console.log("Error al intentar obtener los objetivos",error);
    reject();
  });

  });

}

function desplegableObjetivosPersonal(listadoObjetivos){
  let datalist = document.getElementById("dataListObjetivo");
  $("#dataListObjetivo").empty();
  if(listadoObjetivos.length==0){
    $("#selectObjetivo").attr("placeholder", "Sin Objetivos");
  } else {
    $("#selectObjetivo").attr("placeholder", "Seleccione un objetivo");
    listadoObjetivos.forEach(function(item){
       let option = document.createElement("option");
       option.value = mayus(item.nc+" - "+item.no);
       datalist.appendChild(option);
    });
  }
}

function cargarLastUserId(){
  db.collection("data").doc("usersData")
  .update({
    lastUserId : parseInt( $("#legajo").val() )
  })
  .catch(function(error){
    console.log("No se pudo acceder a Users Data",error);
  });
}

function mostrarUsuario(){
  if(idUser==""){
    Swal.fire({
    title:'Primero debe cargar el Personal',
    text: '',
    icon: 'warning',
    confirmButtonText: 'Aceptar',
    });
  } else {
    $("#mostrarUsuario").hide();
    $("#datos-usuario").show(300);
  }
}

function generarUsuario(){
  let email = $("#usuario").val()+"@sab5.com.ar";
  let password = $("#clave").val();

  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(){
    cargarClave(password);
    $("#clave").prop("readonly",true);
    $("#btnGenerarUsuario").hide();
    $("#btnCambiarClave").show(300);
    $("#estadoUsuario").val("USUARIO CREADO");
    $("#estadoUsuario").css({'color':'green','font-weight':'bold','width':'160px'});
  })
  .catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error);
});
}

function cargarClave(clave){
  let usuario = {
    clave : clave,
  }
  db.collection("users").doc(idUser)
  .update({
    usuario : usuario,
  })
  .then(function(doc){
    mensajeOk();
  });
}

function cambiarClave(){
  $("#btnCambiarClave").hide();
  $("#btnGenerarUsuario").show(300);
  $("#clave").prop("readonly",false);
}

function btnCambiarClave(){
  let email = $("#usuario").val()+"@sab5.com.ar";
  let password = $("#clave").val();
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(){
    $("#btnCambiarClave").hide();
    $("#btnGenerarUsuario").hide();
    $("#cambiarClave").show(300);
    $("#clave").prop("readonly",false);
  })
  .catch(function(error) {
    console.log(error);
  });
}

function cambiarClave(){
  var user = firebase.auth().currentUser;
  var newPassword = $("#clave").val();
  user.updatePassword(newPassword)
  .then(function() {
    cargarClave(newPassword);
    $("#btnCambiarClave").show(300);
    $("#btnGenerarUsuario").hide();
    $("#cambiarClave").hide();
    $("#clave").prop("readonly",true);
  })
  .catch(function(error) {
    console.log(error);
  });
}
