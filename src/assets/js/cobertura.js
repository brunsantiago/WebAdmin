
function cargarCobertura(idCliente,idObjetivo,fechaInicial,fechaFinal){
  let cantidadColumnasFijas=4;
  let cantidadDias=cantidadDeDias(fechaInicial,fechaFinal);
  let tamanioTabla=cantidadDias+cantidadColumnasFijas;
  let horasCobertura = "";
  let diaSemana = "";
  let fechaIni = new Date(fechaInicial.getTime());
  for (i = 1; i < cantidadDias+1; i++) {
    let fecha = "";
      if (i < 10) {
        fecha = "0"+i;
      } else fecha=i;
    actualizarDiaSemana(fechaIni); // Carga dias de la semana
    fechaIni.setDate(fechaIni.getDate()+1);
  }
  recorrerEsquema(idCliente,idObjetivo,fechaInicial,fechaFinal);
}

function recorrerEsquema(idCliente,idObjetivo,fechaD,fechaH){

let promise = new Promise(function(resolve, reject) {

  let fechaDesde=fechaD.getTime();
  let fechaHasta=fechaH.getTime();
  let refCubrimiento = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo)
                         .collection("cubrimiento");
  refCubrimiento.get()
  .then(function(querySnapshot) {
      const listPromises = []; //Lista de Promesas
      querySnapshot.forEach(function(doc){
        //Lectura de las fechas Desde y Hasta de cada esquema
        let fechaDesdeEsquema = doc.data().fechaDesdeTime.toDate().getTime();
        let fechaHastaEsquema;
        //Verifico que fechaHastaEsquema este definida
        if(doc.data().fechaHastaTime!==undefined){
          fechaHastaEsquema = doc.data().fechaHastaTime.toDate().getTime();
        } else {
          fechaHastaEsquema = doc.data().fechaHastaTime; // Verificar en caso de ser indefinida que pasaria
        }
        //Si el ESQUEMA tiene la fecha HASTA dentro del rango Solicitado entonces lo procesa
        if(fechaHastaEsquema>fechaDesde && fechaHastaEsquema<fechaHasta){
          listPromises.push(cargarHorasFacturacion(idCliente,idObjetivo,doc.id,fechaD,fechaH,doc.data().fechaDesdeTime,doc.data().fechaHastaTime));
        }
        //Si el ESQUEMA tiene la fecha DESDE dentro del rango Solicitado entonces lo procesa
        else if(fechaDesdeEsquema>fechaDesde && fechaDesdeEsquema<fechaHasta){
          listPromises.push(cargarHorasFacturacion(idCliente,idObjetivo,doc.id,fechaD,fechaH,doc.data().fechaDesdeTime,doc.data().fechaHastaTime));
        }
        //Si el ESQUEMA tiene la fecha DESDE y HASTA que incluye al periodo solicitado lo procesa
        if(fechaDesdeEsquema<=fechaDesde && (fechaHastaEsquema>=fechaHasta || fechaHastaEsquema==undefined)){
          listPromises.push(cargarHorasFacturacion(idCliente,idObjetivo,doc.id,fechaD,fechaH,doc.data().fechaDesdeTime,doc.data().fechaHastaTime));
        }
      });
      Promise.all(listPromises)
      .then(value => resolve()) //Si se ejecuto correctamente la lista de promesas
      .catch(error => reject(Error("Se ha producido un error al ejecutar todas las Promesas cargarHorasFacturacion")));
  })
  .catch(function(error) {
      console.log("Error getting documents: ", error);
      reject();
  });

}); // End promise

