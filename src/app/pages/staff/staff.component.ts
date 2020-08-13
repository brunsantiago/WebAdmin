import { Component, OnInit } from '@angular/core';

declare var jQuery: any;
declare var $: any;
declare var inicializarFuncionesStaff: any;

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    inicializarFuncionesStaff();
  }

}
