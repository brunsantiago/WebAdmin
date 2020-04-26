import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { UserService } from '../../core/services/user.service';
// import { Router } from '@angular/router';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

//import * as $ from 'jquery';
declare var jQuery: any;
declare var $: any;
declare var eliminarContenidoTabla: any;
declare var listadoClientesCubrimiento: any;
declare var mostrarCubrimiento: any;
declare var cargarDateTimePicker9: any;
// declare var multiModal: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  constructor(){}

  ngOnInit() {

    listadoClientesCubrimiento();
    cargarDateTimePicker9();
    $('.box').boxWidget();

  }

}