promise.then(function(result){
  //Si se cumple con la carga de horas de facturacion de todos los esquemas que estan dentro del rango
  //se procede a cargar las horas temporales y luego se calcula las diferencias entre lo cubierto y lo
  //que se deberia haber cubierto
  //console.log("Se cargaron todas las horas de Facturacion de los esquemas dentro del rango requerido");
  cargarHorasTemporales(idCliente,idObjetivo,fechaD,fechaH)
  .then(function(response) {
    //console.log("Cargando diferencia de horas...");
    cargarDiferencias(fechaD,fechaH);
  }, function(error) {
    console.error("No se pudieron cargar las horas temporales", error);
  });
}, function(err) {
  console.log("No se cargaron todas las horas de Facturacion de los esquemas dentro del rango requerido"); // Error:
});

}

function cargarHorasFacturacion(idCliente,idObjetivo,docId,fechaDesdeSol,fechaHastaSol,fechaDesde,fechaHasta){

  return new Promise(function(resolve, reject) {

  let totalDias=[]; //Array con cantidad de horas semanales para un esquema
  let refEsquema = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo)
                     .collection("cubrimiento").doc(docId).collection("esquema");
  refEsquema.get()
  .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          let i = doc.data().documentData.numeroDia;
          totalDias[i]=doc.data().documentData.totalHoras;
      });
      cargarFacturacion(totalDias,fechaDesdeSol,fechaHastaSol,fechaDesde,fechaHasta);
      resolve();
  })
  .catch(function(error) {
      console.log("Error getting documents: ", error);
      reject();
  });

}); //End Promise
}

