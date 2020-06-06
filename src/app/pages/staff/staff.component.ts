import { Component, OnInit } from '@angular/core';

declare var jQuery: any;
declare var $: any;
declare var listadoPersonal: any;
declare var checkCoordenadas: any;
declare var listadoSupervisores: any;
declare var listadoObjetivosPersonal: any;
declare var desplegableSexo: any;
declare var desplegableEstadoCivil: any;
declare var desplegableCategoria: any;

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {

  constructor() { }

  ngOnInit() {
   listadoPersonal();
   checkCoordenadas();
   listadoSupervisores();
   listadoObjetivosPersonal();
   desplegableSexo();
   desplegableEstadoCivil();
   desplegableCategoria();
  }

}
