import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';

import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';

import {FormControl, FormGroup} from '@angular/forms';

//import * as $ from 'jquery';
declare var jQuery: any;
declare var $: any;
declare var cargaInicial: any;
declare var cargarCobertura: any;
declare var genera_tabla: any;
declare var extraerRango: any;
declare var eliminarContenidoTabla: any;
declare var cargarListadoClientes: any;
declare var cargarDesplegableCliente: any;
declare var cargarListadoObjetivos: any;
declare var mostrarCubrimiento: any;
declare var cargarDiferencias: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  public title = 'SAB-5 ADMIN - HOME AREA';
  public identity = true;
  public token;
  public errorMessage;
  public alertRegister;
  public form;
  public plantilla;
  public cliente;
  public objetivo;
  public visual;
  public date;

  bsValue: Date = new Date();
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  locale = 'es';

  constructor(
    private _userService: UserService,
    private router: Router)
  {}

  logout(){
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    localStorage.clear();
    this.identity = null;
    this.token = null;
    // Navigate to Login
    this.router.navigate(['login']);
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.bsConfig = Object.assign({}, {
      minMode : this.minMode
    });

    this.form = new FormGroup({
      visual: new FormControl('dias25'),
      cliente: new FormControl(),
      objetivo: new FormControl(),
      date: new FormControl(''),
      range: new FormControl('')
    });
    cargarListadoClientes();
    $('.box').boxWidget();

  }

  onSubmit(){
    // let cliente = this.form.get('cliente').value;
    // let objetivo = this.form.get('objetivo').value;
    this.cliente = this.form.get('cliente').value;
    this.objetivo = this.form.get('objetivo').value;
    this.visual = this.form.get('visual').value;
    this.date = this.form.get('date').value;
    let range = this.form.get('range').value;
    //this.cliente=cliente;
    //this.objetivo=objetivo;
    eliminarContenidoTabla();
    if(this.visual == "mensual" || this.visual == "dias25"){
      //devolverIdCliente(this.cliente);
      //mostrarCubrimiento(this.cliente,this.objetivo,this.visual,this.date,range);
      mostrarCubrimiento(this.visual,this.date,range);
    }
  }

}