function diaDeSemana(fecha){
    let dias=["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    //var dt = new Date(mes+'/'+dia+'/'+anio);
    return dias[fecha.getUTCDay()];
}

function cargarFacturacion(totalDias,fechaDesdeSol,fechaHastaSol,fechaDesdeEsq,fechaHastaEsq){
  let fechaDS = fechaDesdeSol.getTime();
  let fechaHS = fechaHastaSol.getTime();
  // var fechaDE = new Date(fechaDesdeEsq).getTime();
  // var fechaHE = new Date(fechaHastaEsq).getTime();
  let fechaDE = fechaDesdeEsq.toDate().getTime();
  let fechaHE = fechaHastaEsq.toDate().getTime();
  let fechaDesde,fechaHasta;
  //Si la fecha Desde de la Solicitud es mas chica que la fecha Hasta entonces entra
  if(fechaDS<fechaHS){
    if(fechaDS<fechaDE){
      //fechaDesde = new Date(fechaDesdeEsq+"T00:00:00");
      fechaDesde = fechaDesdeEsq.toDate();
    } else if (fechaDS>=fechaDE){
      fechaDesde = fechaDesdeSol
    }
    if(fechaHS>fechaHE){
      fechaHasta = fechaHastaEsq.toDate();
    } else if (fechaHS<=fechaHE){
      fechaHasta = fechaHastaSol;
    }
  }
  let cantidadColumnasFijas=4;
  let cantidadDias=cantidadDeDias(fechaDesde,fechaHasta);
  let fechaIni = new Date(fechaDesde.getTime()); // Se reinicia la fecha a la inicial
  for (var j = 0; j < cantidadDias; j++) {
    //var fecha = new Date(mes+'/'+i+'/'+anio);
    let totalHoras = totalDias[fechaIni.getUTCDay()];
    if(totalHoras!==undefined){
      //document.querySelector(".fdia"+fechaIni.getDate()).textContent = totalHoras+":00";
      document.querySelector(".fdia"+fechaIni.getDate()).textContent = totalHoras;
      //Actualiza el Total de Totales a Facturar
      totales = document.querySelector(".ftotalHs").textContent;
      //document.querySelector(".ftotalHs").textContent = sumarHoras(totales,totalHoras+":00");
      document.querySelector(".ftotalHs").textContent = sumarHoras(totales,totalHoras);
    }
    fechaIni.setDate(fechaIni.getDate()+1);
  }
}

function totalHoras(ingresoParam2,egresoParam2){
  difMili = egresoParam2.getTime()-ingresoParam2.getTime();
  let horas = Math.floor(difMili/1000/60/60);
  let minutos = Math.floor(difMili/1000/60);
  minutos = minutos - horas*60;
  // if (horas<10){horas="0"+horas;}
  if (minutos<10){minutos="0"+minutos;}
  return horas+":"+minutos;
}

function actualizarTotales(dia,horas,nroLegajo){
  let totalColumna;
  let totalFila;
  //console.log("Dia: "+dia+"Horas: "+horas+"nroLegajo: "+nroLegajo);
  //Actualiza el total de la columna
  totalColumna = document.querySelector(".ldia"+dia).textContent;
  //console.log("totalColumna: "+totalColumna);
  document.querySelector(".ldia"+dia).textContent = sumarHoras(totalColumna,horas);
  //Actualiza el total del Legajo
  totalFila = document.querySelector(".ltotalHs"+nroLegajo).textContent;
  //console.log("totalFila: "+totalFila);
  document.querySelector(".ltotalHs"+nroLegajo).textContent = sumarHoras(totalFila,horas);
  //Actualiza el Total de Totales
  totales = document.querySelector(".ltotalHs").textContent;
  //console.log("totales: "+totales);
  document.querySelector(".ltotalHs").textContent = sumarHoras(totales,horas);
}

function sumarHoras(horaInicial,horaASumar){
  if(horaInicial.length == 0){
    horaInicial = "00:00";
  }
  if(horaASumar.length == 0){
    horaASumar = "00:00";
  }
  let totalHoras,totalMinutos;
  let sepHrIni = horaInicial.indexOf(":");
  let sepHrSum = horaASumar.indexOf(":");
  let inicioHoras = parseInt(horaInicial.substr(0,sepHrIni));
  let inicioMinutos = parseInt(horaInicial.substr(sepHrIni+1,2));
  let finHoras = parseInt(horaASumar.substr(0,sepHrSum));
  let finMinutos = parseInt(horaASumar.substr(sepHrSum+1,2));
  //Si las dos horas son negativas ingresa al If
  if (horaInicial.charAt(0)=="-" && horaASumar.charAt(0)=="-"){
    totalHoras = inicioHoras + finHoras;
    totalMinutos = finMinutos + inicioMinutos;
    if (totalMinutos >= 60) {
       totalHoras--;
       totalMinutos = totalMinutos - 60;
     }
  // Si alguna de las dos horas es negativa ingresa al If
  } else if (horaInicial.charAt(0)=="-" || horaASumar.charAt(0)=="-"){
    totalHoras = inicioHoras + finHoras;
    if (horaInicial.charAt(0)=="-"){
      inicioMinutos = inicioMinutos * -1;
    } else {
      finMinutos = finMinutos * -1;
    }
    totalMinutos = finMinutos + inicioMinutos;
    if (totalHoras<0 && totalMinutos<0){
      totalMinutos = totalMinutos * -1;
    } else if (totalHoras<0 && totalMinutos>0){
      totalHoras ++;
      totalMinutos = 60 - totalMinutos;
    } else if (totalHoras>0 && totalMinutos<0){
      totalHoras --;
      totalMinutos = 60 + totalMinutos;
    } else if (totalHoras==0 && totalMinutos<0){
        totalMinutos = totalMinutos * -1;
        totalHoras="-"+totalHoras;
    } // Si totalHoras y totalMinutos es positivo entonces no hago ningun cambio
  } else {
    totalHoras = inicioHoras + finHoras;
    totalMinutos = finMinutos + inicioMinutos;
    if (totalMinutos >= 60) {
       totalHoras++;
       totalMinutos = totalMinutos - 60;
     }
  }
    let horas = totalHoras.toString();
    let minutos = totalMinutos.toString();
    if (minutos.length < 2) {
      minutos = "0"+minutos;
    }
  return horas+":"+minutos;
}

function actualizarTotalesFacturar(dia,horas){
    document.querySelector(".fdia"+dia).textContent = horas;
}

function actualizarDiaSemana(diaFecha){
    let diaNumero = diaFecha.getDate();
    let diaSemanal = diaDeSemana(diaFecha).substr(0,2);
    document.querySelector(".sdia"+diaNumero).textContent = diaSemanal;
}

function totalHorasFacturar(horaIngreso,horaEgreso){
    let inicio = horaIngreso;
    let fin = horaEgreso;
    let inicioHoras = parseInt(inicio.substr(0,2));
    let inicioMinutos = parseInt(inicio.substr(3,2));
    let finHoras = parseInt(fin.substr(0,2));
    let finMinutos = parseInt(fin.substr(3,2));
    let transcurridoHoras = 0;
    let transcurridoMinutos = finMinutos - inicioMinutos;
    if (finHoras < inicioHoras){
      transcurridoHoras = 24 - inicioHoras + finHoras;
    } else transcurridoHoras = finHoras - inicioHoras;
    if (transcurridoMinutos < 0) {
       transcurridoHoras--;
       transcurridoMinutos = 60 + transcurridoMinutos;
     }
    let horas = transcurridoHoras.toString();
    let minutos = transcurridoMinutos.toString();
      if (horas.length < 2) {
        horas = "0"+horas;
      }
      if (minutos.length < 2) {
        minutos = "0"+minutos;
      }
    return horas+":"+minutos;
  }

function ingresoParametrizado(ingresoPuesto,ingresoReal){
    let ingresoParam="";
    if (ingresoPuesto.getTime() == ingresoReal.getTime()){
      ingresoParam = ingresoPuesto;
    } else if(ingresoPuesto > ingresoReal){
      ingresoParam = ingresoPuesto;
    } else if(ingresoPuesto < ingresoReal){
      let minutes = ingresoReal.getMinutes();
      if(minutes<10){minutes="0"+minutes;}
      let hour = ingresoReal.getHours();
      if(hour<10){hour="0"+hour;}
      let horaStr = cuartoPosterior(hour+":"+minutes);
      //console.log("getMinutes String: "+horaStr);
      let dia = ingresoReal.getDate();
      if (dia<10){dia="0"+dia;}
      let mes = ingresoReal.getMonth()+1;
      if (mes<10){mes="0"+mes;}
      let fechaStr = ingresoReal.getFullYear()+"-"+mes+"-"+dia;
      ingresoParam = new Date( Date.parse(fechaStr+"T"+horaStr+":00") );
    }
    return ingresoParam;
  }

function egresoParametrizado(egresoPuesto,egresoReal){
    let egresoParam="";
    if (egresoPuesto.getTime() == egresoReal.getTime()){
      egresoParam = egresoPuesto;
    } else if(egresoPuesto < egresoReal){
      egresoParam = egresoPuesto;
    } else if(egresoPuesto > egresoReal){
      let minutes = egresoReal.getMinutes();
      if(minutes<10){minutes="0"+minutes;}
      let hour = egresoReal.getHours();
      if(hour<10){hour="0"+hour;}
      let horaStr = cuartoPosterior(hour+":"+minutes);
      //console.log("String: "+horaStr);
      let dia = egresoReal.getDate();
      if (dia<10){dia="0"+dia;}
      let mes = egresoReal.getMonth()+1;
      if (mes<10){mes="0"+mes;}
      let fechaStr = egresoReal.getFullYear()+"-"+mes+"-"+dia;
      egresoParam = new Date( Date.parse(fechaStr+"T"+horaStr+":00") );
    }
    return egresoParam;
  }

function cuartoPosterior(hora){
    let horaParametrizada="";
    let minutosParametrizados="";
    let minutosReales=extraerMinutosReales(hora);
        if (minutosReales==0){
          minutosParametrizados = 0;
        } else if (minutosReales>0 && minutosReales<=15){
          minutosParametrizados = 15;
        } else if (minutosReales>15 && minutosReales<=30){
          minutosParametrizados = 30;
        } else if (minutosReales>30 && minutosReales<=45){
          minutosParametrizados = 45;
        } else if (minutosReales>45 && minutosReales<60){
          minutosParametrizados = 60;
        }
        horaParametrizada=componerHora(hora,minutosParametrizados);
    return horaParametrizada;
}

function extraerMinutos(hora){
    let separadorHora = hora.indexOf(":");
    let horas = parseInt(hora.substr(0,separadorHora));
    let minutos = parseInt(hora.substr(separadorHora+1,2));
    if(hora>0){
      //console.log("Ingreso mayor a una hora");
      return 60;
    } else {
      return minutos;
    }
}

function extraerMinutosReales(hora){
    let sepHr = hora.indexOf(":");
    //var horas = parseInt(hora.substr(0,sepHr));
    let minutos = parseInt(hora.substr(sepHr+1,2));
    //if(minutos<10){minutos="0"+minutos;}
    return minutos;
}

function componerHora(hora,minutosParametrizados){
    let horaParametrizada="";
    let sepHr = hora.indexOf(":");
    let horas = parseInt(hora.substr(0,sepHr));
    //var minutos = parseInt(hora.substr(sepHr+1,2));
    if(minutosParametrizados<60){
      if(horas<10){
        horas = "0"+horas;
      }
      if(minutosParametrizados<10){
        minutosParametrizados = "0"+minutosParametrizados;
      }
      horaParametrizada = horas+":"+minutosParametrizados;
    } else {
      horas = horas + 1;
      if(horas<10){
        horas = "0"+horas;
      }
      horaParametrizada=horas+":00";
    }
    return horaParametrizada;
}

function componerHorasDate(date){
    let hora = date.getHours();
    let minutos = date.getMinutes();
    if(hora<10){
      hora ="0"+hora;
    }
    if(minutos<10){
      minutos="0"+minutos;
    }
    return hora+":"+minutos;
  }

function sumarUnaHora(hora){
    return sumarHoras(hora,"01:00");
}

function sumarMediaHora(hora){
    return sumarHoras(hora,"00:30");
}

function compararHoras(horaPuesto,horaReal){
    if (horaPuesto>horaReal){
      return -1;
    }
    else if (horaPuesto<horaReal){
      return 1;
    } else {
      return 0;
    }
}

function cargarDiferencias(fechaInicial,fechaFinal){

    let cantidadColumnasFijas=4;
    let cantidadDias=cantidadDeDias(fechaInicial,fechaFinal);
    let horasCobertura = "";
    let diaSemana = "";
    let fechaIni = new Date(fechaInicial.getTime());
    let sumatoria="0:00";
    for (i = 0; i < cantidadDias; i++) {
      sumatoria = sumarHoras(sumatoria,actualizarDiferencia(fechaIni));
      fechaIni.setDate(fechaIni.getDate()+1);
    }
    if(sumatoria.startsWith("-")){
      document.querySelector(".dtotalHs").style.color = "#a94442";
      document.querySelector(".dtotalHs").textContent = sumatoria;
    } else {
      document.querySelector(".dtotalHs").textContent = sumatoria;
    }
}

function actualizarDiferencia(diaFecha){
    let diaNumero = diaFecha.getDate();
    let diferencia = restarHorasLiquidacion(diaNumero);
    if(diferencia.startsWith("-")){
      document.querySelector(".ddia"+diaNumero).style.color = "#a94442";
      document.querySelector(".ddia"+diaNumero).textContent = diferencia;
    } else {
      document.querySelector(".ddia"+diaNumero).textContent = diferencia;
    }
    return diferencia;
}

//funcion en deshuso, chequear utilizacion
function restarHoras(diaNumero){
    let horasLiquidar = document.querySelector(".ldia"+diaNumero).textContent;
    console.log("Horas a Liquidar: "+horasLiquidar);
    let horasFacturar = document.querySelector(".fdia"+diaNumero).textContent;
    console.log("Horas a Facturar: "+horasFacturar);
    let hora1 = (horasLiquidar+":00").split(":"),
        hora2 = (horasFacturar+":00").split(":"),
        t1 = new Date(), //Hora a Facturar
        t2 = new Date(), //Hora a Liquidar
        signo = "";
    t2.setHours(hora1[0], hora1[1], hora1[2]);
    t1.setHours(hora2[0], hora2[1], hora2[2]);
    console.log("Horas a Facturar: "+hora2);
    console.log("Horas a Liquidar: "+hora1);
    //Si la hora de Liquidacion es menor a la de facturacion continuar
    //console.log("t1.getTime: Facturacion "+t1.getTime());
    //console.log("t2.getTime: Liquidacion "+t2.getTime());
    if(t1.getTime()>=t2.getTime()){
      console.log("Horas Facturadas: "+t1.getHours()+"Minutos: "+t1.getMinutes());
      console.log("Horas Liquidadas: "+t2.getHours()+"Minutos: "+t2.getMinutes());
      t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
      signo="";
    //Si la hora de Liquidacion son mayor a la de facturacion continuar
    } else if(t1.getTime()<t2.getTime()){
      t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes(), t2.getSeconds() - t1.getSeconds());
      signo="-";
    }
    let hora = t1.getHours();
    let minutos = t1.getMinutes();
    if(minutos<10){
      minutos = minutos+"0";
    }
    console.log("Resultado: "+signo+hora+":"+minutos);
    return signo+hora+":"+minutos;
}

function restarHorasLiquidacion(diaNumero){

  let horaARestar = document.querySelector(".ldia"+diaNumero).textContent;
  let horaInicial = document.querySelector(".fdia"+diaNumero).textContent;

  if(horaInicial.length == 0){
    horaInicial = "00:00";
  }
  if(horaARestar.length == 0){
    horaARestar = "00:00";
  }
  let totalHoras,totalMinutos;
  let sepHrIni = horaInicial.indexOf(":");
  let sepHrRes = horaARestar.indexOf(":");
  let inicioHoras = parseInt(horaInicial.substr(0,sepHrIni));
  let inicioMinutos = parseInt(horaInicial.substr(sepHrIni+1,2));
  let finHoras = parseInt(horaARestar.substr(0,sepHrRes));
  let finMinutos = parseInt(horaARestar.substr(sepHrRes+1,2));

  totalHoras = inicioHoras - finHoras;
  totalMinutos = inicioMinutos - finMinutos;
  if (totalMinutos < 0) {
     totalHoras--;
     totalMinutos = 60 + totalMinutos;
   }

  let horas = totalHoras.toString();
  let minutos = totalMinutos.toString();
  if (minutos.length < 2) {
    minutos = "0"+minutos;
  }
  return horas+":"+minutos;
}

function cargarHorasTemporales(idCliente,idObjetivo,fechaDesdeSol,fechaHastaSol){

  return new Promise(function(resolve, reject) {

      let refTemporal = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo)
                        .collection("temporales").where("documentData.fecha",">=",fechaDesdeSol).where("documentData.fecha","<=",fechaHastaSol)

      refTemporal.get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              let fecha = doc.data().documentData.fecha.toDate();
              let dia = fecha.getDate();
              let horas = doc.data().documentData.totalHoras;
              if(horas!==undefined){
                horasEsq = document.querySelector(".fdia"+dia).textContent;
                document.querySelector(".fdia"+dia).textContent = sumarHoras(horasEsq,horas+":00"); // MODIFICAR VER MINUTOS
                //Actualiza el Total de Totales a Facturar
                totales = document.querySelector(".ftotalHs").textContent;
                document.querySelector(".ftotalHs").textContent = sumarHoras(totales,horas+":00"); // MODIFICAR VER MINUTOS
              }
          });
          resolve();
      })
      .catch(function(error) {
          reject(Error("No se pudieron cargar las horas temporales"));
      });
    });

}
